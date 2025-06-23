// components/home/listing-section.tsx
'use client';
import React, { Suspense } from 'react';

import { trpc } from '@/trpc/client';
import { formatter } from '@/utils/formatters';
import { ErrorBoundary } from 'react-error-boundary';
import useCountries from '@/hooks/useCountries';
import PropertiesList from '../components/properties-list';

export const PropertiesSection = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <PropertiesSectionContent />
      </ErrorBoundary>
    </Suspense>
  );
};

const PropertiesSectionContent = () => {
  const [data] = trpc.properties.getPropertiesByUserId.useSuspenseQuery();

  const { getByValue } = useCountries();
  const formattedListings = data.listings.map((item) => {
    const country = getByValue(item.locationValue);
    return {
      id: item.id,
      locationRegion: country?.region || '',
      locationLabel: country?.label || '',
      imgSrc: item.imgSrc,
      category: item.category,
      price: formatter.format(item.price),
    };
  });

  return <PropertiesList data={formattedListings} />;
};
