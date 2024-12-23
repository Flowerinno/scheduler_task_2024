import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher, useOutletContext } from "@remix-run/react";
import { Check, Ban, Delete } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { authenticateRoute } from "~/middleware/authenticateRoute";
import { ContextType } from "~/types";
import {
	answerProjectInvitation,
	removeNotification,
} from "~/services/user.server";
import { formatDate } from "date-fns";
import { inboxSchema } from "~/schema/inboxSchema";
import { parseWithZod } from "@conform-to/zod";
import { getSession } from "~/services/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const session = await getSession(request.headers.get("cookie"));

	await authenticateRoute({
		request,
	} as ActionFunctionArgs);

	const formData = await request.formData();

	const submission = parseWithZod(formData, { schema: inboxSchema });

	if (submission.status !== "success") {
		return submission.reply();
	}

	const { notificationId, answer, action, projectId } = submission.value;

	if (action === "remove") {
		return await removeNotification(notificationId as string, session);
	} else {
		return await answerProjectInvitation(
			notificationId as string,
			projectId as string,
			answer === "true",
			session
		);
	}
};

export const meta: MetaFunction = () => {
	return [
		{ title: "Inbox | Scheduler" },
		{ name: "description", content: "Your Notifications" },
	];
};

export default function Inbox() {
	const { notifications } = useOutletContext<ContextType>();

	const fetcher = useFetcher();

	if (!notifications || notifications.length === 0) {
		return (
			<div className="p-10">
				<Label>No notifications</Label>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 w-full h-full p-10">
			{notifications?.length > 0 &&
				notifications.map((notification) => (
					<div
						key={notification.id}
						className="rounded-md border-[1px] border-gray-400 p-2 cursor-pointer flex flex-row justify-between items-center"
					>
						<Label className="text-black">
							{notification.message} {"| "}
							{formatDate(notification.createdAt, "dd/MM/yyyy")} -{" "}
							{formatDate(notification.createdAt, "HH:mm")}
						</Label>
						{notification.answer === null && (
							<div className="flex gap-4">
								<fetcher.Form method="POST">
									<Button
										type="submit"
										name="answer"
										value={"true"}
										variant={"ghost"}
										className="bg-green-400 md:min-w-24"
									>
										<Check />
									</Button>
									<input
										type="hidden"
										name="notificationId"
										value={notification.id}
									/>
									<input type="hidden" name="action" value={"answer"} />
									<input
										type="hidden"
										name="projectId"
										value={notification?.projectId ?? ""}
									/>
								</fetcher.Form>
								<fetcher.Form method="POST">
									<Button
										type="submit"
										name="answer"
										value={"false"}
										variant={"destructive"}
										className="md:min-w-24"
									>
										<Ban />
									</Button>
									<input
										type="hidden"
										name="notificationId"
										value={notification.id}
									/>
									<input type="hidden" name="action" value={"answer"} />
									<input
										type="hidden"
										name="projectId"
										value={notification?.projectId ?? ""}
									/>
								</fetcher.Form>
							</div>
						)}
						{notification.answer !== null && (
							<fetcher.Form method="POST">
								<Button
									type="submit"
									variant={"destructive"}
									name="notificationId"
									value={notification.id}
								>
									<Delete />
								</Button>
								<input type="hidden" name="action" value={"remove"} />
								<input type="hidden" name="answer" value={"true"} />
							</fetcher.Form>
						)}
					</div>
				))}
		</div>
	);
}
