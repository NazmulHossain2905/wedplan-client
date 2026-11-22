"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { RoleBadge, UserStatusBadge } from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { formatDate, initials } from "@/lib/helpers";
import type { User } from "@/types";
import { Ban, CircleCheck, Search, ShieldOff, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  return (
    <DashboardPage>
      <AdminUsers />
    </DashboardPage>
  );
}

type AdminUser = User & {
  serviceCount: number;
  bookingCount: number;
  requestCount: number;
};

function AdminUsers() {
  const { user: admin } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const [blocking, setBlocking] = useState<AdminUser | null>(null);
  const [blockingBusy, setBlockingBusy] = useState(false);

  const [result, setResult] = useState<{
    key: string;
    users: AdminUser[];
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const searchParam = search.trim() || undefined;
  const roleParam = roleFilter !== "all" ? roleFilter : undefined;
  const requestKey = `${searchParam ?? ""}|${roleParam ?? ""}|${reloadKey}`;

  useEffect(() => {
    if (admin?.role !== "admin") return;

    let cancelled = false;

    async function loadUsers() {
      try {
        const res = await api.adminUsers({ q: searchParam, role: roleParam });
        if (!cancelled) setResult({ key: requestKey, users: res.users });
      } catch {
        if (!cancelled) setResult({ key: requestKey, users: [] });
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [admin, requestKey, searchParam, roleParam]);

  const users = result?.users ?? [];
  const isLoading = result === null;
  const isFetching = result !== null && result.key !== requestKey;

  const filtered = useMemo(
    () =>
      users
        .filter((u) => {
          if (statusFilter === "blocked" && !u.isBlocked) return false;
          if (statusFilter === "active" && u.isBlocked) return false;
          return true;
        })
        .sort(
          (a, b) =>
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
        ),
    [users, statusFilter],
  );

  const handleToggleBlock = async () => {
    if (!blocking || blockingBusy) return;
    const isBlock = !blocking.isBlocked;
    const name = blocking.name;
    setBlockingBusy(true);
    try {
      await api.adminSetUserBlocked(blocking.id, isBlock);
      setBlocking(null);
      toast.success(
        isBlock
          ? `${name} has been blocked.`
          : `${name} has been unblocked and can sign in again.`,
        {
          description: isBlock
            ? "If they are currently signed in, they will be signed out automatically."
            : undefined,
        },
      );
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not update this user.",
      );
    } finally {
      setBlockingBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Manage Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View, search, and moderate every registered account on the platform.
          Blocked users lose access to protected features immediately.
        </p>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search users by name or email"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full" aria-label="Filter by role">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="vendor">Vendors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <p
          className="flex items-center text-sm text-muted-foreground"
          aria-live="polite"
        >
          {filtered.length} of {users.length} users
        </p>
      </div>

      {/* Table */}
      {isLoading && users.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 w-full animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users aria-hidden />}
          title="No users match"
          description="Try a different search term, role, or status filter."
        />
      ) : (
        <>
          {/* Mobile: stacked cards (the table is too wide for phones) */}
          <div
            className={`space-y-3 md:hidden ${isFetching ? "opacity-60" : ""}`}
            aria-busy={isFetching}
          >
            {filtered.map((u) => (
              <article
                key={u.id}
                className={`rounded-xl border border-border bg-card p-4 shadow-xs ${
                  u.isBlocked ? "bg-red-50/40" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-10 shrink-0 border border-border">
                    <AvatarImage src={u.image} alt={u.name} />
                    <AvatarFallback className="bg-rose-tint text-xs text-burgundy">
                      {initials(u.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {u.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                  <UserStatusBadge blocked={u.isBlocked} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <RoleBadge role={u.role} />
                  <span className="text-xs text-muted-foreground">
                    Joined {formatDate(u.joinedAt)}
                  </span>
                </div>

                {u.role === "vendor" && u.businessName ? (
                  <p className="mt-1.5 truncate text-xs text-muted-foreground">
                    {u.businessName}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewing(u)}
                  >
                    View
                  </Button>
                  {u.role !== "admin" ? (
                    u.isBlocked ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setBlocking(u)}
                      >
                        <CircleCheck aria-hidden className="size-3.5" />
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => setBlocking(u)}
                      >
                        <Ban aria-hidden className="size-3.5" />
                        Block
                      </Button>
                    )
                  ) : (
                    <span className="inline-flex flex-1 items-center justify-center gap-1 text-xs text-muted-foreground">
                      <ShieldOff aria-hidden className="size-3.5" /> Protected
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Desktop: table */}
          <div
            className={`hidden overflow-x-auto rounded-xl border border-border bg-card shadow-xs transition-opacity md:block ${
              isFetching ? "opacity-60" : "opacity-100"
            }`}
            aria-busy={isFetching}
          >
            <table className="w-full min-w-[900px] text-sm">
              <caption className="sr-only">All registered users</caption>
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3.5 font-medium">
                    User
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-medium">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-medium">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-medium">
                    Business Name
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-medium">
                    Joined
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-right font-medium"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className={
                      user.isBlocked
                        ? "border-b border-border/60 bg-red-50/40 last:border-0"
                        : "border-b border-border/60 last:border-0"
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 border border-border">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback className="bg-rose-tint text-[10px] text-burgundy">
                            {initials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-52 truncate px-4 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.role === "vendor"
                        ? (user.businessName ?? "—")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusBadge blocked={user.isBlocked} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewing(user)}
                        >
                          View
                        </Button>
                        {user.role !== "admin" ? (
                          user.isBlocked ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => setBlocking(user)}
                            >
                              <CircleCheck aria-hidden className="size-3.5" />{" "}
                              Unblock
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => setBlocking(user)}
                            >
                              <Ban aria-hidden className="size-3.5" /> Block
                            </Button>
                          )
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 text-xs text-muted-foreground"
                            title="Admin accounts cannot be blocked"
                          >
                            <ShieldOff aria-hidden className="size-3.5" />{" "}
                            Protected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* View details */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(o) => !o && setViewing(null)}
      >
        <DialogContent className="sm:max-w-md">
          {viewing ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">
                  User Details
                </DialogTitle>
                <DialogDescription>
                  Registered {formatDate(viewing.joinedAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16 border-2 border-rose-soft/60">
                    <AvatarImage src={viewing.image} alt={viewing.name} />
                    <AvatarFallback className="bg-rose-tint text-burgundy">
                      {initials(viewing.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {viewing.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {viewing.email}
                    </p>
                    <div className="mt-1.5 flex gap-1.5">
                      <RoleBadge role={viewing.role} />
                      <UserStatusBadge blocked={viewing.isBlocked} />
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Business Name
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {viewing.role === "vendor"
                        ? (viewing.businessName ?? "—")
                        : "—"}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Location
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {viewing.location ?? "—"}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Phone
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {viewing.phone ?? "—"}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Plan
                    </dt>
                    <dd className="mt-0.5 font-medium capitalize">
                      {viewing.role === "vendor"
                        ? viewing.subscriptionPlan
                        : "—"}
                      {viewing.subscriptionExpiresAt ? (
                        <span className="block text-xs text-muted-foreground">
                          renews {formatDate(viewing.subscriptionExpiresAt)}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                </dl>
                {viewing.role === "vendor" ? (
                  <div className="flex gap-3 text-sm">
                    <div className="flex-1 rounded-lg bg-rose-tint/60 p-3">
                      <p className="font-serif text-xl font-semibold text-burgundy">
                        {viewing.serviceCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        services published
                      </p>
                    </div>
                    {viewing.rating ? (
                      <div className="flex-1 rounded-lg bg-sage-tint/60 p-3">
                        <p className="font-serif text-xl font-semibold text-[#4d5c44]">
                          {viewing.rating.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          vendor rating
                        </p>
                      </div>
                    ) : null}
                    {viewing.completedWeddings ? (
                      <div className="flex-1 rounded-lg bg-muted p-3">
                        <p className="font-serif text-xl font-semibold text-foreground">
                          {viewing.completedWeddings}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          weddings completed
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : viewing.role === "customer" ? (
                  <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                    {viewing.bookingCount} booking{" "}
                    {viewing.bookingCount === 1 ? "request" : "requests"}{" "}
                    submitted
                  </p>
                ) : null}
                {viewing.bio ? (
                  <p className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                    {viewing.bio}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(blocking)}
        onOpenChange={(o) => !o && !blockingBusy && setBlocking(null)}
        title={
          blocking?.isBlocked
            ? `Unblock ${blocking?.name}?`
            : `Block ${blocking?.name}?`
        }
        description={
          blocking?.isBlocked
            ? "They will regain access to the platform and can sign in again."
            : "Blocked users cannot sign in or access protected platform features. If they are currently signed in, they will be signed out automatically. You can unblock them anytime."
        }
        confirmLabel={blocking?.isBlocked ? "Unblock User" : "Block User"}
        loadingLabel={blocking?.isBlocked ? "Unblocking…" : "Blocking…"}
        loading={blockingBusy}
        destructive={!blocking?.isBlocked}
        onConfirm={() => void handleToggleBlock()}
      />
    </div>
  );
}
