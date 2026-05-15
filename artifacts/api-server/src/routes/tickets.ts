import { Router, type IRouter } from "express";
import { db, bookingsTable, flightGroupsTable, packagesTable } from "@workspace/db";
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
    origin: "Multan",
    originCode: "MUX",
    destination: "Jeddah",
    destinationCode: "JED",
    departureDate: "N/A",
    departureTime: "N/A",
    arrivalTime: "N/A",
    class: "Economy",
    baggage: "23 KG",
    pnr: booking.bookingRef,
  };

  let returnFlight: null | {
    flightNumber: string;
    origin: string;
    originCode: string;
    destination: string;
    destinationCode: string;
    departureDate: string;
    departureTime: string;
    arrivalTime: string;
    class: string;
    baggage: string;
  } = null;

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

  if (booking.packageId) {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, booking.packageId));
    if (pkg) {
      const airlineCode = pkg.airline.substring(0, 2).toUpperCase();
      const flightNo = pkg.flightNumber ?? `${airlineCode}-001`;
      const depTime = pkg.departureTime ?? "07:00";
      const arrTime = pkg.arrivalTime ?? "10:30";
      flightData = {
        flightNumber: flightNo,
        airline: pkg.airline,
        airlineCode,
        origin: "Multan",
        originCode: "MUX",
        destination: "Jeddah",
        destinationCode: "JED",
        departureDate: pkg.departureDate,
        departureTime: depTime,
        arrivalTime: arrTime,
        class: "Economy",
        baggage: "30 KG",
        pnr: booking.bookingRef,
      };
      returnFlight = {
        flightNumber: `${airlineCode}-002`,
        origin: "Jeddah",
        originCode: "JED",
        destination: "Multan",
        destinationCode: "MUX",
        departureDate: pkg.returnDate,
        departureTime: "03:30",
        arrivalTime: "08:00",
        class: "Economy",
        baggage: "30 KG",
      };
    }
  }

  const passengers = Array.isArray(booking.passengersInfo) ? booking.passengersInfo : [];
  const firstPassenger = passengers[0] as Record<string, string> | undefined;

  const passengerDetails = passengers.map((p, idx) => {
    const pass = p as Record<string, string>;
    return {
      sr: idx + 1,
      name: `${pass.firstName ?? ""} ${pass.lastName ?? ""}`.trim() || "Passenger",
      passportNumber: pass.passportNumber ?? "N/A",
      ticketNumber: generateTicketNumber(),
      seat: generateSeat(),
      nationality: pass.nationality ?? "N/A",
      dateOfBirth: pass.dateOfBirth ?? "N/A",
    };
  });

  if (passengerDetails.length === 0) {
    passengerDetails.push({
      sr: 1,
      name: "Passenger",
      passportNumber: "N/A",
      ticketNumber: generateTicketNumber(),
      seat: generateSeat(),
      nationality: "N/A",
      dateOfBirth: "N/A",
    });
  }

  res.json({
    ticketNumber: passengerDetails[0].ticketNumber,
    bookingRef: booking.bookingRef,
    passengerName: firstPassenger ? `${firstPassenger.firstName} ${firstPassenger.lastName}` : "Passenger",
    passportNumber: firstPassenger?.passportNumber ?? "N/A",
    passengers: passengerDetails,
    returnFlight,
    ...flightData,
    seat: passengerDetails[0].seat,
    status: booking.status,
    issuedAt: new Date().toISOString(),
    barcode: Math.random().toString(36).substring(2, 20).toUpperCase(),
  });
});

export default router;
