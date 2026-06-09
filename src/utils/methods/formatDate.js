const DATE_OPTS = { day: '2-digit', month: 'short', year: 'numeric' };
const LOCALE = 'en-IN';

// Returns "05 Jun 2026" or "—" for empty/invalid values
export const formatDate = value => {
	if (!value) return '—';
	const d = new Date(value);
	return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(LOCALE, DATE_OPTS);
};

// Returns "05 Jun 2026, 03:45 PM" for timestamps
export const formatDateTime = value => {
	if (!value) return '—';
	const d = new Date(value);
	if (isNaN(d.getTime())) return '—';
	const date = d.toLocaleDateString(LOCALE, DATE_OPTS);
	const time = d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: true });
	return `${date}, ${time}`;
};
