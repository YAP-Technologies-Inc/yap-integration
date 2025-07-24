// src/hooks/useUserStats.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useUserStats(userId: string | null) {
  const { data, error, isLoading } = useSWR(
    () => userId ? `http://localhost:4000/api/user-stats/${encodeURIComponent(userId)}` : null,
    fetcher
  );

  return {
    stats: data,
    isLoading,
    isError: !!error,
  };
}
