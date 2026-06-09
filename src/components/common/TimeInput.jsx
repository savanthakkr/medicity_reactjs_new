import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import dayjs from 'dayjs';

const TimeInput = ({
	label,
	id,
	name,
	required = false,
	placeholder = 'Select Time',
	className = '',
	wrapperClassName = '',
	value,
	onChange,
	error,
	...rest
}) => {
	const [tempValue, setTempValue] = React.useState(null);

	// Sync with prop value when it changes
	React.useEffect(() => {
		setTempValue(value ? dayjs(`2000-01-01 ${value}`) : null);
	}, [value]);

	const handleOpen = () => {
		if (!value) {
			setTempValue(dayjs('2000-01-01 00:00:00'));
		}
	};

	const handleClose = () => {
		setTempValue(value ? dayjs(`2000-01-01 ${value}`) : null);
	};

	const handleAccept = newValue => {
		if (onChange) {
			const formattedValue = newValue && newValue.isValid() ? newValue.format('HH:mm:ss') : '';
			onChange({
				target: {
					name: name || id,
					value: formattedValue
				}
			});
		}
	};

	return (
		<div className={`w-full time-input-wrapper ${wrapperClassName} ${className}`}>
			{label && (
				<label htmlFor={id} className="form-label">
					{label}
					{required && <span className="text-red-500 ml-0.5">*</span>}
				</label>
			)}
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<MobileTimePicker
					value={tempValue}
					onChange={setTempValue}
					onOpen={handleOpen}
					onClose={handleClose}
					onAccept={handleAccept}
					referenceDate={dayjs('2000-01-01 00:00:00')}
					slotProps={{
						dialog: {
							PaperProps: {
								sx: {
									// Apply styles directly to the Dialog Paper container
									borderRadius: '24px !important',
									border: 'none',
									backgroundColor: '#f1f5f9 !important', // light gray background matching image
									boxShadow: '0 15px 30px rgba(0, 0, 0, 0.12)',
									width: '320px !important', // fixed width to prevent horizontal overflow
									minWidth: '320px !important',
									maxWidth: '320px !important',
									overflow: 'hidden !important', // hide any scrollbars on the paper
									overflowX: 'hidden !important',
									overflowY: 'hidden !important',
									transform: 'scale(0.9) !important', // scale down visually by 10%
									transformOrigin: 'center',

									// Disable scrollbars on all descendant elements
									'& *': {
										scrollbarWidth: 'none !important',
										msOverflowStyle: 'none !important'
									},
									'& *::-webkit-scrollbar': {
										display: 'none !important'
									},
									'& .MuiDialogContent-root': {
										overflow: 'hidden !important',
										overflowX: 'hidden !important',
										overflowY: 'hidden !important',
										padding: '8px 12px !important'
									},
									'& .MuiPickersLayout-root': {
										overflow: 'hidden !important',
										backgroundColor: 'transparent !important'
									},

									// Style picker toolbar header
									'& .MuiPickersToolbar-root': {
										padding: '16px 16px 12px 16px',
										backgroundColor: 'transparent'
									},
									'& .MuiPickersToolbar-content': {
										justifyContent: 'center',
										alignItems: 'center'
									},
									// Large display digits container
									'& .MuiTimePickerToolbar-hourMinuteLabel': {
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '6px'
									},
									// Individual white block cards for hour and minute digits
									'& .MuiTimePickerToolbar-hourMinuteLabel .MuiPickersToolbarText-root': {
										fontSize: '44px',
										fontFamily: 'system-ui, -apple-system, sans-serif',
										color: '#64748b', // Slate gray for inactive text
										backgroundColor: '#ffffff', // White cards matching image
										padding: '6px 12px',
										borderRadius: '10px',
										minWidth: '68px',
										textAlign: 'center',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontWeight: '400',
										boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
										'&.Mui-selected': {
											color: '#1eafc0' // Teal color for active digit
										}
									},
									// Separator colon
									'& .MuiTimePickerToolbar-separator': {
										fontSize: '44px',
										color: '#64748b',
										fontWeight: '300',
										padding: '0 2px'
									},
									// AM/PM selection block on the right
									'& .MuiTimePickerToolbar-ampmSelection': {
										display: 'flex',
										flexDirection: 'column',
										border: '1px solid #cbd5e1',
										borderRadius: '10px',
										overflow: 'hidden',
										marginLeft: '8px',
										backgroundColor: '#ffffff',
										boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
										'& .MuiButtonBase-root': {
											height: '32px',
											width: '46px',
											margin: '0',
											borderRadius: '0',
											fontSize: '12px',
											fontWeight: '600',
											color: '#64748b',
											border: 'none',
											'&.Mui-selected': {
												backgroundColor: '#1eafc0 !important',
												color: '#ffffff !important'
											},
											'&:first-of-type': {
												borderBottom: '1px solid #e2e8f0'
											}
										}
									},
									// Radial clock face styling
									'& .MuiClock-root': {
										margin: '8px auto 16px auto'
									},
									'& .MuiClock-clock': {
										backgroundColor: '#ffffff !important', // White dial face matching image
										border: '1px solid #e2e8f0'
									},
									'& .MuiClock-pin': {
										backgroundColor: '#1eafc0'
									},
									'& .MuiClockPointer-root': {
										backgroundColor: '#1eafc0'
									},
									'& .MuiClockPointer-thumb': {
										backgroundColor: '#1eafc0',
										borderColor: '#1eafc0',
										boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
									},
									'& .MuiClockNumber-root': {
										color: '#334155', // Slate dark text for clock digits
										fontSize: '15px',
										fontWeight: '500',
										'&.Mui-selected': {
											backgroundColor: '#1eafc0',
											color: '#ffffff'
										}
									},
									// Dialog action buttons Cancel / OK
									'& .MuiDialogActions-root': {
										padding: '8px 16px 12px 16px',
										backgroundColor: 'transparent'
									},
									'& .MuiDialogActions-root .MuiButton-root': {
										color: '#1eafc0',
										fontWeight: '600',
										textTransform: 'uppercase',
										fontSize: '13px',
										borderRadius: '6px',
										padding: '4px 12px',
										'&:hover': {
											backgroundColor: 'rgba(30, 175, 192, 0.08)'
										}
									}
								}
							}
						},
						textField: {
							className: 'custom-time-picker-field',
							id: id,
							name: name || id,
							placeholder: placeholder,
							error: !!error,
							helperText: error,
							size: 'small',
							fullWidth: true,
							variant: 'outlined',
							sx: {
								'& .MuiInputBase-root, & .MuiOutlinedInput-root': {
									fontSize: 'var(--form-input)',
									color: 'var(--text-1)',
									borderRadius: '6px',
									backgroundColor: 'var(--field-color) !important',
									minHeight: '34px',
									height: '34px',
									paddingRight: '6px',
									transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
								},
								'& .MuiInputBase-input, & .MuiOutlinedInput-input': {
									backgroundColor: 'transparent !important',
									color: 'var(--text-1)',
									padding: '0 10px !important',
									height: '100%',
									lineHeight: '34px',
									'&::placeholder': {
										color: 'var(--text-3)',
										opacity: 1
									}
								},
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: error ? '#ef4444 !important' : 'var(--divider-color) !important',
									transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
								},
								'& .MuiInputBase-root:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline, & .MuiOutlinedInput-root:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
									borderColor: error ? '#ef4444 !important' : 'var(--divider-color) !important'
								},
								'& .MuiInputBase-root.Mui-focused, & .MuiOutlinedInput-root.Mui-focused': {
									boxShadow: error ? 'none' : '0 0 0 3px color-mix(in srgb, var(--secondary-color) 18%, transparent) !important'
								},
								'& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline, & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
									borderColor: error ? '#ef4444 !important' : 'var(--secondary-color) !important',
									borderWidth: '1px !important',
									borderStyle: 'solid !important'
								},
								'& .MuiIconButton-root': {
									padding: '4px',
									color: 'var(--text-2)'
								},
								'& .MuiFormHelperText-root': {
									marginLeft: 0,
									marginTop: '4px',
									fontSize: '11px',
									lineHeight: 'tight',
									color: '#dc2626'
								}
							}
						}
					}}
					{...rest}
				/>
			</LocalizationProvider>
		</div>
	);
};

export default TimeInput;
