"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  
  const bookingId = params.get("bookingId");

  if (!bookingId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        Invalid Payment Request (Booking ID missing)
      </div>
    );
  }

  async function handlePayment() {
    try {
      setLoading(true);
  
      const res = await fetch("http://localhost:5000/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: Number(bookingId),
          paymentStatus: "SUCCESS", 
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        alert(data.message || "Payment failed");
        return;
      }
  
      /* ✅ SUCCESS → GO TO TICKET */
      router.push(`/ticket?bookingId=${bookingId}`);
  
    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-[400px]">

        <h1 className="text-2xl font-bold mb-6 text-center">
          💳 JetlyXO Payment
        </h1>

        {/*  Minimal UI now */}
        <p className="text-center text-sm text-gray-300">
          Processing booking ID: <span className="font-bold">{bookingId}</span>
        </p>

        <button
  onClick={handlePayment}
  disabled={loading}
  className="bg-green-600 w-full py-2 mt-6 rounded-lg disabled:opacity-50"
>
  {loading ? "Processing..." : "Pay Now"}
</button>

      </div>
    </div>
  );
}