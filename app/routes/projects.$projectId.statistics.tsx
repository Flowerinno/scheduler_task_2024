import { Client, Log } from "@prisma/client";
import { useState } from "react";
import { LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import {
	Link,
	useLoaderData,
	useLocation,
	useNavigate,
	useSearchParams,
} from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { addDays, formatDate, isAfter } from "date-fns";
import { ArrowLeft } from "lucide-react";

import { DateRange } from "react-day-picker";
import invariant from "tiny-invariant";
import { DebouncedInput } from "~/components/DebouncedInput";
import { StatisticsTable } from "~/components/StatisticsTable";
import { DateRangePicker } from "~/components/ui/date-range-picker";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { ROUTES } from "~/constants/routes";
import {
	authenticateAdminOrManager,
	authenticateRoute,
} from "~/middleware/authenticateRoute";
import { getProjectStatistics } from "~/services/project.server";
import { ROLE } from "~/types";
import {
	calculateDuration,
	getEndOfCurrentWeek,
	getStartOfCurrentWeek,
} from "~/utils/date/dateFormatter";
import { getServerQueryParams } from "~/utils/route/getQueryParams.server";
import { ERROR_MESSAGES } from "~/constants/errors";

type OrderBy =
	| "absent-desc"
	| "absent-asc"
	| "billable-desc"
	| "billable-asc"
	| "empty-desc"
	| "none";

type QueryType = Client & { logs: Log[] };

export type DateColumn = QueryType;

const MAX_SELECTABLE_COUNT = 14; //max selectable days in date range picker

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	try {
		const user = await authenticateRoute({ request } as LoaderFunctionArgs);
		invariant(user, ERROR_MESSAGES.userNotFound);

		const projectId = params.projectId;
		invariant(projectId, ERROR_MESSAGES.projectIdRequired);

		await authenticateAdminOrManager(user.id, projectId);

		const queryParams = getServerQueryParams(
			["startDate", "endDate", "role", "search"],
			new URL(request.url)
		);

		const startDate = queryParams.startDate
			? new Date(queryParams.startDate)
			: getStartOfCurrentWeek();

		const endDate = queryParams.endDate
			? new Date(queryParams.endDate)
			: getEndOfCurrentWeek();

		const stats = await getProjectStatistics({
			projectId,
			startDate,
			endDate,
			role: queryParams.role as ROLE | undefined,
			search: queryParams.search,
		});

		return {
			stats,
			startDate,
			endDate,
			role: queryParams.role,
			projectId,
		};
	} catch (error) {
		return redirect(ROUTES.projects);
	}
};

export const meta: MetaFunction = () => {
	return [
		{ title: `Statistics | Scheduler` },
		{ name: "description", content: `Project Statistics` },
	];
};

export default function ProjectStatistics() {
	const navigate = useNavigate();
	const location = useLocation();
	const backPath = location.pathname.split("/statistics")[0];

	const { startDate, stats, endDate, role, projectId } =
		useLoaderData<typeof loader>();

	const [searchParams, setSearchParams] = useSearchParams();

	const [orderBy, setOrderBy] = useState<OrderBy>("none");

	const onSelect = (role: ROLE & "None") => {
		if (role === "None") {
			searchParams.delete("role");
		} else {
			searchParams.set("role", role);
		}

		setSearchParams(searchParams);
	};

	const onUpdate = (props: { range: DateRange }) => {
		const {
			range: { from, to },
		} = props;

		if (!from || !to) return;

		searchParams.set("startDate", from.toISOString());
		searchParams.set("endDate", to.toISOString());

		setSearchParams(searchParams);
	};

	const onChange = (v: string | number) => {
		if (v === "") {
			searchParams.delete("search");
		} else {
			searchParams.set("search", String(v));
		}
		setSearchParams(searchParams);
	};

	const data = orderByHandler(stats, orderBy);

	return (
		<div className="w-full p-10 flex flex-col gap-12 relative">
			<ArrowLeft
				onClick={() => navigate(backPath)}
				className="absolute top-4 left-4 cursor-pointer text-black"
			/>

			<h1 className="text-black text-2xl mt-5">Project Statistics</h1>
			<div className="flex gap-2 justify-end">
				<DebouncedInput
					type="text"
					className="min-h-[44px]"
					value={searchParams.get("search") || ""}
					onChange={(v) => onChange(v)}
					placeholder="Filter by name / email"
					clearButton
				/>

				<Select
					name="orderBy"
					value={orderBy}
					onValueChange={(v) => setOrderBy(v as OrderBy)}
				>
					<SelectTrigger className="w-[120px] h-[44px]">
						<SelectValue placeholder={"Order By"} />
					</SelectTrigger>
					<SelectContent className="min-h-[44px]">
						<SelectGroup>
							<SelectLabel>Order by</SelectLabel>
							<SelectItem value={"absent-desc"}>By most absent</SelectItem>
							<SelectItem value={"absent-asc"}>By least absent</SelectItem>
							<SelectItem value={"billable-desc"}>By most billable</SelectItem>
							<SelectItem value={"billable-asc"}>By least billable</SelectItem>
							<SelectItem value={"empty-desc"}>By empty fields</SelectItem>
							<SelectItem value={"none"}>None</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				<Select
					name="role"
					value={role}
					onValueChange={(r) => onSelect(r as ROLE & "None")}
				>
					<SelectTrigger className="w-[120px] h-[44px]">
						<SelectValue placeholder={"Role"} />
					</SelectTrigger>
					<SelectContent className="min-h-[44px]">
						<SelectGroup>
							<SelectLabel>Change member role</SelectLabel>
							<SelectItem value={ROLE.USER}>{ROLE.USER}</SelectItem>
							<SelectItem value={ROLE.MANAGER}>{ROLE.MANAGER}</SelectItem>
							<SelectItem value={ROLE.ADMIN}>{ROLE.ADMIN}</SelectItem>
							<SelectItem value={"None"}>None</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				<div className="self-end">
					<DateRangePicker
						initialDateFrom={startDate}
						initialDateTo={endDate}
						onUpdate={(v) => onUpdate(v)}
						maxSelectableCount={MAX_SELECTABLE_COUNT}
					/>
				</div>
			</div>
			<StatisticsTable
				columns={generateColumns(startDate, endDate, projectId)}
				data={data}
			/>
		</div>
	);
}

const generateColumns = (startDate: Date, endDate: Date, projectId: string) => {
	const columns: ColumnDef<DateColumn>[] = [];
	let currentDate = new Date(startDate);

	columns.push({
		header: "Name / Email (links to logs)",
		cell: (props) => {
			const row = props.row.original;
			return (
				<div className="flex flex-col gap-2 justify-start items-start">
					<Link
						className="underline underline-offset-1 text-blue-400"
						to={ROUTES.project + projectId + `/team/${row.id}`}
					>
						{row.firstName} {row.lastName} ({row.role})
					</Link>
					<Label className="text-gray-400">{row.email}</Label>
				</div>
			);
		},
		footer: (props) => {
			return (
				<div className="flex items-start justify-start">
					<Label>Total:</Label>
				</div>
			);
		},
	});

	while (!isAfter(currentDate, endDate)) {
		const dateForColumn = new Date(currentDate);

		columns.push({
			header: formatDate(currentDate, "MMM d"),
			cell: (props) => cell(props.row.original, dateForColumn, endDate),
		});

		currentDate = addDays(currentDate, 1);
	}

	columns.push({
		header: "Total",
		cell: (props) => {
			let totalAbsent = 0;
			let totalBillable = {
				count: 0,
				duration: 0,
			};

			for (let i = 0; i < props.row.original.logs.length; i++) {
				const currentLog = props.row.original.logs[i];

				if (currentLog.isAbsent) {
					totalAbsent++;
				}

				if (currentLog.isBillable) {
					totalBillable.count++;
					totalBillable.duration += currentLog.duration || 0;
				}
			}

			return (
				<div className="flex flex-col gap-1 items-start justify-start">
					<Label>
						Absent: <strong className="text-red-500">{totalAbsent}</strong>
					</Label>
					<Label>
						<strong className="text-green-300">Billable: </strong>
						{totalBillable.count}
						{totalBillable.duration > 0
							? ` / ${calculateDuration(totalBillable.duration)}`
							: ""}{" "}
					</Label>
				</div>
			);
		},
		footer: ({ table }) => {
			let absent = 0;
			let billable = 0;

			table.getFilteredRowModel().rows.forEach((row) => {
				row.original.logs.forEach((log) => {
					if (log.isBillable && log.endTime) {
						billable += log.duration || 0;
					}

					if (log.isAbsent) {
						absent++;
					}
				});
			});

			return (
				<div className="flex flex-col gap-1">
					<Label>
						Absent: <strong className="text-red-500">{absent}</strong>
					</Label>
					<Label>
						Billable:{" "}
						<strong className="text-green-300">
							{calculateDuration(billable)}
						</strong>
					</Label>
				</div>
			);
		},
	});

	return columns;
};

const cell = (client: DateColumn, currentDate: Date, endDate: Date) => {
	const log = client.logs.find((entry) => {
		return (
			new Date(entry.startTime).toDateString() === currentDate.toDateString()
		);
	});

	if (!log) return <Label>-</Label>;

	if (log.isAbsent) {
		return <Label className="text-red-500 ">A</Label>;
	}

	if (log.isBillable && log.endTime) {
		const time = calculateDuration(log.duration);
		return <Label className="text-green-300">{time}</Label>;
	}

	return <Label>-</Label>;
};

const orderByHandler = (stats: QueryType[], orderBy: OrderBy) => {
	const data = [...stats];

	switch (orderBy) {
		case "absent-desc":
			return data.sort((a, b) => {
				const aAbsent = a.logs.filter((l) => l.isAbsent).length;
				const bAbsent = b.logs.filter((l) => l.isAbsent).length;
				return bAbsent - aAbsent;
			});
		case "absent-asc":
			return data.sort((a, b) => {
				const aAbsent = a.logs.filter((l) => l.isAbsent).length;
				const bAbsent = b.logs.filter((l) => l.isAbsent).length;
				return aAbsent - bAbsent;
			});
		case "billable-desc":
			return data.sort((a, b) => {
				const aBillable = a.logs.filter((l) => l.isBillable).length;
				const bBillable = b.logs.filter((l) => l.isBillable).length;
				return bBillable - aBillable;
			});
		case "billable-asc":
			return data.sort((a, b) => {
				const aBillable = a.logs.filter((l) => l.isBillable).length;
				const bBillable = b.logs.filter((l) => l.isBillable).length;
				return aBillable - bBillable;
			});
		case "empty-desc":
			return data.sort((a, b) => {
				const aEmpty = a.logs.filter(
					(l) => !l.isBillable && !l.isAbsent
				).length;
				const bEmpty = b.logs.filter(
					(l) => !l.isBillable && !l.isAbsent
				).length;
				return bEmpty - aEmpty;
			});
		case "none":
			return data;
		default:
			return data;
	}
};
