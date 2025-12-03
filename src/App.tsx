import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Admin Pages
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAgenda from "./pages/admin/Agenda";
import AdminClients from "./pages/admin/Clients";
import AdminProfessionals from "./pages/admin/Professionals";
import AdminServices from "./pages/admin/Services";
import AdminFinancial from "./pages/admin/Financial";
import AdminMarketing from "./pages/admin/Marketing";
import AdminSettings from "./pages/admin/Settings";
import AdminNotifications from "./pages/admin/Notifications";
import AdminReviews from "./pages/admin/Reviews";

// Booking
import BookingPage from "./pages/booking/BookingPage";
import ReviewPage from "./pages/review/ReviewPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/recuperar-senha" element={<ForgotPassword />} />
              
              {/* Booking (Client-facing) */}
              <Route path="/agendar" element={<BookingPage />} />
              <Route path="/agendar/:salonSlug" element={<BookingPage />} />
              
              {/* Review (Client-facing) */}
              <Route path="/avaliar/:appointmentId" element={<ReviewPage />} />
              
              {/* Admin Routes - Protegidas */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="agenda" element={<AdminAgenda />} />
                <Route path="clientes" element={<AdminClients />} />
                <Route path="profissionais" element={<AdminProfessionals />} />
                <Route path="servicos" element={<AdminServices />} />
                <Route path="financeiro" element={<AdminFinancial />} />
                <Route path="marketing" element={<AdminMarketing />} />
                <Route path="configuracoes" element={<AdminSettings />} />
                <Route path="notificacoes" element={<AdminNotifications />} />
                <Route path="avaliacoes" element={<AdminReviews />} />
              </Route>
              
              {/* Professional Routes - Protegidas */}
              <Route
                path="/profissional"
                element={
                  <ProtectedRoute requiredRole="professional">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminAgenda />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
