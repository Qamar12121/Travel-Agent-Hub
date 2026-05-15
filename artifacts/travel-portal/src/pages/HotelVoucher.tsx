import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetBooking, getGetBookingQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

function VoucherSkeleton() {
  return (
    <div className="max-w-[900px] mx-auto space-y-3">
      <div className="flex gap-3"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-32" /></div>
      <Skeleton className="h-[700px] w-full" />
    </div>
  );
}

function fmtDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}-${mm}-${yy}`;
}

function fmtDateLabel(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mon}/${yy}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const border = "1px solid #000";
const cell: React.CSSProperties = { border, padding: "4px 7px", textAlign: "center", fontSize: "12px" };
const hdr: React.CSSProperties = { ...cell, backgroundColor: "#e8e8e8", fontWeight: "bold" };
const secTitle: React.CSSProperties = { ...cell, backgroundColor: "#d0d0d0", fontWeight: "bold", textAlign: "center", fontSize: "13px" };

const KPT_MAKKAH = [
  { name: "Muhammad Shahid",       role: "Makkah Transport Helpline",          phone: "+966 576709725" },
  { name: "Muhammad Qurban",       role: "Makkah Transport",                   phone: "+966 562950412" },
  { name: "M Faisal Riaz",         role: "Tara Johar+White Line Mak Checkin",  phone: "+966 542612312" },
  { name: "Muhammad Bilal",        role: "Diyar Mather+Jada Al Khalil MakCheckin", phone: "+966 599549849" },
  { name: "Muhammad Zohaib Mukhtiar", role: "Shuttle Service Makkah Checkin", phone: "+966 599549849" },
  { name: "Malik Rizwan",          role: "Makkah Manager (Complaint)",         phone: "+966 545247781" },
];

const KPT_MADINAH = [
  { name: "Muhammad Yaseen", role: "Lugin Golden Med Checkin",   phone: "+966 581257860" },
  { name: "M Ahmad Riaz",    role: "Rehab Al Madsen Med Checkin", phone: "+966 595604841" },
  { name: "Muhammad Yasir",  role: "Medinah Transport",           phone: "+966 560068278" },
  { name: "Mian Adnan Saeed",role: "Medinah Manager (Complaint)", phone: "+966 590779391" },
];

export default function HotelVoucher() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: booking, isLoading } = useGetBooking(Number(bookingId), {
    query: { queryKey: getGetBookingQueryKey(Number(bookingId)) },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[#f2f2f2] p-4 print:bg-white">
      <VoucherSkeleton />
    </div>
  );

  if (!booking || !booking.package) return (
    <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
      <div className="bg-white rounded-lg p-10 shadow text-center space-y-3">
        <div className="text-5xl">🏨</div>
        <div className="font-bold text-lg text-gray-700">Hotel Voucher not available</div>
        <p className="text-sm text-gray-500">This voucher is only available for Umrah package bookings.</p>
        <button onClick={() => setLocation(-1 as unknown as string)} className="text-sm text-blue-600 hover:underline">← Go back</button>
      </div>
    </div>
  );

  const pkg = booking.package as Record<string, unknown>;
  const passengers = (booking.passengersInfo as Array<Record<string, string>>) || [];

  const makkahHotel = (pkg.makkahHotel as string) || (pkg.hotel as string) || "Makkah Hotel";
  const madinahHotel = (pkg.madinahHotel as string) || "Madinah Hotel";
  const returnMakkahHotel = (pkg.returnMakkahHotel as string) || makkahHotel;
  const makkahNights = Number(pkg.makkahNights) || 0;
  const madinahNights = Number(pkg.madinahNights) || 0;
  const returnMakkahNights = Number(pkg.returnMakkahNights) || 0;
  const totalNights = makkahNights + madinahNights + returnMakkahNights;

  const depDateStr = pkg.departureDate as string;
  const retDateStr = pkg.returnDate as string;
  const makkahCheckIn     = fmtDate(depDateStr);
  const makkahCheckOut    = fmtDate(addDays(depDateStr, makkahNights));
  const madinahCheckIn    = makkahCheckOut;
  const madinahCheckOut   = fmtDate(addDays(depDateStr, makkahNights + madinahNights));
  const retMakkahCheckIn  = madinahCheckOut;
  const retMakkahCheckOut = fmtDate(addDays(depDateStr, makkahNights + madinahNights + returnMakkahNights));

  const flight = booking.flightGroup as Record<string, unknown> | null;

  // For Umrah packages, use package-level flight fields if available
  const pkgFlightNo   = pkg.flightNumber as string | null;
  const pkgDepTime    = pkg.departureTime as string | null;
  const pkgArrTime    = pkg.arrivalTime as string | null;

  const depFlight   = flight ? String(flight.flightNumber || "N/A")
    : pkgFlightNo || "N/A";
  const depSector   = flight ? `${String(flight.originCode || "MUX")}-${String(flight.destinationCode || "JED")}` : "MUX-JED";
  const retFlightNo = flight
    ? "PA-" + (String(flight.flightNumber || "PA-870").split("-")[1] ? String(Number(String(flight.flightNumber || "PA-870").split("-")[1]) + 1) : "871")
    : "N/A";
  const retSector   = flight ? `${String(flight.destinationCode || "JED")}-${String(flight.originCode || "MUX")}` : "JED-MUX";

  const depDate = flight ? String(flight.departureDate || depDateStr) : depDateStr;
  const depTime = flight ? String(flight.departureTime || "22:15") : pkgDepTime || "22:15";
  const arrTime = flight ? String(flight.arrivalTime || "02:15") : pkgArrTime || "02:15";

  const depLabel = (() => {
    const d = new Date(depDate);
    return `${String(d.getDate()).padStart(2,"0")}-${d.toLocaleString("en-US",{month:"short"}).toUpperCase()} ${depTime}`;
  })();
  const arrLabel = (() => {
    const d = new Date(depDate); d.setDate(d.getDate() + 1);
    return `${String(d.getDate()).padStart(2,"0")}-${d.toLocaleString("en-US",{month:"short"}).toUpperCase()} ${arrTime}`;
  })();

  const retDepLabel = retDateStr ? (() => {
    const d = new Date(retDateStr);
    return `${String(d.getDate()).padStart(2,"0")}-${d.toLocaleString("en-US",{month:"short"}).toUpperCase()} 03:30`;
  })() : "17-MAR 03:30";
  const retArrLabel = retDateStr ? (() => {
    const d = new Date(retDateStr);
    return `${String(d.getDate()).padStart(2,"0")}-${d.toLocaleString("en-US",{month:"short"}).toUpperCase()} 10:15`;
  })() : "17-MAR 10:15";

  const familyHead = passengers.length > 0
    ? `${passengers[0].firstName || ""} ${passengers[0].lastName || ""}`.trim()
    : booking.contactEmail;

  const voucherNo = `UB-${String(booking.id || 0).padStart(6, "0")}`;
  const today = fmtDateLabel(new Date().toISOString().slice(0, 10));
  const packageName = String(pkg.name || "20 Standard");

  const adults = passengers.length;
  const beds = Math.ceil(adults / 2);

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-6 print:p-0 print:bg-white">

      {/* Controls */}
      <div className="max-w-[960px] mx-auto mb-4 flex items-center gap-3 print:hidden">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm font-semibold hover:bg-gray-50 shadow-sm"
        >
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0d1b3e] text-white text-sm font-semibold hover:opacity-90"
        >
          🖨 Print / Save PDF
        </button>
      </div>

      {/* ── VOUCHER ── */}
      <div
        className="max-w-[960px] mx-auto bg-white relative overflow-hidden"
        style={{ border: "2px solid #000", padding: "14px 16px", fontFamily: "Arial, sans-serif" }}
      >
        {/* Approved watermark */}
        <div style={{
          position: "absolute", color: "rgba(0,160,0,0.22)", fontSize: "72px",
          fontWeight: "bold", transform: "rotate(-35deg)",
          top: "460px", left: "80px", pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}>Approved</div>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>

          {/* Left: Company */}
          <div style={{ width: "34%", fontSize: "12px", lineHeight: "1.55" }}>
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>BIN YASIN TRAVELS &amp; TOURS</div>
            <div style={{ fontWeight: "bold" }}>(MUX)</div>
            <div>Voucher Date: {today}</div>
            <div>Package: {packageName}</div>
            <div>PAX: {adults} (A:{adults},C:0,I:0), Beds={beds}</div>
          </div>

          {/* Center: Logo */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
              <img src="/logo.png" alt="Bin Yasin Travels" style={{ height: "70px", objectFit: "contain" }} />
            </div>
            <div style={{ fontSize: "16px", fontWeight: "bold", marginTop: "4px", letterSpacing: "1px" }}>Hotel Voucher</div>
          </div>

          {/* Right: Partner */}
          <div style={{ width: "34%", fontSize: "12px", lineHeight: "1.55", textAlign: "right" }}>
            <div style={{ fontWeight: "bold", fontSize: "13px" }}>AL MASAR COMPANY FOR</div>
            <div style={{ fontWeight: "bold", fontSize: "13px" }}>UMRAH SERVICES</div>
            <div style={{ fontSize: "11px", color: "#333" }}>AL MASAR COMPANY FOR UMRAH SERVICES</div>
            <div>Islamabad</div>
            <div>Whats APP: +92-300-123-4567</div>
          </div>
        </div>

        {/* ── FAMILY HEAD ROW ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
          <tbody>
            <tr>
              <td style={{ ...hdr, width: "14%" }}>Family Head</td>
              <td style={{ ...cell, textAlign: "left", width: "40%", fontWeight: "bold" }}>{familyHead}</td>
              <td style={{ ...hdr, width: "12%" }}>{voucherNo}</td>
              <td style={{ ...hdr, width: "14%" }}>Manual No:</td>
              <td style={{ ...cell, width: "20%" }}></td>
            </tr>
          </tbody>
        </table>

        {/* ── MUTAMERS TABLE ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
          <thead>
            <tr>
              <td colSpan={10} style={{ ...secTitle }}>Mutamers</td>
            </tr>
            <tr>
              <th style={{ ...hdr, width: "4%" }}>SNO</th>
              <th style={{ ...hdr, width: "11%" }}>Passport</th>
              <th style={{ ...hdr }}>Mutamer Name</th>
              <th style={{ ...hdr, width: "4%" }}>G</th>
              <th style={{ ...hdr, width: "8%" }}>PAX</th>
              <th style={{ ...hdr, width: "6%" }}>Bed</th>
              <th style={{ ...hdr, width: "7%" }}>MOFA #</th>
              <th style={{ ...hdr, width: "7%" }}>GRP #</th>
              <th style={{ ...hdr, width: "11%" }}>Visa #</th>
              <th style={{ ...hdr, width: "9%" }}>PNR</th>
            </tr>
          </thead>
          <tbody>
            {passengers.length > 0 ? passengers.map((p, i) => (
              <tr key={i}>
                <td style={cell}>{i + 1}</td>
                <td style={cell}>{p.passportNumber || "—"}</td>
                <td style={{ ...cell, textAlign: "left" }}>{`${p.firstName || ""} ${p.lastName || ""}`.trim()}</td>
                <td style={cell}>{(p.gender || "M").charAt(0).toUpperCase()}</td>
                <td style={cell}>Adult</td>
                <td style={cell}>{i % 2 === 0 ? "Lower" : "Upper"}</td>
                <td style={cell}>Yes</td>
                <td style={cell}>{String(booking.id).padStart(4,"0")}</td>
                <td style={cell}>—</td>
                <td style={cell}>{flight ? String((flight as Record<string,unknown>).pnr || "—") : "—"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={10} style={{ ...cell, color: "#888" }}>No passenger details</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── ACCOMMODATION TABLE ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
          <thead>
            <tr><td colSpan={9} style={secTitle}>Accommodation</td></tr>
            <tr>
              <th style={{ ...hdr, width: "10%" }}>City</th>
              <th style={{ ...hdr }}>Hotel Name</th>
              <th style={{ ...hdr, width: "9%" }}>View</th>
              <th style={{ ...hdr, width: "6%" }}>Meal</th>
              <th style={{ ...hdr, width: "8%" }}>Conf#</th>
              <th style={{ ...hdr, width: "14%" }}>Room Type</th>
              <th style={{ ...hdr, width: "10%" }}>Checkin</th>
              <th style={{ ...hdr, width: "10%" }}>Checkout</th>
              <th style={{ ...hdr, width: "7%" }}>Nights</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...cell, fontWeight: "bold", color: "#0d1b3e" }}>Makkah ①</td>
              <td style={{ ...cell, textAlign: "left", fontWeight: "bold" }}>{makkahHotel} / SIMILAR / SHUTTLE</td>
              <td style={cell}>Standard</td>
              <td style={cell}>RO</td>
              <td style={cell}>—</td>
              <td style={cell}>Sharing (Gender)</td>
              <td style={cell}>{makkahCheckIn}</td>
              <td style={cell}>{makkahCheckOut}</td>
              <td style={cell}>{makkahNights}</td>
            </tr>
            <tr>
              <td style={{ ...cell, fontWeight: "bold", color: "#1a6b35" }}>Madinah ②</td>
              <td style={{ ...cell, textAlign: "left", fontWeight: "bold" }}>{madinahHotel} &amp; SIMILAR</td>
              <td style={cell}>Standard</td>
              <td style={cell}>RO</td>
              <td style={cell}>—</td>
              <td style={cell}>Sharing (Gender)</td>
              <td style={cell}>{madinahCheckIn}</td>
              <td style={cell}>{madinahCheckOut}</td>
              <td style={cell}>{madinahNights}</td>
            </tr>
            {returnMakkahNights > 0 && (
              <tr style={{ backgroundColor: "#fffbe6" }}>
                <td style={{ ...cell, fontWeight: "bold", color: "#b45309" }}>Makkah ③</td>
                <td style={{ ...cell, textAlign: "left", fontWeight: "bold" }}>{returnMakkahHotel} / SIMILAR / SHUTTLE</td>
                <td style={cell}>Standard</td>
                <td style={cell}>RO</td>
                <td style={cell}>—</td>
                <td style={cell}>Sharing (Gender)</td>
                <td style={cell}>{retMakkahCheckIn}</td>
                <td style={cell}>{retMakkahCheckOut}</td>
                <td style={cell}>{returnMakkahNights}</td>
              </tr>
            )}
            <tr>
              <td colSpan={8} style={{ ...cell, textAlign: "right", fontWeight: "bold" }}>Total Nights:</td>
              <td style={{ ...cell, fontWeight: "bold" }}>{totalNights}</td>
            </tr>
          </tbody>
        </table>

        {/* ── TRANSPORT/SERVICES ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
          <thead>
            <tr><td colSpan={4} style={secTitle}>Transport/Services</td></tr>
            <tr>
              <th style={{ ...hdr, width: "14%" }}>Travel Date</th>
              <th style={{ ...hdr, width: "18%" }}>Transporter</th>
              <th style={{ ...hdr, width: "14%" }}>Type</th>
              <th style={hdr}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>{makkahCheckIn}</td>
              <td style={cell}>Company Transport</td>
              <td style={cell}>Economy By Bus</td>
              <td style={{ ...cell, textAlign: "left" }}>Round Trip (Jed-Mak-Med-Mak-Jed)</td>
            </tr>
          </tbody>
        </table>

        {/* ── FLIGHTS: Departure | Arrival side by side ── */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
          {/* Departure */}
          <table style={{ width: "50%", borderCollapse: "collapse" }}>
            <thead>
              <tr><td colSpan={4} style={{ ...secTitle, backgroundColor: "#c8c8c8" }}>Departure (Pakistan to KSA)</td></tr>
              <tr>
                <th style={{ ...hdr, fontSize: "11px" }}>Flight</th>
                <th style={{ ...hdr, fontSize: "11px" }}>Sector</th>
                <th style={{ ...hdr, fontSize: "11px" }}>Departure</th>
                <th style={{ ...hdr, fontSize: "11px" }}>Arrival</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...cell, fontSize: "11px" }}>{depFlight}</td>
                <td style={{ ...cell, fontSize: "11px" }}>{depSector}</td>
                <td style={{ ...cell, fontSize: "11px" }}>{depLabel}</td>
                <td style={{ ...cell, fontSize: "11px" }}>{arrLabel}</td>
              </tr>
            </tbody>
          </table>

          {/* QR + Arrival */}
          <table style={{ width: "50%", borderCollapse: "collapse" }}>
            <thead>
              <tr><td colSpan={4} style={{ ...secTitle, backgroundColor: "#c8c8c8" }}>Arrival (KSA to PAK)</td></tr>
              <tr>
                <th style={{ ...hdr, fontSize: "11px" }}>Flight</th>
                <th style={{ ...hdr, fontSize: "11px" }}>Sector</th>
                <th style={{ ...hdr, fontSize: "11px" }}>Departure</th>
                <th style={{ ...hdr, fontSize: "11px" }}>Arrival</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...cell, fontSize: "11px" }}>{retFlightNo}</td>
                <td style={{ ...cell, fontSize: "11px" }}>{retSector}</td>
                <td style={{ ...cell, fontSize: "11px" }}>{retDepLabel}</td>
                <td style={{ ...cell, fontSize: "11px" }}>{retArrLabel}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── SPECIAL INSTRUCTIONS ── */}
        <div style={{ border, padding: "5px 8px", marginBottom: "10px", fontSize: "12px" }}>
          <strong>Special Instructions:</strong>&nbsp; {booking.bookingRef} — ANS
        </div>

        {/* ── KPT MAKKAH TEAM ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
          <thead>
            <tr>
              <td colSpan={3} style={{
                border, textAlign: "center", fontWeight: "bold", fontSize: "13px",
                backgroundColor: "#0d1b3e", color: "#f5c842", padding: "5px",
              }}>KPT MAKKAH TEAM</td>
            </tr>
            <tr>
              <td colSpan={3} style={{ border, textAlign: "center", fontWeight: "bold", fontSize: "12px", padding: "4px", backgroundColor: "#e8e8e8" }}>
                Hotel Checkin Time 4pm &nbsp;&nbsp;&nbsp; Hotel Checkout Time &nbsp;12pm
              </td>
            </tr>
          </thead>
          <tbody>
            {KPT_MAKKAH.map((m, i) => (
              <tr key={i}>
                <td style={{ ...cell, textAlign: "left", width: "30%" }}>{m.name}</td>
                <td style={{ ...cell, textAlign: "left" }}>{m.role}</td>
                <td style={{ ...cell, width: "20%" }}>{m.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── KPT MADINAH TEAM ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
          <thead>
            <tr>
              <td colSpan={3} style={{
                border, textAlign: "center", fontWeight: "bold", fontSize: "13px",
                backgroundColor: "#1a6b35", color: "#ffffff", padding: "5px",
              }}>KPT MADINAH TEAM</td>
            </tr>
          </thead>
          <tbody>
            {KPT_MADINAH.map((m, i) => (
              <tr key={i}>
                <td style={{ ...cell, textAlign: "left", width: "30%" }}>{m.name}</td>
                <td style={{ ...cell, textAlign: "left" }}>{m.role}</td>
                <td style={{ ...cell, width: "20%" }}>{m.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: border, paddingTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#555" }}>
          <span>Booking Ref: <strong>{booking.bookingRef}</strong></span>
          <span>Total: PKR {Number(booking.totalAmount).toLocaleString()} | Pax: {passengers.length}</span>
          <span>Generated: {today}</span>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          @page { margin: 0.25in; size: A4 portrait; }
        }
      `}</style>
    </div>
  );
}
