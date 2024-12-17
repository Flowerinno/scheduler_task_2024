import { redirect, ActionFunctionArgs } from "@remix-run/node";
import { Form, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { ROUTES } from "~/constants/routes";
import { destroySession, getSession } from "~/services/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const session = await getSession(request.headers.get("cookie"));

		let headers = new Headers({ "Set-Cookie": await destroySession(session) });

		return redirect(ROUTES.login, { headers });
	} catch (error) {
		return redirect(ROUTES.login);
	}
};

export default function Logout() {
	const navigate = useNavigate();

	return (
		<Form method="POST" className="w-full *:text-black p-10">
			<div className="flex flex-col gap-10  w-full h-full p-3">
				<Label>Are you sure you want to sign out ?</Label>
				<div className="flex gap-4">
					<Button
						type="submit"
						variant={"destructive"}
						className="  text-sm  p-1 rounded-md w-24 cursor-pointer"
					>
						Sign Out
					</Button>
					<Button
						variant={"ghost"}
						type="button"
						className="border-2 border-black dark:border-white text-sm  p-1 rounded-md w-24 cursor-pointer hover:bg-black hover:text-white"
						onClick={() => navigate(ROUTES.projects)}
					>
						Back
					</Button>
				</div>
			</div>
		</Form>
	);
}
