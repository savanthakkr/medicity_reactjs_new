export default function WalletIcon({ className = 'w-5 h-5', ...props }) {
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
			<rect x="2.5" y="6" width="19" height="13" rx="2.5" />
			<path d="M16 13.5h2" />
			<path d="M2.5 10h19" />
		</svg>
	);
}
