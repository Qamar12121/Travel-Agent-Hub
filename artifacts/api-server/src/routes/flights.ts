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
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [flight] = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.id, params.data.id));
  if (!flight) {
    res.status(404).json({ error: "Flight group not found" });
    return;
  }
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
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [flight] = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.id, params.data.id));
  if (!flight) {
    res.status(404).json({ error: "Flight group not found" });
    return;
  }
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
