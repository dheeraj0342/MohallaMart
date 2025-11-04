"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function ShopkeeperRegistrationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const registration = useQuery(
    api.registrations.getMyRegistration,
    user ? { userId: user.id } : "skip",
  ) as {
    pan?: string;
    gstin?: string;
    bank?: { account_holder?: string; account_number?: string; ifsc?: string };
    address?: { street?: string; city?: string; state?: string; pincode?: string };
    identity?: { type?: "aadhaar" | "passport" | "voter_id" | "driver_license"; number?: string };
    business?: { type?: "individual" | "proprietorship" | "partnership" | "company"; name?: string };
    pickup_address?: { street?: string; city?: string; state?: string; pincode?: string };
    first_product?: { name?: string; url?: string };
    status?: "draft" | "submitted" | "reviewing" | "approved" | "rejected";
  } | null | undefined;
  const save = useMutation(api.registrations.upsertMyRegistration);

  const [pan, setPan] = useState("");
  const [gstin, setGstin] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [pincode, setPincode] = useState("");
  const [idType, setIdType] = useState<
    "aadhaar" | "passport" | "voter_id" | "driver_license"
  >("aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [bizType, setBizType] = useState<
    "individual" | "proprietorship" | "partnership" | "company"
  >("individual");
  const [bizName, setBizName] = useState("");
  const [pickupStreet, setPickupStreet] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupState, setPickupState] = useState("");
  const [pickupPincode, setPickupPincode] = useState("");
  const [firstProductName, setFirstProductName] = useState("");
  const [firstProductUrl, setFirstProductUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (registration) {
      setPan(registration.pan || "");
      setGstin(registration.gstin || "");
      setBankAccountHolder(registration.bank?.account_holder || "");
      setBankAccountNumber(registration.bank?.account_number || "");
      setBankIfsc(registration.bank?.ifsc || "");
      setStreet(registration.address?.street || "");
      setCity(registration.address?.city || "");
      setStateValue(registration.address?.state || "");
      setPincode(registration.address?.pincode || "");
      setIdType((registration.identity?.type || "aadhaar") as typeof idType);
      setIdNumber(registration.identity?.number || "");
      setBizType((registration.business?.type || "individual") as typeof bizType);
      setBizName(registration.business?.name || "");
      setPickupStreet(registration.pickup_address?.street || "");
      setPickupCity(registration.pickup_address?.city || "");
      setPickupState(registration.pickup_address?.state || "");
      setPickupPincode(registration.pickup_address?.pincode || "");
      setFirstProductName(registration.first_product?.name || "");
      setFirstProductUrl(registration.first_product?.url || "");
    }
  }, [registration]);

  if (user === null || registration === undefined) return null;
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white border border-neutral-100 rounded-2xl p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">
            Shopkeeper Registration
          </h1>
          <p className="text-sm text-neutral-600">
            Please sign in to continue your registration.
          </p>
        </div>
      </div>
    );
  }

  // Show status message if registration is already submitted
  if (registration && registration.status !== "draft") {
    const getStatusMessage = () => {
      switch (registration.status) {
        case "submitted":
          return {
            title: "Registration Submitted!",
            message: "Your application is under review. We will notify you via email once reviewed.",
            color: "blue",
          };
        case "reviewing":
          return {
            title: "Under Review",
            message: "Our team is currently reviewing your application. This typically takes 1-2 business days.",
            color: "amber",
          };
        case "approved":
          return {
            title: "Registration Approved! 🎉",
            message: "Congratulations! Your shopkeeper account has been approved. You can now start adding products.",
            color: "green",
          };
        case "rejected":
          return {
            title: "Registration Needs Attention",
            message: "Your application requires some corrections. Please contact support for more details.",
            color: "red",
          };
        default:
          return null;
      }
    };

    const statusInfo = getStatusMessage();
    if (statusInfo) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white border-2 border-neutral-100 rounded-2xl p-8 shadow-lg">
            <div className="text-center space-y-4">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                  statusInfo.color === "blue"
                    ? "bg-blue-100"
                    : statusInfo.color === "amber"
                      ? "bg-amber-100"
                      : statusInfo.color === "green"
                        ? "bg-green-100"
                        : "bg-red-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    statusInfo.color === "blue"
                      ? "text-blue-600"
                      : statusInfo.color === "amber"
                        ? "text-amber-600"
                        : statusInfo.color === "green"
                          ? "text-green-600"
                          : "text-red-600"
                  }
                >
                  {statusInfo.color === "approved" ? (
                    <>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </>
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </>
                  )}
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">{statusInfo.title}</h1>
              <p className="text-neutral-600">{statusInfo.message}</p>
              <div className="pt-4">
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-primary-brand hover:bg-primary-hover text-white rounded-xl font-medium transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  const onSubmit = async (submit: boolean) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await save({
        userId: user.id,
        pan,
        gstin: gstin || undefined,
        bank: {
          account_holder: bankAccountHolder,
          account_number: bankAccountNumber,
          ifsc: bankIfsc,
        },
        address: { street, city, state: stateValue, pincode },
        identity: { type: idType, number: idNumber },
        business: {
          type: bizType,
          name: bizName || undefined,
          documents: undefined,
        },
        pickup_address: {
          street: pickupStreet,
          city: pickupCity,
          state: pickupState,
          pincode: pickupPincode,
        },
        first_product: {
          name: firstProductName || undefined,
          url: firstProductUrl || undefined,
        },
        submit,
      });
      if (submit) {
        alert("Registration submitted. We will review and notify you.");
        router.replace("/");
      } else {
        alert("Draft saved.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyles =
    "w-full border-2 border-[#dce8e1] rounded-xl px-3 py-2 bg-[#f7faf9] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto max-w-3xl bg-white/95 dark:bg-[#11181d] border border-[#e5efe8] dark:border-[#1f2a33] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
        <h1 className="text-2xl font-bold mb-1 text-[#1f2a33] dark:text-[#f3f6fb]">
          Shopkeeper Registration
        </h1>
        <p className="text-sm text-[#667085] dark:text-[#9aa6b2] mb-6">
          Provide required details to complete onboarding. GSTIN optional for
          books-only sellers.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Tax & Identification
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-neutral-700">
                  PAN
                </label>
                <input
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-neutral-700">
                  GSTIN (optional)
                </label>
                <input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className={inputStyles}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Bank Details
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2 text-neutral-700">
                  Account Holder
                </label>
                <input
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-neutral-700">
                  Account Number
                </label>
                <input
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-neutral-700">
                  IFSC
                </label>
                <input
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  className={inputStyles}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Business Address
            </h2>
            <div className="space-y-3">
              <input
                placeholder="Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className={inputStyles}
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputStyles}
                />
                <input
                  placeholder="State"
                  value={stateValue}
                  onChange={(e) => setStateValue(e.target.value)}
                  className={inputStyles}
                />
                <input
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className={inputStyles}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Identity Proof
            </h2>
            <div className="space-y-3">
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value as typeof idType)}
                className={inputStyles}
              >
                <option value="aadhaar">Aadhaar</option>
                <option value="passport">Passport</option>
                <option value="voter_id">Voter ID</option>
                <option value="driver_license">Driver&apos;s License</option>
              </select>
              <input
                placeholder="Document Number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className={inputStyles}
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Business Info
            </h2>
            <div className="space-y-3">
              <select
                value={bizType}
                onChange={(e) => setBizType(e.target.value as typeof bizType)}
                className={inputStyles}
              >
                <option value="individual">Individual</option>
                <option value="proprietorship">Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="company">Company</option>
              </select>
              <input
                placeholder="Business/Shop Name (optional)"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className={inputStyles}
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Pickup Address
            </h2>
            <div className="space-y-3">
              <input
                placeholder="Street"
                value={pickupStreet}
                onChange={(e) => setPickupStreet(e.target.value)}
                className={inputStyles}
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  placeholder="City"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  className={inputStyles}
                />
                <input
                  placeholder="State"
                  value={pickupState}
                  onChange={(e) => setPickupState(e.target.value)}
                  className={inputStyles}
                />
                <input
                  placeholder="Pincode"
                  value={pickupPincode}
                  onChange={(e) => setPickupPincode(e.target.value)}
                  className={inputStyles}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              First Product (optional)
            </h2>
            <div className="space-y-3">
              <input
                placeholder="Product Name"
                value={firstProductName}
                onChange={(e) => setFirstProductName(e.target.value)}
                className={inputStyles}
              />
              <input
                placeholder="Product URL"
                value={firstProductUrl}
                onChange={(e) => setFirstProductUrl(e.target.value)}
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8">
          <button
            disabled={submitting}
            onClick={() => onSubmit(false)}
            className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            disabled={submitting}
            onClick={() => onSubmit(true)}
            className="px-4 py-2 rounded-xl bg-primary-brand hover:bg-primary-hover text-white disabled:opacity-50"
          >
            Submit for review
          </button>
        </div>
      </div>
    </div>
  );
}
