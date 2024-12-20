import { useLoaderData } from "@remix-run/react";
import { ToastProps } from "./ui/toast";
import { toast } from "~/hooks/use-toast";
import { Toaster } from "./ui/toaster";
import { useEffect } from "react";

type ToastLoaderType = {
	toastMessage: { message: string; variant: ToastProps["variant"] };
};

export const Toast = () => {
	const { toastMessage } = useLoaderData<ToastLoaderType>();

	if (!toastMessage) return null;

	const { message, variant } = toastMessage;

	useEffect(() => {
		toast({
			title: message,
			variant,
		});
	}, [message]);

	return <Toaster />;
};
