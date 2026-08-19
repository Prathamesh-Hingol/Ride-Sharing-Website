const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const VEHICLE_TYPES = new Set(["rickshaw", "cab", "bike"]);

export class RideValidationError extends Error {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "RideValidationError";
  }
}

export interface RideInput {
  from?: unknown;
  to?: unknown;
  date?: unknown;
  time?: unknown;
  seats?: unknown;
  price?: unknown;
  vehicle?: unknown;
}

export interface ValidatedRideInput {
  source: string;
  destination: string;
  date: string;
  time: string;
  seats: number;
  price: number;
  vehicle: string;
}

export interface RideFiltersInput {
  source?: unknown;
  destination?: unknown;
  date?: unknown;
  time?: unknown;
}

function isValidCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function validateRideInput(input: RideInput, now = new Date()): ValidatedRideInput {
  const source = typeof input.from === "string" ? input.from.trim() : "";
  const destination = typeof input.to === "string" ? input.to.trim() : "";
  const date = typeof input.date === "string" ? input.date : "";
  const time = typeof input.time === "string" ? input.time : "";
  const seats = Number(input.seats);
  const price = Number(input.price);
  const vehicle = typeof input.vehicle === "string" ? input.vehicle.toLowerCase() : "";

  if (!source || source.length > 255) throw new RideValidationError("Source must be between 1 and 255 characters");
  if (!destination || destination.length > 255) throw new RideValidationError("Destination must be between 1 and 255 characters");
  if (!isValidCalendarDate(date)) throw new RideValidationError("Date must be a valid YYYY-MM-DD date");
  if (!TIME_PATTERN.test(time)) throw new RideValidationError("Time must be in HH:mm format");
  if (!Number.isInteger(seats) || seats < 1 || seats > 20) throw new RideValidationError("Seats must be an integer between 1 and 20");
  if (!Number.isFinite(price) || price < 0 || price > 100000) throw new RideValidationError("Price must be between 0 and 100000");
  if (!VEHICLE_TYPES.has(vehicle)) throw new RideValidationError("Vehicle must be rickshaw, cab, or bike");

  const departure = new Date(`${date}T${time}:00`);
  if (Number.isNaN(departure.getTime()) || departure <= now) throw new RideValidationError("Ride departure must be in the future");

  return { source, destination, date, time, seats, price, vehicle };
}

export function validateRideFilters(input: RideFiltersInput = {}) {
  const source = typeof input.source === "string" ? input.source.trim() : "";
  const destination = typeof input.destination === "string" ? input.destination.trim() : "";
  const date = typeof input.date === "string" ? input.date : "";
  const time = typeof input.time === "string" ? input.time : "";
  if (date && !isValidCalendarDate(date)) throw new RideValidationError("Date must be a valid YYYY-MM-DD date");
  if (time && !TIME_PATTERN.test(time)) throw new RideValidationError("Time must be in HH:mm format");
  return { source, destination, date, time };
}
