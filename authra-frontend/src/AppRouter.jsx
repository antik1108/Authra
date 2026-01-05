import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import App from "./App";
import IndividualLogin from "./pages/IndividualLogin";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/IndividualDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import UniversityDashboard from "./pages/UniversityDashboard";
import RegistrationWizard from "./components/registration/RegistrationWizard";
import StudentRegistrationWizard from "./components/registration/StudentRegistrationWizard";
import UniversityLogin from "./pages/UniversityLogin";
import WaitingApproval from "./pages/WaitingApproval";
import { ProtectedRoute, UniversityProtectedRoute } from "./components/ProtectedRoute";

export default function AppRouter() {
  // Scroll to the top on every route change so pages never open mid-scroll
  const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
      // Jump to top on every route change
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname]);
    return null;
  };
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/individual-login" element={<IndividualLogin />} />
        <Route path="/register-university" element={<RegistrationWizard />} />
        <Route path="/register-individual" element={<StudentRegistrationWizard />} />
        <Route path="/university-login" element={<UniversityLogin />} />
        <Route path="/waiting-approval" element={<WaitingApproval />} />
        
        {/* Legacy Dashboard Route - Redirects to correct dashboard based on role */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Individual User Dashboards - Each with unique URL */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/warden/dashboard" 
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['WARDEN']}>
              <WardenDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/dashboard" 
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['STAFF']}>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* University Dashboard */}
        <Route 
          path="/university/dashboard" 
          element={
            <UniversityProtectedRoute>
              <UniversityDashboard />
            </UniversityProtectedRoute>
          } 
        />
        
        {/* Legacy University Dashboard Route */}
        <Route 
          path="/university-dashboard" 
          element={
            <UniversityProtectedRoute>
              <UniversityDashboard />
            </UniversityProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}