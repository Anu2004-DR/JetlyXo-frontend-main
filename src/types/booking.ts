import { Passenger } from "./passenger";
import { Flight } from "./flight";
import { Bus } from "./bus";
import { Train } from "./train";

export type BookingType =
  | "flight"
  | "bus"
  | "train";

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

export interface Booking {
  id: number;

  bookingType: BookingType;

  pnr?: string;

  passenger?: Passenger;

  passengerName?: string;

  totalPrice: number;

  status: BookingStatus;

  createdAt: string;

  updatedAt?: string;

  flight?: Flight | null;

  bus?: Bus | null;

  train?: Train | null;
}