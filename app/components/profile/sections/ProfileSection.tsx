import { Link } from "@remix-run/react";
import { formatDate } from "date-fns";
import { Label } from "~/components/ui/label";
import { ROUTES } from "~/constants/routes";
import { AuthUser } from "~/services/auth.server";

interface ProfileProps {
	userData?: AuthUser;
}

const styles = {
	li: "w-full flex md:flex-row md:items-center gap-2 justify-between border-[1px] p-2 rounded-sm cursor-pointer flex-col items-start",
};

export const ProfileSection = ({ userData }: ProfileProps) => {
	if (!userData) return null;

	return (
		<div className="flex flex-col items-center justify-center gap-5 *:text-black w-full">
			<ul className="flex flex-col items-start justify-center gap-2 p-3 w-full">
				<li className={styles.li}>
					<Label>Full Name</Label>
					<span className="font-bold text-sm">
						{userData.firstName} {userData.lastName}
					</span>
				</li>
				<li className={styles.li}>
					<Label>Email</Label>
					<span className="font-bold text-sm">{userData.email}</span>
				</li>
				<li className={styles.li}>
					<Label>Account Status</Label>
					<span className="font-bold text-sm">{userData.status}</span>
				</li>
				<li className={styles.li}>
					<Label>Registration Date</Label>
					<span className="font-bold text-sm">
						{formatDate(userData.createdAt, "dd/MM/yyyy")}
					</span>
				</li>

				<Link
					to={ROUTES.projects}
					prefetch="render"
					className="text-sm w-full flex flex-row items-center justify-center border-2 p-2 hover:border-[1px] hover:border-black rounded-sm cursor-pointer"
				>
					go to projects
				</Link>
			</ul>
		</div>
	);
};
