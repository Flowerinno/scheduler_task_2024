import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { useFetcher } from "@remix-run/react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { CreateTagSchema, createTagSchema } from "~/schema/projectSchema";
import { TextInput } from "./TextInput";

type CreateTagPopupProps = {
	isModalOpen: boolean;
	onModalOpenChange: (open: boolean) => void;
	projectId: string;
};

export const CreateTagPopup = ({
	isModalOpen,
	onModalOpenChange,

	projectId,
}: CreateTagPopupProps) => {
	const fetcher = useFetcher<{ message: string }>();

	const [form, fields] = useForm<CreateTagSchema>({
		defaultValue: {
			tag: "",
			projectId,
		},
		shouldValidate: "onSubmit",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: createTagSchema });
		},
	});

	return (
		<Dialog open={isModalOpen} onOpenChange={onModalOpenChange}>
			<DialogContent className="w-full h-7/12">
				<DialogHeader className="*:text-black">
					<DialogTitle>New tag</DialogTitle>
					<DialogDescription>
						Create a new tag for the project. Must be unique.
					</DialogDescription>
				</DialogHeader>
				<fetcher.Form
					id={form.id}
					noValidate
					method="POST"
					action="/api/projects/tags"
					className="flex flex-col gap-4"
					onSubmit={form.onSubmit}
				>
					<TextInput
						error={fields.tag.errors}
						name={fields.tag.name}
						placeholder="Enter a tag"
					/>

					<input type="hidden" name={fields.projectId.name} value={projectId} />

					<DialogFooter className="justify-end">
						<Button type="submit" variant="default" className="text-white">
							Create
						</Button>

						<DialogClose asChild>
							<Button type="button" variant="secondary">
								Close
							</Button>
						</DialogClose>
					</DialogFooter>
				</fetcher.Form>
			</DialogContent>
		</Dialog>
	);
};
