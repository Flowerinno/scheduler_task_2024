import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CustomComponents, DayPicker } from "react-day-picker";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
	customComponents?: CustomComponents;
};

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	customComponents,
	...props
}: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("p-0 w-full", className)}
			classNames={{
				root: "w-full",
				caption_start: "w-full",
				caption_end: "w-full",
				months:
					"flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 text-black",
				month: "space-y-4",
				caption: "flex justify-center pt-1 relative items-center",
				caption_label: "text-sm font-medium select-none",
				nav: "space-x-1 flex items-center",
				nav_button: cn(
					buttonVariants({ variant: "outline" }),
					"h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100"
				),
				nav_button_previous: "absolute left-1",
				nav_button_next: "absolute right-1",
				table: "w-full border-collapse",
				head_row: "flex pt-4",
				head_cell:
					"text-neutral-500 rounded-md w-full font-normal text-[0.8rem] dark:text-neutral-400",
				row: "flex w-full",
				cell: "h-12 md:h-24 w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-neutral-100/50 [&:has([aria-selected])]:bg-neutral-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-neutral-800/50 dark:[&:has([aria-selected])]:bg-neutral-800",
				day: cn(
					buttonVariants({ variant: "ghost" }),
					"h-12 md:h-24 w-full p-0 font-normal aria-selected:opacity-100 flex flex-col items-start justify-start p-2 border-[1px]"
				),
				day_range_end: "day-range-end",
				day_selected:
					"bg-neutral-900 text-white hover:bg-neutral-900 hover:text-neutral-50 focus:bg-neutral-900 focus:text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50 dark:hover:text-neutral-900 dark:focus:bg-neutral-50 dark:focus:text-neutral-900",
				day_today:
					"border-[1px] bg-neutral-100  dark:bg-neutral-800 dark:text-neutral-50",
				day_outside:
					"day-outside text-neutral-500 aria-selected:bg-neutral-100/50 aria-selected:text-neutral-500 dark:text-neutral-400 dark:aria-selected:bg-neutral-800/50 dark:aria-selected:text-neutral-400",
				day_disabled: "text-neutral-500 opacity-50 dark:text-neutral-400",
				day_range_middle:
					"aria-selected:bg-neutral-100 aria-selected:text-neutral-900 dark:aria-selected:bg-neutral-800 dark:aria-selected:text-neutral-50",
				day_hidden: "invisible",
				...classNames,
			}}
			components={{
				IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
				IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
				...customComponents,
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
