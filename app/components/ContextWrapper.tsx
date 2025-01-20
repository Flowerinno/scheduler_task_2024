import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "~/components/ui/context-menu";

export type ContextWrapperProps = {
	children: React.ReactNode;
	tagId: string;
	onTagDeletion: (tagId: string) => void;
};

export function ContextWrapper({
	children,
	tagId,
	onTagDeletion,
}: ContextWrapperProps) {
	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem
					onClick={(e) => {
						e.preventDefault();
						onTagDeletion(tagId);
					}}
				>
					Remove
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
