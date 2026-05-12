import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetTicket, getGetTicketQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, ArrowLeft, Plane, CheckCircle, Clock, XCircle } from "lucide-react";

function TicketSkeleton() {
  return (
    <div className="max-w-[820px] mx-auto space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-2xl overflow-hidden border shadow-2xl">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-6 w-full" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

function QRPattern({ text }: { text: string }) {
  const cells = Array.from({ length: 49 }, (_, i) => {
    const row = Math.floor(i / 7);
    const col = i % 7;
    const isCorner = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
    const charCode = text.charCodeAt(i % text.length) || 65;
    return isCorner || (charCode + row * col) % 3 !== 0;
  });
  return (
    <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(7, 1fr)", width: 70, height: 70 }}>
      {cells.map((filled, i) => (
        <div key={i} className={filled ? "bg-gray-900" : "bg-white"} />
      ))}
    </div>
  );
}

function Barcode({ value }: { value: string }) {
  const widths = Array.from({ length: 60 }, (_, i) => {
    const c = value.charCodeAt(i % value.length) || 65;
    return (c + i) % 4 === 0 ? 3 : (c + i) % 3 === 0 ? 2 : 1;
  });
  const heights = [100, 65, 85, 45, 100, 75, 55, 90, 100, 65, 70, 50, 100, 80, 60, 40, 100, 75, 55, 85, 100, 65, 90, 70, 100, 50, 80, 65, 100, 75, 55, 90, 100, 65, 70, 45, 100, 80, 60, 50, 100, 75, 55, 85, 100, 65, 90, 70, 100, 50, 80, 65, 100, 75, 55, 90, 100, 65, 70, 45];
  return (
    <div className="flex items-end gap-px" style={{ height: 48 }}>
      {widths.map((w, i) => (
        <div
          key={i}
          className="bg-gray-900"
          style={{ width: w, height: `${heights[i % heights.length]}%` }}
        />
      ))}
    </div>
  );
}

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

  if (isLoading) return <div className="p-6"><TicketSkeleton /></div>;
  if (!ticket) return (
    <div className="p-8 text-center space-y-3">
      <XCircle className="h-12 w-12 text-muted-foreground/40 mx-auto" />
      <p className="text-muted-foreground font-semibold">Ticket not found</p>
    </div>
  );

  const isConfirmed = ticket.status === "confirmed";
  const isHold = ticket.status === "on_hold";

  const statusColor = isConfirmed ? "bg-emerald-600" : isHold ? "bg-amber-500" : "bg-red-600";
  const statusLabel = isConfirmed ? "CONFIRMED — ELECTRONIC TICKET" : isHold ? "ON HOLD" : "CANCELLED";
  const StatusIcon = isConfirmed ? CheckCircle : isHold ? Clock : XCircle;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 md:p-6 print:p-0 print:bg-white">
      {/* Controls */}
      <div className="max-w-[820px] mx-auto mb-5 flex items-center gap-3 print:hidden">
        <Button variant="outline" size="sm" onClick={() => setLocation(-1 as unknown as string)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
        <Button size="sm" onClick={() => window.print()} className="bg-[#0d1b3e] hover:bg-[#1a3a7c] text-white">
          <Printer className="h-4 w-4 mr-1.5" /> Print / Save PDF
        </Button>
        <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
          Present this at the airport check-in counter
        </div>
      </div>

      {/* Ticket Card */}
      <div
        className="max-w-[820px] mx-auto bg-white shadow-2xl print:shadow-none overflow-hidden print:rounded-none"
        style={{ borderRadius: "1rem" }}
        data-testid="eticket-container"
      >

        {/* ── HEADER BAND ─────────────────────────────────────── */}
        <div className="bg-[#0d1b3e] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#f5c842] text-[#0d1b3e] font-black text-xl px-4 py-2 rounded-lg tracking-wider shadow-sm">
              {ticket.airlineCode || "BYT"}
            </div>
            <div>
              <div className="text-white font-black text-lg tracking-wide leading-tight">{ticket.airline}</div>
              <div className="text-blue-300 text-xs tracking-widest uppercase mt-0.5">Electronic Boarding Pass</div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-blue-300 text-[10px] uppercase tracking-widest">Booking Reference</div>
            <div className="text-white font-mono font-black text-2xl tracking-widest mt-0.5">{ticket.bookingRef}</div>
          </div>
        </div>

        {/* ── STATUS STRIPE ─────────────────────────────────── */}
        <div className={`${statusColor} px-6 py-2 flex items-center justify-center gap-2`}>
          <StatusIcon className="h-3.5 w-3.5 text-white" />
          <span className="text-white text-xs font-bold tracking-widest uppercase">{statusLabel}</span>
        </div>

        {/* ── PASSENGER + FLIGHT OVERVIEW ──────────────────── */}
        <div className="px-6 py-5 border-b bg-slate-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 text-sm">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Passenger Name</div>
              <div className="font-black text-slate-900 uppercase text-base leading-tight">{ticket.passengerName}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Passport No.</div>
              <div className="font-mono font-bold text-slate-900 text-base">{ticket.passportNumber}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ticket Number</div>
              <div className="font-mono font-bold text-[#0d1b3e] text-sm">{ticket.ticketNumber}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">PNR Code</div>
              <div className="font-mono font-black text-[#0d1b3e] text-xl tracking-widest">{ticket.pnr}</div>
            </div>
          </div>
        </div>

        {/* ── FLIGHT ROUTE ─────────────────────────────────── */}
        <div className="px-6 py-8 border-b relative">
          {/* Background watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <Plane className="h-64 w-64 text-slate-900" />
          </div>

          <div className="relative flex items-center justify-between gap-4">
            {/* Departure */}
            <div className="text-center flex-shrink-0">
              <div className="text-5xl md:text-6xl font-black text-[#0d1b3e] tabular-nums leading-none">{ticket.departureTime}</div>
              <div className="text-3xl font-black text-[#0d1b3e] mt-2 tracking-wider">{ticket.originCode}</div>
              <div className="text-sm text-slate-500 font-medium mt-1 max-w-[100px]">{ticket.origin}</div>
              <div className="mt-2 inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">{ticket.departureDate}</div>
            </div>

            {/* Route line */}
            <div className="flex-1 flex flex-col items-center gap-2 min-w-0 px-4">
              <div className="text-xs text-slate-400 font-bold tracking-widest">{ticket.flightNumber}</div>
              <div className="w-full flex items-center gap-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <div className="bg-[#0d1b3e] rounded-full p-2.5 shadow-lg flex-shrink-0">
                  <Plane className="h-5 w-5 text-[#f5c842]" />
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {ticket.stops === 0 || ticket.stops == null ? "Non-stop" : `${ticket.stops} Stop`}
                </div>
                {ticket.duration && (
                  <div className="text-[10px] text-slate-400 font-medium">{ticket.duration}</div>
                )}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center flex-shrink-0">
              <div className="text-5xl md:text-6xl font-black text-[#0d1b3e] tabular-nums leading-none">{ticket.arrivalTime}</div>
              <div className="text-3xl font-black text-[#0d1b3e] mt-2 tracking-wider">{ticket.destinationCode}</div>
              <div className="text-sm text-slate-500 font-medium mt-1 max-w-[100px]">{ticket.destination}</div>
              <div className="mt-2 inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Arrival</div>
            </div>
          </div>
        </div>

        {/* ── TICKET DETAILS ────────────────────────────────── */}
        <div className="px-6 py-4 grid grid-cols-3 sm:grid-cols-6 gap-4 border-b bg-slate-50 text-sm">
          {[
            { label: "Class", value: ticket.class },
            { label: "Seat", value: ticket.seat || "—", highlight: true },
            { label: "Baggage", value: ticket.baggage || "23 KG" },
            { label: "Meal", value: "Included" },
            { label: "Status", value: isConfirmed ? "OK" : ticket.status.toUpperCase(), statusColor: isConfirmed ? "text-emerald-600" : "text-amber-600" },
            { label: "Issued", value: new Date(ticket.issuedAt).toLocaleDateString("en-PK") },
          ].map(({ label, value, highlight, statusColor: sc }) => (
            <div key={label}>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</div>
              <div className={`font-bold ${highlight ? "text-[#0d1b3e] text-xl" : sc || "text-slate-800"}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── TEAR LINE ────────────────────────────────────── */}
        <div className="flex items-center px-0 py-0 print:hidden">
          <div className="flex-1 border-t border-dashed border-slate-300" />
          <div className="px-4 text-slate-300 text-xs font-medium select-none">✂ TEAR HERE</div>
          <div className="flex-1 border-t border-dashed border-slate-300" />
        </div>

        {/* ── BARCODE + QR SECTION ─────────────────────────── */}
        <div className="px-6 py-5 flex items-center gap-6">
          {/* Barcode */}
          <div className="flex-shrink-0">
            <Barcode value={ticket.barcode || ticket.ticketNumber || ticket.bookingRef} />
            <div className="font-mono text-[9px] text-slate-400 mt-1 text-center tracking-widest">
              {(ticket.barcode || ticket.ticketNumber || "").substring(0, 22)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="text-xs text-slate-500 leading-relaxed">
              Present this electronic ticket at check-in along with your <strong className="text-slate-700">valid passport</strong> and <strong className="text-slate-700">visa documents</strong>. Arrive at least <strong className="text-slate-700">3 hours</strong> before departure for international flights.
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#0d1b3e] flex-shrink-0" />
              <span className="text-[10px] text-slate-400">Ticket is non-transferable and non-refundable unless stated otherwise</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0 w-[86px] h-[86px] border-2 border-slate-200 rounded-lg flex items-center justify-center bg-white p-1.5 shadow-sm">
            <QRPattern text={ticket.ticketNumber || ticket.bookingRef} />
          </div>
        </div>

        {/* ── AGENCY INFO + FOOTER ──────────────────────────── */}
        <div className="bg-[#0d1b3e]">
          <div className="px-6 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="bg-[#f5c842] text-[#0d1b3e] font-black px-2 py-0.5 rounded text-[10px]">BYT</div>
              <span className="text-blue-200 font-medium">Bin Yasin Travels — Pakistan's Trusted Umrah Agency</span>
            </div>
            <div className="text-blue-300 font-mono text-[10px]">
              {new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
          <div className="border-t border-white/10 px-6 py-2.5">
            <p className="text-blue-300/60 text-[10px] leading-relaxed">
              This is an electronically generated ticket. For assistance: +92-300-123-4567 | info@binyasintravels.com | Shop #12, Al-Haramain Plaza, Ferozepur Road, Lahore, Pakistan.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          @page { margin: 0.5in; size: A4 landscape; }
        }
      `}</style>
    </div>
  );
}
