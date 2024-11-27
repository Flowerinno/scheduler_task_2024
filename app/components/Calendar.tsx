import { DateRange } from "react-day-picker";
import { Calendar, CalendarProps } from "~/components/ui/calendar";
import { cn } from "~/lib/utils";

type CalendarComponentProps = {
	mode: CalendarProps["mode"];
	selected: Date | DateRange | undefined;
	onSelect: (date: Date | DateRange) => void;
	className?: string;
};

export function CalendarComponent({
	mode = "single",
	selected,
	onSelect,
	className,
}: CalendarComponentProps) {
	return (
		<Calendar
			mode={mode}
			selected={selected}
			//@ts-expect-error
			onSelect={onSelect}
			className={cn("w-full text-white", className)}
		/>
	);
}
