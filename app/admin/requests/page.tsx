"use client";

import { useState } from "react";
import ComplaintsPage from "../complaints/page";
import MaintenancePage from "../maintenance/page";
import AdminLeaveRequestsPage from "../leave-requests/page";
import AdminChangeBedRequestsPage from "../change-bed-requests/page";
import ReceiptsPage from "../receipts/page";
import VacateRequestsPage from "../vacate-requests/page";
import AccountDeletionRequestsPage from "../account-deletion-requests/page";

const RequestsPage = () => {
  const [activeTab, setActiveTab] = useState("complaint");

  return (
    <div className="w-full">

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-4">
        <button
          onClick={() => setActiveTab("complaint")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "complaint"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Complaints
        </button>

        <button
          onClick={() => setActiveTab("maintenance")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "maintenance"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Maintenance
        </button>

        <button
          onClick={() => setActiveTab("leave")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "leave"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Leave Requests
        </button>
 <button
          onClick={() => setActiveTab("receipt")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "receipt"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Receipt Requests
        </button> 
        <button
          onClick={() => setActiveTab("vacate")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "vacate"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Vacate Bed Requests
        </button>
         <button
          onClick={() => setActiveTab("change")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "change"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Change Bed Requests
        </button>

         <button
          onClick={() => setActiveTab("deletion")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "deletion"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Account Deletion Requests
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "complaint" && <ComplaintsPage />}
        {activeTab === "maintenance" && <MaintenancePage />}
        {activeTab === "leave" && <AdminLeaveRequestsPage />}
        {activeTab === "receipt" && <ReceiptsPage />}
        {activeTab === "vacate" && <VacateRequestsPage />}
        {activeTab === "change" && <AdminChangeBedRequestsPage />}
        {activeTab === "deletion" && < AccountDeletionRequestsPage />}
      </div>
    </div>
  );
};

export default RequestsPage;