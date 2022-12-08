// Jan 1 returns 1, Dec 31 returns 365
export function daysIntoYear(date: Date) {
	return (
		(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
			Date.UTC(date.getFullYear(), 0, 0)) /
		24 /
		60 /
		60 /
		1000
	);
}
