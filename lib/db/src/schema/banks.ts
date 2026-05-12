import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bankAccountsTable = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountType: text("account_type").notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  branchName: text("branch_name"),
  iban: text("iban"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBankAccountSchema = createInsertSchema(bankAccountsTable).omit({ id: true, createdAt: true });
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccountsTable.$inferSelect;
