import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanTracker, LoanTrackerHorizontal, statusConfig, type LoanStatus } from "@/components/loan/LoanTracker";
import { ArrowRight, Building2, DollarSign, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LoanCardProps {
  id: string;
  loanNumber?: string;
  propertyAddress: string;
  city: string;
  state: string;
  loanAmount: number;
  propertyType: string;
  transactionType: string;
  status: LoanStatus;
  createdAt: string;
  compact?: boolean;
}

export function LoanCard({
  id,
  loanNumber,
  propertyAddress,
  city,
  state,
  loanAmount,
  propertyType,
  transactionType,
  status,
  createdAt,
  compact = false,
}: LoanCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-700" };

  if (compact) {
    return (
      <Link to={`/dashboard/loans/${id}`} className="block">
        <Card className="hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {loanNumber && (
                  <p className="text-xs text-muted-foreground mb-1 font-mono">{loanNumber}</p>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <p className="font-medium truncate">{propertyAddress}</p>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {city}, {state}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg">{formatCurrency(loanAmount)}</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <LoanTracker currentStatus={status} compact />
            </div>
            <div className="mt-3 pt-3 border-t">
              <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                View Details <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/dashboard/loans/${id}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full">
        <CardHeader className="bg-navy-800 text-white pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {loanNumber && (
                <p className="text-gold-400 text-xs font-mono mb-1">{loanNumber}</p>
              )}
              <p className="text-gold-400 text-sm font-medium mb-1">{transactionType}</p>
              <CardTitle className="text-lg truncate">{propertyAddress}</CardTitle>
              <p className="text-white/60 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {city}, {state}
              </p>
            </div>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.color} flex-shrink-0 ml-2`}>
              {config.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Loan Amount</p>
              <p className="font-bold text-lg flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gold-500" />
                {formatCurrency(loanAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Property Type</p>
              <p className="font-medium">{propertyType}</p>
            </div>
          </div>
          
          <LoanTrackerHorizontal currentStatus={status} />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Created {new Date(createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {status === "soft_quote_issued" && (
                <Link to={`/dashboard/loans/${id}`} onClick={(e) => e.stopPropagation()}>
                  <Button variant="default" size="sm" className="gap-1 bg-gold-500 hover:bg-gold-600 text-white">
                    Sign Term Sheet <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" className="gap-1">
                View Details <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
