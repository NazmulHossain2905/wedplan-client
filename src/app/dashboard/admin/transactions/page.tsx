"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { PaymentStatusBadge } from "@/components/shared/badges";
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
import { useAdminTransactions } from "@/hooks/queries";
import { formatBDT, formatDate, formatDateTime, initials } from "@/lib/helpers";
import type { Transaction, User } from "@/types";
import { BadgeDollarSign, Eye, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

type TransactionWithVendor = Transaction & { vendor?: User };

export default function AdminTransactionsPage() {
  return (
    <DashboardPage role="admin">
      <AdminTransactions />
    </DashboardPage>
  );
}

function AdminTransactions() {
  const { user: admin } = useAuth();
  const { data, isLoading } = useAdminTransactions(admin);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [viewing, setViewing] = useState<TransactionWithVendor | null>(null);

  const transactions = data?.transactions ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (q) {
          const vendor = t.vendor;
          const haystack =
            `${vendor?.businessName ?? ""} ${vendor?.name ?? ""} ${t.stripeSessionId} ${t.id}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (statusFilter !== "all" && t.paymentStatus !== statusFilter)
          return false;
        if (planFilter !== "all" && t.plan !== planFilter) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [transactions, search, statusFilter, planFilter]);

  const totals = useMemo(() => {
    const succeeded = transactions.filter(
      (t) => t.paymentStatus === "succeeded",
    );
    return {
      revenue: succeeded.reduce((sum, t) => sum + t.amount, 0),
      succeeded: succeeded.length,
      failed: transactions.filter((t) => t.paymentStatus === "failed").length,
      refunded: transactions.filter((t) => t.paymentStatus === "refunded")
        .length,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Subscription payments recorded through Stripe Checkout. Payment
          records are immutable — statuses update only via verified webhook
          events.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-sm text-muted-foreground">Collected Revenue</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-burgundy">
            {formatBDT(totals.revenue)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-sm text-muted-foreground">Succeeded</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-emerald-700">
            {totals.succeeded}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-sm text-muted-foreground">Failed</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-red-600">
            {totals.failed}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-sm text-muted-foreground">Refunded</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-sky-600">
            {totals.refunded}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search vendor, transaction or session ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search transactions"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full"
            aria-label="Filter by payment status"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="succeeded">Succeeded</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-full" aria-label="Filter by plan">
            <SelectValue placeholder="All plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading && transactions.length === 0 ? (
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
          icon={<BadgeDollarSign aria-hidden />}
          title="No transactions match"
          description="Try a different search term or filter. New payments appear here after verified Stripe webhooks."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
          <table className="w-full min-w-[880px] text-sm">
            <caption className="sr-only">Subscription transactions</caption>
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Vendor
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Business Name
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Plan
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-3.5 text-right font-medium">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const vendor = t.vendor;
                return (
                  <tr
                    key={t.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 border border-border">
                          <AvatarImage
                            src={vendor?.image}
                            alt={vendor?.name ?? "Vendor"}
                          />
                          <AvatarFallback className="bg-rose-tint text-[10px] text-burgundy">
                            {initials(vendor?.name ?? "V")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {vendor?.name ?? "Unknown vendor"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {vendor?.businessName ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gradient-to-r from-[#8a6d2f] to-[#c9a227] px-2.5 py-0.5 text-xs font-semibold capitalize text-white">
                        {t.plan}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {formatBDT(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={t.paymentStatus} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setViewing(t)}
                      >
                        <Eye aria-hidden className="size-3.5" /> View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck aria-hidden className="size-3.5 text-sage" />
        Admins can review but never manually change a payment status — only
        verified Stripe webhook events can mark a payment as successful.
      </p>

      {/* Details dialog */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(o) => !o && setViewing(null)}
      >
        <DialogContent className="sm:max-w-md">
          {viewing ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">
                  Transaction Details
                </DialogTitle>
                <DialogDescription>
                  Recorded {formatDateTime(viewing.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {(() => {
                  const vendor = viewing.vendor;
                  return (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3.5">
                      <Avatar className="size-10 border border-border">
                        <AvatarImage
                          src={vendor?.image}
                          alt={vendor?.name ?? "Vendor"}
                        />
                        <AvatarFallback className="bg-rose-tint text-burgundy">
                          {initials(vendor?.name ?? "V")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {vendor?.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {vendor?.businessName}
                        </p>
                      </div>
                    </div>
                  );
                })()}
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Plan
                    </dt>
                    <dd className="mt-0.5 font-medium capitalize">
                      {viewing.plan}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Amount
                    </dt>
                    <dd className="mt-0.5 font-semibold text-burgundy">
                      {formatBDT(viewing.amount)} {viewing.currency}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Status
                    </dt>
                    <dd className="mt-0.5">
                      <PaymentStatusBadge status={viewing.paymentStatus} />
                    </dd>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Transaction ID
                    </dt>
                    <dd className="mt-0.5 break-all font-mono text-xs">
                      {viewing.id}
                    </dd>
                  </div>
                </dl>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    Stripe Session
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-foreground">
                    {viewing.stripeSessionId}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
