import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetBooking, getGetBookingQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, ArrowLeft, Hotel, MapPin, Calendar, Moon, User, Phone, Mail } from "lucide-react";

function VoucherSkeleton() {
  return (
    <div className="max-w-[850px] mx-auto space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded border shadow-lg p-8 space-y-5 bg-white">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-1 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

const BRAND_COLOR = "#0d1b3e";
const GOLD = "#f5c842";

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
    <div className="min-h-screen bg-gray-100 p-4 print:bg-white">
      <VoucherSkeleton />
    </div>
  );

  if (!booking || !booking.package) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg p-10 shadow text-center space-y-3">
        <div className="text-5xl">🏨</div>
        <div className="font-bold text-lg text-gray-700">Voucher not available</div>
        <button
          onClick={() => setLocation(-1 as unknown as string)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    </div>
  );

  const pkg = booking.package as Record<string, unknown>;
  const passengers = (booking.passengersInfo as Array<Record<string, string>>) || [];

  const makkahHotel = (pkg.makkahHotel as string) || (pkg.hotel as string) || "Makkah Hotel";
  const madinahHotel = (pkg.madinahHotel as string) || "Madinah Hotel";
  const makkahNights = (pkg.makkahNights as number) ?? 0;
  const madinahNights = (pkg.madinahNights as number) ?? 0;
  const hotelRating = (pkg.hotelRating as number) ?? 4;

  const depDate = new Date(pkg.departureDate as string);
  const makkahCheckIn = depDate.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const makkahCheckOut = new Date(depDate.getTime() + makkahNights * 86400000)
    .toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const madinahCheckIn = makkahCheckOut;
  const madinahCheckOut = new Date(depDate.getTime() + (makkahNights + madinahNights) * 86400000)
    .toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  const stars = "★".repeat(hotelRating) + "☆".repeat(Math.max(0, 5 - hotelRating));
  const issueDate = new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const isConfirmed = booking.status === "confirmed";

  return (
    <div className="min-h-screen bg-[#f2f2f2] p-4 md:p-6 print:p-0 print:bg-white">

      {/* Controls */}
      <div className="max-w-[850px] mx-auto mb-5 flex items-center gap-3 print:hidden">
        <button
          onClick={() => setLocation(-1 as unknown as string)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm font-semibold hover:bg-gray-50 shadow-sm transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-sm hover:opacity-90 transition"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

      {/* Voucher Body */}
      <div
        className="max-w-[850px] mx-auto bg-white shadow-lg print:shadow-none"
        style={{ borderTop: `10px solid ${BRAND_COLOR}`, fontFamily: "Arial, sans-serif" }}
      >
        <div className="px-8 py-6 print:px-6 print:py-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl"
                style={{ backgroundColor: BRAND_COLOR, color: GOLD }}
              >
                BYT
              </div>
              <div>
                <div className="font-black text-xl" style={{ color: BRAND_COLOR }}>Bin Yasin Travels</div>
                <div className="text-sm text-gray-500">بن یاسین ٹریولز | Hotel Accommodation Voucher</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Voucher No.</div>
              <div className="text-2xl font-black" style={{ color: BRAND_COLOR }}>{booking.bookingRef}</div>
              <div
                className="text-xs font-bold px-3 py-1 rounded mt-1 inline-block"
                style={{
                  backgroundColor: isConfirmed ? "#dcfce7" : "#fef3c7",
                  color: isConfirmed ? "#166534" : "#92400e",
                }}
              >
                {isConfirmed ? "✓ CONFIRMED" : booking.status.replace("_", " ").toUpperCase()}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-5" style={{ borderBottom: `3px solid ${BRAND_COLOR}` }} />

          {/* Package Title */}
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: BRAND_COLOR }}>
            <div className="text-white text-xs uppercase tracking-widest mb-1 opacity-70">Package</div>
            <div className="text-white font-black text-lg">{String(pkg.name)}</div>
            <div className="flex gap-4 mt-2 text-xs" style={{ color: GOLD }}>
              <span>✈ {String(pkg.airline)}</span>
              <span>📅 {String(pkg.departureDate)} → {String(pkg.returnDate)}</span>
              <span>⏱ {String(pkg.duration)} Days</span>
            </div>
          </div>

          {/* Hotels Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">

            {/* Makkah Hotel */}
            <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: BRAND_COLOR }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: BRAND_COLOR }}>
                <Hotel className="h-4 w-4 text-white" />
                <span className="text-white font-black text-sm uppercase tracking-wide">Makkah Al-Mukarramah</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-400 uppercase mb-0.5">Hotel Name</div>
                  <div className="font-black text-base" style={{ color: BRAND_COLOR }}>{makkahHotel}</div>
                  <div className="text-xs mt-0.5" style={{ color: GOLD }}>{"★".repeat(Math.min(hotelRating, 5))}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 uppercase mb-0.5">Check-In</div>
                    <div className="font-bold text-sm">{makkahCheckIn}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase mb-0.5">Check-Out</div>
                    <div className="font-bold text-sm">{makkahCheckOut}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <Moon className="h-4 w-4 text-gray-500" />
                  <span className="font-bold text-sm">{makkahNights} Nights</span>
                  <span className="text-xs text-gray-400 ml-auto">Near Masjid Al-Haram</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" /> Makkah, Kingdom of Saudi Arabia
                </div>
              </div>
            </div>

            {/* Madinah Hotel */}
            <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: "#1a7a4a" }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "#1a7a4a" }}>
                <Hotel className="h-4 w-4 text-white" />
                <span className="text-white font-black text-sm uppercase tracking-wide">Madinah Al-Munawwarah</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-400 uppercase mb-0.5">Hotel Name</div>
                  <div className="font-black text-base" style={{ color: "#1a7a4a" }}>{madinahHotel}</div>
                  <div className="text-xs mt-0.5 text-amber-400">{stars}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 uppercase mb-0.5">Check-In</div>
                    <div className="font-bold text-sm">{madinahCheckIn}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase mb-0.5">Check-Out</div>
                    <div className="font-bold text-sm">{madinahCheckOut}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <Moon className="h-4 w-4 text-gray-500" />
                  <span className="font-bold text-sm">{madinahNights} Nights</span>
                  <span className="text-xs text-gray-400 ml-auto">Near Masjid an-Nabawi</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" /> Madinah, Kingdom of Saudi Arabia
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Table */}
          <div className="text-[18px] font-black mb-3" style={{ color: BRAND_COLOR }}>GUEST DETAILS</div>
          <table className="w-full border-collapse mb-6 text-sm">
            <thead>
              <tr style={{ backgroundColor: BRAND_COLOR }}>
                {["SR", "PASSENGER NAME", "PASSPORT NO.", "NATIONALITY", "ROOM TYPE"].map(h => (
                  <th key={h} className="text-left text-white px-3 py-3 text-[13px] font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {passengers.length > 0 ? passengers.map((p, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2.5 font-bold text-[13px]">{i + 1}</td>
                  <td className="px-3 py-2.5 font-bold text-[13px] uppercase">{p.firstName} {p.lastName}</td>
                  <td className="px-3 py-2.5 font-semibold text-[13px] font-mono">{p.passportNumber}</td>
                  <td className="px-3 py-2.5 text-[13px]">{p.nationality || "Pakistani"}</td>
                  <td className="px-3 py-2.5 text-[13px]">Standard Double</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-center text-gray-400 text-sm">No passenger details</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Inclusions */}
          <div className="text-[18px] font-black mb-3" style={{ color: BRAND_COLOR }}>INCLUDED SERVICES</div>
          <div className="mb-5" style={{ borderBottom: `2px solid ${BRAND_COLOR}` }} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {["Breakfast & Dinner", "Airport Transfers", "Makkah City Ziyarat", "Madinah City Ziyarat", "24/7 Tour Guide", "Zamzam Water"].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-600 font-bold">✓</span> {item}
              </div>
            ))}
          </div>

          {/* Contact & Booking Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-gray-50 border text-sm">
            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Contact Email</div>
              <div className="flex items-center gap-1.5 font-medium"><Mail className="h-3.5 w-3.5" /> {booking.contactEmail}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Contact Phone</div>
              <div className="flex items-center gap-1.5 font-medium"><Phone className="h-3.5 w-3.5" /> {booking.contactPhone}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Total Passengers</div>
              <div className="flex items-center gap-1.5 font-medium"><User className="h-3.5 w-3.5" /> {passengers.length} Pax</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Total Amount</div>
              <div className="font-black text-base" style={{ color: BRAND_COLOR }}>PKR {Number(booking.totalAmount).toLocaleString()}</div>
            </div>
          </div>

          {/* Terms */}
          <div className="text-[14px] font-bold leading-[1.9] text-gray-700 mb-6">
            <b>TERMS & CONDITIONS:</b><br />
            1- HOTEL CHECK-IN TIME IS 14:00 (2:00 PM). EARLY CHECK-IN SUBJECT TO AVAILABILITY.<br />
            2- CHECK-OUT TIME IS 12:00 (12:00 PM). LATE CHECK-OUT CHARGES MAY APPLY.<br />
            3- VALID PASSPORT AND UMRAH VISA REQUIRED AT HOTEL CHECK-IN.<br />
            4- HOTEL IS SUBJECT TO CHANGE WITH EQUIVALENT OR HIGHER CATEGORY.<br />
            5- THIS IS AN ELECTRONICALLY GENERATED VOUCHER — NO SIGNATURE REQUIRED.
          </div>

          {/* Footer */}
          <div
            className="mt-4 pt-4 flex items-center justify-between text-[12px] text-white px-4 py-3 rounded"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            <div>
              <div className="font-black">Bin Yasin Travels</div>
              <div className="opacity-70">Shop #12, Al-Haramain Plaza, Ferozepur Road, Lahore | +92-300-123-4567</div>
            </div>
            <div className="font-mono opacity-70 text-right">
              Issued: {issueDate}
            </div>
          </div>

        </div>
      </div>

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
