import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

// User pages
import BookEvent from "./pages/BookEvent";
import Dashboard from "./pages/Dashboard";
import Validate from "./pages/Validate";

// Company pages
import CompanyLogin from "./pages/CompanyLogin";
import CompanyRegister from "./pages/CompanyRegister";
import CompanyDashboard from "./pages/CompanyDashboard";
import PurchasePlan from "./pages/PurchasePlan";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/"          element={<Index />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/events"    element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/support"   element={<Support />} />

            {/* User (attendee) */}
            <Route path="/book/:id"   element={<ProtectedRoute role={["attendee", "admin"]}><BookEvent /></ProtectedRoute>} />
            <Route path="/dashboard"  element={<ProtectedRoute role={["attendee", "admin"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/validate"   element={<ProtectedRoute role="admin"><Validate /></ProtectedRoute>} />

            {/* Company */}
            <Route path="/company/login"      element={<CompanyLogin />} />
            <Route path="/company/register"   element={<CompanyRegister />} />
            <Route path="/company/dashboard"  element={<ProtectedRoute role="company"><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/company/plans"      element={<ProtectedRoute role="company"><PurchasePlan /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
