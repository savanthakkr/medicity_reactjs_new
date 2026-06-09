import React, { useCallback, useEffect, useRef, useState } from 'react';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

function parseDate(value) {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function formatDisplay(date, format = 'DD/MM/YYYY') {
	if (!date) return '';
	const dd = String(date.getDate()).padStart(2, '0');
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const yyyy = String(date.getFullYear());
	return format.replace('DD', dd).replace('MM', mm).replace('YYYY', yyyy);
}

function toISO(date) {
	if (!date) return '';
	const dd = String(date.getDate()).padStart(2, '0');
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	return `${date.getFullYear()}-${mm}-${dd}`;
}

function getDaysInMonth(year, month) {
	return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
	return new Date(year, month, 1).getDay();
}

function isSameDay(a, b) {
	if (!a || !b) return false;
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function isToday(date) {
	return isSameDay(date, new Date());
}

function Calendar({ selected, onSelect, onClose }) {
	const today = new Date();
	const [viewYear, setViewYear] = useState(selected ? selected.getFullYear() : today.getFullYear());
	const [viewMonth, setViewMonth] = useState(selected ? selected.getMonth() : today.getMonth());
	const [mode, setMode] = useState('days');

	const yearRangeSize = 12;
	const startYear = Math.floor(viewYear / yearRangeSize) * yearRangeSize;
	const daysInMonth = getDaysInMonth(viewYear, viewMonth);
	const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

	const prevMonth = () => {
		if (viewMonth === 0) {
			setViewMonth(11);
			setViewYear(year => year - 1);
			return;
		}
		setViewMonth(month => month - 1);
	};

	const nextMonth = () => {
		if (viewMonth === 11) {
			setViewMonth(0);
			setViewYear(year => year + 1);
			return;
		}
		setViewMonth(month => month + 1);
	};

	const handleDayClick = day => {
		onSelect(new Date(viewYear, viewMonth, day));
		onClose();
	};

	const cells = [];
	for (let i = 0; i < firstDay; i += 1) cells.push(null);
	for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

	return (
		<div
			className="w-[248px] rounded-[10px] border border-divider bg-card p-3 text-[13px] text-text-1 shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.06)]"
			role="dialog"
			aria-label="Date picker"
		>
			<div className="mb-[10px] flex items-center justify-between">
				<button
					type="button"
					className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] p-0 text-text-2 transition hover:bg-field hover:text-text-1"
					onClick={mode === 'years' ? () => setViewYear(year => year - yearRangeSize) : prevMonth}
					aria-label="Previous"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<polyline points="15 18 9 12 15 6" />
					</svg>
				</button>

				<div className="flex items-center gap-1">
					<button
						type="button"
						className="rounded-[5px] px-[6px] py-[3px] text-[13px] font-semibold leading-none text-text-1 transition hover:bg-brand-light/10 hover:text-brand-light"
						onClick={() => setMode(mode === 'months' ? 'days' : 'months')}
					>
						{MONTHS[viewMonth]}
					</button>
					<button
						type="button"
						className="rounded-[5px] px-[6px] py-[3px] text-[13px] font-semibold leading-none text-text-1 transition hover:bg-brand-light/10 hover:text-brand-light"
						onClick={() => setMode(mode === 'years' ? 'days' : 'years')}
					>
						{viewYear}
					</button>
				</div>

				<button
					type="button"
					className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] p-0 text-text-2 transition hover:bg-field hover:text-text-1"
					onClick={mode === 'years' ? () => setViewYear(year => year + yearRangeSize) : nextMonth}
					aria-label="Next"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</button>
			</div>

			{mode === 'days' && (
				<>
					<div className="mb-1 grid grid-cols-7">
						{DAYS_OF_WEEK.map(day => (
							<span
								key={day}
								className="py-[3px] text-center text-[11px] font-semibold uppercase tracking-[0.02em] text-text-3"
							>
								{day}
							</span>
						))}
					</div>

					<div className="grid grid-cols-7 gap-px">
						{cells.map((day, index) => {
							if (!day) return <span key={`empty-${index}`} />;

							const date = new Date(viewYear, viewMonth, day);
							const isSelected = isSameDay(date, selected);
							const isCurrentDay = isToday(date);

							return (
								<button
									key={day}
									type="button"
									className={[
										'relative flex h-[30px] w-full items-center justify-center rounded-[6px] p-0 text-[12.5px] text-text-1 transition',
										isSelected ? 'bg-brand-light font-semibold text-white' : 'hover:bg-brand-light/10 hover:text-brand-light'
									].join(' ')}
									onClick={() => handleDayClick(day)}
									aria-label={`${day} ${MONTHS[viewMonth]} ${viewYear}`}
									aria-pressed={isSelected}
								>
									{day}
									{isCurrentDay && !isSelected && (
										<span className="absolute bottom-[3px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-light" />
									)}
								</button>
							);
						})}
					</div>
				</>
			)}

			{mode === 'months' && (
				<div className="grid grid-cols-3 gap-1 py-1">
					{MONTHS.map((month, index) => (
						<button
							key={month}
							type="button"
							className={[
								'rounded-[6px] px-1 py-2 text-center text-[12.5px] text-text-1 transition',
								viewMonth === index
									? 'bg-brand-light font-semibold text-white'
									: 'hover:bg-brand-light/10 hover:text-brand-light'
							].join(' ')}
							onClick={() => {
								setViewMonth(index);
								setMode('days');
							}}
						>
							{month.slice(0, 3)}
						</button>
					))}
				</div>
			)}

			{mode === 'years' && (
				<div className="grid grid-cols-4 gap-1 py-1">
					{Array.from({ length: yearRangeSize }, (_, index) => startYear + index).map(year => (
						<button
							key={year}
							type="button"
							className={[
								'rounded-[6px] px-[2px] py-[7px] text-center text-[12px] text-text-1 transition',
								viewYear === year
									? 'bg-brand-light font-semibold text-white'
									: 'hover:bg-brand-light/10 hover:text-brand-light'
							].join(' ')}
							onClick={() => {
								setViewYear(year);
								setMode('months');
							}}
						>
							{year}
						</button>
					))}
				</div>
			)}

			<div className="mt-[10px] flex gap-2 border-t border-divider pt-2">
				<button
					type="button"
					className="flex-1 rounded-[5px] border border-brand-light bg-brand-light px-2 py-[5px] text-[11.5px] font-medium text-white transition hover:brightness-95"
					onClick={() => {
						onSelect(new Date());
						onClose();
					}}
				>
					Today
				</button>
				<button
					type="button"
					className="flex-1 rounded-[5px] border border-divider bg-transparent px-2 py-[5px] text-[11.5px] font-medium text-text-2 transition hover:border-divider hover:bg-field hover:text-text-1"
					onClick={() => {
						onSelect(null);
						onClose();
					}}
				>
					Clear
				</button>
			</div>
		</div>
	);
}

function CalendarIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
			<line x1="16" y1="2" x2="16" y2="6" />
			<line x1="8" y1="2" x2="8" y2="6" />
			<line x1="3" y1="10" x2="21" y2="10" />
		</svg>
	);
}

const DateInput = ({
	label,
	id,
	name,
	required = false,
	placeholder = 'Select Date',
	className = '',
	wrapperClassName = '',
	value,
	onChange,
	error,
	format = 'DD/MM/YYYY',
	disabled = false,
	...rest
}) => {
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef(null);
	const triggerRef = useRef(null);

	const selectedDate = parseDate(value);

	useEffect(() => {
		if (!open) return undefined;

		const handleMouseDown = event => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setOpen(false);
			}
		};

		document.addEventListener('mousedown', handleMouseDown);
		return () => document.removeEventListener('mousedown', handleMouseDown);
	}, [open]);

	useEffect(() => {
		if (!open) return undefined;

		const handleKeyDown = event => {
			if (event.key === 'Escape') {
				setOpen(false);
				triggerRef.current?.focus();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [open]);

	const handleSelect = useCallback(
		date => {
			if (!onChange) return;

			onChange({
				target: {
					name: name || id,
					value: toISO(date)
				}
			});
		},
		[onChange, name, id]
	);

	const toggleCalendar = () => {
		if (!disabled) setOpen(current => !current);
	};

	const displayValue = formatDisplay(selectedDate, format);
	const fieldClassName = [
		'form-input !flex !h-[38px] !min-h-[34px] !items-center !gap-2 !overflow-hidden !py-0 !pl-[10px] !pr-[6px]',
		disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
		error
			? '!border-red-500 focus-within:!border-red-500 focus-within:shadow-none'
			: 'focus-within:!border-brand-light focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--secondary-color)_18%,transparent)]',
		className
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={`relative w-full ${wrapperClassName}`} ref={wrapperRef}>
			{label && (
				<label htmlFor={id} className="form-label">
					{label}
					{required && <span className="ml-0.5 text-red-500">*</span>}
				</label>
			)}

			<input type="hidden" id={id} name={name || id} value={value || ''} readOnly {...rest} />

			<div
				ref={triggerRef}
				className={fieldClassName}
				role="combobox"
				aria-expanded={open}
				aria-haspopup="dialog"
				aria-label={label || placeholder}
				aria-invalid={!!error}
				aria-disabled={disabled}
				tabIndex={disabled ? -1 : 0}
				onClick={toggleCalendar}
				onKeyDown={event => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						toggleCalendar();
					}
				}}
			>
				<span
					className={[
						'flex min-w-0 flex-1 items-center truncate text-[length:var(--form-input)] leading-none text-text-1',
						!displayValue ? 'text-[11px] text-text-3' : ''
					]
						.filter(Boolean)
						.join(' ')}
				>
					{displayValue || placeholder}
				</span>

				<button
					type="button"
					className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] p-0 text-text-2 transition hover:bg-field hover:text-text-1 disabled:cursor-not-allowed"
					tabIndex={-1}
					aria-hidden="true"
					disabled={disabled}
					onClick={event => {
						event.stopPropagation();
						toggleCalendar();
					}}
				>
					<CalendarIcon />
				</button>
			</div>

			{error && <p className="mt-[4px] text-[11px] leading-tight text-red-600">{error}</p>}

			{open && (
				<div className="absolute left-0 top-[calc(100%+6px)] z-[1000]">
					<Calendar
						selected={selectedDate}
						onSelect={handleSelect}
						onClose={() => {
							setOpen(false);
						}}
					/>
				</div>
			)}
		</div>
	);
};

export default DateInput;
