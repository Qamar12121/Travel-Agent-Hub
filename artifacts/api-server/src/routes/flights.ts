import { Router, type IRouter } from "express";
import { db, flightGroupsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetKsaGroupParams,
  GetUaeGroupParams,
  ListKsaGroupsQueryParams,
  ListUaeGroupsQueryParams,
  ListAllGroupsQueryParams,
  ListUmrahTicketsQueryParams,
} from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

function formatFlight(f: typeof flightGroupsTable.$inferSelect) {
  return {
    id: f.id,
    flightNumber: f.flightNumber,
    airline: f.airline,
    airlineCode: f.airlineCode,
    origin: f.origin,
    originCode: f.originCode,
    destination: f.destination,
    destinationCode: f.destinationCode,
    departureDate: f.departureDate,
    departureTime: f.departureTime,
    arrivalTime: f.arrivalTime,
    duration: f.duration,
    seats: f.seats,
    seatsAvailable: f.seatsAvailable,
    price: Number(f.price),
    type: f.type,
    pnr: f.pnr,
    class: f.class,
    baggage: f.baggage ?? null,
    meal: f.meal ?? null,
    refundable: f.refundable ?? null,
    stops: f.stops ?? null,
    aircraft: f.aircraft ?? null,
  };
}

const CreateFlightBody = z.object({
  flightNumber: z.string().min(1),
  airline: z.string().min(1),
  airlineCode: z.string().min(1),
  origin: z.string().min(1),
  originCode: z.string().min(1),
  destination: z.string().min(1),
  destinationCode: z.string().min(1),
  departureDate: z.string().min(1),
  departureTime: z.string().min(1),
  arrivalTime: z.string().min(1),
  duration: z.string().default(""),
  seats: z.number().default(0),
  seatsAvailable: z.number().default(0),
  price: z.number(),
  type: z.string().min(1),
  pnr: z.string().min(1),
  class: z.string().default("Economy"),
  baggage: z.string().optional(),
  meal: z.boolean().optional(),
  refundable: z.boolean().optional(),
  stops: z.number().optional(),
  aircraft: z.string().optional(),
});

// Admin: Create flight group
router.post("/flights", async (req, res): Promise<void> => {
  const parsed = CreateFlightBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [flight] = await db.insert(flightGroupsTable).values({
    ...parsed.data,
    price: parsed.data.price.toString(),
  }).returning();
  res.status(201).json(formatFlight(flight));
});

// Admin: Update flight group
router.patch("/flights/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CreateFlightBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price !== undefined) updates.price = parsed.data.price.toString();
  const [flight] = await db.update(flightGroupsTable).set(updates).where(eq(flightGroupsTable.id, id)).returning();
  if (!flight) { res.status(404).json({ error: "Flight not found" }); return; }
  res.json(formatFlight(flight));
});

// Admin: Delete flight group
router.delete("/flights/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(flightGroupsTable).where(eq(flightGroupsTable.id, id));
  res.json({ success: true });
});

router.get("/flights/ksa-groups", async (req, res): Promise<void> => {
  const parsed = ListKsaGroupsQueryParams.safeParse(req.query);
  let rows = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.type, "ksa_one_way"));
  if (parsed.success) {
    const { airline, departureDate, minSeats } = parsed.data;
    if (airline) rows = rows.filter(r => r.airline.toLowerCase().includes((airline as string).toLowerCase()));
    if (departureDate) rows = rows.filter(r => r.departureDate === departureDate);
    if (minSeats) rows = rows.filter(r => r.seatsAvailable >= Number(minSeats));
  }
  res.json(rows.map(formatFlight));
});

router.get("/flights/ksa-groups/:id", async (req, res): Promise<void> => {
  const params = GetKsaGroupParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [flight] = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.id, params.data.id));
  if (!flight) { res.status(404).json({ error: "Flight group not found" }); return; }
  res.json(formatFlight(flight));
});

router.get("/flights/uae-groups", async (req, res): Promise<void> => {
  const parsed = ListUaeGroupsQueryParams.safeParse(req.query);
  let rows = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.type, "uae_one_way"));
  if (parsed.success) {
    const { airline, departureDate } = parsed.data;
    if (airline) rows = rows.filter(r => r.airline.toLowerCase().includes((airline as string).toLowerCase()));
    if (departureDate) rows = rows.filter(r => r.departureDate === departureDate);
  }
  res.json(rows.map(formatFlight));
});

router.get("/flights/uae-groups/:id", async (req, res): Promise<void> => {
  const params = GetUaeGroupParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [flight] = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.id, params.data.id));
  if (!flight) { res.status(404).json({ error: "Flight group not found" }); return; }
  res.json(formatFlight(flight));
});

router.get("/flights/all-groups", async (req, res): Promise<void> => {
  const parsed = ListAllGroupsQueryParams.safeParse(req.query);
  let rows = await db.select().from(flightGroupsTable);
  if (parsed.success) {
    const { airline, destination, departureDate, type } = parsed.data;
    if (airline) rows = rows.filter(r => r.airline.toLowerCase().includes((airline as string).toLowerCase()));
    if (destination) rows = rows.filter(r => r.destination.toLowerCase().includes((destination as string).toLowerCase()));
    if (departureDate) rows = rows.filter(r => r.departureDate === departureDate);
    if (type) rows = rows.filter(r => r.type === type);
  }
  res.json(rows.map(formatFlight));
});

router.get("/flights/umrah-tickets", async (req, res): Promise<void> => {
  const parsed = ListUmrahTicketsQueryParams.safeParse(req.query);
  let rows = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.type, "umrah_ticket"));
  if (parsed.success) {
    const { airline, departureDate } = parsed.data;
    if (airline) rows = rows.filter(r => r.airline.toLowerCase().includes((airline as string).toLowerCase()));
    if (departureDate) rows = rows.filter(r => r.departureDate === departureDate);
  }
  res.json(rows.map(formatFlight));
});

export default router;
