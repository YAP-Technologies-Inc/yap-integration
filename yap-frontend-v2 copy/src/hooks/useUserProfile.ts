// src/hooks/useUserProfile.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export function useUserProfile(userId: string | null) {

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { data, error, isLoading } = useSWR(
    userId ? `${API_URL}/api/profile/${userId}` : null,
    fetcher
  );

  return {
    name: data?.name || '',
    language: data?.language_to_learn || '',
    wallet: data?.wallet || '',
    isLoading,
    isError: error,
  };
}
