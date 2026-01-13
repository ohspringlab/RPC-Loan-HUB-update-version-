import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "@/components/ui/step-indicator";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Eye, EyeOff, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface RegistrationData {
  fullName: string;
  cellPhone: string;
  email: string;
  password: string;
  confirmPassword: string;
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  propertyName: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: "",
    cellPhone: "",
    email: "",
    password: "",
    confirmPassword: "",
    propertyAddress: "",
    city: "",
    state: "",
    zip: "",
    propertyName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    if (value.length >= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length >= 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    
    setFormData((prev) => ({ ...prev, cellPhone: value }));
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.cellPhone) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (formData.cellPhone.replace(/\D/g, '').length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password || !formData.confirmPassword) {
      toast.error("Please enter and confirm your password");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.propertyAddress || !formData.city || !formData.state || !formData.zip) {
      toast.error("Please fill in all property address fields");
      return false;
    }
    if (formData.zip.length < 5) {
      toast.error("Please enter a valid ZIP code");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { loanId } = await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.cellPhone,
        propertyAddress: formData.propertyAddress,
        propertyCity: formData.city,
        propertyState: formData.state,
        propertyZip: formData.zip,
        propertyName: formData.propertyName || undefined,
      });
      
      toast.success("Account created successfully! Let's complete your loan request.");
      // Navigate to loan request form with the new loan ID
      navigate(`/loan-request/${loanId}`);
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { strength: 1, label: "Weak", color: "bg-destructive" };
    if (score <= 3) return { strength: 2, label: "Fair", color: "bg-warning" };
    if (score <= 4) return { strength: 3, label: "Good", color: "bg-info" };
    return { strength: 4, label: "Strong", color: "bg-success" };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar variant="light" />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Start Your Loan Request
            </h1>
            <p className="text-muted-foreground">
              Create your account to get a soft quote in minutes
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <StepIndicator 
              currentStep={step} 
              totalSteps={3}
              labels={["Your Info", "Security", "Subject Property"]}
            />
          </div>

          {/* Form Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center">
                  {step === 1 && <User className="w-5 h-5 text-gold-600" />}
                  {step === 2 && <CheckCircle2 className="w-5 h-5 text-gold-600" />}
                  {step === 3 && <MapPin className="w-5 h-5 text-gold-600" />}
                </div>
                <div>
                  <CardTitle>
                    {step === 1 && "Personal Information"}
                    {step === 2 && "Create Password"}
                    {step === 3 && "Subject Property"}
                  </CardTitle>
                  <CardDescription>
                    {step === 1 && "Tell us about yourself"}
                    {step === 2 && "Secure your account"}
                    {step === 3 && "Property you're financing"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Smith"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cellPhone">Cell Phone *</Label>
                    <Input
                      id="cellPhone"
                      name="cellPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.cellPhone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full ${
                                i <= strength.strength ? strength.color : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Password strength: <span className="font-medium">{strength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">Password requirements:</p>
                    <ul className="space-y-1">
                      {[
                        { met: formData.password.length >= 8, text: "At least 8 characters" },
                        { met: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
                        { met: /[0-9]/.test(formData.password), text: "One number" },
                        { met: /[^A-Za-z0-9]/.test(formData.password), text: "One special character" },
                      ].map((req, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${req.met ? "text-success" : "text-muted"}`} />
                          {req.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gold-700">
                      <strong>Subject Property:</strong> Enter the address of the property you want to finance.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyAddress">Property Address *</Label>
                    <Input
                      id="propertyAddress"
                      name="propertyAddress"
                      placeholder="123 Main Street"
                      value={formData.propertyAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Los Angeles"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="CA"
                        maxLength={2}
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      name="zip"
                      placeholder="90001"
                      maxLength={5}
                      value={formData.zip}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyName">Entity Name (TBD LLC)</Label>
                    <Input
                      id="propertyName"
                      name="propertyName"
                      placeholder="TBD LLC"
                      value={formData.propertyName}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                {step > 1 ? (
                  <Button variant="ghost" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <Link to="/">
                    <Button variant="ghost">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </Link>
                )}
                <Button variant="gold" onClick={handleNext} disabled={isLoading}>
                  {isLoading ? (
                    "Creating Account..."
                  ) : step === 3 ? (
                    "Create Account & Continue"
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
