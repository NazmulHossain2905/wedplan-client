"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { PremiumBadge, RoleBadge } from "@/components/shared/badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { fileToDataUrl, formatDate, initials } from "@/lib/helpers";
import {
  Crown,
  ImagePlus,
  Loader2,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { SyntheticEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  return (
    <DashboardPage role="customer">
      <ProfileSettings />
    </DashboardPage>
  );
}

function ProfileSettings() {
  const { user, refresh } = useAuth();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync form state with the live user record.
  useEffect(() => {
    if (user) {
      setName(user.name);
      setBusinessName(user.businessName ?? "");
      setLocation(user.location ?? "");
      setPhone(user.phone ?? "");
      setBio(user.bio ?? "");
      setAvatar(user.image);
      setAvatarFile(null);
    }
  }, [user]);

  if (!user) return null;

  const isVendor = user.role === "vendor";
  const dirty =
    name !== user.name ||
    avatar !== user.image ||
    (isVendor && businessName !== (user.businessName ?? "")) ||
    location !== (user.location ?? "") ||
    phone !== (user.phone ?? "") ||
    bio !== (user.bio ?? "");

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large (max 5 MB).");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatar(dataUrl);
      setAvatarFile(file);
      toast.success("New profile image ready — save to apply.");
    } catch {
      toast.error("Could not read the image file.");
    }
  };

  const handleReset = () => {
    setName(user.name);
    setBusinessName(user.businessName ?? "");
    setLocation(user.location ?? "");
    setPhone(user.phone ?? "");
    setBio(user.bio ?? "");
    setAvatar(user.image);
    setAvatarFile(null);
    toast.info("Changes reset.");
  };

  const handleSave = async (e: SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageToSend: string | undefined;
      if (avatarFile) {
        // Upload the new image first, then persist the hosted URL.
        const { url } = await api.uploadImage(avatarFile);
        imageToSend = url;
      }
      await api.updateProfile({
        name,
        image: imageToSend ?? (avatar !== user.image ? avatar : undefined),
        businessName: isVendor ? businessName : undefined,
        location,
        phone,
        bio,
      });
      setAvatarFile(null);
      await refresh();
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal information. Your role and subscription are
          managed by the platform.
        </p>
      </div>

      {/* Read-only account summary */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 border-2 border-rose-soft/60">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-rose-tint text-burgundy">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role} />
              {isVendor ? (
                user.subscriptionPlan === "premium" ? (
                  <PremiumBadge />
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                    Free Plan
                  </span>
                )
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Member since {formatDate(user.joinedAt)}
              {isVendor && user.subscriptionExpiresAt
                ? ` · Premium renews ${formatDate(user.subscriptionExpiresAt)}`
                : ""}
            </p>
          </div>
        </div>
        <p className="max-w-56 text-xs leading-relaxed text-muted-foreground">
          Role and subscription fields are read-only — they change only through
          platform flows (registration, verified payments, or admin actions).
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSave(e)}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8"
      >
        {/* Avatar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-20 border-2 border-rose-soft/60">
            {avatar ? <AvatarImage src={avatar} alt="Profile preview" /> : null}
            <AvatarFallback className="bg-rose-tint text-2xl text-burgundy">
              {name ? (
                initials(name)
              ) : (
                <ImagePlus aria-hidden className="size-6" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap gap-2">
            <Label
              htmlFor="profile-avatar-upload"
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent"
            >
              <ImagePlus aria-hidden className="size-4" />
              {avatar && avatar !== user.image
                ? "Change image"
                : "Upload new image"}
            </Label>
            {avatar !== user.image ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:bg-red-50"
                onClick={() => {
                  setAvatar(user.image);
                  setAvatarFile(null);
                }}
              >
                <Trash2 aria-hidden className="size-4" /> Revert
              </Button>
            ) : null}
            <input
              id="profile-avatar-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void handleImageUpload(e.target.files?.[0])}
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email (read-only)</Label>
            <Input
              id="profile-email"
              value={user.email}
              readOnly
              disabled
              className="cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Email changes require verification and are disabled in the demo.
            </p>
          </div>
          {isVendor ? (
            <div className="space-y-2">
              <Label htmlFor="profile-business">Business Name</Label>
              <Input
                id="profile-business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                maxLength={80}
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              placeholder="e.g. +880 17xx-xxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={24}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profile-location">Location</Label>
            <Input
              id="profile-location"
              placeholder="e.g. Gulshan, Dhaka"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={80}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              placeholder="Tell couples a little about yourself…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={400}
            />
            <p className="text-right text-xs text-muted-foreground">
              {bio.length}/400
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2.5 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={handleReset}
            disabled={saving || !dirty}
          >
            <RotateCcw aria-hidden className="size-4" /> Reset Changes
          </Button>
          <Button type="submit" className="gap-1.5" disabled={saving || !dirty}>
            {saving ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save aria-hidden className="size-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
        {!dirty ? (
          <p className="text-center text-xs text-muted-foreground">
            No pending changes — edit a field to enable saving.
          </p>
        ) : null}
      </form>

      {isVendor && user.subscriptionPlan === "free" ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-rose-soft bg-rose-tint/50 p-5 text-sm text-muted-foreground">
          <Crown aria-hidden className="size-5 shrink-0 text-[#c9a227]" />
          <p>
            Looking to publish more services?{" "}
            <a
              href="/dashboard/vendor/subscription"
              className="font-medium text-burgundy hover:underline"
            >
              Upgrade to Premium
            </a>{" "}
            for unlimited active listings.
          </p>
        </div>
      ) : null}
    </div>
  );
}
