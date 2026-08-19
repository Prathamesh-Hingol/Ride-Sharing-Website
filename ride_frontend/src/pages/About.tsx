import { Shield, Users, Award, BookOpen } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen py-28 relative">
      <div className="absolute w-[26rem] h-[26rem] rounded-full bg-primary/10 blur-[110px] top-10 -left-20 pointer-events-none" />
      <div className="absolute w-[22rem] h-[22rem] rounded-full bg-secondary/10 blur-[100px] bottom-0 -right-16 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Mission Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-display text-4xl font-bold mb-6 text-ink">About RideShare</h1>
          <p className="text-lg text-ink-variant">
            We're on a mission to make transportation more affordable and
            environmentally friendly by connecting IIT Indore students who
            share similar routes.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: <Shield className="w-7 h-7 text-primary" />,
              title: "Safety First",
              description: "We verify all users through their college Google account and maintain strict safety protocols."
            },
            {
              icon: <Users className="w-7 h-7 text-primary" />,
              title: "Community Driven",
              description: "Built by students, for students, fostering a trusted community of riders."
            },
            {
              icon: <Award className="w-7 h-7 text-primary" />,
              title: "Quality Service",
              description: "Committed to providing reliable and comfortable ride-sharing experiences."
            },
            {
              icon: <BookOpen className="w-7 h-7 text-primary" />,
              title: "Continuous Learning",
              description: "We constantly improve our service based on user feedback and experiences."
            }
          ].map((value, index) => (
            <div key={index} className="glass-card rounded-md p-6">
              <span className="inline-flex glass rounded-lg p-3 mb-4">
                {value.icon}
              </span>
              <h3 className="font-display text-lg font-semibold mb-2 text-ink">{value.title}</h3>
              <p className="text-sm text-ink-variant">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
