import type { MetaFunction } from "@remix-run/node";

import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	return { message: "hello!" };
};

export const meta: MetaFunction = () => {
	return [
		{ title: "Scheduler" },
		{ name: "description", content: "Keep and be in TRACK" },
	];
};

export default function Index() {
	// const { message } = useLoaderData<typeof loader>();

	return (
		<div className="flex h-screen items-center justify-center">here ?</div>
	);
}
