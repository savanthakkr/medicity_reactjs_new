export default function DotsVerticalIcon({ className = 'h-[14px] w-[4px]', ...props }) {
	return (
		<svg viewBox="0 0 4 16" fill="currentColor" className={className} {...props}>
			<circle cx="2" cy="2" r="1.6" />
			<circle cx="2" cy="8" r="1.6" />
			<circle cx="2" cy="14" r="1.6" />
		</svg>
	);
}
