import * as React from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

export type TimeType = "hour" | "minute";

export type StateTimeType = "startTime" | "endTime";

type TimePickerProps = {
	date: Date;
	title: string;
	onDateChange: (type: StateTimeType, time: Date) => void;
	type: StateTimeType;
};

export function TimePicker(props: TimePickerProps) {
	const [date, setDate] = React.useState<Date>(props.date);
	const [isOpen, setIsOpen] = React.useState(false);

	const hours = Array.from({ length: 24 }, (_, i) => i);

	const handleTimeChange = (type: "hour" | "minute", value: string) => {
		if (date) {
			const newDate = new Date(date);
			if (type === "hour") {
				newDate.setHours(parseInt(value));
			} else if (type === "minute") {
				newDate.setMinutes(parseInt(value));
			}
			setDate(newDate);
			props.onDateChange(props.type, newDate);
		}
	};

	const hhMM = date ? format(date, "HH:mm") : "";

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal",
						!date && "text-muted-foreground"
					)}
				>
					<Clock className="mr-2 h-4 w-4" />

					<span>
						{props.title} {hhMM}
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto h-72 p-0 flex">
				<ScrollArea className="h-72 sm:w-auto w-full">
					<div className="flex sm:flex-col p-2">
						{hours.reverse().map((hour) => {
							const isEqual = date && date.getHours() === hour;
							return (
								<Button
									key={hour}
									size="icon"
									variant={isEqual ? "default" : "ghost"}
									className={`sm:w-full shrink-0 aspect-square ${
										isEqual ? "bg-neutral-900 text-white" : ""
									}`}
									onClick={() => handleTimeChange("hour", hour.toString())}
								>
									{hour}
								</Button>
							);
						})}
					</div>
					{/* <ScrollBar orientation="horizontal" className="sm:hidden" /> */}
				</ScrollArea>
				<ScrollArea className="w-64 sm:w-auto">
					<div className="flex sm:flex-col p-2">
						{Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
							const isEqual = date && date.getMinutes() === minute;
							return (
								<Button
									key={minute}
									size="icon"
									variant={isEqual ? "default" : "ghost"}
									className={`sm:w-full shrink-0 aspect-square ${
										isEqual ? "bg-neutral-900 text-white" : ""
									}`}
									onClick={() => handleTimeChange("minute", minute.toString())}
								>
									{minute.toString().padStart(2, "0")}
								</Button>
							);
						})}
					</div>
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}
