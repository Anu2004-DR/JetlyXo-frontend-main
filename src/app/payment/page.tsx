"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getToken } from "@/lib/auth";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

 
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };


  const handlePayment = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      const sdkLoaded = await loadRazorpay();

      if (!sdkLoaded) {
        alert("Failed to load Razorpay");
        return;
      }

      
      const orderRes = await fetch(
        "http://localhost:5000/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId }),
        }
      );

      const orderData = await orderRes.json();

      console.log("ORDER RESPONSE:", orderData);

      if (!orderRes.ok || !orderData.success || !orderData.order?.id) {
        alert(orderData.message || "Order creation failed");
        return;
      }

      const order = orderData.order;

      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

        name: "JetlyXO",
        description: "Booking Payment",

        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(
              "http://localhost:5000/api/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  ...response,
                  bookingId,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              router.replace(`/ticket?bookingId=${bookingId}`);
            } else {
              alert(
                verifyData.message || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error(error);
            alert("Payment verification failed");
          }
        },

        modal: {
          ondismiss: () => {
            alert("Payment cancelled");
          },
        },

        theme: {
          color: "#16a34a",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      console.error("PAYMENT ERROR:", err);
      alert(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

 
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