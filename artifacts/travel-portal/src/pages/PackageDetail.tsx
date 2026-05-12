import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetPackage, getGetPackageQueryKey, useCreateBooking, useHoldBooking, getListBookingsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plane, Hotel, Calendar, Check, Plus, Minus, Star, Clock } from "lucide-react";

interface Passenger { firstName: string; lastName: string; passportNumber: string; nationality: string; dateOfBirth: string; gender: string; }

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: pkg, isLoading } = useGetPackage(Number(id), { query: { queryKey: getGetPackageQueryKey(Number(id)) } });
  const createBooking = useCreateBooking();
  const holdBooking = useHoldBooking();

  const [passengers, setPassengers] = useState<Passenger[]>([{ firstName: "", lastName: "", passportNumber: "", nationality: "Pakistani", dateOfBirth: "", gender: "male" }]);
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [holdCountdown, setHoldCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (holdCountdown !== null && holdCountdown > 0) {
      const timer = setInterval(() => setHoldCountdown(c => c !== null ? c - 1 : null), 1000);
      return () => clearInterval(timer);
    }
  }, [holdCountdown]);

  const addPassenger = () => setPassengers(p => [...p, { firstName: "", lastName: "", passportNumber: "", nationality: "Pakistani", dateOfBirth: "", gender: "male" }]);
  const removePassenger = (i: number) => setPassengers(p => p.filter((_, idx) => idx !== i));
  const updatePassenger = (i: number, field: keyof Passenger, val: string) => setPassengers(p => p.map((pass, idx) => idx === i ? { ...pass, [field]: val } : pass));

  const handleBook = (onHold: boolean) => {
    const bookingData = { packageId: Number(id), flightGroupId: null, passengersInfo: passengers, contactEmail, contactPhone, paymentMethod };
    createBooking.mutate({ data: bookingData }, {
      onSuccess: (booking) => {
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        if (onHold) {
          holdBooking.mutate({ id: booking.id }, {
            onSuccess: () => {
              setHoldCountdown(7200);
              toast({ title: "Booking placed on hold", description: "You have 2 hours to confirm" });
            }
          });
        } else {
          toast({ title: "Booking confirmed!", description: `Booking ref: ${booking.bookingRef}` });
          setLocation("/bookings");
        }
      },
      onError: () => toast({ title: "Booking failed", variant: "destructive" }),
    });
  };

  const fmtCountdown = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (isLoading) return <Layout><div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-64" /></div></Layout>;
  if (!pkg) return <Layout><div className="text-center py-12">Package not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Package Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <Badge className="mb-2 bg-primary text-primary-foreground">{pkg.duration} Days Umrah</Badge>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">PKR {Number(pkg.price).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">per person</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">{pkg.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm"><Hotel className="h-4 w-4 text-primary" /><span>{pkg.hotel}</span></div>
              {pkg.hotelRating && <div className="flex items-center gap-1">{Array.from({ length: pkg.hotelRating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>}
              <div className="flex items-center gap-2 text-sm"><Plane className="h-4 w-4 text-primary" /><span>{pkg.airline}</span></div>
              <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-primary" /><span>{pkg.departureDate}</span></div>
            </div>
            {pkg.makkahNights && pkg.madinahNights && (
              <div className="flex gap-2">
                <Badge variant="outline">{pkg.makkahNights} Nights Makkah</Badge>
                <Badge variant="outline">{pkg.madinahNights} Nights Madinah</Badge>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-sm mb-2">Inclusions</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {(pkg.inclusions as string[]).map((inc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-green-500" />{inc}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passengers */}
            {passengers.map((p, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Passenger {i + 1}</h3>
                  {i > 0 && <Button variant="outline" size="sm" onClick={() => removePassenger(i)}><Minus className="h-3 w-3" /></Button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">First Name</Label><Input value={p.firstName} onChange={e => updatePassenger(i, "firstName", e.target.value)} className="mt-1" data-testid={`input-firstname-${i}`} /></div>
                  <div><Label className="text-xs">Last Name</Label><Input value={p.lastName} onChange={e => updatePassenger(i, "lastName", e.target.value)} className="mt-1" data-testid={`input-lastname-${i}`} /></div>
                  <div><Label className="text-xs">Passport Number</Label><Input value={p.passportNumber} onChange={e => updatePassenger(i, "passportNumber", e.target.value)} className="mt-1" data-testid={`input-passport-${i}`} /></div>
                  <div><Label className="text-xs">Nationality</Label><Input value={p.nationality} onChange={e => updatePassenger(i, "nationality", e.target.value)} className="mt-1" data-testid={`input-nationality-${i}`} /></div>
                  <div><Label className="text-xs">Date of Birth</Label><Input type="date" value={p.dateOfBirth} onChange={e => updatePassenger(i, "dateOfBirth", e.target.value)} className="mt-1" data-testid={`input-dob-${i}`} /></div>
                  <div><Label className="text-xs">Gender</Label>
                    <Select value={p.gender} onValueChange={v => updatePassenger(i, "gender", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addPassenger} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Passenger</Button>

            {/* Contact & Payment */}
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Contact Email</Label><Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="mt-1" data-testid="input-contact-email" /></div>
              <div><Label className="text-xs">Contact Phone</Label><Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="mt-1" data-testid="input-contact-phone" /></div>
              <div><Label className="text-xs">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Total */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex justify-between font-semibold">
                <span>Total Amount ({passengers.length} pax)</span>
                <span className="text-primary text-lg">PKR {(Number(pkg.price) * passengers.length).toLocaleString()}</span>
              </div>
            </div>

            {holdCountdown !== null && holdCountdown > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="text-amber-800 font-semibold">On Hold — Time remaining: {fmtCountdown(holdCountdown)}</span>
                <Badge className="ml-auto bg-amber-500 text-white border-0">ON HOLD</Badge>
              </div>
            )}

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => handleBook(false)} disabled={createBooking.isPending} data-testid="button-book-now">
                {createBooking.isPending ? "Processing..." : "Book Now"}
              </Button>
              <Button variant="outline" className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-50" onClick={() => handleBook(true)} disabled={createBooking.isPending} data-testid="button-on-hold">
                <Clock className="h-4 w-4 mr-2" />On Hold (2hr)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
