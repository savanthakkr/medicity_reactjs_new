import { useRoutes } from 'react-router-dom';
import { useUpdateThemeToDOM } from './hooks/useUpdateThemeToDOM';
import { dashboardRoutes } from './routes/dashboardRoutes';
import Toast from './components/common/Toast';

export default function App() {
	useUpdateThemeToDOM();
	const routes = useRoutes(dashboardRoutes);
	return (
		<>
			{routes}
			<Toast />
		</>
	);
}
