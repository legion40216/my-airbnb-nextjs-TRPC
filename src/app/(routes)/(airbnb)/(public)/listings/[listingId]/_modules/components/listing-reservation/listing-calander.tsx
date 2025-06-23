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
      // Clear selection - cast to any to bypass TypeScript error
      form.setValue("startDate", undefined as any);
      form.setValue("endDate", undefined as any);
      return;
    }

    const { from, to } = range;

    // If only 'from' is selected (single date click)
    if (from && !to) {
      form.setValue("startDate", from);
      form.setValue("endDate", undefined as any);
      return;
    }

    // If both dates are selected
    if (from && to) {
      // Check if the user clicked on an already selected date to "undo"
      if (startDate && endDate) {
        const fromTime = from.getTime();
        const toTime = to.getTime();
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();

        // If user clicked the same range again, clear the end date
        if (fromTime === startTime && toTime === endTime) {
          form.setValue("startDate", from);
          form.setValue("endDate", undefined as any);
          return;
        }
      }

      // Normal case: set the range
      form.setValue("startDate", from);
      form.setValue("endDate", to);
    }
  };
  // Function to check if a date is disabled
  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return true;
    }

    // Disable reserved dates
    return disabledDates.some((disabled) => 
      date.toDateString() === disabled.toDateString()
    );
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
              initialFocus
              className="w-full block"
              classNames={{
                months: "w-full block",
                table: "w-full border-collapse",
                head_row: "w-full flex justify-around",
                row: "w-full flex mt-2",
                cell: "flex-1 text-center",
                day: "w-full h-9 hover:bg-accent hover:text-accent-foreground",
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