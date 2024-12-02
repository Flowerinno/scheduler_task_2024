import { Log } from "@prisma/client";

export const calculateMonthLogs = (logs: Log[], date: Date) => {
	const now = new Date(date);
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();

	const filteredByMonth = logs.filter((log) => {
		const logDate = new Date(log.startTime);

		return (
			logDate.getMonth() === currentMonth &&
			logDate.getFullYear() === currentYear
		);
	});

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

export const calculateDuration = (duration: number | undefined | null) => {
	if (!duration) return "";

	const hours = Math.floor(duration / (1000 * 60 * 60));
	const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

	const formattedDuration = `${String(hours).padStart(2, "0")}:${String(
		minutes
	).padStart(2, "0")}`;

	return formattedDuration;
};
