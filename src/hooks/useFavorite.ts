// hooks/useFavorite.ts
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface UseFavoriteProps {
  listingId: string;
  isFavorited: boolean;
}

const useFavorite = ({ listingId, isFavorited }: UseFavoriteProps) => {
  const utils = trpc.useUtils();

  const mutation = trpc.favourites.toggle.useMutation({
    // Optimistic update - runs immediately when mutation starts
    onMutate: async () => {
      const loadingMsg = isFavorited
        ? "Removing from favorites..."
        : "Adding to favorites...";
      
      const toastId = toast.loading(loadingMsg);

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await utils.favourites.getIsUserFavoritedbyId.cancel({ listingId });

      // Snapshot the previous value
      const previousData = utils.favourites.getIsUserFavoritedbyId.getData({ listingId });

      // Optimistically update the cache
      utils.favourites.getIsUserFavoritedbyId.setData(
        { listingId },
        (old) => ({
          isFavorited: !old?.isFavorited,
          listingId: old?.listingId ?? listingId,
        })
      );

      return { previousData, toastId };
    },

    // On success, show success message
    onSuccess: (data, variables, context) => {
      const successMessage =
        data.status === "removed"
          ? "Removed from favorites"
          : "Added to favorites";

      toast.success(successMessage);
      
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },

    // On error, rollback the optimistic update
    onError: (error, variables, context) => {
      // Rollback
      if (context?.previousData !== undefined) {
        utils.favourites.getIsUserFavoritedbyId.setData(
          { listingId },
          context.previousData
        );
      }

      toast.error(error.message || "Something went wrong.");
      
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },

    // Always refetch to ensure server state is correct
    onSettled: () => {
      // Invalidate to refetch and ensure we're in sync with server
      utils.favourites.getIsUserFavoritedbyId.invalidate({ listingId });
      utils.favourites.getUserFavourites.invalidate();
    },
  });

  const toggleFavorite = () => {
    mutation.mutate({ listingId });
  };

  return {
    toggleFavorite,
    toggleIsLoading: mutation.isPending,
  };
};

export default useFavorite;