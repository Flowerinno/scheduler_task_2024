import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";

//TODO decide on a user type (zod/default)
export let authenticator = new Authenticator<any>(sessionStorage);

authenticator.use(
	new FormStrategy(async ({ form }) => {
		let email = form.get("email");
		let password = form.get("password");
		// let user = await login(email, password);
		let user = {}; // TODO

		return user;
	}),
	"user-pass"
);
