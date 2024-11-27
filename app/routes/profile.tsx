import { useLoaderData, useOutletContext } from "@remix-run/react";
import { ProfileSidebar } from "~/components/profile/ProfileSidebar";
import { LoaderFunctionArgs } from "@remix-run/node";
import { ProfileMain } from "~/components/profile/ProfileMain";
import { ContextType } from "~/types";
import { authenticateRoute } from "~/middleware/authenticateRoute";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const params = new URLSearchParams(url.search);

	const section = params.get("sidebar");

	await authenticateRoute({
		request,
	} as LoaderFunctionArgs);

	return { section };
};

export default function Profile() {
	const { section } = useLoaderData<typeof loader>();
	const { user } = useOutletContext<ContextType>();

	return (
		<div className="p-5 bg-gray-100 flex flex-col align-middle items-center justify-start gap-4 md:gap-6 min-h-screen text-sm md:text-2xl w-full border-r-[1px] border-gray-400">
			<div className=" w-11/12 rounded-md flex flex-col md:flex md:flex-row">
				<ProfileSidebar section={section ?? "profile"} />
				<ProfileMain section={section ?? "profile"} userData={user} />
			</div>
		</div>
	);
}
