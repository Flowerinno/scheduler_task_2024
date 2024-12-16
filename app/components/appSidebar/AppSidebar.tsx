import { ROUTES } from "~/constants/routes";
import {
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	Sidebar,
	SidebarContent,
	SidebarGroup,
	useSidebar,
	SidebarGroupAction,
} from "../ui/sidebar";

import {
	Home,
	Inbox,
	Plus,
	User2Icon,
	ChartArea,
	MenuIcon,
	LogOutIcon,
} from "lucide-react";
import { Link } from "@remix-run/react";
import { AuthUser } from "~/services/auth.server";

const items = [
	{
		title: "Projects",
		url: ROUTES.projects,
		icon: Home,
	},
	{
		title: "My Activities",
		url: ROUTES.myActivities,
		icon: ChartArea,
	},
	{
		title: "Profile",
		url: ROUTES.profile,
		icon: User2Icon,
	},
	{
		title: "Logout",
		url: ROUTES.logout,
		icon: LogOutIcon,
	},
];

type AppSidebarProps = {
	userData: AuthUser;
	onOpenChange: (open: boolean) => void;
	onModalOpenChange: (open: boolean) => void;
	notificationsCount: number;
};

export function AppSidebar({
	userData,
	onOpenChange,
	onModalOpenChange,
	notificationsCount,
}: AppSidebarProps) {
	const { isMobile, openMobile, setOpenMobile, toggleSidebar } = useSidebar();

	if (isMobile && !openMobile) {
		return (
			<MenuIcon
				className="text-black m-4 cursor-pointer"
				onClick={() => toggleSidebar()}
			/>
		);
	}

	return (
		<Sidebar
			collapsible="icon"
			className="*:text-black"
			onMouseEnter={() => onOpenChange(true)}
			onMouseLeave={() => onOpenChange(false)}
			onClick={() => {
				if (isMobile) {
					setOpenMobile(!openMobile);
				}
			}}
		>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-sm">Scheduler</SidebarGroupLabel>
					<SidebarGroupAction title="Create new project">
						<Plus onClick={() => onModalOpenChange(true)} />
					</SidebarGroupAction>
					<SidebarGroupContent />
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link to={ROUTES.inbox} className="relative">
										<Inbox />
										<span>
											Inbox
											{notificationsCount > 0 && (
												<div className="absolute top-0 right-0 bg-red-500 rounded-full min-w-4 min-h-4 h-4 w-4 flex items-center justify-center">
													<span className="text-white text-xs">
														{notificationsCount}
													</span>
												</div>
											)}
										</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link to={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
