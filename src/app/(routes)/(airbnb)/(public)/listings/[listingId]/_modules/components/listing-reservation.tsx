import React from 'react'
import { useEffect, useMemo } from "react";

import { toast } from "sonner";
import { formatter } from '@/utils/formatters';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReservationFormValues, reservationSchema, reservationServerSchema, ReservationServerValues } from "@/schemas";
import { differenceInDays, eachDayOfInterval } from "date-fns";
import { trpc } from '@/trpc/client';
import { useCurrentUser } from '@/hooks/client-auth-utils';
import { useAuthModalStore } from '@/hooks/useAuthModalStore';
import { z } from 'zod';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

import { Form } from "@/components/ui/form";
import { ActionBtn } from "@/components/global-ui/airbnb-buttons/action-btn";
import { Separator } from '@/components/ui/separator';
import ListingCalendar from './listing-reservation/listing-calander';

interface ListingReservationProps {
    listingId: string;
    price: number;
    reservations?: { startDate: Date; endDate: Date }[];
}

export default function ListingReservation({
    listingId,
    price,
    reservations = [],
}: ListingReservationProps) {

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      totalPrice: 0,
      listingId,
    },
  });

  const { watch, setValue, formState, handleSubmit } = form;
  const { isSubmitting } = formState;
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const {user} = useCurrentUser()
  const isLoggedIn = !!user;
  const { openModal: openAuthModal } = useAuthModalStore();

  // Authentication handler
  const handleAuthRequired = () => {
    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }
  };

  // Memoizing disabled dates to avoid unnecessary recalculations
  const disabledDates = useMemo(() => {
    if (reservations.length === 0) {
      return [];
    }

    let dates: Date[] = [];
    reservations.forEach((res) => {
      const range = eachDayOfInterval({
        start: res.startDate,
        end: res.endDate,
      });
      dates = [...dates, ...range];
    });
    return dates;
  }, [reservations]);

  // Effect to update total price when startDate, endDate, or price changes
  useEffect(() => {
    if (startDate && endDate) {
      const dayCount = differenceInDays(endDate, startDate);
      setValue("totalPrice", dayCount > 0 ? dayCount * price : price);
    } else {
      setValue("totalPrice", 0);
    }
  }, [startDate, endDate, price, setValue]);

  // Form submit logic
  const toastLoading = "Creating your reservation... Please wait.";
  const toastMessage = "Your reservation has been created successfully!";
  const utils = trpc.useUtils();
  const createReservation = trpc.reservations.create.useMutation({
    onSuccess: () => {
      utils.listings.getByListingId.invalidate();
      toast.success(toastMessage);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong.");
      console.error("Reservation error:", error);
    },
  });
  // Utility to transform form data into server data
  const safelyToServerReservationData = (
    formData: ReservationFormValues
  ): z.SafeParseReturnType<ReservationFormValues, ReservationServerValues> => {
    return reservationServerSchema.safeParse(formData);
  };

  const onSubmit = async (data: ReservationFormValues) => {
    const toastId = toast.loading(toastLoading);
    // Check authentication before proceeding
    if (!isLoggedIn) {
      handleAuthRequired();
      return;
    }

    //parses values to reservationservervalues 
    const result = safelyToServerReservationData(data);
    if (!result.success) {
      toast.error(result.error.errors[0]?.message || "Validation failed");
      toast.dismiss(toastId);
      return;
    }

    if (!data.startDate || !data.endDate) {
      toast.error("Please select both check-in and check-out dates.");
      return;
    }

    try {
      await createReservation.mutateAsync(result.data);
    } catch (error) {
      // Optional: you can handle additional logging here
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Handle reservation button click
  const handleReserveClick = () => {
    if (!isLoggedIn) {
      handleAuthRequired();
      return;
    }
    handleSubmit(onSubmit)();
  };

  // Check if reservation can be made
  const canReserve = startDate && endDate && !isSubmitting;
  
  // Determine button text and behavior
  const getButtonText = () => {
    if (!isLoggedIn) return 'Log in to reserve';
    if (!startDate || !endDate) return 'Select dates';
    return 'Reserve';
  };

  return (
    <Card className='gap-0 space-y-4'>
      <CardHeader className="space-y-1">
        <CardTitle>
          <p className="flex items-center gap-1">
            <span className="text-2xl font-semibold">
              {formatter.format(price)}
            </span>
            <span className="text-muted-foreground font-light">night</span>
          </p>
        </CardTitle>
        <CardDescription>
          Select your dates to see the total price
        </CardDescription>
      </CardHeader>

      <Separator/>

      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <ListingCalendar form={form} disabledDates={disabledDates} />
          </form>
        </Form>
      </CardContent>

      <Separator/>
     
      {/* Reserve button - Submit button */}
      <div className='px-4'>
        <ActionBtn 
          onClick={handleReserveClick}
          disabled={!isLoggedIn ? false : !canReserve} // Allow clicking when not logged in to trigger auth
          type="button"
        >
          {getButtonText()}
        </ActionBtn>
      </div>

      <Separator/>

      <CardFooter className="grid gap-4">
        <div className="flex justify-between items-center gap-2 font-semibold text-lg">
          <span>Total</span>
          <span>{formatter.format(watch("totalPrice") || 0)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}