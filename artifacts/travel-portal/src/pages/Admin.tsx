import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  useGetAdminStats, getGetAdminStatsQueryKey,
  useListUsers, getListUsersQueryKey,
  useUpdateUser,
  useListAgents, getListAgentsQueryKey,
  useListBookings, getListBookingsQueryKey,
  useListPackages, getListPackagesQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users, Plane, Package, BarChart3, Shield, Plus, Pencil, Trash2, CheckCircle,
  CreditCard, TrendingUp, TrendingDown, DollarSign, Wallet,
} from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    on_hold: "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-blue-100 text-blue-800",
  };
  return <Badge className={`${map[status] || "bg-gray-100 text-gray-800"} border-0 text-xs font-semibold capitalize`}>{status.replace("_", " ")}</Badge>;
}

const API_BASE = "/api";
const getToken = () => localStorage.getItem("token");
async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(options.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

interface PackageFormData {
  name: string; duration: string; type: string; price: string; hotel: string;
  hotelRating: string; airline: string; departureDate: string; returnDate: string;
  seatsAvailable: string; description: string; makkahNights: string; madinahNights: string;
  makkahHotel: string; madinahHotel: string; returnMakkahHotel: string; returnMakkahNights: string;
  flightNumber: string; departureTime: string; arrivalTime: string; inclusions: string;
}

interface FlightFormData {
  flightNumber: string; airline: string; airlineCode: string; origin: string; originCode: string;
  destination: string; destinationCode: string; departureDate: string; departureTime: string;
  arrivalTime: string; seats: string; seatsAvailable: string; price: string; type: string;
  pnr: string; class: string; baggage: string; duration: string;
}

const EMPTY_PKG: PackageFormData = {
  name: "", duration: "21", type: "umrah", price: "", hotel: "", hotelRating: "4",
  airline: "", departureDate: "", returnDate: "", seatsAvailable: "30",
  description: "", makkahNights: "14", madinahNights: "7",
  makkahHotel: "", madinahHotel: "", returnMakkahHotel: "", returnMakkahNights: "7",
  flightNumber: "", departureTime: "", arrivalTime: "", inclusions: "",
};

const EMPTY_FLIGHT: FlightFormData = {
  flightNumber: "", airline: "", airlineCode: "", origin: "Lahore", originCode: "LHE",
  destination: "Jeddah", destinationCode: "JED", departureDate: "", departureTime: "10:00",
  arrivalTime: "13:00", seats: "150", seatsAvailable: "150", price: "", type: "ksa_one_way",
  pnr: "", class: "Economy", baggage: "30 KG", duration: "3h 00m",
};

function PackageForm({ initial, onSave, onClose }: { initial?: PackageFormData; onSave: (d: PackageFormData) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<PackageFormData>(initial ?? EMPTY_PKG);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const set = (k: keyof PackageFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); toast({ title: "Package saved successfully" }); onClose(); }
    catch { toast({ title: "Failed to save package", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs font-semibold">Package Name *</Label>
          <Input value={form.name} onChange={set("name")} placeholder="21 Day Economy Umrah" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Duration (days) *</Label>
          <Select value={form.duration} onValueChange={v => setForm(f => ({ ...f, duration: v }))}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="21">21 Days</SelectItem>
              <SelectItem value="28">28 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Type</Label>
          <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="umrah">Umrah</SelectItem>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Price (PKR) *</Label>
          <Input value={form.price} onChange={set("price")} type="number" placeholder="150000" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Seats Available</Label>
          <Input value={form.seatsAvailable} onChange={set("seatsAvailable")} type="number" className="h-9" />
        </div>

        {/* Flight info */}
        <div className="col-span-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 pt-1 border-t">Flight Details</div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Airline *</Label>
          <Input value={form.airline} onChange={set("airline")} placeholder="PIA / Air Arabia" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Flight Number</Label>
          <Input value={form.flightNumber} onChange={set("flightNumber")} placeholder="PK-301" className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Departure Date *</Label>
          <Input value={form.departureDate} onChange={set("departureDate")} type="date" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Return Date *</Label>
          <Input value={form.returnDate} onChange={set("returnDate")} type="date" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Departure Time</Label>
          <Input value={form.departureTime} onChange={set("departureTime")} placeholder="02:00" className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Arrival Time</Label>
          <Input value={form.arrivalTime} onChange={set("arrivalTime")} placeholder="05:30" className="h-9" />
        </div>

        {/* Hotel info */}
        <div className="col-span-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 pt-1 border-t">Hotel Details</div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Hotel Name (General) *</Label>
          <Input value={form.hotel} onChange={set("hotel")} placeholder="e.g. Hilton Tower" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Hotel Rating (Stars)</Label>
          <Select value={form.hotelRating} onValueChange={v => setForm(f => ({ ...f, hotelRating: v }))}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["3", "4", "5"].map(s => <SelectItem key={s} value={s}>{s} Star</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Leg 1: Makkah */}
        <div className="col-span-2">
          <div className="text-xs font-bold text-[#0d1b3e] uppercase tracking-wider mb-2 pt-1 border-t flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-[#0d1b3e] text-white text-[10px] flex items-center justify-center font-black">1</span>
            1st Stop — Makkah
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Makkah Hotel *</Label>
          <Input value={form.makkahHotel} onChange={set("makkahHotel")} placeholder="Hilton Makkah Convention" className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Makkah Nights</Label>
          <Input value={form.makkahNights} onChange={set("makkahNights")} type="number" className="h-9" />
        </div>

        {/* Leg 2: Madinah */}
        <div className="col-span-2">
          <div className="text-xs font-bold text-[#1a7a4a] uppercase tracking-wider mb-2 pt-1 border-t flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-[#1a7a4a] text-white text-[10px] flex items-center justify-center font-black">2</span>
            2nd Stop — Madinah
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Madinah Hotel *</Label>
          <Input value={form.madinahHotel} onChange={set("madinahHotel")} placeholder="Anwar Al Madinah Mövenpick" className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Madinah Nights</Label>
          <Input value={form.madinahNights} onChange={set("madinahNights")} type="number" className="h-9" />
        </div>

        {/* Leg 3: Return Makkah */}
        <div className="col-span-2">
          <div className="text-xs font-bold text-[#b45309] uppercase tracking-wider mb-2 pt-1 border-t flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-[#b45309] text-white text-[10px] flex items-center justify-center font-black">3</span>
            3rd Stop — Return to Makkah
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Return Makkah Hotel</Label>
          <Input value={form.returnMakkahHotel} onChange={set("returnMakkahHotel")} placeholder="Same or different Makkah hotel" className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Return Makkah Nights</Label>
          <Input value={form.returnMakkahNights} onChange={set("returnMakkahNights")} type="number" className="h-9" />
        </div>

        <div className="col-span-2 space-y-1 pt-1 border-t">
          <Label className="text-xs font-semibold">Description</Label>
          <Textarea value={form.description} onChange={set("description")} rows={2} placeholder="Package details..." className="resize-none" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs font-semibold">Inclusions (one per line)</Label>
          <Textarea value={form.inclusions} onChange={set("inclusions")} rows={3} placeholder="Return Air Ticket&#10;Hotel Accommodation&#10;Ziyarat Tours" className="resize-none" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1 bg-[#0d1b3e] text-white" disabled={saving}>
          {saving ? "Saving..." : <><CheckCircle className="h-4 w-4 mr-1" />Save Package</>}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
}

function FlightForm({ initial, onSave, onClose }: { initial?: FlightFormData; onSave: (d: FlightFormData) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<FlightFormData>(initial ?? EMPTY_FLIGHT);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const set = (k: keyof FlightFormData) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await onSave(form); toast({ title: "Flight saved successfully" }); onClose(); }
    catch { toast({ title: "Failed to save flight", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Flight Type *</Label>
          <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ksa_one_way">KSA One Way</SelectItem>
              <SelectItem value="uae_one_way">UAE One Way</SelectItem>
              <SelectItem value="umrah_ticket">Umrah Ticket</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Flight Number *</Label>
          <Input value={form.flightNumber} onChange={set("flightNumber")} placeholder="PK-301" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Airline *</Label>
          <Input value={form.airline} onChange={set("airline")} placeholder="PIA" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Airline Code *</Label>
          <Input value={form.airlineCode} onChange={set("airlineCode")} placeholder="PK" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Origin City *</Label>
          <Input value={form.origin} onChange={set("origin")} placeholder="Lahore" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Origin Code *</Label>
          <Input value={form.originCode} onChange={set("originCode")} placeholder="LHE" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Destination City *</Label>
          <Input value={form.destination} onChange={set("destination")} placeholder="Jeddah" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Destination Code *</Label>
          <Input value={form.destinationCode} onChange={set("destinationCode")} placeholder="JED" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Departure Date *</Label>
          <Input value={form.departureDate} onChange={set("departureDate")} type="date" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Departure Time *</Label>
          <Input value={form.departureTime} onChange={set("departureTime")} placeholder="10:00" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Arrival Time *</Label>
          <Input value={form.arrivalTime} onChange={set("arrivalTime")} placeholder="13:00" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Duration</Label>
          <Input value={form.duration} onChange={set("duration")} placeholder="3h 00m" className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Total Seats</Label>
          <Input value={form.seats} onChange={set("seats")} type="number" className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Seats Available</Label>
          <Input value={form.seatsAvailable} onChange={set("seatsAvailable")} type="number" className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Price (PKR) *</Label>
          <Input value={form.price} onChange={set("price")} type="number" placeholder="45000" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">PNR *</Label>
          <Input value={form.pnr} onChange={set("pnr")} placeholder="ABC123" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Class</Label>
          <Input value={form.class} onChange={set("class")} placeholder="Economy" className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Baggage Allowance</Label>
          <Input value={form.baggage} onChange={set("baggage")} placeholder="30 KG" className="h-9" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1 bg-[#0d1b3e] text-white" disabled={saving}>
          {saving ? "Saving..." : <><CheckCircle className="h-4 w-4 mr-1" />Save Flight</>}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
}

export default function Admin() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [pkgOpen, setPkgOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<{ id: number; form: PackageFormData } | null>(null);
  const [flightOpen, setFlightOpen] = useState(false);
  const [editFlight, setEditFlight] = useState<{ id: number; form: FlightFormData } | null>(null);
  const [flights, setFlights] = useState<any[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(true);

  const [addPaymentUser, setAddPaymentUser] = useState<{ id: number; name: string; balance: number } | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", type: "credit", description: "" });
  const [savingPayment, setSavingPayment] = useState(false);

  const [ledgerUserId, setLedgerUserId] = useState<number | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [ledgerSummary, setLedgerSummary] = useState<{ totalCredit: number; totalDebit: number; currentBalance: number } | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [addLedgerOpen, setAddLedgerOpen] = useState(false);
  const [ledgerForm, setLedgerForm] = useState({ type: "credit", amount: "", description: "" });
  const [savingLedger, setSavingLedger] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
    if (!authLoading && isAuthenticated && user?.role !== "admin") setLocation("/dashboard");
  }, [isAuthenticated, authLoading, user]);

  useEffect(() => {
    apiFetch("/flights/all-groups").then(setFlights).finally(() => setFlightsLoading(false));
  }, []);

  const refreshFlights = () => {
    setFlightsLoading(true);
    apiFetch("/flights/all-groups").then(setFlights).finally(() => setFlightsLoading(false));
  };

  const fetchLedger = (uid: number) => {
    setLedgerLoading(true);
    Promise.all([
      apiFetch(`/ledger?userId=${uid}`),
      apiFetch(`/ledger/summary?userId=${uid}`),
    ]).then(([e, s]) => { setLedgerEntries(e); setLedgerSummary(s); }).finally(() => setLedgerLoading(false));
  };

  const handleLedgerUserChange = (uid: number) => {
    setLedgerUserId(uid);
    fetchLedger(uid);
  };

  const addLedgerEntry = async () => {
    if (!ledgerUserId || !ledgerForm.amount || !ledgerForm.description) return;
    setSavingLedger(true);
    try {
      await apiFetch("/ledger", {
        method: "POST",
        body: JSON.stringify({ userId: ledgerUserId, type: ledgerForm.type, amount: parseFloat(ledgerForm.amount), description: ledgerForm.description }),
      });
      toast({ title: "Entry added successfully" });
      setAddLedgerOpen(false);
      setLedgerForm({ type: "credit", amount: "", description: "" });
      fetchLedger(ledgerUserId);
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch {
      toast({ title: "Failed to add entry", variant: "destructive" });
    } finally { setSavingLedger(false); }
  };

  const deleteLedgerEntry = async (id: number) => {
    if (!confirm("Delete this ledger entry?")) return;
    try {
      await apiFetch(`/ledger/${id}`, { method: "DELETE" });
      toast({ title: "Entry deleted" });
      if (ledgerUserId) fetchLedger(ledgerUserId);
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  const addPayment = async () => {
    if (!addPaymentUser || !paymentForm.amount || !paymentForm.description) return;
    setSavingPayment(true);
    try {
      await apiFetch("/ledger", {
        method: "POST",
        body: JSON.stringify({ userId: addPaymentUser.id, type: paymentForm.type, amount: parseFloat(paymentForm.amount), description: paymentForm.description }),
      });
      toast({ title: `Payment added to ${addPaymentUser.name}` });
      setAddPaymentUser(null);
      setPaymentForm({ amount: "", type: "credit", description: "" });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch { toast({ title: "Failed to add payment", variant: "destructive" }); }
    finally { setSavingPayment(false); }
  };

  const { data: adminStats, isLoading: statsLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: users, isLoading: usersLoading } = useListUsers({ query: { queryKey: getListUsersQueryKey() } });
  const { data: agents, isLoading: agentsLoading } = useListAgents({ query: { queryKey: getListAgentsQueryKey() } });
  const { data: allBookings, isLoading: bookingsLoading } = useListBookings({}, { query: { queryKey: getListBookingsQueryKey({}) } });
  const { data: packages, isLoading: packagesLoading } = useListPackages({}, { query: { queryKey: getListPackagesQueryKey({}) } });
  const updateUser = useUpdateUser();

  const toggleActive = (id: number, currentActive: boolean) => {
    updateUser.mutate({ id, data: { isActive: !currentActive } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }); toast({ title: "User updated" }); },
    });
  };

  const fmt = (n: number) => `PKR ${n?.toLocaleString("en-PK") ?? "0"}`;

  const savePackage = async (form: PackageFormData, id?: number) => {
    const body = {
      name: form.name, duration: parseInt(form.duration), type: form.type,
      price: parseFloat(form.price), hotel: form.hotel, hotelRating: parseInt(form.hotelRating),
      airline: form.airline, departureDate: form.departureDate, returnDate: form.returnDate,
      seatsAvailable: parseInt(form.seatsAvailable), description: form.description,
      makkahNights: form.makkahNights ? parseInt(form.makkahNights) : undefined,
      madinahNights: form.madinahNights ? parseInt(form.madinahNights) : undefined,
      makkahHotel: form.makkahHotel || undefined,
      madinahHotel: form.madinahHotel || undefined,
      returnMakkahHotel: form.returnMakkahHotel || undefined,
      returnMakkahNights: form.returnMakkahNights ? parseInt(form.returnMakkahNights) : undefined,
      flightNumber: form.flightNumber || undefined,
      departureTime: form.departureTime || undefined,
      arrivalTime: form.arrivalTime || undefined,
      inclusions: form.inclusions.split("\n").filter(Boolean),
    };
    if (id) {
      await apiFetch(`/packages/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    } else {
      await apiFetch("/packages", { method: "POST", body: JSON.stringify(body) });
    }
    queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey({}) });
  };

  const deletePackage = async (id: number) => {
    if (!confirm("Delete this package?")) return;
    try {
      await apiFetch(`/packages/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey({}) });
      toast({ title: "Package deleted" });
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  const saveFlight = async (form: FlightFormData, id?: number) => {
    const body = {
      flightNumber: form.flightNumber, airline: form.airline, airlineCode: form.airlineCode,
      origin: form.origin, originCode: form.originCode, destination: form.destination,
      destinationCode: form.destinationCode, departureDate: form.departureDate,
      departureTime: form.departureTime, arrivalTime: form.arrivalTime, duration: form.duration,
      seats: parseInt(form.seats), seatsAvailable: parseInt(form.seatsAvailable),
      price: parseFloat(form.price), type: form.type, pnr: form.pnr,
      class: form.class, baggage: form.baggage,
    };
    if (id) {
      await apiFetch(`/flights/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    } else {
      await apiFetch("/flights", { method: "POST", body: JSON.stringify(body) });
    }
    refreshFlights();
  };

  const deleteFlight = async (id: number) => {
    if (!confirm("Delete this flight group?")) return;
    try { await apiFetch(`/flights/${id}`, { method: "DELETE" }); refreshFlights(); toast({ title: "Flight deleted" }); }
    catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  const flightTypeBadge = (type: string) => {
    const map: Record<string, string> = { ksa_one_way: "bg-blue-100 text-blue-800", uae_one_way: "bg-purple-100 text-purple-800", umrah_ticket: "bg-green-100 text-green-800" };
    const labels: Record<string, string> = { ksa_one_way: "KSA", uae_one_way: "UAE", umrah_ticket: "Umrah" };
    return <Badge className={`${map[type] || "bg-gray-100 text-gray-800"} border-0 text-xs`}>{labels[type] ?? type}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0d1b3e] flex items-center justify-center">
            <Shield className="h-5 w-5 text-[#f5c842]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Full system management — Bin Yasin Travels</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {statsLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />) : (
            [
              { label: "Total Users", value: adminStats?.totalUsers ?? 0, icon: Users, color: "#1a2e5a" },
              { label: "Agents", value: adminStats?.totalAgents ?? 0, icon: Users, color: "#7c3aed" },
              { label: "Total Bookings", value: adminStats?.totalBookings ?? 0, icon: Package, color: "#0891b2" },
              { label: "Active Flights", value: adminStats?.activeFlights ?? 0, icon: Plane, color: "#d97706" },
              { label: "Packages", value: adminStats?.activePackages ?? 0, icon: Package, color: "#dc2626" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-l-4 overflow-hidden" style={{ borderLeftColor: color }}>
                <CardHeader className="pb-1 pt-3 px-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Icon className="h-3 w-3" style={{ color }} />{label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="text-base font-black">{value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Tabs defaultValue="packages">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="packages" className="flex items-center gap-1.5">
              <Package className="h-4 w-4" /> Packages
            </TabsTrigger>
            <TabsTrigger value="flights" className="flex items-center gap-1.5">
              <Plane className="h-4 w-4" /> Flights & Tickets
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="ledger" className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" /> Ledger
            </TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="bookings">All Bookings</TabsTrigger>
            <TabsTrigger value="performance">
              <BarChart3 className="h-4 w-4 mr-1" /> Performance
            </TabsTrigger>
          </TabsList>

          {/* ── PACKAGES TAB ─────────────────────────────────────────── */}
          <TabsContent value="packages">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Umrah Package Management</CardTitle>
                <Dialog open={pkgOpen} onOpenChange={setPkgOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-[#0d1b3e] text-white hover:bg-[#1a3a7c]">
                      <Plus className="h-4 w-4 mr-1" /> Add Package
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add New Package</DialogTitle></DialogHeader>
                    <PackageForm onSave={(d) => savePackage(d)} onClose={() => setPkgOpen(false)} />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Package</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Duration</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Makkah Hotel</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Madinah Hotel</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Airline</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Price</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Seats</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Departure</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packagesLoading ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b"><td colSpan={9} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
                      )) : packages?.map(p => (
                        <tr key={p.id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-semibold max-w-[140px] truncate">{p.name}</td>
                          <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{p.duration} Days</Badge></td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[120px] truncate">
                            {(p as Record<string, unknown>).makkahHotel as string || p.hotel || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[120px] truncate">
                            {(p as Record<string, unknown>).madinahHotel as string || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs">{p.airline}</td>
                          <td className="px-4 py-3 font-bold text-[#0d1b3e] text-xs">PKR {Number(p.price).toLocaleString()}</td>
                          <td className="px-4 py-3 text-xs">{p.seatsAvailable}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{p.departureDate}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Dialog open={editPkg?.id === p.id} onOpenChange={open => !open && setEditPkg(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditPkg({
                                    id: p.id,
                                    form: {
                                      name: p.name, duration: String(p.duration), type: p.type ?? "umrah",
                                      price: String(p.price), hotel: p.hotel, hotelRating: String(p.hotelRating ?? 4),
                                      airline: p.airline, departureDate: p.departureDate, returnDate: p.returnDate,
                                      seatsAvailable: String(p.seatsAvailable), description: p.description ?? "",
                                      makkahNights: String((p as Record<string, unknown>).makkahNights ?? 14),
                                      madinahNights: String((p as Record<string, unknown>).madinahNights ?? 7),
                                      makkahHotel: ((p as Record<string, unknown>).makkahHotel as string) ?? "",
                                      madinahHotel: ((p as Record<string, unknown>).madinahHotel as string) ?? "",
                                      returnMakkahHotel: ((p as Record<string, unknown>).returnMakkahHotel as string) ?? "",
                                      returnMakkahNights: String((p as Record<string, unknown>).returnMakkahNights ?? ""),
                                      flightNumber: ((p as Record<string, unknown>).flightNumber as string) ?? "",
                                      departureTime: ((p as Record<string, unknown>).departureTime as string) ?? "",
                                      arrivalTime: ((p as Record<string, unknown>).arrivalTime as string) ?? "",
                                      inclusions: (p.inclusions as string[] ?? []).join("\n"),
                                    }
                                  })}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader><DialogTitle>Edit Package</DialogTitle></DialogHeader>
                                  {editPkg && <PackageForm initial={editPkg.form} onSave={(d) => savePackage(d, editPkg.id)} onClose={() => setEditPkg(null)} />}
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deletePackage(p.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── FLIGHTS & TICKETS TAB ─────────────────────────────── */}
          <TabsContent value="flights">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Flight Groups & Umrah Tickets</CardTitle>
                <Dialog open={flightOpen} onOpenChange={setFlightOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-[#0d1b3e] text-white hover:bg-[#1a3a7c]">
                      <Plus className="h-4 w-4 mr-1" /> Add Flight / Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Flight Group / Ticket</DialogTitle></DialogHeader>
                    <FlightForm onSave={(d) => saveFlight(d)} onClose={() => setFlightOpen(false)} />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Flight</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Route</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Time</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Price</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Seats</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flightsLoading ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b"><td colSpan={8} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
                      )) : flights.map(f => (
                        <tr key={f.id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-bold">{f.flightNumber}</td>
                          <td className="px-4 py-3">{flightTypeBadge(f.type)}</td>
                          <td className="px-4 py-3 text-xs font-semibold">{f.originCode} → {f.destinationCode}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{f.departureDate}</td>
                          <td className="px-4 py-3 text-xs">{f.departureTime}</td>
                          <td className="px-4 py-3 font-bold text-[#0d1b3e] text-xs">PKR {Number(f.price).toLocaleString()}</td>
                          <td className="px-4 py-3 text-xs">{f.seatsAvailable}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Dialog open={editFlight?.id === f.id} onOpenChange={open => !open && setEditFlight(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditFlight({
                                    id: f.id,
                                    form: {
                                      flightNumber: f.flightNumber, airline: f.airline, airlineCode: f.airlineCode,
                                      origin: f.origin, originCode: f.originCode, destination: f.destination,
                                      destinationCode: f.destinationCode, departureDate: f.departureDate,
                                      departureTime: f.departureTime, arrivalTime: f.arrivalTime,
                                      seats: String(f.seats), seatsAvailable: String(f.seatsAvailable),
                                      price: String(f.price), type: f.type, pnr: f.pnr,
                                      class: f.class, baggage: f.baggage ?? "", duration: f.duration ?? "",
                                    }
                                  })}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader><DialogTitle>Edit Flight</DialogTitle></DialogHeader>
                                  {editFlight && <FlightForm initial={editFlight.form} onSave={(d) => saveFlight(d, editFlight.id)} onClose={() => setEditFlight(null)} />}
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteFlight(f.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── USERS TAB ─────────────────────────────────────────── */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle className="text-base">User Management</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Role</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Balance</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Joined</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b"><td colSpan={8} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
                      )) : users?.map(u => (
                        <tr key={u.id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-xs text-muted-foreground">#{u.id}</td>
                          <td className="px-4 py-3 font-medium text-sm">{u.name}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="capitalize text-xs">{u.role}</Badge>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold">
                            PKR {Number(u.balance ?? 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs border-0 ${u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toggleActive(u.id, u.isActive)}>
                                {u.isActive ? "Deactivate" : "Activate"}
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => { setAddPaymentUser({ id: u.id, name: u.name, balance: Number(u.balance ?? 0) }); setPaymentForm({ amount: "", type: "credit", description: "" }); }}>
                                <Wallet className="h-3 w-3 mr-1" /> Payment
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── LEDGER TAB ─────────────────────────────────────────── */}
          <TabsContent value="ledger">
            <div className="space-y-4">
              {/* User selector */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-base">Ledger Management</CardTitle>
                    <div className="flex items-center gap-2">
                      <Select
                        value={ledgerUserId ? String(ledgerUserId) : ""}
                        onValueChange={v => handleLedgerUserChange(Number(v))}
                      >
                        <SelectTrigger className="w-56 h-9">
                          <SelectValue placeholder="Select user..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.map(u => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.name} ({u.role}) — PKR {Number(u.balance ?? 0).toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {ledgerUserId && (
                        <Dialog open={addLedgerOpen} onOpenChange={setAddLedgerOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-[#0d1b3e] text-white hover:bg-[#1a3a7c] h-9">
                              <Plus className="h-4 w-4 mr-1" /> Add Entry
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-sm">
                            <DialogHeader><DialogTitle>Add Ledger Entry</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Type</Label>
                                <Select value={ledgerForm.type} onValueChange={v => setLedgerForm(f => ({ ...f, type: v }))}>
                                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="credit">Credit (Money In)</SelectItem>
                                    <SelectItem value="debit">Debit (Money Out)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Amount (PKR) *</Label>
                                <Input type="number" value={ledgerForm.amount}
                                  onChange={e => setLedgerForm(f => ({ ...f, amount: e.target.value }))}
                                  placeholder="50000" className="h-9" />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Description *</Label>
                                <Input value={ledgerForm.description}
                                  onChange={e => setLedgerForm(f => ({ ...f, description: e.target.value }))}
                                  placeholder="Payment received / booking charge" className="h-9" />
                              </div>
                              <Button onClick={addLedgerEntry} disabled={savingLedger || !ledgerForm.amount || !ledgerForm.description}
                                className="w-full bg-[#0d1b3e] hover:bg-[#1a3a7c] text-white">
                                {savingLedger ? "Adding..." : "Add Entry"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {ledgerUserId && (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Total Credit</CardTitle>
                        <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        <div className="text-base font-bold text-green-600">{fmt(ledgerSummary?.totalCredit ?? 0)}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Total Debit</CardTitle>
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        <div className="text-base font-bold text-red-600">{fmt(ledgerSummary?.totalDebit ?? 0)}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-primary">
                      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Balance</CardTitle>
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        <div className={`text-base font-bold ${(ledgerSummary?.currentBalance ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                          {fmt(ledgerSummary?.currentBalance ?? 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Entries table */}
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Transaction History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">#</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Date</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Description</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Credit</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Debit</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Balance</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Del</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ledgerLoading ? (
                              Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b"><td colSpan={7} className="px-4 py-2"><Skeleton className="h-4 w-full" /></td></tr>
                              ))
                            ) : ledgerEntries.length === 0 ? (
                              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No ledger entries for this user</td></tr>
                            ) : ledgerEntries.map((e: any, i: number) => (
                              <tr key={e.id} className="border-b hover:bg-muted/20 text-xs">
                                <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                                <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{new Date(e.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-2 font-medium max-w-[200px] truncate">{e.description}</td>
                                <td className="px-4 py-2 text-right">
                                  {e.type === "credit" ? <span className="text-green-600 font-semibold">{fmt(e.amount)}</span> : "—"}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  {e.type === "debit" ? <span className="text-red-600 font-semibold">{fmt(e.amount)}</span> : "—"}
                                </td>
                                <td className="px-4 py-2 text-right font-bold">{fmt(e.balance)}</td>
                                <td className="px-4 py-2">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => deleteLedgerEntry(e.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!ledgerUserId && (
                <div className="text-center py-16 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <div className="text-sm">Select a user above to view or manage their ledger</div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── AGENTS TAB ─────────────────────────────────────────── */}
          <TabsContent value="agents">
            <Card>
              <CardHeader><CardTitle className="text-base">Agent Management</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Agency</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Phone</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Balance</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentsLoading ? Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
                      )) : agents?.map(a => (
                        <tr key={a.id} className="border-b hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium text-sm">{a.name}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{a.email}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{a.agencyName ?? "—"}</td>
                          <td className="px-4 py-3 text-xs">{a.phone ?? "—"}</td>
                          <td className="px-4 py-3 font-semibold text-sm">PKR {Number(a.balance ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs border-0 ${a.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
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

          {/* ── BOOKINGS TAB ──────────────────────────────────────── */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader><CardTitle className="text-base">All Bookings</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Ref</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Contact</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Route / Package</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Amount</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Payment</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsLoading ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b"><td colSpan={7} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
                      )) : allBookings?.map(b => {
                        const route = b.flightGroup ? `${b.flightGroup.originCode} → ${b.flightGroup.destinationCode}` : b.package?.name ?? "N/A";
                        return (
                          <tr key={b.id} className="border-b hover:bg-muted/20">
                            <td className="px-4 py-3 font-mono text-xs font-bold text-[#0d1b3e]">{b.bookingRef}</td>
                            <td className="px-4 py-3 text-xs">{b.contactEmail}</td>
                            <td className="px-4 py-3 text-xs font-medium">{route}</td>
                            <td className="px-4 py-3 font-semibold text-xs">PKR {Number(b.totalAmount).toLocaleString()}</td>
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

          {/* ── PERFORMANCE TAB ──────────────────────────────────── */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Top Agents Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Agent</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">Bookings</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">Confirmed</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">On Hold</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">Cancelled</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsLoading ? Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
                      )) : adminStats?.topAgents?.map(a => (
                        <tr key={a.agentId} className="border-b hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium text-sm">{a.agentName}</td>
                          <td className="px-4 py-3 text-right font-semibold">{a.totalBookings}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-semibold">{a.confirmedBookings}</td>
                          <td className="px-4 py-3 text-right text-amber-600 font-semibold">{a.onHoldBookings ?? 0}</td>
                          <td className="px-4 py-3 text-right text-red-600 font-semibold">{a.cancelledBookings ?? 0}</td>
                          <td className="px-4 py-3 text-right font-black text-[#0d1b3e]">{fmt(a.totalRevenue)}</td>
                        </tr>
                      )) ?? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No agent data available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── ADD PAYMENT DIALOG ─────────────────────────────────────── */}
      <Dialog open={!!addPaymentUser} onOpenChange={open => !open && setAddPaymentUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" /> Add Payment
            </DialogTitle>
          </DialogHeader>
          {addPaymentUser && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/40 p-3 text-sm">
                <div className="font-semibold">{addPaymentUser.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Current balance: <span className="font-semibold">PKR {addPaymentUser.balance.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Transaction Type</Label>
                <Select value={paymentForm.type} onValueChange={v => setPaymentForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit — Add Funds</SelectItem>
                    <SelectItem value="debit">Debit — Deduct Funds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Amount (PKR) *</Label>
                <Input type="number" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} placeholder="50000" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description *</Label>
                <Input value={paymentForm.description} onChange={e => setPaymentForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Package payment received" className="h-9" />
              </div>
              <div className="flex gap-2">
                <Button onClick={addPayment} disabled={savingPayment || !paymentForm.amount || !paymentForm.description}
                  className="flex-1 bg-[#0d1b3e] hover:bg-[#1a3a7c] text-white">
                  {savingPayment ? "Processing..." : "Confirm Payment"}
                </Button>
                <Button variant="outline" onClick={() => setAddPaymentUser(null)} className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
