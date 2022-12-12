import addDays from 'date-fns/addDays';
import format from 'date-fns/format';

// Jan 1 returns 1, Dec 31 returns 365
export function getDaysIntoYear(date: Date) {
	return (
		(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
			Date.UTC(date.getFullYear(), 0, 0)) /
		24 /
		60 /
		60 /
		1000
	);
}

/**
 * Converts number of days into the year, like 130, into a readable date, like
 * "Jul 10"
 */
export function daysIntoYearAsReadableDate(daysIntoYear: number) {
	const date = addDays(
		new Date(new Date().getFullYear(), 0, 1), 
		daysIntoYear - 1
	);
	const formatted = format(date, 'MMM d');
	const today = format(new Date(), 'MMM d');
	if (formatted === today) {
		return "Today";
	}
	return formatted;
}