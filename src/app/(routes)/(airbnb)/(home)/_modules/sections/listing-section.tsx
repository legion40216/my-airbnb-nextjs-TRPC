// components/home/listing-section.tsx
'use client';
import React, { Suspense } from 'react';
import { trpc } from '@/trpc/client';
import { formatter } from '@/utils/formatters';
import { ErrorBoundary } from 'react-error-boundary';

import useCountries from '@/hooks/useCountries';
import EmptyState from '@/components/global-ui/empty-state';

import { SearchParamsValues } from '@/schemas';
import RemoveFilterBtn from '@/components/global-ui/airbnb-buttons/remove-filter-btn';
import ListingLists from '../components/home/listings-list';
import Loading from '../../loading';
import Error from '../../error';
import { checkSearchParams } from '@/utils/checkSearchParams';

export const ListingSection = ({ queryInput }: { queryInput: SearchParamsValues }) => {
  return (
    <Suspense fallback={<Loading />}>
      <ErrorBoundary fallback={<Error />}>
        <ListingSectionContent queryInput={queryInput} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ListingSectionContent = ({ queryInput }: { queryInput: SearchParamsValues }) => {
  const [data] = trpc.listings.getSearch.useSuspenseQuery(queryInput);

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

  // If no listings are found, show remove filter button
  const hasQuery = checkSearchParams();
  if (hasQuery && formattedListings.length === 0) {
    return (
      <EmptyState>
        <RemoveFilterBtn />
      </EmptyState>
    );
  }

  return <ListingLists data={formattedListings} />;
};
