import apiClient from "@/lib/apiClient";
import { Booking } from "@/types";
export async function createBooking(data: Record<string, unknown>) {
    try {
      const res = await apiClient.post("/api/bookings", data);
  
      const bookingId =
        res.data?.booking?.id ||
        res.data?.bookingId ||
        res.data?.data?.booking?.id ||
        res.data?.data?.id ||
        res.data?.id ||
        null;
  
      return {
        success: true,
        bookingId,
        raw: res.data,
      };
    } catch (err: any) {
      console.error("CREATE BOOKING ERROR:", err?.response?.data || err.message);
      throw err;
    }
  }
  
  
  
  export async function fetchBookings(): Promise<Booking[]> {
    try {
      const res = await apiClient.get("/api/bookings/history");
      return res.data?.data || res.data || [];
    } catch (err: any) {
      console.error("FETCH BOOKINGS ERROR:", err?.response?.data || err.message);
      return [];
    }
  }
  
  export async function getBookingById(
    id: number
  ): Promise<Booking>  {
    try {
      const res = await apiClient.get(`/api/bookings/${id}`);
      return res.data;
    } catch (err: any) {
      console.error("GET BOOKING ERROR:", err?.response?.data || err.message);
      throw err;
    }
  }
  
  export async function verifyTicket(pnr: string) {
    try {
      const res = await apiClient.get(`/api/verify/${pnr}`);
      return res.data;
    } catch (err: any) {
      console.error("VERIFY TICKET ERROR:", err?.response?.data || err.message);
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