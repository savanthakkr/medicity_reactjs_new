export default function EyeOffIcon({ className = 'w-[18px] h-[18px]', ...props }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="M17.94 17.94A10 10 0 0 1 12 19c-6.5 0-10-7-10-7a17.6 17.6 0 0 1 4.06-4.94" />
			<path d="M9.9 4.24A10 10 0 0 1 12 4c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.17 4.19" />
			<path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
			<path d="M2 2l20 20" />
		</svg>
	);
}
