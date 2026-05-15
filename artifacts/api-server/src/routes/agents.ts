import { Router, type IRouter } from "express";
import { db, usersTable, bookingsTable, flightGroupsTable, packagesTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { GetAgentBookingsParams, GetAgentStatsParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    agencyName: u.agencyName ?? null,
    phone: u.phone ?? null,
    balance: u.balance ? Number(u.balance) : null,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/agents", async (_req, res): Promise<void> => {
  const agents = await db.select().from(usersTable).where(eq(usersTable.role, "agent"));
  res.json(agents.map(formatUser));
});

router.get("/agents/:id/bookings", async (req, res): Promise<void> => {
  const params = GetAgentBookingsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bookings = await db.select().from(bookingsTable).where(
    or(eq(bookingsTable.agentId, params.data.id), eq(bookingsTable.userId, params.data.id))
  );

  const formatted = await Promise.all(bookings.map(async b => {
    let flightGroup = null;
    let pkg = null;

    if (b.flightGroupId) {
      const [fg] = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.id, b.flightGroupId));
      if (fg) {
        flightGroup = {
          id: fg.id, flightNumber: fg.flightNumber, airline: fg.airline, airlineCode: fg.airlineCode,
          origin: fg.origin, originCode: fg.originCode, destination: fg.destination, destinationCode: fg.destinationCode,
          departureDate: fg.departureDate, departureTime: fg.departureTime, arrivalTime: fg.arrivalTime,
          duration: fg.duration, seats: fg.seats, seatsAvailable: fg.seatsAvailable, price: Number(fg.price),
          type: fg.type, pnr: fg.pnr, class: fg.class, baggage: fg.baggage ?? null,
          meal: fg.meal ?? null, refundable: fg.refundable ?? null, stops: fg.stops ?? null, aircraft: fg.aircraft ?? null,
        };
      }
    }
    if (b.packageId) {
      const [p] = await db.select().from(packagesTable).where(eq(packagesTable.id, b.packageId));
      if (p) {
        pkg = {
          id: p.id, name: p.name, duration: p.duration, type: p.type, price: Number(p.price),
          hotel: p.hotel, hotelRating: p.hotelRating ?? null, airline: p.airline,
          departureDate: p.departureDate, returnDate: p.returnDate, seatsAvailable: p.seatsAvailable,
          description: p.description, inclusions: Array.isArray(p.inclusions) ? p.inclusions : [],
          makkahNights: p.makkahNights ?? null, madinahNights: p.madinahNights ?? null, imageUrl: p.imageUrl ?? null,
        };
      }
    }

    return {
      id: b.id, bookingRef: b.bookingRef, status: b.status, totalAmount: Number(b.totalAmount),
      holdExpiresAt: b.holdExpiresAt ? b.holdExpiresAt.toISOString() : null,
      createdAt: b.createdAt.toISOString(), flightGroup, package: pkg,
      passengersInfo: Array.isArray(b.passengersInfo) ? b.passengersInfo : [],
      contactEmail: b.contactEmail, contactPhone: b.contactPhone,
      agentId: b.agentId ?? null, agentName: null, notes: b.notes ?? null, paymentMethod: b.paymentMethod,
    };
  }));

  res.json(formatted);
});

router.get("/agents/:id/stats", async (req, res): Promise<void> => {
  const params = GetAgentStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.agentId, params.data.id));
  const [agent] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));

  res.json({
    agentId: params.data.id,
    agentName: agent?.name ?? "Unknown",
    totalBookings: bookings.length,
    totalRevenue: bookings.filter(b => b.status === "confirmed").reduce((sum, b) => sum + Number(b.totalAmount), 0),
    confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
    onHoldBookings: bookings.filter(b => b.status === "on_hold").length,
    cancelledBookings: bookings.filter(b => b.status === "cancelled").length,
  });
});

export default router;
