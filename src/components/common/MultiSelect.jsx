import { useState, useEffect, useMemo, useRef } from 'react';

/**
 * MultiSelect — searchable chip-based multi-select dropdown.
 *
 * Props:
 *   label            {string|ReactNode} — field label (string or JSX)
 *   required         {boolean}          — shows red asterisk when label is a string
 *   placeholder      {string}           — input placeholder text
 *   options          {Array}            — full list: [{ value, label }]
 *   value            {Array}            — selected values (array of value strings)
 *   onChange         {function}         — called with new array of selected values
 *   error            {string}           — validation error message
 *   disabled         {boolean}          — disables the component
 *   id               {string}           — id for the search input (for accessibility)
 *   showPrimaryBadge {boolean}          — marks the first chip with a ★ star badge
 *   primaryBadgeHint {string}           — hint text shown when showPrimaryBadge and
 *                                         more than one item is selected
 */
export default function MultiSelect({
	label,
	required = false,
	placeholder = 'Search and select…',
	options = [],
	value = [],
	onChange,
	error = '',
	disabled = false,
	id,
	showPrimaryBadge = false,
	primaryBadgeHint = ''
}) {
	const [search, setSearch] = useState('');
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		if (!open) return;
		const handler = e => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	// Options not yet selected, filtered by search query
	const available = useMemo(() => {
		const q = search.trim().toLowerCase();
		return options.filter(opt => {
			const isSelected = value.includes(opt.value);
			const matchesSearch = q ? opt.label.toLowerCase().includes(q) : true;
			return !isSelected && matchesSearch;
		});
	}, [search, value, options]);

	const getLabel = val => options.find(o => o.value === val)?.label ?? val;

	const add = opt => {
		if (disabled) return;
		onChange([...value, opt.value]);
		setSearch('');
		setOpen(false);
	};

	const remove = val => {
		if (disabled) return;
		onChange(value.filter(v => v !== val));
	};

	return (
		<div>
			{label && (
				<label className="form-label" htmlFor={id}>
					{typeof label === 'string' ? (
						<>
							{label}
							{required && <span className="text-red-500 ml-0.5">*</span>}
						</>
					) : (
						label
					)}
				</label>
			)}

			<div ref={ref} className="relative">
				<input
					type="text"
					id={id}
					className={`form-input pr-9 ${error ? '!border-red-500' : ''} ${
						disabled ? 'opacity-60 cursor-not-allowed' : ''
					}`}
					placeholder={placeholder}
					value={search}
					disabled={disabled}
					autoComplete="off"
					onChange={e => {
						setSearch(e.target.value);
						setOpen(true);
					}}
					onFocus={() => !disabled && setOpen(true)}
				/>

				{/* Search icon */}
				<svg
					className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="7" />
					<path d="m21 21-4.3-4.3" />
				</svg>

				{/* Dropdown list */}
				{open && available.length > 0 && (
					<div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[200px] overflow-y-auto rounded-[8px] border border-divider bg-card shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
						{available.map(opt => (
							<button
								type="button"
								key={opt.value}
								onClick={() => add(opt)}
								className="block w-full px-3 py-2 text-left text-[12px] text-text-1 hover:bg-field transition-colors"
							>
								{opt.label}
							</button>
						))}
					</div>
				)}

				{/* Empty state hint */}
				{open && search.trim() && available.length === 0 && (
					<div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-[8px] border border-divider bg-card shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
						<p className="px-3 py-2 text-[12px] text-text-3 italic">No matching options</p>
					</div>
				)}
			</div>

			{/* Validation error */}
			{error && <p className="mt-[4px] text-[11px] leading-tight text-red-600">{error}</p>}

			{/* Selected chips */}
			{value.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-2">
					{value.map((val, i) => {
						const isPrimary = showPrimaryBadge && i === 0;
						return (
							<span
								key={val}
								className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
									isPrimary
										? 'border border-brand-light bg-brand-light/10 text-brand-light'
										: 'border border-divider bg-field text-text-2'
								}`}
							>
								{isPrimary && <span className="mr-0.5 font-semibold">★</span>}
								{getLabel(val)}
								{!disabled && (
									<button
										type="button"
										onClick={() => remove(val)}
										className="ml-0.5 text-current opacity-60 hover:opacity-100 transition text-[13px] leading-none"
										aria-label={`Remove ${getLabel(val)}`}
									>
										×
									</button>
								)}
							</span>
						);
					})}
				</div>
			)}

			{/* Primary badge hint */}
			{showPrimaryBadge && primaryBadgeHint && value.length > 1 && (
				<p className="mt-1 text-[10.5px] text-text-3">{primaryBadgeHint}</p>
			)}
		</div>
	);
}
