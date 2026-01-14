import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoanTrackerFull, LoanTrackerDominos, statusConfig, LoanStatus } from "@/components/loan/LoanTracker";
import { FullApplicationForm } from "@/components/loan/FullApplicationForm";
import { loansApi, documentsApi, paymentsApi, Loan, NeedsListItem, SoftQuote } from "@/lib/api";
import { 
  ArrowLeft, Building2, DollarSign, FileText, Download, CreditCard, 
  CheckCircle2, AlertCircle, Upload, Shield, FileCheck, Calendar, ClipboardCheck
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function LoanDetail() {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [needsList, setNeedsList] = useState<NeedsListItem[]>([]);
  const [closingChecklist, setClosingChecklist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreditAuth, setShowCreditAuth] = useState(false);
  const [showAppraisalPayment, setShowAppraisalPayment] = useState(false);
  const [creditConsent, setCreditConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (loanId) {
      loadLoanData();
    }
  }, [loanId]);

  const loadLoanData = async () => {
    try {
      const [loanRes, needsRes, checklistRes] = await Promise.all([
        loansApi.get(loanId!),
        documentsApi.getNeedsList(loanId!),
        loansApi.getClosingChecklist(loanId!).catch(() => ({ checklist: [] }))
      ]);
      setLoan(loanRes.loan);
      setNeedsList(needsRes.needsList);
      setClosingChecklist(checklistRes.checklist || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load loan details");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreditAuth = async () => {
    if (!creditConsent) {
      toast.error("Please provide consent to proceed");
      return;
    }

    setIsProcessing(true);
    try {
      await loansApi.creditAuth(loanId!);
      toast.success("Credit authorization completed");
      setShowCreditAuth(false);
      await loadLoanData();
      
      // Auto-generate soft quote after credit auth
      setTimeout(async () => {
        try {
          const quoteRes = await loansApi.generateQuote(loanId!);
          toast.success("Soft quote generated! Check your email.");
          await loadLoanData();
        } catch (error: any) {
          toast.error(error.message || "Failed to generate quote");
        }
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Credit authorization failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignTermSheet = async () => {
    setIsProcessing(true);
    try {
      await loansApi.signTermSheet(loanId!);
      toast.success("Term sheet signed! Needs list will be sent to your email.");
      await loadLoanData();
    } catch (error: any) {
      toast.error(error.message || "Failed to sign term sheet");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAppraisalPayment = async () => {
    setIsProcessing(true);
    try {
      const paymentRes = await paymentsApi.createAppraisalIntent(loanId!);
      
      if (paymentRes.mockMode) {
        // Mock payment for development
        await paymentsApi.confirmPayment(loanId!, paymentRes.clientSecret.split('_')[2]);
        toast.success("Appraisal payment completed (mock mode)");
        setShowAppraisalPayment(false);
        await loadLoanData();
      } else {
        // In production, integrate Stripe Elements here
        toast.info("Payment processing - Stripe integration needed");
      }
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!loan) {
    return null;
  }

  const statusConfigItem = statusConfig[loan.status as LoanStatus] || { label: loan.status, color: "bg-gray-100 text-gray-700" };
  const quote: SoftQuote | null = loan.soft_quote_data || null;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar variant="light" />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Tracker - Domino's Style */}
            <Card className="border-gold-500/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-gold-600" />
                  Loan Progress Tracker
                </CardTitle>
                <CardDescription>
                  Track your loan application through each stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoanTrackerDominos currentStatus={loan.status as LoanStatus} />
              </CardContent>
            </Card>

            {/* Loan Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{loan.loan_number}</CardTitle>
                    <CardDescription className="mt-2">
                      {loan.property_address}, {loan.property_city}, {loan.property_state} {loan.property_zip}
                    </CardDescription>
                  </div>
                  <Badge className={statusConfigItem.color}>{statusConfigItem.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(loan.loan_amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Property Value</p>
                    <p className="text-xl font-semibold">{formatCurrency(loan.property_value || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">LTV</p>
                    <p className="text-xl font-semibold">{loan.requested_ltv}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction Type</p>
                    <p className="text-lg">{loan.transaction_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Cards */}
            {loan.status === "quote_requested" && !loan.credit_authorized && (
              <Card className="border-gold-500/50 bg-gold-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gold-600" />
                    Credit Authorization Required
                  </CardTitle>
                  <CardDescription>
                    Authorize a soft credit pull to generate your quote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="gold" onClick={() => setShowCreditAuth(true)}>
                    Authorize Credit Check
                  </Button>
                </CardContent>
              </Card>
            )}

            {loan.soft_quote_generated && !loan.term_sheet_signed && (
              <Card className="border-cyan-500/50 bg-cyan-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-cyan-600" />
                    Soft Quote Ready
                  </CardTitle>
                  <CardDescription>
                    Review your quote and sign the term sheet to proceed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quote && (
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Interest Rate Range</p>
                          <p className="text-2xl font-bold text-gold-600">{quote.rateRange}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
                          <p className="text-xl font-semibold">{formatCurrency(quote.estimatedMonthlyPayment)}</p>
                        </div>
                      </div>
                      {quote.dscr && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground">DSCR Ratio</p>
                          <p className="text-lg font-semibold">{quote.dscr.toFixed(2)}x</p>
                        </div>
                      )}
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Total Estimated Closing Costs</p>
                        <p className="text-xl font-bold">{formatCurrency(quote.totalClosingCosts)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    {loan.term_sheet_url && (
                      <a href={loan.term_sheet_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" /> Download Term Sheet
                        </Button>
                      </a>
                    )}
                    <Button variant="gold" onClick={handleSignTermSheet} disabled={isProcessing}>
                      {isProcessing ? "Processing..." : "Sign Term Sheet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {loan.status === "needs_list_sent" && (
              <Card>
                <CardHeader>
                  <CardTitle>Document Upload</CardTitle>
                  <CardDescription>Upload required documents for your loan</CardDescription>
                </CardHeader>
                <CardContent>
                  {needsList.length === 0 ? (
                    <p className="text-muted-foreground">No documents requested yet</p>
                  ) : (
                    <div className="space-y-3">
                      {needsList.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{item.document_type}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {item.document_count > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.document_count} file(s) uploaded
                              </p>
                            )}
                          </div>
                          <label>
                            <input
                              type="file"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file && loanId) {
                                  try {
                                    await documentsApi.upload(loanId, file, item.id);
                                    toast.success("Document uploaded");
                                    await loadLoanData();
                                  } catch (error: any) {
                                    toast.error(error.message || "Upload failed");
                                  }
                                }
                              }}
                            />
                            <Button variant="outline" size="sm" asChild>
                              <span>
                                <Upload className="w-4 h-4 mr-2" /> Upload
                              </span>
                            </Button>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {loan.status === "appraisal_ordered" && !loan.appraisal_paid && (
              <Card className="border-orange-500/50 bg-orange-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    Appraisal Payment Required
                  </CardTitle>
                  <CardDescription>
                    Payment is non-refundable. Required to proceed with appraisal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Appraisal Fee</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(loan.property_type === 'commercial' ? 750 : 500)}
                    </p>
                  </div>
                  <Button variant="gold" onClick={() => setShowAppraisalPayment(true)}>
                    Pay Appraisal Fee
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Full Application Form */}
            {loan.status === "needs_list_complete" && !loan.full_application_completed && (
              <FullApplicationForm 
                loanId={loanId!} 
                loan={loan} 
                onComplete={loadLoanData}
              />
            )}

            {/* Closing Checklist */}
            {(loan.status === "conditional_commitment_issued" || loan.status === "closing_checklist_issued" || loan.status === "clear_to_close") && closingChecklist.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" />
                    Closing Checklist
                  </CardTitle>
                  <CardDescription>
                    Complete these items before closing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {closingChecklist.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-start gap-3 p-3 border rounded-lg ${
                          item.completed ? 'bg-muted/50' : ''
                        }`}
                      >
                        <Checkbox
                          checked={item.completed}
                          disabled
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {item.item_name}
                            </p>
                            {item.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          )}
                          {item.completed && item.completed_by_name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Completed by {item.completed_by_name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      {closingChecklist.filter((item: any) => item.completed).length} of {closingChecklist.length} items completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Loan Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <LoanTrackerFull currentStatus={loan.status as LoanStatus} />
              </CardContent>
            </Card>

            {loan.term_sheet_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Downloads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a href={loan.term_sheet_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" /> Term Sheet
                    </Button>
                  </a>
                  {loan.commitment_letter_url && (
                    <a href={loan.commitment_letter_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" /> Commitment Letter
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Credit Authorization Dialog */}
      <Dialog open={showCreditAuth} onOpenChange={setShowCreditAuth}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit Authorization</DialogTitle>
            <DialogDescription>
              Authorize a soft credit pull to generate your loan quote
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                By authorizing this credit check, you agree to:
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Allow RPC Lending to perform a soft credit inquiry</li>
                <li>Use your credit information to generate a loan quote</li>
                <li>Understand this is a soft pull and will not affect your credit score</li>
              </ul>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={creditConsent}
                onCheckedChange={(checked) => setCreditConsent(checked as boolean)}
              />
              <Label htmlFor="consent" className="text-sm cursor-pointer">
                I authorize RPC Lending to perform a soft credit pull for the purpose of generating a loan quote.
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreditAuth(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleCreditAuth} disabled={!creditConsent || isProcessing}>
              {isProcessing ? "Processing..." : "Authorize & Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appraisal Payment Dialog */}
      <Dialog open={showAppraisalPayment} onOpenChange={setShowAppraisalPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appraisal Payment</DialogTitle>
            <DialogDescription>
              Payment is required to proceed with the property appraisal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-900 mb-1">Non-Refundable Payment</p>
              <p className="text-xs text-orange-700">
                This payment is non-refundable once the appraisal process begins.
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Amount</p>
              <p className="text-2xl font-bold">
                {formatCurrency(loan.property_type === 'commercial' ? 750 : 500)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppraisalPayment(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleAppraisalPayment} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

