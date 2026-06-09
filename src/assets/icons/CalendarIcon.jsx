export default function CalendarIcon({ className = 'w-4 h-4', ...props }) {
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
			<rect x="3" y="5" width="18" height="16" rx="2" />
			<path d="M3 9h18M8 3v4M16 3v4" />
		</svg>
	);
}
