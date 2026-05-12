import { Router, type IRouter } from "express";
import { db, packagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetPackageParams, ListPackagesQueryParams } from "@workspace/api-zod";

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

router.get("/packages/:id", async (req, res): Promise<void> => {
  const params = GetPackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, params.data.id));
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  res.json(formatPackage(pkg));
});

export default router;
