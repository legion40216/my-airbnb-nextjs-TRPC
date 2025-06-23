import React from 'react'
import { ListingSection } from '../sections/listing-section'

export default function ListingView({ listingId }: { listingId: string }) {
  return (
    <div>
      <ListingSection listingId={listingId} />
    </div>
  )
}
