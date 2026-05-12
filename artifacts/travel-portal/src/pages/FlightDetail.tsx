import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetKsaGroup, getGetKsaGroupQueryKey,
  useGetUaeGroup, getGetUaeGroupQueryKey,
  useCreateBooking, useHoldBooking, getListBookingsQueryKey,
} from "@workspace/api-client-react";
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
import { Plane, Clock, Luggage, Plus, Minus, CheckCircle } from "lucide-react";

type FlightType = "ksa" | "uae";

interface Passenger { firstName: string; lastName: string; passportNumber: string; nationality: string; dateOfBirth: string; gender: string; }

export function FlightDetail({ type }: { type: FlightType }) {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const ksaQuery = useGetKsaGroup(Number(id), { query: { queryKey: getGetKsaGroupQueryKey(Number(id)), enabled: type === "ksa" } });
  const uaeQuery = useGetUaeGroup(Number(id), { query: { queryKey: getGetUaeGroupQueryKey(Number(id)), enabled: type === "uae" } });
  const { data: flight, isLoading } = type === "ksa" ? ksaQuery : uaeQuery;

  const createBooking = useCreateBooking();
  const holdBooking = useHoldBooking();

  const [passengers, setPassengers] = useState<Passenger[]>([{ firstName: "", lastName: "", passportNumber: "", nationality: "Pakistani", dateOfBirth: "", gender: "male" }]);
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [holdCountdown, setHoldCountdown] = useState<number | null>(null);
  const [bookedRef, setBookedRef] = useState<string | null>(null);

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
    const bookingData = { flightGroupId: Number(id), packageId: null, passengersInfo: passengers, contactEmail, contactPhone, paymentMethod };
    createBooking.mutate({ data: bookingData }, {
      onSuccess: (booking) => {
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        setBookedRef(booking.bookingRef);
        if (onHold) {
          holdBooking.mutate({ id: booking.id }, {
            onSuccess: () => {
              setHoldCountdown(7200);
              toast({ title: "On Hold!", description: `Booking ${booking.bookingRef} held for 2 hours` });
            }
          });
        } else {
          toast({ title: "Booking Confirmed!", description: `Ref: ${booking.bookingRef}` });
          setTimeout(() => setLocation("/bookings"), 1500);
        }
      },
      onError: () => toast({ title: "Booking failed", variant: "destructive" }),
    });
  };

  const fmtCountdown = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (isLoading) return <Layout><div className="space-y-4">{Array.from({length: 3}).map((_,i)=><Skeleton key={i} className="h-32"/>)}</div></Layout>;
  if (!flight) return <Layout><div className="text-center py-12">Flight not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Flight Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <Badge variant="outline" className="mb-2">{flight.type.replace("_", " ").toUpperCase()}</Badge>
                <CardTitle className="text-xl">{flight.airline} — {flight.flightNumber}</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">PNR: <span className="font-mono font-semibold">{flight.pnr}</span></p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">PKR {Number(flight.price).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">per person</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{flight.departureTime}</div>
                <div className="text-lg font-semibold text-primary">{flight.originCode}</div>
                <div className="text-sm text-muted-foreground">{flight.origin}</div>
              </div>
              <div className="flex-1 flex flex-col items-center text-sm text-muted-foreground">
                <span>{flight.duration}</span>
                <div className="w-full flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-border" />
                  <Plane className="h-4 w-4 text-primary" />
                  <div className="flex-1 h-px bg-border" />
                </div>
                <span>{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}</span>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{flight.arrivalTime}</div>
                <div className="text-lg font-semibold text-primary">{flight.destinationCode}</div>
                <div className="text-sm text-muted-foreground">{flight.destination}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm border-t pt-4">
              <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{flight.departureDate}</div>
              <Badge variant="outline">{flight.class}</Badge>
              {flight.baggage && <div className="flex items-center gap-1 text-muted-foreground"><Luggage className="h-4 w-4" />{flight.baggage}</div>}
              <Badge className="bg-muted text-muted-foreground border-0">{flight.seatsAvailable} seats available</Badge>
              {flight.aircraft && <span className="text-muted-foreground text-xs">{flight.aircraft}</span>}
              {flight.refundable && <Badge className="bg-green-100 text-green-800 border-0">Refundable</Badge>}
              {flight.meal && <Badge className="bg-blue-100 text-blue-800 border-0">Meal Included</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader><CardTitle className="text-base">Passenger Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
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
                  <div><Label className="text-xs">Nationality</Label><Input value={p.nationality} onChange={e => updatePassenger(i, "nationality", e.target.value)} className="mt-1" /></div>
                  <div><Label className="text-xs">Date of Birth</Label><Input type="date" value={p.dateOfBirth} onChange={e => updatePassenger(i, "dateOfBirth", e.target.value)} className="mt-1" /></div>
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

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex justify-between font-semibold">
                <span>Total ({passengers.length} passenger{passengers.length > 1 ? "s" : ""})</span>
                <span className="text-primary text-lg">PKR {(Number(flight.price) * passengers.length).toLocaleString()}</span>
              </div>
            </div>

            {holdCountdown !== null && holdCountdown > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <span className="text-amber-800 font-semibold">ON HOLD</span>
                  <span className="text-amber-700 ml-2">Time remaining: {fmtCountdown(holdCountdown)}</span>
                </div>
                <Badge className="ml-auto bg-amber-500 text-white border-0">ON HOLD</Badge>
              </div>
            )}

            {bookedRef && !holdCountdown && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-semibold">Confirmed! Ref: {bookedRef}</span>
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
