import { Router, type IRouter } from "express";
import { db, bookingsTable, usersTable, flightGroupsTable, packagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const bookings = await db.select().from(bookingsTable);
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const onHoldBookings = bookings.filter(b => b.status === "on_hold").length;
  const cancelledBookings = bookings.filter(b => b.status === "cancelled").length;
  const totalRevenue = bookings
    .filter(b => b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);
  let totalPassengers = 0;
  for (const b of bookings) {
    const passengers = Array.isArray(b.passengersInfo) ? b.passengersInfo : [];
    totalPassengers += passengers.length;
  }
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = bookings
    .filter(b => b.status === "confirmed" && b.createdAt >= monthStart)
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);
  const pendingAmount = bookings
    .filter(b => b.status === "on_hold")
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);

  res.json({ totalBookings, confirmedBookings, onHoldBookings, cancelledBookings, totalRevenue, totalPassengers, monthlyRevenue, pendingAmount });
});

router.get("/dashboard/recent-bookings", async (_req, res): Promise<void> => {
  const bookings = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt).limit(10);

  const formatted = await Promise.all(bookings.map(async b => {
    let flightGroup = null;
    let pkg = null;
    let agentName = null;

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
    if (b.agentId) {
      const [agent] = await db.select().from(usersTable).where(eq(usersTable.id, b.agentId));
      if (agent) agentName = agent.name;
    }

    return {
      id: b.id, bookingRef: b.bookingRef, status: b.status, totalAmount: Number(b.totalAmount),
      holdExpiresAt: b.holdExpiresAt ? b.holdExpiresAt.toISOString() : null,
      createdAt: b.createdAt.toISOString(), flightGroup, package: pkg,
      passengersInfo: Array.isArray(b.passengersInfo) ? b.passengersInfo : [],
      contactEmail: b.contactEmail, contactPhone: b.contactPhone,
      agentId: b.agentId ?? null, agentName, notes: b.notes ?? null, paymentMethod: b.paymentMethod,
    };
  }));

  res.json(formatted);
});

export default router;
