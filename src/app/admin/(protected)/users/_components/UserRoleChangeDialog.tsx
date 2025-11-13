"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Store, User, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "../page";

interface UserRoleChangeDialogProps {
  userId: string;
  currentRole: UserRole;
  userName: string;
}

export default function UserRoleChangeDialog({
  userId,
  currentRole,
  userName,
}: UserRoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const updateUser = useMutation(api.users.updateUser);

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === currentRole) return;
    setSelectedRole(newRole);
    setOpen(true);
  };

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await updateUser({
        id: userId,
        role: selectedRole,
      });

      toast.success(`User role updated to ${getRoleLabel(selectedRole)}`);
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update user role. Please try again."
      );
      console.error("Error updating user role:", error);
      setSelectedRole(currentRole); // Reset on error
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    setSelectedRole(currentRole); // Reset to current role
    setOpen(false);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "shop_owner":
        return "Shop Owner";
      case "customer":
        return "Customer";
      default:
        return role;
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <ShieldCheck className="h-4 w-4" />;
      case "shop_owner":
        return <Store className="h-4 w-4" />;
      case "customer":
        return <User className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default" className="gap-1.5 bg-purple-500 hover:bg-purple-600">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "shop_owner":
        return (
          <Badge variant="default" className="gap-1.5 bg-primary-brand hover:bg-primary-brand/90">
            <Store className="h-3 w-3" />
            Shop Owner
          </Badge>
        );
      case "customer":
        return (
          <Badge variant="outline" className="gap-1.5">
            <User className="h-3 w-3" />
            Customer
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5">
            {role}
          </Badge>
        );
    }
  };

  const description = `Are you sure you want to change ${userName}'s role from ${getRoleLabel(currentRole)} to ${getRoleLabel(selectedRole)}? This action will update their permissions and access levels.`;

  return (
    <>
      <div className="flex items-center gap-2">
        {getRoleIcon(currentRole)}
        <Select value={currentRole} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </span>
            </SelectItem>
            <SelectItem value="shop_owner">
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Shop Owner
              </span>
            </SelectItem>
            <SelectItem value="admin">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AlertDialog open={open} onOpenChange={handleCancel}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 space-y-2">
                <AlertDialogTitle className="text-xl font-semibold">
                  Change User Role?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  {description}
                </AlertDialogDescription>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Current Role</span>
                    {getRoleBadge(currentRole)}
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">New Role</span>
                    {getRoleBadge(selectedRole)}
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-4">
            <AlertDialogCancel disabled={isPending} onClick={handleCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-primary-brand hover:bg-primary-brand/90 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Change Role
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

