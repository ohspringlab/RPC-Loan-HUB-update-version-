import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LoanCard } from "@/components/dashboard/LoanCard";
import { LoanTrackerFull, statusConfig, LoanStatus } from "@/components/loan/LoanTracker";
import { useAuth } from "@/contexts/AuthContext";
import { loansApi, documentsApi, profileApi, Loan, NeedsListItem, Notification } from "@/lib/api";
import { 
  ArrowRight, Building2, DollarSign, FileText, Plus, User, Bell, Settings, LogOut, 
  Clock, Upload, FolderOpen, Download, CheckCircle2, AlertCircle, Mail, XCircle
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function BorrowerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [needsList, setNeedsList] = useState<NeedsListItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loansRes, notifRes] = await Promise.all([
        loansApi.list(),
        profileApi.getNotifications()
      ]);
      setLoans(loansRes.loans);
      setNotifications(notifRes.notifications);
      setUnreadCount(notifRes.unreadCount);
      
      if (loansRes.loans.length > 0) {
        setSelectedLoan(loansRes.loans[0]);
        const needsRes = await documentsApi.getNeedsList(loansRes.loans[0].id);
        setNeedsList(needsRes.needsList);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, needsListItemId?: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLoan) return;

    try {
      await documentsApi.upload(selectedLoan.id, file, needsListItemId);
      toast.success('Document uploaded successfully');
      // Refresh needs list
      const needsRes = await documentsApi.getNeedsList(selectedLoan.id);
      setNeedsList(needsRes.needsList);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    }
  };

  const getFolderColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100 border-red-300 text-red-700';
      case 'blue': return 'bg-blue-100 border-blue-300 text-blue-700';
      default: return 'bg-amber-50 border-amber-200 text-amber-700';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalRequested = loans.reduce((sum, loan) => sum + (loan.loan_amount || 0), 0);
  const pendingDocs = needsList.filter(n => n.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Email Verification Banner */}
      {user && !user.email_verified && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Please verify your email address to submit loan requests.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/verify-email')}
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                <Mail className="w-4 h-4 mr-2" />
                Verify Email
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-navy-800 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gold-400" />
              </div>
              <span className="font-display text-2xl font-bold text-navy-900">RPC</span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.slice(0, 5).map((notif) => (
                        <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-3 cursor-pointer">
                          <div className="flex items-center gap-2 w-full">
                            <span className="font-medium">{notif.title}</span>
                            {!notif.read && <Badge variant="default" className="ml-auto text-xs">New</Badge>}
                          </div>
                          <span className="text-sm text-muted-foreground">{notif.message}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-navy-800 text-white text-sm">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:block text-sm font-medium">{user.fullName}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setActiveTab('profile')}>
                        <User className="w-4 h-4 mr-2" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" /> Settings
                      </DropdownMenuItem>
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
                    <Button variant="ghost" size="sm">
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

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Welcome back, {user?.fullName.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">Here's an overview of your loan activity</p>
          </div>
          <Link to="/loan-request">
            <Button variant="gold" className="gap-2">
              <Plus className="w-4 h-4" /> New Loan Request
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Active Loans" value={loans.length} icon={FileText} description="In progress" />
          <StatsCard title="Total Requested" value={formatCurrency(totalRequested)} icon={DollarSign} description="Across all loans" />
          <StatsCard title="Pending Documents" value={pendingDocs} icon={Upload} description="Action required" />
          <StatsCard title="Avg. Processing" value="12 days" icon={Clock} description="From application" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="loans">My Loans</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {loans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Loans</h3>
                  <p className="text-muted-foreground mb-4">Start your first loan request to get a soft quote</p>
                  <Link to="/loan-request">
                    <Button variant="gold">Start Loan Request</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Active Loans</h2>
                    </div>
                    <div className="grid gap-4">
                      {loans.map((loan) => (
                        <LoanCard 
                          key={loan.id} 
                          id={loan.id}
                          propertyAddress={loan.property_address}
                          city={loan.property_city}
                          state={loan.property_state}
                          loanAmount={loan.loan_amount}
                          propertyType={loan.property_type === 'residential' ? `SFR - ${loan.residential_units || 1} Unit${(loan.residential_units || 1) > 1 ? 's' : ''}` : loan.commercial_type || 'Commercial'}
                          transactionType={loan.transaction_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                          status={loan.status as LoanStatus}
                          createdAt={loan.created_at}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Loan Tracker Sidebar */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Loan Progress</CardTitle>
                      <CardDescription>
                        {selectedLoan?.loan_number || 'Select a loan'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedLoan && (
                        <LoanTrackerFull currentStatus={selectedLoan.status as LoanStatus} />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="loans">
            <div className="space-y-4">
              {loans.map((loan) => (
                <LoanCard 
                  key={loan.id} 
                  id={loan.id}
                  propertyAddress={loan.property_address}
                  city={loan.property_city}
                  state={loan.property_state}
                  loanAmount={loan.loan_amount}
                  propertyType={loan.property_type === 'residential' ? `SFR - ${loan.residential_units || 1} Units` : loan.commercial_type || 'Commercial'}
                  transactionType={loan.transaction_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  status={loan.status as LoanStatus}
                  createdAt={loan.created_at}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Center</CardTitle>
                <CardDescription>Upload and manage your loan documents. Folder colors indicate status.</CardDescription>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200"></span> Pending</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-300"></span> Has Documents</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-300"></span> New Upload (24h)</span>
                </div>
              </CardHeader>
              <CardContent>
                {needsList.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents requested yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {needsList.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-lg border-2 ${getFolderColor(item.folder_color)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <FolderOpen className="w-5 h-5" />
                          {item.status === 'reviewed' && <CheckCircle2 className="w-4 h-4 text-success" />}
                          {item.status === 'rejected' && <AlertCircle className="w-4 h-4 text-destructive" />}
                        </div>
                        <h4 className="font-medium text-sm mb-1">{item.document_type}</h4>
                        <p className="text-xs opacity-75 mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{item.document_count} file(s)</span>
                          <label className="cursor-pointer">
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, item.id)}
                            />
                            <span className="text-xs font-medium hover:underline">Upload</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account information and KYC details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-lg">{user?.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-lg">{user?.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                    <p className="text-lg capitalize">{user?.role}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Downloads Section */}
        {selectedLoan?.term_sheet_url && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Available Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {selectedLoan.term_sheet_url && (
                  <a href={selectedLoan.term_sheet_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" /> Term Sheet
                    </Button>
                  </a>
                )}
                {selectedLoan.commitment_letter_url && (
                  <a href={selectedLoan.commitment_letter_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" /> Commitment Letter
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
