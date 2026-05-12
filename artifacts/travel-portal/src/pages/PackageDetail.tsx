import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
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
import { Plane, Hotel, Calendar, Check, Plus, Minus, Star, Clock, MapPin, Moon, Printer } from "lucide-react";

const AIRLINE_LOGOS: Record<string, string> = {
  "PIA": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Pakistan_International_Airlines_logo.svg",
  "Emirates": "https://upload.wikimedia.org/wikipedia/en/4/4f/Emirates_logo.svg",
  "Qatar Airways": "https://upload.wikimedia.org/wikipedia/commons/7/79/Qatar_airways_logo.svg",
  "Etihad": "https://upload.wikimedia.org/wikipedia/commons/4/49/Etihad-airways-logo.svg",
  "Air Arabia": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Air_Arabia_logo.svg",
  "Turkish Airlines": "https://upload.wikimedia.org/wikipedia/commons/b/b6/Turkish_Airlines_logo_2019_compact.svg",
  "Saudi Airlines": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Saudia_Logo.svg",
  "Saudia": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Saudia_Logo.svg",
  "flydubai": "https://upload.wikimedia.org/wikipedia/commons/7/70/Flydubai_logo.svg",
  "Flydubai": "https://upload.wikimedia.org/wikipedia/commons/7/70/Flydubai_logo.svg",
};

interface Passenger {
  firstName: string; lastName: string; passportNumber: string;
  nationality: string; dateOfBirth: string; gender: string;
}

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
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  useEffect(() => {
    if (holdCountdown !== null && holdCountdown > 0) {
      const timer = setInterval(() => setHoldCountdown(c => c !== null ? c - 1 : null), 1000);
      return () => clearInterval(timer);
    }
  }, [holdCountdown]);

  const addPassenger = () => setPassengers(p => [...p, { firstName: "", lastName: "", passportNumber: "", nationality: "Pakistani", dateOfBirth: "", gender: "male" }]);
  const removePassenger = (i: number) => setPassengers(p => p.filter((_, idx) => idx !== i));
  const updatePassenger = (i: number, field: keyof Passenger, val: string) =>
    setPassengers(p => p.map((pass, idx) => idx === i ? { ...pass, [field]: val } : pass));

  const handleBook = (onHold: boolean) => {
    const bookingData = { packageId: Number(id), flightGroupId: null, passengersInfo: passengers, contactEmail, contactPhone, paymentMethod };
    createBooking.mutate({ data: bookingData }, {
      onSuccess: (booking) => {
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        setCreatedBookingId(booking.id);
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

  const fmtCountdown = (s: number) =>
    `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (isLoading) return <Layout><div className="space-y-4"><Skeleton className="h-64" /><Skeleton className="h-80" /></div></Layout>;
  if (!pkg) return <Layout><div className="text-center py-12">Package not found</div></Layout>;

  const makkahHotel = (pkg as Record<string, unknown>).makkahHotel as string | null || pkg.hotel;
  const madinahHotel = (pkg as Record<string, unknown>).madinahHotel as string | null || "Madinah Hotel";
  const airlineLogo = AIRLINE_LOGOS[pkg.airline];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Package Overview Card */}
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#0d1b3e] to-[#1a3a7c]" />
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <Badge className="mb-2 bg-[#0d1b3e] text-white">{pkg.duration} Days Umrah Package</Badge>
                <CardTitle className="text-xl font-black">{pkg.name}</CardTitle>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-primary">PKR {Number(pkg.price).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">per person</div>
                {pkg.seatsAvailable <= 10 && (
                  <Badge variant="outline" className="text-xs text-red-600 border-red-300 mt-1">Only {pkg.seatsAvailable} seats left!</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-muted-foreground text-sm leading-relaxed">{pkg.description}</p>

            {/* Airline & Dates */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border col-span-2 md:col-span-1">
                <Plane className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  {airlineLogo && (
                    <img
                      src={airlineLogo}
                      alt={pkg.airline}
                      className="h-5 max-w-[70px] object-contain mb-1"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="text-xs font-semibold">{pkg.airline}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Departure</div>
                  <div className="text-xs font-bold">{pkg.departureDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Return</div>
                  <div className="text-xs font-bold">{pkg.returnDate}</div>
                </div>
              </div>
              {pkg.hotelRating && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border">
                  <Star className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Rating</div>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: pkg.hotelRating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Makkah & Madinah Hotels */}
            <div>
              <h3 className="font-black text-sm mb-3 text-foreground">Hotel Accommodation</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Makkah Hotel */}
                <div className="border-2 rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: "#0d1b3e" }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "#0d1b3e" }}>
                    <Hotel className="h-4 w-4 text-white" />
                    <span className="text-white font-black text-sm uppercase tracking-wide">Makkah Al-Mukarramah</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="font-black text-base" style={{ color: "#0d1b3e" }}>{makkahHotel}</div>
                    {pkg.hotelRating && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: pkg.hotelRating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                    {pkg.makkahNights && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Moon className="h-4 w-4" />
                        <span className="font-semibold">{pkg.makkahNights} Nights</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Near Masjid Al-Haram, Makkah
                    </div>
                  </div>
                </div>

                {/* Madinah Hotel */}
                <div className="border-2 rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: "#1a7a4a" }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "#1a7a4a" }}>
                    <Hotel className="h-4 w-4 text-white" />
                    <span className="text-white font-black text-sm uppercase tracking-wide">Madinah Al-Munawwarah</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="font-black text-base" style={{ color: "#1a7a4a" }}>{madinahHotel}</div>
                    {pkg.hotelRating && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: pkg.hotelRating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                    {pkg.madinahNights && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Moon className="h-4 w-4" />
                        <span className="font-semibold">{pkg.madinahNights} Nights</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Near Masjid an-Nabawi, Madinah
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Inclusions</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {(pkg.inclusions as string[]).map((inc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />{inc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Documents (shown only after booking) */}
            {createdBookingId && (
              <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800 mb-1">Documents Ready</p>
                  <p className="text-xs text-green-700">Download your travel documents for this booking</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/eticket/${createdBookingId}`}>
                    <Button size="sm" variant="outline" className="border-green-400 text-green-700 hover:bg-green-100">
                      <Printer className="h-3.5 w-3.5 mr-1.5" /> E-Ticket
                    </Button>
                  </Link>
                  <Link href={`/hotel-voucher/${createdBookingId}`}>
                    <Button size="sm" variant="outline" className="border-green-400 text-green-700 hover:bg-green-100">
                      <Hotel className="h-3.5 w-3.5 mr-1.5" /> Hotel Voucher
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-black">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passengers */}
            {passengers.map((p, i) => (
              <div key={i} className="border rounded-xl p-4 space-y-3 bg-muted/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <span className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-black">{i + 1}</span>
                    Passenger {i + 1}
                  </h3>
                  {i > 0 && (
                    <Button variant="outline" size="sm" onClick={() => removePassenger(i)} className="text-red-500 border-red-200 hover:bg-red-50 h-7">
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs font-semibold">First Name</Label><Input value={p.firstName} onChange={e => updatePassenger(i, "firstName", e.target.value)} className="mt-1" data-testid={`input-firstname-${i}`} /></div>
                  <div><Label className="text-xs font-semibold">Last Name</Label><Input value={p.lastName} onChange={e => updatePassenger(i, "lastName", e.target.value)} className="mt-1" data-testid={`input-lastname-${i}`} /></div>
                  <div><Label className="text-xs font-semibold">Passport Number</Label><Input value={p.passportNumber} onChange={e => updatePassenger(i, "passportNumber", e.target.value)} className="mt-1 font-mono" data-testid={`input-passport-${i}`} /></div>
                  <div><Label className="text-xs font-semibold">Nationality</Label><Input value={p.nationality} onChange={e => updatePassenger(i, "nationality", e.target.value)} className="mt-1" data-testid={`input-nationality-${i}`} /></div>
                  <div><Label className="text-xs font-semibold">Date of Birth</Label><Input type="date" value={p.dateOfBirth} onChange={e => updatePassenger(i, "dateOfBirth", e.target.value)} className="mt-1" data-testid={`input-dob-${i}`} /></div>
                  <div>
                    <Label className="text-xs font-semibold">Gender</Label>
                    <Select value={p.gender} onValueChange={v => updatePassenger(i, "gender", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addPassenger} className="w-full border-dashed">
              <Plus className="h-4 w-4 mr-2" />Add Passenger
            </Button>

            {/* Contact & Payment */}
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-semibold">Contact Email</Label><Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="mt-1" data-testid="input-contact-email" /></div>
              <div><Label className="text-xs font-semibold">Contact Phone</Label><Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="mt-1" data-testid="input-contact-phone" /></div>
              <div>
                <Label className="text-xs font-semibold">Payment Method</Label>
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
            <div className="rounded-xl p-4" style={{ backgroundColor: "#0d1b3e" }}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white/70 text-xs uppercase tracking-wide">Total Amount</div>
                  <div className="text-white text-sm mt-0.5">{passengers.length} passenger{passengers.length > 1 ? "s" : ""} × PKR {Number(pkg.price).toLocaleString()}</div>
                </div>
                <div className="text-2xl font-black" style={{ color: "#f5c842" }}>
                  PKR {(Number(pkg.price) * passengers.length).toLocaleString()}
                </div>
              </div>
            </div>

            {holdCountdown !== null && holdCountdown > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="text-amber-800 font-semibold text-sm">On Hold — Time remaining: {fmtCountdown(holdCountdown)}</span>
                <Badge className="ml-auto bg-amber-500 text-white border-0">ON HOLD</Badge>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                className="flex-1 font-bold"
                onClick={() => handleBook(false)}
                disabled={createBooking.isPending}
                data-testid="button-book-now"
              >
                {createBooking.isPending ? "Processing..." : "Book Now"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-50 font-bold"
                onClick={() => handleBook(true)}
                disabled={createBooking.isPending}
                data-testid="button-on-hold"
              >
                <Clock className="h-4 w-4 mr-2" />On Hold (2hr)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
