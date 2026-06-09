import AlignLeftIcon from '../../../assets/icons/AlignLeftIcon.jsx';
import AlignRightIcon from '../../../assets/icons/AlignRightIcon.jsx';

export const AlignmentOption = ({ label, value, currentValue, onChange, description }) => {
	const isSelected = currentValue === value;
	const arrowClass = `w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`;
	return (
		<div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-muted transition-colors">
			<div className="flex-1">
				<div onClick={() => onChange(value)} className="flex items-center space-x-3 cursor-pointer">
					<input
						type="radio"
						id={`${label}-${value}`}
						name={label}
						value={value}
						checked={isSelected}
						onChange={() => onChange(value)}
						className="w-4 h-4 text-primary border-muted focus:ring-primary focus:ring-2"
					/>
					<label htmlFor={`${label}-${value}`} className="font-medium text-card-foreground cursor-pointer">
						{value.charAt(0).toUpperCase() + value.slice(1)}
					</label>
				</div>
				{description && <p className="mt-1 ml-7 text-sm text-muted-foreground">{description}</p>}
			</div>
			<div className="ml-4">
				<div
					className={`w-8 h-8 rounded border-2 flex items-center justify-center ${
						isSelected ? 'border-primary bg-primary/10' : 'border-muted'
					}`}
				>
					{value === 'left' ? <AlignLeftIcon className={arrowClass} /> : <AlignRightIcon className={arrowClass} />}
				</div>
			</div>
		</div>
	);
};
