// src/hooks/useCompletedLessons.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCompletedLessons(userId: string | null) {
  const shouldFetch = Boolean(userId);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { data, error, isLoading } = useSWR(
    shouldFetch ? `${API_URL}/api/user-lessons/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 30_000, // Re-fetch every 30 seconds
    }
  );

  return {
    completedLessons: data?.completedLessons ?? [],
    isLoading,
    isError: error,
  };
}
