"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { Id } from "@/../convex/_generated/dataModel";

type RegistrationStatus = "draft" | "submitted" | "reviewing" | "approved" | "rejected";

const cardStyles =
  "rounded-3xl border border-[#dce8e1] bg-white/95 p-6 shadow-xl shadow-primary-brand/5 backdrop-blur-sm";
const detailSectionStyles =
  "rounded-2xl border border-[#e5efe8] bg-[#f7faf9] p-5 text-sm text-neutral-600";
const filterButtonBase =
  "rounded-xl px-4 py-2 text-sm font-medium transition-all";

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
    <div className="space-y-8">
      <section
        className={`${cardStyles} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary-brand/80">
            Registration Pipeline
          </p>
          <h1 className="text-3xl font-bold text-[#1f2a33]">
            Shopkeeper Submissions
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Filter and review every application to keep the marketplace trustworthy.
          </p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-brand/10 text-primary-brand">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2" />
            <path d="M13 17v2" />
            <path d="M13 11v2" />
          </svg>
        </div>
      </section>

      <section className={cardStyles}>
        <label className="block text-sm font-semibold text-[#1f2a33]">
          Filter by status
        </label>
        <p className="mt-1 text-sm text-neutral-500">
          Focus on a single stage or view the entire pipeline at once.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["all", "draft", "submitted", "reviewing", "approved", "rejected"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status as typeof selectedStatus)}
              className={`${filterButtonBase} ${
                selectedStatus === status
                  ? "bg-primary-brand text-white shadow-lg shadow-primary-brand/25"
                  : "bg-[#f5faf7] text-neutral-600 hover:bg-[#e9f4ec]"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Registrations List */}
      <div className="space-y-5">
        {!registrations && (
          <div className={`${cardStyles} text-center`}>
            <p className="text-sm text-neutral-500">Loading registrations...</p>
          </div>
        )}

        {registrations && registrations.length === 0 && (
          <div className={`${cardStyles} text-center`}>
            <p className="text-sm text-neutral-500">No registrations found for this status.</p>
          </div>
        )}

        {registrations &&
          registrations.map((reg) => (
            <div key={reg._id} className={`${cardStyles} space-y-6`}>
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-[#f5faf7] p-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-[#1f2a33]">
                      {reg.user?.name || "Unknown User"}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                        reg.status,
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {reg.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {reg.user?.email || "No email on file"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <p className="text-xs text-neutral-400">
                    Submitted {new Date(reg.created_at).toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === reg._id ? null : reg._id)}
                    className="rounded-xl border border-transparent bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-primary-brand/40 hover:text-primary-brand"
                    aria-expanded={expandedId === reg._id}
                  >
                    {expandedId === reg._id ? "Hide details" : "View details"}
                  </button>
                </div>
              </div>

              {expandedId === reg._id && (
                <div className="space-y-5">
                  <div className={`${detailSectionStyles} grid gap-4 md:grid-cols-2`}>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-[#1f2a33]">
                        Business information
                      </h4>
                      <p>
                        <span className="font-semibold text-[#1f2a33]">Type:</span> {reg.business.type}
                      </p>
                      {reg.business.name && (
                        <p>
                          <span className="font-semibold text-[#1f2a33]">Name:</span> {reg.business.name}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold text-[#1f2a33]">PAN:</span> {reg.pan}
                      </p>
                      {reg.gstin && (
                        <p>
                          <span className="font-semibold text-[#1f2a33]">GSTIN:</span> {reg.gstin}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-[#1f2a33]">
                        Identity proof
                      </h4>
                      <p>
                        <span className="font-semibold text-[#1f2a33]">Type:</span> {reg.identity.type}
                      </p>
                      <p>
                        <span className="font-semibold text-[#1f2a33]">Number:</span> {reg.identity.number}
                      </p>
                    </div>
                  </div>

                  <div className={`${detailSectionStyles} grid gap-4 md:grid-cols-3`}>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Account holder
                      </span>
                      <p className="mt-1 font-medium text-[#1f2a33]">
                        {reg.bank.account_holder}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Account number
                      </span>
                      <p className="mt-1 font-medium text-[#1f2a33]">
                        {reg.bank.account_number}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        IFSC
                      </span>
                      <p className="mt-1 font-medium text-[#1f2a33]">{reg.bank.ifsc}</p>
                    </div>
                  </div>

                  <div className={`${detailSectionStyles} grid gap-4 md:grid-cols-2`}>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1f2a33]">
                        Business address
                      </h4>
                      <p className="mt-1">
                        {reg.address.street}, {reg.address.city}, {reg.address.state} - {reg.address.pincode}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1f2a33]">
                        Pickup address
                      </h4>
                      <p className="mt-1">
                        {reg.pickup_address.street}, {reg.pickup_address.city}, {reg.pickup_address.state} - {reg.pickup_address.pincode}
                      </p>
                    </div>
                  </div>

                  {reg.first_product && (reg.first_product.name || reg.first_product.url) && (
                    <div className={detailSectionStyles}>
                      <h4 className="text-sm font-semibold text-[#1f2a33]">
                        First product
                      </h4>
                      <div className="mt-2 space-y-2">
                        {reg.first_product.name && (
                          <p>
                            <span className="font-semibold text-[#1f2a33]">Name:</span> {reg.first_product.name}
                          </p>
                        )}
                        {reg.first_product.url && (
                          <p>
                            <span className="font-semibold text-[#1f2a33]">URL:</span>{" "}
                            <a
                              href={reg.first_product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-brand underline-offset-2 hover:underline"
                            >
                              {reg.first_product.url}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {(reg.status === "submitted" || reg.status === "reviewing") && (
                    <div className="flex flex-wrap gap-3 rounded-2xl border border-[#e5efe8] bg-white/85 px-4 py-4">
                      {reg.status === "submitted" && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(reg._id, "reviewing")}
                          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-transform hover:-translate-y-px hover:bg-amber-600"
                        >
                          Mark as reviewing
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(reg._id, "approved")}
                        className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:-translate-y-px hover:bg-emerald-600"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(reg._id, "rejected")}
                        className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-transform hover:-translate-y-px hover:bg-rose-600"
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
