import React from 'react';

const VARIANTS = {
	primary: 'btn-brand',
	outline: 'btn-outline',
	unstyled: ''
};

const Button = ({ variant = 'primary', type = 'button', className = '', loading = false, children, ...rest }) => {
	const base = VARIANTS[variant] !== undefined ? VARIANTS[variant] : VARIANTS.primary;
	const isUnstyled = variant === 'unstyled';
	const layoutClasses = isUnstyled ? '' : 'flex items-center justify-center gap-2';

	return (
		<button
			type={type}
			className={`${base} ${layoutClasses} ${className} relative overflow-hidden`}
			disabled={loading || rest.disabled}
			{...rest}
		>
			{loading && <div className="spinner border-current border-t-transparent" />}
			{children}
		</button>
	);
};

export default Button;
