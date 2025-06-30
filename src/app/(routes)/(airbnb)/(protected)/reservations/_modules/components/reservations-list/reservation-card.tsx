// components/ReservationCard.tsx
"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import HeartButton from "@/components/global-ui/heart-button";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import ConfirmModal from "@/components/modal/confirm-modal";
import CardBtn from "@/components/global-ui/airbnb-buttons/card-btn";

type ReservationCardProps = {
  id: string;
  listingId: string;
  locationRegion: string;
  locationLabel: string;
  imgSrc: string;
  category: string;
  price: string;
  reservationDate: string;
  reservedBy?: string; 
  isFavoritedByCurrentUser?: boolean;
};

export default function ReservationCard({
  id: reservationId,
  listingId,
  locationRegion,
  locationLabel,
  imgSrc,
  price,
  reservationDate, 
  reservedBy,
  isFavoritedByCurrentUser = false,
}: ReservationCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // TRPC mutation for deleting the reservation
  const utils = trpc.useUtils();
  const toastLoading = "Deleting Reservation... Please wait.";
  const toastMessage = "Reservation deleted successfully!";
  const deleteListing = trpc.reservations.delete.useMutation({
    onSuccess: (data) => {
      utils.reservations.getUserReservations.invalidate();
      toast.success(toastMessage);
      setOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting reservation:", error);
      toast.error(error.message || "Something went wrong.");
      setOpen(false);
    },
  });

  // Function to handle deletion of the reservation
  const handleDelete = async () => {
    const toastId = toast.loading(toastLoading);
    try {
      await deleteListing.mutateAsync({ reservationId });
      // Success handling is done in onSuccess callback
    } catch (error) {
      // Error handling is done in onError callback
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        {/* Image */}
        <div
          className="aspect-square overflow-hidden rounded-xl relative group cursor-pointer border"
          onClick={() => router.push(`/listings/${listingId}`)}
        >
          <div className="absolute top-3 right-3 z-10">
            <HeartButton 
            listingId={listingId} 
            isFavoritedByCurrentUser={isFavoritedByCurrentUser}
            />
          </div>
          <Image
            fill
            className="object-cover h-full w-full group-hover:scale-110 transition"
            src={imgSrc}
            alt="Reservation"
          />
        </div>
        {/* Details */}
        <div>
          <p className="font-semibold text-lg">
            <span className="text-neutral-600">{locationRegion}, </span>
            <span>{locationLabel}</span>
          </p>
          <p className="font-light text-neutral-500">
            {reservationDate}
          </p>
        </div>
         {/* Price and Reserved By */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <p className="font-semibold">{price}</p>
            <p className="font-light">night</p>
          </div>
          <div>
            <p className='font-semibold'>
              <span className='font-light'>Reserved by: </span>
              <span>{reservedBy}</span>
            </p>
          </div>
        </div>
      </div>
        {/* Delete Button */}
      <ConfirmModal 
      onConfirm={handleDelete} 
      open={open} 
      setOpen={setOpen}
      isDisabled={deleteListing.isPending}
      >
        <CardBtn
        onClick={() => setOpen(true)}
        disabled={deleteListing.isPending}
        >
          Delete Reservation
        </CardBtn>
      </ConfirmModal>
    </div>
  );
}