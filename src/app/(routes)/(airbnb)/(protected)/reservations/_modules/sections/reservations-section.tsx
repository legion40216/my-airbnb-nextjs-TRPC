// components/home/listing-section.tsx
'use client';
import React, { Suspense } from 'react';
import { trpc } from '@/trpc/client';
import { formatter } from '@/utils/formatters';
import { ErrorBoundary } from 'react-error-boundary';
import useCountries from '@/hooks/useCountries';
import ReservationsList from '../components/reservations-list';
import { format } from 'date-fns';

export const ReservationsSection = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <ReservationsSectionContent />
      </ErrorBoundary>
    </Suspense>
  );
};

const ReservationsSectionContent = () => {
  const [data] = trpc.reservations.getUserReservations.useSuspenseQuery();

  const reservation = data.reservations
  const { getByValue } = useCountries();
  const formattedListings = reservation.map((item) => {
    const country = getByValue(item.listing.locationValue);
    // Format startDate and endDate to a readable string
    const reservationDate = `${format(new Date(item.startDate), "MMM d, yyyy")} – ${format(new Date(item.endDate), "MMM d, yyyy")}`;
    return {
      id:               item.id,
      listingId:        item.listing.id,
      locationRegion:   country?.region || "",
      locationLabel:    country?.label || "",
      imgSrc:           item.listing.imgSrc,
      category:         item.listing.category,
      price:            formatter.format(item.totalPrice),
      reservationDate   : reservationDate,
      reservedBy:       item.user.name || item.user.email || 'Unknown user',
    };
  });

  return <ReservationsList data={formattedListings} />;
};
