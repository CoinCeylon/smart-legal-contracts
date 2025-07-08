import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { MeshProvider } from "@meshsdk/react";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./pages/AIAssistant";
import CreateContract from "./pages/CreateContract";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import InitialTransactionModal from "./components/InitialTransactionModal";
import { useEffect, useState } from "react";
import Features from "./pages/Features";
import About from "./pages/About";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

// App Routes Component
const AppRoutes = () => {
  const { user, isAuthenticated } = useUser();
  const [showInitialModal, setShowInitialModal] = useState(false);

  // Show initial transaction modal if user is authenticated but not enabled
  useEffect(() => {
    if (isAuthenticated && user && !user.enabled) {
      setShowInitialModal(true);
    } else {
      setShowInitialModal(false);
    }
  }, [isAuthenticated, user]);

  const handleInitialTransactionComplete = (walletAddress: string) => {
    console.log("Initial transaction completed for:", walletAddress);
    setShowInitialModal(false);
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <>
              <Navbar variant="landing" />
              <Index />
            </>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <>
              <Navbar variant="landing" />
              <HowItWorks />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Navbar variant="landing" />
              <About />
            </>
          }
        />

        <Route
          path="/features"
          element={
            <>
              <Navbar variant="landing" />
              <Features />
            </>
          }
        />

        {/* Auth Routes (redirect to dashboard if already authenticated) */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar variant="dashboard" />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts"
          element={
            <ProtectedRoute>
              <Navbar variant="dashboard" />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <Navbar variant="dashboard" />
              <AIAssistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-contract"
          element={
            <ProtectedRoute>
              <Navbar variant="dashboard" />
              <CreateContract />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navbar variant="dashboard" />
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Initial Transaction Modal */}
      <InitialTransactionModal
        isOpen={showInitialModal}
        onClose={() => setShowInitialModal(false)}
        onVerificationComplete={handleInitialTransactionComplete}
        isRequired={user && !user.enabled} // Required if user is not enabled
      />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MeshProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </MeshProvider>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
