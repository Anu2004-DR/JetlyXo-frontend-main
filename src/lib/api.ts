import apiClient from "@/lib/apiClient";
export type FlightSearchParams = {
  from?: string;
  to?: string;
  departure?: string;
  return?: string;
  travellers?: number;
  cabin?: string;
};

export type FlightResult = {
  airline: string;
  price: number;
  duration: string;
  stops: string;
  dep: string;
};

export type Booking = {
  id: number;
  bookingType: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  passengerName?: string;
  pnr?: string;
  bus?: any;
  flightData?: any;
  train?: any;
};

export async function createBooking(data: any) {
  try {
    const res = await apiClient.post("/api/bookings", data);
    return res.data;
  } catch (err: any) {
    console.error("CREATE BOOKING ERROR:", err?.response?.data || err.message);
    throw err;
  }
}


export async function fetchBookings(): Promise<Booking[]> {
  try {
    const res = await apiClient.get("/api/bookings/history");

    console.log("BOOKINGS RESPONSE:", res.data);

    // Handle both formats safely
    return res.data?.data || res.data || [];
  } catch (err: any) {
    console.error("FETCH BOOKINGS ERROR:", err?.response?.data || err.message);
    return [];
  }
}


export async function getBookingById(id: number) {
  try {
    const res = await apiClient.get(`/api/bookings/${id}`);
    return res.data;
  } catch (err: any) {
    console.error("GET BOOKING ERROR:", err?.response?.data || err.message);
    throw err;
  }
}


export async function cancelBooking(id: string) {
  try {
    const res = await apiClient.post(`/api/bookings/cancel/${id}`);
    return res.data;
  } catch (err: any) {
    console.error("CANCEL ERROR:", err?.response?.data || err.message);
    throw err;
  }
}


export async function searchFlights(params: FlightSearchParams) {
  try {
    if (!params.from || !params.to) {
      throw new Error("From and To are required");
    }

    const res = await apiClient.get("/api/flights/search", {
      params: {
        from: params.from,
        to: params.to,
        travellers: params.travellers || 1,
        cabin: params.cabin || "economy"
      }
    });

    return res.data;
  } catch (err: any) {
    console.error("FLIGHT SEARCH ERROR:", err?.response?.data || err.message);
    return [];
  }
}


export async function searchBuses(params: { from?: string; to?: string }) {
  try {
    if (!params.from || !params.to) {
      throw new Error("From and To required");
    }

    const res = await apiClient.get("/api/buses/search", {
      params: {
        from: params.from,
        to: params.to
      }
    });

    return res.data;
  } catch (err: any) {
    console.error("BUS SEARCH ERROR:", err?.response?.data || err.message);
    return [];
  }
}


export async function searchTrains(params: { from?: string; to?: string }) {
  try {
    if (!params.from || !params.to) {
      throw new Error("From and To required");
    }

    const res = await apiClient.get("/api/trains/search", {
      params: {
        from: params.from,
        to: params.to
      }
    });

    return res.data;
  } catch (err: any) {
    console.error("TRAIN SEARCH ERROR:", err?.response?.data || err.message);
    return [];
  }
}

export async function fetchRecommendations(bookings: any[]) {
  try {
    const res = await apiClient.post("/api/recommendations", { bookings });
    return res.data;
  } catch (err: any) {
    console.error("RECOMMENDATION ERROR:", err?.response?.data || err.message);
    return [];
  }
}

export async function createOrder(amount: number) {
  const res = await apiClient.post("/api/payment/create-order", { amount });
  return res.data;
}

export async function verifyPayment(data: any) {
  const res = await apiClient.post("/api/payment/verify", data);
  return res.data;
}

export type Recommendation = {
  id: string;
  type: "flight" | "bus" | "train";
  source: string;
  destination: string;
  price: number;
  departureTime: string;
  score: number;
  reason?: string;
};

export type AIInputBooking = {
  source: string;
  destination: string;
  price: number;
  type: "flight" | "bus" | "train";
};

export function mapBookingsForAI(bookings: Booking[]): AIInputBooking[] {
  return bookings
    .map((b: Booking) => {

      if (b.flightData) {
        return {
          source: b.flightData.from,
          destination: b.flightData.to,
          price: b.flightData.price,
          type: "flight",
        };
      }

      if (b.bus) {
        return {
          source: b.bus.fromCity,
          destination: b.bus.toCity,
          price: b.bus.price,
          type: "bus",
        };
      }

      if (b.train) {
        return {
          source: b.train.fromCity,
          destination: b.train.toCity,
          price: b.train.price,
          type: "train",
        };
      }

      return null;
    })
    .filter((b): b is AIInputBooking => b !== null);
}