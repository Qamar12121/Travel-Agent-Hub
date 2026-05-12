import { pgTable, serial, text, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingRef: text("booking_ref").notNull().unique(),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  holdExpiresAt: timestamp("hold_expires_at"),
  flightGroupId: integer("flight_group_id"),
  packageId: integer("package_id"),
  passengersInfo: jsonb("passengers_info").notNull().default([]),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  agentId: integer("agent_id"),
  paymentMethod: text("payment_method").notNull().default("cash"),
  notes: text("notes"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
