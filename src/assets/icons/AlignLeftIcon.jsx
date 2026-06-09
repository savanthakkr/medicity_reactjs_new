export default function AlignLeftIcon({ className = 'w-4 h-4', ...props }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} {...props}>
			<path
				fillRule="evenodd"
				d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4z"
				clipRule="evenodd"
			/>
		</svg>
	);
}
