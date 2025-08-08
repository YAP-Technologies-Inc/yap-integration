import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUserProfile(userId: string | null) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { data, error, isLoading } = useSWR(
    userId ? `${API_URL}/api/profile/${userId}` : null,
    fetcher
  );

  let accountCreated = '';
  if (data?.created_at) {
    const date = new Date(data.created_at);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    accountCreated = date.toLocaleDateString(undefined, options); // e.g. "August 2025"
  }

  return {
    name: data?.name || '',
    language: data?.language_to_learn || '',
    wallet: data?.wallet || '',
    accountCreated, // <- formatted string like "August 2025"
    isLoading,
    isError: error,
  };
}
