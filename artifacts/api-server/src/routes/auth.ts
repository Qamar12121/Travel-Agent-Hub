import { Router, type IRouter, type Request } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  LoginBody,
  RegisterBody,
  ForgotPasswordBody,
} from "@workspace/api-zod";
import { z } from "zod/v4";

const router: IRouter = Router();

function makeToken(userId: number, role: string): string {
  return Buffer.from(JSON.stringify({ userId, role, ts: Date.now() })).toString("base64");
}

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

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    agencyName: u.agencyName ?? null,
    phone: u.phone ?? null,
    balance: u.balance ? Number(u.balance) : 0,
    isActive: u.isActive,
    profilePic: u.profilePic ?? null,
    agencyLogo: u.agencyLogo ?? null,
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
  if (!user.isActive) {
    res.status(403).json({ error: "Account is deactivated. Contact admin." });
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
  const caller = decodeToken(req);
  if (!caller) { res.status(401).json({ error: "Not authenticated" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, caller.userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

router.patch("/auth/change-password", async (req, res): Promise<void> => {
  const caller = decodeToken(req);
  if (!caller) { res.status(401).json({ error: "Not authenticated" }); return; }
  const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "newPassword must be at least 6 characters" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, caller.userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (user.password !== parsed.data.currentPassword) {
    res.status(400).json({ error: "Current password is incorrect" }); return;
  }
  await db.update(usersTable).set({ password: parsed.data.newPassword }).where(eq(usersTable.id, caller.userId));
  res.json({ message: "Password changed successfully" });
});

router.patch("/auth/profile", async (req, res): Promise<void> => {
  const caller = decodeToken(req);
  if (!caller) { res.status(401).json({ error: "Not authenticated" }); return; }
  const schema = z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    agencyName: z.string().optional(),
    address: z.string().optional(),
    profilePic: z.string().optional(),
    agencyLogo: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name) updates.name = parsed.data.name;
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
  if (parsed.data.agencyName !== undefined) updates.agencyName = parsed.data.agencyName;
  if (parsed.data.address !== undefined) updates.address = parsed.data.address;
  if (parsed.data.profilePic !== undefined) updates.profilePic = parsed.data.profilePic;
  if (parsed.data.agencyLogo !== undefined) updates.agencyLogo = parsed.data.agencyLogo;
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, caller.userId)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

export default router;
