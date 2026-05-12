import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetBooking, getGetBookingQueryKey, useConfirmBooking, useCancelBooking, useHoldBooking, getListBookingsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plane, User, Phone, Mail, Clock, Printer, CheckCircle, XCircle } from "lucide-react";

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
  return <span className="font-mono text-lg font-bold text-amber-700">{remaining > 0 ? `${h}:${m}:${s}` : "EXPIRED"}</span>;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    on_hold: "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-blue-100 text-blue-800",
  };
  return <Badge className={`${map[status] || "bg-gray-100 text-gray-800"} border-0 font-semibold capitalize text-sm px-3 py-1`}>{status.replace("_", " ")}</Badge>;
}

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: booking, isLoading } = useGetBooking(Number(id), { query: { queryKey: getGetBookingQueryKey(Number(id)) } });
  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();
  const holdBookingMutation = useHoldBooking();

  const handleConfirm = () => {
    confirmBooking.mutate({ id: Number(id) }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() }); toast({ title: "Booking confirmed!" }); },
    });
  };
  const handleCancel = () => {
    cancelBooking.mutate({ id: Number(id) }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() }); toast({ title: "Booking cancelled" }); },
    });
  };
  const handleHold = () => {
    holdBookingMutation.mutate({ id: Number(id) }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetBookingQueryKey(Number(id)) }); toast({ title: "Booking placed on hold for 2 hours" }); },
    });
  };

  if (isLoading) return <Layout><div className="space-y-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-32"/>)}</div></Layout>;
  if (!booking) return <Layout><div className="text-center py-12">Booking not found</div></Layout>;

  const passengers = (booking.passengersInfo as Array<Record<string, string>>) || [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
            <p className="text-muted-foreground text-sm mt-1 font-mono">Ref: <span className="font-bold text-primary">{booking.bookingRef}</span></p>
          </div>
          <div className="flex items-center gap-3">
            {statusBadge(booking.status)}
            <Link href={`/eticket/${booking.id}`}>
              <Button variant="outline" data-testid="button-print-eticket">
                <Printer className="h-4 w-4 mr-2" />E-Ticket
              </Button>
            </Link>
          </div>
        </div>

        {/* On Hold Alert */}
        {booking.status === "on_hold" && booking.holdExpiresAt && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-center gap-4 p-4">
              <Clock className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800">Booking is On Hold</p>
                <p className="text-sm text-amber-700">Time remaining to confirm:</p>
              </div>
              <HoldCountdown expiresAt={booking.holdExpiresAt} />
              <Button size="sm" onClick={handleConfirm} className="ml-auto bg-green-600 hover:bg-green-700" data-testid="button-confirm-booking">Confirm Now</Button>
            </CardContent>
          </Card>
        )}

        {/* Flight/Package Info */}
        {booking.flightGroup && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plane className="h-4 w-4" />Flight Details</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 py-2 flex-wrap">
                <div className="text-center">
                  <div className="text-2xl font-bold">{booking.flightGroup.departureTime}</div>
                  <div className="text-primary font-semibold">{booking.flightGroup.originCode}</div>
                  <div className="text-xs text-muted-foreground">{booking.flightGroup.origin}</div>
                </div>
                <div className="flex-1 text-center text-sm text-muted-foreground">
                  <div>{booking.flightGroup.duration}</div>
                  <div className="flex items-center my-2"><div className="flex-1 h-px bg-border"/><Plane className="h-4 w-4 mx-2 text-primary"/><div className="flex-1 h-px bg-border"/></div>
                  <div>{booking.flightGroup.airline} · {booking.flightGroup.flightNumber}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{booking.flightGroup.arrivalTime}</div>
                  <div className="text-primary font-semibold">{booking.flightGroup.destinationCode}</div>
                  <div className="text-xs text-muted-foreground">{booking.flightGroup.destination}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-3 border-t mt-3 text-xs">
                <span className="text-muted-foreground">Date: <b>{booking.flightGroup.departureDate}</b></span>
                <span className="text-muted-foreground">PNR: <b className="font-mono">{booking.flightGroup.pnr}</b></span>
                <span className="text-muted-foreground">Class: <b>{booking.flightGroup.class}</b></span>
                {booking.flightGroup.baggage && <span className="text-muted-foreground">Baggage: <b>{booking.flightGroup.baggage}</b></span>}
              </div>
            </CardContent>
          </Card>
        )}

        {booking.package && (
          <Card>
            <CardHeader><CardTitle className="text-base">Package Details</CardTitle></CardHeader>
            <CardContent>
              <div className="font-semibold text-lg">{booking.package.name}</div>
              <div className="text-muted-foreground text-sm mt-1">{booking.package.duration} days · {booking.package.airline} · {booking.package.hotel}</div>
              <div className="text-sm mt-2">Departure: {booking.package.departureDate} → Return: {booking.package.returnDate}</div>
            </CardContent>
          </Card>
        )}

        {/* Passengers */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />Passengers ({passengers.length})</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {passengers.map((p, i) => (
              <div key={i} className="py-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Name</span><div className="font-medium">{p.firstName} {p.lastName}</div></div>
                <div><span className="text-muted-foreground text-xs">Passport</span><div className="font-mono font-medium">{p.passportNumber}</div></div>
                <div><span className="text-muted-foreground text-xs">Nationality</span><div>{p.nationality}</div></div>
                <div><span className="text-muted-foreground text-xs">DOB</span><div>{p.dateOfBirth}</div></div>
                <div><span className="text-muted-foreground text-xs">Gender</span><div className="capitalize">{p.gender}</div></div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact & Payment */}
        <Card>
          <CardHeader><CardTitle className="text-base">Contact & Payment</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{booking.contactEmail}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{booking.contactPhone}</div>
            <div><span className="text-muted-foreground">Payment: </span><span className="capitalize font-medium">{booking.paymentMethod.replace("_", " ")}</span></div>
            <div><span className="text-muted-foreground">Total: </span><span className="font-bold text-primary text-lg">PKR {Number(booking.totalAmount).toLocaleString()}</span></div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          {booking.status === "pending" && (
            <>
              <Button onClick={handleConfirm} disabled={confirmBooking.isPending} className="bg-green-600 hover:bg-green-700" data-testid="button-confirm">
                <CheckCircle className="h-4 w-4 mr-2" />Confirm Booking
              </Button>
              <Button variant="outline" onClick={handleHold} disabled={holdBookingMutation.isPending} className="border-amber-400 text-amber-700" data-testid="button-hold">
                <Clock className="h-4 w-4 mr-2" />Put On Hold
              </Button>
            </>
          )}
          {booking.status !== "cancelled" && (
            <Button variant="outline" onClick={handleCancel} disabled={cancelBooking.isPending} className="border-red-300 text-red-600 hover:bg-red-50" data-testid="button-cancel">
              <XCircle className="h-4 w-4 mr-2" />Cancel Booking
            </Button>
          )}
          <Link href={`/eticket/${booking.id}`}>
            <Button variant="outline" data-testid="button-eticket">
              <Printer className="h-4 w-4 mr-2" />View E-Ticket
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
