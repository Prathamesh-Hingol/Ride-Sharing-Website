import React, { useState } from "react";
import { MapPin, Calendar, Clock, Users, IndianRupee, Car } from "lucide-react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useRides } from "../hooks/useRides";
import { NewRidePayload } from "../types";

/**
 * UI Layer — Offer
 *
 * This page ONLY:
 *  1. Manages local form state
 *  2. Calls submitRide() from useRides on form submit
 *  3. Renders JSX based on hook state (loading, error, submitSuccess)
 */
export default function Offer() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const { submitRide, loading, error } = useRides("none");

  const [rideDetails, setRideDetails] = useState<NewRidePayload>({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: 0,
    price: undefined,
    vehicle: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitRide(rideDetails);
    if (success) {
      navigate("/find");
    }
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
          className="max-w-2xl mx-auto glass-strong rounded-md p-6 md:p-8"
        >
          <div className="space-y-4">
            <div className="glass-input flex items-center rounded-lg px-4 py-3">
              <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Starting Point"
                className="w-full bg-transparent focus:outline-none placeholder:text-ink-variant/60"
                value={rideDetails.from}
                onChange={(e) =>
                  setRideDetails({ ...rideDetails, from: e.target.value })
                }
                required
              />
            </div>

            <div className="glass-input flex items-center rounded-lg px-4 py-3">
              <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Destination"
                className="w-full bg-transparent focus:outline-none placeholder:text-ink-variant/60"
                value={rideDetails.to}
                onChange={(e) =>
                  setRideDetails({ ...rideDetails, to: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-input flex items-center rounded-lg px-4 py-3">
                <Calendar className="w-5 h-5 text-primary mr-3 shrink-0" />
                <input
                  type="date"
                  min={today}
                  className="w-full bg-transparent focus:outline-none text-ink-variant"
                  value={rideDetails.date}
                  onChange={(e) =>
                    setRideDetails({ ...rideDetails, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="glass-input flex items-center rounded-lg px-4 py-3">
                <Clock className="w-5 h-5 text-primary mr-3 shrink-0" />
                <input
                  type="time"
                  className="w-full bg-transparent focus:outline-none text-ink-variant"
                  value={rideDetails.time}
                  onChange={(e) =>
                    setRideDetails({ ...rideDetails, time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-input flex items-center rounded-lg px-4 py-3">
                <Users className="w-5 h-5 text-primary mr-3 shrink-0" />
                <input
                  type="number"
                  placeholder="Available Seats"
                  className="w-full bg-transparent focus:outline-none placeholder:text-ink-variant/60"
                  value={rideDetails.seats || ""}
                  onChange={(e) =>
                    setRideDetails({
                      ...rideDetails,
                      seats: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  min={1}
                />
              </div>

              <div className="glass-input flex items-center rounded-lg px-4 py-3">
                <IndianRupee className="w-5 h-5 text-primary mr-3 shrink-0" />
                <input
                  type="number"
                  placeholder="Total Price"
                  className="w-full bg-transparent focus:outline-none placeholder:text-ink-variant/60"
                  value={rideDetails.price ?? ""}
                  onChange={(e) =>
                    setRideDetails({
                      ...rideDetails,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  min={0}
                />
              </div>
            </div>

            <div className="glass-input flex items-center rounded-lg px-4 py-3">
              <Car className="w-5 h-5 text-primary mr-3 shrink-0" />
              <select
                className="w-full bg-transparent focus:outline-none text-ink"
                value={rideDetails.vehicle}
                onChange={(e) =>
                  setRideDetails({ ...rideDetails, vehicle: e.target.value })
                }
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="rickshaw">Rickshaw</option>
                <option value="cab">Cab</option>
                <option value="bike">Bike</option>
              </select>
            </div>


            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
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
