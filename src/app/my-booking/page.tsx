"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchBookings,
  cancelBooking,
  Booking,
  fetchRecommendations,
  Recommendation,
  mapBookingsForAI,
} from "@/lib/api";

import jsPDF from "jspdf";
import QRCode from "qrcode";

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const [lastCancelled, setLastCancelled] = useState<Booking | null>(null);

  const [showWalletAnim, setShowWalletAnim] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  /* ============================= TIMER ============================= */
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  /* ============================= LOAD BOOKINGS ============================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

if (!token) {
  router.push("/login");
  return;
}

    fetchBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  /* ============================= RECOMMENDATIONS ============================= */
  useEffect(() => {
    if (!bookings.length) return;

    const load = async () => {
      const mapped = mapBookingsForAI(bookings);
      const valid = mapped.filter(b => b.source && b.destination);
      if (!valid.length) return;

      const data = await fetchRecommendations(valid);
      setRecommendations(data);
    };

    load();
  }, [bookings]);

  /* ============================= REFUND ============================= */
  const getDeparture = (b: Booking) =>
    b.bus?.departureTime || b.train?.departureTime || b.flight?.dep;

  const getRefund = (b: Booking) => {
    const dep = getDeparture(b);
    if (!dep) return 0;

    const diff =
      (new Date(dep).getTime() - currentTime) / (1000 * 60 * 60);

    if (diff > 24) return b.totalPrice;
    if (diff > 2) return b.totalPrice * 0.5;
    return 0;
  };

  const selectedBooking = bookings.find(b => b.id === selectedId);
  const refund = selectedBooking ? Math.round(getRefund(selectedBooking)) : 0;

  /* ============================= CANCEL ============================= */
  const confirmCancel = async () => {
    if (!selectedId || !selectedBooking) return;

    try {
      setCancelLoading(true);

      await cancelBooking(String(selectedId));

      setLastCancelled({ ...selectedBooking, status: "CONFIRMED" });

      setBookings(prev =>
        prev.map(b =>
          b.id === selectedId
            ? { ...b, status: "CANCELLED", refundAmount: refund }
            : b
        )
      );

      if (refund > 0) {
        setShowWalletAnim(true);
        setTimeout(() => setShowWalletAnim(false), 2000);
      }

      setToast(
        refund > 0
          ? `Cancelled • ₹${refund} refunded`
          : "Cancelled • No refund"
      );

      setUndoVisible(true);

      setTimeout(() => {
        setUndoVisible(false);
        setLastCancelled(null);
      }, 5000);

      setShowModal(false);
      setSelectedId(null);

    } catch {
      setToast("Cancel failed");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUndo = () => {
    if (!lastCancelled) return;

    setBookings(prev =>
      prev.map(b =>
        b.id === lastCancelled.id ? lastCancelled : b
      )
    );

    setToast("Undo successful");
    setUndoVisible(false);
    setLastCancelled(null);
  };

  /* ============================= INVOICE ============================= */
  const handleDownload = async (b: Booking) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("JetlyXO Invoice", 20, 20);

    doc.setFontSize(12);
    doc.text(`Booking ID: ${b.id}`, 20, 40);
    doc.text(`Type: ${b.bookingType}`, 20, 50);
    doc.text(`Amount: ₹${b.totalPrice}`, 20, 60);

    const qr = await QRCode.toDataURL(`Booking:${b.id}`);
    doc.addImage(qr, "PNG", 140, 30, 40, 40);

    doc.save(`Invoice_${b.id}.pdf`);
  };

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      {bookings.length === 0 && (
  <p className="text-center text-gray-400 mt-10">
    No bookings yet
  </p>
)}

      {bookings.map(b => (
        <div key={b.id} className="glass-card p-6 flex justify-between items-center mb-4">

          <div>
            <p className="font-semibold">Booking ID: {b.id}</p>
            <p className="text-gray-400">Type: {b.bookingType}</p>
            <p className={b.status === "CONFIRMED" ? "text-green-400" : "text-red-400"}>
              
              {b.status}
            </p>
          </div>

          <div className="text-right space-y-2">
            <p className="font-bold">₹{b.totalPrice}</p>

            <div className="flex gap-2">
              <button onClick={() => handleDownload(b)} className="bg-blue-500 px-3 py-1 rounded">
                Invoice
              </button>

              {b.status === "CONFIRMED" && (
                <button
                  onClick={() => {
                    setSelectedId(b.id);
                    setShowModal(true);
                  }}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={() => router.push(`/ticket?bookingId=${b.id}`)}
                className="bg-green-600 px-3 py-1 rounded"
              >
                View Ticket
              </button>
            </div>
          </div>
        </div>
      ))}
     
      {/* MODAL */}
      {showModal && selectedBooking && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="bg-white text-black p-6 rounded-2xl w-[360px] animate-scaleIn shadow-xl">

      <h2 className="text-lg font-semibold mb-4">
        Cancel Booking
      </h2>

      {/* REFUND BOX */}
      <div
        className={`p-4 rounded-xl mb-5 ${
          refund > 0
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600"
        }`}
      >
        <p className="text-sm">Refund Amount</p>

        <p className="text-2xl font-bold">
          {refund > 0 ? `₹${refund}` : "No Refund"}
        </p>
      </div>

      {/* WARNING */}
      <p className="text-xs text-gray-500 mb-5">
        This action cannot be undone.
      </p>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-1 border rounded-lg hover:bg-gray-100"
        >
          No
        </button>

        <button
          onClick={confirmCancel}
          className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
        </button>
      </div>

    </div>
  </div>
)}

      {/* WALLET */}
      {showWalletAnim && (
        <div className="fixed top-10 right-10 bg-green-500 px-5 py-2 rounded">
          💰 Refund Credited
        </div>
      )}

      {/* TOAST */}
      {toast && (
  <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slideIn">

    <span>{toast}</span>

    {undoVisible && (
      <button
        onClick={handleUndo}
        className="bg-white/10 px-3 py-1 rounded hover:bg-white/20"
      >
        Undo
      </button>
    )}
  </div>
)}

      {/* RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <>
          <h2 className="text-xl mt-10 mb-3">Recommended for You</h2>
          {recommendations.map(r => (
            <div key={r.id} className="glass-card p-3 mb-2">
              {r.source} → {r.destination} ₹{r.price}
            </div>
          ))}
        </>
      )}

    </div>
  );
}
console.log("bookings", bookings);