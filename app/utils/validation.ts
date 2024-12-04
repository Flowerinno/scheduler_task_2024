export const validateBool = (arg: string) => {
	if (!arg) return false;

	if (typeof arg === "boolean") {
		return arg === true;
	}

	return arg === "true" || arg === "on" ? true : false;
};
