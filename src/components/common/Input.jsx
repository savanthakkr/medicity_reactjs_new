import React from 'react';

const Input = ({
	label,
	id,
	required = false,
	active = false,
	error = '',
	className = '',
	wrapperClassName = '',
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
			<input
				id={id}
				className={`form-input ${active ? 'is-active' : ''} ${error ? '!border-red-500' : ''} ${className}`}
				required={required}
				aria-invalid={error ? 'true' : undefined}
				{...rest}
			/>
			{error && <p className="mt-[4px] text-[11px] leading-tight text-red-600">{error}</p>}
		</div>
	);
};

export default Input;
