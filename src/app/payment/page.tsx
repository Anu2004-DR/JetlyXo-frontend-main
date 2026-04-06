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

      // 1️⃣ CREATE ORDER
      const orderRes = await fetch("http://localhost:5000/api/payment/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: Number(bookingId),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert(orderData.message || "Failed to create order");
        return;
      }

      const order = orderData.order;

      // 2️⃣ RAZORPAY OPTIONS
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "JetlyXO",
        description: "Booking Payment",
        order_id: order.id,

        handler: async function (response: any) {
          try {
            // 3️⃣ VERIFY PAYMENT
            const verifyRes = await fetch(
              "http://localhost:5000/api/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: Number(bookingId),
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              alert(verifyData.message || "Payment verification failed");
              return;
            }

            // ✅ SUCCESS → GO TO TICKET
            router.push(`/ticket?bookingId=${bookingId}`);

          } catch (err) {
            console.error("VERIFY ERROR:", err);
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: "Jetly User",
          email: "test@gmail.com",
        },

        theme: {
          color: "#2563eb",
        },
      };

      // 4️⃣ OPEN RAZORPAY
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

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

        <p className="text-center text-sm text-gray-300">
          Booking ID: <span className="font-bold">{bookingId}</span>
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