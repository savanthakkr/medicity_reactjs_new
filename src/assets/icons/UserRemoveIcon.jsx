export default function UserRemoveIcon({ className = 'w-4 h-4', ...props }) {
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
			<path d="M13 13h6" />
		</svg>
	);
}
