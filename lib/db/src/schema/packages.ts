import { pgTable, serial, text, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const packagesTable = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  duration: integer("duration").notNull(),
  type: text("type").notNull().default("umrah"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  hotel: text("hotel").notNull(),
  hotelRating: integer("hotel_rating"),
  airline: text("airline").notNull(),
  departureDate: text("departure_date").notNull(),
  returnDate: text("return_date").notNull(),
  seatsAvailable: integer("seats_available").notNull().default(0),
  description: text("description").notNull().default(""),
  inclusions: jsonb("inclusions").notNull().default([]),
  makkahNights: integer("makkah_nights"),
  madinahNights: integer("madinah_nights"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPackageSchema = createInsertSchema(packagesTable).omit({ id: true, createdAt: true });
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packagesTable.$inferSelect;
