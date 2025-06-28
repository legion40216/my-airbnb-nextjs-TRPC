"use client";

import { UseFormReturn } from "react-hook-form";
import { ReservationFormValues } from "@/schemas";

import {
  FormField,
  FormItem,
  FormControl,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

type ListingCalendarProps = {
  form: UseFormReturn<ReservationFormValues>;
  disabledDates: Date[];
};

export default function ListingCalendar({ form, disabledDates }: ListingCalendarProps) {
  // Watch for changes in startDate and endDate
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  
  // Create a DateRange object
  const dateRange: DateRange = {
    from: startDate || undefined,
    to: endDate || undefined,
  };

  // Function to handle date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range) {
      form.setValue("startDate", undefined as any);
      form.setValue("endDate", undefined as any);
      return;
    }

    const { from, to } = range;

    if (from && !to) {
      form.setValue("startDate", from);
      form.setValue("endDate", undefined as any);
      return;
    }

    if (from && to) {
      if (startDate && endDate) {
        const fromTime = from.getTime();
        const toTime = to.getTime();
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();

        if (fromTime === startTime && toTime === endTime) {
          form.setValue("startDate", from);
          form.setValue("endDate", undefined as any);
          return;
        }
      }

      form.setValue("startDate", from);
      form.setValue("endDate", to);
    }
  };

  // Check if date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if date is reserved
  const isReservedDate = (date: Date) => {
    return disabledDates.some((disabled) => 
      date.toDateString() === disabled.toDateString()
    );
  };

  // Function to check if a date is disabled (for Calendar component)
  const isDateDisabled = (date: Date) => {
    return isPastDate(date) || isReservedDate(date);
  };

  // Custom day content renderer
  const customDayContent = (date: Date) => {
    const dayNumber = date.getDate();
    const isReserved = isReservedDate(date);
    const isPast = isPastDate(date);

    if (isReserved) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <span className="text-red-500 font-semibold">{dayNumber}</span>
          <div className="absolute inset-0 bg-red-100 opacity-30 rounded"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      );
    }

    return dayNumber;
  };

  return (
    <FormField
      control={form.control}
      name="startDate"
      render={() => (
        <FormItem className="w-full">
          <FormControl>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={1}
              disabled={isDateDisabled}
              formatters={{
                formatDay: customDayContent,
              }}
              className="w-full block"
              classNames={{
                months: "w-full block",
                table: "w-full border-collapse",
                head_row: "w-full flex justify-around",
                row: "w-full flex mt-2",
                cell: "flex-1 text-center",
                day: "w-full h-9 hover:bg-accent hover:text-accent-foreground relative",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                day_range_start: "bg-primary text-primary-foreground rounded-l-md hover:bg-primary hover:text-primary-foreground",
                day_range_end: "bg-primary text-primary-foreground rounded-r-md hover:bg-primary hover:text-primary-foreground", 
                day_range_middle: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                day_hidden: "invisible",
                caption_label: "font-medium text-base",
                nav_button: "text-muted-foreground hover:text-foreground",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}