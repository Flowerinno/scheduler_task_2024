import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import invariant from "tiny-invariant";
import { StatisticsTable } from "~/components/StatisticsTable";
import { ROUTES } from "~/constants/routes";
import { authenticateRoute } from "~/middleware/authenticateRoute";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	try {
		const user = await authenticateRoute({ request } as LoaderFunctionArgs);
		invariant(user, "User not found");

		

		return { message: "Hello World" };
	} catch (error) {
		return redirect(ROUTES.projects);
	}
};

function getData(): Payment[] {
	return [
		{
			id: "728ed52f",
			amount: 100,
			status: "pending",
			email: "m@example.com",
		},
	];
}

export type Payment = {
	id: string;
	amount: number;
	status: "pending" | "processing" | "success" | "failed";
	email: string;
};

export const columns: ColumnDef<Payment>[] = [
	{
		accessorKey: "status",
		header: "Status",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "amount",
		header: "Amount",
	},
];

export default function ProjectStatistics() {
	const navigate = useNavigate();

	return (
		<div className="w-full p-10 flex flex-col gap-12 relative">
			<ArrowLeft
				onClick={() => navigate(-1)}
				className="absolute top-4 left-4 cursor-pointer text-black"
			/>

			<h1 className="text-black text-2xl mt-5">Project Statistics</h1>
			<StatisticsTable columns={columns} data={getData()} />
		</div>
	);
}
