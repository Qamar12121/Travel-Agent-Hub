import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { Clock, FileText, Filter } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    on_hold: "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-blue-100 text-blue-800",
  };
  return <Badge className={`${map[status] || "bg-gray-100 text-gray-800"} border-0 text-xs font-semibold capitalize`}>{status.replace("_", " ")}</Badge>;
}

function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);
  const h = Math.floor(remaining / 3600);
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  return <span className="text-amber-700 font-mono text-xs flex items-center gap-1"><Clock className="h-3 w-3" />{remaining > 0 ? `${h}:${m}:${s}` : "EXPIRED"}</span>;
}

export default function Bookings() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const params = statusFilter !== "all" ? { status: statusFilter } : {};
  const { data: bookings, isLoading } = useListBookings(params, { query: { queryKey: getListBookingsQueryKey(params) } });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all your travel bookings</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Filter className="h-4 w-4" />Filter Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44" data-testid="filter-status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Ref</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Passenger / Contact</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Route / Package</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td colSpan={7} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      </tr>
                    ))
                  ) : bookings && bookings.length > 0 ? (
                    bookings.map((b) => {
                      const passengers = (b.passengersInfo as Array<Record<string, string>>) || [];
                      const name = passengers[0] ? `${passengers[0].firstName} ${passengers[0].lastName}` : b.contactEmail;
                      const route = b.flightGroup
                        ? `${b.flightGroup.origin} → ${b.flightGroup.destination}`
                        : b.package?.name ?? "N/A";
                      return (
                        <tr key={b.id} className="border-b hover:bg-muted/20 transition-colors" data-testid={`row-booking-${b.id}`}>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{b.bookingRef}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{name}</div>
                            <div className="text-xs text-muted-foreground">{b.contactPhone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div>{route}</div>
                            {b.flightGroup && <div className="text-xs text-muted-foreground">{b.flightGroup.airline} · {b.flightGroup.flightNumber}</div>}
                          </td>
                          <td className="px-4 py-3 font-semibold">PKR {Number(b.totalAmount).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {statusBadge(b.status)}
                              {b.status === "on_hold" && b.holdExpiresAt && (
                                <HoldCountdown expiresAt={b.holdExpiresAt} />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <Link href={`/bookings/${b.id}`}>
                              <Button variant="outline" size="sm" data-testid={`button-view-booking-${b.id}`}>
                                <FileText className="h-3 w-3 mr-1" />View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No bookings found</td></tr>
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
