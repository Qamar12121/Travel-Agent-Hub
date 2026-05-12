import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  LoginBody,
  RegisterBody,
  ForgotPasswordBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function makeToken(userId: number, role: string): string {
  return Buffer.from(JSON.stringify({ userId, role, ts: Date.now() })).toString("base64");
}

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    agencyName: u.agencyName ?? null,
    phone: u.phone ?? null,
    balance: u.balance ? Number(u.balance) : null,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  };
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = makeToken(user.id, user.role);
  res.json({ token, user: formatUser(user) });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, role, agencyName, phone, address } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name, email, password, role: role || "customer",
    agencyName: agencyName ?? null,
    phone: phone ?? null,
    address: address ?? null,
  }).returning();
  const token = makeToken(user.id, user.role);
  res.status(201).json({ token, user: formatUser(user) });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.json({ message: "If that email exists, a reset link has been sent." });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
