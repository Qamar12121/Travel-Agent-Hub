import { pgTable, serial, text, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const flightGroupsTable = pgTable("flight_groups", {
  id: serial("id").primaryKey(),
  flightNumber: text("flight_number").notNull(),
  airline: text("airline").notNull(),
  airlineCode: text("airline_code").notNull().default(""),
  origin: text("origin").notNull(),
  originCode: text("origin_code").notNull().default(""),
  destination: text("destination").notNull(),
  destinationCode: text("destination_code").notNull().default(""),
  departureDate: text("departure_date").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  duration: text("duration").notNull().default(""),
  seats: integer("seats").notNull().default(0),
  seatsAvailable: integer("seats_available").notNull().default(0),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(),
  pnr: text("pnr").notNull(),
  class: text("class").notNull().default("Economy"),
  baggage: text("baggage"),
  meal: boolean("meal"),
  refundable: boolean("refundable"),
  stops: integer("stops").default(0),
  aircraft: text("aircraft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFlightGroupSchema = createInsertSchema(flightGroupsTable).omit({ id: true, createdAt: true });
export type InsertFlightGroup = z.infer<typeof insertFlightGroupSchema>;
export type FlightGroup = typeof flightGroupsTable.$inferSelect;
