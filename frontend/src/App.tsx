import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import LoanRequest from "./pages/LoanRequest";
import BorrowerDashboard from "./pages/BorrowerDashboard";
import LoanDetail from "./pages/LoanDetail";
import OperationsDashboard from "./pages/OperationsDashboard";
import NotFound from "./pages/NotFound";
import AuthError from "./pages/AuthError";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Clear any stale tokens before redirecting
    localStorage.removeItem('rpc_token');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Loan Request - requires auth */}
      <Route path="/loan-request" element={
        <ProtectedRoute>
          <LoanRequest />
        </ProtectedRoute>
      } />
      <Route path="/loan-request/:loanId" element={
        <ProtectedRoute>
          <LoanRequest />
        </ProtectedRoute>
      } />
      
      {/* Borrower Dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'operations' || user?.role === 'admin' ? (
            <Navigate to="/ops" replace />
          ) : (
            <BorrowerDashboard />
          )}
        </ProtectedRoute>
      } />
      <Route path="/dashboard/loans/:loanId" element={
        <ProtectedRoute>
          <LoanDetail />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <BorrowerDashboard />
        </ProtectedRoute>
      } />
      
      {/* Operations Dashboard */}
      <Route path="/ops" element={
        <ProtectedRoute allowedRoles={['operations', 'admin']}>
          <OperationsDashboard />
        </ProtectedRoute>
      } />
      <Route path="/ops/*" element={
        <ProtectedRoute allowedRoles={['operations', 'admin']}>
          <OperationsDashboard />
        </ProtectedRoute>
      } />
      
      {/* Auth Error Page */}
      <Route path="/auth-error" element={<AuthError />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
