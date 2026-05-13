import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetTicket, getGetTicketQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, ArrowLeft, Plane as PlaneIcon } from "lucide-react";

/* ─── Airline config ───────────────────────────────────────────── */
const AIRLINE_CONFIG: Record<string, { color: string; logo: string; name: string }> = {
  SV: {
    color: "#007a3d",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Saudia_Logo.svg",
    name: "Saudia — Saudi Arabian Airlines",
  },
  PK: {
    color: "#004F9F",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Pakistan_International_Airlines_logo.svg",
    name: "PIA — Pakistan International Airlines",
  },
  EK: {
    color: "#C41230",
    logo: "https://upload.wikimedia.org/wikipedia/en/4/4f/Emirates_logo.svg",
    name: "Emirates",
  },
  QR: {
    color: "#5C0632",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/79/Qatar_airways_logo.svg",
    name: "Qatar Airways",
  },
  EY: {
    color: "#BD9B60",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/49/Etihad-airways-logo.svg",
    name: "Etihad Airways",
  },
  G9: {
    color: "#CC0000",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Air_Arabia_logo.svg",
    name: "Air Arabia",
  },
  FZ: {
    color: "#E61E25",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/70/Flydubai_logo.svg",
    name: "flydubai",
  },
  XY: {
    color: "#FF6600",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Flynas_logo.svg",
    name: "flynas",
  },
  PA: {
    color: "#00704A",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Pakistan_International_Airlines_logo.svg",
    name: "AirBlue",
  },
};

const DEFAULT_CONFIG = {
  color: "#0d1b3e",
  logo: "",
  name: "Bin Yasin Travels",
};

function getAirlineConfig(code?: string | null) {
  if (!code) return DEFAULT_CONFIG;
  return AIRLINE_CONFIG[code.toUpperCase()] ?? DEFAULT_CONFIG;
}

/* ─── QR code via free API ─────────────────────────────────────── */
function QRCode({ value }: { value: string }) {
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(value)}&margin=4`}
      alt="QR Code"
      width={110}
      height={110}
      className="rounded"
    />
  );
}

/* ─── Skeleton loader ──────────────────────────────────────────── */
function TicketSkeleton() {
  return (
    <div className="max-w-[900px] mx-auto space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded border shadow-lg p-8 space-y-5 bg-white">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-1 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-20 w-48" />
          <Skeleton className="h-24 w-24" />
        </div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
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

  if (isLoading) return (
    <div className="min-h-screen bg-gray-100 p-4 print:bg-white">
      <TicketSkeleton />
    </div>
  );

  if (!ticket) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg p-10 shadow text-center space-y-3">
        <div className="text-5xl">🎫</div>
        <div className="font-bold text-lg text-gray-700">Ticket not found</div>
        <button
          onClick={() => setLocation(-1 as unknown as string)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    </div>
  );

  const airlineCode = ticket.airlineCode?.toUpperCase() ?? "";
  const cfg = getAirlineConfig(airlineCode);
  const col = cfg.color;

  const isConfirmed = ticket.status === "confirmed";
  const isHold = ticket.status === "on_hold";

  const issueDate = new Date(ticket.issuedAt);
  const reservedStr = issueDate.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
    + ", " + issueDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className="min-h-screen bg-[#f2f2f2] p-4 md:p-6 print:p-0 print:bg-white">

      {/* ── Controls (hidden on print) ──────────────────────── */}
      <div className="max-w-[900px] mx-auto mb-5 flex items-center gap-3 print:hidden">
        <button
          onClick={() => setLocation(-1 as unknown as string)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm font-semibold hover:bg-gray-50 shadow-sm transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-sm hover:opacity-90 transition"
          style={{ backgroundColor: col }}
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          TICKET BODY
      ══════════════════════════════════════════════════════ */}
      <div
        className="max-w-[900px] mx-auto bg-white shadow-lg print:shadow-none"
        style={{
          borderTop: `10px solid ${col}`,
          fontFamily: "Arial, sans-serif",
        }}
        data-testid="eticket-container"
      >
        <div className="px-8 py-6 print:px-6 print:py-4">

          {/* ── TOP HEADER: Logo + PNR ─────────────────────────── */}
          <div className="flex items-center justify-between mb-5">
            {/* Airline logo */}
            <div className="flex items-center gap-3">
              {cfg.logo ? (
                <img
                  src={cfg.logo}
                  alt={cfg.name}
                  className="h-12 max-w-[160px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-black text-lg"
                  style={{ backgroundColor: col }}
                >
                  <PlaneIcon className="h-5 w-5" />
                  <span>{airlineCode || "BYT"}</span>
                </div>
              )}
              {/* Show code badge alongside logo */}
              {cfg.logo && airlineCode && (
                <span
                  className="text-xs font-black px-2 py-1 rounded uppercase tracking-widest"
                  style={{ color: col, border: `1.5px solid ${col}` }}
                >
                  {airlineCode}
                </span>
              )}
            </div>

            {/* PNR */}
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">PNR</div>
              <div className="text-2xl font-black" style={{ color: col }}>
                {ticket.pnr || ticket.bookingRef}
              </div>
            </div>
          </div>

          {/* ── DIVIDER ─────────────────────────────────────────── */}
          <div className="mb-5" style={{ borderBottom: `2px solid ${col}` }} />

          {/* ── BOOKING DATES + QR ──────────────────────────────── */}
          <div className="flex items-start justify-between mb-6">
            <div className="text-[15px] font-bold leading-[1.9] text-gray-800">
              RESERVED ON<br />
              <span className="text-gray-600 font-semibold text-[14px]">{reservedStr}</span>
              <br /><br />
              TICKETED ON<br />
              <span className="text-gray-600 font-semibold text-[14px]">{reservedStr}</span>
              <br /><br />
              BOOKING REF<br />
              <span className="font-black text-[16px]" style={{ color: col }}>{ticket.bookingRef}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <QRCode value={ticket.ticketNumber || ticket.pnr || ticket.bookingRef} />
              <div className="text-[10px] text-gray-400 font-mono tracking-widest text-center">
                {(ticket.ticketNumber || ticket.bookingRef || "").substring(0, 18)}
              </div>
            </div>
          </div>

          {/* ── PASSENGER DETAILS ───────────────────────────────── */}
          <div className="text-[20px] font-black mb-3" style={{ color: col }}>
            PASSENGER DETAILS
          </div>
          <table className="w-full border-collapse mb-6 text-sm">
            <thead>
              <tr style={{ backgroundColor: col }}>
                {["SR", "PASSENGER NAME", "PASSPORT NUMBER", "TICKET NUMBER", "SEAT"].map(h => (
                  <th key={h} className="text-left text-white px-3 py-3 text-[14px] font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {((ticket as any).passengers as Array<{sr: number; name: string; passportNumber: string; ticketNumber: string; seat: string}> | undefined)?.length
                ? (ticket as any).passengers.map((p: {sr: number; name: string; passportNumber: string; ticketNumber: string; seat: string}) => (
                  <tr key={p.sr} className={`border-b border-gray-200 ${p.sr % 2 === 0 ? "bg-gray-50" : ""}`}>
                    <td className="px-3 py-3 font-bold text-[14px]">{p.sr}</td>
                    <td className="px-3 py-3 font-bold text-[14px] uppercase">{p.name}</td>
                    <td className="px-3 py-3 font-semibold text-[14px] font-mono">{p.passportNumber}</td>
                    <td className="px-3 py-3 font-semibold text-[14px] font-mono">{p.ticketNumber || "—"}</td>
                    <td className="px-3 py-3 font-semibold text-[14px]">{p.seat || "ANY SEAT"}</td>
                  </tr>
                ))
                : (
                  <tr className="border-b border-gray-200">
                    <td className="px-3 py-3 font-bold text-[14px]">1</td>
                    <td className="px-3 py-3 font-bold text-[14px] uppercase">{ticket.passengerName}</td>
                    <td className="px-3 py-3 font-semibold text-[14px] font-mono">{ticket.passportNumber}</td>
                    <td className="px-3 py-3 font-semibold text-[14px] font-mono">{ticket.ticketNumber || "—"}</td>
                    <td className="px-3 py-3 font-semibold text-[14px]">{ticket.seat || "ANY SEAT"}</td>
                  </tr>
                )
              }
            </tbody>
          </table>

          {/* ── TRAVEL ITINERARY ────────────────────────────────── */}
          <div className="text-[20px] font-black mb-3" style={{ color: col }}>
            TRAVEL ITINERARY
          </div>

          {/* Route display */}
          {(ticket as any).returnFlight ? (
            <div className="flex items-center gap-4 text-[22px] font-black text-gray-800 my-4">
              <span>{ticket.originCode}</span>
              <span style={{ color: col, fontSize: 28 }}>✈</span>
              <span>{ticket.destinationCode}</span>
              <span style={{ color: col, fontSize: 28 }}>✈</span>
              <span>{ticket.originCode}</span>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-[22px] font-black text-gray-800 my-4">
              <span>{ticket.origin} ({ticket.originCode})</span>
              <span style={{ color: col, fontSize: 32 }}>✈</span>
              <span>{ticket.destination} ({ticket.destinationCode})</span>
            </div>
          )}

          {/* Flight table */}
          <table className="w-full border-collapse mb-6 text-sm">
            <thead>
              <tr style={{ backgroundColor: col }}>
                {["DATE", "ROUTE", "FLIGHT #", "DEPARTURE — ARRIVAL", "MEAL", "BAGGAGE", "CLASS", "STATUS"].map(h => (
                  <th key={h} className="text-left text-white px-3 py-3 text-[13px] font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Outbound flight */}
              <tr className="border-b border-gray-200">
                <td className="px-3 py-3 font-bold text-[13px] whitespace-nowrap">{ticket.departureDate}</td>
                <td className="px-3 py-3 font-semibold text-[13px] whitespace-nowrap">
                  {ticket.originCode} – {ticket.destinationCode}
                </td>
                <td className="px-3 py-3 font-bold text-[13px]">{ticket.flightNumber}</td>
                <td className="px-3 py-3 font-semibold text-[13px] whitespace-nowrap">
                  {ticket.departureTime} — {ticket.arrivalTime}
                </td>
                <td className="px-3 py-3 font-semibold text-[13px]">YES</td>
                <td className="px-3 py-3 font-semibold text-[13px]">{ticket.baggage || "1 PC × 23 KG"}</td>
                <td className="px-3 py-3 font-semibold text-[13px] uppercase">{ticket.class || "ECONOMY"}</td>
                <td className="px-3 py-3">
                  <span
                    className="text-white text-[12px] font-bold px-3 py-1.5 rounded"
                    style={{
                      backgroundColor: isConfirmed ? "#0a8f45" : isHold ? "#d97706" : "#dc2626",
                    }}
                  >
                    {isConfirmed ? "CONFIRMED" : isHold ? "ON HOLD" : "CANCELLED"}
                  </span>
                </td>
              </tr>
              {/* Return flight (Umrah packages only) */}
              {(ticket as any).returnFlight && (() => {
                const rf = (ticket as any).returnFlight;
                return (
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="px-3 py-3 font-bold text-[13px] whitespace-nowrap">{rf.departureDate}</td>
                    <td className="px-3 py-3 font-semibold text-[13px] whitespace-nowrap">
                      {rf.originCode} – {rf.destinationCode}
                    </td>
                    <td className="px-3 py-3 font-bold text-[13px]">{rf.flightNumber}</td>
                    <td className="px-3 py-3 font-semibold text-[13px] whitespace-nowrap">
                      {rf.departureTime} — {rf.arrivalTime}
                    </td>
                    <td className="px-3 py-3 font-semibold text-[13px]">YES</td>
                    <td className="px-3 py-3 font-semibold text-[13px]">{rf.baggage || "1 PC × 30 KG"}</td>
                    <td className="px-3 py-3 font-semibold text-[13px] uppercase">{rf.class || "ECONOMY"}</td>
                    <td className="px-3 py-3">
                      <span
                        className="text-white text-[12px] font-bold px-3 py-1.5 rounded"
                        style={{
                          backgroundColor: isConfirmed ? "#0a8f45" : isHold ? "#d97706" : "#dc2626",
                        }}
                      >
                        {isConfirmed ? "CONFIRMED" : isHold ? "ON HOLD" : "CANCELLED"}
                      </span>
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>

          {/* ── TERMS & CONDITIONS ───────────────────────────────── */}
          <div className="text-[20px] font-black mb-3" style={{ color: col }}>
            TERMS &amp; CONDITIONS
          </div>
          <div className="mb-4" style={{ borderBottom: `2px solid ${col}` }} />
          <div className="text-[14px] font-bold leading-[1.9] text-gray-700">
            1- PASSENGER SHOULD REPORT AT CHECK-IN COUNTER AT LEAST 04:00 HOURS PRIOR TO FLIGHT.<br />
            2- TICKETS ARE NON-REFUNDABLE AND NON-CHANGEABLE AFTER ISSUANCE UNLESS STATED OTHERWISE.<br />
            3- VALID PASSPORT (6 MONTHS VALIDITY) AND VISA ARE MANDATORY FOR TRAVEL.<br />
            4- CARRY-ON BAGGAGE LIMIT IS 7 KG. EXCESS BAGGAGE CHARGES APPLY.<br />
            5- THIS IS AN ELECTRONICALLY GENERATED TICKET — NO SIGNATURE REQUIRED.
          </div>

          {/* ── FOOTER ───────────────────────────────────────────── */}
          <div
            className="mt-8 pt-4 flex items-center justify-between text-[12px] text-white px-4 py-3 rounded"
            style={{ backgroundColor: col }}
          >
            <div className="font-bold">
              Bin Yasin Travels — Shop #12, Al-Haramain Plaza, Ferozepur Road, Lahore, Pakistan
            </div>
            <div className="font-mono opacity-80">
              {new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
            </div>
          </div>

        </div>
      </div>

      {/* ── Print styles ─────────────────────────────────────── */}
      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          @page { margin: 0.4in; size: A4 portrait; }
        }
      `}</style>
    </div>
  );
}
