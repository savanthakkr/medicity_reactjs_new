export default function CommissionIcon({ className = 'w-5 h-5', ...props }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<circle cx="12" cy="12" r="9" />
			<path d="M15 9l-6 6" />
			<circle cx="9.5" cy="9.5" r="1.2" fill="currentColor" />
			<circle cx="14.5" cy="14.5" r="1.2" fill="currentColor" />
		</svg>
	);
}
