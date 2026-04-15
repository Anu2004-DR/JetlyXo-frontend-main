"use client";

import { useEffect, useState } from "react";
import { fetchBookings, cancelBooking, type Booking } from "@/lib/api";

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [successId, setSuccessId] = useState<number | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch booking history", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    try {
      await cancelBooking(String(bookingId));
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: "CANCELLED" } : booking
        )
      );
      setSuccessId(bookingId);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (error) {
      console.error("Cancel failed", error);
      alert("Failed to cancel booking");
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Booking History</h1>

      {loading && <p>Loading bookings...</p>}
      {!loading && bookings.length === 0 && <p>No bookings found</p>}

      {!loading &&
        bookings.map((booking) => {
          const busName = booking.bus?.busName || booking.bus?.operator || booking.bus?.name;
          const trainName = booking.train?.trainName || booking.train?.name;

          return (
            <div
              key={booking.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "15px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3>{booking.bookingType} Booking</h3>
              <p><b>Passenger:</b> {booking.passengerName}</p>
              <p>
                <b>Status:</b>{" "}
                <span style={{ color: booking.status === "CONFIRMED" ? "green" : "red" }}>
                  {booking.status}
                </span>
              </p>
              <p><b>Price:</b> INR {booking.totalPrice}</p>

              {booking.flight && <p><b>Flight:</b> {booking.flight.airline}</p>}
              {booking.bus && <p><b>Bus:</b> {busName}</p>}
              {booking.train && <p><b>Train:</b> {trainName}</p>}

              {successId === booking.id && (
                <p style={{ color: "green", marginTop: "8px" }}>
                  Booking cancelled successfully
                </p>
              )}

              {booking.status === "CONFIRMED" && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  style={{
                    marginTop: "10px",
                    padding: "8px 12px",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          );
        })}
    </div>
  );
}
