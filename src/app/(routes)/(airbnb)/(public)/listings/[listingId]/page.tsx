import React from 'react';
import { getQueryClient, trpc } from '@/trpc/server'; // Ensure these paths are correct
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import ListingView from './_modules/view/listing-view'; // Ensure this path is correct

export const dynamic = 'force-dynamic';

interface PageParams {
  params: Promise<{ 
    listingId: string;
  }>;
}

export default async function ListingPage({ params }: PageParams) {
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