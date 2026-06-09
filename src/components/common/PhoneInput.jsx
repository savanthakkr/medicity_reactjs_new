/* eslint-disable react/prop-types */
import React from 'react';
import ChevronDown from '../../assets/icons/ChevronDown.jsx';

const PhoneInput = ({
	label,
	id,
	name,
	value = '',
	onChange,
	code = '+91',
	onCodeChange,
	codes = ['+91', '+1', '+44', '+61', '+971'],
	maxLength = 10,
	placeholder = 'Enter mobile number',
	required = false,
	error,
	wrapperClassName = '',
	disabled = false
}) => {
	const handleChange = e => {
		// Strip all non-digit characters silently — numeric only
		const digitsOnly = e.target.value.replace(/\D/g, '');
		onChange({ target: { name: name || id, value: digitsOnly } });
	};

	const handleKeyDown = e => {
		// Block alphabets and special characters at keypress level
		const passThrough = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
		if (passThrough.includes(e.key) || e.ctrlKey || e.metaKey) return;
		if (!/^\d$/.test(e.key)) e.preventDefault();
	};

	return (
		<div className={`w-full ${wrapperClassName}`}>
			{label && (
				<label htmlFor={id} className="form-label">
					{label}
					{required && <span className="ml-0.5 text-red-500">*</span>}
				</label>
			)}

			<div
				className={`flex min-h-[34px] w-full overflow-hidden rounded-[6px] border bg-field transition
        focus-within:border-brand-light focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--secondary-color)_18%,transparent)]
        ${error ? 'border-red-400' : 'border-divider'}
        ${disabled ? 'opacity-60' : ''}`}
			>
				{/* Country code selector */}
				<div className="relative shrink-0">
					<select
						value={code}
						onChange={e => onCodeChange?.(e.target.value)}
						disabled={disabled}
						className="h-full cursor-pointer appearance-none border-r border-divider bg-transparent py-2 pl-3 pr-7 text-[12px] font-medium text-text-2 outline-none"
					>
						{codes.map(c => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
					<ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-3" />
				</div>

				{/* Digit-only number input */}
				<input
					id={id}
					name={name || id}
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					value={value}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					maxLength={maxLength}
					placeholder={placeholder}
					disabled={disabled}
					autoComplete="off"
					className="flex-1 bg-transparent px-3 py-2 text-[12px] text-text-1 outline-none placeholder:text-text-3"
				/>
			</div>

			{error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
		</div>
	);
};

export default PhoneInput;
