import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/trpc/server';
import HomeView from './_modules/view/home-view';
import { getValidatedSearchParams } from '@/utils/parseSearchParams';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const queryInput = getValidatedSearchParams(resolvedParams);
  
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.listings.getSearch.queryOptions(queryInput));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeView queryInput={queryInput} />
    </HydrationBoundary>
  );
}