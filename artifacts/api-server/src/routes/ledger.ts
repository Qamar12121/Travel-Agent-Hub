import { Router, type IRouter } from "express";
import { db, ledgerTable } from "@workspace/db";
import {
  CreateLedgerEntryBody,
  ListLedgerQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatEntry(e: typeof ledgerTable.$inferSelect) {
  return {
    id: e.id,
    type: e.type,
    amount: Number(e.amount),
    description: e.description,
    balance: Number(e.balance),
    bookingId: e.bookingId ?? null,
    bankId: e.bankId ?? null,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/ledger", async (req, res): Promise<void> => {
  const parsed = ListLedgerQueryParams.safeParse(req.query);
  let rows = await db.select().from(ledgerTable).orderBy(ledgerTable.createdAt);

  if (parsed.success) {
    const { type } = parsed.data;
    if (type) rows = rows.filter(r => r.type === type);
  }

  res.json(rows.map(formatEntry));
});

router.post("/ledger", async (req, res): Promise<void> => {
  const parsed = CreateLedgerEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const allEntries = await db.select().from(ledgerTable).orderBy(ledgerTable.createdAt);
  const lastBalance = allEntries.length > 0 ? Number(allEntries[allEntries.length - 1].balance) : 0;
  const newBalance = parsed.data.type === "credit"
    ? lastBalance + Number(parsed.data.amount)
    : lastBalance - Number(parsed.data.amount);

  const [entry] = await db.insert(ledgerTable).values({
    type: parsed.data.type,
    amount: parsed.data.amount.toString(),
    description: parsed.data.description,
    balance: newBalance.toString(),
    bookingId: parsed.data.bookingId ?? null,
    bankId: parsed.data.bankId ?? null,
  }).returning();

  res.status(201).json(formatEntry(entry));
});

router.get("/ledger/summary", async (_req, res): Promise<void> => {
  const rows = await db.select().from(ledgerTable);
  let totalCredit = 0;
  let totalDebit = 0;
  for (const r of rows) {
    if (r.type === "credit") totalCredit += Number(r.amount);
    else totalDebit += Number(r.amount);
  }
  const currentBalance = totalCredit - totalDebit;
  res.json({ totalCredit, totalDebit, currentBalance });
});

export default router;
