import { Navigate, Outlet } from 'react-router-dom';
import { BROWSER_STORAGE_KEYS } from '../utils/constants/browserStorageKeys';
import ROUTES from '../utils/constants/routes';
import { getDataInBrowser } from '../utils/methods/DataInBrowser';

const ProtectedRoute = () => {
	const token = getDataInBrowser(BROWSER_STORAGE_KEYS.authToken);
	return token ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;
