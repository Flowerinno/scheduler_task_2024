import { Link } from "@remix-run/react";
import { ROUTES } from "~/constants/routes";
import { AuthUser } from "~/services/auth.server";

interface HeaderProps {
	isAuthenticated?: boolean;
	userData: AuthUser;
	isError?: boolean;
}

export const Header = ({
	userData,
	isAuthenticated = false,
	isError = false,
}: HeaderProps) => {
	const styles = {
		link: "text-sm text-black md:text-xl hover:scale-110",
	};

	return (
		<div className="bg-gray-100 flex flex-row align-middle justify-end w-full p-10 dark:bg-black dark:text-white">
			<div className="flex flex-row items-center justify-evenly gap-2 md:gap-5 ">
				{!isError && (
					<>
						{!isAuthenticated ? (
							<>
								<Link
									prefetch="intent"
									className={styles.link}
									to={ROUTES.login}
								>
									sign in
								</Link>
								<Link
									prefetch="intent"
									className={styles.link}
									to={ROUTES.register}
								>
									sign up
								</Link>
							</>
						) : (
							<Link
								prefetch="intent"
								to={ROUTES.profile}
								className="bg-black  rounded-full h-6 w-6 min-h-6 min-w-6 flex items-center justify-center cursor-pointer hover:scale-110"
							>
								<span className="text-white">
									{userData?.firstName[0].toUpperCase() || "U"}
								</span>
							</Link>
						)}
					</>
				)}
			</div>
		</div>
	);
};
