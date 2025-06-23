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
    onSuccess: (data) => {
      utils.favourites.getIsUserFavoritedbyId.invalidate({ listingId });

      const successMessage =
        data.status === "removed"
          ? "Removed from favorites"
          : "Added to favorites";

      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });

  const toggleFavorite = () => {
    const loadingMsg = isFavorited
      ? "Removing from favorites..."
      : "Adding to favorites...";

    const toastId = toast.loading(loadingMsg);

    mutation.mutate(
      { listingId },
      {
        onSettled: () => {
          toast.dismiss(toastId);
        },
      }
    );
  };

  return {
    toggleFavorite,
    toggleIsLoading: mutation.isPending,
  };
};

export default useFavorite;
