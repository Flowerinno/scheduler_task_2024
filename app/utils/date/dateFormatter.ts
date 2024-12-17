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

	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
		2,
		"0"
	)}`;
};

export const getStartOfTheDay = (date: Date) => {
	const newDate = new Date(date);
	newDate.setHours(0, 0, 0, 0);
	return newDate;
};

export const getEndOfTheDay = (date: Date) => {
	const newDate = new Date(date);
	newDate.setHours(23, 59, 59, 999);
	return newDate;
};

export const getStartOfCurrentWeek = () => {
	const now = new Date();
	const day = now.getDay();
	const diff = now.getDate() - day + (day === 0 ? -6 : 1);
	const startOfWeek = new Date(now.setDate(diff));
	startOfWeek.setHours(0, 0, 0, 0);
	return startOfWeek;
};

export const getEndOfCurrentWeek = () => {
	const now = new Date();
	const day = now.getDay();
	const diff = now.getDate() - day + (day === 0 ? -6 : 1);
	const endOfWeek = new Date(now.setDate(diff + 6));
	endOfWeek.setHours(23, 59, 59, 999);
	return endOfWeek;
};
