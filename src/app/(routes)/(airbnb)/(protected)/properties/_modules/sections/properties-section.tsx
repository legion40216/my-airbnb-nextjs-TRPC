// components/home/listing-section.tsx
'use client';
import React, { Suspense } from 'react';

import { trpc } from '@/trpc/client';
import { formatter } from '@/utils/formatters';
import { ErrorBoundary } from 'react-error-boundary';
import useCountries from '@/hooks/useCountries';

import PropertiesList from '../components/properties-list';
import EmptyState from '@/components/global-ui/empty-state';

export const PropertiesSection = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={
        <EmptyState 
        title="Error loading properties" 
        subtitle="Please try again later." 
        />
        }>
        <PropertiesSectionContent />
      </ErrorBoundary>
    </Suspense>
  );
};

const PropertiesSectionContent = () => {
  const [data] = trpc.properties.getUserProperties.useSuspenseQuery();
  const properties = data.listings;
  // Handle no reservations case
  if (properties.length === 0) {
    return (
      <EmptyState 
      title="No reservations found" 
      subtitle="You have no reservations on your properties." 
      />
    );
  }

  const { getByValue } = useCountries();
  const formattedListings = properties.map((item) => {
    const country = getByValue(item.locationValue);
    return {
      id: item.id,
      locationRegion: country?.region || '',
      locationLabel: country?.label || '',
      imgSrc: item.imgSrc,
      category: item.category,
      price: formatter.format(item.price),
      isFavoritedByCurrentUser: item.isFavorited,
    };
  });

  return <PropertiesList data={formattedListings} />;
};
