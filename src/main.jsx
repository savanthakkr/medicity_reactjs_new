import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Provider as JotaiProvider, useAtomValue } from 'jotai';
import { store } from './data/states/store.js';
import './i18n/index.js';
import './theme/theme-variables.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getMuiTheme } from './theme/muiTheme.js';

import http from './lib/axios/axios.js';
import { BROWSER_STORAGE_KEYS } from './utils/constants/browserStorageKeys.js';
import { getDataInBrowser } from './utils/methods/DataInBrowser.js';
import { themeAtom } from './data/states/appAtoms.js';
import AppErrorBoundary from './components/AppErrorBoundary.jsx';

const token = getDataInBrowser(BROWSER_STORAGE_KEYS.authToken);
const authHeader = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : null;
http.setConfig({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		...(authHeader ? { Authorization: authHeader } : {})
	}
});

const AppThemeProvider = ({ children }) => {
	const themeMode = useAtomValue(themeAtom) || 'light';

	const theme = useMemo(() => getMuiTheme(themeMode), [themeMode]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
};

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<JotaiProvider store={store}>
				<AppThemeProvider>
					<AppErrorBoundary>
						<App />
					</AppErrorBoundary>
				</AppThemeProvider>
			</JotaiProvider>
		</BrowserRouter>
	</StrictMode>
);
