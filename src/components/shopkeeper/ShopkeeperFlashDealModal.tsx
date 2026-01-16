"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface ShopkeeperFlashDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  currentDiscount?: number;
  currentStartTime?: number;
  currentEndTime?: number;
  isFlashDeal?: boolean;
  onSave: (data: {
    is_flash_deal: boolean;
    flash_deal_discount_percent?: number;
    flash_deal_start_time?: number;
    flash_deal_end_time?: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function ShopkeeperFlashDealModal({
  open,
  onOpenChange,
  productName,
  currentDiscount = 10,
  currentStartTime,
  currentEndTime,
  isFlashDeal = false,
  onSave,
  isLoading = false,
}: ShopkeeperFlashDealModalProps) {
  const [enabled, setEnabled] = useState(isFlashDeal);
  const [discountPercent, setDiscountPercent] = useState(currentDiscount.toString());
  const [startDate, setStartDate] = useState(
    currentStartTime ? new Date(currentStartTime).toISOString().slice(0, 16) : ""
  );
  const [endDate, setEndDate] = useState(
    currentEndTime ? new Date(currentEndTime).toISOString().slice(0, 16) : ""
  );

  const handleSave = async () => {
    if (enabled) {
      // Validate inputs
      const discount = parseFloat(discountPercent);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        alert("Please enter a valid discount percentage between 0 and 100");
        return;
      }

      if (!startDate || !endDate) {
        alert("Please select both start and end times for the flash deal");
        return;
      }

      const startTime = new Date(startDate).getTime();
      const endTime = new Date(endDate).getTime();

      if (startTime >= endTime) {
        alert("End time must be after start time");
        return;
      }

      await onSave({
        is_flash_deal: true,
        flash_deal_discount_percent: discount,
        flash_deal_start_time: startTime,
        flash_deal_end_time: endTime,
      });
    } else {
      // Disable flash deal
      await onSave({
        is_flash_deal: false,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Flash Deal Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure flash deal for <span className="font-semibold">{productName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Toggle Flash Deal */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
            <div>
              <Label className="text-sm font-medium text-foreground">
                Enable Flash Deal
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Turn on to create a limited-time flash deal for this product
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Conditional fields when enabled */}
          {enabled && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
              {/* Discount Percentage */}
              <div className="space-y-2">
                <Label htmlFor="discount" className="text-sm font-medium text-foreground">
                  Discount Percentage (%)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="Enter discount percentage"
                    className="flex-1 bg-background"
                  />
                  <span className="text-sm text-muted-foreground font-medium">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Customers will see {discountPercent}% off on this product
                </p>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-foreground">
                  Flash Deal Start Time
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  When the flash deal starts
                </p>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium text-foreground">
                  Flash Deal End Time
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  When the flash deal expires
                </p>
              </div>

              {/* Preview */}
              {startDate && endDate && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">
                    Flash Deal Duration:
                  </p>
                  <p className="text-xs text-foreground">
                    From {new Date(startDate).toLocaleString()} to{" "}
                    {new Date(endDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {!enabled && isFlashDeal && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                This will disable the current flash deal for this product
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Flash Deal"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
