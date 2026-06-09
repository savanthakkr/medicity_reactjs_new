import React from 'react';
import Tooltip from '../dropdown/Tooltip.jsx';

export const formatDateOnly = dateString => {
	if (!dateString) return '';
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return '';
	return date.toLocaleDateString('en-US');
};

export const formatDateTimeTooltip = dateString => {
	if (!dateString) return '';
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return '';

	const datePart = date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});

	const timePart = date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: true
	});

	const offset = date.getTimezoneOffset();
	const sign = offset > 0 ? '-' : '+';
	const absOffset = Math.abs(offset);
	const hours = Math.floor(absOffset / 60);
	const minutes = absOffset % 60;
	const timeZone = `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;

	return `${datePart} at ${timePart} ${timeZone}`;
};

const DateTimeCell = ({ value }) => {
	if (!value) {
		return <span className="text-text-3 italic">—</span>;
	}

	return (
		<Tooltip title={formatDateTimeTooltip(value)}>
			<span className="text-text-2 transition-colors hover:text-text-1">{formatDateOnly(value)}</span>
		</Tooltip>
	);
};

export default DateTimeCell;
