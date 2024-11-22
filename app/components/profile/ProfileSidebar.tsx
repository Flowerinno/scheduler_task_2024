import { Form, useSubmit } from "@remix-run/react";
import { Label } from "../ui/label";

interface SidebarProps {
	section: string;
}

const sidebarItems = [
	{
		label: "profile",
		icon: "🏠",
		isActive: true,
	},
	{
		label: "logout",
		icon: "❌",
		href: "/logout",
		isActive: false,
	},
];

export const ProfileSidebar = ({ section }: SidebarProps) => {
	const submit = useSubmit();

	const handleClick = (e: React.FormEvent<HTMLFormElement>) => {
		submit(e.target as HTMLButtonElement, {
			method: "GET",
		});
	};

	return (
		<Form
			onSubmit={(e) => handleClick(e)}
			className="w-12/12 md:w-3/12 md:min-h-[500px]  flex flex-row flex-wrap items-center justify-center md:flex md:flex-col md:items-center md:justify-start md:border-r-[1px] border-gray-400 *:text-black dark:border-white p-1"
		>
			{sidebarItems.map((item, index) => {
				return (
					<button
						className={`text-sm md:text-2xl flex flex-row items-start justify-start gap-2 hover:border-[1px] hover:border-black cursor-pointer p-2 rounded-md min-full md:w-36 dark:hover:bg-slate-400`}
						key={index}
						name="sidebar"
						value={item.label}
						type="submit"
					>
						<span className="text-sm">{item.icon}</span>
						<Label
							className={`${
								section === item.label ? "underline" : "no-underline"
							} text-sm p-0 m-0`}
						>
							{item.label}
						</Label>
					</button>
				);
			})}
		</Form>
	);
};
