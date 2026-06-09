import { createTheme } from '@mui/material/styles';

export const getMuiTheme = mode =>
	createTheme({
		palette: {
			mode,
			primary: {
				main: '#055185',
				light: '#1eafc0',
				contrastText: '#ffffff'
			},
			secondary: {
				main: '#1eafc0',
				contrastText: '#ffffff'
			},
			warning: {
				main: '#f59e0b'
			},
			success: {
				main: '#13ba97'
			},
			error: {
				main: '#ef4444'
			},
			background: {
				default: mode === 'light' ? '#ebf1f7' : '#020f1c',
				paper: mode === 'light' ? '#ffffff' : '#071727'
			},
			text: {
				primary: mode === 'light' ? '#0f172a' : '#f8fafc',
				secondary: mode === 'light' ? '#64748b' : '#94a3b8'
			},
			divider: mode === 'light' ? '#e2e8f0' : '#1e293b'
		},
		typography: {
			fontFamily: ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'].join(',')
		},
		shape: {
			borderRadius: 10
		},
		components: {
			MuiCssBaseline: {
				styleOverrides: {
					body: {
						transition: 'background-color 0.3s ease, color 0.3s ease'
					}
				}
			}
		}
	});

export default getMuiTheme('light');
