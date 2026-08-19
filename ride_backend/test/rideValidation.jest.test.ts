import { validateRideFilters, validateRideInput } from "../src/validation/rideValidation.js";

describe("ride validation", () => {
  const now = new Date("2026-08-18T10:00:00");

  test("accepts and normalizes a valid future ride", () => {
    expect(validateRideInput({
      from: "  IIT Indore ", to: "Airport", date: "2026-08-19", time: "11:30",
      seats: "3", price: "250", vehicle: "CAB",
    }, now)).toEqual({
      source: "IIT Indore", destination: "Airport", date: "2026-08-19", time: "11:30",
      seats: 3, price: 250, vehicle: "cab",
    });
  });

  test("rejects invalid and past rides", () => {
    expect(() => validateRideInput({ from: "Campus", to: "Airport", date: "2026-02-30", time: "09:00", seats: 2, price: 100, vehicle: "cab" }, now)).toThrow("valid YYYY-MM-DD");
    expect(() => validateRideInput({ from: "Campus", to: "Airport", date: "2026-08-18", time: "09:00", seats: 2, price: 100, vehicle: "cab" }, now)).toThrow("future");
  });

  test("validates optional filters", () => {
    expect(validateRideFilters({ source: " campus " })).toEqual({ source: "campus", destination: "", date: "", time: "" });
    expect(() => validateRideFilters({ date: "tomorrow" })).toThrow("valid YYYY-MM-DD");
  });
});
