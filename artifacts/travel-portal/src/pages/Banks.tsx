import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useListBanks, getListBanksQueryKey, useCreateBankAccount } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Building, Plus, CreditCard } from "lucide-react";

export default function Banks() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: banks, isLoading } = useListBanks({ query: { queryKey: getListBanksQueryKey() } });
  const createBank = useCreateBankAccount();

  const [form, setForm] = useState({ bankName: "", accountName: "", accountNumber: "", accountType: "Current", branchName: "", iban: "" });
  const set = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = () => {
    createBank.mutate({ data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBanksQueryKey() });
        toast({ title: "Bank account added" });
        setOpen(false);
        setForm({ bankName: "", accountName: "", accountNumber: "", accountType: "Current", branchName: "", iban: "" });
      },
      onError: () => toast({ title: "Failed to add bank account", variant: "destructive" }),
    });
  };

  const totalBalance = banks?.reduce((sum, b) => sum + Number(b.balance), 0) ?? 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bank Accounts</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isAdmin ? "Manage agency bank accounts" : "Agency payment accounts"}
            </p>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-bank"><Plus className="h-4 w-4 mr-2" />Add Account</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Bank Account</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label className="text-xs">Bank Name</Label><Input value={form.bankName} onChange={e => set("bankName", e.target.value)} className="mt-1" data-testid="input-bank-name" placeholder="Habib Bank Limited" /></div>
                  <div><Label className="text-xs">Account Name</Label><Input value={form.accountName} onChange={e => set("accountName", e.target.value)} className="mt-1" placeholder="Muhammad Ahmed" /></div>
                  <div><Label className="text-xs">Account Number</Label><Input value={form.accountNumber} onChange={e => set("accountNumber", e.target.value)} className="mt-1 font-mono" /></div>
                  <div><Label className="text-xs">Account Type</Label>
                    <Select value={form.accountType} onValueChange={v => set("accountType", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Current">Current</SelectItem>
                        <SelectItem value="Savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Branch Name (optional)</Label><Input value={form.branchName} onChange={e => set("branchName", e.target.value)} className="mt-1" /></div>
                  <div><Label className="text-xs">IBAN (optional)</Label><Input value={form.iban} onChange={e => set("iban", e.target.value)} className="mt-1 font-mono" /></div>
                  <Button className="w-full" onClick={handleSubmit} disabled={createBank.isPending} data-testid="button-save-bank">
                    {createBank.isPending ? "Saving..." : "Save Account"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Summary — admin only */}
        {isAdmin && (
          <Card className="border-l-4 border-l-primary">
            <CardContent className="flex items-center gap-4 p-4">
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Total Balance Across All Accounts</div>
                <div className="text-2xl font-bold text-primary">PKR {totalBalance.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bank Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)
          ) : banks && banks.length > 0 ? (
            banks.map((bank) => (
              <Card key={bank.id} className="hover:shadow-md transition-shadow" data-testid={`card-bank-${bank.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{bank.bankName}</CardTitle>
                      <p className="text-xs text-muted-foreground">{bank.accountType} Account</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Account Name</div>
                    <div className="font-medium text-sm">{bank.accountName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Account Number</div>
                    <div className="font-mono text-sm">{bank.accountNumber}</div>
                  </div>
                  {bank.iban && <div><div className="text-xs text-muted-foreground">IBAN</div><div className="font-mono text-xs">{bank.iban}</div></div>}
                  {bank.branchName && <div><div className="text-xs text-muted-foreground">Branch</div><div className="text-sm">{bank.branchName}</div></div>}
                  {isAdmin && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground">Balance</div>
                      <div className="text-xl font-bold text-primary">PKR {Number(bank.balance).toLocaleString()}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">No bank accounts added yet</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
