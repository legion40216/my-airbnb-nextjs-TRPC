import React from 'react';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import ReservationsView from './_modules/view/reservations-view';


export default async function ReservationPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.reservations.getUserReservations.queryOptions()
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReservationsView />
    </HydrationBoundary>
  );
}