"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShopkeeperToggleDialogProps {
  id: string;
  label: string;
  makeActive: boolean;
}

export default function ShopkeeperToggleDialog({
  id,
  label,
  makeActive,
}: ShopkeeperToggleDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      const response = await fetch("/api/admin/toggle-shopkeeper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, makeActive }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update shopkeeper status");
      }

      toast.success(
        makeActive
          ? "Shopkeeper approved successfully"
          : "Shopkeeper disabled successfully"
      );
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update shopkeeper status. Please try again."
      );
      console.error("Error updating shopkeeper:", error);
    } finally {
      setIsPending(false);
    }
  };

  const actionText = makeActive ? "Approve" : "Disable";
  const description = makeActive
    ? "This will activate the shopkeeper and allow them to access their dashboard. Are you sure you want to continue?"
    : "This will disable the shopkeeper and prevent them from accessing their dashboard. Are you sure you want to continue?";

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={makeActive ? "default" : "destructive"}
        size="sm"
        className="shrink-0"
      >
        {makeActive ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            {label}
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 mr-1.5" />
            {label}
          </>
        )}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  makeActive
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {makeActive ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <AlertDialogTitle className="text-xl font-semibold">
                  {actionText} Shopkeeper?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  {description}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-4">
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className={
                makeActive
                  ? "bg-primary-brand hover:bg-primary-brand/90 text-white"
                  : "bg-destructive hover:bg-destructive/90 text-white"
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {makeActive ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {actionText}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

