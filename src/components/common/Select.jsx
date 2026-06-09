import React from 'react';
import ChevronDown from '../../assets/icons/ChevronDown.jsx';

const Select = ({
	label,
	id,
	options = [],
	required = false,
	active = false,
	placeholder,
	className = '',
	wrapperClassName = '',
	children,
	...rest
}) => {
	return (
		<div className={`w-full ${wrapperClassName}`}>
			{label && (
				<label htmlFor={id} className="form-label">
					{label}
					{required && <span className="text-red-500 ml-0.5">*</span>}
				</label>
			)}
			<div className="relative">
				<select
					id={id}
					className={`form-input pr-10 appearance-none ${active ? 'is-active' : ''} ${className}`}
					{...rest}
				>
					{placeholder && (
						<option value="" disabled hidden>
							{placeholder}
						</option>
					)}
					{children ||
						options.map(opt => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
				</select>
				<ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
			</div>
		</div>
	);
};

export default Select;
