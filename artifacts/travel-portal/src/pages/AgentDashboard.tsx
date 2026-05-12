import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAgentStats, getGetAgentStatsQueryKey, useGetAgentBookings, getGetAgentBookingsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { Plane, CheckCircle, Clock, XCircle, DollarSign, User } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = { confirmed: "bg-green-100 text-green-800", on_hold: "bg-amber-100 text-amber-800", cancelled: "bg-red-100 text-red-800", pending: "bg-blue-100 text-blue-800" };
  return <Badge className={`${map[status] || "bg-gray-100 text-gray-800"} border-0 text-xs font-semibold capitalize`}>{status.replace("_", " ")}</Badge>;
}

export default function AgentDashboard() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
    if (!authLoading && isAuthenticated && user?.role !== "agent" && user?.role !== "admin") setLocation("/dashboard");
  }, [isAuthenticated, authLoading, user]);

  const agentId = user?.id ?? 0;
  const { data: stats, isLoading: statsLoading } = useGetAgentStats(agentId, { query: { queryKey: getGetAgentStatsQueryKey(agentId), enabled: !!agentId } });
  const { data: bookings, isLoading: bookingsLoading } = useGetAgentBookings(agentId, { query: { queryKey: getGetAgentBookingsQueryKey(agentId), enabled: !!agentId } });

  const fmt = (n: number) => `PKR ${n?.toLocaleString("en-PK") ?? "0"}`;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agent Dashboard</h1>
            <p className="text-muted-foreground text-sm">{user?.name} · {user?.agencyName ?? "Travel Agent"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsLoading ? Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-20"/>) : (
            <>
              {[
                { label: "Total Bookings", value: stats?.totalBookings ?? 0, icon: Plane, color: "#1a2e5a" },
                { label: "Confirmed", value: stats?.confirmedBookings ?? 0, icon: CheckCircle, color: "#16a34a" },
                { label: "On Hold", value: stats?.onHoldBookings ?? 0, icon: Clock, color: "#d97706" },
                { label: "Cancelled", value: stats?.cancelledBookings ?? 0, icon: XCircle, color: "#dc2626" },
                { label: "Total Revenue", value: fmt(stats?.totalRevenue ?? 0), icon: DollarSign, color: "#7c3aed", wide: true },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border-l-4" style={{ borderLeftColor: color }}>
                  <CardHeader className="pb-1 pt-3 px-3">
                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Icon className="h-3 w-3" style={{ color }} />{label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="text-lg font-bold" data-testid={`agent-stat-${label.toLowerCase().replace(/\s/g, '-')}`}>{value}</div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        {/* Agent's Bookings */}
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">My Bookings</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Ref</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Passenger</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Route</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsLoading ? Array.from({length:5}).map((_,i)=>(
                    <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><Skeleton className="h-4 w-full"/></td></tr>
                  )) : bookings && bookings.length > 0 ? bookings.map(b => {
                    const passengers = (b.passengersInfo as Array<Record<string, string>>) || [];
                    const name = passengers[0] ? `${passengers[0].firstName} ${passengers[0].lastName}` : b.contactEmail;
                    const route = b.flightGroup ? `${b.flightGroup.originCode} → ${b.flightGroup.destinationCode}` : b.package?.name ?? "N/A";
                    return (
                      <tr key={b.id} className="border-b hover:bg-muted/20 transition-colors" data-testid={`row-agent-booking-${b.id}`}>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{b.bookingRef}</td>
                        <td className="px-4 py-3">{name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{route}</td>
                        <td className="px-4 py-3 font-semibold">PKR {Number(b.totalAmount).toLocaleString()}</td>
                        <td className="px-4 py-3">{statusBadge(b.status)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No bookings yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
