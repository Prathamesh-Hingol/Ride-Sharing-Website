import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import Button from "./Button";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Find a Ride", path: "/find" },
    { label: "Offer a Ride", path: "/offer" },
    { label: "Chat", path: "/chat" },
    { label: "Safety", path: "/safety" },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 glass-nav">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <span className="w-3 h-3 rounded-full bg-white" />
            </span>
            <span className="font-display text-xl font-bold text-primary tracking-tight">
              RideShare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-body text-sm font-medium transition-all pb-1 ${
                  isActivePath(item.path)
                    ? "text-primary after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full after:shadow-glow"
                    : "text-ink-variant hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Area */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full glass hover:border-primary/40 transition-all group"
                >
                  <span className="text-sm font-medium text-ink-variant group-hover:text-ink">
                    {user?.name?.split(" ")[0] ?? "Profile"}
                  </span>
                  <span className="w-8 h-8 rounded-full overflow-hidden bg-surface-container flex items-center justify-center border border-primary/20">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-ink-variant" />
                    )}
                  </span>
                </Link>
                <button
                  onClick={() => logout()}
                  aria-label="Sign out"
                  className="p-2.5 rounded-full glass text-ink-variant hover:text-danger hover:border-danger/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/signin">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg glass"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-6">
            <nav className="glass-card p-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActivePath(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-ink-variant hover:bg-white/50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-outline-variant/50 my-2" />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-variant hover:bg-white/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/5 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign In</Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
