import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const API_BASE = "/api";
function getToken() { return localStorage.getItem("token"); }
async function apiFetch(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

interface LedgerEntry { id: number; userId: number | null; type: string; amount: number; description: string; balance: number; bookingId: number | null; createdAt: string; }
interface LedgerSummary { totalCredit: number; totalDebit: number; currentBalance: number; }

export default function Ledger() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!user) return;
    const uid = user.role !== "admin" ? `?userId=${user.id}` : "";
    Promise.all([
      apiFetch(`/ledger${uid}`),
      apiFetch(`/ledger/summary${uid}`),
    ]).then(([e, s]) => { setEntries(e); setSummary(s); }).finally(() => setLoading(false));
  }, [user]);

  const fmt = (n: number) => `PKR ${n?.toLocaleString("en-PK") ?? "0"}`;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Ledger</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user?.role === "admin" ? "Full ledger — all accounts" : "Your personal transaction history"}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />) : (
            <>
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent><div className="text-xl font-bold text-green-600">{fmt(summary?.totalCredit ?? 0)}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Debit</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent><div className="text-xl font-bold text-red-600">{fmt(summary?.totalDebit ?? 0)}</div></CardContent>
              </Card>
              <Card className={`border-l-4 ${(summary?.currentBalance ?? 0) >= 0 ? "border-l-primary" : "border-l-destructive"}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className={`text-xl font-bold ${(summary?.currentBalance ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                    {fmt(summary?.currentBalance ?? 0)}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Ledger Table */}
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Transaction History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Description</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Credit</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Debit</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
                    ))
                  ) : entries.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No transactions yet</td></tr>
                  ) : (
                    entries.map((e, i) => (
                      <tr key={e.id} className="border-b hover:bg-muted/20 transition-colors group">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(e.createdAt).toLocaleDateString()}<br />
                          <span className="text-[10px]">{new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          <div className="font-medium text-sm leading-tight">{e.description}</div>
                          {e.bookingId && <div className="text-xs text-muted-foreground mt-0.5">Booking #{e.bookingId}</div>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {e.type === "credit" ? (
                            <Badge className="bg-green-100 text-green-800 border-0 font-semibold">{fmt(e.amount)}</Badge>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {e.type === "debit" ? (
                            <Badge className="bg-red-100 text-red-800 border-0 font-semibold">{fmt(e.amount)}</Badge>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">{fmt(e.balance)}</td>
                      </tr>
                    ))
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
