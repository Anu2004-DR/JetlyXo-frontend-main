export interface Flight {
  id: number;

  airline: string;

  flightNumber?: string;

  from?: string;
  to?: string;

  fromCity?: string;
  toCity?: string;

  departure?: string;
  arrival?: string;

  duration: string;

  price: number;

  seats?: number;

  stops?: number;

  searchKey?: string;

  createdAt?: string;

  cachedAt?: string;
}

export interface FlightSearchParams {
  from?: string;
  to?: string;
  departure?: string;
  date?: string;
  travellers?: number;
  cabin?: string;
  fareType?: string;
  returnDate?: string;

 children?: number;

 infants?: number;

 tripType?: "ONE_WAY" | "ROUND_TRIP";
} 