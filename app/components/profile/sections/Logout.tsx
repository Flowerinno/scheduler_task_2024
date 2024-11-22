import { Form } from "@remix-run/react";
import { Label } from "~/components/ui/label";

export const Logout = () => {
	return (
		<Form method="POST" action="/logout" className="w-full *:text-black">
			<div className="flex flex-col gap-10 items-center justify-center w-full h-full p-3">
				<Label>Are you sure you want to log out ?</Label>
				<button
					type="submit"
					className="border-2 border-black dark:border-white text-sm  p-1 rounded-md w-24 cursor-pointer hover:bg-red-500 hover:border-red-500"
				>
					yes
				</button>
			</div>
		</Form>
	);
};
