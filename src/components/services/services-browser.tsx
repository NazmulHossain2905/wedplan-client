"use client";

import {
  ServiceCard,
  ServiceCardSkeleton,
} from "@/components/services/service-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CATEGORIES } from "@/data/categories";
import { api, type ServiceWithVendor } from "@/lib/api";
import { debounce } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import type { SortOption } from "@/types";
import {
  ChevronDown,
  FilterX,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

const PAGE_SIZE = 9;
const LOAD_STEP = 6;

const PRICE_RANGES = [
  { value: "all", label: "Any price" },
  { value: "under-25k", label: "Under ৳25,000" },
  { value: "25k-75k", label: "৳25,000 – ৳75,000" },
  { value: "75k-150k", label: "৳75,000 – ৳150,000" },
  { value: "over-150k", label: "৳150,000+" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function matchesPrice(price: number, range: string): boolean {
  switch (range) {
    case "under-25k":
      return price < 25000;
    case "25k-75k":
      return price >= 25000 && price <= 75000;
    case "75k-150k":
      return price > 75000 && price <= 150000;
    case "over-150k":
      return price > 150000;
    default:
      return true;
  }
}

export function ServicesBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get("category") ?? "all";
  const initialVendor = searchParams.get("vendor") ?? "all";

  const [searchInput, setSearchInput] = React.useState(
    searchParams.get("q") ?? "",
  );
  const [debouncedSearch, setDebouncedSearch] = React.useState(
    searchParams.get("q") ?? "",
  );
  const [category, setCategory] = React.useState(initialCategory);
  const [location, setLocation] = React.useState(
    searchParams.get("location") ?? "all",
  );
  const [priceRange, setPriceRange] = React.useState("all");
  const [sort, setSort] = React.useState<SortOption>(
    (searchParams.get("sort") as SortOption) ?? "recommended",
  );
  const [vendorFilter, setVendorFilter] = React.useState(initialVendor);
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  // Keep the URL shareable: reflect active filters in the query string without
  // triggering a navigation.
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
    if (category !== "all") params.set("category", category);
    if (location !== "all") params.set("location", location);
    if (sort !== "recommended") params.set("sort", sort);
    if (vendorFilter !== "all") params.set("vendor", vendorFilter);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/services?${qs}` : "/services");
  }, [debouncedSearch, category, location, sort, vendorFilter]);

  // Keyboard shortcut: "/" focuses the search box (skipped while typing).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        document.getElementById("service-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounce the search box so the API is not hit on every keystroke.
  const setDebounced = React.useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 300),
    [],
  );

  // Keep filters in sync when arriving from category / vendor links.
  React.useEffect(() => {
    setCategory(searchParams.get("category") ?? "all");
    setVendorFilter(searchParams.get("vendor") ?? "all");
  }, [searchParams]);

  React.useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [debouncedSearch, category, location, priceRange, sort, vendorFilter]);

  // Server-side search / filter / sort (only approved + active services).
  const [result, setResult] = React.useState<{
    key: string;
    services: ServiceWithVendor[];
    locations: string[];
  } | null>(null);
  const [loadError, setLoadError] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  const requestKey = `${debouncedSearch}|${category}|${location}|${sort}|${reloadKey}`;

  React.useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const data = await api.services({
          q: debouncedSearch || undefined,
          category: category !== "all" ? category : undefined,
          location: location !== "all" ? location : undefined,
          sort,
          limit: 100,
        });
        if (!cancelled) {
          setLoadError(false);
          setResult({
            key: requestKey,
            services: data.services,
            locations: data.locations,
          });
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setResult({ key: requestKey, services: [], locations: [] });
        }
      }
    }

    void loadServices();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, location, sort, requestKey]);

  const services = result?.services ?? [];
  const allLocations = result?.locations ?? [];
  const isLoading = result === null;
  const isFetching = result !== null && result.key !== requestKey;

  // Price-range and vendor filtering stay client-side refinements on the
  // already server-filtered list.
  const filtered = React.useMemo(
    () =>
      services.filter((s) => {
        if (!matchesPrice(s.price, priceRange)) return false;
        if (vendorFilter !== "all" && s.vendorId !== vendorFilter) return false;
        return true;
      }),
    [services, priceRange, vendorFilter],
  );

  const loading = isLoading;
  const visibleServices = filtered.slice(0, visible);

  const activeFilters: { key: string; label: string; onClear: () => void }[] =
    [];
  if (debouncedSearch.trim())
    activeFilters.push({
      key: "search",
      label: `“${debouncedSearch.trim()}”`,
      onClear: () => {
        setSearchInput("");
        setDebouncedSearch("");
      },
    });
  if (category !== "all")
    activeFilters.push({
      key: "category",
      label: category,
      onClear: () => setCategory("all"),
    });
  if (location !== "all")
    activeFilters.push({
      key: "location",
      label: location,
      onClear: () => setLocation("all"),
    });
  if (priceRange !== "all")
    activeFilters.push({
      key: "price",
      label:
        PRICE_RANGES.find((p) => p.value === priceRange)?.label ?? priceRange,
      onClear: () => setPriceRange("all"),
    });
  if (vendorFilter !== "all") {
    const vendor = services.find((s) => s.vendorId === vendorFilter)?.vendor;
    activeFilters.push({
      key: "vendor",
      label: vendor?.businessName ?? vendor?.name ?? "Vendor",
      onClear: () => setVendorFilter("all"),
    });
  }

  const clearAll = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setCategory("all");
    setLocation("all");
    setPriceRange("all");
    setVendorFilter("all");
    setSort("recommended");
    if (searchParams.toString()) router.replace("/services");
  };

  const filterControls = (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Location</Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full" aria-label="Filter by location">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {allLocations.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Price range</Label>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-full" aria-label="Filter by price range">
            <SelectValue placeholder="Any price" />
          </SelectTrigger>
          <SelectContent>
            {PRICE_RANGES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Browse Services</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Browse Wedding Services
          </h1>
          <span className="rounded-full bg-rose-tint px-3 py-1 text-sm font-medium text-burgundy">
            {loading
              ? "…"
              : `${filtered.length} ${filtered.length === 1 ? "service" : "services"}`}
          </span>
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Explore verified photographers, venues, decorators, caterers, and
          artists — every listing is reviewed by our team before it goes live.
        </p>
      </header>

      {/* Search + sort + mobile filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="service-search"
            type="search"
            placeholder="Search services by name or location… (press / to focus)"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setDebounced(e.target.value);
            }}
            className="h-11 pl-9"
            aria-label="Search services by name"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 sm:w-52">
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as SortOption)}
            >
              <SelectTrigger className="h-11 w-full" aria-label="Sort services">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 gap-2 lg:hidden">
                <SlidersHorizontal aria-hidden className="size-4" />
                Filters
                {activeFilters.length > 0 ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-burgundy text-[11px] font-semibold text-white">
                    {activeFilters.length}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="flex max-h-[80vh] flex-col">
              <SheetHeader className="pb-0">
                <SheetTitle className="text-left font-serif">
                  Filters
                </SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto px-4 pb-6 pt-3">
                {filterControls}
                <Button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-5 w-full"
                >
                  Show {filtered.length}{" "}
                  {filtered.length === 1 ? "result" : "results"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop filters */}
      <div className="mb-5 hidden rounded-xl border border-border bg-card p-4 shadow-xs lg:block">
        {filterControls}
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 ? (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-soft bg-rose-tint px-3 py-1 text-xs font-medium text-burgundy"
            >
              {f.label}
              <button
                type="button"
                onClick={f.onClear}
                aria-label={`Remove filter ${f.label}`}
                className="rounded-full p-0.5 transition-colors hover:bg-burgundy/10"
              >
                <X aria-hidden className="size-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <FilterX aria-hidden className="size-3.5" /> Clear all
          </button>
        </div>
      ) : null}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : loadError ? (
        <EmptyState
          icon={<LayoutGrid aria-hidden />}
          title="Couldn't load services"
          description="The marketplace is temporarily unavailable. Please try again."
          action={{
            label: "Try Again",
            onClick: () => setReloadKey((key) => key + 1),
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid aria-hidden />}
          title="No services match your filters"
          description="Try a different search term, or clear some filters to see everything the marketplace has to offer."
          action={{ label: "Clear all filters", onClick: clearAll }}
        />
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
              isFetching && "opacity-70 transition-opacity",
            )}
          >
            {visibleServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                vendor={service.vendor}
              />
            ))}
          </div>
          {visible < filtered.length ? (
            <div className="mt-10 flex flex-col items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                className="border-burgundy/30 text-burgundy hover:bg-rose-tint hover:text-burgundy"
                onClick={() => setVisible((v) => v + LOAD_STEP)}
              >
                <ChevronDown aria-hidden className="size-4" />
                Load More Services
              </Button>
              <p className={cn("text-sm text-muted-foreground")}>
                Showing {visibleServices.length} of {filtered.length} services
              </p>
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              Showing all {filtered.length}{" "}
              {filtered.length === 1 ? "service" : "services"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
