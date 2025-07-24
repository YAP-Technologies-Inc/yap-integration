// src/hooks/useUserProfile.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUserProfile(userId: string | null) {
  const { data, error, isLoading } = useSWR(
    userId ? `http://localhost:4000/api/profile/${userId}` : null,
    fetcher
  );

  return {
    name: data?.name || '',
    language: data?.language_to_learn || '',
    isLoading,
    isError: error,
  };
}
