import { Router, type IRouter, type Request } from "express";
import { db, bookingsTable, flightGroupsTable, packagesTable, usersTable, ledgerTable, bankAccountsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

function decodeToken(req: Request): { userId: number; role: string } | null {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    if (!token) return null;
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    if (payload && payload.userId && payload.role) return payload;
    return null;
  } catch { return null; }
}
import {
  CreateBookingBody,
  GetBookingParams,
  UpdateBookingParams,
  UpdateBookingBody,
  HoldBookingParams,
  ConfirmBookingParams,
  CancelBookingParams,
  ListBookingsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateBookingRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "TRV";
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

async function formatBooking(b: typeof bookingsTable.$inferSelect) {
  let flightGroup = null;
  let pkg = null;
  let agentName = null;

  if (b.flightGroupId) {
    const [fg] = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.id, b.flightGroupId));
    if (fg) {
      flightGroup = {
        id: fg.id,
        flightNumber: fg.flightNumber,
        airline: fg.airline,
        airlineCode: fg.airlineCode,
        origin: fg.origin,
        originCode: fg.originCode,
        destination: fg.destination,
        destinationCode: fg.destinationCode,
        departureDate: fg.departureDate,
        departureTime: fg.departureTime,
        arrivalTime: fg.arrivalTime,
        duration: fg.duration,
        seats: fg.seats,
        seatsAvailable: fg.seatsAvailable,
        price: Number(fg.price),
        type: fg.type,
        pnr: fg.pnr,
        class: fg.class,
        baggage: fg.baggage ?? null,
        meal: fg.meal ?? null,
        refundable: fg.refundable ?? null,
        stops: fg.stops ?? null,
        aircraft: fg.aircraft ?? null,
      };
    }
  }

  if (b.packageId) {
    const [p] = await db.select().from(packagesTable).where(eq(packagesTable.id, b.packageId));
    if (p) {
      pkg = {
        id: p.id,
        name: p.name,
        duration: p.duration,
        type: p.type,
        price: Number(p.price),
        hotel: p.hotel,
        hotelRating: p.hotelRating ?? null,
        airline: p.airline,
        departureDate: p.departureDate,
        returnDate: p.returnDate,
        seatsAvailable: p.seatsAvailable,
        description: p.description,
        inclusions: Array.isArray(p.inclusions) ? p.inclusions : [],
        makkahNights: p.makkahNights ?? null,
        madinahNights: p.madinahNights ?? null,
        makkahHotel: p.makkahHotel ?? null,
        madinahHotel: p.madinahHotel ?? null,
        imageUrl: p.imageUrl ?? null,
      };
    }
  }

  if (b.agentId) {
    const [agent] = await db.select().from(usersTable).where(eq(usersTable.id, b.agentId));
    if (agent) agentName = agent.name;
  }

  return {
    id: b.id,
    bookingRef: b.bookingRef,
    status: b.status,
    totalAmount: Number(b.totalAmount),
    holdExpiresAt: b.holdExpiresAt ? b.holdExpiresAt.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
    flightGroup,
    package: pkg,
    passengersInfo: Array.isArray(b.passengersInfo) ? b.passengersInfo : [],
    contactEmail: b.contactEmail,
    contactPhone: b.contactPhone,
    agentId: b.agentId ?? null,
    agentName,
    notes: b.notes ?? null,
    paymentMethod: b.paymentMethod,
  };
}

async function autoCreateLedgerEntry(
  bookingId: number,
  bookingRef: string,
  amount: number,
  paymentMethod: string,
  userId?: number | null,
) {
  try {
    let bankId: number | null = null;
    if (paymentMethod && paymentMethod.toLowerCase().includes("bank")) {
      const banks = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.userId, 1));
      if (banks.length > 0) bankId = banks[0].id;
      if (!bankId) {
        const allBanks = await db.select().from(bankAccountsTable);
        if (allBanks.length > 0) bankId = allBanks[0].id;
      }
    }

    const allEntries = await db.select().from(ledgerTable).orderBy(desc(ledgerTable.id));
    const lastBalance = allEntries.length > 0 ? Number(allEntries[0].balance) : 0;
    const newBalance = lastBalance + amount;

    await db.insert(ledgerTable).values({
      userId: userId ?? null,
      type: "credit",
      amount: amount.toString(),
      description: `Booking ${bookingRef} — ${paymentMethod || "payment"} received`,
      balance: newBalance.toString(),
      bookingId,
      bankId,
    });
  } catch (err) {
    console.error("Failed to auto-create ledger entry:", err);
  }
}

router.get("/bookings", async (req, res): Promise<void> => {
  const parsed = ListBookingsQueryParams.safeParse(req.query);
  let rows = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);

  if (parsed.success) {
    const { status, userId } = parsed.data;
    if (status) rows = rows.filter(r => r.status === status);
    if (userId) rows = rows.filter(r => r.userId === Number(userId) || r.agentId === Number(userId));
  }

  const formatted = await Promise.all(rows.map(formatBooking));
  res.json(formatted);
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { flightGroupId, packageId, passengersInfo, contactEmail, contactPhone, paymentMethod, agentId, notes } = parsed.data;

  let totalAmount = 0;
  if (flightGroupId) {
    const [fg] = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.id, flightGroupId));
    if (fg) totalAmount = Number(fg.price) * (Array.isArray(passengersInfo) ? passengersInfo.length : 1);
  }
  if (packageId) {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, packageId));
    if (pkg) totalAmount = Number(pkg.price) * (Array.isArray(passengersInfo) ? passengersInfo.length : 1);
  }

  const caller = decodeToken(req);
  const callerUserId = caller?.userId ?? null;
  const callerRole = caller?.role ?? null;
  const resolvedAgentId = agentId ?? (callerRole === "agent" ? callerUserId : null);

  const bookingRef = generateBookingRef();
  const [booking] = await db.insert(bookingsTable).values({
    bookingRef,
    status: "confirmed",
    totalAmount: totalAmount.toString(),
    flightGroupId: flightGroupId ?? null,
    packageId: packageId ?? null,
    passengersInfo: passengersInfo ?? [],
    contactEmail,
    contactPhone,
    paymentMethod,
    userId: callerUserId,
    agentId: resolvedAgentId,
    notes: notes ?? null,
  }).returning();

  await autoCreateLedgerEntry(booking.id, bookingRef, totalAmount, paymentMethod || "", agentId ?? null);

  res.status(201).json(await formatBooking(booking));
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(await formatBooking(booking));
});

router.patch("/bookings/:id", async (req, res): Promise<void> => {
  const params = UpdateBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

  const [booking] = await db.update(bookingsTable).set(updates).where(eq(bookingsTable.id, params.data.id)).returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(await formatBooking(booking));
});

router.post("/bookings/:id/hold", async (req, res): Promise<void> => {
  const params = HoldBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const holdExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const [booking] = await db.update(bookingsTable)
    .set({ status: "on_hold", holdExpiresAt })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(await formatBooking(booking));
});

router.post("/bookings/:id/confirm", async (req, res): Promise<void> => {
  const params = ConfirmBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [booking] = await db.update(bookingsTable)
    .set({ status: "confirmed", holdExpiresAt: null })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(await formatBooking(booking));
});

router.post("/bookings/:id/cancel", async (req, res): Promise<void> => {
  const params = CancelBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [booking] = await db.update(bookingsTable)
    .set({ status: "cancelled" })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(await formatBooking(booking));
});

export default router;
