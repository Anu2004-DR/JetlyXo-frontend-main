"use client";

import { useEffect, useState } from "react";
import { cancelBooking } from "@/lib/api";

type Booking = {
  id: number;
  bookingType: string;
  totalPrice: number;
  status: string;
  createdAt: string;

  passengerName?: string;
  passengerPhone?: string;
  passengerEmail?: string;

  bus?: any;
  train?: any;
  flight?: any;
};

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch("http://localhost:5000/api/bookings");
      const data = await res.json();

      setBookings(data.data || []); // ✅ correct key
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: number) {
    try {
      await cancelBooking(String(id));

      // ✅ instant UI update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: "CANCELLED" } : b
        )
      );
    } catch (err) {
      console.error("Cancel failed", err);
    }
  }

  if (loading) {
    return <p className="text-white/60">Loading bookings...</p>;
  }

  if (!bookings.length) {
    return <p className="text-white/60">No bookings yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">✈ My Bookings</h2>

      {bookings.map((b) => {
        const isCancelled = b.status === "CANCELLED";

        // ✅ dynamic route extraction
        const from =
          b.bus?.fromCity ||
          b.train?.fromCity ||
          b.flight?.fromCity ||
          "N/A";

        const to =
          b.bus?.toCity ||
          b.train?.toCity ||
          b.flight?.toCity ||
          "N/A";

        return (
          <div
            key={b.id}
            className="bg-slate-800 p-5 rounded-xl border border-white/10 hover:shadow-lg transition"
          >
            {/* TOP */}
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-semibold">{b.bookingType}</p>

              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  isCancelled
                    ? "bg-red-500/20 text-red-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {b.status}
              </span>
            </div>

            {/* ROUTE */}
            <p className="text-white text-lg font-medium">
              {from} → {to}
            </p>

            {/* PASSENGER */}
            <p className="text-sm text-white/70 mt-1">
              👤 {b.passengerName}
            </p>

            <p className="text-sm text-white/50">
              📞 {b.passengerPhone} • ✉ {b.passengerEmail}
            </p>

            {/* DATE */}
            <p className="text-sm text-white/50 mt-2">
              {new Date(b.createdAt).toLocaleString()}
            </p>

            {/* FOOTER */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-xl font-bold text-white">
                ₹{b.totalPrice}
              </p>

              {!isCancelled && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-white text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}