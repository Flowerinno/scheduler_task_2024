import React from "react";
import { Input } from "./ui/input";
import { Cross1Icon } from "@radix-ui/react-icons";

export function DebouncedInput({
	value: initialValue,
	onChange,
	debounce = 500,
	clearButton = false,
	...props
}: {
	value: string | number;
	onChange: (value: string | number) => void;
	debounce?: number;
	clearButton?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
	const [value, setValue] = React.useState(initialValue);

	React.useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	React.useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value);
		}, debounce);

		return () => clearTimeout(timeout);
	}, [value]);

	return (
		<div className="w-full flex justify-between relative">
			<Input
				{...props}
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
			{clearButton && (
				<Cross1Icon
					className="text-black absolute right-4 top-4 hover:text-red-300 cursor-pointer"
					onClick={() => setValue("")}
				/>
			)}
		</div>
	);
}
