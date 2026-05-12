import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRecentBookings, getGetRecentBookingsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Plane, Users, TrendingUp, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: color }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4" style={{ color }} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    on_hold: "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-blue-100 text-blue-800",
  };
  return <Badge className={`${map[status] || "bg-gray-100 text-gray-800"} border-0 text-xs font-semibold capitalize`}>{status.replace("_", " ")}</Badge>;
}

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: recentBookings, isLoading: bookingsLoading } = useGetRecentBookings({ query: { queryKey: getGetRecentBookingsQueryKey() } });

  const fmt = (n: number) => n?.toLocaleString("en-PK") ?? "0";

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your travel portal activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} icon={Plane} color="#1e3a6e" />
              <StatCard title="Confirmed" value={stats?.confirmedBookings ?? 0} icon={CheckCircle} color="#16a34a" />
              <StatCard title="On Hold" value={stats?.onHoldBookings ?? 0} icon={Clock} color="#d97706" />
              <StatCard title="Cancelled" value={stats?.cancelledBookings ?? 0} icon={XCircle} color="#dc2626" />
              <StatCard title="Total Revenue" value={`PKR ${fmt(stats?.totalRevenue ?? 0)}`} icon={DollarSign} color="#7c3aed" />
              <StatCard title="Monthly Revenue" value={`PKR ${fmt(stats?.monthlyRevenue ?? 0)}`} icon={TrendingUp} color="#0891b2" />
              <StatCard title="Total Passengers" value={stats?.totalPassengers ?? 0} icon={Users} color="#059669" />
              <StatCard title="Pending Amount" value={`PKR ${fmt(stats?.pendingAmount ?? 0)}`} icon={Clock} color="#ea580c" />
            </>
          )}
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Booking Ref</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Passenger</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Route</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td colSpan={6} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      </tr>
                    ))
                  ) : recentBookings && recentBookings.length > 0 ? (
                    recentBookings.map((b) => {
                      const passengers = (b.passengersInfo as Array<Record<string, string>>) || [];
                      const name = passengers[0] ? `${passengers[0].firstName} ${passengers[0].lastName}` : b.contactEmail;
                      const route = b.flightGroup ? `${b.flightGroup.origin} → ${b.flightGroup.destination}` : b.package?.name ?? "N/A";
                      return (
                        <tr key={b.id} className="border-b hover:bg-muted/20 transition-colors" data-testid={`row-booking-${b.id}`}>
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{b.bookingRef}</td>
                          <td className="px-4 py-3">{name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{route}</td>
                          <td className="px-4 py-3 font-semibold">PKR {Number(b.totalAmount).toLocaleString()}</td>
                          <td className="px-4 py-3">{statusBadge(b.status)}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No bookings yet</td></tr>
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
