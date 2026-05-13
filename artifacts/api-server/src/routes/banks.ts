import { Router, type IRouter, type Request } from "express";
import { db, bankAccountsTable, usersTable } from "@workspace/db";
import { eq, isNull, or } from "drizzle-orm";
import { CreateBankAccountBody } from "@workspace/api-zod";

const router: IRouter = Router();

function decodeToken(req: Request): { userId: number; role: string } | null {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    if (!token) return null;
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    if (payload && payload.userId && payload.role) return payload;
    return null;
  } catch {
    return null;
  }
}

function formatBank(b: typeof bankAccountsTable.$inferSelect) {
  return {
    id: b.id,
    userId: b.userId ?? null,
    bankName: b.bankName,
    accountName: b.accountName,
    accountNumber: b.accountNumber,
    accountType: b.accountType,
    balance: Number(b.balance),
    branchName: b.branchName ?? null,
    iban: b.iban ?? null,
    createdAt: b.createdAt.toISOString(),
  };
}

router.get("/banks", async (req, res): Promise<void> => {
  const caller = decodeToken(req);
  let rows;
  if (caller && caller.role === "agent") {
    const adminUsers = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "admin"));
    const adminIds = adminUsers.map(u => u.id);
    const all = await db.select().from(bankAccountsTable);
    rows = all.filter(b => b.userId === null || adminIds.includes(b.userId!));
  } else {
    rows = await db.select().from(bankAccountsTable);
  }
  res.json(rows.map(formatBank));
});

router.post("/banks", async (req, res): Promise<void> => {
  const caller = decodeToken(req);
  if (!caller || caller.role !== "admin") {
    res.status(403).json({ error: "Only admins can add bank accounts" });
    return;
  }

  const parsed = CreateBankAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [account] = await db.insert(bankAccountsTable).values({
    userId: caller.userId,
    bankName: parsed.data.bankName,
    accountName: parsed.data.accountName,
    accountNumber: parsed.data.accountNumber,
    accountType: parsed.data.accountType,
    branchName: parsed.data.branchName ?? null,
    iban: parsed.data.iban ?? null,
    balance: "0",
  }).returning();
  res.status(201).json(formatBank(account));
});

export default router;
