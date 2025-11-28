"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { useStore } from "@/store/useStore";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Loader2,
  ArrowRight,
  Clock,
  Map,
  Navigation,
  Tag,
  Edit,
  User,
  CheckCircle2,
} from "lucide-react";
import LocationModal from "@/components/LocationModal";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/ImageUpload";

export default function CreateShopContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error, warning, info } = useToast();
  const [isSubmitting, setSubmitting] = useState(false);

  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Id<"categories">[]>([]);
  const [shopImage, setShopImage] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditCategoriesOnly, setIsEditCategoriesOnly] = useState(false);
  const [existingShop, setExistingShop] = useState<any>(null);

  // Business hours state
  const [businessHours, setBusinessHours] = useState<{
    [key: string]: { open: string; close: string; enabled: boolean };
  }>({
    monday: { open: "09:00", close: "18:00", enabled: true },
    tuesday: { open: "09:00", close: "18:00", enabled: true },
    wednesday: { open: "09:00", close: "18:00", enabled: true },
    thursday: { open: "09:00", close: "18:00", enabled: true },
    friday: { open: "09:00", close: "18:00", enabled: true },
    saturday: { open: "09:00", close: "18:00", enabled: true },
    sunday: { open: "09:00", close: "18:00", enabled: false },
  });

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { _id: Id<"users">; name?: string; email?: string; phone?: string } | null | undefined;

  const registration = useQuery(
    api.registrations.getMyRegistration,
    user ? { userId: user.id } : "skip",
  ) as { status?: "approved" | "pending" | "rejected" } | null | undefined;

  const existingShops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip",
  );

  const categories = useQuery(
    api.categories.getAllCategories,
    { is_active: true },
  ) as { _id: Id<"categories">; name: string }[] | null | undefined;

  const createShop = useMutation(api.shops.createShop);
  const updateShop = useMutation(api.shops.updateShop);
  const deleteShop = useMutation(api.shops.deleteShop);
  const seedCategories = useMutation(api.categories.seedDefaultCategories);
  const getDuplicateShops = useQuery(
    api.shops.getDuplicateShops,
    dbUser?._id ? { owner_id: dbUser._id } : "skip",
  );

  useEffect(() => {
    if (dbUser) {
      setEmail(dbUser.email || "");
      setPhone(dbUser.phone || "");
    }
  }, [dbUser]);

  useEffect(() => {
    if (registration !== undefined && registration?.status !== "approved") {
      error("Complete and get your registration approved before creating a shop.");
      setTimeout(() => {
        router.push("/shopkeeper/registration");
      }, 2000);
    }
  }, [registration, error, router]);

  // Clean up duplicate shops automatically (only once)
  const [hasCleanedDuplicates, setHasCleanedDuplicates] = useState(false);
  useEffect(() => {
    if (
      !hasCleanedDuplicates &&
      getDuplicateShops &&
      Array.isArray(getDuplicateShops) &&
      getDuplicateShops.length > 0
    ) {
      setHasCleanedDuplicates(true);
      // Delete all duplicate shops (keep only the first one)
      Promise.all(
        getDuplicateShops.map(async (duplicateShop) => {
          try {
            await deleteShop({ id: duplicateShop._id });
            return duplicateShop._id;
          } catch (err) {
            console.error(`Failed to delete duplicate shop ${duplicateShop._id}:`, err);
            return null;
          }
        })
      ).then((deletedIds) => {
        const successCount = deletedIds.filter((id) => id !== null).length;
        if (successCount > 0) {
          warning(`Removed ${successCount} duplicate shop(s). Keeping the original.`);
        }
      });
    }
  }, [getDuplicateShops, deleteShop, warning, hasCleanedDuplicates]);

  // Load existing shop data
  useEffect(() => {
    if (existingShops && Array.isArray(existingShops) && existingShops.length > 0) {
      const shop = existingShops[0];
      setExistingShop(shop);

      // Load shop data into form
      setShopName(shop.name || "");
      setDescription(shop.description || "");
      setStreet(shop.address?.street || "");
      setCity(shop.address?.city || "");
      setState(shop.address?.state || "");
      setPincode(shop.address?.pincode || "");
      setPhone(shop.contact?.phone || "");
      setEmail(shop.contact?.email || "");
      setLatitude(shop.address?.coordinates?.lat || null);
      setLongitude(shop.address?.coordinates?.lng || null);
      setSelectedCategories(shop.categories || []);
      setShopImage(shop.logo_url || "");

      // Load business hours if they exist
      if (shop.business_hours) {
        // Initialize with default hours for all days
        const defaultHours = {
          monday: { open: "09:00", close: "18:00", enabled: false },
          tuesday: { open: "09:00", close: "18:00", enabled: false },
          wednesday: { open: "09:00", close: "18:00", enabled: false },
          thursday: { open: "09:00", close: "18:00", enabled: false },
          friday: { open: "09:00", close: "18:00", enabled: false },
          saturday: { open: "09:00", close: "18:00", enabled: false },
          sunday: { open: "09:00", close: "18:00", enabled: false },
        };

        // Merge with existing business hours from shop
        const hours: any = { ...defaultHours };
        if (shop.business_hours) {
          Object.keys(shop.business_hours).forEach((day) => {
            const dayHours = (shop.business_hours as any)[day];
            if (dayHours) {
              hours[day] = {
                open: dayHours.open || "09:00",
                close: dayHours.close || "18:00",
                enabled: true,
              };
            }
          });
        }
        setBusinessHours(hours);
      }
    }
  }, [existingShops]);

  const location = useStore((state) => state.location);

  // Handle location selection from LocationModal
  useEffect(() => {
    if (location && isLocationModalOpen) {
      // Extract address details from location
      // LocationModal saves: { city, area, pincode, lat, lon }
      const loc = location as any;

      if (loc.city) setCity(loc.city);
      if (loc.area) setStreet(loc.area);
      if (loc.pincode) setPincode(loc.pincode);

      // Handle coordinates - LocationModal saves as flat lat/lon properties
      if (loc.lat && loc.lon) {
        setLatitude(loc.lat);
        setLongitude(loc.lon);
      } else if (loc.coordinates) {
        setLatitude(loc.coordinates.lat);
        setLongitude(loc.coordinates.lng);
      }

      success("Location selected! Please verify and complete address fields (especially State).");
      setIsLocationModalOpen(false);
    }
  }, [location, isLocationModalOpen, success]);

  // Open location modal to get coordinates from address
  const handleGeocodeAddress = useCallback(() => {
    if (!street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      error("Please fill in address fields first");
      return;
    }
    // Open location modal - user can search for the address or pick on map
    setIsLocationModalOpen(true);
  }, [street, city, state, pincode, error]);

  // Note: Auto-geocoding removed - user can use "Pick Location" button to set coordinates

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dbUser?._id) {
      error("User not found. Please sign in again.");
      return;
    }

    // Check if shop exists - use existingShops array directly to avoid stale state
    const shopExists = existingShops && Array.isArray(existingShops) && existingShops.length > 0;
    const currentShop = shopExists ? existingShops[0] : existingShop;
    const hasCategories = currentShop?.categories && currentShop.categories.length > 0;

    // If editing categories only OR shop exists without categories, handle category update
    if ((isEditCategoriesOnly || (currentShop && !hasCategories)) && currentShop) {
      if (selectedCategories.length === 0) {
        error("Please select at least one category");
        return;
      }
      try {
        setSubmitting(true);
        await updateShop({
          id: currentShop._id,
          categories: selectedCategories,
        });
        success("Categories updated successfully!");
        setIsEditCategoriesOnly(false);
        // Reload shop data - the query will automatically refetch
        return;
      } catch (err: any) {
        error(err.message || "Failed to update categories");
        return;
      } finally {
        setSubmitting(false);
      }
    }

    // For all other cases, validate full form
    if (!shopName.trim()) {
      error("Shop name is required");
      return;
    }

    if (!street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      error("Please fill in all address fields");
      return;
    }

    if (!phone.trim()) {
      error("Contact phone is required");
      return;
    }

    try {
      setSubmitting(true);

      // Build business hours object
      const businessHoursObj: any = {};
      Object.entries(businessHours).forEach(([day, hours]) => {
        if (hours.enabled) {
          businessHoursObj[day] = {
            open: hours.open,
            close: hours.close,
          };
        }
      });

      // ALWAYS check if shop exists first - prevent duplicate creation
      if (currentShop) {
        // Shop exists - always update, never create
        if (isEditMode) {
          // Full update mode
          await updateShop({
            id: currentShop._id,
            name: shopName.trim(),
            description: description.trim() || undefined,
            categories: selectedCategories.length > 0 ? selectedCategories : [],
            logo_url: shopImage || undefined,
            address: {
              street: street.trim(),
              city: city.trim(),
              state: state.trim(),
              pincode: pincode.trim(),
              coordinates:
                latitude && longitude
                  ? { lat: latitude, lng: longitude }
                  : undefined,
            },
            contact: {
              phone: phone.trim(),
              email: email.trim() || undefined,
            },
            business_hours:
              Object.keys(businessHoursObj).length > 0
                ? businessHoursObj
                : undefined,
          });
          success("Shop updated successfully!");
          setIsEditMode(false);
        } else {
          // Update categories only (when shop exists but no categories or updating from category form)
          await updateShop({
            id: currentShop._id,
            categories: selectedCategories.length > 0 ? selectedCategories : [],
          });
          success("Categories updated successfully!");
        }
        // The query will automatically refetch and update the UI
      } else {
        // No shop exists - create new shop
        await createShop({
          name: shopName.trim(),
          description: description.trim() || undefined,
          owner_id: dbUser._id,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          logo_url: shopImage || undefined,
          address: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            coordinates:
              latitude && longitude
                ? { lat: latitude, lng: longitude }
                : undefined,
          },
          contact: {
            phone: phone.trim(),
            email: email.trim() || undefined,
          },
          business_hours:
            Object.keys(businessHoursObj).length > 0
              ? businessHoursObj
              : undefined,
        });

        success("Shop created successfully!");
        // Wait a moment for the query to refetch, then check if we need to show category selection
        setTimeout(() => {
          // The component will automatically show category selection if needed
          // due to the useEffect that watches existingShops
        }, 500);
      }
    } catch (err: any) {
      console.error("Shop save error:", err);
      error(err?.message || "Failed to save shop. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !dbUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  if (registration === undefined || dbUser === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  if (registration?.status !== "approved") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Registration Not Approved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please complete your registration and wait for approval before creating a shop.
            </p>
            <Button asChild>
              <a href="/shopkeeper/registration">Go to Registration</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (existingShops === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  // Check if shop exists and has all data
  const shopExists = existingShop && existingShop._id;
  const hasCategories = existingShop?.categories && existingShop.categories.length > 0;
  // Check if shop has all required data (use existing shop data if form fields are empty)
  const hasAllData = shopExists && (
    (shopName || existingShop.name) &&
    (street || existingShop.address?.street) &&
    (city || existingShop.address?.city) &&
    (state || existingShop.address?.state) &&
    (pincode || existingShop.address?.pincode) &&
    (phone || existingShop.contact?.phone)
  );

  // If shop exists but no categories selected, or editing categories only, show category selection form
  if ((shopExists && !hasCategories && !isEditMode) || (shopExists && isEditCategoriesOnly && !isEditMode)) {
    return (
      <div className="min-h-screen bg-linear-to-b from-muted/60 via-background to-background py-8 text-foreground transition-colors dark:from-muted/30 dark:via-background dark:to-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-2">
              {isEditCategoriesOnly ? "Edit Shop Categories" : "Select Shop Categories"}
            </h1>
            <p className="text-muted-foreground">
              {isEditCategoriesOnly
                ? "Update the categories for your shop"
                : "Please select at least one category for your shop"}
            </p>
          </div>

          <Card className="border border-border/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Shop Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Select the categories your shop specializes in. Customers will find your shop when browsing these categories.
                  </p>
                  {categories === undefined ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading categories...
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-border rounded-lg bg-muted/30">
                      {categories.map((category) => {
                        const isSelected = selectedCategories.includes(category._id);
                        return (
                          <div
                            key={category._id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`category-${category._id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCategories([...selectedCategories, category._id]);
                                } else {
                                  setSelectedCategories(
                                    selectedCategories.filter((id) => id !== category._id)
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`category-${category._id}`}
                              className="text-sm font-normal cursor-pointer text-foreground"
                            >
                              {category.name}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-border rounded-lg bg-muted/30 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Tag className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">
                          No categories available
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Categories need to be set up in the system.
                        </p>
                        <Button
                          onClick={async () => {
                            try {
                              setSubmitting(true);
                              const result = await seedCategories();
                              if (result.count > 0) {
                                success(`Successfully created ${result.count} default categories!`);
                              } else {
                                info("Categories already exist in the system.");
                              }
                            } catch (err: any) {
                              error(err.message || "Failed to create categories");
                            } finally {
                              setSubmitting(false);
                            }
                          }}
                          disabled={isSubmitting}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating Categories...
                            </>
                          ) : (
                            <>
                              <Tag className="h-4 w-4 mr-2" />
                              Create Default Categories
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedCategories.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"} selected
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <Separator className="bg-border" />
                <div className="flex gap-3 pt-2">
                  {isEditCategoriesOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-border hover:bg-muted"
                      onClick={() => {
                        setIsEditCategoriesOnly(false);
                        // Reload shop data
                        if (existingShops && Array.isArray(existingShops) && existingShops.length > 0) {
                          const shop = existingShops[0];
                          setExistingShop(shop);
                          setSelectedCategories(shop.categories || []);
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className={`${isEditCategoriesOnly ? "flex-1" : "w-full"} bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={
                      isSubmitting ||
                      Boolean(categories && categories.length > 0 && selectedCategories.length === 0)
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {isEditCategoriesOnly ? "Update Categories" : "Save Categories"}
                      </>
                    )}
                  </Button>
                </div>
                {categories && categories.length > 0 && selectedCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Please select at least one category to continue
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If shop exists with all data, show summary view
  if (shopExists && hasAllData && hasCategories && !isEditMode) {
    const getCategoryNames = (): string[] => {
      if (!categories || !existingShop.categories) return [];
      return existingShop.categories
        .map((catId: Id<"categories">) => categories.find((c) => c._id === catId)?.name)
        .filter((name: string | undefined): name is string => Boolean(name));
    };

    return (
      <div className="min-h-screen bg-linear-to-b from-muted/60 via-background to-background py-8 text-foreground transition-colors dark:from-muted/30 dark:via-background dark:to-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-2">
              Shop Profile
            </h1>
            <p className="text-muted-foreground">
              Your shop information and details
            </p>
          </div>

          <Card className="border border-border/80 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Store className="h-5 w-5 text-primary" />
                Shop Information
              </CardTitle>
              <Button
                onClick={() => setIsEditMode(true)}
                variant="default"
                size="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm flex items-center gap-2 min-w-[120px]"
              >
                <Edit className="h-4 w-4" />
                Edit Shop
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Name */}
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Owner Name</p>
                  <p className="text-base font-semibold text-foreground">{dbUser?.name || "N/A"}</p>
                </div>
              </div>

              {/* Shop Name */}
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Shop Name</p>
                  <p className="text-base font-semibold text-foreground">{shopName || existingShop.name}</p>
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                  <p className="text-base font-semibold text-foreground">
                    {street || existingShop.address?.street}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {city || existingShop.address?.city}, {state || existingShop.address?.state} - {pincode || existingShop.address?.pincode}
                  </p>
                  {(latitude && longitude) || existingShop.address?.coordinates ? (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Map className="h-3 w-3" />
                      Coordinates: {latitude || existingShop.address?.coordinates?.lat}, {longitude || existingShop.address?.coordinates?.lng}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Categories */}
              {hasCategories && (
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Shop Categories</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditCategoriesOnly(true)}
                        className="h-8 px-3 text-xs border-border hover:bg-muted hover:border-primary/50 flex items-center gap-1.5"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit Categories
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getCategoryNames().map((catName: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20"
                        >
                          {catName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Contact</p>
                  <p className="text-base font-semibold text-foreground">{phone || existingShop.contact?.phone}</p>
                  {email && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {email}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/60 via-background to-background py-8 text-foreground transition-colors dark:from-muted/30 dark:via-background dark:to-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-2">
            {isEditMode ? "Edit Your Shop" : "Create Your Shop"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update your shop profile information" : "Set up your shop profile to start adding products and receiving orders"}
          </p>
        </div>

        <Card className="border border-border/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Shop Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="shopName">
                  Shop Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g., Fresh Grocery Store"
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your shop..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Shop Image/Logo */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  Shop Logo/Image (Optional)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Upload a logo or image for your shop. This will be displayed to customers.
                </p>
                <ImageUpload
                  images={shopImage ? [shopImage] : []}
                  onChange={(images: string[]) => setShopImage(images.length > 0 ? images[0] : "")}
                  maxImages={1}
                />
              </div>

              {/* Shop Categories */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Shop Categories <span className="text-muted-foreground text-sm font-normal">(Select all that apply)</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select the categories your shop specializes in. Customers will find your shop when browsing these categories.
                </p>
                {categories === undefined ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading categories...
                  </div>
                ) : categories && categories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-border rounded-lg bg-muted/30">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category._id);
                      return (
                        <div
                          key={category._id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`category-${category._id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category._id]);
                              } else {
                                setSelectedCategories(
                                  selectedCategories.filter((id) => id !== category._id)
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`category-${category._id}`}
                            className="text-sm font-normal cursor-pointer text-foreground"
                          >
                            {category.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-border rounded-lg bg-muted/30 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Tag className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        No categories available
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Please contact support to add categories to the system.
                      </p>
                    </div>
                  </div>
                )}
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"} selected
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Shop Address
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Pick Location
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="123 Main Street"
                    required
                    className="bg-background"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      required
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">
                    Pincode <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400001"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="bg-background"
                  />
                </div>

                {/* Location Coordinates & Map */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Shop Location on Map
                    </Label>
                    {latitude && longitude ? (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location set
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGeocodeAddress}
                        disabled={isGeocoding}
                        className="text-xs"
                      >
                        {isGeocoding ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Finding...
                          </>
                        ) : (
                          <>
                            <Map className="h-3 w-3 mr-1" />
                            Get Location
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {latitude && longitude && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </div>
                      <div className="w-full h-64 rounded-lg overflow-hidden border border-border bg-muted/30">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`}
                          title="Shop Location"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <p className="text-muted-foreground">
                          This map shows your shop location. Customers can use this to find your shop.
                        </p>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View larger map
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Hours */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Business Hours (Optional)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set your shop&apos;s opening and closing times for each day
                </p>

                <div className="space-y-3">
                  {[
                    { key: "monday", label: "Monday" },
                    { key: "tuesday", label: "Tuesday" },
                    { key: "wednesday", label: "Wednesday" },
                    { key: "thursday", label: "Thursday" },
                    { key: "friday", label: "Friday" },
                    { key: "saturday", label: "Saturday" },
                    { key: "sunday", label: "Sunday" },
                  ].map((day) => (
                    <div
                      key={day.key}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30"
                    >
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <input
                          type="checkbox"
                          checked={businessHours[day.key]?.enabled || false}
                          onChange={(e) =>
                            setBusinessHours((prev) => ({
                              ...prev,
                              [day.key]: {
                                ...(prev[day.key] || { open: "09:00", close: "18:00", enabled: false }),
                                enabled: e.target.checked,
                              },
                            }))
                          }
                          className="rounded border-input"
                        />
                        <Label className="text-sm font-medium cursor-pointer">
                          {day.label}
                        </Label>
                      </div>
                      {businessHours[day.key]?.enabled && (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={businessHours[day.key]?.open || "09:00"}
                            onChange={(e) =>
                              setBusinessHours((prev) => ({
                                ...prev,
                                [day.key]: {
                                  ...(prev[day.key] || { open: "09:00", close: "18:00", enabled: true }),
                                  open: e.target.value,
                                },
                              }))
                            }
                            className="bg-background text-sm"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={businessHours[day.key]?.close || "18:00"}
                            onChange={(e) =>
                              setBusinessHours((prev) => ({
                                ...prev,
                                [day.key]: {
                                  ...(prev[day.key] || { open: "09:00", close: "18:00", enabled: true }),
                                  close: e.target.value,
                                },
                              }))
                            }
                            className="bg-background text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shop@example.com"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className={`flex gap-4 pt-4 ${isEditMode ? "" : "flex-col"}`}>
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditMode(false);
                      // Reload shop data
                      if (existingShops && Array.isArray(existingShops) && existingShops.length > 0) {
                        const shop = existingShops[0];
                        setExistingShop(shop);
                        setShopName(shop.name || "");
                        setDescription(shop.description || "");
                        setStreet(shop.address?.street || "");
                        setCity(shop.address?.city || "");
                        setState(shop.address?.state || "");
                        setPincode(shop.address?.pincode || "");
                        setPhone(shop.contact?.phone || "");
                        setEmail(shop.contact?.email || "");
                        setLatitude(shop.address?.coordinates?.lat || null);
                        setLongitude(shop.address?.coordinates?.lng || null);
                        setSelectedCategories(shop.categories || []);
                        setShopImage(shop.logo_url || "");
                      }
                    }}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${isEditMode ? "flex-1" : "w-full"} bg-primary hover:bg-primary/90 text-primary-foreground`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {isEditMode ? "Update Shop" : "Create Shop"}
                      {!isEditMode && <ArrowRight className="h-4 w-4 ml-2" />}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
}

