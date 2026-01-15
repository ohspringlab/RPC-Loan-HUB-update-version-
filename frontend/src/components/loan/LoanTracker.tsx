import { cn } from "@/lib/utils";
import { Check, Clock, FileText, CreditCard, Home, FileCheck, Shield, Calendar, DollarSign, Send, ClipboardCheck, Building, Banknote } from "lucide-react";

export type LoanStatus = 
  | "new_request"
  | "quote_requested"
  | "soft_quote_issued"
  | "term_sheet_issued"
  | "term_sheet_signed"
  | "needs_list_sent"
  | "needs_list_complete"
  | "submitted_to_underwriting"
  | "appraisal_ordered"
  | "appraisal_received"
  | "conditionally_approved"
  | "conditional_items_needed"
  | "conditional_commitment_issued"
  | "closing_checklist_issued"
  | "clear_to_close"
  | "closing_scheduled"
  | "funded";

interface LoanTrackerStep {
  id: LoanStatus;
  label: string;
  description: string;
  icon: React.ElementType;
}

const steps: LoanTrackerStep[] = [
  { id: "new_request", label: "New Request", description: "Loan request submitted", icon: FileText },
  { id: "quote_requested", label: "Quote Requested", description: "Awaiting soft quote", icon: Send },
  { id: "soft_quote_issued", label: "Soft Quote", description: "Quote generated", icon: DollarSign },
  { id: "term_sheet_issued", label: "Term Sheet", description: "Terms provided", icon: FileCheck },
  { id: "term_sheet_signed", label: "Term Sheet Signed", description: "Terms accepted", icon: Check },
  { id: "needs_list_sent", label: "Needs List", description: "Documents requested", icon: ClipboardCheck },
  { id: "needs_list_complete", label: "Docs Complete", description: "All docs received", icon: FileCheck },
  { id: "submitted_to_underwriting", label: "Underwriting", description: "File in review", icon: Shield },
  { id: "appraisal_ordered", label: "Appraisal Ordered", description: "Appraisal in progress", icon: Home },
  { id: "appraisal_received", label: "Appraisal Received", description: "Value confirmed", icon: Building },
  { id: "conditionally_approved", label: "Cond. Approved", description: "Conditions issued", icon: Check },
  { id: "conditional_commitment_issued", label: "Commitment", description: "Commitment letter ready", icon: FileCheck },
  { id: "closing_checklist_issued", label: "Closing Checklist", description: "Checklist provided", icon: ClipboardCheck },
  { id: "clear_to_close", label: "Clear to Close", description: "Ready for closing", icon: Check },
  { id: "closing_scheduled", label: "Closing Scheduled", description: "Date confirmed", icon: Calendar },
  { id: "funded", label: "Funded", description: "Loan complete!", icon: Banknote },
];

// Map for status labels and colors
export const statusConfig: Record<LoanStatus, { label: string; color: string }> = {
  "new_request": { label: "New Request", color: "bg-gray-100 text-gray-700" },
  "quote_requested": { label: "Quote Requested", color: "bg-blue-100 text-blue-700" },
  "soft_quote_issued": { label: "Soft Quote", color: "bg-cyan-100 text-cyan-700" },
  "term_sheet_issued": { label: "Term Sheet", color: "bg-purple-100 text-purple-700" },
  "term_sheet_signed": { label: "Term Sheet Signed", color: "bg-indigo-100 text-indigo-700" },
  "needs_list_sent": { label: "Needs List Sent", color: "bg-orange-100 text-orange-700" },
  "needs_list_complete": { label: "Docs Complete", color: "bg-amber-100 text-amber-700" },
  "submitted_to_underwriting": { label: "Underwriting", color: "bg-yellow-100 text-yellow-700" },
  "appraisal_ordered": { label: "Appraisal Ordered", color: "bg-pink-100 text-pink-700" },
  "appraisal_received": { label: "Appraisal Received", color: "bg-rose-100 text-rose-700" },
  "conditionally_approved": { label: "Cond. Approved", color: "bg-lime-100 text-lime-700" },
  "conditional_items_needed": { label: "Items Needed", color: "bg-orange-100 text-orange-700" },
  "conditional_commitment_issued": { label: "Commitment", color: "bg-emerald-100 text-emerald-700" },
  "closing_checklist_issued": { label: "Closing Checklist Issued", color: "bg-purple-100 text-purple-700" },
  "clear_to_close": { label: "Clear to Close", color: "bg-green-100 text-green-700" },
  "closing_scheduled": { label: "Closing Scheduled", color: "bg-green-200 text-green-800" },
  "funded": { label: "Funded", color: "bg-green-300 text-green-900" },
};

interface LoanTrackerProps {
  currentStatus: LoanStatus;
  compact?: boolean;
}

export function LoanTracker({ currentStatus, compact = false }: LoanTrackerProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStatus);
  const isFunded = currentStatus === "funded";

  if (compact) {
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isCompleted = isFunded ? index <= currentIndex : index < currentIndex;
          const isCurrent = !isFunded && index === currentIndex;
          
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0 transition-all",
                  isCompleted && "bg-success",
                  isCurrent && "bg-gold-500 ring-4 ring-gold-500/20",
                  !isCompleted && !isCurrent && "bg-muted"
                )}
              />
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-4 h-0.5 mx-0.5",
                  index < currentIndex ? "bg-success" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isCompleted = isFunded ? index <= currentIndex : index < currentIndex;
        const isCurrent = !isFunded && index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="tracker-step">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all z-10",
                isCompleted && "bg-success text-white",
                isCurrent && "bg-gold-500 text-navy-900 ring-4 ring-gold-500/20",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </div>
            <div className={cn(
              "pb-8",
              !isCompleted && !isCurrent && "opacity-50"
            )}>
              <p className={cn(
                "font-medium text-sm",
                isCurrent && "text-gold-600"
              )}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LoanTrackerHorizontal({ currentStatus }: { currentStatus: LoanStatus }) {
  const currentIndex = steps.findIndex(s => s.id === currentStatus);
  const isFunded = currentStatus === "funded";
  const displaySteps = steps.slice(0, 8); // Show first 8 steps for horizontal

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start min-w-max gap-4 p-4">
        {displaySteps.map((step, index) => {
          const isCompleted = isFunded ? index <= currentIndex : index < currentIndex;
          const isCurrent = !isFunded && index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center relative">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isCompleted && "bg-success text-white",
                  isCurrent && "bg-gold-500 text-navy-900 ring-4 ring-gold-500/20 animate-pulse-gold",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              {index < displaySteps.length - 1 && (
                <div className={cn(
                  "absolute top-5 left-10 w-8 h-0.5",
                  index < currentIndex ? "bg-success" : "bg-muted"
                )} />
              )}
              <span className={cn(
                "text-xs mt-2 text-center max-w-[80px]",
                isCurrent ? "font-medium text-gold-600" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Domino's Pizza-style tracker - prominent horizontal progress tracker
export function LoanTrackerDominos({ currentStatus }: { currentStatus: LoanStatus }) {
  const currentIndex = steps.findIndex(s => s.id === currentStatus);
  const isFunded = currentStatus === "funded";
  const progressPercentage = isFunded ? 100 : ((currentIndex + 1) / steps.length) * 100;
  const currentStep = currentIndex >= 0 ? steps[currentIndex] : null;
  const CurrentIcon = currentStep?.icon;

  return (
    <div className="w-full">
      {/* Progress Bar Background */}
      <div className="relative w-full h-2 bg-muted rounded-full mb-8 overflow-hidden">
        {/* Progress Fill */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-success via-gold-500 to-gold-400 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Stages */}
      <div className="relative w-full overflow-x-auto pb-4">
        <div className="flex items-start min-w-max px-2">
          {steps.map((step, index) => {
            // If funded, all steps including the last one are completed
            const isCompleted = isFunded ? index <= currentIndex : index < currentIndex;
            const isCurrent = !isFunded && index === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex flex-col items-center relative transition-all duration-300",
                    "min-w-[100px] max-w-[120px]"
                  )}
                >
                  {/* Stage Circle */}
                  <div
                    className={cn(
                      "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                      "border-2",
                      isCompleted && "bg-success border-success text-white scale-110",
                      isCurrent && "bg-gold-500 border-gold-600 text-navy-900 scale-125 ring-4 ring-gold-500/30 animate-pulse",
                      !isCompleted && !isCurrent && "bg-muted border-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className={cn(
                        "w-5 h-5",
                        isCurrent && "animate-bounce"
                      )} />
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className={cn(
                    "mt-3 text-center transition-all duration-300 w-full",
                    isCurrent && "scale-105"
                  )}>
                    <p className={cn(
                      "font-semibold text-xs leading-tight mb-1",
                      isCompleted && "text-success font-bold",
                      isCurrent && "text-gold-600 font-bold",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}>
                      {step.label}
                    </p>
                    <p className={cn(
                      "text-[10px] leading-tight",
                      isCompleted || isCurrent ? "text-foreground/70" : "text-muted-foreground/60"
                    )}>
                      {step.description}
                    </p>
                  </div>

                  {/* Current Stage Indicator */}
                  {isCurrent && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-ping" />
                    </div>
                  )}
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 mx-2 transition-all duration-300",
                      isCompleted ? "bg-success w-16" : "bg-muted w-8"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Info */}
      {currentStep && CurrentIcon && (
        <div className={cn(
          "mt-6 p-4 rounded-lg border",
          isFunded 
            ? "bg-success/10 border-success/20" 
            : "bg-gold-500/10 border-gold-500/20"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isFunded 
                ? "bg-success text-white" 
                : "bg-gold-500 text-navy-900"
            )}>
              {isFunded ? (
                <Check className="w-5 h-5" />
              ) : (
                <CurrentIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className={cn(
                "font-semibold text-sm",
                isFunded ? "text-success" : "text-gold-700"
              )}>
                {isFunded ? "Completed Stage" : "Current Stage"}: {currentStep.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentStep.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Full vertical tracker for loan detail page
export function LoanTrackerFull({ currentStatus }: { currentStatus: LoanStatus }) {
  const currentIndex = steps.findIndex(s => s.id === currentStatus);
  // If status is "funded" (final step), treat it as completed
  const isFunded = currentStatus === "funded";

  return (
    <div className="relative">
      {steps.map((step, index) => {
        // If funded, all steps including the last one are completed
        const isCompleted = isFunded ? index <= currentIndex : index < currentIndex;
        const isCurrent = !isFunded && index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex gap-4 pb-6 last:pb-0">
            {/* Line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "absolute left-4 w-0.5 h-6 mt-8",
                isCompleted ? "bg-success" : "bg-muted"
              )} style={{ top: `${index * 56}px` }} />
            )}
            
            {/* Icon */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all relative z-10",
                isCompleted && "bg-success text-white",
                isCurrent && "bg-gold-500 text-navy-900 ring-4 ring-gold-500/20",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </div>
            
            {/* Content */}
            <div className={cn(
              "flex-1 pt-1",
              !isCompleted && !isCurrent && "opacity-50"
            )}>
              <p className={cn(
                "font-medium text-sm",
                isCompleted && "text-success",
                isCurrent && "text-gold-600"
              )}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
