"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createOrder, getBookingById, verifyPayment } from "@/lib/api";
import Script from "next/script";
declare global {
  interface Window {
    Razorpay?: any;
  }
}

function PaymentPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get("bookingId");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const loadBooking = async () => {
      try {
        const res = await getBookingById(Number(bookingId));
        setBooking(res?.data || res || null);
      } catch (error) {
        console.error("Failed to load booking", error);
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const journeyLabel = useMemo(() => {
    if (!booking) return "Travel booking";
    if (booking.flight?.airline) return booking.flight.airline;
    if (booking.bus?.busName) return booking.bus.busName;
    if (booking.train?.trainName) return booking.train.trainName;
    return `${booking.bookingType} booking`;
  }, [booking]);

  const handlePayment = async () => {
    if (!bookingId) return;

    try {
      setProcessing(true);
      const orderResponse = await createOrder(Number(bookingId));
      const order = orderResponse?.order || orderResponse?.data?.order || orderResponse;

      if (!order?.id) {
        throw new Error("Payment order could not be created");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout failed to load");
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SaDtavZFKoFDmK",
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.id,
        name: "JetlyXO",
        description: `Booking #${bookingId}`,
        handler: async (response: any) => {
          try {
            await verifyPayment({
              ...response,
              bookingId: Number(bookingId),
            });
            router.push(`/ticket?bookingId=${bookingId}`);
          } catch (error: any) {
            console.error("Payment verification failed", error);
            alert(error?.response?.data?.message || error?.message || "Payment verification failed");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
        theme: {
          color: "#2563eb",
        },
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Payment start failed", error);
      alert(error?.response?.data?.message || error?.message || "Unable to start payment");
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading payment...</div>;
  }

  if (!bookingId || !booking) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Booking not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-5">
        <div>
          <p className="text-sm text-blue-300">Secure checkout</p>
          <h1 className="text-3xl font-bold mt-1">Complete Payment</h1>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-white/70">Booking ID</span>
            <span className="font-semibold">{booking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Journey</span>
            <span className="font-semibold">{journeyLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Passenger</span>
            <span className="font-semibold">{booking.passengerName || "Guest"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Status</span>
            <span className="font-semibold">{booking.status}</span>
          </div>
          <div className="flex justify-between text-lg pt-2 border-t border-white/10">
            <span className="text-white/80">Amount</span>
            <span className="font-bold">INR {booking.totalPrice}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {processing ? "Opening payment..." : "Pay with Razorpay"}
        </button>

        <button
          onClick={() => router.push("/bookings")}
          className="w-full rounded-xl border border-white/15 py-3 text-white/80 hover:bg-white/5"
        >
          Back to bookings
        </button>
      </div>
    </div>
  );
}


export default function PaymentPage() {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          Loading payment...
        </div>
      }>
        <PaymentPageContent />
      </Suspense>
    </>
  );
}
