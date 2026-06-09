/* eslint-disable react/prop-types */
import React from 'react';
import CheckIcon from '../../assets/icons/CheckIcon.jsx';

const Checkbox = ({ label, id, checked = false, onChange, className = '', labelClassName = '', boxClassName = '' }) => {
	return (
		<label htmlFor={id} className={`inline-flex cursor-pointer select-none items-center gap-2 ${className}`}>
			<span className="relative inline-flex h-4 w-4 shrink-0">
				<input
					id={id}
					type="checkbox"
					checked={checked}
					onChange={onChange}
					className="peer absolute inset-0 cursor-pointer opacity-0"
				/>
				<span
					className={`flex h-4 w-4 items-center justify-center rounded-[4px] border-[1.2px] transition ${
						checked
							? 'border-brand-light bg-background text-brand-light'
							: 'border-brand-light bg-background text-transparent'
					} ${boxClassName}`}
				>
					{checked && <CheckIcon className="h-[9px] w-[9px]" stroke="currentColor" />}
				</span>
			</span>
			{label && <span className={`text-p1 font-semibold leading-none ${labelClassName}`}>{label}</span>}
		</label>
	);
};

export default Checkbox;
