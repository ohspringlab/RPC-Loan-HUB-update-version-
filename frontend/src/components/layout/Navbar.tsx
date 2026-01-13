import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  variant?: "light" | "dark";
}

export function Navbar({ variant = "light" }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  const isLight = variant === "light";
  
  const navLinks = [
    { href: "/loan-programs", label: "Loan Programs" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isLight ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className={cn(
              "w-14 h-14 rounded-lg flex items-center justify-center",
              isLight ? "bg-navy-800" : "bg-white/10 backdrop-blur-sm"
            )}>
              <Building2 className={cn(
                "w-8 h-8",
                isLight ? "text-gold-400" : "text-gold-400"
              )} />
            </div>
            <span className={cn(
              "font-display text-2xl font-bold",
              isLight ? "text-navy-900" : "text-white"
            )}>
              RPC
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isLight 
                    ? "text-navy-600 hover:text-navy-900" 
                    : "text-white/80 hover:text-white",
                  location.pathname === link.href && (isLight ? "text-navy-900" : "text-white")
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant={isLight ? "ghost" : "hero-outline"} size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="gold" size="sm">
                Request a Loan
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              "md:hidden p-2 rounded-lg",
              isLight ? "text-navy-900" : "text-white"
            )}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={cn(
          "md:hidden absolute top-full left-0 right-0 p-4",
          isLight ? "bg-white shadow-lg" : "bg-navy-900/95 backdrop-blur-md"
        )}>
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isLight 
                    ? "text-navy-600 hover:bg-navy-50" 
                    : "text-white/80 hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border my-2 pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="gold" className="w-full">Request a Loan</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
