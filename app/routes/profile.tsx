import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { ProfileMain } from "~/components/profile/ProfileMain";

import { authenticateRoute } from "~/middleware/authenticateRoute";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await authenticateRoute({
		request,
	} as LoaderFunctionArgs);

	return { user };
};

export default function Profile() {
	const { user } = useLoaderData<typeof loader>();

	return (
		<div className=" bg-gray-100 flex flex-col align-middle items-center justify-start gap-4 md:gap-6 min-h-screen text-sm md:text-2xl w-full border-r-[1px] border-gray-400 p-10">
			<div className=" w-full rounded-md flex">
				<ProfileMain userData={user} />
			</div>
		</div>
	);
}
