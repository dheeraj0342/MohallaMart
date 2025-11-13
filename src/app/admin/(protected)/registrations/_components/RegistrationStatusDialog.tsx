"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

interface RegistrationStatusDialogProps {
  registrationId: Id<"seller_registrations">;
  newStatus: "reviewing" | "approved" | "rejected";
  label: string;
}

export default function RegistrationStatusDialog({
  registrationId,
  newStatus,
  label,
}: RegistrationStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const updateStatus = useMutation(api.registrations.updateRegistrationStatus);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await updateStatus({
        registrationId,
        status: newStatus,
      });

      toast.success(
        newStatus === "approved"
          ? "Registration approved successfully"
          : newStatus === "rejected"
            ? "Registration rejected successfully"
            : "Registration marked as reviewing"
      );
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update registration status. Please try again."
      );
      console.error("Error updating registration status:", error);
    } finally {
      setIsPending(false);
    }
  };

  const getStatusConfig = () => {
    switch (newStatus) {
      case "approved":
        return {
          icon: CheckCircle2,
          iconColor: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          actionText: "Approve",
          description:
            "This will approve the registration and activate the shopkeeper. They will be able to access their dashboard. Are you sure you want to continue?",
          buttonClass: "bg-primary-brand hover:bg-primary-brand/90 text-white",
        };
      case "rejected":
        return {
          icon: XCircle,
          iconColor: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          actionText: "Reject",
          description:
            "This will reject the registration. The shopkeeper will not be able to access their dashboard. Are you sure you want to continue?",
          buttonClass: "bg-destructive hover:bg-destructive/90 text-white",
        };
      case "reviewing":
        return {
          icon: Clock,
          iconColor: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-100 dark:bg-amber-900/30",
          actionText: "Mark as Reviewing",
          description:
            "This will mark the registration as under review. The shopkeeper will be notified. Are you sure you want to continue?",
          buttonClass: "bg-amber-500 hover:bg-amber-600 text-white",
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          actionText: "Update Status",
          description: "Are you sure you want to update the registration status?",
          buttonClass: "bg-primary-brand hover:bg-primary-brand/90 text-white",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={newStatus === "rejected" ? "destructive" : newStatus === "approved" ? "default" : "secondary"}
        size="sm"
        className={newStatus === "reviewing" ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
      >
        {newStatus === "approved" ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            {label}
          </>
        ) : newStatus === "rejected" ? (
          <>
            <XCircle className="h-4 w-4 mr-1.5" />
            {label}
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 mr-1.5" />
            {label}
          </>
        )}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
                <Icon className={`h-6 w-6 ${config.iconColor}`} />
              </div>
              <div className="flex-1 space-y-2">
                <AlertDialogTitle className="text-xl font-semibold">
                  {config.actionText} Registration?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  {config.description}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-4">
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className={config.buttonClass}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  {config.actionText}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

