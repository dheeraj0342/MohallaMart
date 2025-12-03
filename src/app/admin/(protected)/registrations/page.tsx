"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { Id } from "@/../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Building2,
  User,
  MapPin,
  CreditCard,
  FileText,
  Package,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import RegistrationStatusDialog from "./_components/RegistrationStatusDialog";

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
    address: { 
      street: string; 
      city: string; 
      state: string; 
      pincode: string;
      lat?: number;
      lon?: number;
      village?: string;
      hamlet?: string;
      county?: string;
      stateDistrict?: string;
    };
    identity: { type: string; number: string };
    business: { type: string; name?: string };
    pickup_address: { street: string; city: string; state: string; pincode: string };
    first_product?: { name?: string; url?: string };
    status: RegistrationStatus;
    created_at: number;
    updated_at: number;
    user: { id: string; name: string; email: string } | null;
  }> | undefined;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Draft
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="default" className="gap-1.5 bg-blue-500 hover:bg-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Submitted
          </Badge>
        );
      case "reviewing":
        return (
          <Badge variant="warning" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Reviewing
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="success" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
          </Badge>
        );
    }
  };

  const statusFilters: Array<{ value: RegistrationStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "reviewing", label: "Reviewing" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Shopkeeper Registrations</CardTitle>
              <CardDescription className="mt-2 text-base">
                Filter and review every application to keep the marketplace trustworthy.
              </CardDescription>
            </div>
            <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-xl bg-primary-brand/10 dark:bg-primary-brand/20 text-primary-brand">
              <ClipboardList className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Status</CardTitle>
          <CardDescription>Focus on a single stage or view the entire pipeline at once.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                onClick={() => setSelectedStatus(filter.value)}
                variant={selectedStatus === filter.value ? "default" : "outline"}
                size="sm"
                className={
                  selectedStatus === filter.value
                    ? "bg-primary-brand hover:bg-primary-brand/90 text-white"
                    : ""
                }
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registrations List */}
      <div className="space-y-4">
        {!registrations && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Loading registrations...</p>
            </CardContent>
          </Card>
        )}

        {registrations && registrations.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">No registrations found</p>
              <p className="text-xs text-muted-foreground mt-1">
                No registrations found for the selected status.
              </p>
            </CardContent>
          </Card>
        )}

        {registrations &&
          registrations.map((reg) => (
            <Card key={reg._id} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-brand/10 dark:bg-primary-brand/20 text-sm font-semibold text-primary-brand">
                      {reg.user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{reg.user?.name || "Unknown User"}</CardTitle>
                        {getStatusBadge(reg.status)}
                      </div>
                      <CardDescription className="text-sm">{reg.user?.email || "No email on file"}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(reg.created_at).toLocaleString()}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === reg._id ? null : reg._id)}
                      className="shrink-0"
                    >
                      {expandedId === reg._id ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1.5" />
                          Hide details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1.5" />
                          View details
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedId === reg._id && (
                <CardContent className="space-y-4 pt-0">
                  {/* Business Information */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary-brand" />
                          <CardTitle className="text-base">Business Information</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-foreground">Type:</span>{" "}
                          <span className="text-muted-foreground">{reg.business.type}</span>
                        </div>
                        {reg.business.name && (
                          <div>
                            <span className="font-medium text-foreground">Name:</span>{" "}
                            <span className="text-muted-foreground">{reg.business.name}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-foreground">PAN:</span>{" "}
                          <span className="text-muted-foreground font-mono">{reg.pan}</span>
                        </div>
                        {reg.gstin && (
                          <div>
                            <span className="font-medium text-foreground">GSTIN:</span>{" "}
                            <span className="text-muted-foreground font-mono">{reg.gstin}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary-brand" />
                          <CardTitle className="text-base">Identity Proof</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-foreground">Type:</span>{" "}
                          <span className="text-muted-foreground">{reg.identity.type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Number:</span>{" "}
                          <span className="text-muted-foreground font-mono">{reg.identity.number}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bank Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary-brand" />
                        <CardTitle className="text-base">Bank Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                            Account Holder
                          </p>
                          <p className="text-sm font-medium text-foreground">{reg.bank.account_holder}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                            Account Number
                          </p>
                          <p className="text-sm font-medium text-foreground font-mono">
                            {reg.bank.account_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                            IFSC
                          </p>
                          <p className="text-sm font-medium text-foreground font-mono uppercase">
                            {reg.bank.ifsc}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Addresses */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary-brand" />
                          <CardTitle className="text-base">Business Address</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm space-y-1">
                        <p className="text-muted-foreground">
                          {reg.address.street}, {reg.address.city}, {reg.address.state} - {reg.address.pincode}
                        </p>
                        {(reg.address.village || reg.address.hamlet) && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Village/Hamlet:</span> {reg.address.village || reg.address.hamlet}
                          </p>
                        )}
                        {(reg.address.county || reg.address.stateDistrict) && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">District:</span> {reg.address.county || reg.address.stateDistrict}
                          </p>
                        )}
                        {reg.address.lat && reg.address.lon && (
                           <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
                             <MapPin className="h-3 w-3" />
                             <a 
                               href={`https://www.google.com/maps?q=${reg.address.lat},${reg.address.lon}`} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="hover:underline"
                             >
                               View on Google Maps
                             </a>
                           </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary-brand" />
                          <CardTitle className="text-base">Pickup Address</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p className="text-muted-foreground">
                          {reg.pickup_address.street}, {reg.pickup_address.city}, {reg.pickup_address.state} - {reg.pickup_address.pincode}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* First Product */}
                  {reg.first_product && (reg.first_product.name || reg.first_product.url) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary-brand" />
                          <CardTitle className="text-base">First Product</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {reg.first_product.name && (
                          <div>
                            <span className="font-medium text-foreground">Name:</span>{" "}
                            <span className="text-muted-foreground">{reg.first_product.name}</span>
                          </div>
                        )}
                        {reg.first_product.url && (
                          <div>
                            <span className="font-medium text-foreground">URL:</span>{" "}
                            <a
                              href={reg.first_product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-brand underline-offset-2 hover:underline break-all"
                            >
                              {reg.first_product.url}
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  {(reg.status === "submitted" || reg.status === "reviewing") && (
                    <Card className="border-2 border-primary-brand/20 bg-primary-brand/5 dark:bg-primary-brand/10">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary-brand" />
                          <CardTitle className="text-base">Actions</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          {reg.status === "submitted" && (
                            <RegistrationStatusDialog
                              registrationId={reg._id}
                              newStatus="reviewing"
                              label="Mark as Reviewing"
                            />
                          )}
                          <RegistrationStatusDialog
                            registrationId={reg._id}
                            newStatus="approved"
                            label="Approve"
                          />
                          <RegistrationStatusDialog
                            registrationId={reg._id}
                            newStatus="rejected"
                            label="Reject"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
}
