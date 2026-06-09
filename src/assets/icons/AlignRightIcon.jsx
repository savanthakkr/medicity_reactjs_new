export default function AlignRightIcon({ className = 'w-4 h-4', ...props }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} {...props}>
			<path
				fillRule="evenodd"
				d="M17 4a1 1 0 01-1 1h-1.586l-2.293 2.293a1 1 0 01-1.414-1.414L13 3.586V2a1 1 0 012 0v2z"
				clipRule="evenodd"
			/>
		</svg>
	);
}
