import { AuthUser } from "~/services/auth.server";
import { Logout } from "./sections/Logout";
import { ProfileSection } from "./sections/ProfileSection";

type SidebarLabels = "profile" | "logout";

interface MainProps {
	section: string;
	userData?: AuthUser;
}

export const ProfileMain = ({ section, userData }: MainProps) => {
	const presentSections = {
		profile: <ProfileSection userData={userData} />,
		logout: <Logout />,
	} as const;

	return (
		<div className="w-full md:w-9/12 h-full flex flex-col items-center p-0">
			{presentSections[section as SidebarLabels]}
		</div>
	);
};
