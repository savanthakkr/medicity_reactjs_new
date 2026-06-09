import React from 'react';

const IconButton = ({ variant = 'brand-outline', size = 32, className = '', children, ...rest }) => {
	const styles = {
		'brand-outline': 'border border-brand-light text-brand-light hover:bg-brand-soft',
		'brand-solid': 'bg-brand-light text-white hover:brightness-95'
	};
	return (
		<button
			type="button"
			style={{ width: size, height: size }}
			className={`inline-flex items-center justify-center rounded-full transition shrink-0 ${
				styles[variant] || styles['brand-outline']
			} ${className}`}
			{...rest}
		>
			{children}
		</button>
	);
};

export default IconButton;
