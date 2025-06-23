import React from 'react'
import { ListingSection } from '../sections/listing-section'
import { SearchParamsValues } from '@/schemas'
export default function HomeView({
  queryInput,
}: {
  queryInput: SearchParamsValues;
}) {
  return (
    <div>
      <ListingSection queryInput={queryInput} />
    </div>
  );
}