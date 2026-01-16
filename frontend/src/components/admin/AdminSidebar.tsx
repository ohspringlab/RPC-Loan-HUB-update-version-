import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  UserCheck,
  Briefcase,
  DollarSign,
  CheckCircle2,
  Globe,
  BookOpen,
  ChevronDown,
  ArrowRight,
  Link2,
  PenTool,
  FolderOpen,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-slate-800 bg-slate-950 text-slate-100 sidebar-magic">
      {/* Magic glow background effect */}
      <div className="absolute inset-0 sidebar-magic-glow pointer-events-none z-0"></div>
      
      <SidebarHeader className="p-4 relative z-10">
        <div className="flex items-center gap-3 sidebar-logo-magic">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center sidebar-icon-glow relative overflow-visible">
            <Building2 className="w-6 h-6 text-yellow-400 relative z-10" />
            <div className="absolute inset-0 sidebar-icon-pulse"></div>
          </div>
          <span className="font-bold text-lg sidebar-text-glow">RPC</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="!p-0 !gap-0">
        <SidebarGroup className="!p-0 !m-0 !gap-0">
          <SidebarGroupContent className="!p-0 !m-0">
            <SidebarMenu className="!gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin")}
                  className={cn(
                    "sidebar-menu-item text-slate-300 hover:text-white hover:bg-slate-800 relative overflow-visible",
                    isActive("/admin") && "sidebar-menu-active bg-yellow-500/20 text-yellow-400"
                  )}
                >
                  <Link to="/admin" className="relative z-10">
                    <LayoutDashboard className="w-4 h-4 sidebar-icon" />
                    <span>Dashboard</span>
                    {isActive("/admin") && <div className="sidebar-active-glow"></div>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="sidebar-menu-item text-slate-300 hover:text-white hover:bg-slate-800 relative overflow-visible"
                >
                  <Link to="/admin/deals" className="relative z-10">
                    <Briefcase className="w-4 h-4 sidebar-icon" />
                    <span>Deals CRM</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="sidebar-menu-item text-slate-300 hover:text-white hover:bg-slate-800 relative overflow-visible"
                >
                  <Link to="/admin/reports" className="relative z-10">
                    <BarChart3 className="w-4 h-4 sidebar-icon" />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="!p-0 !m-0 !gap-0">
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel>
              <CollapsibleTrigger className="sidebar-group-label text-slate-400 hover:text-slate-200 cursor-pointer w-full flex items-center justify-between relative overflow-visible">
                <span className="relative z-10">LEADS</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 relative z-10" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="!p-0 !m-0">
                <SidebarMenu className="!gap-0.5">
                  <SidebarMenuItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/admin/leads/submissions")}
                      className="sidebar-sub-item relative overflow-visible"
                    >
                      <Link to="/admin/leads/submissions" className="relative z-10">
                        <span>Lead Submissions</span>
                        {isActive("/admin/leads/submissions") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/admin/leads/quarantine")}
                      className="sidebar-sub-item relative overflow-visible"
                    >
                      <Link to="/admin/leads/quarantine" className="flex items-center justify-between w-full relative z-10">
                        <span>Quarantine</span>
                        <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs sidebar-badge-glow">
                          1
                        </Badge>
                        {isActive("/admin/leads/quarantine") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup className="!p-0 !m-0 !gap-0">
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel>
              <CollapsibleTrigger className="sidebar-group-label text-slate-400 hover:text-slate-200 cursor-pointer w-full flex items-center justify-between relative overflow-visible">
                <span className="relative z-10">CONTACTS</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 relative z-10" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="!p-0 !m-0">
                <SidebarMenu className="!gap-0.5">
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/contacts/people")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/contacts/people" className="relative z-10">
                        <Users className="w-4 h-4 sidebar-icon" />
                        <span>People</span>
                        {isActive("/admin/contacts/people") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/contacts/agents")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/contacts/agents" className="relative z-10">
                        <UserCheck className="w-4 h-4 sidebar-icon" />
                        <span>Agents</span>
                        {isActive("/admin/contacts/agents") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/contacts/companies")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/contacts/companies" className="relative z-10">
                        <Building2 className="w-4 h-4 sidebar-icon" />
                        <span>Companies</span>
                        {isActive("/admin/contacts/companies") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup className="!p-0 !m-0 !gap-0">
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel>
              <CollapsibleTrigger className="sidebar-group-label text-slate-400 hover:text-slate-200 cursor-pointer w-full flex items-center justify-between relative overflow-visible">
                <span className="relative z-10">PRICING</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 relative z-10" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="!p-0 !m-0">
                <SidebarMenu className="!gap-0.5">
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/pricing/loans")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/pricing/loans" className="relative z-10">
                        <DollarSign className="w-4 h-4 sidebar-icon" />
                        <span>Loan Pricing</span>
                        {isActive("/admin/pricing/loans") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/pricing/approval")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/pricing/approval" className="relative z-10">
                        <CheckCircle2 className="w-4 h-4 sidebar-icon" />
                        <span>Quote Approval</span>
                        {isActive("/admin/pricing/approval") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup className="!p-0 !m-0 !gap-0">
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel>
              <CollapsibleTrigger className="sidebar-group-label text-slate-400 hover:text-slate-200 cursor-pointer w-full flex items-center justify-between relative overflow-visible">
                <span className="relative z-10">MARKETING</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 relative z-10" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="!p-0 !m-0">
                <SidebarMenu className="!gap-0.5">
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/marketing/landing-pages")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/marketing/landing-pages" className="relative z-10">
                        <Globe className="w-4 h-4 sidebar-icon" />
                        <span>Landing Pages</span>
                        {isActive("/admin/marketing/landing-pages") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/marketing/reachout")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/marketing/reachout" className="relative z-10">
                        <ArrowRight className="w-4 h-4 sidebar-icon" />
                        <span>Reachout</span>
                        {isActive("/admin/marketing/reachout") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/marketing/short-links")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/marketing/short-links" className="relative z-10">
                        <Link2 className="w-4 h-4 sidebar-icon" />
                        <span>Short Links</span>
                        {isActive("/admin/marketing/short-links") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup className="!p-0 !m-0 !gap-0">
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel>
              <CollapsibleTrigger className="sidebar-group-label text-slate-400 hover:text-slate-200 cursor-pointer w-full flex items-center justify-between relative overflow-visible">
                <span className="relative z-10">CONTENT</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 relative z-10" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="!p-0 !m-0">
                <SidebarMenu className="!gap-0.5">
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/content/ai-articles")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/content/ai-articles" className="relative z-10">
                        <PenTool className="w-4 h-4 sidebar-icon" />
                        <span>AI Articles</span>
                        {isActive("/admin/content/ai-articles") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/content/resources")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/content/resources" className="relative z-10">
                        <FolderOpen className="w-4 h-4 sidebar-icon" />
                        <span>Resources</span>
                        {isActive("/admin/content/resources") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/admin/content/case-studies")} className="sidebar-sub-item relative overflow-visible">
                      <Link to="/admin/content/case-studies" className="relative z-10">
                        <FileText className="w-4 h-4 sidebar-icon" />
                        <span>Case Studies</span>
                        {isActive("/admin/content/case-studies") && <div className="sidebar-sub-active-glow"></div>}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-800 relative z-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="sidebar-menu-item text-slate-300 hover:text-white hover:bg-slate-800 relative overflow-visible"
            >
              <Link to="/" target="_blank" className="relative z-10">
                <Globe className="w-4 h-4 sidebar-icon" />
                <span>View Website</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="sidebar-menu-item text-slate-300 hover:text-white hover:bg-slate-800 relative overflow-visible"
            >
              <Link to="/admin/manual" className="relative z-10">
                <BookOpen className="w-4 h-4 sidebar-icon" />
                <span>User Manual</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

