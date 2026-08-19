import { z } from "zod";
import type { ZodError } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Schema for POST /rides/addRide
 * Accepts frontend field names (from, to, seats, price, vehicle)
 * and normalises them to backend names via the controller.
 */
export const rideCreateSchema = z
  .object({
    from: z.string().trim().min(1).max(255),
    to: z.string().trim().min(1).max(255),
    date: z.string().regex(datePattern, "Date must be YYYY-MM-DD"),
    time: z.string().regex(timePattern, "Time must be HH:mm"),
    seats: z.coerce.number().int().min(1).max(20),
    price: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
      z.number().finite().min(0).max(100_000).optional(),
    ),
    vehicle: z.enum(["rickshaw", "cab", "bike"]),
  })
  .superRefine((value, ctx) => {
    const departure = new Date(`${value.date}T${value.time}:00`);
    if (Number.isNaN(departure.getTime()) || departure <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Ride departure must be in the future",
      });
    }
  });

/** Inferred type for a validated ride-create payload */
export type RideCreateInput = z.infer<typeof rideCreateSchema>;

/**
 * Schema for POST /rides/filteredAvailableRides
 */
export const rideFilterSchema = z.object({
  source: z.string().trim().max(255).optional().default(""),
  destination: z.string().trim().max(255).optional().default(""),
  date: z
    .string()
    .regex(datePattern, "Date must be YYYY-MM-DD")
    .optional()
    .or(z.literal(""))
    .default(""),
  time: z
    .string()
    .regex(timePattern, "Time must be HH:mm")
    .optional()
    .or(z.literal(""))
    .default(""),
});

/** Inferred type for a validated ride-filter payload */
export type RideFilterInput = z.infer<typeof rideFilterSchema>;

/**
 * Parse and validate a request body against a Zod schema.
 * Throws a 400-tagged Error on failure so the error handler can respond correctly.
 */
export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = (result.error as ZodError).issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    const error = Object.assign(new Error(message), { statusCode: 400 });
    throw error;
  }
  return result.data;
}
