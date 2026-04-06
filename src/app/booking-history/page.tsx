"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: number;
  passengerName: string;
  bookingType: string;
  status: string;
  totalPrice: number;

  flight?: { airline: string };
  bus?: { name: string };
  train?: { name: string };
};

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  

  // ✅ SUCCESS STATE
  const [successId, setSuccessId] = useState<number | null>(null);
  
  /* ===========================
     FETCH HISTORY
  =========================== */
  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/bookings/history"
      );

      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error(error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     CANCEL BOOKING (FIXED)
  =========================== */
  const cancelBooking = async (bookingId: number) => {
    console.log("CLICKED:", bookingId);
  
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      // ✅ CHECK RESPONSE FIRST
      if (!res.ok) {
        throw new Error("Server error");
      }
  
      const data = await res.json();
  
      console.log("API RESPONSE:", data);
  
      if (data.success) {
        console.log("SUCCESS");
      
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: "CANCELLED" }
              : b
          )
        );
      
        // ✅ SHOW SUCCESS MESSAGE
        setSuccessId(bookingId);
      
        // ✅ AUTO HIDE AFTER 2 SEC
        setTimeout(() => {
          setSuccessId(null);
        }, 2000);
      } else {
        console.error("API ERROR:", data.message);
      }
  
    } catch (error) {
      console.error("CANCEL FAILED:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  /* ===========================
     UI
  =========================== */

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Booking History
      </h1>

      {loading && <p>Loading bookings...</p>}

      {!loading && bookings.length === 0 && (
        <p>No bookings found</p>
      )}

      {!loading &&
        bookings.map((booking) => (
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
              <span
                style={{
                  color:
                    booking.status === "CONFIRMED"
                      ? "green"
                      : "red",
                }}
              >
                {booking.status}
              </span>
            </p>

            <p><b>Price:</b> ₹{booking.totalPrice}</p>

            {booking.flight && <p><b>Flight:</b> {booking.flight.airline}</p>}
            {booking.bus && <p><b>Bus:</b> {booking.bus.name}</p>}
            {booking.train && <p><b>Train:</b> {booking.train.name}</p>}

            {/* ✅ SUCCESS MESSAGE */}
            {successId === booking.id && (
              <p style={{ color: "green", marginTop: "8px" }}>
                ✅ Booking cancelled successfully
              </p>
            )}

            {/* CANCEL BUTTON */}
            {booking.status === "CONFIRMED" && (
              <button
                onClick={() => cancelBooking(booking.id)}
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
        ))}
    </div>
  );
}