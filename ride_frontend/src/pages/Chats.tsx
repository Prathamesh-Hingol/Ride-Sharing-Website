import RideChat from '../components/RideChat';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRides } from '../hooks/useRides';
import { Link } from 'react-router-dom';

function Chat() {
  const { rideID } = useParams<{ rideID: string }>();
  const { user } = useAuth();
  const { upcomingRides, loading } = useRides('profile');

  if (!rideID || !user) {
    return (
      <div className="min-h-screen py-28 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-ink mb-2">Your Ride Chats</h1>
          <p className="text-ink-variant mb-8">Select an upcoming ride to open its group chat.</p>
          {loading ? <p className="text-ink-variant">Loading rides...</p> : upcomingRides.length === 0 ? (
            <p className="text-ink-variant">You have no upcoming rides with chat access.</p>
          ) : (
            <div className="space-y-3">{upcomingRides.map((ride) => (
              <Link key={ride.id} to={`/chat/${ride.id}`} className="block glass-card rounded-lg p-4 hover:border-primary/40">
                <p className="font-medium text-ink">{ride.from ?? ride.pickup} → {ride.to ?? ride.dropoff}</p>
                <p className="text-sm text-ink-variant">{ride.date} {ride.time}</p>
              </Link>
            ))}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-28 px-4 relative">
      <div className="absolute w-[24rem] h-[24rem] rounded-full bg-primary/10 blur-[110px] top-10 -left-16 pointer-events-none" />
      <div className="absolute w-[22rem] h-[22rem] rounded-full bg-secondary/10 blur-[100px] bottom-0 -right-16 pointer-events-none" />
      <div className="relative z-10">
        <RideChat
          rideID={rideID}
          userID={String(user.id)}
          UserName={user.name}
        />
      </div>
    </div>
  );
}

export default Chat;
