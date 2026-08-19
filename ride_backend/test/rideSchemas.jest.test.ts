import { parseBody, rideCreateSchema, rideFilterSchema } from "../src/validation/rideSchemas.js";

describe("Zod API schemas", () => {
  test("normalizes a valid create payload", () => {
    const value = parseBody(rideCreateSchema, {
      from: " Campus ",
      to: "Airport",
      date: "2099-08-25",
      time: "18:30",
      seats: "2",
      price: "250",
      vehicle: "cab",
    });

    expect(value).toMatchObject({ from: "Campus", seats: 2, price: 250, vehicle: "cab" });
  });

  test("returns a client error for malformed input", () => {
    expect(() => parseBody(rideCreateSchema, { from: "", seats: 0 })).toThrow("from");
  });

  test("accepts partial filters", () => {
    expect(parseBody(rideFilterSchema, { source: " campus " })).toEqual({
      source: "campus",
      destination: "",
      date: "",
      time: "",
    });
  });
});
