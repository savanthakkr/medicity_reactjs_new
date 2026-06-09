export default function UserKeyIcon({ className = 'w-4 h-4', ...props }) {
	return (
		<svg
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<circle cx="8" cy="7" r="3" />
			<path d="M2 17c0-2.8 2.7-5 6-5" />
			<circle cx="15.5" cy="14" r="2.5" />
			<path d="M18 14h-1m-2.5 0H13" />
			<path d="M15.5 11.5v1M15.5 16.5v1" />
		</svg>
	);
}
