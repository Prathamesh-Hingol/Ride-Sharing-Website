import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Find a Ride", path: "/find" },
    { label: "Offer a Ride", path: "/offer" },
    { label: "Chat", path: "/chat" },
    { label: "Safety", path: "/safety" },
  ];

  const aboutLinks = [
    { label: "About Us", path: "/about" },
    { label: "Group Members", path: "/group-members" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <footer className="relative mt-24 border-t border-white/60 bg-surface-low/60 backdrop-blur-glass">
      <div className="container mx-auto px-4 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-glow" />
              <span className="font-display text-xl font-bold text-primary">
                RideShare
              </span>
            </Link>
            <p className="mt-4 text-sm text-ink-variant max-w-xs">
              Connecting students at IIT Indore for safe, affordable, shared
              rides.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-ink mb-4 text-sm tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-ink-variant hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About + Contact */}
          <div>
            <h3 className="font-display font-semibold text-ink mb-4 text-sm tracking-wide">
              About
            </h3>
            <ul className="space-y-2.5 mb-5">
              {aboutLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-ink-variant hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-2 text-sm text-ink-variant">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                support@rideshare.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                +91 91566 13991
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                IIT Indore, 452020
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/60 mt-10 pt-6 text-sm text-center text-ink-variant">
          © {currentYear} RideShare · Built at IIT Indore
        </div>
      </div>
    </footer>
  );
}
