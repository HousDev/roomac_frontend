  // import { Routes, Route, Navigate } from 'react-router-dom';
  // import { AuthProvider } from '../context/authContext';
  // import { Toaster } from 'sonner';
  // import RootLayout from '../app/layout';
  // import AdminLayout from '../app/admin/layout';

  // import HomePage from '../app/page';
  // import AboutPage from '../app/about/page';
  // import ContactPage from '../app/contact/page';
  // import HowItWorksPage from '../app/how-it-works/page';
  // import PartnerPage from '../app/partner/page';
  // import PortalPage from '../app/portal/page';
  // import PropertiesPage from '../app/properties/page';
  // import PropertySlugPage from '../app/properties/[slug]/page';

  // import AdminPage from '../app/admin/page';
  // import AdminLoginPage from '../app/admin/login/page';
  // import AdminDashboardPage from '../app/admin/dashboard/page';

  // import AdminPropertiesPage from '../app/admin/properties/page';
  // import AdminPropertyIdPage from '../app/admin/properties/[id]/page';
  // import AdminRoomsPage from '../app/admin/rooms/page';
  // import AdminTenantsPage from '../app/admin/tenants/page';
  // import AdminPaymentsPage from '../app/admin/payments/page';
  // import AdminReportsPage from '../app/admin/reports/page';
  // import AdminDocumentCenterPage from '../app/admin/document-center/page';
  // import AdminTemplatesPage from '../app/admin/templates/page';
  // import AdminEnquiriesPage from '../app/admin/enquiries/page';
  // import AdminNotificationsPage from '../app/admin/notifications/page';
  // import AdminStaffPage from '../app/admin/staff/page';
  // import AdminOffersPage from '../app/admin/offers/page';
  // import AdminAddOnsPage from '../app/admin/add-ons/page';
  // import AdminMastersPage from '../app/admin/masters/page';
  // import AdminMastersTypeIdPage from '../app/admin/masters/[typeId]/page';
  // import AdminSettingsPage from '../app/admin/settings/page';
  // import AdminProfilePage from '../app/admin/profile/page';
  // import AdminComplaintsPage from '../app/admin/complaints/page';
  // import AdminMaintenancePage from '../app/admin/maintenance/page';
  // import AdminReceiptsPage from '../app/admin/receipts/page';
  // import AdminLeaveRequestsPage from '../app/admin/leave-requests/page';
  // import AdminVacateRequestsPage from '../app/admin/vacate-requests/page';
  // import AdminChangeBedRequestsPage from '../app/admin/change-bed-requests/page';
  // import AdminAccountDeletionPage from '../app/admin/account-deletion-requests/page';

  // import TenantLoginPage from '../app/tenant/login/page';
  // import TenantPortalPage from '../app/tenant/portal/page';
  // import TenantProfilePage from '../app/tenant/profile/page';
  // import TenantDocumentsPage from '../app/tenant/documents/page';
  // import TenantMyDocumentsPage from '../app/tenant/my-documents/page';
  // import TenantRequestsPage from '../app/tenant/requests/page';
  // import TenantSettingsPage from '../app/tenant/settings/page';

  // function App() {
  //   return (
  //     <AuthProvider>
  //       <Toaster position="top-right" richColors closeButton />
  //       <Routes>
  //       <Route path="/" element={<RootLayout />}>
  //         <Route index element={<HomePage />} />
  //         <Route path="about" element={<AboutPage />} />
  //         <Route path="contact" element={<ContactPage />} />
  //         <Route path="how-it-works" element={<HowItWorksPage />} />
  //         <Route path="partner" element={<PartnerPage />} />
  //         <Route path="portal" element={<PortalPage />} />
  //         <Route path="properties" element={<PropertiesPage />} />
  //         <Route path="properties/:slug" element={<PropertySlugPage />} />
  //       </Route>

  //       <Route path="/admin" element={<AdminLayout />}>
  //         <Route index element={<Navigate to="/admin/dashboard" replace />} />
  //         <Route path="login" element={<AdminLoginPage />} />
  //         <Route path="dashboard" element={<AdminDashboardPage />} />
  //         <Route path="properties" element={<AdminPropertiesPage />} />
  //         <Route path="properties/:id" element={<AdminPropertyIdPage />} />
  //         <Route path="rooms" element={<AdminRoomsPage />} />
  //         <Route path="tenants" element={<AdminTenantsPage />} />
  //         <Route path="payments" element={<AdminPaymentsPage />} />
  //         <Route path="reports" element={<AdminReportsPage />} />
  //         <Route path="document-center" element={<AdminDocumentCenterPage />} />
  //         <Route path="templates" element={<AdminTemplatesPage />} />
  //         <Route path="enquiries" element={<AdminEnquiriesPage />} />
  //         <Route path="notifications" element={<AdminNotificationsPage />} />
  //         <Route path="staff" element={<AdminStaffPage />} />
  //         <Route path="offers" element={<AdminOffersPage />} />
  //         <Route path="add-ons" element={<AdminAddOnsPage />} />
  //         <Route path="masters" element={<AdminMastersPage />} />
  //         <Route path="masters/:typeId" element={<AdminMastersTypeIdPage />} />
  //         <Route path="settings" element={<AdminSettingsPage />} />
  //         <Route path="profile" element={<AdminProfilePage />} />
  //         <Route path="complaints" element={<AdminComplaintsPage />} />
  //         <Route path="maintenance" element={<AdminMaintenancePage />} />
  //         <Route path="receipts" element={<AdminReceiptsPage />} />
  //         <Route path="leave-requests" element={<AdminLeaveRequestsPage />} />
  //         <Route path="vacate-requests" element={<AdminVacateRequestsPage />} />
  //         <Route path="change-bed-requests" element={<AdminChangeBedRequestsPage />} />
  //         <Route path="account-deletion-requests" element={<AdminAccountDeletionPage />} />
  //       </Route>

  //       <Route path="/tenant" element={<RootLayout />}>
  //         <Route index element={<Navigate to="/tenant/login" replace />} />
  //         <Route path="login" element={<TenantLoginPage />} />
  //         <Route path="portal" element={<TenantPortalPage />} />
  //         <Route path="dashboard" element={<TenantPortalPage />} />
  //         <Route path="profile" element={<TenantProfilePage />} />
  //         <Route path="documents" element={<TenantDocumentsPage />} />
  //         <Route path="my-documents" element={<TenantMyDocumentsPage />} />
  //         <Route path="requests" element={<TenantRequestsPage />} />
  //         <Route path="settings" element={<TenantSettingsPage />} />
  //         <Route path="support" element={<Navigate to="/tenant/portal" replace />} />
  //       </Route>
  //     </Routes>
  //     </AuthProvider>
  //   );
  // }

  // export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/authContext";
import ProtectedRoute from "../components/routes/ProtectedRoute";
import PublicRoute from "../components/routes/PublicRoute";
import { Toaster } from "sonner";

import RootLayout from "../app/layout";
import AdminLayout from "../app/admin/layout";

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
import AdminPaymentsPage from "../app/admin/payments/page";
import AdminReportsPage from "../app/admin/reports/page";
import AdminDocumentCenterPage from "../app/admin/document-center/page";
import AdminTemplatesPage from "../app/admin/templates/page";
import AdminEnquiriesPage from "../app/admin/enquiries/page";
import AdminNotificationsPage from "../app/admin/notifications/page";
import AdminStaffPage from "../app/admin/staff/page";
import AdminOffersPage from "../app/admin/offers/page";
import AdminAddOnsPage from "../app/admin/add-ons/page";
import AdminMastersPage from "../app/admin/masters/page";
import AdminMastersValues from "../app/admin/masters/[itemId]/page";
import AdminSettingsPage from "../app/admin/settings/page";
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

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />

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
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="document-center" element={<AdminDocumentCenterPage />} />
            <Route path="templates" element={<AdminTemplatesPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="staff" element={<AdminStaffPage />} />
            <Route path="offers" element={<AdminOffersPage />} />
            <Route path="add-ons" element={<AdminAddOnsPage />} />
            <Route path="masters" element={<AdminMastersPage />} />
            <Route path="masters/:itemId" element={<AdminMastersValues />} />
            <Route path="settings" element={<AdminSettingsPage />} />
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
        <Route element={<PublicRoute />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<TenantLoginPage />} />
        </Route>

        {/* 🔐 TENANT ROUTES */}
        <Route path="/tenant" element={<RootLayout />}>

          {/* TENANT LOGIN */}


          {/* TENANT PROTECTED */}
          <Route element={<ProtectedRoute />}>
            <Route path="portal" element={<TenantPortalPage />} />
            <Route path="dashboard" element={<TenantPortalPage />} />
            <Route path="profile" element={<TenantProfilePage />} />
            <Route path="documents" element={<TenantDocumentsPage />} />
            <Route path="my-documents" element={<TenantMyDocumentsPage />} />
            <Route path="requests" element={<TenantRequestsPage />} />
            <Route path="settings" element={<TenantSettingsPage />} />
          </Route>

        </Route>

      </Routes>
    </AuthProvider>
  );
}

export default App;
