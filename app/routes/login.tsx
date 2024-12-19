import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, Link, useActionData } from "@remix-run/react";
import { loginSchema } from "~/schema/authSchema";
import { ROUTES } from "~/constants/routes";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { TextInput } from "~/components/TextInput";
import { ERROR_MESSAGES } from "~/constants/errors";
import { commitSession, getSession } from "~/services/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await authenticator.isAuthenticated(request);

	if (user) {
		return redirect(ROUTES.projects);
	}

	return { message: "Login action" };
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.clone().formData();

	const submission = parseWithZod(formData, { schema: loginSchema });

	if (submission.status !== "success") {
		return submission.reply();
	}

	const user = await authenticator.authenticate("user-pass", request);

	if (!user) {
		return submission.reply({
			formErrors: [ERROR_MESSAGES.wrongEmailOrPassword],
		});
	}

	const session = await getSession(request.headers.get("cookie"));

	session.set(authenticator.sessionKey, user);

	let headers = new Headers({ "Set-Cookie": await commitSession(session) });

	return redirect(ROUTES.projects, { headers });
};

export const meta: MetaFunction = () => {
	return [
		{ title: "Login | Scheduler" },
		{ name: "description", content: "Login to your account" },
	];
};

export default function Login() {
	const lastResult = useActionData<typeof action>();

	const [form, fields] = useForm({
		defaultValue: {
			email: "",
			password: "",
		},
		shouldValidate: "onSubmit",
		lastResult,
		onValidate: ({ formData }) => {
			return parseWithZod(formData, { schema: loginSchema });
		},
	});

	return (
		<div className="flex flex-col items-center justify-center gap-5 pt-14">
			<Label className="text-lg text-black">Welcome to Scheduler</Label>
			<br />
			{form.errors && <Label className="text-red-500">{form.errors[0]}</Label>}
			<Form
				method="post"
				className="w-full border-black flex flex-col items-center justify-center gap-4 [&>div]:w-7/12"
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

				<input type="hidden" name="action" value="login" />
				<Button type="submit" variant={"outline"}>
					Sign in
				</Button>
			</Form>
			<Link to={ROUTES.register} className="hover:underline text-black">
				Create new account
			</Link>
		</div>
	);
}
