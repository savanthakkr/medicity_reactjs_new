import React from 'react';
import MuiSwitch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

const CustomSwitch = styled(props => <MuiSwitch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />)(
	({ theme }) => ({
		width: 36,
		height: 20,
		padding: 0,
		'& .MuiSwitch-switchBase': {
			padding: 0,
			margin: 2,
			transitionDuration: '300ms',
			'&.Mui-checked': {
				transform: 'translateX(16px)',
				color: '#fff',
				'& + .MuiSwitch-track': {
					backgroundColor: '#1EAFC0',
					opacity: 1,
					border: 0
				},
				'&.Mui-disabled + .MuiSwitch-track': {
					opacity: 0.5
				}
			},
			'&.Mui-focusVisible .MuiSwitch-thumb': {
				color: '#1EAFC0',
				border: '6px solid #fff'
			},
			'&.Mui-disabled .MuiSwitch-thumb': {
				color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600]
			},
			'&.Mui-disabled + .MuiSwitch-track': {
				opacity: theme.palette.mode === 'light' ? 0.7 : 0.3
			}
		},
		'& .MuiSwitch-thumb': {
			boxSizing: 'border-box',
			width: 16,
			height: 16,
			boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
		},
		'& .MuiSwitch-track': {
			borderRadius: 20 / 2,
			backgroundColor: theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0',
			opacity: 1,
			transition: theme.transitions.create(['background-color'], {
				duration: 500
			})
		}
	})
);

export default function Switch({ checked, onChange, disabled, ...props }) {
	return <CustomSwitch checked={checked} onChange={onChange} disabled={disabled} {...props} />;
}
