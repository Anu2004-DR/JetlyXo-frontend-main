import apiClient from "@/lib/apiClient";
import { Booking } from "@/types";

export interface Recommendation {
  id: string;
  type: "flight" | "bus" | "train";
  source: string;
  destination: string;
  price: number;
  departureTime: string;
  score: number;
  reason?: string;
}

export interface AIInputBooking {
  source: string;
  destination: string;
  price: number;
  type: "flight" | "bus" | "train";
}

export async function fetchRecommendations(
  bookings: Booking[]
): Promise<Recommendation[]> {
  try {
    const res = await apiClient.post("/api/recommendations", {
      bookings,
    });

    return res.data?.data || res.data || [];
  } catch (err: any) {
    console.error(
      "RECOMMENDATION ERROR:",
      err?.response?.data || err.message
    );

    return [];
  }
}

export function mapBookingsForAI(
  bookings: Booking[]
): AIInputBooking[] {
  return bookings
    .map((booking) => {
      return {
        source: "",
        destination: "",
        price: booking.totalPrice,
        type: booking.bookingType,
      };
    })
    .filter(Boolean);
}