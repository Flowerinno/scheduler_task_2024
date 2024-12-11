import { Client, Log } from "@prisma/client";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import {
	useFetcher,
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
import { authenticateRoute } from "~/middleware/authenticateRoute";
import { getProjectStatistics } from "~/services/project.server";
import { Order, ROLE } from "~/types";
import {
	calculateDuration,
	getEndOfCurrentWeek,
	getStartOfCurrentWeek,
} from "~/utils/date/dateFormatter";
import { getServerQueryParams } from "~/utils/route/getQueryParams";

export type DateColumn = Client & { logs: Log[] };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	try {
		const user = await authenticateRoute({ request } as LoaderFunctionArgs);
		invariant(user, "User not found");

		const projectId = params.projectId;
		invariant(projectId, "Project ID not found");

		const queryParams = getServerQueryParams(
			["startDate", "endDate", "role"],
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
		});

		return { stats, startDate, endDate, role: queryParams.role };
	} catch (error) {
		return redirect(ROUTES.projects);
	}
};

export default function ProjectStatistics() {
	const navigate = useNavigate();
	const fetcher = useFetcher();
	const location = useLocation();
	const backPath = location.pathname.split("/statistics")[0];

	const { startDate, stats, endDate, role } = useLoaderData<typeof loader>();

	const [searchParams, setSearchParams] = useSearchParams();

	const onSelect = (role: ROLE & "None") => {
		if (role === "None") {
			searchParams.delete("role");
		} else {
			searchParams.set("role", role);
		}

		setSearchParams(searchParams);
	};

	const onUpdate = (props: { range: DateRange }) => {
		const { range } = props;
		const { from, to } = range;

		if (!from || !to) return;

		searchParams.set("startDate", from.toISOString());
		searchParams.set("endDate", to.toISOString());

		setSearchParams(searchParams);
	};

	return (
		<div className="w-full p-10 flex flex-col gap-12 relative">
			<ArrowLeft
				onClick={() => navigate(backPath)}
				className="absolute top-4 left-4 cursor-pointer text-black"
			/>

			<h1 className="text-black text-2xl mt-5">Project Statistics</h1>
			<div className="flex gap-2 justify-end">
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

				<div className="self-end ">
					<DateRangePicker
						initialDateFrom={startDate}
						initialDateTo={endDate}
						onUpdate={(v) => onUpdate(v)}
					/>
				</div>
			</div>
			<StatisticsTable
				columns={generateColumns(startDate, endDate)}
				data={stats}
			/>
		</div>
	);
}

const generateColumns = (startDate: Date, endDate: Date) => {
	const columns: ColumnDef<DateColumn>[] = [];
	let currentDate = new Date(startDate);

	while (!isAfter(currentDate, endDate)) {
		const dateForColumn = new Date(currentDate);

		columns.push({
			header: formatDate(currentDate, "MMM d"),
			cell: (props) => cell(props.row.original, dateForColumn),
		});

		currentDate = addDays(currentDate, 1);
	}

	return columns;
};

const cell = (data: DateColumn, currentDate: Date) => {
	if (!data.logs.length) {
		return "-";
	}

	const log = data.logs.find((entry) => {
		return (
			new Date(entry.startTime).toDateString() === currentDate.toDateString()
		);
	});

	if (log) {
		if (log.isAbsent) {
			return <Label className="text-red-500 ">Absent</Label>;
		}

		if (log.isBillable && log.endTime) {
			const time = calculateDuration(log.duration);
			return <Label>{time}</Label>;
		}
	}

	return <Label>-</Label>;
};
