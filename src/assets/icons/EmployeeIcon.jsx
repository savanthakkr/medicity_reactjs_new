export default function EmployeeIcon({ className = 'w-5 h-5', ...props }) {
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
			<circle cx="9" cy="8" r="3.5" />
			<path d="M2.5 21c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
			<circle cx="17" cy="6" r="2.5" />
			<path d="M21.5 14c-.4-2-2.2-3.5-4.5-3.5" />
		</svg>
	);
}
