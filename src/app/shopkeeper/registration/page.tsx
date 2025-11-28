"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import {
  Building2,
  CreditCard,
  FileText,
  MapPin,
  Package,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ShopkeeperRegistrationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error, info } = useToast();
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

  if (user === null || registration === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Shopkeeper Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Please sign in to continue your registration.
            </p>
          </CardContent>
        </Card>
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
            icon: Clock,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/20",
          };
        case "reviewing":
          return {
            title: "Under Review",
            message: "Our team is currently reviewing your application. This typically takes 1-2 business days.",
            icon: Clock,
            color: "text-amber-600",
            bgColor: "bg-amber-100 dark:bg-amber-900/20",
          };
        case "approved":
          return {
            title: "Registration Approved! 🎉",
            message: "Congratulations! Your shopkeeper account has been approved. You can now create your shop and start adding products.",
            icon: CheckCircle2,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/20",
          };
        case "rejected":
          return {
            title: "Registration Needs Attention",
            message: "Your application requires some corrections. Please contact support for more details.",
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-100 dark:bg-red-900/20",
          };
        default:
          return null;
      }
    };

    const statusInfo = getStatusMessage();
    if (statusInfo) {
      const StatusIcon = statusInfo.icon;
      return (
        <div className="min-h-screen bg-linear-to-b from-muted/60 via-background to-background py-8 text-foreground transition-colors dark:from-muted/30 dark:via-background dark:to-background">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="border border-border/80 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusInfo.bgColor}`}
                  >
                    <StatusIcon className={`h-10 w-10 ${statusInfo.color}`} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{statusInfo.title}</h1>
                    <p className="text-muted-foreground">{statusInfo.message}</p>
                  </div>
                  <div className="pt-4 flex gap-3 justify-center">
                    {registration.status === "approved" && (
                      <Button asChild>
                        <a href="/shopkeeper/shop/create">Create Your Shop</a>
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => router.push("/")}>
                      Back to Home
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  }

  const onSubmit = async (submit: boolean) => {
    if (!user) return;

    // Basic validation
    if (!pan.trim()) {
      error("PAN is required");
      return;
    }
    if (!bankAccountHolder.trim() || !bankAccountNumber.trim() || !bankIfsc.trim()) {
      error("All bank details are required");
      return;
    }
    if (!street.trim() || !city.trim() || !stateValue.trim() || !pincode.trim()) {
      error("Complete business address is required");
      return;
    }
    if (!idNumber.trim()) {
      error("Identity document number is required");
      return;
    }

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
        success("Registration submitted successfully! We will review and notify you.");
        setTimeout(() => {
          router.replace("/");
        }, 2000);
      } else {
        info("Draft saved successfully");
      }
    } catch (err) {
      console.error(err);
      error("Failed to save registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/60 via-background to-background py-8 text-foreground transition-colors dark:from-muted/30 dark:via-background dark:to-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-2">
            Shopkeeper Registration
          </h1>
          <p className="text-muted-foreground">
            Provide required details to complete onboarding. GSTIN optional for books-only sellers.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(false);
          }}
          className="space-y-6"
        >
          {/* Tax & Identification */}
          <Card className="border border-border/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Tax & Identification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pan">
                    PAN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pan"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    required
                    maxLength={10}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN (Optional)</Label>
                  <Input
                    id="gstin"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="15-digit GSTIN"
                    className="bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="border border-border/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">
                    Account Holder <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountHolder"
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                    placeholder="Account holder name"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">
                    Account Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountNumber"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Account number"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc">
                    IFSC Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ifsc"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="IFSC0001234"
                    required
                    maxLength={11}
                    className="bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Address & Identity */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-border/80 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Business Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Street address"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
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
                      value={stateValue}
                      onChange={(e) => setStateValue(e.target.value)}
                      placeholder="State"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">
                      Pincode <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Pincode"
                      required
                      pattern="[0-9]{6}"
                      maxLength={6}
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Identity Proof
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idType">
                    Document Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={idType} onValueChange={(value) => setIdType(value as typeof idType)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="voter_id">Voter ID</SelectItem>
                      <SelectItem value="driver_license">Driver&apos;s License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">
                    Document Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Document number"
                    required
                    className="bg-background"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Info & Pickup Address */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-border/80 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bizType">
                    Business Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={bizType} onValueChange={(value) => setBizType(value as typeof bizType)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="proprietorship">Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bizName">Business/Shop Name (Optional)</Label>
                  <Input
                    id="bizName"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="Business or shop name"
                    className="bg-background"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Pickup Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupStreet">Street Address</Label>
                  <Input
                    id="pickupStreet"
                    value={pickupStreet}
                    onChange={(e) => setPickupStreet(e.target.value)}
                    placeholder="Pickup street address"
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="pickupCity">City</Label>
                    <Input
                      id="pickupCity"
                      value={pickupCity}
                      onChange={(e) => setPickupCity(e.target.value)}
                      placeholder="City"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupState">State</Label>
                    <Input
                      id="pickupState"
                      value={pickupState}
                      onChange={(e) => setPickupState(e.target.value)}
                      placeholder="State"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupPincode">Pincode</Label>
                    <Input
                      id="pickupPincode"
                      value={pickupPincode}
                      onChange={(e) => setPickupPincode(e.target.value)}
                      placeholder="Pincode"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* First Product (Optional) */}
          <Card className="border border-border/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                First Product (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={firstProductName}
                    onChange={(e) => setFirstProductName(e.target.value)}
                    placeholder="Product name"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productUrl">Product URL</Label>
                  <Input
                    id="productUrl"
                    value={firstProductUrl}
                    onChange={(e) => setFirstProductUrl(e.target.value)}
                    placeholder="https://example.com/product"
                    type="url"
                    className="bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onSubmit(false)}
              className="min-w-[120px]"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={() => onSubmit(true)}
              className="min-w-[160px] bg-primary hover:bg-primary/90"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
