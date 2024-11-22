import { useFetcher } from "@remix-run/react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";

type SearchFieldProps<T> = {
	searchableKey: keyof T;
	inputName: string;
	inputPlaceholder: string;
	action: string;
	dataKey: string;
	onItemSelect: (item: T) => void;
};

export function SearchField<T>({
	searchableKey,
	inputName,
	inputPlaceholder,
	action,
	dataKey,
	onItemSelect,
}: SearchFieldProps<T>) {
	const fetcher = useFetcher<{ [key: string]: any }>();

	return (
		<Command className="rounded-lg border shadow-md md:min-w-[450px]">
			<fetcher.Form
				method="GET"
				action={action}
				onChange={(e) => {
					try {
						fetcher.submit(e.currentTarget);
					} catch (error) {}
				}}
			>
				<CommandInput name={inputName} placeholder={inputPlaceholder} />
			</fetcher.Form>
			<CommandList>
				{fetcher.data?.[dataKey] && <CommandEmpty>No results found.</CommandEmpty>}
				<CommandGroup heading="Suggestions">
					{fetcher.state === "idle" &&
						fetcher.data?.[dataKey] &&
						//@ts-ignore
						fetcher.data[dataKey].map((suggestion) => {
							return (
								<CommandItem
									className="cursor-pointer"
									onSelect={() => onItemSelect(suggestion)}
									key={suggestion[searchableKey]}
								>
									{suggestion?.email}
								</CommandItem>
							);
						})}
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
