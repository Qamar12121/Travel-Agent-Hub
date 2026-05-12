import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  useGetAdminStats, getGetAdminStatsQueryKey,
  useListUsers, getListUsersQueryKey,
  useUpdateUser,
  useListAgents, getListAgentsQueryKey,
  useListBookings, getListBookingsQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Plane, Package, BarChart3, TrendingUp, Shield } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = { confirmed: "bg-green-100 text-green-800", on_hold: "bg-amber-100 text-amber-800", cancelled: "bg-red-100 text-red-800", pending: "bg-blue-100 text-blue-800" };
  return <Badge className={`${map[status] || "bg-gray-100 text-gray-800"} border-0 text-xs font-semibold capitalize`}>{status.replace("_", " ")}</Badge>;
}

export default function Admin() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
    if (!authLoading && isAuthenticated && user?.role !== "admin") setLocation("/dashboard");
  }, [isAuthenticated, authLoading, user]);

  const { data: adminStats, isLoading: statsLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: users, isLoading: usersLoading } = useListUsers({ query: { queryKey: getListUsersQueryKey() } });
  const { data: agents, isLoading: agentsLoading } = useListAgents({ query: { queryKey: getListAgentsQueryKey() } });
  const { data: allBookings, isLoading: bookingsLoading } = useListBookings({}, { query: { queryKey: getListBookingsQueryKey({}) } });
  const updateUser = useUpdateUser();

  const toggleActive = (id: number, currentActive: boolean) => {
    updateUser.mutate({ id, data: { isActive: !currentActive } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }); toast({ title: "User updated" }); },
    });
  };

  const fmt = (n: number) => `PKR ${n?.toLocaleString("en-PK") ?? "0"}`;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Full system management and oversight</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsLoading ? Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-20"/>) : (
            [
              { label: "Total Users", value: adminStats?.totalUsers ?? 0, icon: Users, color: "#1a2e5a" },
              { label: "Agents", value: adminStats?.totalAgents ?? 0, icon: Users, color: "#7c3aed" },
              { label: "Total Bookings", value: adminStats?.totalBookings ?? 0, icon: Plane, color: "#0891b2" },
              { label: "Total Revenue", value: fmt(adminStats?.totalRevenue ?? 0), icon: TrendingUp, color: "#16a34a" },
              { label: "Active Flights", value: adminStats?.activeFlights ?? 0, icon: Plane, color: "#d97706" },
              { label: "Packages", value: adminStats?.activePackages ?? 0, icon: Package, color: "#dc2626" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-l-4" style={{ borderLeftColor: color }}>
                <CardHeader className="pb-1 pt-3 px-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Icon className="h-3 w-3" style={{ color }} />{label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="text-lg font-bold" data-testid={`admin-stat-${label.toLowerCase().replace(/\s/g, '-')}`}>{value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="agents" data-testid="tab-agents">Agents</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">All Bookings</TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle className="text-base">User Management</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Role</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Joined</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? Array.from({length:5}).map((_,i)=>(
                        <tr key={i} className="border-b"><td colSpan={7} className="px-4 py-3"><Skeleton className="h-4 w-full"/></td></tr>
                      )) : users?.map(u => (
                        <tr key={u.id} className="border-b hover:bg-muted/20 transition-colors" data-testid={`row-user-${u.id}`}>
                          <td className="px-4 py-3 text-xs text-muted-foreground">#{u.id}</td>
                          <td className="px-4 py-3 font-medium">{u.name}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="capitalize text-xs">{u.role}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={u.isActive ? "bg-green-100 text-green-800 border-0" : "bg-red-100 text-red-800 border-0"}>
                              {u.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <Button variant="outline" size="sm" onClick={() => toggleActive(u.id, u.isActive)} data-testid={`button-toggle-user-${u.id}`}>
                              {u.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <Card>
              <CardHeader><CardTitle className="text-base">Agent Management</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Agency</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Phone</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Balance</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentsLoading ? Array.from({length:3}).map((_,i)=>(
                        <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><Skeleton className="h-4 w-full"/></td></tr>
                      )) : agents?.map(a => (
                        <tr key={a.id} className="border-b hover:bg-muted/20" data-testid={`row-agent-${a.id}`}>
                          <td className="px-4 py-3 font-medium">{a.name}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{a.email}</td>
                          <td className="px-4 py-3 text-muted-foreground">{a.agencyName ?? "—"}</td>
                          <td className="px-4 py-3 text-xs">{a.phone ?? "—"}</td>
                          <td className="px-4 py-3 font-semibold">PKR {Number(a.balance ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge className={a.isActive ? "bg-green-100 text-green-800 border-0" : "bg-red-100 text-red-800 border-0"}>
                              {a.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader><CardTitle className="text-base">All Bookings</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Ref</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Contact</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Route</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Payment</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsLoading ? Array.from({length:5}).map((_,i)=>(
                        <tr key={i} className="border-b"><td colSpan={7} className="px-4 py-3"><Skeleton className="h-4 w-full"/></td></tr>
                      )) : allBookings?.map(b => {
                        const route = b.flightGroup ? `${b.flightGroup.originCode} → ${b.flightGroup.destinationCode}` : b.package?.name ?? "N/A";
                        return (
                          <tr key={b.id} className="border-b hover:bg-muted/20" data-testid={`row-admin-booking-${b.id}`}>
                            <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{b.bookingRef}</td>
                            <td className="px-4 py-3 text-xs">{b.contactEmail}</td>
                            <td className="px-4 py-3">{route}</td>
                            <td className="px-4 py-3 font-semibold">PKR {Number(b.totalAmount).toLocaleString()}</td>
                            <td className="px-4 py-3 text-xs capitalize">{b.paymentMethod.replace("_", " ")}</td>
                            <td className="px-4 py-3">{statusBadge(b.status)}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" />Top Agents Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Agent</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Total Bookings</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Confirmed</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">On Hold</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Cancelled</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsLoading ? Array.from({length:3}).map((_,i)=>(
                        <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><Skeleton className="h-4 w-full"/></td></tr>
                      )) : adminStats?.topAgents?.map(a => (
                        <tr key={a.agentId} className="border-b hover:bg-muted/20" data-testid={`row-perf-agent-${a.agentId}`}>
                          <td className="px-4 py-3 font-medium">{a.agentName}</td>
                          <td className="px-4 py-3 text-right font-semibold">{a.totalBookings}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-semibold">{a.confirmedBookings}</td>
                          <td className="px-4 py-3 text-right text-amber-600 font-semibold">{a.onHoldBookings ?? 0}</td>
                          <td className="px-4 py-3 text-right text-red-600 font-semibold">{a.cancelledBookings ?? 0}</td>
                          <td className="px-4 py-3 text-right font-bold text-primary">{fmt(a.totalRevenue)}</td>
                        </tr>
                      )) ?? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No agent data available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
