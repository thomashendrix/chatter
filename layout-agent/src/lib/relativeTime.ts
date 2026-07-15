const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Prefer relative labels within this window of "now". */
const RELATIVE_WINDOW = 2 * DAY;

const absoluteDateTime = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
});

const absoluteSameYear = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
});

const absoluteSameDay = new Intl.DateTimeFormat(undefined, {
	hour: 'numeric',
	minute: '2-digit',
});

const relativeTime = new Intl.RelativeTimeFormat(undefined, {
	numeric: 'auto',
});

export const toDate = (value: string | number | Date): Date => {
	if (value instanceof Date) {
		return value;
	}

	return new Date(value);
};

const startOfLocalDay = (date: Date) =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const pickRelativeUnit = (deltaMs: number): { value: number; unit: Intl.RelativeTimeFormatUnit } => {
	const abs = Math.abs(deltaMs);

	if (abs < MINUTE) {
		return { value: Math.round(deltaMs / SECOND), unit: 'second' };
	}

	if (abs < HOUR) {
		return { value: Math.round(deltaMs / MINUTE), unit: 'minute' };
	}

	if (abs < DAY) {
		return { value: Math.round(deltaMs / HOUR), unit: 'hour' };
	}

	return { value: Math.round(deltaMs / DAY), unit: 'day' };
};

/** Full absolute timestamp for tooltips / accessibility. */
export const formatAbsoluteTime = (value: string | number | Date, now = Date.now()): string => {
	const date = toDate(value);
	if (Number.isNaN(date.getTime())) {
		return '';
	}

	const then = date.getTime();
	const sameYear = date.getFullYear() === new Date(now).getFullYear();
	const sameDay = startOfLocalDay(date) === startOfLocalDay(new Date(now));

	if (sameDay) {
		return absoluteSameDay.format(date);
	}

	if (sameYear) {
		return absoluteSameYear.format(date);
	}

	return absoluteDateTime.format(date);
};

/**
 * Pretty date/time relative to `now`.
 * Close to now → relative ("just now", "5 minutes ago", "yesterday").
 * Farther away → calendar-style absolute with time.
 */
export const formatRelativeTime = (value: string | number | Date, now = Date.now()): string => {
	const date = toDate(value);
	const then = date.getTime();

	if (Number.isNaN(then)) {
		return '';
	}

	const deltaMs = then - now;
	const abs = Math.abs(deltaMs);

	if (abs < 45 * SECOND) {
		return deltaMs <= 0 ? 'just now' : 'in a moment';
	}

	if (abs < RELATIVE_WINDOW) {
		const { value: amount, unit } = pickRelativeUnit(deltaMs);
		return relativeTime.format(amount, unit);
	}

	return formatAbsoluteTime(date, now);
};

/** How often a live label should refresh for this timestamp. */
export const refreshIntervalMs = (value: string | number | Date, now = Date.now()): number => {
	const date = toDate(value);
	const abs = Math.abs(date.getTime() - now);

	if (Number.isNaN(abs)) {
		return HOUR;
	}

	if (abs < MINUTE) {
		return 15 * SECOND;
	}

	if (abs < HOUR) {
		return 30 * SECOND;
	}

	if (abs < DAY) {
		return 5 * MINUTE;
	}

	return HOUR;
};
