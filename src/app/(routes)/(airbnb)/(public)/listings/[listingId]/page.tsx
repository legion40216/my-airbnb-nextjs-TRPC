import React from 'react';
import { getQueryClient, trpc } from '@/trpc/server'; 
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import ListingView from './_modules/view/listing-view'; 

export const dynamic = 'force-dynamic';

export default async function ListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  // Await params before using its properties
  const { listingId } = await params;

  const queryClient = getQueryClient();
  // Prefetch the listing data using the resolved listingId
  await queryClient.prefetchQuery(
    trpc.listings.getByListingId.queryOptions({ listingId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListingView listingId={listingId} />
    </HydrationBoundary>
  );
}