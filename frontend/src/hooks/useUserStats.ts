import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface UserStats {
  tokenBalance: number;
  currentStreak: number;
  highestStreak: number;
  totalYapEarned: number;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export function useUserStats(userId: string | null): {
  stats: UserStats | null;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, error, isLoading } = useSWR(
    userId ? `${API_URL}/user-stats/${encodeURIComponent(userId)}` : null,
    fetcher,
  );

  const stats: UserStats | null = data
    ? {
        tokenBalance: data.token_balance ?? 0,
        currentStreak: data.current_streak ?? 0,
        highestStreak: data.highest_streak ?? 0,
        totalYapEarned: data.total_yap_earned ?? 0,
      }
    : null;

  return {
    stats,
    isLoading,
    isError: !!error,
  };
}
