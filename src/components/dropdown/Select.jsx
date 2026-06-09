import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ChevronDown from '../../assets/icons/ChevronDown.jsx';

export default function CustomSelect({
	value,
	onChange,
	options = [],
	label,
	minWidth = 120,
	className,
	size = 'small',
	...props
}) {
	return (
		<Box sx={{ minWidth }} className={className}>
			<FormControl fullWidth size={size}>
				{label && <InputLabel sx={{ fontSize: 'var(--form-label)' }}>{label}</InputLabel>}
				<Select
					value={value}
					label={label}
					onChange={onChange}
					sx={{
						fontSize: 'var(--form-input)',
						backgroundColor: '#e2e8f0',

						'.dark &, [data-theme="dark"] &, :root.dark &': {
							backgroundColor: '#2C3742'
						},

						'& .MuiSelect-select': {
							color: 'var(--text-1)'
						},

						// remove borders
						'& .MuiOutlinedInput-notchedOutline': {
							border: 'none'
						},

						'&:hover .MuiOutlinedInput-notchedOutline': {
							border: 'none'
						},

						'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
							border: 'none'
						}
					}}
					IconComponent={props => (
						<ChevronDown {...props} className={`${props.className} !w-6 !h-6 !text-text-3 !top-[calc(50%-12px)]`} />
					)}
					{...props}
				>
					{options.map((option, index) => {
						const isObject = typeof option === 'object';
						const optionValue = isObject ? option.value : option;
						const optionLabel = isObject ? option.label : option;

						return (
							<MenuItem
								key={index}
								value={optionValue}
								sx={{
									fontSize: 'var(--form-input)',
									color: 'var(--text-1)'
								}}
							>
								{optionLabel}
							</MenuItem>
						);
					})}
				</Select>
			</FormControl>
		</Box>
	);
}
