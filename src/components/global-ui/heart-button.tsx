'use client'
import { Heart } from 'lucide-react';
import useFavorite from '@/hooks/useFavorite';
import { useAuthModalStore } from '@/hooks/useAuthModalStore';
import { useCurrentUser } from '@/hooks/client-auth-utils';
import { trpc } from '@/trpc/client';

import { Button } from '../ui/button';

type HeartButtonProps = {
  listingId: string;
  isFavoritedByCurrentUser?: boolean;
};

export default function HeartButton({ listingId, isFavoritedByCurrentUser }: HeartButtonProps) {
  const { user, isPending } = useCurrentUser();
  const modalAuthSwitcher = useAuthModalStore();

  const isLoggedIn = !!user

  // Always fetch if logged in to enable optimistic updates
  const { data, isLoading } = trpc.favourites.getIsUserFavoritedbyId.useQuery(
    { listingId },
    {
      enabled: isLoggedIn && (isFavoritedByCurrentUser === undefined), // Only fetch if logged in or prop is provided
      // Use prop as initial data to prevent loading flash
      initialData: isFavoritedByCurrentUser
        ? { isFavorited: isFavoritedByCurrentUser, listingId }
        : undefined,
      staleTime: 60 * 1000, // Consider data fresh for 1 minute
    }
  );

  // Use the query data (which includes optimistic updates) or fall back to prop
  const hasFavorited = data?.isFavorited ?? isFavoritedByCurrentUser ?? false;

  const { toggleFavorite, toggleIsLoading } = useFavorite({
    listingId,
    isFavorited: hasFavorited,
  });
  
  const isLoadingFavourites = isLoading || toggleIsLoading || isPending;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      modalAuthSwitcher.openModal("login");
    } else {
      toggleFavorite();
    }
  };

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