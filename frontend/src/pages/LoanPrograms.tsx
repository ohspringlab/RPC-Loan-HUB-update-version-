import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  ArrowRight, 
  CheckCircle2, 
  Home,
  Building2,
  Briefcase,
  TrendingUp,
  DollarSign,
  Clock,
  Shield,
  FileCheck,
  Percent,
  Calendar,
  Users,
  Zap,
  BarChart3,
  Key
} from "lucide-react";
import { useState } from "react";

interface LoanProgram {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  category: "residential" | "commercial" | "multifamily";
  description: string;
  rateRange: string;
  ltv: string;
  term: string;
  features: string[];
  requirements: string[];
  useCases: string[];
  documentation: string[];
}

const loanPrograms: LoanProgram[] = [
  {
    id: "fix-flip",
    icon: Home,
    title: "Fix & Flip",
    category: "residential",
    description: "Short-term bridge financing for property renovation and resale projects. Perfect for investors looking to quickly acquire, renovate, and sell properties.",
    rateRange: "9.5% - 11.5%",
    ltv: "Up to 90%",
    term: "12-24 months",
    features: [
      "Up to 90% LTV",
      "12-24 month terms",
      "Quick closings (7-14 days)",
      "Interest-only payments",
      "No prepayment penalties",
      "Rehab budget included"
    ],
    requirements: [
      "Minimum credit score: 640",
      "Experience with fix & flip projects",
      "Scope of work and contractor bids",
      "Property appraisal",
      "Down payment: 10-20%"
    ],
    useCases: [
      "Single-family home renovations",
      "Multi-unit property flips",
      "Quick turnaround investments",
      "Distressed property acquisitions"
    ],
    documentation: [
      "Government ID",
      "Scope of work with budget",
      "Contractor bids",
      "Experience resume",
      "Property appraisal"
    ]
  },
  {
    id: "ground-up",
    icon: Building2,
    title: "Ground-Up Construction",
    category: "residential",
    description: "Comprehensive financing for new construction projects from the ground up. Includes land acquisition, construction, and interest reserves.",
    rateRange: "10.0% - 12.0%",
    ltv: "Up to 75% LTC",
    term: "12-36 months",
    features: [
      "Up to 75% Loan-to-Cost (LTC)",
      "Interest reserves available",
      "Draw schedules",
      "Construction monitoring",
      "Flexible terms",
      "Land acquisition included"
    ],
    requirements: [
      "Minimum credit score: 680",
      "Licensed contractor",
      "Detailed construction plans",
      "Permits and approvals",
      "Experience with construction projects"
    ],
    useCases: [
      "New single-family homes",
      "Custom home construction",
      "Small development projects",
      "Spec home building"
    ],
    documentation: [
      "Construction plans and permits",
      "Contractor license and insurance",
      "Detailed budget breakdown",
      "Timeline and draw schedule",
      "Property appraisal"
    ]
  },
  {
    id: "dscr-rental",
    icon: TrendingUp,
    title: "DSCR / Investor Rental",
    category: "residential",
    description: "Qualify based on property cash flow, not personal income. Perfect for investors who want to expand their portfolio without income verification.",
    rateRange: "6.75% - 7.25%",
    ltv: "Up to 80%",
    term: "30 years",
    features: [
      "No tax returns required",
      "No income verification",
      "DSCR-based qualification",
      "30-year fixed terms",
      "Investor-friendly",
      "Portfolio expansion"
    ],
    requirements: [
      "Minimum credit score: 680",
      "DSCR of 1.15 or higher",
      "Property rental income",
      "Property appraisal",
      "Down payment: 20-25%"
    ],
    useCases: [
      "Rental property purchases",
      "Portfolio expansion",
      "Investment property refinance",
      "Long-term hold strategies"
    ],
    documentation: [
      "Government ID",
      "Rental income documentation",
      "Property operating statement",
      "Lease agreements",
      "Property appraisal"
    ]
  },
  {
    id: "bridge",
    icon: Briefcase,
    title: "Bridge Loans",
    category: "commercial",
    description: "Flexible short-term financing to bridge the gap between transactions. Ideal for acquisitions, stabilization, or time-sensitive opportunities.",
    rateRange: "7.5% - 9.0%",
    ltv: "Up to 75%",
    term: "6-24 months",
    features: [
      "Fast funding (7-14 days)",
      "Flexible terms",
      "No prepayment penalty",
      "Acquisition financing",
      "Stabilization period",
      "Extension options"
    ],
    requirements: [
      "Minimum credit score: 660",
      "Property value assessment",
      "Exit strategy",
      "Experience with commercial properties",
      "Down payment: 25-30%"
    ],
    useCases: [
      "Commercial property acquisition",
      "Property stabilization",
      "Time-sensitive opportunities",
      "Value-add transitions"
    ],
    documentation: [
      "Government ID",
      "Property financials",
      "Business plan",
      "Exit strategy",
      "Property appraisal"
    ]
  },
  {
    id: "heloc",
    icon: Key,
    title: "Investment HELOC",
    category: "residential",
    description: "Revolving line of credit for investment properties. Access your equity as needed with flexible draw and repayment options.",
    rateRange: "8.0% - 10.0%",
    ltv: "Up to 90%",
    term: "10-30 years",
    features: [
      "Revolving credit line",
      "Up to 90% LTV",
      "Interest-only payments",
      "Flexible draws",
      "No prepayment penalty",
      "Portfolio access"
    ],
    requirements: [
      "Minimum credit score: 700",
      "Existing investment property",
      "Property equity",
      "Property appraisal",
      "Debt service coverage"
    ],
    useCases: [
      "Portfolio expansion",
      "Property improvements",
      "Working capital",
      "Opportunity funding"
    ],
    documentation: [
      "Government ID",
      "Property ownership docs",
      "Property financials",
      "Existing mortgage statements",
      "Property appraisal"
    ]
  },
  {
    id: "multifamily-bridge",
    icon: Users,
    title: "Multifamily Bridge",
    category: "multifamily",
    description: "Short-term financing for multifamily properties. Perfect for acquisitions, repositioning, or stabilization of apartment buildings.",
    rateRange: "7.5% - 9.0%",
    ltv: "Up to 75%",
    term: "12-36 months",
    features: [
      "Up to 75% LTV",
      "Interest reserves",
      "Stabilization period",
      "Flexible terms",
      "Portfolio consideration",
      "Extension options"
    ],
    requirements: [
      "Minimum credit score: 680",
      "5+ unit properties",
      "Property financials",
      "Management experience",
      "Down payment: 25-30%"
    ],
    useCases: [
      "Multifamily acquisitions",
      "Property repositioning",
      "Stabilization financing",
      "Value-add projects"
    ],
    documentation: [
      "Government ID",
      "Rent roll",
      "Operating statements",
      "Management agreements",
      "Property appraisal"
    ]
  },
  {
    id: "multifamily-value-add",
    icon: BarChart3,
    title: "Multifamily Value-Add",
    category: "multifamily",
    description: "Financing for multifamily properties requiring renovation or repositioning. Includes rehab budget and stabilization period.",
    rateRange: "8.0% - 10.0%",
    ltv: "Up to 80%",
    term: "12-36 months",
    features: [
      "Rehab budget included",
      "Up to 80% LTV",
      "Stabilization period",
      "Interest reserves",
      "Draw schedules",
      "Value-add focus"
    ],
    requirements: [
      "Minimum credit score: 680",
      "Value-add experience",
      "Renovation plan",
      "Property financials",
      "Management plan"
    ],
    useCases: [
      "Apartment renovations",
      "Unit upgrades",
      "Common area improvements",
      "Rent increase strategies"
    ],
    documentation: [
      "Government ID",
      "Renovation scope and budget",
      "Rent roll",
      "Operating statements",
      "Property appraisal"
    ]
  },
  {
    id: "rate-term",
    icon: Percent,
    title: "Rate & Term Refinance",
    category: "residential",
    description: "Refinance to lower your interest rate or change loan terms. Reduce monthly payments or shorten your loan term.",
    rateRange: "6.75% - 7.25%",
    ltv: "Up to 80%",
    term: "15-30 years",
    features: [
      "Lower interest rates",
      "Flexible terms",
      "No cash out",
      "Rate reduction focus",
      "Term optimization",
      "Streamlined process"
    ],
    requirements: [
      "Minimum credit score: 680",
      "Existing investment property",
      "Current mortgage",
      "Property equity",
      "DSCR of 1.15+"
    ],
    useCases: [
      "Rate reduction",
      "Term changes",
      "Payment optimization",
      "Loan consolidation"
    ],
    documentation: [
      "Government ID",
      "Current mortgage statement",
      "Property financials",
      "Rental income docs",
      "Property appraisal"
    ]
  },
  {
    id: "cash-out",
    icon: DollarSign,
    title: "Cash-Out Refinance",
    category: "residential",
    description: "Access your property's equity through a cash-out refinance. Use funds for investments, improvements, or other opportunities.",
    rateRange: "6.75% - 7.25%",
    ltv: "Up to 75%",
    term: "15-30 years",
    features: [
      "Access property equity",
      "Up to 75% LTV",
      "Flexible use of funds",
      "Competitive rates",
      "Long terms available",
      "Portfolio consideration"
    ],
    requirements: [
      "Minimum credit score: 680",
      "Property equity",
      "DSCR of 1.15+",
      "Property appraisal",
      "Use of funds explanation"
    ],
    useCases: [
      "Portfolio expansion",
      "Property improvements",
      "Business investments",
      "Debt consolidation"
    ],
    documentation: [
      "Government ID",
      "Current mortgage statement",
      "Property financials",
      "Use of funds letter",
      "Property appraisal"
    ]
  },
  {
    id: "portfolio-refinance",
    icon: Building2,
    title: "Portfolio Refinance",
    category: "residential",
    description: "Refinance multiple investment properties in a single transaction. Streamlined process for portfolio optimization.",
    rateRange: "6.75% - 7.25%",
    ltv: "Up to 75%",
    term: "30 years",
    features: [
      "Multiple properties",
      "Single transaction",
      "Portfolio DSCR",
      "Streamlined process",
      "Competitive rates",
      "Bulk pricing"
    ],
    requirements: [
      "Minimum credit score: 700",
      "3+ properties",
      "Portfolio DSCR 1.15+",
      "Property appraisals",
      "Portfolio financials"
    ],
    useCases: [
      "Portfolio optimization",
      "Rate reduction",
      "Cash-out on portfolio",
      "Consolidation"
    ],
    documentation: [
      "Government ID",
      "Portfolio rent roll",
      "All property financials",
      "Property appraisals",
      "Portfolio summary"
    ]
  },
  {
    id: "commercial",
    icon: Briefcase,
    title: "Commercial Loans",
    category: "commercial",
    description: "Comprehensive financing solutions for commercial real estate properties including office, retail, and mixed-use properties.",
    rateRange: "7.75% - 9.25%",
    ltv: "Up to 75%",
    term: "5-25 years",
    features: [
      "Various property types",
      "Up to 75% LTV",
      "Flexible terms",
      "Interest-only options",
      "Balloon payments",
      "Extension options"
    ],
    requirements: [
      "Minimum credit score: 680",
      "Commercial property",
      "Property financials",
      "Lease agreements",
      "Property appraisal"
    ],
    useCases: [
      "Office buildings",
      "Retail properties",
      "Mixed-use developments",
      "Commercial acquisitions"
    ],
    documentation: [
      "Government ID",
      "Lease agreements",
      "Property financials",
      "Tenant information",
      "Property appraisal"
    ]
  }
];

export default function LoanPrograms() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "residential" | "commercial" | "multifamily">("all");
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  const filteredPrograms = selectedCategory === "all" 
    ? loanPrograms 
    : loanPrograms.filter(program => program.category === selectedCategory);

  const categories = [
    { id: "all", label: "All Programs", count: loanPrograms.length },
    { id: "residential", label: "Residential", count: loanPrograms.filter(p => p.category === "residential").length },
    { id: "commercial", label: "Commercial", count: loanPrograms.filter(p => p.category === "commercial").length },
    { id: "multifamily", label: "Multifamily", count: loanPrograms.filter(p => p.category === "multifamily").length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="light" />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-navy-900 to-navy-800 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Loan Programs
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Comprehensive financing solutions designed for every stage of your real estate investment journey. 
              From fix and flip to long-term rental properties, we have the right program for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="gold" size="lg" className="group">
                  Apply Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="hero-outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-muted/50 border-b">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`
                  px-6 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedCategory === category.id
                    ? "bg-gold-500 text-navy-900 shadow-md"
                    : "bg-white text-navy-700 hover:bg-gold-500/10 border border-gray-200"
                  }
                `}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Programs Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => {
              const Icon = program.icon;
              const isExpanded = expandedProgram === program.id;
              
              return (
                <Card 
                  key={program.id} 
                  className="group hover:shadow-xl transition-all overflow-hidden"
                >
                  <CardHeader className="bg-gradient-to-br from-navy-800 to-navy-900 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gold-400" />
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80">
                        {program.category}
                      </span>
                    </div>
                    <CardTitle className="text-xl mb-2">{program.title}</CardTitle>
                    <CardDescription className="text-white/70">
                      {program.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Rate</p>
                        <p className="font-semibold text-sm">{program.rateRange}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">LTV</p>
                        <p className="font-semibold text-sm">{program.ltv}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Term</p>
                        <p className="font-semibold text-sm">{program.term}</p>
                      </div>
                    </div>

                    {/* Features Preview */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold-500" />
                        Key Features
                      </h4>
                      <ul className="space-y-2">
                        {program.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-gold-500 mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                        {program.features.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{program.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedProgram(isExpanded ? null : program.id)}
                      className="w-full text-sm text-gold-600 hover:text-gold-700 font-medium mb-4"
                    >
                      {isExpanded ? "Show Less" : "View Full Details"}
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-6 pt-4 border-t animate-fade-in">
                        {/* All Features */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-gold-500" />
                            All Features
                          </h4>
                          <ul className="space-y-2">
                            {program.features.map((feature, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 text-gold-500 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Requirements */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gold-500" />
                            Requirements
                          </h4>
                          <ul className="space-y-2">
                            {program.requirements.map((req, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-gold-500 mt-1">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Use Cases */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gold-500" />
                            Ideal For
                          </h4>
                          <ul className="space-y-2">
                            {program.useCases.map((useCase, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-gold-500 mt-1">•</span>
                                <span>{useCase}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Documentation */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-gold-500" />
                            Required Documentation
                          </h4>
                          <ul className="space-y-2">
                            {program.documentation.map((doc, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-gold-500 mt-1">•</span>
                                <span>{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <Link to="/register" className="block mt-4">
                      <Button variant="outline" className="w-full group" size="sm">
                        Apply for {program.title}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Choose RPC for Your Financing?
            </h2>
            <p className="text-muted-foreground">
              We understand real estate investors because we are real estate investors. 
              Our team brings decades of combined experience to every transaction.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Fast Approvals</h3>
                <p className="text-sm text-muted-foreground">
                  Get your loan approved in as little as 48 hours with our streamlined process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Competitive Rates</h3>
                <p className="text-sm text-muted-foreground">
                  Industry-leading rates designed to maximize your investment returns.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Flexible Terms</h3>
                <p className="text-sm text-muted-foreground">
                  Customized loan structures tailored to your specific investment strategy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            Apply today and get pre-approved in minutes. Our team is ready to help you fund your next investment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="gold" size="xl" className="group">
                Apply Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="xl">
                Speak with an Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

