"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import apiClient from "@/lib/apiClient";
import api from "@/lib/axios";


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
  
  function loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handlePayment() {
    try {
      setLoading(true);
  
      const token = localStorage.getItem("jetly_token"); // ✅ FIXED
  
      if (!token) {
        alert("Please login first");
        return;
      }
  
      // ❌ REMOVE loadRazorpay() if already in layout
  
      // 1. CREATE ORDER
      const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ IMPORTANT
        },
        body: JSON.stringify({ bookingId }),
      });
  
      const orderData = await orderRes.json();
  
      console.log("ORDER:", orderData);
  
      if (!orderData.id) {
        alert("Invalid order response");
        return;
      }
  
      // 2. OPEN RAZORPAY
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "JetlyXO",
        description: "Booking Payment",
        order_id: orderData.id,
  
        handler: async function (response: any) {
          // 3. VERIFY PAYMENT
          const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...response,
              bookingId,
            }),
          });
  
          const verifyData = await verifyRes.json();
  
          if (verifyData.success) {
            router.push(`/ticket?bookingId=${bookingId}`);
          } else {
            alert("Payment verification failed");
          }
        },
  
        modal: {
          ondismiss: () => alert("Payment cancelled"),
        },
  
        theme: {
          color: "#16a34a",
        },
      };
  
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
  
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

  <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">

    <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
      💳 JetlyXO Payment
    </h1>

    <p className="text-xs sm:text-sm text-gray-300 text-center">
      Booking ID: <span className="font-bold">{bookingId}</span>
    </p>

    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full sm:w-auto bg-green-600 py-3 px-6 mt-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          Processing...
        </span>
      ) : (
        "Pay Now"
      )}
    </button>

  </div>

</div>
  );
}
