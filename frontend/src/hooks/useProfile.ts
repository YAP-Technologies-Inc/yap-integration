// hooks/useProfile.ts
"use client";

import useSWR from "swr";

type ProfileRow = {
  name?: string;
  language_to_learn?: string;
  created_at?: string | null;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" }); // ok to drop credentials if you don't use cookies
  if (!res.ok) {
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = await res.text().catch(() => "");
    throw err;
  }
  return (await res.json()) as ProfileRow;
};

export function useProfile(userId: string | null) {
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  const key = userId && API_URL ? `${API_URL}/api/profile/${userId}` : null;

  const { data, error, isLoading, mutate } = useSWR<ProfileRow>(key, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const name = data?.name || "";
  const language = data?.language_to_learn || "";
  const createdAtISO = (data?.created_at as string | null) || null;

  const accountCreated = createdAtISO
    ? new Date(createdAtISO).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    : "";

  // Treat 404 as "no profile yet" (not a hard error)
  const notFound = !!error && (error as any).status === 404;
  const hardError =
    !!error && ![401, 403, 404].includes((error as any).status ?? 0);

  return {
    name,
    language,
    accountCreated,
    isLoading: !!key && isLoading,
    isError: hardError,
    notFound,
    refetch: mutate,
  };
}
