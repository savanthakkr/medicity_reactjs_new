export default function PatientIcon({ className = 'w-5 h-5', ...props }) {
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
			<circle cx="12" cy="8" r="4" />
			<path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
		</svg>
	);
}
