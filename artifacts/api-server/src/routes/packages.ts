import { Router, type IRouter } from "express";
import { db, packagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetPackageParams, ListPackagesQueryParams } from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

function formatPackage(p: typeof packagesTable.$inferSelect) {
  return {
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
    imageUrl: p.imageUrl ?? null,
  };
}

const CreatePackageBody = z.object({
  name: z.string().min(1),
  duration: z.number(),
  type: z.string().default("umrah"),
  price: z.number(),
  hotel: z.string().min(1),
  hotelRating: z.number().optional(),
  airline: z.string().min(1),
  departureDate: z.string().min(1),
  returnDate: z.string().min(1),
  seatsAvailable: z.number().default(0),
  description: z.string().default(""),
  inclusions: z.array(z.string()).default([]),
  makkahNights: z.number().optional(),
  madinahNights: z.number().optional(),
  imageUrl: z.string().optional(),
});

const UpdatePackageBody = CreatePackageBody.partial();

router.get("/packages", async (req, res): Promise<void> => {
  const parsed = ListPackagesQueryParams.safeParse(req.query);
  let rows = await db.select().from(packagesTable);
  if (parsed.success) {
    const { duration, type, minPrice, maxPrice } = parsed.data;
    if (duration) rows = rows.filter(r => r.duration === Number(duration));
    if (type) rows = rows.filter(r => r.type === type);
    if (minPrice) rows = rows.filter(r => Number(r.price) >= Number(minPrice));
    if (maxPrice) rows = rows.filter(r => Number(r.price) <= Number(maxPrice));
  }
  res.json(rows.map(formatPackage));
});

router.post("/packages", async (req, res): Promise<void> => {
  const parsed = CreatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [pkg] = await db.insert(packagesTable).values({
    name: parsed.data.name,
    duration: parsed.data.duration,
    type: parsed.data.type,
    price: parsed.data.price.toString(),
    hotel: parsed.data.hotel,
    hotelRating: parsed.data.hotelRating,
    airline: parsed.data.airline,
    departureDate: parsed.data.departureDate,
    returnDate: parsed.data.returnDate,
    seatsAvailable: parsed.data.seatsAvailable,
    description: parsed.data.description,
    inclusions: parsed.data.inclusions,
    makkahNights: parsed.data.makkahNights,
    madinahNights: parsed.data.madinahNights,
    imageUrl: parsed.data.imageUrl,
  }).returning();
  res.status(201).json(formatPackage(pkg));
});

router.get("/packages/:id", async (req, res): Promise<void> => {
  const params = GetPackageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, params.data.id));
  if (!pkg) { res.status(404).json({ error: "Package not found" }); return; }
  res.json(formatPackage(pkg));
});

router.patch("/packages/:id", async (req, res): Promise<void> => {
  const params = GetPackageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdatePackageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price !== undefined) updates.price = parsed.data.price.toString();
  const [pkg] = await db.update(packagesTable).set(updates).where(eq(packagesTable.id, params.data.id)).returning();
  if (!pkg) { res.status(404).json({ error: "Package not found" }); return; }
  res.json(formatPackage(pkg));
});

router.delete("/packages/:id", async (req, res): Promise<void> => {
  const params = GetPackageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(packagesTable).where(eq(packagesTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
