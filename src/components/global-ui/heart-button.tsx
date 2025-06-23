'use client'
import { Heart } from 'lucide-react';
import useFavorite from '@/hooks/useFavorite';
import { useAuthModalStore } from '@/hooks/useAuthModalStore';
import { useCurrentUser } from '@/hooks/client-auth-utils';
import { trpc } from '@/trpc/client';
import { Button } from '../ui/button';

type HeartButtonProps = {
  listingId: string;
};

export default function HeartButton({ listingId }: HeartButtonProps) {
  const { user, isPending } = useCurrentUser();
  const modalAuthSwitcher = useAuthModalStore();

  // Function to handle click event on the heart button
  // If user is logged in, toggle favorite
  // If not logged in, open auth modal instead of toggling favorite
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      modalAuthSwitcher.openModal("login");
    } else {
      toggleFavorite();
    }
  };

  // If user is not logged in, we don't need to fetch favourites
  // !!user is to make it into a boolean value
  const isLoggedIn = !!user && !isPending;

  // Fetch user favourites only if logged in
  // This avoids unnecessary queries for non-logged-in users
  const { data, isLoading } = trpc.favourites.getIsUserFavoritedbyId.useQuery(
    { listingId },
    {
      enabled: isLoggedIn,
    }
  );
  
  const hasFavorited = data?.isFavorited || false;

  const { toggleFavorite, toggleIsLoading } = useFavorite({
    listingId,
    isFavorited: hasFavorited,
  });
  
  // Determine if we are still loading favourites
  // This will be true if the query is loading or if data is undefined or if the toggle operation is in progress
  const isLoadingFavourites = isLoading || toggleIsLoading || isPending;

  return (
    <Button
      variant={"ghost"}
      onClick={handleClick}
      size={"icon"}
      disabled={isLoadingFavourites}
    >
      {isLoadingFavourites ? (
        <div className="size-6 border-2 border-neutral-300 
        border-t-neutral-500 rounded-full animate-spin"
        />
      ) : (
        <Heart
          className="size-8"
          fill={isLoggedIn ? (hasFavorited ? "#f43f5e" : "rgb(115 115 115 / 0.7)") : "rgb(115 115 115 / 0.7)"}
          stroke={isLoggedIn ? (hasFavorited ? "" : "white") : "white"}
        />
      )}
    </Button>
  );
}

