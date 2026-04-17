"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { getBookingById } from "@/lib/api";

type Booking = {
  id: number;
  pnr: string;
  passengerName: string;
  bookingType: "BUS" | "TRAIN" | "FLIGHT";
  totalPrice: number;
  status: string;
};

function TicketPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get("bookingId");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;

    const loadBooking = async () => {
      try {
        const res = await getBookingById(Number(bookingId));
        setBooking(res.data);
      } catch (err) {
        router.push("/my-bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, router]);

  const downloadTicket = async () => {
    if (!booking) return;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Jetly Travel Ticket", 20, 20);

    doc.setFontSize(12);
    doc.text(`PNR: ${booking.pnr}`, 20, 40);
    doc.text(`Booking ID: ${booking.id}`, 20, 50);
    doc.text(`Passenger: ${booking.passengerName}`, 20, 60);
    doc.text(`Type: ${booking.bookingType}`, 20, 70);
    doc.text(`Amount Paid: ₹${booking.totalPrice}`, 20, 80);
    doc.text(`Status: CONFIRMED`, 20, 90);

    const qr = await QRCode.toDataURL(
      `PNR:${booking.pnr}|BOOKING:${booking.id}`
    );

    doc.addImage(qr, "PNG", 140, 30, 40, 40);

    doc.save(`Jetly_Ticket_${booking.id}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading ticket...
      </div>
    );
  }

  if (!booking || booking.status !== "CONFIRMED") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xl">Booking not confirmed</p>
        <button
          onClick={() => router.push("/my-bookings")}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl overflow-hidden bg-white shadow-2xl">

        <div className="bg-blue-600 text-white p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm opacity-80">Jetly Ticket</p>
              <h1 className="text-3xl font-bold mt-1">Confirmed</h1>
            </div>

            <div className="text-right">
              <p className="text-sm opacity-80">PNR</p>
              <p className="font-bold text-xl">{booking.pnr}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 text-black">
          <div>
            <p className="text-gray-500 text-sm">Passenger</p>
            <p className="text-xl font-semibold">{booking.passengerName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Booking ID</p>
              <p className="font-semibold">{booking.id}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Type</p>
              <p className="font-semibold">{booking.bookingType}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Amount Paid</p>
              <p className="font-semibold text-green-600">
                ₹{booking.totalPrice}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Status</p>
              <p className="font-semibold text-green-600">
                Confirmed
              </p>
            </div>
          </div>

          <button
            onClick={downloadTicket}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
          >
            Download PDF Ticket
          </button>

          <button
            onClick={() => router.push("/my-bookings")}
            className="w-full border py-3 rounded-xl font-semibold"
          >
            My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TicketPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TicketPageContent />
    </Suspense>
  );
}