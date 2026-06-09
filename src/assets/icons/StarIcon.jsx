export default function StarIcon({ className = 'w-7 h-7 text-cyan-400', ...props }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 32 32"
			fill="currentColor"
			aria-hidden
			className={className}
			{...props}
		>
			<path d="M16 2l3.5 6L26 9.5l-4.5 5L23 22l-7-3-7 3 1.5-7.5L6 9.5 12.5 8z" />
		</svg>
	);
}
