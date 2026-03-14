  

// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/authContext";
import ProtectedRoute from "../components/routes/ProtectedRoute";
import PublicRoute from "../components/routes/PublicRoute";
import { Toaster } from "sonner";


import RootLayout from "../app/layout";
import AdminLayout from "../app/admin/layout";
import TenantLayout from "../app/tenant/layout/TenantLayout"

/* ================= PUBLIC ================= */
import HomePage from "../app/page";
import AboutPage from "../app/about/page";
import ContactPage from "../app/contact/page";
import HowItWorksPage from "../app/how-it-works/page";
import PartnerPage from "../app/partner/page";
import PortalPage from "../app/portal/page";
import PropertiesPage from "../app/properties/page";
import PropertySlugPage from "../app/properties/[slug]/page";

/* ================= ADMIN ================= */
import AdminLoginPage from "../app/admin/login/page";
import AdminDashboardPage from "../app/admin/dashboard/page";
import AdminPropertiesPage from "../app/admin/properties/page";
import AdminPropertyIdPage from '../app/admin/properties/[id]/page';

import AdminRoomsPage from "../app/admin/rooms/page";
import AdminTenantsPage from "../app/admin/tenants/page";
import AdminTenantDetailPage from "../app/admin/tenants/[id]/page";
import AdminPaymentsPage from "../app/admin/payments/page";
import AdminReportsPage from "../app/admin/reports/page";
import AdminEnquiriesPage from "../app/admin/enquiries/page";
import AdminNotificationsPage from "../app/admin/notifications/page";
import AdminStaffPage from "../app/admin/staff/page";
import AdminOffersPage from "../app/admin/offers/page";
import AdminAddOnsPage from "../app/admin/add-ons/page";

import AdminMastersPage from "../app/admin/masters/page";
import AdminMastersValues from "../app/admin/masters/[itemId]/page";
import AdminSettingsPage from "../app/admin/settings/page";
import AdminIntegrationSettingsPage from "../app/admin/settings/integration/page";
import AdminProfilePage from "../app/admin/profile/page";
import AdminComplaintsPage from "../app/admin/complaints/page";
import AdminMaintenancePage from "../app/admin/maintenance/page";
import AdminReceiptsPage from "../app/admin/receipts/page";
import AdminLeaveRequestsPage from "../app/admin/leave-requests/page";
import AdminVacateRequestsPage from "../app/admin/vacate-requests/page";
import AdminChangeBedRequestsPage from "../app/admin/change-bed-requests/page";
import AdminAccountDeletionPage from "../app/admin/account-deletion-requests/page";


/* ================= TENANT ================= */
import TenantLoginPage from "../app/tenant/login/page";
import TenantPortalPage from "../app/tenant/portal/page";
import TenantProfilePage from "../app/tenant/profile/page";
import TenantDocumentsPage from "../app/tenant/documents/page";
import TenantMyDocumentsPage from "../app/tenant/my-documents/page";
import TenantRequestsPage from "../app/tenant/requests/page";
import TenantSettingsPage from "../app/tenant/settings/page";
import SupportPage from "../app/tenant/support/page";
import { HelmetProvider } from 'react-helmet-async';
import { apiGet } from "@/lib/api";
import { useEffect } from "react";
import axios from "axios";
import { InventoryDashboard } from "@/modules/inventory/InventoryDashboard";
import { Assets } from "@/modules/inventory/Assets";
import { VisitorDashboard } from "@/modules/visitor/VisitorDashboard";
import { MaterialPurchase } from "@/modules/inventory/MaterialPurchase";
import { TenantHandover } from "@/modules/inventory/TenantHandover";
import { MoveOutInspection } from "@/modules/inventory/MoveOutInspection";
import { Settlements } from "@/modules/inventory/Settlements";
import { VisitorLogs } from "@/modules/visitor/VisitorLogs";
import { NewVisitorEntry } from "@/modules/visitor/NewVisitorEntry";
import { VisitorRestrictions } from "@/modules/visitor/VisitorRestrictions";
import { PenaltyRules } from "@/modules/inventory/PenaltyRules";
import ExpensesManagement from "@/components/Expense/EexpenseManagement";
import { DocumentCenter } from "@/modules/documents/DocumentCenter";
import { TemplateManager } from "@/modules/documents/TemplateManager";
import { DocumentCreate } from "@/modules/documents/DocumentCreate";
import { DocumentList } from "@/modules/documents/DocumentList";


function App() {
  const {setUser} =useAuth()
  const fetchUser = async () => {try{
const user = await axios.get(import.meta.env.VITE_API_URL+"/api/auth/get-user-details/"+localStorage.getItem('auth_email'))
console.log(user)
    setUser(user.data.user)
}catch(error){
  console.log(error)
}
  }

  useEffect( () => {
    fetchUser()
  }, [])
  return (
    <HelmetProvider>

      <Toaster position="top-right" richColors closeButton/>

      <Routes>

        {/* 🌍 PUBLIC ROUTES */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="partner" element={<PartnerPage />} />
          <Route path="portal" element={<PortalPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="properties/:slug" element={<PropertySlugPage />} />
        </Route>

        {/* 🔐 ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>


          {/* ADMIN PROTECTED */}
          <Route element={<ProtectedRoute />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="properties/:id" element={<AdminPropertyIdPage />} />

            <Route path="rooms" element={<AdminRoomsPage />} />
            <Route path="tenants" element={<AdminTenantsPage />} />
            <Route path="tenants/:id" element={<AdminTenantDetailPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="expenses" element={<ExpensesManagement />} />

            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="staff" element={<AdminStaffPage />} />
            <Route path="offers" element={<AdminOffersPage />} />
            <Route path="add-ons" element={<AdminAddOnsPage />} />
            <Route path="inventory-dashboard" element={<InventoryDashboard />} />

            <Route path="inventory/assets" element={<Assets />} />
            <Route path="inventory/purchase" element={<MaterialPurchase />} />
            <Route path="inventory/handover" element={<TenantHandover />} />
            <Route path="inventory/inspection" element={<MoveOutInspection />} />
            <Route path="inventory/settlements" element={<Settlements />} />
            <Route path="inventory/penalty-rules" element={<PenaltyRules/>} />


            <Route path="visitors/dashboard" element={<VisitorDashboard />} />
            <Route path="visitors/logs" element={<VisitorLogs />} />
            <Route path="visitors/new-entry" element={<NewVisitorEntry />} />
            <Route path="visitors/restrictions" element={<VisitorRestrictions/>} />

            <Route path="document-center" element={<DocumentCenter />} />
            <Route path="document-center/templates" element={<TemplateManager />} />
            <Route path="document-center/create" element={<DocumentCreate />} />
            <Route path="document-center/all" element={<DocumentList />} />

            <Route path="masters" element={<AdminMastersPage />} />
            <Route path="masters/:itemId" element={<AdminMastersValues />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="settings/integration" element={<AdminIntegrationSettingsPage />} />  

            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="complaints" element={<AdminComplaintsPage />} />
            <Route path="maintenance" element={<AdminMaintenancePage />} />
            <Route path="receipts" element={<AdminReceiptsPage />} />
            <Route path="leave-requests" element={<AdminLeaveRequestsPage />} />
            <Route path="vacate-requests" element={<AdminVacateRequestsPage />} />
            <Route path="change-bed-requests" element={<AdminChangeBedRequestsPage />} />
            <Route path="account-deletion-requests" element={<AdminAccountDeletionPage />} />
          </Route>

        </Route>
        {/* <Route element={<PublicRoute />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<TenantLoginPage />} />
        </Route> */}
        <Route path="/login" element={<PublicRoute />}>
  <Route index element={<TenantLoginPage />} />
</Route>

        <Route element={<ProtectedRoute />}>
  <Route path="/tenant" element={<TenantLayout />}>
    <Route path="portal" element={<TenantPortalPage />} />
    <Route path="dashboard" element={<TenantPortalPage />} />
    <Route path="profile" element={<TenantProfilePage />} />
    <Route path="documents" element={<TenantDocumentsPage />} />
    <Route path="my-documents" element={<TenantMyDocumentsPage />} />
    <Route path="requests" element={<TenantRequestsPage />} />
    <Route path="settings" element={<TenantSettingsPage />} />
    <Route path="support" element={<SupportPage />} />
  </Route>
</Route>

      </Routes>
    </HelmetProvider>
  );
}

export default App;