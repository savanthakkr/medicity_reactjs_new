const TextSizeIcon = ({ className = 'h-5 w-5' }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M4 7V5h10v2" />
		<path d="M9 5v14" />
		<path d="m15 15 2 2 2-2" />
		<path d="M17 17v-6" />
		<path d="m15 11 2-2 2 2" />
	</svg>
);

export default TextSizeIcon;
