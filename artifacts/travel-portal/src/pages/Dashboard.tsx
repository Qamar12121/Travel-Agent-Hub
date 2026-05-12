import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRecentBookings, getGetRecentBookingsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import {
  Plane, Users, TrendingUp, Clock, CheckCircle, XCircle,
  DollarSign, Briefcase, ArrowRight, Star, Gem,
  Building, CreditCard, BookOpen,
} from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    on_hold: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return (
    <Badge className={`${map[status] || "bg-gray-100 text-gray-800"} border-0 text-xs font-bold capitalize`}>
      {status.replace("_", " ")}
    </Badge>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  subtext?: string;
  trend?: string;
}

function StatCard({ title, value, icon: Icon, gradient, subtext, trend }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} text-white p-5 shadow-lg group hover:-translate-y-1 transition-transform duration-300`}>
      <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="h-11 w-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend && (
            <div className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{trend}</div>
          )}
        </div>
        <div className="text-3xl font-black leading-none" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
          {value}
        </div>
        <div className="text-white/70 text-sm mt-1.5 font-medium">{title}</div>
        {subtext && <div className="text-white/40 text-xs mt-1">{subtext}</div>}
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  { label: "Umrah Packages", icon: Briefcase, href: "/umrah-packages", img: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&q=80", desc: "Browse all packages" },
  { label: "KSA Flights", icon: Plane, href: "/ksa-groups", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80", desc: "One-way group flights" },
  { label: "My Bookings", icon: BookOpen, href: "/bookings", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80", desc: "View & manage bookings" },
  { label: "Bank Accounts", icon: Building, href: "/banks", img: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=400&q=80", desc: "Payment & accounts" },
];

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: recentBookings, isLoading: bookingsLoading } = useGetRecentBookings({ query: { queryKey: getGetRecentBookingsQueryKey() } });

  const fmt = (n: number) => n?.toLocaleString("en-PK") ?? "0";
  const isAdmin = user?.role === "admin";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout>
      <div className="space-y-8 pb-8">

        {/* ── WELCOME HERO BANNER ────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: 200 }}>
          <img
            src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&q=80"
            alt="Kaaba Makkah"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b3e]/95 via-[#0d1b3e]/80 to-[#0d1b3e]/50" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5c842] to-transparent" />

          <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-[#f5c842]/60 text-sm mb-1">{greeting()},</div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {user?.name || "Welcome Back"} <span className="text-[#f5c842]">👋</span>
              </h1>
              {user?.agencyName && (
                <div className="flex items-center gap-2 mt-2">
                  <Building className="h-4 w-4 text-white/40" />
                  <span className="text-white/60 text-sm">{user.agencyName}</span>
                </div>
              )}
              <div className="flex items-center gap-3 mt-4">
                <Badge className="bg-[#f5c842]/20 text-[#f5c842] border-[#f5c842]/30 capitalize font-bold">
                  <Gem className="h-3 w-3 mr-1" /> {user?.role}
                </Badge>
                <span className="text-white/40 text-xs">· Bin Yasin Travels Portal</span>
              </div>
            </div>

            <div className="flex-shrink-0 hidden md:block text-right">
              <div className="text-4xl text-[#f5c842]/30 font-serif leading-none mb-1">
                لَبَّيْكَ اللَّهُمَّ
              </div>
              <div className="text-white/30 text-xs">Talbiyah</div>
            </div>
          </div>
        </div>

        {/* ── STATS GRID ────────────────────────────────────────── */}
        {isAdmin && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-black">Live Statistics</h2>
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statsLoading ? (
                Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
              ) : (
                <>
                  <StatCard title="Total Bookings" value={fmt(stats?.totalBookings ?? 0)} icon={Plane}
                    gradient="bg-gradient-to-br from-[#0d1b3e] via-[#12255a] to-[#1a3a7c]" trend="All Time" />
                  <StatCard title="Confirmed" value={fmt(stats?.confirmedBookings ?? 0)} icon={CheckCircle}
                    gradient="bg-gradient-to-br from-emerald-700 to-emerald-500" subtext="Successfully booked" />
                  <StatCard title="On Hold" value={fmt(stats?.onHoldBookings ?? 0)} icon={Clock}
                    gradient="bg-gradient-to-br from-amber-600 to-amber-400" subtext="2hr hold active" />
                  <StatCard title="Cancelled" value={fmt(stats?.cancelledBookings ?? 0)} icon={XCircle}
                    gradient="bg-gradient-to-br from-red-700 to-red-500" subtext="Refund eligible" />
                  <StatCard title="Total Revenue" value={`PKR ${fmt(stats?.totalRevenue ?? 0)}`} icon={DollarSign}
                    gradient="bg-gradient-to-br from-violet-700 to-violet-500" subtext="All-time earnings" />
                  <StatCard title="Monthly Revenue" value={`PKR ${fmt(stats?.monthlyRevenue ?? 0)}`} icon={TrendingUp}
                    gradient="bg-gradient-to-br from-cyan-700 to-cyan-500" subtext="This month" trend="↑ Live" />
                  <StatCard title="Total Passengers" value={fmt(stats?.totalPassengers ?? 0)} icon={Users}
                    gradient="bg-gradient-to-br from-teal-700 to-teal-500" subtext="Pilgrims served" />
                  <StatCard title="Pending Amount" value={`PKR ${fmt(stats?.pendingAmount ?? 0)}`} icon={CreditCard}
                    gradient="bg-gradient-to-br from-orange-600 to-orange-400" subtext="Awaiting payment" />
                </>
              )}
            </div>
          </div>
        )}

        {/* ── QUICK NAVIGATION WITH IMAGES ─────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-black">Quick Access</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map(({ label, icon: Icon, href, img, desc }) => (
              <Link key={label} href={href}>
                <div className="group rounded-2xl border overflow-hidden bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="relative h-32 overflow-hidden">
                    <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className="h-8 w-8 bg-[#f5c842] rounded-lg flex items-center justify-center shadow-lg">
                        <Icon className="h-4 w-4 text-[#0d1b3e]" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-black text-sm">{label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── RECENT BOOKINGS TABLE ─────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-black">Recent Bookings</h2>
            <div className="h-px flex-1 bg-border" />
            <Link href="/bookings">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <Card className="rounded-2xl overflow-hidden border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#0d1b3e]/5 to-transparent dark:from-[#f5c842]/5 border-b">
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Ref</th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Passenger</th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">Route</th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td colSpan={6} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                      </tr>
                    ))
                  ) : recentBookings && recentBookings.length > 0 ? (
                    recentBookings.map((b) => {
                      const passengers = (b.passengersInfo as Array<Record<string, string>>) || [];
                      const name = passengers[0] ? `${passengers[0].firstName} ${passengers[0].lastName}` : b.contactEmail;
                      const route = b.flightGroup ? `${b.flightGroup.origin} → ${b.flightGroup.destination}` : b.package?.name ?? "N/A";
                      return (
                        <tr key={b.id} className="border-b hover:bg-muted/30 transition-colors group" data-testid={`row-booking-${b.id}`}>
                          <td className="px-5 py-4">
                            <span className="font-mono font-black text-xs text-[#0d1b3e] dark:text-[#f5c842] bg-[#0d1b3e]/5 dark:bg-[#f5c842]/10 px-2 py-1 rounded-lg">
                              {b.bookingRef}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0d1b3e] to-[#1a3a7c] flex items-center justify-center text-[#f5c842] text-xs font-black flex-shrink-0">
                                {name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <span className="font-semibold text-sm">{name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground text-sm hidden md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <Plane className="h-3.5 w-3.5 text-muted-foreground/50" />
                              {route}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-black text-sm">
                            PKR {Number(b.totalAmount).toLocaleString()}
                          </td>
                          <td className="px-5 py-4">{statusBadge(b.status)}</td>
                          <td className="px-5 py-4 text-muted-foreground text-xs hidden lg:table-cell">
                            {new Date(b.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="space-y-3">
                          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                            <BookOpen className="h-7 w-7 text-muted-foreground/40" />
                          </div>
                          <div className="text-muted-foreground font-semibold">No bookings yet</div>
                          <Link href="/umrah-packages">
                            <Button size="sm" className="bg-[#0d1b3e] text-white hover:bg-[#1a3a7c] rounded-xl">
                              Browse Packages <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── PROMOTIONS BANNER ─────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1593267942959-f14e3a8caa18?w=1200&q=80"
            alt="Madinah"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b3e]/95 to-[#0d1b3e]/70" />
          <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-[#f5c842] fill-[#f5c842]" />
                <span className="text-[#f5c842] text-xs font-black uppercase tracking-widest">Special Offer</span>
              </div>
              <h3 className="text-white font-black text-2xl mb-2">2026 Umrah Season Now Open</h3>
              <p className="text-white/60 text-sm">Early-bird packages available. Secure your spot at special rates before they fill up.</p>
            </div>
            <Link href="/umrah-packages" className="flex-shrink-0">
              <Button className="bg-[#f5c842] text-[#0d1b3e] hover:bg-[#e5b832] font-black h-12 px-8 rounded-xl shadow-xl whitespace-nowrap">
                View Packages <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </Layout>
  );
}
