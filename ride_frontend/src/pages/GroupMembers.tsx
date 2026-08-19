import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { User, MapPin, Calendar, Clock, MessageCircle } from "lucide-react";
import Button from "../components/Button";
import { getRideGroup } from "../services/rideService";
import type { RideGroup } from "../api/rideApi";

export default function GroupMembers() {
  const { rideID } = useParams<{ rideID: string }>();
  const [group, setGroup] = useState<RideGroup | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(rideID);
    if (!Number.isInteger(id) || id <= 0) {
      setError("Invalid ride group.");
      return;
    }
    getRideGroup(id).then(setGroup).catch(() => setError("Unable to load this ride group."));
  }, [rideID]);

  if (error) return <div className="min-h-screen py-28 text-center text-danger">{error}</div>;
  if (!group) return <div className="min-h-screen py-28 text-center text-ink-variant">Loading ride group...</div>;

  const totalSeats = group.totalSeats ?? group.members.length + group.seatsAvailable;
  return (
    <div className="min-h-screen py-28 relative">
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="font-display text-3xl font-bold text-center mb-10 text-ink">Ride Group Members</h1>
        <div className="max-w-2xl mx-auto glass-strong rounded-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center text-ink font-medium"><MapPin className="w-5 h-5 text-primary mr-2" />{group.source} → {group.destination}</div>
            <div className="flex gap-4 text-sm text-ink-variant"><span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{group.date}</span><span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{group.time}</span></div>
          </div>
          <div className="flex justify-between text-sm text-ink-variant pt-3 mt-3 border-t border-white/60"><span>{group.vehicleType}</span><span>{group.members.length}/{totalSeats} seats filled</span></div>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {group.members.map((member) => (
            <div key={member.id} className="glass-card rounded-lg p-4 flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {member.picture ? <img src={member.picture} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-primary" />}
              </div>
              <div className="ml-4"><h2 className="font-medium text-ink">{member.name ?? member.email}</h2><p className="text-sm text-ink-variant">Ride member</p></div>
            </div>
          ))}
        </div>
        <div className="max-w-2xl mx-auto mt-8 flex gap-3">
          <Link to={`/chat/${group.rideID}`} className="flex-1"><Button className="w-full"><MessageCircle className="w-5 h-5" /> Open chat</Button></Link>
          <Link to="/profile" className="flex-1"><Button variant="secondary" className="w-full">Back to profile</Button></Link>
        </div>
      </div>
    </div>
  );
}
