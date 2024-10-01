import { trpc } from '@/trpc/client';

// Custom hook to fetch jewellery products (best-rated and latest)
export function useJewelleryProducts() {
  // Use the trpc hooks within this custom hook
  const { data: bestRated, isLoading: bestLoading } = trpc.getJewelleryBestRated.useQuery({ limit: 1 });
  const { data: latest, isLoading: latestLoading } = trpc.getJewelleryLatest.useQuery({ limit: 2 });

  const isLoading = bestLoading || latestLoading;
  const products = [...(bestRated || []), ...(latest || [])];

  return { products, isLoading };
}
