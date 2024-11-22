import type { MetaFunction } from "@remix-run/node";

import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { ROUTES } from "~/constants/routes";

export const loader = async ({}: LoaderFunctionArgs) => {
	return redirect(ROUTES.projects);
};

export const meta: MetaFunction = () => {
	return [
		{ title: "Scheduler" },
		{ name: "description", content: "Keep and be in TRACK" },
	];
};

export default function Index() {
	return <div className="flex h-screen items-center justify-center">nope</div>;
}
