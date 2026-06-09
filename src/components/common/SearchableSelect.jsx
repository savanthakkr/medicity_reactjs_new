import React, { useState, useEffect, useMemo, useRef } from 'react';
import ChevronDown from '../../assets/icons/ChevronDown.jsx';

export default function SearchableSelect({
	label,
	required = false,
	placeholder = 'Search and select...',
	options = [],
	value,
	onChange,
	error = '',
	disabled = false,
	id,
	className = '',
	wrapperClassName = ''
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

	// Sync selected value with search input when closed
	useEffect(() => {
		if (!open) {
			const selectedOpt = options.find(o => String(o.value) === String(value));
			setSearch(selectedOpt ? selectedOpt.label : '');
		}
	}, [value, options, open]);

	// Options filtered by search query
	const available = useMemo(() => {
		const q = search.trim().toLowerCase();
		return options.filter(opt => {
			return q && open ? opt.label.toLowerCase().includes(q) : true;
		});
	}, [search, options, open]);

	const select = opt => {
		if (disabled) return;
		onChange(opt.value);
		setSearch(opt.label);
		setOpen(false);
	};

	return (
		<div className={`w-full ${wrapperClassName}`}>
			{label && (
				<label className="form-label" htmlFor={id}>
					{label}
					{required && <span className="text-red-500 ml-0.5">*</span>}
				</label>
			)}

			<div ref={ref} className="relative">
				<input
					type="text"
					id={id}
					className={`form-input pr-10 ${error ? '!border-red-500' : ''} ${
						disabled ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''
					} ${className}`}
					placeholder={placeholder}
					value={search}
					disabled={disabled}
					autoComplete="off"
					onChange={e => {
						setSearch(e.target.value);
						setOpen(true);
					}}
					onFocus={() => {
						if (!disabled) {
							setSearch('');
							setOpen(true);
						}
					}}
				/>

				{/* Chevron icon (similar to Select) */}
				<ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

				{/* Dropdown list */}
				{open && available.length > 0 && (
					<div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[200px] overflow-y-auto rounded-[8px] border border-divider bg-card shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
						{available.map(opt => {
							const isSelected = String(value) === String(opt.value);
							return (
								<button
									type="button"
									key={opt.value}
									onClick={() => select(opt)}
									className={`block w-full px-3 py-2 text-left text-[13px] transition-colors ${
										isSelected ? 'bg-brand-light/10 text-brand-light font-semibold' : 'text-text-1 hover:bg-field'
									}`}
								>
									{opt.label}
								</button>
							);
						})}
					</div>
				)}

				{/* Empty state hint */}
				{open && search.trim() && available.length === 0 && (
					<div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[8px] border border-divider bg-card shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
						<p className="px-3 py-2 text-[12px] text-text-3 italic">No matching options</p>
					</div>
				)}
			</div>

			{/* Validation error */}
			{error && <p className="mt-[4px] text-[11px] leading-tight text-red-600">{error}</p>}
		</div>
	);
}
