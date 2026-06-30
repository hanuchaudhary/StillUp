import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "./components/layout/dashboard-layout";
import { ProtectedRoute } from "./components/layout/protected-route";
import { Provider } from "./components/provider";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import ForgotPassword from "./pages/auth/forgot";
import { LoginPage } from "./pages/auth/login";
import ResetPassword from "./pages/auth/reset";
import { SignupPage } from "./pages/auth/signup";
import VerifyEmailPage from "./pages/auth/verify-email";
import { BillingPage } from "./pages/billing";
import { DashboardPage } from "./pages/dashboard";
import { LandingPage } from "./pages/landing";
import { PrivacyPage } from "./pages/legal/privacy";
import { TermsPage } from "./pages/legal/terms";
import { CreateMonitorPage } from "./pages/monitors/create";
import { MonitorDetailPage } from "./pages/monitors/detail";
import { EditMonitorPage } from "./pages/monitors/edit";
import { SettingsPage } from "./pages/settings";

export function App() {
  return (
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitors/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateMonitorPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitors/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MonitorDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitors/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditMonitorPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BillingPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </Provider>
  );
}

export default App;
