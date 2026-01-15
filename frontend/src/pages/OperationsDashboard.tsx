import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { statusConfig, LoanStatus } from "@/components/loan/LoanTracker";
import { useAuth } from "@/contexts/AuthContext";
import { opsApi, Loan, StatusOption, PipelineStats } from "@/lib/api";
import { 
  Building2, Search, Filter, DollarSign, Users, Clock, TrendingUp, FileText, Eye, 
  MoreVertical, Bell, Settings, LogOut, User, ChevronDown, Home, RefreshCw, AlertTriangle, CheckCircle2
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  useEffect(() => {
    loadData();
  }, [statusFilter, searchQuery]);

  const loadData = async () => {
    try {
      const [pipelineRes, statsRes, statusRes] = await Promise.all([
        opsApi.getPipeline({ status: statusFilter !== 'all' ? statusFilter : undefined, search: searchQuery || undefined }),
        opsApi.getStats(),
        opsApi.getStatusOptions()
      ]);
      setLoans(pipelineRes.loans);
      setStats(statsRes);
      setStatusOptions(statusRes.statuses);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load pipeline data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedLoan || !newStatus) return;
    
    try {
      await opsApi.updateStatus(selectedLoan.id, newStatus, statusNotes);
      toast.success('Status updated successfully');
      setShowStatusDialog(false);
      setSelectedLoan(null);
      setNewStatus("");
      setStatusNotes("");
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="min-h-screen dashboard-bg">
      <header className="bg-navy-900 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gold-400" />
                </div>
                <span className="font-display text-2xl font-bold">RPC</span>
              </Link>
              <Badge variant="outline" className="border-gold-400/50 text-gold-400">
                Operations Portal
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <Bell className="w-5 h-5" />
                    {stats && stats.recentUploads > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-gold-400 rounded-full" />
                    )}
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gold-500 text-navy-900 text-sm font-bold">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:block text-sm font-medium">{user.fullName}</span>
                        <ChevronDown className="w-4 h-4 text-white/60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Operations Team</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><User className="w-4 h-4 mr-2" /> My Profile</DropdownMenuItem>
                      <DropdownMenuItem><Settings className="w-4 h-4 mr-2" /> Settings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="gold" size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Pipeline Overview</h1>
            <p className="text-muted-foreground">Manage and track all loan applications</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Pipeline" value={stats?.totalLoans || 0} icon={FileText} description="Active loans" />
          <StatsCard 
            title="Pipeline Value" 
            value={formatCurrency(stats?.byStatus.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0)} 
            icon={DollarSign} 
          />
          <StatsCard 
            title="Pending Approvals" 
            value={loans.filter(l => l.status === 'quote_requested').length} 
            icon={AlertTriangle} 
            description="Quote requests" 
            className={loans.filter(l => l.status === 'quote_requested').length > 0 ? "border-yellow-500 bg-yellow-50" : ""}
          />
          <StatsCard 
            title="This Month" 
            value={formatCurrency(stats?.monthlyVolume || 0)} 
            icon={TrendingUp} 
            description={`${stats?.monthlyFunded || 0} loans funded`} 
          />
        </div>

        {/* Pending Quote Requests Alert */}
        {loans.filter(l => l.status === 'quote_requested').length > 0 && (
          <Card className="mb-8 border-yellow-500 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="w-5 h-5" />
                Pending Quote Approvals ({loans.filter(l => l.status === 'quote_requested').length})
              </CardTitle>
              <CardDescription>
                These loan requests are awaiting your approval to generate quotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loans.filter(l => l.status === 'quote_requested').slice(0, 5).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{loan.loan_number}</p>
                      <p className="text-sm text-muted-foreground">{loan.borrower_name} - {formatCurrency(loan.loan_amount || 0)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/ops/loans/${loan.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        type="button"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            await opsApi.approveQuote(loan.id);
                            toast.success(`Quote approved for ${loan.loan_number}`);
                            loadData();
                          } catch (error: any) {
                            console.error('Approve quote error:', error);
                            toast.error(error.message || 'Failed to approve quote');
                          }
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Quote
                      </Button>
                    </div>
                  </div>
                ))}
                {loans.filter(l => l.status === 'quote_requested').length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    And {loans.filter(l => l.status === 'quote_requested').length - 5} more...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Loan Pipeline</CardTitle>
                <CardDescription>View and manage all active applications</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search borrower, loan #, property..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Loan #</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No loans found
                        </TableCell>
                      </TableRow>
                    ) : (
                      loans.map((loan) => {
                        const config = statusConfig[loan.status as LoanStatus] || { label: loan.status, color: "bg-gray-100 text-gray-700" };
                        return (
                          <TableRow key={loan.id} className="hover:bg-muted/30">
                            <TableCell className="font-mono text-sm">{loan.loan_number}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{loan.borrower_name}</p>
                                <p className="text-xs text-muted-foreground">{loan.borrower_email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Home className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate max-w-[200px]">
                                  {loan.property_address}, {loan.property_city}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(loan.loan_amount || 0)}</TableCell>
                            <TableCell>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                {config.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`text-sm ${(loan.days_in_status || 0) > 3 ? "text-destructive font-medium" : ""}`}>
                                {loan.days_in_status || 0}d
                              </span>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/ops/loans/${loan.id}`)}>
                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                  </DropdownMenuItem>
                                  {loan.status === 'quote_requested' && (
                                    <DropdownMenuItem 
                                      onClick={async () => {
                                        try {
                                          await opsApi.approveQuote(loan.id);
                                          toast.success('Quote approved and generated successfully');
                                          loadData();
                                        } catch (error: any) {
                                          toast.error(error.message || 'Failed to approve quote');
                                        }
                                      }}
                                      className="text-green-600 focus:text-green-600"
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Quote
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => { setSelectedLoan(loan); setNewStatus(loan.status); setShowStatusDialog(true); }}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Users className="w-4 h-4 mr-2" /> Contact Borrower
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Loan Status</DialogTitle>
            <DialogDescription>
              {selectedLoan?.loan_number} - {selectedLoan?.borrower_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea 
                placeholder="Add notes about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
            <Button variant="gold" onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
