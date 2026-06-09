export default function AddIcon({ className = 'w-[15px] h-[15px]', fill = 'currentColor', ...props }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 15 15"
			fill="none"
			className={className}
			{...props}
		>
			<path
				d="M12 6.22641V8.59434H3V6.22641H12ZM8.73547 2.5V12.5H6.27355V2.5H8.73547Z"
				fill={fill}
			/>
		</svg>
	);
}
