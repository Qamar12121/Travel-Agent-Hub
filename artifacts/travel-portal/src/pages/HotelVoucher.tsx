import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetBooking, getGetBookingQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

function VoucherSkeleton() {
  return (
    <div className="max-w-[900px] mx-auto space-y-3">
      <div className="flex gap-3"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-32" /></div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}

function fmt(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}-${mm}-${yy}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

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
  const makkahNights = Number(pkg.makkahNights) || 0;
  const madinahNights = Number(pkg.madinahNights) || 0;

  const depDateStr = pkg.departureDate as string;
  const makkahCheckIn = fmt(depDateStr);
  const makkahCheckOut = fmt(addDays(depDateStr, makkahNights));
  const madinahCheckIn = makkahCheckOut;
  const madinahCheckOut = fmt(addDays(depDateStr, makkahNights + madinahNights));

  const flight = booking.flightGroup as Record<string, unknown> | null;
  const flightNumber = flight ? String(flight.flightNumber) : (String(pkg.airline || "PK") + "-XXX");
  const sector = flight
    ? `${String(flight.originCode || "MUX")}-${String(flight.destinationCode || "JED")}`
    : "MUX-JED";
  const depDate = flight ? String(flight.departureDate || depDateStr) : depDateStr;
  const depTime = flight ? String(flight.departureTime || "22:15") : "22:15";
  const arrTime = flight ? String(flight.arrivalTime || "02:15") : "02:15";

  const depLabel = (() => {
    const d = new Date(depDate);
    const day = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return `${day}-${mon} ${depTime}`;
  })();

  const arrLabel = (() => {
    const d = new Date(depDate);
    d.setDate(d.getDate() + 1);
    const day = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return `${day}-${mon} ${arrTime}`;
  })();

  const familyHead = passengers.length > 0
    ? `${passengers[0].firstName || ""} ${passengers[0].lastName || ""}`.trim()
    : booking.contactEmail;

  const voucherNo = String(booking.id || "").padStart(6, "0");
  const todayFmt = fmt(new Date().toISOString().slice(0, 10));
  const packageName = String(pkg.name || "Umrah Package");

  return (
    <div className="min-h-screen bg-[#f2f2f2] p-4 md:p-6 print:p-0 print:bg-white">

      {/* Controls */}
      <div className="max-w-[940px] mx-auto mb-4 flex items-center gap-3 print:hidden">
        <button
          onClick={() => setLocation(-1 as unknown as string)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm font-semibold hover:bg-gray-50 shadow-sm transition"
        >
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0d1b3e] text-white text-sm font-semibold shadow-sm hover:opacity-90 transition"
        >
          🖨 Print / Save PDF
        </button>
      </div>

      {/* Voucher */}
      <div className="max-w-[940px] mx-auto bg-white border-2 border-black p-5 relative" style={{ fontFamily: "Arial, sans-serif", fontSize: "13px" }}>

        {/* Approved Watermark */}
        <div style={{
          position: "absolute",
          color: "rgba(0,180,0,0.25)",
          fontSize: "64px",
          transform: "rotate(-35deg)",
          top: "420px",
          left: "100px",
          fontWeight: "bold",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}>
          Approved
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "center", marginBottom: "10px" }}>
          <div style={{ width: "35%", fontSize: "13px", fontWeight: "bold", lineHeight: "1.6", textAlign: "left" }}>
            BIN YASIN TRAVELS &amp; TOURS<br />
            Voucher Date: {todayFmt}<br />
            Package: {packageName}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "70px", height: "70px", borderRadius: "12px",
              background: "#0d1b3e", color: "#f5c842",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", fontWeight: "900", marginBottom: "4px"
            }}>BYT</div>
            <div style={{ fontWeight: "bold", fontSize: "15px" }}>بن یاسین ٹریولز</div>
          </div>
          <div style={{ width: "35%", fontSize: "13px", fontWeight: "bold", lineHeight: "1.6", textAlign: "right" }}>
            AL MASAR COMPANY FOR<br />
            UMRAH SERVICES<br />
            Islamabad<br />
            WhatsApp: +92-300-123-4567
          </div>
        </div>

        {/* Title */}
        <h2 style={{ textAlign: "center", margin: "10px 0", fontSize: "18px", fontWeight: "bold" }}>Hotel Voucher</h2>

        {/* Family Head row */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "13px" }}>
          <tbody>
            <tr>
              <th style={thStyle}>Family Head</th>
              <td style={tdStyle}>{familyHead}</td>
              <th style={thStyle}>UB</th>
              <td style={tdStyle}>{voucherNo}</td>
            </tr>
          </tbody>
        </table>

        {/* Passenger Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", fontSize: "13px" }}>
          <thead>
            <tr>
              <th style={thStyle}>SNO</th>
              <th style={thStyle}>Passport</th>
              <th style={thStyle}>Mutamer Name</th>
              <th style={thStyle}>Gender</th>
              <th style={thStyle}>PAX</th>
              <th style={thStyle}>MOFA</th>
              <th style={thStyle}>Visa</th>
            </tr>
          </thead>
          <tbody>
            {passengers.length > 0 ? passengers.map((p, i) => (
              <tr key={i}>
                <td style={tdStyle}>{i + 1}</td>
                <td style={tdStyle}>{p.passportNumber || "—"}</td>
                <td style={{ ...tdStyle, textAlign: "left" }}>{`${p.firstName || ""} ${p.lastName || ""}`.trim() || "—"}</td>
                <td style={tdStyle}>{(p.gender || "M").toUpperCase().charAt(0)}</td>
                <td style={tdStyle}>Adult</td>
                <td style={tdStyle}>Yes</td>
                <td style={tdStyle}>—</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: "center", color: "#888" }}>No passenger details</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Accommodation Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", fontSize: "13px" }}>
          <tbody>
            <tr>
              <td colSpan={8} style={sectionTitleStyle}>Accommodation</td>
            </tr>
            <tr>
              <th style={thStyle}>City</th>
              <th style={thStyle}>Hotel Name</th>
              <th style={thStyle}>View</th>
              <th style={thStyle}>Meal</th>
              <th style={thStyle}>Room Type</th>
              <th style={thStyle}>Check-in</th>
              <th style={thStyle}>Check-out</th>
              <th style={thStyle}>Nights</th>
            </tr>
            <tr>
              <td style={tdStyle}>Makkah</td>
              <td style={{ ...tdStyle, fontWeight: "bold" }}>{makkahHotel}</td>
              <td style={tdStyle}>Standard</td>
              <td style={tdStyle}>RO</td>
              <td style={tdStyle}>Sharing</td>
              <td style={tdStyle}>{makkahCheckIn}</td>
              <td style={tdStyle}>{makkahCheckOut}</td>
              <td style={tdStyle}>{makkahNights}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Madinah</td>
              <td style={{ ...tdStyle, fontWeight: "bold" }}>{madinahHotel}</td>
              <td style={tdStyle}>Standard</td>
              <td style={tdStyle}>RO</td>
              <td style={tdStyle}>Sharing</td>
              <td style={tdStyle}>{madinahCheckIn}</td>
              <td style={tdStyle}>{madinahCheckOut}</td>
              <td style={tdStyle}>{madinahNights}</td>
            </tr>
          </tbody>
        </table>

        {/* Flight Details Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", fontSize: "13px" }}>
          <tbody>
            <tr>
              <td colSpan={5} style={sectionTitleStyle}>Flight Details</td>
            </tr>
            <tr>
              <th style={thStyle}>Flight</th>
              <th style={thStyle}>Sector</th>
              <th style={thStyle}>Departure</th>
              <th style={thStyle}>Arrival</th>
              <th style={thStyle}>Status</th>
            </tr>
            <tr>
              <td style={tdStyle}>{flightNumber}</td>
              <td style={tdStyle}>{sector}</td>
              <td style={tdStyle}>{depLabel}</td>
              <td style={tdStyle}>{arrLabel}</td>
              <td style={{ ...tdStyle, color: "#007700", fontWeight: "bold" }}>Confirmed</td>
            </tr>
          </tbody>
        </table>

        {/* Special Instructions */}
        <div style={{ marginTop: "14px", border: "1px solid #000", padding: "10px", lineHeight: "1.7" }}>
          <strong>Special Instructions:</strong><br />
          Hotel Check-in Time: 4:00 PM (16:00)<br />
          Hotel Check-out Time: 12:00 PM (12:00)<br />
          Valid passport and Umrah visa required at hotel check-in.
        </div>

        {/* Footer */}
        <div style={{ marginTop: "18px", fontSize: "12px", lineHeight: "1.9" }}>
          <strong>KPT MAKKAH TEAM</strong><br />
          Muhammad Shahid &nbsp;+966576709725<br />
          Muhammad Qurban &nbsp;+966562950412<br />
          <br />
          <strong>KPT MADINAH TEAM</strong><br />
          Muhammad Yaseen &nbsp;+966581257860<br />
          Ahmad Riaz &nbsp;+966595604841
        </div>

        {/* Booking ref small print */}
        <div style={{ marginTop: "14px", borderTop: "1px solid #ccc", paddingTop: "6px", fontSize: "11px", color: "#666", display: "flex", justifyContent: "space-between" }}>
          <span>Booking Ref: <strong>{booking.bookingRef}</strong></span>
          <span>Total: PKR {Number(booking.totalAmount).toLocaleString()} &nbsp;|&nbsp; Pax: {passengers.length}</span>
          <span>Generated: {todayFmt}</span>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          @page { margin: 0.3in; size: A4 portrait; }
        }
      `}</style>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "6px 8px",
  textAlign: "center",
  backgroundColor: "#eaeaea",
  fontWeight: "bold",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "6px 8px",
  textAlign: "center",
};

const sectionTitleStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "6px 8px",
  textAlign: "center",
  backgroundColor: "#eaeaea",
  fontWeight: "bold",
};
