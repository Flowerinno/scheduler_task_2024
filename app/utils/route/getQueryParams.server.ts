export const getServerQueryParams = (
	keys: string[],
	url: URL
): Record<string, string> => {
	const params: Record<string, string> = {};

	const searchParams = url.searchParams;

	keys.forEach((key) => {
		const value = searchParams.get(key);
		if (value) params[key] = value;
	});

	return params;
};
