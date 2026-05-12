import { Router, type IRouter } from "express";
import { db, usersTable, bookingsTable, flightGroupsTable, packagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateUserParams, UpdateUserBody } from "@workspace/api-zod";

const router: IRouter = Router();

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

router.get("/admin/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  res.json(users.map(formatUser));
});

router.patch("/admin/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name) updates.name = parsed.data.name;
  if (parsed.data.role) updates.role = parsed.data.role;
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;
  if (parsed.data.balance !== undefined) updates.balance = parsed.data.balance.toString();

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  const bookings = await db.select().from(bookingsTable);
  const flights = await db.select().from(flightGroupsTable);
  const packages = await db.select().from(packagesTable);

  const agents = users.filter(u => u.role === "agent");
  const totalRevenue = bookings.filter(b => b.status === "confirmed").reduce((sum, b) => sum + Number(b.totalAmount), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyBookings = bookings.filter(b => b.createdAt >= monthStart).length;

  const agentStats = await Promise.all(agents.slice(0, 5).map(async a => {
    const agentBookings = bookings.filter(b => b.agentId === a.id);
    return {
      agentId: a.id,
      agentName: a.name,
      totalBookings: agentBookings.length,
      totalRevenue: agentBookings.filter(b => b.status === "confirmed").reduce((sum, b) => sum + Number(b.totalAmount), 0),
      confirmedBookings: agentBookings.filter(b => b.status === "confirmed").length,
      onHoldBookings: agentBookings.filter(b => b.status === "on_hold").length,
      cancelledBookings: agentBookings.filter(b => b.status === "cancelled").length,
    };
  }));

  res.json({
    totalUsers: users.length,
    totalAgents: agents.length,
    totalBookings: bookings.length,
    totalRevenue,
    activeFlights: flights.length,
    activePackages: packages.length,
    monthlyBookings,
    topAgents: agentStats,
  });
});

export default router;
