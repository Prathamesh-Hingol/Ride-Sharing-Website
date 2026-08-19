import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Loader, Send, ChevronDown, Users, AlertCircle } from 'lucide-react';

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", {
  withCredentials: true
});

interface RideChatProps {
  rideID: string;
  userID: string;
  UserName: string;
}

interface Message {
  rideId: string;
  user_id: string;
  name: string;
  message: string;
  timestamp: string;
}

interface Member {
  id?: number;
  user_id?: string;
  name: string;
}

export default function RideChat({ rideID, userID, UserName }: RideChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    if (!rideID) return;

    setLoading(true);
    setChatError(null);

    const numericRideId = Number(rideID);

    socket.emit('joinRoom', { rideId: numericRideId });

    socket.on('ride members', (memberList: Member[]) => {
      setMembers(memberList);
    });

    socket.emit("getOlderMessages", { rideId: numericRideId });

    socket.on("older messages", (fetchedMessages: Message[]) => {
      setMessages(fetchedMessages);
      setLoading(false);
      setChatError(null);
    });

    socket.on('chat message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('chat error', (message: string) => {
      setLoading(false);
      setChatError(message);
    });

    // Fallback timeout to prevent infinite spinner if socket doesn't respond
    const timeoutTimer = setTimeout(() => {
      setLoading((currentlyLoading) => {
        if (currentlyLoading) {
          setChatError("Unable to connect to chat server or verify membership.");
          return false;
        }
        return false;
      });
    }, 6000);

    return () => {
      clearTimeout(timeoutTimer);
      socket.off('chat message');
      socket.off('ride members');
      socket.off('older messages');
      socket.off('chat error');
    };
  }, [rideID]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSend = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const numericRideId = Number(rideID);
    const messageData = {
      rideId: numericRideId,
      user: { id: userID, name: UserName },
      message: trimmed,
    };

    socket.emit('chat message', messageData);
    setNewMessage('');
  };

  return (
    <div className="glass-strong rounded-2xl mx-auto max-w-3xl h-[78vh] flex flex-col overflow-hidden border border-white/70 shadow-glass-lg backdrop-blur-2xl">
      <h2 className="font-display text-xl font-bold px-6 pt-5 pb-3 text-center text-ink border-b border-white/60 flex items-center justify-center gap-2">
        Ride Group Chat
      </h2>

      {/* Members Dropdown */}
      <div className="px-4 text-sm pb-2 border-b border-white/60 relative bg-white/20">
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="flex items-center gap-1.5 text-ink-variant font-medium hover:text-primary transition py-1.5"
        >
          <Users className="w-4 h-4 text-primary" />
          <span>Members ({members.length})</span>
          <ChevronDown className={`w-4 h-4 transform transition-transform ${showMembers ? 'rotate-180' : ''}`} />
        </button>

        {showMembers && (
          <div className="absolute z-20 mt-1 glass-strong rounded-xl shadow-glass-lg p-3 w-64 max-h-60 overflow-y-auto border border-white/80">
            {members.length === 0 ? (
              <div className="text-ink-variant/60 text-sm text-center py-2">No members in this group</div>
            ) : (
              members.map((m, idx) => (
                <div
                  key={m.user_id ?? m.id ?? idx}
                  className="text-sm font-medium text-ink px-3 py-1.5 hover:bg-primary/10 rounded-lg flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span>{m.name ? m.name.split('@')[0] : 'Student Member'}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Messages / Loading / Error Area */}
      {loading ? (
        <div className="flex flex-col justify-center items-center flex-grow gap-3">
          <Loader className="animate-spin text-primary w-8 h-8" />
          <p className="text-sm text-ink-variant font-medium">Connecting to chat room...</p>
        </div>
      ) : chatError ? (
        <div className="flex flex-col justify-center items-center flex-grow p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-danger" />
          </div>
          <h3 className="font-display text-lg font-bold text-ink mb-1">Access Restricted</h3>
          <p className="text-sm text-danger max-w-md">{chatError}</p>
        </div>
      ) : (
        <>
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          >
            {messages.length === 0 ? (
              <div className="text-center py-12 text-ink-variant text-sm">
                No messages yet. Start the conversation with your ride members!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isSelf = String(msg.user_id) === String(userID);
                return (
                  <div key={index} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl max-w-xs sm:max-w-sm break-words shadow-sm ${
                        isSelf
                          ? 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-none shadow-glow'
                          : 'glass text-ink rounded-bl-none border border-white/60'
                      }`}
                    >
                      <div className={`text-xs mb-1 font-semibold ${isSelf ? 'text-white/90' : 'text-primary'}`}>
                        {isSelf ? 'You' : (msg.name ? msg.name.split('@')[0] : 'Member')}
                      </div>
                      <div className="text-sm">{msg.message}</div>
                      <div className={`text-[10px] mt-1.5 text-right ${isSelf ? 'text-white/70' : 'text-ink-variant/70'}`}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div className="px-4 py-3 border-t border-white/60 flex items-center gap-2 bg-white/10">
            <div className="glass-input flex-1 rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full bg-transparent focus:outline-none placeholder:text-ink-variant/60 text-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button
              onClick={handleSend}
              className="bg-gradient-to-br from-primary to-primary-dark text-white p-3 rounded-full shadow-glow hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

