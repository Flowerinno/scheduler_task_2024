import { Input } from "./ui/input";
import * as React from "react";
import { Label } from "./ui/label";

type TextInputProps = React.ComponentProps<typeof Input> & {
	error: string[] | undefined;
};

export const TextInput = (props: TextInputProps) => {
	return (
		<div className="w-full">
			<Input {...props} />
			<Label className="text-red-300">{props.error}</Label>
		</div>
	);
};
