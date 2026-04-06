"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { getBookingById } from "@/lib/api";

/* =========================
   TYPES
========================= */

type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

type Booking = {
  id: number;
  pnr: string;
  passengerName: string;
  bookingType: "BUS" | "TRAIN" | "FLIGHT";
  totalPrice: number;
  status: BookingStatus;
};

/* =========================
   COMPONENT
========================= */

export default function TicketPage() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get("bookingId");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH BOOKING (FIXED)
  ========================= */
  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const res = await getBookingById(Number(bookingId));
        setBooking(res.data);
      } catch (err: any) {
        console.error("FETCH ERROR:", err);
        alert(err.message || "Unauthorized access");
        router.push("/login"); // redirect if token invalid
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router]);

  /* =========================
     STATES
  ========================= */

  if (!bookingId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        Invalid Ticket (No Booking ID)
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        Loading ticket...
      </div>
    );
  }

  //if (!booking || booking.status !== "CONFIRMED") 
  if (!booking){
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        Booking not confirmed
      </div>
    );
  }

  /* =========================
     DOWNLOAD PDF
  ========================= */
  const downloadTicket = async () => {
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(20);
    doc.text("JetlyXO Travel Ticket", 20, y);

    y += 10;
    doc.line(20, y, 190, y);

    y += 15;

    doc.setFontSize(12);

    doc.text(`PNR: ${booking.pnr}`, 20, y);
    y += 10;

    doc.text(`Booking ID: ${booking.id}`, 20, y);
    y += 10;

    doc.text(`Passenger: ${booking.passengerName}`, 20, y);
    y += 10;

    doc.text(`Type: ${booking.bookingType}`, 20, y);
    y += 10;

    doc.text(`Amount Paid: ₹${booking.totalPrice}`, 20, y);
    y += 15;

    doc.setTextColor(0, 150, 0);
    doc.text("Status: CONFIRMED", 20, y);

    try {
      const qrData = `PNR:${booking.pnr}|ID:${booking.id}`;
      const qrImage = await QRCode.toDataURL(qrData);

      doc.addImage(qrImage, "PNG", 140, 20, 40, 40);
    } catch (err) {
      console.error("QR ERROR:", err);
    }

    doc.save(`JetlyXO_Ticket_${booking.id}.pdf`);
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-white p-4">

      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-blue-600 text-white p-5">

          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">✈️ JetlyXO Ticket</h1>

            <button
              onClick={() => router.push("/")}
              className="text-sm bg-white/20 backdrop-blur px-3 py-1 rounded-lg font-semibold hover:bg-white/30 transition"
            >
              Home
            </button>
          </div>

          <div className="flex justify-between items-center mt-3">
            <div>
              <p className="text-sm opacity-80">PNR</p>
              <p className="text-lg font-bold">{booking.pnr}</p>
            </div>

            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              CONFIRMED
            </span>
          </div>

        </div>

        {/* BODY */}
        <div className="p-5 space-y-5">

          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Passenger Details
            </h2>
            <p className="text-lg font-semibold">
              {booking.passengerName}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Journey Details
            </h2>
            <p><span className="font-semibold">Type:</span> {booking.bookingType}</p>
            <p><span className="font-semibold">Booking ID:</span> {booking.id}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Payment Details
            </h2>
            <p className="text-xl font-bold text-green-600">
              ₹{booking.totalPrice}
            </p>
            <p className="text-sm text-gray-500">
              Payment Successful
            </p>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-5 border-t space-y-3">

          <button
            onClick={downloadTicket}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Download Ticket (PDF + QR)
          </button>

          <button
            onClick={() => router.push("/my-booking")}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            My Bookings
          </button>

        </div>

      </div>
    </div>
  );
}