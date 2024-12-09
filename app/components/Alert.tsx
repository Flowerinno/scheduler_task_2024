import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

type AlertProps = {
	isAlertOpen: boolean;
	onAlertOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	onAccept: () => void;
};

export const Alert = ({
	isAlertOpen,
	onAlertOpenChange,
	onAccept,
	title,
	description,
}: AlertProps) => {
	return (
		<AlertDialog open={isAlertOpen} onOpenChange={onAlertOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="text-black">{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => onAlertOpenChange(false)}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction onClick={onAccept} className="text-white">
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
