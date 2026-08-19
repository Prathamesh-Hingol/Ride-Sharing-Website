import React, { useState } from "react";
import { MapPin, Users, IndianRupee, CheckSquare, Square } from "lucide-react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useRides } from "../hooks/useRides";
import { NewRidePayload } from "../types";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomTimePicker from "../components/CustomTimePicker";
import CustomVehicleSelect from "../components/CustomVehicleSelect";

/**
 * UI Layer — Offer
 *
 * This page ONLY:
 *  1. Manages local form state & validation constraints
 *  2. Calls submitRide() from useRides on form submit
 *  3. Renders JSX with custom glassmorphic pickers and selects
 */
export default function Offer() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const { submitRide, loading, error: apiError } = useRides("none");

  const [rideDetails, setRideDetails] = useState<NewRidePayload>({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: 1,
    price: undefined,
    vehicle: "",
    isBooked: false,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    setValidationError(null);

    const fromTrimmed = rideDetails.from.trim();
    const toTrimmed = rideDetails.to.trim();

    if (!fromTrimmed || !toTrimmed) {
      setValidationError("Please enter both starting point and destination.");
      return false;
    }

    if (fromTrimmed.toLowerCase() === toTrimmed.toLowerCase()) {
      setValidationError("Starting point and destination cannot be the same.");
      return false;
    }

    if (!rideDetails.date || !rideDetails.time) {
      setValidationError("Please select a valid departure date and time.");
      return false;
    }

    // Departure time in the future validation
    const departure = new Date(`${rideDetails.date}T${rideDetails.time}:00`);
    if (Number.isNaN(departure.getTime()) || departure <= new Date()) {
      setValidationError("Ride departure time must be in the future.");
      return false;
    }

    if (!rideDetails.seats || rideDetails.seats < 1 || rideDetails.seats > 20) {
      setValidationError("Available seats must be between 1 and 20.");
      return false;
    }

    if (rideDetails.isBooked && rideDetails.price !== undefined && rideDetails.price <= 0) {
      setValidationError("Please specify a valid positive price for the pre-booked ride, or leave it empty.");
      return false;
    }

    if (!rideDetails.vehicle) {
      setValidationError("Please select a vehicle type.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Ensure price is undefined if vehicle is not pre-booked
    const payload: NewRidePayload = {
      ...rideDetails,
      price: rideDetails.isBooked ? rideDetails.price : undefined,
    };

    const success = await submitRide(payload);
    if (success) {
      navigate("/find");
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === "") {
      setRideDetails({ ...rideDetails, price: undefined });
      return;
    }
    const parsed = parseFloat(rawVal);
    if (!Number.isNaN(parsed)) {
      setRideDetails({ ...rideDetails, price: Math.max(0, parsed) });
    }
  };

  const togglePreBooked = () => {
    setValidationError(null);
    const nextIsBooked = !rideDetails.isBooked;
    setRideDetails({
      ...rideDetails,
      isBooked: nextIsBooked,
      // If unchecking pre-booked, reset price to undefined
      price: nextIsBooked ? rideDetails.price : undefined,
    });
  };

  return (
    <div className="min-h-screen py-28 relative">
      <div className="absolute w-[26rem] h-[26rem] rounded-full bg-secondary/10 blur-[110px] top-10 -right-24 pointer-events-none" />
      <div className="absolute w-[22rem] h-[22rem] rounded-full bg-primary/10 blur-[100px] bottom-0 -left-16 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-2 text-ink">
          Offer a Ride
        </h1>
        <p className="text-center text-ink-variant mb-10">
          Share your route and let others ride along
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto glass-strong rounded-2xl p-6 md:p-10 shadow-xl"
        >
          <div className="space-y-5">
            {/* Starting Point and Destination (Same Line) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-variant uppercase tracking-wider mb-1.5 px-1">
                  Starting Point
                </label>
                <div className="glass-input flex items-center rounded-lg px-4 py-3 transition-colors">
                  <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. Campus Gate 1, Hostel Block A"
                    className="w-full bg-transparent focus:outline-none text-ink placeholder:text-ink-variant/50 text-sm"
                    value={rideDetails.from}
                    onChange={(e) => {
                      setValidationError(null);
                      setRideDetails({ ...rideDetails, from: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-variant uppercase tracking-wider mb-1.5 px-1">
                  Destination
                </label>
                <div className="glass-input flex items-center rounded-lg px-4 py-3 transition-colors">
                  <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. Indore Railway Station, Airport"
                    className="w-full bg-transparent focus:outline-none text-ink placeholder:text-ink-variant/50 text-sm"
                    value={rideDetails.to}
                    onChange={(e) => {
                      setValidationError(null);
                      setRideDetails({ ...rideDetails, to: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Custom Date and Time Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-variant uppercase tracking-wider mb-1.5 px-1">
                  Departure Date
                </label>
                <CustomDatePicker
                  value={rideDetails.date}
                  minDate={today}
                  placeholder="Select Date"
                  onChange={(dateStr) => {
                    setValidationError(null);
                    setRideDetails({ ...rideDetails, date: dateStr });
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-variant uppercase tracking-wider mb-1.5 px-1">
                  Departure Time
                </label>
                <CustomTimePicker
                  value={rideDetails.time}
                  placeholder="Select Time"
                  onChange={(timeStr) => {
                    setValidationError(null);
                    setRideDetails({ ...rideDetails, time: timeStr });
                  }}
                />
              </div>
            </div>

            {/* Vehicle Type & Available Seats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-variant uppercase tracking-wider mb-1.5 px-1">
                  Vehicle Type
                </label>
                <CustomVehicleSelect
                  value={rideDetails.vehicle}
                  placeholder="Select Vehicle Type"
                  onChange={(val) => {
                    setValidationError(null);
                    setRideDetails({ ...rideDetails, vehicle: val });
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-variant uppercase tracking-wider mb-1.5 px-1">
                  Available Seats
                </label>
                <div className="glass-input flex items-center rounded-lg px-4 py-3 transition-colors">
                  <Users className="w-5 h-5 text-primary mr-3 shrink-0" />
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    className="w-full bg-transparent focus:outline-none text-ink placeholder:text-ink-variant/50 text-sm"
                    value={rideDetails.seats || ""}
                    onChange={(e) => {
                      setValidationError(null);
                      const val = parseInt(e.target.value, 10);
                      setRideDetails({
                        ...rideDetails,
                        seats: Number.isNaN(val) ? 0 : Math.max(1, Math.min(20, val)),
                      });
                    }}
                    required
                    min={1}
                    max={20}
                  />
                </div>
              </div>
            </div>

            {/* Pre-booked Checkbox Toggle */}
            <div
              className={`glass-input flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer select-none transition-all ${
                rideDetails.isBooked ? "border-primary/50 bg-primary/[0.04]" : ""
              }`}
              onClick={togglePreBooked}
            >
              <div className="flex items-center gap-3">
                {rideDetails.isBooked ? (
                  <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-ink-variant/60 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-ink">
                    Vehicle already pre-booked
                  </p>
                  <p className="text-xs text-ink-variant">
                    Check if you have already reserved this cab or auto (enables price input)
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  rideDetails.isBooked
                    ? "bg-primary/10 text-primary-dark border border-primary/30"
                    : "bg-tertiary/10 text-tertiary-dark border border-tertiary/30"
                }`}
              >
                {rideDetails.isBooked ? "Pre-booked" : "Not Booked Yet"}
              </span>
            </div>

            {/* Total Price (Enabled ONLY when Pre-Booked is Checked) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="block text-xs font-semibold text-ink-variant uppercase tracking-wider">
                  Total Fare (₹)
                </label>
                <span className="text-xs text-ink-variant">
                  {rideDetails.isBooked ? "Optional fixed amount" : "Locked (Vehicle not pre-booked)"}
                </span>
              </div>
              <div
                className={`glass-input flex items-center rounded-lg px-4 py-3 transition-all ${
                  !rideDetails.isBooked ? "opacity-60 bg-ink/[0.03] cursor-not-allowed" : ""
                }`}
              >
                <IndianRupee
                  className={`w-5 h-5 mr-3 shrink-0 ${
                    rideDetails.isBooked ? "text-primary" : "text-ink-variant/40"
                  }`}
                />
                <input
                  type="number"
                  placeholder={
                    rideDetails.isBooked
                      ? "Enter total fare to be split (e.g. 450)"
                      : "Price to be decided later (Check pre-booked above to specify)"
                  }
                  className={`w-full bg-transparent focus:outline-none text-sm ${
                    rideDetails.isBooked
                      ? "text-ink placeholder:text-ink-variant/50"
                      : "text-ink-variant/50 placeholder:text-ink-variant/40 cursor-not-allowed"
                  }`}
                  value={rideDetails.price ?? ""}
                  onChange={handlePriceChange}
                  disabled={!rideDetails.isBooked}
                  min={0}
                  step="any"
                />
              </div>
              <p className="text-xs text-ink-variant px-1 mt-1.5">
                {rideDetails.isBooked
                  ? "This total cost will be split equally among all accepted co-riders."
                  : "Fare will be decided and split among co-riders after booking the vehicle."}
              </p>
            </div>

            {/* Errors */}
            {(validationError || apiError) && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center">
                {validationError || apiError}
              </div>
            )}

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? "Posting..." : "Post Ride"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
