"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Card({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="bg-slate-700 rounded-xl p-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-lg font-semibold break-words">
        {value || "-"}
      </p>
    </div>
  );
}

function BookingSuccessContent() {
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("bookingDetails");

    if (!data) {
      router.push("/");
      return;
    }

    setBooking(JSON.parse(data));
  }, [router]);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xl">
        Loading Booking...
      </div>
    );
  }

  /* ==========================
     Extract fields safely
  ========================== */

  const bookingCode =
    booking.code ||
    booking.bookingCode ||
    booking.bookingReference ||
    "-";

  const pnr =
    booking.pnr ||
    booking.PNR ||
    booking.providerPNR ||
    booking.airlinePNR ||
    "-";

  const passenger =
    booking.passenger_name ||
    booking.passengerName ||
    booking.pax?.[0]?.name ||
    booking.pax?.[0]?.fn +
      " " +
      booking.pax?.[0]?.ln ||
    "-";

  const airline =
    booking.airline ||
    booking.airlineName ||
    booking.airline_name ||
    booking.flight?.airline ||
    "-";

  const flightNumber =
    booking.flightNumber ||
    booking.flight_no ||
    booking.flight?.flightNumber ||
    "-";

  const origin =
    booking.origin ||
    booking.org ||
    booking.flight?.origin ||
    "-";

  const destination =
    booking.destination ||
    booking.dst ||
    booking.flight?.destination ||
    "-";

  const departure =
    booking.departure ||
    booking.dep ||
    booking.flight?.departure ||
    "-";

  const arrival =
    booking.arrival ||
    booking.arr ||
    booking.flight?.arrival ||
    "-";

  const seat =
    booking.seat ||
    booking.seatNo ||
    booking.pax?.[0]?.seat ||
    "Not Selected";

  const meal =
    booking.meal ||
    booking.mealName ||
    booking.pax?.[0]?.meal ||
    "No Meal";

  const fare =
    booking.totalFare ||
    booking.amount ||
    booking.np ||
    booking.price ||
    0;

  const status =
    booking.status ||
    "Confirmed";

  const ticketUrl =
    booking.pdfUrl ||
    booking.ticketUrl ||
    booking.eTicketUrl ||
    "";

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 text-white">

      <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-slate-800">

        {/* Header */}

        <div className="bg-green-600 text-center py-8">

          <div className="text-6xl">
            ✅
          </div>

          <h1 className="text-4xl font-bold mt-2">
            Booking Confirmed
          </h1>

          <p className="text-green-100 mt-2">
            Your flight has been successfully booked.
          </p>

        </div>

        {/* Flight Banner */}

        <div className="border-b border-slate-700 p-8">

          <div className="flex flex-col md:flex-row justify-between items-center">

            <div>

              <h2 className="text-3xl font-bold">
                {origin}
                <span className="mx-4">
                  ✈
                </span>
                {destination}
              </h2>

              <p className="text-gray-300 mt-2">
                {airline} {flightNumber}
              </p>

            </div>

            <div className="text-right">

              <p className="text-sm text-gray-400">
                Booking Status
              </p>

              <p className="text-2xl font-bold text-green-400">
                {status}
              </p>

            </div>

          </div>

        </div>

        {/* Details */}

        <div className="p-8">

          <h2 className="text-2xl font-bold mb-6">
            Booking Details
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <Card
              title="Booking Code"
              value={bookingCode}
            />

            <Card
              title="PNR"
              value={pnr}
            />

            <Card
              title="Passenger"
              value={passenger}
            />

            <Card
              title="Airline"
              value={`${airline} ${flightNumber}`}
            />

            <Card
              title="Departure"
              value={departure}
            />

            <Card
              title="Arrival"
              value={arrival}
            />

            <Card
              title="Seat"
              value={seat}
            />

            <Card
              title="Meal"
              value={meal}
            />

            <Card
              title="Total Fare"
              value={`₹${fare}`}
            />

            <Card
              title="Status"
              value={status}
            />

          </div>

          {/* Buttons */}

          <div className="grid md:grid-cols-3 gap-4 mt-10">

            <button
              disabled={!ticketUrl}
              onClick={() =>
                window.open(ticketUrl, "_blank")
              }
              className="bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              📄 Download Ticket
            </button>

            <button
              onClick={() =>
                router.push("/my-booking")
              }
              className="bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-semibold"
            >
              📖 My Bookings
            </button>

            <button
              onClick={() => router.push("/")}
              className="bg-slate-600 hover:bg-slate-500 py-3 rounded-xl font-semibold"
            >
              🏠 Home
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          Loading...
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}