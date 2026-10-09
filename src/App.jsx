import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import { ProtectedRoute, RoleBasedRoute, PublicOnlyRoute } from './routes/ProtectedRoutes';

// Public Pages
import HomePage from './pages/public/HomePage';
import MedicineSearchPage from './pages/public/MedicineSearchPage';
import MedicineDetailPage from './pages/public/MedicineDetailPage';
import PharmacyDetailPage from './pages/public/PharmacyDetailPage';
import PharmacyLocatorPage from './pages/public/PharmacyLocatorPage';
import PharmacyDirectoryPage from './pages/public/PharmacyDirectoryPage';
import AboutPage from './pages/public/AboutPage';
import HelpPage from './pages/public/HelpPage';
import NotFoundPage from './pages/public/NotFoundPage';
import MedicineComparisonPage from './pages/public/MedicineComparisonPage';
import PrescriptionScannerPage from './pages/public/PrescriptionScannerPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// User Pages
import UserDashboardPage from './pages/user/UserDashboardPage';
import UserReservationsPage from './pages/user/UserReservationsPage';
import SavedMedicinesPage from './pages/user/SavedMedicinesPage';
import SavedPharmaciesPage from './pages/user/SavedPharmaciesPage';
import UserProfilePage from './pages/user/UserProfilePage';
import UserAlertsPage from './pages/user/UserAlertsPage';
import UserPrescriptionsPage from './pages/user/UserPrescriptionsPage';

// Pharmacy Portal Pages
import PharmacyDashboardPage from './pages/pharmacy/PharmacyDashboardPage';
import PharmacyInventoryPage from './pages/pharmacy/PharmacyInventoryPage';
import PharmacyAddMedicinePage from './pages/pharmacy/PharmacyAddMedicinePage';
import PharmacyStockAlertsPage from './pages/pharmacy/PharmacyStockAlertsPage';
import PharmacyAnalyticsPage from './pages/pharmacy/PharmacyAnalyticsPage';
import PharmacyReportsPage from './pages/pharmacy/PharmacyReportsPage';
import PharmacyNotificationsPage from './pages/pharmacy/PharmacyNotificationsPage';
import PharmacyOperatingHoursPage from './pages/pharmacy/PharmacyOperatingHoursPage';
import PharmacyProfilePage from './pages/pharmacy/PharmacyProfilePage';
import PharmacySettingsPage from './pages/pharmacy/PharmacySettingsPage';
import PharmacyPrescriptionsPage from './pages/pharmacy/PharmacyPrescriptionsPage';
import QRPickupVerifierPage from './pages/pharmacy/QRPickupVerifierPage';

// Admin Portal Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPharmaciesPage from './pages/admin/AdminPharmaciesPage';
import AdminMedicinesPage from './pages/admin/AdminMedicinesPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminReportCenterPage from './pages/admin/AdminReportCenterPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <>
      <Routes>
        {/* Public Pages — Only Home page is accessible without login */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <MedicineSearchPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicines"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <MedicineSearchPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicines/:id"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <MedicineDetailPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacies"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <PharmacyDirectoryPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacies/:id"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <PharmacyDetailPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/nearby"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <PharmacyLocatorPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <MedicineComparisonPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <HelpPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        {/* Auth Pages (Restricted if already logged in) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <PublicLayout>
                <RegisterPage />
              </PublicLayout>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <PublicLayout>
                <ForgotPasswordPage />
              </PublicLayout>
            </PublicOnlyRoute>
          }
        />

        {/* User Portal Routes */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout>
                <UserDashboardPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/reservations"
          element={
            <ProtectedRoute>
              <UserLayout>
                <UserReservationsPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/saved-medicines"
          element={
            <ProtectedRoute>
              <UserLayout>
                <SavedMedicinesPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/saved-pharmacies"
          element={
            <ProtectedRoute>
              <UserLayout>
                <SavedPharmaciesPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <UserLayout>
                <UserProfilePage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/alerts"
          element={
            <ProtectedRoute>
              <UserLayout>
                <UserAlertsPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/prescriptions"
          element={
            <ProtectedRoute>
              <UserLayout>
                <UserPrescriptionsPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/scan-prescription"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <PrescriptionScannerPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        {/* Pharmacy Portal Routes */}
        <Route
          path="/pharmacy/dashboard"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacyDashboardPage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/inventory"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacyInventoryPage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/inventory/add"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacyAddMedicinePage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/stock-alerts"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacyStockAlertsPage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/analytics"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacyAnalyticsPage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/reports"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacyReportsPage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/notifications"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacyNotificationsPage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/prescriptions"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacyPrescriptionsPage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/pickup-verifier"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <QRPickupVerifierPage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/hours"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacyOperatingHoursPage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/profile"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacyProfilePage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/settings"
          element={
            <RoleBasedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
              <PharmacyLayout>
                <PharmacySettingsPage />
              </PharmacyLayout>
            </RoleBasedRoute>
          }
        />

        {/* Admin Portal Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/pharmacies"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminPharmaciesPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/medicines"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminMedicinesPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminInventoryPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminReportsPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminAnalyticsPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/report-center"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminReportCenterPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminNotificationsPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminAuditLogsPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminSettingsPage />
              </AdminLayout>
            </RoleBasedRoute>
          }
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <NotFoundPage />
            </PublicLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;
