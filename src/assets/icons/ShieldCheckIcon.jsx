export default function ShieldCheckIcon({ className = 'w-4 h-4', ...props }) {
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
			<path d="M10 2 3.5 5v5c0 3.7 2.8 6.8 6.5 7.5C13.7 16.8 16.5 13.7 16.5 10V5L10 2Z" />
			<path d="m7 10 2 2 4-4" />
		</svg>
	);
}
