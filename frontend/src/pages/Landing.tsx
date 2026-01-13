import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileCheck, 
  Shield, 
  TrendingUp,
  Building2,
  Home,
  Briefcase,
  ChevronRight
} from "lucide-react";
import heroProperty from "@/assets/hero-property.jpg";

const features = [
  {
    icon: Clock,
    title: "Fast Approvals",
    description: "Get your loan approved in as little as 48 hours with our streamlined process.",
  },
  {
    icon: DollarSign,
    title: "Competitive Rates",
    description: "Industry-leading rates designed to maximize your investment returns.",
  },
  {
    icon: Shield,
    title: "Secure Process",
    description: "Bank-level security protects your personal and financial information.",
  },
  {
    icon: FileCheck,
    title: "Simple Documentation",
    description: "Flexible documentation options from full-doc to no-doc programs.",
  },
];

const loanTypes = [
  {
    icon: Home,
    title: "Fix & Flip",
    description: "Short-term financing for property renovation and resale projects.",
    features: ["Up to 90% LTV", "12-24 month terms", "Quick closings"],
  },
  {
    icon: Building2,
    title: "Ground-Up Construction",
    description: "Fund your new construction projects from the ground up.",
    features: ["Up to 75% LTC", "Interest reserves", "Draw schedules"],
  },
  {
    icon: Briefcase,
    title: "Bridge Loans",
    description: "Flexible financing to bridge the gap between transactions.",
    features: ["Fast funding", "Flexible terms", "No prepayment penalty"],
  },
  {
    icon: TrendingUp,
    title: "DSCR Loans",
    description: "Qualify based on property cash flow, not personal income.",
    features: ["No tax returns", "Investor-friendly", "30-year terms"],
  },
];

const stats = [
  { value: "$2B+", label: "Loans Funded" },
  { value: "5,000+", label: "Happy Clients" },
  { value: "48hrs", label: "Avg. Approval Time" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar variant="dark" />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroProperty} 
            alt="Modern investment property" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-navy-900/60" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-white/80 text-sm">Fast & Flexible Real Estate Financing</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Real Estate Loans <br />
              <span className="text-gradient-gold">Made Simple</span>
            </h1>
            
            <p className="text-lg text-white/70 mb-8 max-w-xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Get the financing you need for your next investment property. From fix and flip to ground-up construction, we've got you covered.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/register">
                <Button variant="hero" size="xl" className="group">
                  Request a Loan
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/loan-programs">
                <Button variant="hero-outline" size="xl">
                  View Loan Programs
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-12 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {[
                "No Prepayment Penalties",
                "Close in 7-14 Days",
                "Nationwide Lending"
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-white/60 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 rounded-full bg-white/50" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-navy-800">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="text-3xl md:text-4xl font-display font-bold text-gold-400 mb-2">
                  {stat.value}
                </p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Why Choose RPC?
            </h2>
            <p className="text-muted-foreground">
              We understand real estate investors because we are real estate investors. Our team brings decades of combined experience to every transaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-all border-0 bg-card animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-gold-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Types Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Loan Programs
            </h2>
            <p className="text-muted-foreground">
              Flexible financing solutions designed for every stage of your real estate investment journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {loanTypes.map((loan, i) => (
              <Card key={loan.title} className="group hover:shadow-xl transition-all overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-16 bg-navy-800 flex items-center justify-center py-6 md:py-0">
                      <loan.icon className="w-8 h-8 text-gold-400" />
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="font-semibold text-lg mb-2">{loan.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{loan.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {loan.features.map((feature) => (
                          <span key={feature} className="text-xs px-3 py-1 rounded-full bg-gold-500/10 text-gold-700 font-medium">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center px-6">
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/register">
              <Button variant="gold" size="lg" className="group">
                Get Started Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 hero-gradient">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Ready to Fund Your Next Deal?
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            Join thousands of successful investors who trust RPC for their real estate financing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="gold" size="xl" className="group">
                Request a Loan
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="xl">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
