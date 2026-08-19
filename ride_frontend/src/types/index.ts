// ─── Ride Types ─────────────────────────────────────────────────────────────

export type RideType = "rickshaw" | "cab" | "bike";

export interface Ride {
  id: string;
  userId: string;
  userName: string;
  pickup: string;
  dropoff: string;
  dateTime: string;
  rideType: RideType;
  seatsAvailable: number;
  estimatedCost?: number;
  notes?: string;
  // Fields returned by the backend for the Find page
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  price?: number;
  seats?: number;
  vehicle?: string;
  isBooked?: boolean;
}

/** Filters sent to POST /rides/filteredAvailableRides */
export interface RideFilters {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
}

/** Payload for POST /rides/addRide */
export interface NewRidePayload {
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  price?: number;
  vehicle: string;
}

// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  user: User | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  isAdmin?: boolean;
}

// ─── User Profile Types ──────────────────────────────────────────────────────

export interface UserProfile {
  studentId: string;
  name: string;
  email: string;
  photoUrl?: string;
  createdAt?: string;
  joinedDate?: string;
}

// ─── Ride Request Types ──────────────────────────────────────────────────────

export type RequestStatus = "Pending" | "Accepted" | "Rejected" | "Left";

export interface RideRequest {
  id: number;
  rideID: number;
  createdBy: number;
  requestBy: number;
  requestStatus: RequestStatus;
  ride: {
    source: string;
    destination: string;
    date: string;
    time: string;
    seatsAvailable: number;
  };
  requester?: {
    id: number;
    name: string | null;
    email: string;
    picture?: string | null;
  };
}

export interface HandleRequestPayload {
  rideID: number;
  requestBy: number;
  flag: "Accepted" | "Rejected";
}
