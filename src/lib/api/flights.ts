import { AxiosError } from "axios";

import apiClient from "@/lib/apiClient";
import {
  Flight,
  FlightSearchParams,
} from "@/types";

export async function searchFlights(
  params: FlightSearchParams
): Promise<Flight[]> {
  try {
    const response = await apiClient.get(
      "/flights/search",
      {
        params: {
          origin: params.from,
          destination: params.to,
          departureDate: params.departureDate,
        
          adults: params.travellers ?? 1,
          children: params.children ?? 0,
          infants: params.infants ?? 0,
        
          cabin: params.cabin,
          fareType: params.fareType,
          tripType: params.tripType,
        },
      }
    );

    return (
      response.data?.data ??
      response.data?.flights ??
      []
    );
  } catch (error) {
    const err = error as AxiosError<{
      message?: string;
    }>;

    console.error(
      "Flight Search Error:",
      err.response?.data || err.message
    );

    throw new Error(
      err.response?.data?.message ??
        "Flight search failed"
    );
  }
}


export async function seatMap(data: {
  dId: string;
  pax: any[];
}) {
  const response = await apiClient.post(
    "/flights/seat-map",
    data
  );

  return response.data.data;
}

export async function meal(data: {
  dId: string;
}) {
  const response = await apiClient.post(
    "/flights/meal",
    data
  );

  return response.data.data;
}

export async function retrieveBooking(
  bookingCode: string
) {
  const response = await apiClient.get(
    `/flights/retrieve/${bookingCode}`
  );

  return response.data.data;
}

export async function bookFlight(data: any) {
  const response = await apiClient.post(
    "/flights/book",
    data
  );

  return response.data.data;
}
export async function fareQuote(data: {
  id: string | number;
  searchId: string;
  tId: string;
}) {
  const response = await apiClient.post(
    "/flights/fare-quote",
    data
  );

  return response.data.data.data;
}