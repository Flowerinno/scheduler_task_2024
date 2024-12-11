import { Client, Log, Project } from "@prisma/client";
import { formatDate } from "date-fns";
import { calculateDuration } from "~/utils/date/dateFormatter";
import { Label } from "./ui/label";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

type FilterOptions = "Absent" | "Billable";

type UserActivityListProps<T> = {
	logs: T & Array<Log & { project: Project } & { client: Client }>;
};

export const UserActivityList = <T,>({ logs }: UserActivityListProps<T>) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const [filter, setFilter] = useState("");

	const take = searchParams.get("take");

	const expandActivities = () => {
		if (take) {
			searchParams.set("take", String(+take + 31));
		} else {
			searchParams.set("take", "62");
		}
		setSearchParams(searchParams, {
			preventScrollReset: true,
		});
	};

	const handleToogle = (filterOption: FilterOptions) => {
		if (filterOption === filter) {
			setFilter("");
			return;
		}

		setFilter(filterOption);
	};

	return (
		<div className="p-10 flex flex-col gap-3 w-full">
			<ToggleGroup
				type="single"
				className="p-0 m-0 text-sm text-black flex-[0.3] flex justify-start"
			>
				<ToggleGroupItem
					value={"Absent"}
					className={cn(["text-red-300 text-xs"])}
					onClick={() => handleToogle("Absent")}
				>
					Absent Only
				</ToggleGroupItem>
				<ToggleGroupItem
					value={"Billable"}
					className={cn(["text-green-300 text-xs"])}
					onClick={() => handleToogle("Billable")}
				>
					Billable Only
				</ToggleGroupItem>
			</ToggleGroup>

			{logs
				.filter((log) => {
					if (filter === "Absent") {
						return log.isAbsent;
					} else if (filter === "Billable") {
						return log.isBillable && !log.isAbsent;
					} else {
						return true;
					}
				})
				.map((log, key) => {
					const creationDate = formatDate(log.createdAt, "dd/MM/yyyy");

					const duration = !log.isAbsent
						? calculateDuration(log.duration)
						: "N/A";

					const startTime = !log.isAbsent
						? formatDate(log.startTime, "HH:mm")
						: "N/A";

					const endTime =
						!log.isAbsent && log.endTime
							? formatDate(log?.endTime, "HH:mm")
							: "N/A";

					const date = formatDate(log.startTime, "d LLL");
					return (
						<>
							<Label className="font-bold">{date}</Label>
							<Separator />

							<div
								key={key}
								className="p-2 flex justify-between items-center w-full"
							>
								<div className="flex justify-between flex-[0.8]">
									<Label>
										Project: {log.project?.name} | Role: {log.client.role} |{' '}
										<strong
											className={cn([
												log.isBillable && "text-green-300",
												log.isAbsent && "text-red-300",
											])}
										>
											{log.isBillable && !log.isAbsent ? "Billable" : "Absent"}
										</strong>
									</Label>
									<Label>Added At: {creationDate}</Label>
								</div>

								<div className="flex flex-col gap-1">
									<Label className={cn([log.isAbsent && "", "flex-[0.2]"])}>
										Duration: {duration}
									</Label>
									<Label className={cn([log.isAbsent && "", "flex-[0.2]"])}>
										Start Time: {startTime}
									</Label>
									<Label className={cn([log.isAbsent && "", "flex-[0.2]"])}>
										End Time: {endTime}
									</Label>
								</div>
							</div>
							<Separator />
						</>
					);
				})}
			<br />
			<Button variant={"outline"} onClick={expandActivities}>
				Expand activities
			</Button>
		</div>
	);
};
