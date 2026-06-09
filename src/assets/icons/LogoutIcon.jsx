export default function LogoutIcon({ className = 'w-5 h-5', ...props }) {
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
			<path d="M15 17l5-5-5-5" />
			<path d="M20 12H9" />
			<path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6" />
		</svg>
	);
}
