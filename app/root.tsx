import {
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useLoaderData,
	useLocation,
	useRouteError,
	useRouteLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";

import styles from "./tailwind.css?url";
import { Header } from "./components/sections/Header";
import { authenticator } from "./services/auth.server";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/appSidebar/AppSidebar";
import { checkSidebarVisibility } from "./utils/route/checkSidebarVisibility";
import { ROUTES } from "./constants/routes";
import { useState } from "react";
import { CreateProjectModal } from "./components/appSidebar/CreateProjectModal";
import { getUserNotifications } from "./services/user.server";
import { Notification } from "@prisma/client";
import { ContextType } from "./types";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { Toaster } from "~/components/ui/toaster";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export function ErrorBoundary() {
	const error = useRouteError();

	return (
		<div className="w-full p-10 flex flex-col gap-2 items-center">
			<Label className="text-xl">Looks like something went wrong...</Label>
			<Button asChild className="w-4/12">
				<Link className="text-white" to={ROUTES.projects}>
					Click here to navigate!
				</Link>
			</Button>
		</div>
	);
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await authenticator.isAuthenticated(request);

	let notifications: Notification[] = [];

	if (user) {
		notifications = await getUserNotifications(user.id);
	}

	return { user, notifications };
};

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof loader>("root");

	const [isOpen, setIsOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const location = useLocation();

	const path = location.pathname as ROUTES;

	const isSidebarShown = checkSidebarVisibility(path);

	const countOfNotCheckedNotifications = data?.notifications?.filter(
		(notification) => !notification.checkedAt
	).length;

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<Toaster />
				<Header
					userData={data?.user}
					isAuthenticated={data?.user?.id ? true : false}
				/>
				<main className="relative">
					{isModalOpen && (
						<CreateProjectModal
							isModalOpen={isModalOpen}
							onModalOpenChange={setIsModalOpen}
							userData={data?.user}
						/>
					)}
					{isSidebarShown ? (
						<SidebarProvider defaultOpen={false} open={isOpen}>
							<AppSidebar
								userData={data?.user}
								onOpenChange={setIsOpen}
								onModalOpenChange={setIsModalOpen}
								notificationsCount={countOfNotCheckedNotifications ?? 0}
							/>

							{children}
						</SidebarProvider>
					) : (
						children
					)}
				</main>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const data = useLoaderData<typeof loader>();

	return (
		<Outlet
			context={
				{
					user: data?.user,
					notifications: data?.notifications,
				} satisfies ContextType
			}
		/>
	);
}
