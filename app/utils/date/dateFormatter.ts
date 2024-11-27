import { Log } from "@prisma/client";

export const calculateMonthLogs = (logs: Log[], month: number) => {
	const filteredByMonth = logs.filter(
		(log) => new Date(log.createdAt).getMonth() === month
	);

	const total = accumulateHours(filteredByMonth);

	return total;
};

export const calculateTotalLogs = (logs: Log[]) => {
	return accumulateHours(logs);
};

export const accumulateHours = (logs: Log[]) => {
	const total = logs.reduce((acc, log) => {
		if (!log.isAbsent && log.endTime) {
			const startTime = new Date(log.startTime);
			const endTime = new Date(log.endTime);
			const diff = endTime.getTime() - startTime.getTime();
			const hours = diff / (1000 * 60 * 60);
			return acc + hours;
		}

		return acc;
	}, 0);

	return total;
};
