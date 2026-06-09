export default function CheckIcon({ className = 'w-3 h-3', stroke = 'white', ...props }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="none"
			stroke={stroke}
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="M4 10l4 4 8-8" />
		</svg>
	);
}
