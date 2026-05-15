import { Router, type IRouter, type Request } from "express";
import { db, ledgerTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

function decodeToken(req: Request): { userId: number; role: string } | null {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    if (!token) return null;
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    if (payload && payload.userId && payload.role) return payload;
    return null;
  } catch { return null; }
}

function formatEntry(e: typeof ledgerTable.$inferSelect) {
  return {
    id: e.id,
    userId: e.userId ?? null,
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
  const caller = decodeToken(req);
  const isAdmin = caller?.role === "admin";
  const queryUserId = req.query.userId ? Number(req.query.userId) : null;
  const typeFilter = req.query.type as string | undefined;

  let rows = await db.select().from(ledgerTable).orderBy(ledgerTable.createdAt);

  if (isAdmin) {
    if (queryUserId) rows = rows.filter(r => r.userId === queryUserId);
  } else if (caller) {
    rows = rows.filter(r => r.userId === caller.userId);
  }

  if (typeFilter) rows = rows.filter(r => r.type === typeFilter);
  res.json(rows.map(formatEntry));
});

router.post("/ledger", async (req, res): Promise<void> => {
  const caller = decodeToken(req);
  const schema = z.object({
    type: z.enum(["credit", "debit"]),
    amount: z.number().positive(),
    description: z.string().min(1),
    bookingId: z.number().optional(),
    bankId: z.number().optional(),
    userId: z.number().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const targetUserId = caller?.role === "admin" && parsed.data.userId
    ? parsed.data.userId
    : (caller?.userId ?? null);

  let lastBalance = 0;
  if (targetUserId) {
    const prev = await db.select().from(ledgerTable)
      .where(eq(ledgerTable.userId, targetUserId))
      .orderBy(desc(ledgerTable.id));
    lastBalance = prev.length > 0 ? Number(prev[0].balance) : 0;
  } else {
    const all = await db.select().from(ledgerTable).orderBy(desc(ledgerTable.id));
    lastBalance = all.length > 0 ? Number(all[0].balance) : 0;
  }

  const newBalance = parsed.data.type === "credit"
    ? lastBalance + parsed.data.amount
    : lastBalance - parsed.data.amount;

  const [entry] = await db.insert(ledgerTable).values({
    userId: targetUserId,
    type: parsed.data.type,
    amount: parsed.data.amount.toString(),
    description: parsed.data.description,
    balance: newBalance.toString(),
    bookingId: parsed.data.bookingId ?? null,
    bankId: parsed.data.bankId ?? null,
  }).returning();

  if (targetUserId) {
    await db.update(usersTable).set({ balance: newBalance.toString() }).where(eq(usersTable.id, targetUserId));
  }

  res.status(201).json(formatEntry(entry));
});

router.patch("/ledger/:id", async (req, res): Promise<void> => {
  const caller = decodeToken(req);
  if (caller?.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const schema = z.object({
    type: z.enum(["credit", "debit"]).optional(),
    amount: z.number().positive().optional(),
    description: z.string().min(1).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = {};
  if (parsed.data.description) updates.description = parsed.data.description;
  if (parsed.data.type) updates.type = parsed.data.type;
  if (parsed.data.amount) updates.amount = parsed.data.amount.toString();
  const [entry] = await db.update(ledgerTable).set(updates).where(eq(ledgerTable.id, id)).returning();
  if (!entry) { res.status(404).json({ error: "Entry not found" }); return; }
  res.json(formatEntry(entry));
});

router.delete("/ledger/:id", async (req, res): Promise<void> => {
  const caller = decodeToken(req);
  if (caller?.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(ledgerTable).where(eq(ledgerTable.id, id));
  res.json({ message: "Deleted" });
});

router.get("/ledger/summary", async (req, res): Promise<void> => {
  const caller = decodeToken(req);
  const isAdmin = caller?.role === "admin";
  const queryUserId = req.query.userId ? Number(req.query.userId) : null;

  let rows = await db.select().from(ledgerTable);
  if (isAdmin && queryUserId) {
    rows = rows.filter(r => r.userId === queryUserId);
  } else if (!isAdmin && caller) {
    rows = rows.filter(r => r.userId === caller.userId);
  }

  let totalCredit = 0, totalDebit = 0;
  for (const r of rows) {
    if (r.type === "credit") totalCredit += Number(r.amount);
    else totalDebit += Number(r.amount);
  }
  res.json({ totalCredit, totalDebit, currentBalance: totalCredit - totalDebit });
});

export default router;
