import { AuthUser } from "~/services/auth.server";
import { ProfileSection } from "./sections/ProfileSection";

interface MainProps {
	userData?: AuthUser;
}

export const ProfileMain = ({ userData }: MainProps) => {
	return (
		<div className="w-full h-full flex flex-col items-center p-0">
			<ProfileSection userData={userData} />
		</div>
	);
};
