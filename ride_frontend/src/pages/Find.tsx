import React, { useState, useMemo } from "react";
import { Search, Calendar, Clock, MapPin, Car, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useRides } from "../hooks/useRides";
import { Ride, RideFilters } from "../types";
import { useAuth } from "../hooks/useAuth";

/**
 * UI Layer — Find
 *
 * This page ONLY:
 *  1. Reads state from useRides() hook
 *  2. Renders JSX
 *  3. Calls hook actions (fetchRides) on user interaction
 *
 * No fetch(), no axios, no import.meta.env here.
 */
export default function Find() {
  const [filters, setFilters] = useState<RideFilters>({
    from: "",
    to: "",
    date: "",
    time: "",
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  // Hook manages all data fetching — "find" mode auto-fetches on mount
  const { rides, loading, error, fetchRides } = useRides("find");

  const handleBooking = (ride: Ride) => {
    if (String(ride.userId) === String(user?.id) || String((ride as any).createdBy) === String(user?.id)) return;
    navigate("/book-ride", {
      state: {
        rideDetails: ride,
      },
    });
  };

  // Helper to convert "HH:MM" to minutes for time comparison
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Client-side filter on top of the fetched rides (for instant UX)
  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      const matchFrom =
        !filters.from ||
        (ride.from ?? "").toLowerCase().includes(filters.from.toLowerCase());
      const matchTo =
        !filters.to ||
        (ride.to ?? "").toLowerCase().includes(filters.to.toLowerCase());
      const matchDate = !filters.date || ride.date === filters.date;

      let matchTime = true;
      if (filters.time && ride.time) {
        const selectedTime = timeToMinutes(filters.time);
        const rideTime = timeToMinutes(ride.time);
        matchTime = Math.abs(selectedTime - rideTime) <= 60; // ±1 hour
      }

      return matchFrom && matchTo && matchDate && matchTime;
    });
  }, [filters, rides]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Re-fetch from backend with filters applied server-side
    fetchRides(filters);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen py-28 relative">
      <div className="absolute w-[26rem] h-[26rem] rounded-full bg-primary/10 blur-[110px] top-10 -left-24 pointer-events-none" />
      <div className="absolute w-[22rem] h-[22rem] rounded-full bg-secondary/10 blur-[100px] bottom-0 -right-16 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-2 text-ink">
          Find a Ride
        </h1>
        <p className="text-center text-ink-variant mb-10">
          Search rides posted by fellow students heading your way
        </p>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto glass-strong rounded-md p-6 md:p-8"
        >
          <div className="space-y-4">
            <div className="glass-input flex items-center rounded-lg px-4 py-3">
              <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
              <input
                type="text"
                placeholder="From"
                className="w-full bg-transparent focus:outline-none placeholder:text-ink-variant/60"
                value={filters.from}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
              />
            </div>

            <div className="glass-input flex items-center rounded-lg px-4 py-3">
              <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
              <input
                type="text"
                placeholder="To"
                className="w-full bg-transparent focus:outline-none placeholder:text-ink-variant/60"
                value={filters.to}
                onChange={(e) =>
                  setFilters({ ...filters, to: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-input flex items-center rounded-lg px-4 py-3">
                <Calendar className="w-5 h-5 text-primary mr-3 shrink-0" />
                <input
                  type="date"
                  className="w-full bg-transparent focus:outline-none text-ink-variant"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters({ ...filters, date: e.target.value })
                  }
                />
              </div>

              <div className="glass-input flex items-center rounded-lg px-4 py-3">
                <Clock className="w-5 h-5 text-primary mr-3 shrink-0" />
                <input
                  type="time"
                  className="w-full bg-transparent focus:outline-none text-ink-variant"
                  value={filters.time}
                  onChange={(e) =>
                    setFilters({ ...filters, time: e.target.value })
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Search className="w-4 h-4" />
              Search Rides
            </Button>
          </div>
        </form>

        {/* Results Section */}
        <div className="max-w-4xl mx-auto mt-14">
          <h2 className="font-display text-xl font-semibold mb-6 text-ink">
            Available Rides ({filteredRides.length})
          </h2>

          {loading && (
            <div className="text-center py-8 text-ink-variant">Loading rides...</div>
          )}

          {error && !loading && (
            <div className="text-center py-8 text-danger">{error}</div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {filteredRides.map((ride, index) => (
                <div
                  key={ride.id ?? index}
                  className="glass-card rounded-md p-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
                        {ride.from}
                        <span className="text-primary">→</span>
                        {ride.to}
                      </h3>
                      <p className="text-ink-variant text-sm mt-1">
                        {ride.date ? formatDate(ride.date) : ""} • {ride.time}
                      </p>
                      <p className="text-ink-variant text-sm mt-1 flex items-center gap-1.5">
                        <Car className="w-4 h-4 text-primary" />
                        {ride.vehicle}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                            (ride.seats ?? 0) < 3
                              ? "bg-tertiary/10 text-tertiary-dark border-tertiary/30"
                              : "bg-secondary/10 text-secondary-dark border-secondary/30"
                          }`}
                        >
                          <Users className="w-3 h-3" />
                          {ride.seats} seats available
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            ride.isBooked === false
                              ? "bg-tertiary/10 text-tertiary-dark border-tertiary/30"
                              : "bg-primary/10 text-primary-dark border-primary/30"
                          }`}
                        >
                          {ride.isBooked === false ? "Not PreBooked" : "PreBooked"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-3">
                      <p className="text-lg font-display font-bold text-primary">
                        {ride.price == null ? "Price to be decided" : `₹${ride.price}`}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleBooking(ride)}
                        disabled={ride.seats === 0 || String(ride.userId) === String(user?.id) || String((ride as any).createdBy) === String(user?.id)}
                      >
                        {ride.seats === 0 ? "Sold Out" : (String(ride.userId) === String(user?.id) || String((ride as any).createdBy) === String(user?.id)) ? "Your Ride" : "Book Now"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredRides.length === 0 && (
                <div className="text-center py-10 glass-card rounded-md text-ink-variant">
                  No rides found matching your search criteria
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
