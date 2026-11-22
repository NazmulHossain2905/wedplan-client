"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { CATEGORIES } from "@/data/categories";
import { api, ApiError } from "@/lib/api";
import { FREE_PLAN } from "@/lib/constants";
import { fileToDataUrl } from "@/lib/helpers";
import { validateService } from "@/lib/validations";
import type { Service, ServiceInput } from "@/types";
import { ImagePlus, Info, LinkIcon, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const COMMON_LOCATIONS = [
  "Dhaka",
  "Gulshan, Dhaka",
  "Banani, Dhaka",
  "Dhanmondi, Dhaka",
  "Uttara, Dhaka",
  "Chattogram",
  "Sylhet",
  "Cox's Bazar",
  "Khulna",
  "Rajshahi",
];

interface ServiceFormProps {
  mode: "create" | "edit";
  service?: Service;
}

export function ServiceForm({ mode, service }: ServiceFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const serviceNameRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [serviceName, setServiceName] = useState(service?.serviceName ?? "");
  const [category, setCategory] = useState(service?.category ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [price, setPrice] = useState(service ? String(service.price) : "");
  const [location, setLocation] = useState(service?.location ?? "");
  const [images, setImages] = useState<string[]>(service?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(service?.isAvailable ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // On the Add Service page, put the cursor in the first field and bring the
  // form into view. Focus first without scrolling so the explicit scroll
  // lands on the field area instead of the browser's minimal scroll.
  // Edit mode leaves the user's scroll position untouched.
  useEffect(() => {
    if (mode !== "create") return;
    // Defer one frame so Next.js finishes its navigation scroll-to-top first.
    const frame = requestAnimationFrame(() => {
      const input = serviceNameRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      input.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  // Warn before leaving with unsaved edits (values differ from the saved service).
  const dirty = useMemo(() => {
    if (mode === "create") {
      return Boolean(
        serviceName.trim() ||
          description.trim() ||
          price ||
          location.trim() ||
          images.length,
      );
    }
    if (!service) return false;
    return (
      serviceName !== service.serviceName ||
      category !== service.category ||
      description !== service.description ||
      String(price) !== String(service.price) ||
      location !== service.location ||
      isAvailable !== service.isAvailable ||
      JSON.stringify(images) !== JSON.stringify(service.images)
    );
  }, [
    mode,
    service,
    serviceName,
    category,
    description,
    price,
    location,
    isAvailable,
    images,
  ]);

  useEffect(() => {
    if (!dirty || submitting) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, submitting]);

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      toast.error(
        "Please enter a valid image URL (starting with http:// or https://).",
      );
      return;
    }
    if (images.includes(url)) {
      toast.error("This image URL is already added.");
      return;
    }
    setImages((prev) => [...prev, url]);
    setImageUrl("");
    setErrors((p) => ({ ...p, images: "" }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const maxImages = 6;
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error("You can add up to 6 images per service.");
      return;
    }

    const chosen = Array.from(files);
    const accepted = chosen.slice(0, remaining);
    if (chosen.length > remaining) {
      toast.error(`Only ${remaining} more image(s) can be added (6 maximum).`);
    }

    // Validate every selected file before uploading any of them.
    const valid: File[] = [];
    for (const file of accepted) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name}: please choose an image file.`);
      } else if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: image is too large (max 5 MB).`);
      } else {
        valid.push(file);
      }
    }
    if (valid.length === 0) return;

    setUploading(true);
    const firstIndex = images.length;

    try {
      // Show local previews immediately so the upload feels instant.
      const previews = await Promise.all(valid.map(fileToDataUrl));
      setImages((prev) => [...prev, ...previews]);
      setErrors((p) => ({ ...p, images: "" }));

      // Upload all selected images together; each result replaces its preview.
      const results = await Promise.allSettled(
        valid.map((file) => api.uploadImage(file)),
      );

      const failed = results.flatMap((result, i) =>
        result.status === "rejected" ? [firstIndex + i] : [],
      );
      setImages((prev) => {
        const next = [...prev];
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            next[firstIndex + i] = result.value.url;
          }
        });
        return next.filter((_, i) => !failed.includes(i));
      });

      // Only errors are announced — a successful upload shows its thumbnail.
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          toast.error(
            result.reason instanceof ApiError
              ? result.reason.message
              : `Could not upload ${valid[i].name}. Try a URL instead.`,
          );
        }
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    // Enter key can submit the form even while the button is disabled.
    if (!user || uploading || submitting) return;
    const validationError = validateService({
      serviceName,
      category,
      description,
      price,
      location,
      images,
    });
    if (validationError) {
      toast.error(validationError);
      setErrors({
        serviceName:
          serviceName.trim().length < 3
            ? "Service name must be at least 3 characters."
            : "",
        category: !category ? "Please select a category." : "",
        description:
          description.trim().length < 20
            ? "Description must be at least 20 characters."
            : "",
        price: !(Number(price) > 0)
          ? "Enter a valid price greater than 0."
          : "",
        location: !location.trim() ? "Location is required." : "",
        images: images.length === 0 ? "Add at least one image." : "",
      });
      return;
    }

    const input: ServiceInput = {
      serviceName,
      category,
      description,
      price: Number(price),
      location,
      images,
      isAvailable,
    };

    setSubmitting(true);
    try {
      if (mode === "create") {
        await api.createService(input as unknown as Record<string, unknown>);
      } else {
        await api.updateService(
          service!.id,
          input as unknown as Record<string, unknown>,
        );
      }
      toast.success(
        mode === "create"
          ? "Service submitted for review!"
          : "Service updated successfully.",
        {
          description:
            mode === "create"
              ? "An administrator will review your service before it goes live."
              : undefined,
        },
      );
      router.push("/dashboard/vendor/services");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not save the service.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-6"
      noValidate
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="service-name">
              Service Name <span className="text-destructive">*</span>
            </Label>
            <Input
              ref={serviceNameRef}
              id="service-name"
              placeholder="e.g. Signature Wedding Photography"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              aria-invalid={Boolean(errors.serviceName)}
              maxLength={90}
            />
            {errors.serviceName ? (
              <p className="text-xs text-destructive">{errors.serviceName}</p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="service-category">
                Service Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v)}>
                <SelectTrigger
                  id="service-category"
                  className="w-full"
                  aria-invalid={Boolean(errors.category)}
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category ? (
                <p className="text-xs text-destructive">{errors.category}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-price">
                Price (৳ BDT) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="service-price"
                type="number"
                min={0}
                step="any"
                placeholder="e.g. 45000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={Boolean(errors.price)}
              />
              {errors.price ? (
                <p className="text-xs text-destructive">{errors.price}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-location">
              Location <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-location"
              list="common-locations"
              placeholder="e.g. Gulshan, Dhaka"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-invalid={Boolean(errors.location)}
              maxLength={80}
            />
            <datalist id="common-locations">
              {COMMON_LOCATIONS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
            {errors.location ? (
              <p className="text-xs text-destructive">{errors.location}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="service-description"
              placeholder="Describe your service, what's included, and what makes it special…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              aria-invalid={Boolean(errors.description)}
              maxLength={1500}
            />
            <div className="flex items-center justify-between">
              {errors.description ? (
                <p className="text-xs text-destructive">{errors.description}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Minimum 20 characters
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {description.length}/1500
              </p>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <Label>
              Service Images <span className="text-destructive">*</span>
            </Label>
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {images.map((src, i) => (
                  <div
                    key={src.slice(0, 60) + i}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border"
                  >
                    <img
                      src={src}
                      alt={`Service image ${i + 1}`}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      aria-label={`Remove image ${i + 1}`}
                      className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <X aria-hidden className="size-3.5" />
                    </button>
                    {i === 0 ? (
                      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-burgundy/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Cover
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <LinkIcon
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Paste an image URL…"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="pl-9"
                  aria-label="Image URL"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addImageUrl}
                className="shrink-0"
              >
                Add URL
              </Button>
              <Label
                htmlFor="service-image-upload"
                className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent"
              >
                <ImagePlus aria-hidden className="size-4" />{" "}
                {uploading ? "Uploading…" : "Upload"}
              </Label>
              <input
                id="service-image-upload"
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                className="sr-only"
                onChange={(e) => {
                  void handleFileUpload(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            {errors.images ? (
              <p className="text-xs text-destructive">{errors.images}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Add up to 6 images — select several files at once. The first one
              becomes the cover photo. Uploads are hosted on ImgBB (or a
              compatible image host configured on the server).
            </p>
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label
                  htmlFor="availability-switch"
                  className="text-sm font-medium"
                >
                  Service Availability
                </Label>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Inactive services are hidden from customers but not deleted.
                </p>
              </div>
              <Switch
                id="availability-switch"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-rose-soft bg-rose-tint/50 p-5">
            <div className="flex items-start gap-2.5">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-rose" />
              <div className="text-xs leading-relaxed text-muted-foreground">
                <p className="mb-1 font-semibold text-burgundy">
                  Review process
                </p>
                {mode === "create" ? (
                  <p>
                    New services are submitted as <strong>Pending</strong> and
                    become publicly visible once an administrator approves them.
                  </p>
                ) : (
                  <p>
                    Editing keeps the current approval status. Status:{" "}
                    <strong className="capitalize">{service?.status}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {user?.subscriptionPlan === "free" ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-semibold text-amber-900">
                Free plan reminder
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800/85">
                Free vendors can keep up to {FREE_PLAN.maxActiveServices} active
                (approved + available) services. Toggle availability off to free
                a slot.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2.5">
            <Button
              type="submit"
              size="lg"
              disabled={submitting || uploading}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" /> Saving…
                </>
              ) : uploading ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" />{" "}
                  Uploading images…
                </>
              ) : mode === "create" ? (
                "Submit for Review"
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </aside>
      </div>
    </form>
  );
}
