import { Shield, Bell } from 'lucide-react';

export default function Safety() {
  return (
    <div className="min-h-screen py-28 relative">
      <div className="absolute w-[26rem] h-[26rem] rounded-full bg-primary/10 blur-[110px] top-10 -right-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-display text-4xl font-bold mb-6 text-ink">
            Your Safety is Our Priority
          </h1>
          <p className="text-lg text-ink-variant">
            We've implemented comprehensive safety measures to ensure secure
            rides for all our users.
          </p>
        </div>

        {/* Safety Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
          {[
            {
              icon: <Shield className="w-10 h-10 text-primary" />,
              title: "Verified Users",
              description: "All users sign in with their college Google account, keeping the community trusted."
            },
            {
              icon: <Bell className="w-10 h-10 text-primary" />,
              title: "In-Ride Chat",
              description: "Coordinate directly with your ride group before and during the trip."
            },
          ].map((feature, index) => (
            <div key={index} className="glass-card rounded-md p-8">
              <span className="inline-flex glass rounded-lg p-3 mb-4">
                {feature.icon}
              </span>
              <h3 className="font-display text-lg font-semibold mb-2 text-ink">{feature.title}</h3>
              <p className="text-sm text-ink-variant">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Safety Tips */}
        <div className="glass-strong rounded-md p-8 max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold mb-6 text-center text-ink">
            Safety Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              "Verify your driver's identity before entering the vehicle",
              "Share your trip details with friends or family",
              "Travel in groups when possible",
              "Keep your personal information private",
              "Trust your instincts and report suspicious behavior",
              "Stay in well-lit and populated areas"
            ].map((tip, index) => (
              <div key={index} className="flex items-start">
                <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white text-sm flex items-center justify-center mr-3 mt-0.5 shadow-glow">
                  {index + 1}
                </div>
                <p className="text-sm text-ink-variant">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
