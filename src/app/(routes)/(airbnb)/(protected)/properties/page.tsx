import React from 'react';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import PropertiesView from './_modules/view/properties-view';

export default async function PropertiesPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.properties.getPropertiesByUserId.queryOptions()
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PropertiesView />
    </HydrationBoundary>
  );
}