import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ChevronDown from '../../assets/icons/ChevronDown.jsx';

export default function CustomAutoComplete({
	options = [],
	value,
	onChange,
	label,
	placeholder,
	width = '100%',
	className,
	size = 'small',
	error = '',
	wrapperClassName = '',
	...props
}) {
	return (
		<div className={`w-full ${wrapperClassName}`}>
			<Autocomplete
				disablePortal
				options={options}
				value={value}
				onChange={onChange}
				sx={{ width }}
				className={className}
				popupIcon={<ChevronDown className="h-6 w-6 text-text-3" />}
				ListboxProps={{ sx: { '& .MuiAutocomplete-option': { fontSize: 'var(--form-input)' } } }}
				renderInput={params => (
					<TextField
						{...params}
						label={label}
						placeholder={placeholder}
						size={size}
						sx={{
							'& .MuiInputBase-root': {
								fontSize: 'var(--form-input)',
								color: 'var(--text-1)',
								borderRadius: '6px',
								backgroundColor: 'var(--field-color)',
								minHeight: '34px',
								padding: '0 32px 0 0 !important'
							},

							// Chip / Tag styles for multiselect
							'& .MuiChip-root': {
								backgroundColor: 'color-mix(in srgb, var(--secondary-color) 15%, transparent)',
								color: 'var(--secondary-color)',
								borderRadius: '4px',
								height: '24px',
								fontSize: '0.75rem',
								marginLeft: '6px',
								marginTop: '4px',
								marginBottom: '4px'
							},
							'& .MuiChip-deleteIcon': {
								color: 'var(--secondary-color)',
								opacity: 0.7,
								fontSize: '16px',
								'&:hover': {
									opacity: 1,
									color: 'var(--secondary-color)'
								}
							},

							'& .MuiInputBase-input': {
								color: 'var(--text-1)',
								padding: '8px 10px !important',

								// placeholder color
								'&::placeholder': {
									color: 'var(--text-3)',
									opacity: 1
								}
							},

							'& .MuiInputLabel-root': {
								fontSize: 'var(--form-label)',
								color: 'var(--text-1)'
							},

							// normal border
							'& .MuiOutlinedInput-notchedOutline': {
								borderColor: error ? '#ef4444 !important' : 'var(--divider-color)'
							},

							// hover border
							'&:hover .MuiOutlinedInput-notchedOutline': {
								borderColor: error ? '#ef4444 !important' : 'var(--divider-color)'
							},

							// focused state
							'& .MuiOutlinedInput-root.Mui-focused': {
								boxShadow: error
									? '0 0 0 3px color-mix(in srgb, #ef4444 18%, transparent)'
									: '0 0 0 3px color-mix(in srgb, var(--secondary-color) 18%, transparent)'
							},

							// focused border
							'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
								border: error ? '1px solid #ef4444 !important' : '1px solid var(--secondary-color)'
							}
						}}
					/>
				)}
				{...props}
			/>
			{error && <p className="mt-[4px] text-[11px] leading-tight text-red-600">{error}</p>}
		</div>
	);
}
