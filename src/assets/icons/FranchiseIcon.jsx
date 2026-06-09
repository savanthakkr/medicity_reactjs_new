export default function FranchiseIcon({ className = 'w-5 h-5', ...props }) {
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
			<path d="M3 10l9-6 9 6" />
			<path d="M5 9v11h14V9" />
			<path d="M10 20v-6h4v6" />
		</svg>
	);
}
