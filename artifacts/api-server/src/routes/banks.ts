import { Router, type IRouter } from "express";
import { db, bankAccountsTable } from "@workspace/db";
import { CreateBankAccountBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatBank(b: typeof bankAccountsTable.$inferSelect) {
  return {
    id: b.id,
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

router.get("/banks", async (_req, res): Promise<void> => {
  const rows = await db.select().from(bankAccountsTable);
  res.json(rows.map(formatBank));
});

router.post("/banks", async (req, res): Promise<void> => {
  const parsed = CreateBankAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [account] = await db.insert(bankAccountsTable).values({
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
