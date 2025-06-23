import React from 'react';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';


export default async function FavouritesPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.favourites.getUserFavourites.queryOptions()
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FavouritesView />
    </HydrationBoundary>
  );
}