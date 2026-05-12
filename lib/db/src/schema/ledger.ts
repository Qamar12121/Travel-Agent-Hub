import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ledgerTable = pgTable("ledger", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  bookingId: integer("booking_id"),
  bankId: integer("bank_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLedgerSchema = createInsertSchema(ledgerTable).omit({ id: true, createdAt: true });
export type InsertLedger = z.infer<typeof insertLedgerSchema>;
export type Ledger = typeof ledgerTable.$inferSelect;
