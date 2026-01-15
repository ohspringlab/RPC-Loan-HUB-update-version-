import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { opsApi, PipelineStats, RecentClosing } from "@/lib/api";
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  Circle,
  User,
  Home,
  Calendar,
  FileText,
  Users,
  UserCheck,
  Building2,
  BarChart3,
  Globe,
  BookOpen,
  PenTool,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [recentClosings, setRecentClosings] = useState<RecentClosing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Determine current page from location
  const currentPath = location.pathname;
  const isMainDashboard = currentPath === "/admin" || currentPath === "/admin/";

  useEffect(() => {
    loadData();
    // Auto-refresh recent closings every 30 seconds
    const interval = setInterval(() => {
      if (activeTab === "closings") {
        loadRecentClosings();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [statsRes, closingsRes] = await Promise.all([
        opsApi.getStats(),
        opsApi.getRecentClosings(50)
      ]);
      setStats(statsRes);
      setRecentClosings(closingsRes.closings);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentClosings = async () => {
    try {
      const closingsRes = await opsApi.getRecentClosings(50);
      setRecentClosings(closingsRes.closings);
    } catch (error) {
      console.error("Failed to load recent closings:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const pipelineValue = stats?.byStatus.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
  const openDeals = stats?.totalLoans || 0;
  const winRate = stats?.totalLoans > 0 ? ((stats?.fundedLoans || 0) / stats.totalLoans) * 100 : 0;
  const wonThisMonth = stats?.monthlyVolume || 0;

  // Render content based on current route
  const renderRouteContent = () => {
    if (currentPath.startsWith("/admin/deals")) {
      return (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Deals CRM
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manage all loan deals and customer relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">Deals CRM functionality coming soon</p>
              <Button onClick={() => navigate('/ops')} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                View Operations Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentPath.startsWith("/admin/reports")) {
      return (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Reports
            </CardTitle>
            <CardDescription className="text-slate-400">
              View detailed reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">Reports functionality coming soon</p>
              <Button onClick={() => navigate('/ops')} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                View Operations Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentPath.startsWith("/admin/leads")) {
      const isQuarantine = currentPath.includes("/quarantine");
      return (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {isQuarantine ? "Quarantine" : "Lead Submissions"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isQuarantine ? "Review submissions in quarantine" : "Manage lead submissions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">Lead management functionality coming soon</p>
              <Button onClick={() => navigate('/ops')} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                View Operations Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentPath.startsWith("/admin/contacts")) {
      const contactType = currentPath.split("/").pop() || "people";
      const icons = {
        people: Users,
        agents: UserCheck,
        companies: Building2,
      };
      const labels = {
        people: "People",
        agents: "Agents",
        companies: "Companies",
      };
      const Icon = icons[contactType as keyof typeof icons] || Users;
      const label = labels[contactType as keyof typeof labels] || "Contacts";
      
      return (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {label}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manage {label.toLowerCase()} in your CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Icon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">{label} management functionality coming soon</p>
              <Button onClick={() => navigate('/ops')} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                View Operations Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentPath.startsWith("/admin/pricing")) {
      const pricingType = currentPath.split("/").pop() || "loans";
      const isApproval = pricingType === "approval";
      
      return (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {isApproval ? "Quote Approval" : "Loan Pricing"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isApproval ? "Review and approve loan quotes" : "Manage loan pricing settings"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">Pricing functionality coming soon</p>
              <Button onClick={() => navigate('/ops')} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                View Operations Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentPath.startsWith("/admin/marketing")) {
      const marketingType = currentPath.split("/").pop() || "landing-pages";
      const labels: Record<string, string> = {
        "landing-pages": "Landing Pages",
        "reachout": "Reachout",
        "short-links": "Short Links",
      };
      const label = labels[marketingType] || "Marketing";
      
      return (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {label}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manage {label.toLowerCase()} for marketing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Globe className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">{label} functionality coming soon</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentPath.startsWith("/admin/content")) {
      const contentType = currentPath.split("/").pop() || "ai-articles";
      const icons = {
        "ai-articles": PenTool,
        "resources": FolderOpen,
        "case-studies": FileText,
      };
      const labels = {
        "ai-articles": "AI Articles",
        "resources": "Resources",
        "case-studies": "Case Studies",
      };
      const Icon = icons[contentType as keyof typeof icons] || FileText;
      const label = labels[contentType as keyof typeof labels] || "Content";
      
      return (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {label}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manage {label.toLowerCase()} for your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Icon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">{label} management functionality coming soon</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentPath.startsWith("/admin/manual")) {
      return (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              User Manual
            </CardTitle>
            <CardDescription className="text-slate-400">
              Documentation and user guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 mb-4">User manual coming soon</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Default: show coming soon message
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Page Not Found</CardTitle>
          <CardDescription className="text-slate-400">
            This page is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">This feature is coming soon</p>
            <Button onClick={() => navigate('/admin')} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-950">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950 px-6">
            <SidebarTrigger className="text-slate-300" />
            <div className="flex-1" />
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">{user.fullName}</span>
              </div>
            )}
          </header>

          <main className="flex-1 p-6 bg-slate-950">
            {isMainDashboard ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-900 border-slate-800">
                  <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-800 data-[state=active]:text-yellow-400">
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="closings" className="data-[state=active]:bg-slate-800 data-[state=active]:text-yellow-400">
                    Recent Closings
                  </TabsTrigger>
                </TabsList>

              <TabsContent value="dashboard" className="space-y-6 mt-6">
              {/* Top Row Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Pipeline Value</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(pipelineValue)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Open Deals</p>
                        <p className="text-2xl font-bold text-white">{openDeals}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Win Rate (90d)</p>
                        <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Won This Month</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(wonThisMonth)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pipeline Profit Card */}
                <Card className="bg-green-600/10 border-green-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <CardTitle className="text-green-400">Pipeline Profit</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        onClick={() => navigate('/ops')}
                      >
                        Full Report <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-white mb-1">
                        {formatCurrency(stats?.pipelineProfit?.totalPotential || 0)}
                      </p>
                      <p className="text-sm text-green-300/70">Total Potential Profit</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-green-500/20">
                      <div>
                        <p className="text-sm text-green-300/70 mb-1">Weighted Profit</p>
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency(stats?.pipelineProfit?.weightedProfit || 0)}
                        </p>
                        <p className="text-xs text-green-300/60 mt-1">Adjusted by deal probability</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-green-500/20">
                      <div>
                        <p className="text-sm text-green-300/70">
                          {stats?.pipelineProfit?.openDeals || 0} Open Deals
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-300/70">
                          {formatCurrency((stats?.pipelineProfit?.avgProfitPerDeal || 0) / 1000)}K Avg Profit/Deal
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-green-300/70">
                          Won Profit This Month {formatCurrency(stats?.pipelineProfit?.wonThisMonth || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-300/70">
                          Deals Won {stats?.pipelineProfit?.dealsWonThisMonth || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pipeline Forecast Card */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <CardTitle className="text-white">Pipeline Forecast</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => navigate('/ops')}
                      >
                        View Details <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">THIS QUARTER</p>
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency(stats?.forecast?.thisQuarter || 0)}
                        </p>
                        <p className="text-xs text-green-400">
                          +{formatCurrency(stats?.forecast?.expectedProfit || 0)} profit
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">PIPELINE</p>
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency((stats?.forecast?.pipeline || 0) / 1000)}K
                        </p>
                        <p className="text-xs text-slate-500">weighted value</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">EXPECTED PROFIT</p>
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency(stats?.forecast?.expectedProfit || 0)}
                        </p>
                        <p className="text-xs text-slate-500">probability-adjusted</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-3 border-t border-slate-800">
                      {["January", "February", "March", "April", "May", "June"].map((month, idx) => {
                        const monthProfit = (stats?.forecast?.expectedProfit || 0) / 6; // Distribute evenly for now
                        return (
                          <div key={month} className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">{month} 2026</span>
                            <div className="flex items-center gap-4">
                              <span className="text-slate-500">
                                {Math.round((stats?.pipelineProfit?.openDeals || 0) / 6)} deals expected
                              </span>
                              <span className="text-white font-medium">{formatCurrency(monthProfit)}</span>
                              <span className="text-green-400">+{formatCurrency(monthProfit)} profit</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Needs Attention Card */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <CardTitle className="text-white">Needs Attention</CardTitle>
                        <Badge variant="destructive" className="ml-2">
                          {stats?.needsAttention?.total || 0}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats?.needsAttention?.staleLoans > 0 && (
                      <div 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => navigate('/ops')}
                      >
                        <div className="flex items-center gap-3">
                          <Circle className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-slate-300">
                            {stats.needsAttention.staleLoans} stale loan{stats.needsAttention.staleLoans !== 1 ? 's' : ''} (3+ days)
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                    {stats?.needsAttention?.pendingQuotes > 0 && (
                      <div 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => navigate('/ops')}
                      >
                        <div className="flex items-center gap-3">
                          <Circle className="w-2 h-2 fill-blue-400 text-blue-400" />
                          <span className="text-sm text-slate-300">
                            {stats.needsAttention.pendingQuotes} quote{stats.needsAttention.pendingQuotes !== 1 ? 's' : ''} pending approval
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                    {stats?.needsAttention?.pendingDocs > 0 && (
                      <div 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => navigate('/ops')}
                      >
                        <div className="flex items-center gap-3">
                          <Circle className="w-2 h-2 fill-blue-400 text-blue-400" />
                          <span className="text-sm text-slate-300">
                            {stats.needsAttention.pendingDocs} document{stats.needsAttention.pendingDocs !== 1 ? 's' : ''} pending review
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                    {(!stats?.needsAttention || stats.needsAttention.total === 0) && (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-400">All caught up! No items need attention.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <CardTitle className="text-white">Recent Activity</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => navigate('/ops')}
                      >
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                      stats.recentActivity.slice(0, 5).map((activity) => {
                        const timeAgo = new Date(activity.timestamp);
                        const hoursAgo = Math.floor((Date.now() - timeAgo.getTime()) / (1000 * 60 * 60));
                        const timeText = hoursAgo < 1 ? 'Just now' : 
                                         hoursAgo === 1 ? '1 hour ago' : 
                                         `${hoursAgo} hours ago`;
                        
                        return (
                          <div 
                            key={activity.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                            onClick={() => navigate(`/ops/loans/${activity.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-green-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{activity.description}</p>
                                <p className="text-xs text-slate-500">{timeText}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-slate-400 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/ops/loans/${activity.id}`);
                              }}
                            >
                              View
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-400">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              </TabsContent>

              <TabsContent value="closings" className="mt-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Recent Closings</CardTitle>
                        <CardDescription className="text-slate-400">
                          Automatically updated list of funded loans
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadRecentClosings}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentClosings.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-slate-400">No closings found</p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-800 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-800/50 border-slate-700">
                              <TableHead className="text-slate-300">Loan #</TableHead>
                              <TableHead className="text-slate-300">Borrower</TableHead>
                              <TableHead className="text-slate-300">Property</TableHead>
                              <TableHead className="text-slate-300">Type</TableHead>
                              <TableHead className="text-slate-300">Loan Amount</TableHead>
                              <TableHead className="text-slate-300">Funded Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentClosings.map((closing) => (
                              <TableRow key={closing.loan_number} className="border-slate-800 hover:bg-slate-800/30">
                                <TableCell className="font-mono text-sm text-white">{closing.loan_number}</TableCell>
                                <TableCell className="text-slate-300">{closing.borrower_name}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Home className="w-4 h-4 text-slate-500" />
                                    <span className="text-slate-300 text-sm">
                                      {closing.property_address}, {closing.property_city}, {closing.property_state}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-slate-700 text-slate-300">
                                    {closing.transaction_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || closing.property_type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-white font-medium">
                                  {formatCurrency(closing.funded_amount || closing.loan_amount)}
                                </TableCell>
                                <TableCell className="text-slate-400">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(closing.funded_date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            ) : (
              <div className="space-y-6">
                {renderRouteContent()}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

