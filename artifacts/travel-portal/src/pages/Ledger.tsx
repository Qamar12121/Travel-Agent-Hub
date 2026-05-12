import { useEffect } from "react";
import { useLocation } from "wouter";
import { useListLedger, getListLedgerQueryKey, useGetLedgerSummary, getGetLedgerSummaryQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function Ledger() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: entries, isLoading } = useListLedger({}, { query: { queryKey: getListLedgerQueryKey({}) } });
  const { data: summary, isLoading: summaryLoading } = useGetLedgerSummary({ query: { queryKey: getGetLedgerSummaryQueryKey() } });

  const fmt = (n: number) => `PKR ${n?.toLocaleString("en-PK") ?? "0"}`;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Ledger</h1>
          <p className="text-muted-foreground text-sm mt-1">Full transaction history and account balance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryLoading ? Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-24"/>) : (
            <>
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent><div className="text-xl font-bold text-green-600" data-testid="stat-total-credit">{fmt(summary?.totalCredit ?? 0)}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Debit</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent><div className="text-xl font-bold text-red-600" data-testid="stat-total-debit">{fmt(summary?.totalDebit ?? 0)}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent><div className="text-xl font-bold text-primary" data-testid="stat-balance">{fmt(summary?.currentBalance ?? 0)}</div></CardContent>
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
                  {isLoading ? (
                    Array.from({length:8}).map((_,i)=>(
                      <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><Skeleton className="h-4 w-full"/></td></tr>
                    ))
                  ) : entries && entries.length > 0 ? (
                    entries.map((entry, idx) => (
                      <tr key={entry.id} className="border-b hover:bg-muted/20 transition-colors" data-testid={`row-ledger-${entry.id}`}>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{entry.description}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          {entry.type === "credit" ? `PKR ${Number(entry.amount).toLocaleString()}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {entry.type === "debit" ? `PKR ${Number(entry.amount).toLocaleString()}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">PKR {Number(entry.balance).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No transactions yet</td></tr>
                  )}
                </tbody>
                {entries && entries.length > 0 && summary && (
                  <tfoot>
                    <tr className="bg-muted/30 font-bold border-t-2">
                      <td colSpan={3} className="px-4 py-3">Totals</td>
                      <td className="px-4 py-3 text-right text-green-600">PKR {(summary.totalCredit).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-600">PKR {(summary.totalDebit).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-primary">PKR {(summary.currentBalance).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
