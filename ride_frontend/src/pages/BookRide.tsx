import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Calendar, Clock, Car, Users } from 'lucide-react';
import Button from '../components/Button';
import { useRideRequests } from '../hooks/useRideRequests';

interface RideDetails {
  id?: string;
  rideID?: number;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  vehicle: string;
  isBooked: boolean;
}

export default function BookRide() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod] = useState('card');
  const { sendRequest, loading, error } = useRideRequests();

  const rideDetails = location.state?.rideDetails as RideDetails;

  useEffect(() => {
    if (!rideDetails) {
      navigate('/find');
    }
  }, [navigate, rideDetails]);

  if (!rideDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-variant">
        Loading...
      </div>
    );
  }

  const handleBooking = async () => {
    const rideId = rideDetails.id ?? (rideDetails.rideID ? String(rideDetails.rideID) : '');
    const sent = await sendRequest(rideId);
    if (!sent) return;
    navigate('/booking-success', {
      state: {
        bookingDetails: {
          ...rideDetails,
          paymentMethod,
          requestStatus: 'Pending',
        },
      },
    });
  };

  return (
    <div className="min-h-screen py-28 relative">
      <div className="absolute w-[24rem] h-[24rem] rounded-full bg-primary/10 blur-[100px] top-16 -left-16 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 text-ink">
          Confirm Your Ride
        </h1>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Ride Details Card */}
          <div className="glass-strong rounded-md p-6">
            <h2 className="font-display text-lg font-semibold mb-4 text-ink">
              Ride Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
                <div>
                  <p className="text-xs text-ink-variant">From</p>
                  <p className="font-medium text-ink">{rideDetails.from}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
                <div>
                  <p className="text-xs text-ink-variant">To</p>
                  <p className="font-medium text-ink">{rideDetails.to}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-primary mr-2" />
                  <span className="text-ink">{rideDetails.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-primary mr-2" />
                  <span className="text-ink">{rideDetails.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Details Card */}
          <div className="glass-strong rounded-md p-6">
            <h2 className="font-display text-lg font-semibold mb-4 text-ink">
              Vehicle Details
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Car className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-ink capitalize">{rideDetails.vehicle}</h3>
                <div className="text-sm text-ink-variant space-y-1 mt-2">
                  <p className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Available Seats: {rideDetails.seats}
                  </p>
                  <p>Status: {rideDetails.isBooked ? 'Pre-booked' : 'Not Pre-booked'}</p>
                </div>
              </div>
              <p className="ml-auto text-lg font-display font-bold text-primary shrink-0">
                {rideDetails.price == null ? "Price to be decided" : `₹${rideDetails.price}`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            {error && <p className="text-danger text-sm text-center">{error}</p>}
            <Button className="flex-1" onClick={handleBooking} disabled={loading}>
              {loading ? 'Sending Request...' : 'Request to Join'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
