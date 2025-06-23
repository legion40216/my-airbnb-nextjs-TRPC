// ListingSection - Client Component
"use client";
import { trpc } from "@/trpc/client";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Loading from "../../loading";
import Error from "../../error";
import ListingInfo from "../components/listing-info";
import { categories } from "@/constants/categoryIcons";
import ListingImg from "../components/listing-img";
import Heading from "@/components/global-ui/headings";
import ListingReservation from "../components/listing-reservation";
import useCountries from "@/hooks/useCountries";
import EmptyState from "@/components/global-ui/empty-state";

interface ListingSectionProps {
  listingId: string;
}

export const ListingSection = ({ listingId }: ListingSectionProps) => {
  return (
    <Suspense fallback={<Loading />}>
      <ErrorBoundary fallback={<Error />}>
        <ListingSectionContent listingId={listingId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ListingSectionContent = ({ listingId }: { listingId: string }) => {
  // Use the same query that was prefetched on the server
  const [data] = trpc.listings.getByListingId.useSuspenseQuery({ listingId });
  const listing = data?.listing;

  if (!listing)
    return (
      <EmptyState 
      title="Listing not found" 
      subtitle="We couldn't find the listing you're looking for." 
      />
    );

  const { getByValue } = useCountries();
  const country = listing.locationValue
    ? getByValue(listing.locationValue)
    : null;

  const formattedListing = {
    listingId: listing.id,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    roomCount: listing.roomCount,
    bathroomCount: listing.bathroomCount,
    guestCount: listing.guestCount,
    userName: listing.user.name,
    userImg: listing.user.image || null,
    locationRegion: country?.region,
    locationLabel: country?.label,
    price: listing.price || 0,
    imgSrc: listing.imgSrc,
  };

  const subtitle = `${formattedListing.locationRegion}, ${formattedListing.locationLabel}`;

  const category = categories.find((item) => {
    return item.label === formattedListing.category;
  });

  const formattedReservations = listing.reservations.map((item) => ({
    startDate: new Date(item?.startDate),
    endDate: new Date(item?.endDate),
  }));

  return (
    <div className="space-y-4">
      <Heading 
      title={formattedListing.title} 
      subtitle={subtitle} 
      />

      <ListingImg
        listingId={formattedListing.listingId}
        imgSrc={formattedListing.imgSrc}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-10">
        <ListingInfo 
        category={category} 
        formattedListing={formattedListing} 
        />

        <ListingReservation
          listingId={formattedListing.listingId}
          price={formattedListing.price}
          reservations={formattedReservations}
        />
      </div>
    </div>
  );
};
