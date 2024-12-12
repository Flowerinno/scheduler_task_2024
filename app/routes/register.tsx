import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Label } from "~/components/ui/label";
import { useActionData, Form } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { ROUTES } from "~/constants/routes";
import { registerSchema } from "~/schema/authSchema";
import { TextInput } from "~/components/TextInput";

import {
	redirect,
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";
import { ERROR_MESSAGES } from "~/constants/errors";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await authenticator.isAuthenticated(request);

	if (user) redirect(ROUTES.projects);

	return { message: "Register action" };
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.clone().formData();

	const submission = parseWithZod(formData, { schema: registerSchema });

	if (submission.status !== "success") {
		return submission.reply();
	}

	const user = await authenticator.authenticate("user-pass", request);

	if (!user) {
		return submission.reply({
			formErrors: [ERROR_MESSAGES.cannotAuthenticate],
		});
	}

	const session = await getSession(request.headers.get("cookie"));

	session.set(authenticator.sessionKey, user);

	let headers = new Headers({ "Set-Cookie": await commitSession(session) });

	return redirect(ROUTES.projects, { headers });
};

export default function Register() {
	const lastResult = useActionData<typeof action>();

	const [form, fields] = useForm({
		defaultValue: {
			email: "",
			password: "",
			firstName: "",
			lastName: "",
		},
		shouldValidate: "onSubmit",
		lastResult,
		onValidate: ({ formData }) => {
			return parseWithZod(formData, { schema: registerSchema });
		},
	});

	return (
		<div className="flex flex-col items-center justify-center pt-14 gap-5  *:text-black">
			<Label className="text-lg">Welcome to Scheduler</Label>
			{form.errors && <Label className="text-red-500">{form.errors[0]}</Label>}
			<br />
			<Form
				method="post"
				className="w-full [&>div]:w-7/12 border-black flex flex-col items-center justify-center gap-4"
			>
				<TextInput
					name="email"
					placeholder="Email"
					error={fields.email.errors}
				/>

				<TextInput
					name="password"
					placeholder="Password"
					error={fields.password.errors}
				/>

				<TextInput
					name="firstName"
					placeholder="First Name"
					error={fields.firstName.errors}
				/>

				<TextInput
					name="lastName"
					placeholder="Last Name"
					error={fields.lastName.errors}
				/>

				<input type="hidden" name="action" value="register" />

				<Button type="submit" variant={"outline"}>
					Create account
				</Button>
			</Form>
			<Link to={ROUTES.login} className="hover:underline">
				Already have a Scheduler account? Sign in
			</Link>
		</div>
	);
}
