import { Router, type IRouter } from "express";
import { db, bookingsTable, flightGroupsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetTicketParams } from "@workspace/api-zod";

const router: IRouter = Router();

function generateTicketNumber(): string {
  return "TKT" + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
}

function generateSeat(): string {
  const row = Math.floor(Math.random() * 40) + 1;
  const seat = ["A", "B", "C", "D", "E", "F"][Math.floor(Math.random() * 6)];
  return `${row}${seat}`;
}

router.get("/tickets/:bookingId", async (req, res): Promise<void> => {
  const params = GetTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid bookingId" });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.bookingId));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  let flightData = {
    flightNumber: "N/A",
    airline: "N/A",
    airlineCode: "N/A",
    origin: "N/A",
    originCode: "N/A",
    destination: "N/A",
    destinationCode: "N/A",
    departureDate: "N/A",
    departureTime: "N/A",
    arrivalTime: "N/A",
    class: "Economy",
    baggage: "23 KG",
    pnr: booking.bookingRef,
  };

  if (booking.flightGroupId) {
    const [fg] = await db.select().from(flightGroupsTable).where(eq(flightGroupsTable.id, booking.flightGroupId));
    if (fg) {
      flightData = {
        flightNumber: fg.flightNumber,
        airline: fg.airline,
        airlineCode: fg.airlineCode,
        origin: fg.origin,
        originCode: fg.originCode,
        destination: fg.destination,
        destinationCode: fg.destinationCode,
        departureDate: fg.departureDate,
        departureTime: fg.departureTime,
        arrivalTime: fg.arrivalTime,
        class: fg.class,
        baggage: fg.baggage ?? "23 KG",
        pnr: fg.pnr,
      };
    }
  }

  const passengers = Array.isArray(booking.passengersInfo) ? booking.passengersInfo : [];
  const firstPassenger = passengers[0] as Record<string, string> | undefined;

  res.json({
    ticketNumber: generateTicketNumber(),
    bookingRef: booking.bookingRef,
    passengerName: firstPassenger ? `${firstPassenger.firstName} ${firstPassenger.lastName}` : "Passenger",
    passportNumber: firstPassenger?.passportNumber ?? "N/A",
    ...flightData,
    seat: generateSeat(),
    status: booking.status,
    issuedAt: new Date().toISOString(),
    barcode: Math.random().toString(36).substring(2, 20).toUpperCase(),
  });
});

export default router;
