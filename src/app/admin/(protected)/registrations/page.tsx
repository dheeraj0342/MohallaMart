"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { Id } from "@/../convex/_generated/dataModel";

type RegistrationStatus = "draft" | "submitted" | "reviewing" | "approved" | "rejected";

export default function AdminRegistrationsPage() {
  const [selectedStatus, setSelectedStatus] = useState<RegistrationStatus | "all">("submitted");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const registrations = useQuery(
    api.registrations.listAllRegistrations,
    selectedStatus === "all" ? {} : { status: selectedStatus }
  ) as Array<{
    _id: Id<"seller_registrations">;
    _creationTime: number;
    user_id: Id<"users">;
    pan: string;
    gstin?: string;
    bank: { account_holder: string; account_number: string; ifsc: string };
    address: { street: string; city: string; state: string; pincode: string };
    identity: { type: string; number: string };
    business: { type: string; name?: string };
    pickup_address: { street: string; city: string; state: string; pincode: string };
    first_product?: { name?: string; url?: string };
    status: RegistrationStatus;
    created_at: number;
    updated_at: number;
    user: { id: string; name: string; email: string } | null;
  }> | undefined;

  const updateStatus = useMutation(api.registrations.updateRegistrationStatus);

  const handleStatusUpdate = async (
    registrationId: Id<"seller_registrations">,
    newStatus: "reviewing" | "approved" | "rejected"
  ) => {
    try {
      await updateStatus({
        registrationId,
        status: newStatus,
      });
      alert(`Registration ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update registration status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-neutral-100 text-neutral-700";
      case "submitted":
        return "bg-blue-100 text-blue-700";
      case "reviewing":
        return "bg-amber-100 text-amber-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-brand">
          Shopkeeper Registrations
        </h1>
        <div className="bg-primary-brand/10 p-3 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-brand"
          >
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2" />
            <path d="M13 17v2" />
            <path d="M13 11v2" />
          </svg>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Filter by Status:
        </label>
        <div className="flex gap-2 flex-wrap">
          {["all", "draft", "submitted", "reviewing", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as typeof selectedStatus)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? "bg-primary-brand text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        {!registrations && (
          <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
            <p className="text-neutral-500">Loading registrations...</p>
          </div>
        )}

        {registrations && registrations.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
            <p className="text-neutral-500">No registrations found for this status.</p>
          </div>
        )}

        {registrations &&
          registrations.map((reg) => (
            <div
              key={reg._id}
              className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {reg.user?.name || "Unknown User"}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        reg.status
                      )}`}
                    >
                      {reg.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">{reg.user?.email}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Submitted: {new Date(reg.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === reg._id ? null : reg._id)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium transition-colors"
                >
                  {expandedId === reg._id ? "Hide Details" : "View Details"}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedId === reg._id && (
                <div className="border-t border-neutral-200 p-6 bg-neutral-50 space-y-6">
                  {/* Business Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                        Business Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Type:</span> {reg.business.type}
                        </p>
                        {reg.business.name && (
                          <p>
                            <span className="font-medium">Name:</span> {reg.business.name}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">PAN:</span> {reg.pan}
                        </p>
                        {reg.gstin && (
                          <p>
                            <span className="font-medium">GSTIN:</span> {reg.gstin}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                        Identity Proof
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Type:</span> {reg.identity.type}
                        </p>
                        <p>
                          <span className="font-medium">Number:</span> {reg.identity.number}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                      Bank Details
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <p>
                        <span className="font-medium">Account Holder:</span>{" "}
                        {reg.bank.account_holder}
                      </p>
                      <p>
                        <span className="font-medium">Account Number:</span>{" "}
                        {reg.bank.account_number}
                      </p>
                      <p>
                        <span className="font-medium">IFSC:</span> {reg.bank.ifsc}
                      </p>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                        Business Address
                      </h4>
                      <p className="text-sm text-neutral-600">
                        {reg.address.street}, {reg.address.city}, {reg.address.state} -{" "}
                        {reg.address.pincode}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                        Pickup Address
                      </h4>
                      <p className="text-sm text-neutral-600">
                        {reg.pickup_address.street}, {reg.pickup_address.city},{" "}
                        {reg.pickup_address.state} - {reg.pickup_address.pincode}
                      </p>
                    </div>
                  </div>

                  {/* First Product */}
                  {reg.first_product && (reg.first_product.name || reg.first_product.url) && (
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                        First Product
                      </h4>
                      <div className="space-y-2 text-sm">
                        {reg.first_product.name && (
                          <p>
                            <span className="font-medium">Name:</span> {reg.first_product.name}
                          </p>
                        )}
                        {reg.first_product.url && (
                          <p>
                            <span className="font-medium">URL:</span>{" "}
                            <a
                              href={reg.first_product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-brand hover:underline"
                            >
                              {reg.first_product.url}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {reg.status === "submitted" && (
                    <div className="flex gap-3 pt-4 border-t border-neutral-200">
                      <button
                        onClick={() => handleStatusUpdate(reg._id, "reviewing")}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Mark as Reviewing
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(reg._id, "approved")}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(reg._id, "rejected")}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {reg.status === "reviewing" && (
                    <div className="flex gap-3 pt-4 border-t border-neutral-200">
                      <button
                        onClick={() => handleStatusUpdate(reg._id, "approved")}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(reg._id, "rejected")}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
