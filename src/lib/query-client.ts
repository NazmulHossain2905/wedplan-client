"use client";

import * as React from "react";

/**
 * Minimal, dependency-free replacement for the subset of TanStack Query this
 * app used (the project requirements do not allow `@tanstack/react-query`).
 *
 * It keeps a module-level cache with per-key subscribers and a lightweight
 * invalidation event, so the existing `useQuery` / `useQueryClient` call sites
 * keep working without a data-fetching library.
 */

export type QueryKey = readonly unknown[];

interface QueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  retry?: number | boolean;
  refetchInterval?:
    | number
    | false
    | ((query: { state: { data: T | undefined } }) => number | false);
}

interface QueryState<T> {
  data: T | undefined;
  error: unknown;
  status: "pending" | "error" | "success";
  isFetching: boolean;
  updatedAt: number;
}

interface CacheEntry {
  key: QueryKey;
  state: QueryState<unknown>;
  listeners: Set<() => void>;
  promise?: Promise<void>;
}

const cache = new Map<string, CacheEntry>();
const invalidationListeners = new Set<(prefix: QueryKey) => void>();

function serializeKey(key: QueryKey): string {
  return JSON.stringify(key);
}

function matchesPrefix(key: QueryKey, prefix: QueryKey): boolean {
  if (prefix.length > key.length) return false;
  return prefix.every(
    (part, i) => JSON.stringify(part) === JSON.stringify(key[i]),
  );
}

function getEntry(id: string, key: QueryKey): CacheEntry {
  let entry = cache.get(id);
  if (!entry) {
    entry = {
      key,
      state: {
        data: undefined,
        error: null,
        status: "pending",
        isFetching: false,
        updatedAt: 0,
      },
      listeners: new Set(),
    };
    cache.set(id, entry);
  }
  return entry;
}

function setState(entry: CacheEntry, patch: Partial<QueryState<unknown>>) {
  entry.state = { ...entry.state, ...patch };
  for (const listener of entry.listeners) listener();
}

function retryCount(retry: number | boolean | undefined): number {
  if (retry === true) return 3;
  if (typeof retry === "number") return retry;
  return 0;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runQuery<T>(
  entry: CacheEntry,
  fetcher: () => Promise<T>,
  retries: number,
  force: boolean,
  staleTime: number,
): Promise<void> {
  if (entry.promise) return entry.promise;

  const isFresh =
    entry.state.status === "success" &&
    Date.now() - entry.state.updatedAt < staleTime;
  if (!force && isFresh) return;

  if (entry.state.status !== "success") {
    setState(entry, { status: "pending", error: null });
  }
  setState(entry, { isFetching: true });

  entry.promise = (async () => {
    let attempt = 0;
    while (true) {
      try {
        const data = await fetcher();
        setState(entry, {
          data,
          error: null,
          status: "success",
          updatedAt: Date.now(),
        });
        return;
      } catch (error) {
        if (attempt >= retries) {
          setState(entry, {
            error,
            status: "error",
            updatedAt: Date.now(),
          });
          return;
        }
        attempt += 1;
        await sleep(1000);
      }
    }
  })().finally(() => {
    entry.promise = undefined;
    setState(entry, { isFetching: false });
  });

  return entry.promise;
}

/** Invalidate cached queries (all of them, or those starting with a key). */
function invalidateQueries(options?: { queryKey?: QueryKey }) {
  const prefix = options?.queryKey;

  for (const entry of cache.values()) {
    if (prefix && !matchesPrefix(entry.key, prefix)) continue;
    // Mark the cached data stale and notify mounted hooks.
    entry.state = { ...entry.state, updatedAt: 0 };
    for (const listener of entry.listeners) listener();
  }

  // Mounted queries refetch themselves through this event.
  for (const listener of invalidationListeners) listener(prefix ?? []);
}

const queryClient = { invalidateQueries };

/** Mirrors the `useQueryClient()` API used by the app's mutations. */
export function useQueryClient() {
  return queryClient;
}

/**
 * Runs an async query and keeps its result in the shared cache.
 * The returned shape matches what the pages already consume.
 */
export function useQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 0,
  retry = 1,
  refetchInterval,
}: QueryOptions<T>) {
  const id = serializeKey(queryKey);
  const entry = React.useMemo(() => getEntry(id, queryKey), [id, queryKey]);

  // Keep the latest queryFn without refetching on every render.
  const queryFnRef = React.useRef(queryFn);
  React.useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  const subscribe = React.useCallback(
    (listener: () => void) => {
      entry.listeners.add(listener);
      return () => {
        entry.listeners.delete(listener);
      };
    },
    [entry],
  );

  const state = React.useSyncExternalStore(
    subscribe,
    () => entry.state,
    () => entry.state,
  );

  const run = React.useCallback(
    (force: boolean, staleFor: number) => {
      if (!enabled) return Promise.resolve();
      return runQuery(
        entry,
        () => queryFnRef.current(),
        retryCount(retry),
        force,
        staleFor,
      );
    },
    [enabled, entry, retry],
  );

  React.useEffect(() => {
    void run(false, staleTime);
  }, [run, staleTime]);

  const interval =
    typeof refetchInterval === "function"
      ? refetchInterval({ state: { data: state.data as T | undefined } })
      : refetchInterval;

  React.useEffect(() => {
    if (!enabled || !interval) return;
    const timer = setInterval(() => void run(true, 0), interval);
    return () => clearInterval(timer);
  }, [enabled, interval, run]);

  React.useEffect(() => {
    const listener = (prefix: QueryKey) => {
      if (!matchesPrefix(entry.key, prefix)) return;
      void run(true, 0);
    };
    invalidationListeners.add(listener);
    return () => {
      invalidationListeners.delete(listener);
    };
  }, [entry, run]);

  const refetch = React.useCallback(() => run(true, 0), [run]);

  return {
    data: state.data as T | undefined,
    error: state.error,
    isLoading: enabled && state.status === "pending",
    isPending: state.status === "pending",
    isFetching: state.isFetching,
    refetch,
  };
}
