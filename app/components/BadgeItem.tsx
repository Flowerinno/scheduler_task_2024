import { Badge } from "./ui/badge";

type BadgeListProps = {
	onClick: () => void;
	title: string;
};

export const BadgeItem = ({ onClick, title }: BadgeListProps) => {
	return (
		<Badge onClick={onClick} className="cursor-pointer">
			{title}
		</Badge>
	);
};
