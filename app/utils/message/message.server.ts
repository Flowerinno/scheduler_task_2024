import { data, redirect, Session } from "@remix-run/node";
import { ToastProps } from "~/components/ui/toast";
import { commitSession } from "~/services/session.server";

export type ToastMessage = {
	message: string;
	variant: ToastProps["variant"];
};

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export function setSuccessMessage(session: Session, message: string) {
	session.flash("toastMessage", {
		message,
		variant: "default",
	} as ToastMessage);
}

export function setErrorMessage(session: Session, message: string) {
	session.flash("toastMessage", {
		message,
		variant: "destructive",
	} as ToastMessage);
}

export async function setToastMessageCookie(
	session: Session
): Promise<HeadersInit> {
	return {
		"Set-Cookie": await commitSession(session, {
			expires: new Date(Date.now() + ONE_YEAR),
		}),
	};
}

export async function redirectWithSession(path: string, session: Session) {
	return redirect(path, {
		headers: {
			"Set-Cookie": await commitSession(session, {
				expires: new Date(Date.now() + ONE_YEAR),
			}),
		},
	});
}

export async function nullableResponseWithMessage(session: Session) {
	return data(null, {
		headers: await setToastMessageCookie(session),
	});
}
