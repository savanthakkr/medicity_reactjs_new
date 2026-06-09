/* eslint-disable react/prop-types */
import React from 'react';

const Radio = ({ label, id, name, value, checked = false, onChange, className = '' }) => {
	return (
		<label htmlFor={id} className={`inline-flex cursor-pointer select-none items-center gap-2 ${className}`}>
			<span className="relative inline-flex h-4 w-4 shrink-0">
				<input
					id={id}
					type="radio"
					name={name}
					value={value}
					checked={checked}
					onChange={onChange}
					className="peer absolute inset-0 cursor-pointer opacity-0"
				/>
				<span
					className={`flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] transition ${
						checked ? 'border-brand-light' : 'border-divider'
					}`}
				>
					{checked && <span className="h-[8px] w-[8px] rounded-full bg-brand-light" />}
				</span>
			</span>
			{label && <span className="text-p1 font-semibold leading-none text-text-3">{label}</span>}
		</label>
	);
};

export default Radio;
