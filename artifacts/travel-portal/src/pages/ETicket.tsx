import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetTicket, getGetTicketQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, ArrowLeft, Plane } from "lucide-react";

export default function ETicket() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: ticket, isLoading } = useGetTicket(Number(bookingId), {
    query: { queryKey: getGetTicketQueryKey(Number(bookingId)) },
  });

  if (isLoading) return <div className="p-8 space-y-4">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12"/>)}</div>;
  if (!ticket) return <div className="p-8 text-center text-muted-foreground">Ticket not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">
      {/* Print Controls */}
      <div className="max-w-[800px] mx-auto mb-4 flex gap-3 print:hidden">
        <Button variant="outline" onClick={() => setLocation(-1 as unknown as string)}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />Print E-Ticket
        </Button>
      </div>

      {/* E-Ticket */}
      <div className="max-w-[800px] mx-auto bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none" data-testid="eticket-container">
        {/* Header Band */}
        <div className="bg-[#1a2e5a] text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-400 text-[#1a2e5a] font-black text-lg px-3 py-1 rounded">
                {ticket.airlineCode || "TRV"}
              </div>
              <div>
                <div className="font-bold text-lg tracking-wide">{ticket.airline}</div>
                <div className="text-xs text-blue-200 tracking-widest uppercase">Electronic Ticket</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-200 uppercase tracking-wider">Ticket Number</div>
              <div className="font-mono font-bold text-lg">{ticket.ticketNumber}</div>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`px-6 py-2 text-xs font-semibold tracking-widest uppercase text-center ${
          ticket.status === "confirmed" ? "bg-green-600 text-white" :
          ticket.status === "on_hold" ? "bg-amber-500 text-white" :
          "bg-red-500 text-white"
        }`}>
          {ticket.status === "confirmed" ? "Confirmed — Electronic Ticket" : ticket.status.toUpperCase()}
        </div>

        {/* Passenger Section */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Passenger Name</div>
              <div className="font-bold text-gray-900 uppercase">{ticket.passengerName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Passport No.</div>
              <div className="font-mono font-semibold text-gray-900">{ticket.passportNumber}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking Ref</div>
              <div className="font-mono font-bold text-[#1a2e5a]">{ticket.bookingRef}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">PNR</div>
              <div className="font-mono font-bold text-[#1a2e5a]">{ticket.pnr}</div>
            </div>
          </div>
        </div>

        {/* Flight Route */}
        <div className="px-6 py-6 border-b">
          <div className="flex items-center justify-between gap-4">
            {/* Departure */}
            <div className="text-center min-w-[120px]">
              <div className="text-4xl font-black text-[#1a2e5a]">{ticket.departureTime}</div>
              <div className="text-2xl font-bold text-[#1a2e5a] mt-1">{ticket.originCode}</div>
              <div className="text-sm text-gray-600 mt-1">{ticket.origin}</div>
              <div className="text-xs text-gray-500 mt-1">{ticket.departureDate}</div>
            </div>

            {/* Flight Path */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2 font-medium">
                {ticket.flightNumber}
              </div>
              <div className="w-full flex items-center">
                <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                <div className="mx-3 bg-[#1a2e5a] rounded-full p-2">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              </div>
              <div className="text-xs text-gray-400 mt-2">Non-stop</div>
            </div>

            {/* Arrival */}
            <div className="text-center min-w-[120px]">
              <div className="text-4xl font-black text-[#1a2e5a]">{ticket.arrivalTime}</div>
              <div className="text-2xl font-bold text-[#1a2e5a] mt-1">{ticket.destinationCode}</div>
              <div className="text-sm text-gray-600 mt-1">{ticket.destination}</div>
            </div>
          </div>
        </div>

        {/* Ticket Details Grid */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-4 border-b bg-gray-50 text-sm">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Class</div>
            <div className="font-semibold text-gray-900">{ticket.class}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Seat</div>
            <div className="font-mono font-bold text-[#1a2e5a] text-lg">{ticket.seat}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Baggage</div>
            <div className="font-semibold">{ticket.baggage || "23 KG"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
            <div className={`font-bold uppercase ${ticket.status === "confirmed" ? "text-green-600" : "text-amber-600"}`}>{ticket.status}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Issued</div>
            <div className="font-semibold text-xs">{new Date(ticket.issuedAt).toLocaleString()}</div>
          </div>
        </div>

        {/* Barcode Area */}
        <div className="px-6 py-5 flex items-center gap-6">
          {/* Visual Barcode */}
          <div className="flex items-end gap-px h-14 flex-shrink-0">
            {Array.from({ length: 48 }).map((_, i) => {
              const heights = [100, 60, 80, 40, 100, 70, 50, 90, 100, 60, 75, 45, 100, 80, 55, 65, 100, 70, 85, 50, 100, 60, 90, 75, 100, 45, 80, 60, 100, 70, 55, 85, 100, 65, 75, 50, 100, 80, 60, 45, 100, 70, 55, 85, 100, 60, 75, 50];
              const h = heights[i % heights.length];
              return <div key={i} className="bg-gray-900" style={{ width: i % 3 === 0 ? "3px" : "1px", height: `${h}%` }} />;
            })}
          </div>

          <div className="flex-1 space-y-1">
            <div className="font-mono text-xs text-gray-400 tracking-widest">{ticket.barcode || ticket.ticketNumber}</div>
            <div className="text-xs text-gray-500">This is your electronic ticket. Present this document at the airport check-in counter with valid photo identification and your passport.</div>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex-shrink-0 w-20 h-20 border-2 border-gray-300 rounded flex items-center justify-center bg-white">
            <div className="grid grid-cols-5 gap-px w-14 h-14">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,7,17,6,11,13,8,12,16,18][i] % 3 === 0 ? "bg-gray-900" : "bg-white"} border border-gray-200`} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1a2e5a] text-blue-200 px-6 py-3 text-xs flex justify-between">
          <span>TravelPortal — Your Trusted Travel Partner</span>
          <span className="font-mono">Generated: {new Date().toLocaleDateString()}</span>
        </div>

        {/* Terms */}
        <div className="px-6 py-3 text-xs text-gray-400 leading-relaxed border-t">
          This electronic ticket is valid for travel on the date and flight specified. Please arrive at the airport at least 2 hours before departure for domestic flights and 3 hours for international flights. Carry valid travel documents including passport and visa. This ticket is non-transferable.
        </div>
      </div>

      <style>{`
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
