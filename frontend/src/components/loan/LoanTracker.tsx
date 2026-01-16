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
    <div className="w-full animate-fade-up overflow-hidden">
      {/* Progress Bar Background - Ghost Magic Blue Effect */}
      <div className="relative w-full h-4 bg-gradient-to-r from-slate-200/50 via-slate-100/30 to-slate-200/50 rounded-full mb-8 overflow-visible shadow-inner border border-blue-200/20 backdrop-blur-sm">
        {/* Downloading Star Effects on Progress Bar */}
        <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
          <div className="absolute progress-bar-star progress-bar-star-1" style={{ top: '50%', left: '10%', transform: 'translateY(-50%)' }} />
          <div className="absolute progress-bar-star progress-bar-star-2" style={{ top: '50%', left: '30%', transform: 'translateY(-50%)' }} />
          <div className="absolute progress-bar-star progress-bar-star-3" style={{ top: '50%', left: '50%', transform: 'translateY(-50%)' }} />
          <div className="absolute progress-bar-star progress-bar-star-4" style={{ top: '50%', left: '70%', transform: 'translateY(-50%)' }} />
          <div className="absolute progress-bar-circle progress-bar-circle-1" style={{ top: '50%', left: '20%', transform: 'translateY(-50%)' }} />
          <div className="absolute progress-bar-circle progress-bar-circle-2" style={{ top: '50%', left: '60%', transform: 'translateY(-50%)' }} />
        </div>
        
        {/* Animated Progress Fill with Magic Blue Circle Effect */}
        <div
          className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full relative overflow-visible"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Magic Blue Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 rounded-full shadow-lg" />
          
          {/* Ghost/Glow Effect - Multiple Layers */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/60 via-cyan-300/70 to-blue-500/60 rounded-full blur-md -z-10 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300/40 via-cyan-200/50 to-blue-400/40 rounded-full blur-xl -z-20 animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Floating Magic Circles */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-400/40 rounded-full blur-lg animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute -top-1 right-1/4 w-6 h-6 bg-cyan-300/50 rounded-full blur-md animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-1 right-0 w-10 h-10 bg-blue-500/30 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer rounded-full" 
               style={{ 
                 backgroundSize: '200% 100%',
                 animation: 'shimmer 3s ease-in-out infinite'
               }} 
          />
          
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-cyan-300/40 to-blue-500/30 rounded-full blur-sm" />
        </div>
        
        {/* Progress percentage indicator with magic effect */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-2 text-xs font-bold text-blue-600 drop-shadow-sm z-20">
          {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Stages - Horizontal Scrollable Container */}
      <div className="relative w-full overflow-x-auto overflow-y-visible pb-4 scrollbar-tracker scrollbar-with-stars">
        <div className="flex items-start min-w-max px-2 gap-1">
          {steps.map((step, index) => {
            // If funded, all steps including the last one are completed
            const isCompleted = isFunded ? index <= currentIndex : index < currentIndex;
            const isCurrent = !isFunded && index === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center group">
                <div
                  className={cn(
                    "flex flex-col items-center relative transition-all duration-500 ease-out",
                    "min-w-[100px] max-w-[120px]",
                    "hover:scale-105",
                    isCurrent && "z-20"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Stage Circle */}
                  <div
                    className={cn(
                      "relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-out shadow-lg overflow-visible",
                      "border-2",
                      "group-hover:shadow-xl group-hover:scale-110",
                      isCompleted && "bg-gradient-to-br from-success to-success/80 border-success text-white scale-110 shadow-success/50 shadow-lg",
                      isCurrent && "bg-gradient-to-br from-gold-500 via-gold-400 to-gold-500 border-gold-600 text-navy-900 scale-125 ring-4 ring-gold-500/40 shadow-gold-glow animate-pulse-gold",
                      !isCompleted && !isCurrent && "bg-gradient-to-br from-muted to-muted/80 border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50"
                    )}
                  >
                    {/* Downloading Star Effects for State Icons */}
                    {(isCompleted || isCurrent) && (
                      <>
                        <div className="absolute state-icon-star state-icon-star-1 pointer-events-none" />
                        <div className="absolute state-icon-star state-icon-star-2 pointer-events-none" />
                        <div className="absolute state-icon-star state-icon-star-3 pointer-events-none" />
                        <div className="absolute state-icon-circle state-icon-circle-1 pointer-events-none" />
                        <div className="absolute state-icon-circle state-icon-circle-2 pointer-events-none" />
                      </>
                    )}
                    
                    {/* Inner glow for completed */}
                    {isCompleted && (
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                    )}
                    {/* Inner glow for current */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" style={{ animationDuration: '2s' }} />
                    )}
                    {isCompleted ? (
                      <Check className="w-7 h-7 relative z-10 animate-scale-in" />
                    ) : (
                      <Icon className={cn(
                        "w-6 h-6 relative z-10 transition-transform duration-300",
                        isCurrent && "animate-bounce-subtle"
                      )} />
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className={cn(
                    "mt-4 text-center transition-all duration-500 w-full",
                    isCurrent && "scale-110"
                  )}>
                    <p className={cn(
                      "font-bold text-xs leading-tight mb-1.5 transition-all duration-300",
                      isCompleted && "text-success font-extrabold drop-shadow-sm",
                      isCurrent && "text-gold-600 font-extrabold drop-shadow-sm animate-pulse",
                      !isCompleted && !isCurrent && "text-muted-foreground group-hover:text-foreground/70"
                    )}>
                      {step.label}
                    </p>
                    <p className={cn(
                      "text-[10px] leading-tight transition-all duration-300",
                      isCompleted && "text-success/80 font-medium",
                      isCurrent && "text-gold-700/80 font-medium",
                      !isCompleted && !isCurrent && "text-muted-foreground/60 group-hover:text-muted-foreground/80"
                    )}>
                      {step.description}
                    </p>
                  </div>

                  {/* Current Stage Indicator */}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                      <div className="relative">
                        <div className="w-3 h-3 bg-gold-500 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                        <div className="absolute inset-0 w-3 h-3 bg-gold-400 rounded-full" />
                      </div>
                    </div>
                  )}
                  
                  {/* Completed Stage Glow */}
                  {isCompleted && !isCurrent && (
                    <div className="absolute -inset-1 bg-success/20 rounded-full blur-md -z-10 animate-pulse" style={{ animationDuration: '3s' }} />
                  )}
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="relative mx-3 mt-7">
                    <div className={cn(
                      "h-1 rounded-full transition-all duration-500 ease-out relative overflow-hidden",
                      isCompleted ? "bg-gradient-to-r from-success to-success/80 w-20 shadow-sm" : "bg-gradient-to-r from-muted to-muted/50 w-12"
                    )}>
                      {isCompleted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" 
                             style={{ 
                               backgroundSize: '200% 100%',
                               animation: 'shimmer 2s ease-in-out infinite'
                             }} 
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Info */}
      {currentStep && CurrentIcon && (
        <div className={cn(
          "mt-8 p-5 rounded-xl border-2 shadow-elegant-lg transition-all duration-500 animate-fade-up",
          "bg-gradient-to-br",
          isFunded 
            ? "from-success/15 via-success/10 to-success/5 border-success/30" 
            : "from-gold-500/15 via-gold-400/10 to-gold-300/5 border-gold-500/30",
          "hover:shadow-elegant-lg hover:scale-[1.02]"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300",
              "relative overflow-hidden",
              isFunded 
                ? "bg-gradient-to-br from-success to-success/80 text-white ring-2 ring-success/30" 
                : "bg-gradient-to-br from-gold-500 to-gold-400 text-navy-900 ring-2 ring-gold-500/30",
              "animate-scale-in"
            )}>
              {/* Animated background glow */}
              <div className={cn(
                "absolute inset-0 rounded-xl opacity-50",
                isFunded ? "bg-success" : "bg-gold-400",
                "animate-pulse"
              )} style={{ animationDuration: '2s' }} />
              {isFunded ? (
                <Check className="w-7 h-7 relative z-10" />
              ) : (
                <CurrentIcon className="w-7 h-7 relative z-10 animate-bounce-subtle" />
              )}
            </div>
            <div className="flex-1">
              <p className={cn(
                "font-bold text-base mb-1 transition-colors duration-300",
                isFunded ? "text-success" : "text-gold-700"
              )}>
                {isFunded ? "✓ Completed Stage" : "→ Current Stage"}: <span className="font-extrabold">{currentStep.label}</span>
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                {currentStep.description}
              </p>
            </div>
            {/* Decorative element */}
            <div className={cn(
              "hidden md:block w-16 h-16 rounded-lg opacity-10",
              isFunded ? "bg-success" : "bg-gold-500",
              "blur-xl"
            )} />
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
    <div className="relative overflow-visible">
      {steps.map((step, index) => {
        // If funded, all steps including the last one are completed
        const isCompleted = isFunded ? index <= currentIndex : index < currentIndex;
        const isCurrent = !isFunded && index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex gap-4 pb-6 last:pb-0 overflow-visible">
            {/* Line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "absolute left-4 w-0.5 h-6 mt-8",
                isCompleted ? "bg-success" : "bg-muted"
              )} style={{ top: `${index * 56}px` }} />
            )}
            
            {/* Icon with White Glowing Rail Circle Effect */}
            <div className="relative flex-shrink-0 w-8 h-8 overflow-visible">
              {/* Magic Glowing Star Downloading Effect */}
              {(isCompleted || isCurrent) && (
                <>
                  {/* Glowing Circle Particles */}
                  <div className="absolute star-circle star-circle-1 pointer-events-none" />
                  <div className="absolute star-circle star-circle-2 pointer-events-none" />
                  <div className="absolute star-circle star-circle-3 pointer-events-none" />
                  
                  {/* Star 1 */}
                  <div
                    className="absolute star-download star-1 pointer-events-none"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: '12px',
                      height: '12px',
                    }}
                  />
                  {/* Star 2 */}
                  <div
                    className="absolute star-download star-2 pointer-events-none"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: '10px',
                      height: '10px',
                    }}
                  />
                  {/* Star 3 */}
                  <div
                    className="absolute star-download star-3 pointer-events-none"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: '14px',
                      height: '14px',
                    }}
                  />
                  {/* Star 4 */}
                  <div
                    className="absolute star-download star-4 pointer-events-none"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: '9px',
                      height: '9px',
                    }}
                  />
                  {/* Star 5 */}
                  <div
                    className="absolute star-download star-5 pointer-events-none"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: '11px',
                      height: '11px',
                    }}
                  />
                </>
              )}
              
              {/* Outer Glowing Rail Circle - Background Glow */}
              <div
                className={cn(
                  "absolute rounded-full transition-all duration-500 pointer-events-none",
                  isCompleted && "animate-pulse-rail-glow",
                  isCurrent && "animate-pulse-rail-glow-intense"
                )}
                style={{
                  width: '44px',
                  height: '44px',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: isCompleted 
                    ? '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2)'
                    : isCurrent
                    ? '0 0 25px rgba(255, 255, 255, 0.8), 0 0 50px rgba(255, 255, 255, 0.6), 0 0 80px rgba(255, 255, 255, 0.4), 0 0 100px rgba(255, 255, 255, 0.2)'
                    : '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)',
                  background: isCompleted || isCurrent
                    ? 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 60%)',
                  border: isCompleted || isCurrent
                    ? '2px solid rgba(255, 255, 255, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
              
              {/* Middle Glowing Rail Circle */}
              {(isCompleted || isCurrent) && (
                <div
                  className={cn(
                    "absolute rounded-full transition-all duration-500 pointer-events-none",
                    isCurrent && "animate-ping-rail"
                  )}
                  style={{
                    width: '40px',
                    height: '40px',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 40%, transparent 70%)',
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                />
              )}
              
              {/* Icon Container */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all relative z-10",
                  isCompleted && "bg-success text-white shadow-lg shadow-success/50",
                  isCurrent && "bg-gold-500 text-navy-900 ring-4 ring-gold-500/20 shadow-lg shadow-gold-500/50",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 relative z-10" />
                ) : (
                  <Icon className="w-4 h-4 relative z-10" />
                )}
                
                {/* Inner White Glow on Icon */}
                {(isCompleted || isCurrent) && (
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 40%, transparent 70%)',
                      filter: 'blur(3px)',
                    }}
                  />
                )}
              </div>
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
