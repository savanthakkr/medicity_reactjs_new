import { useAtomValue } from 'jotai';
import { Outlet, useLocation } from 'react-router-dom';
import { permissionsAtom } from '../data/states/permissionsAtom';
import Unauthorized from '../pages/Unauthorized';

/**
 * Wraps permission-gated routes.
 *
 * - null           → permissions not loaded yet (safe pass-through on first boot)
 * - isSuperAdmin   → unrestricted access
 * - urls.length > 0 → allow only matching paths
 * - urls.length === 0 (and not super admin) → block everything (no permissions assigned)
 */
const PermissionRoute = () => {
	const permissions = useAtomValue(permissionsAtom);
	const { pathname } = useLocation();

	// Not loaded yet (null) — allow through to avoid false lockout on initial boot
	if (permissions === null) return <Outlet />;

	const { isSuperAdmin, urls } = permissions;

	// Super admin — unrestricted
	if (isSuperAdmin) return <Outlet />;

	// Has specific URL permissions — check the current path
	if (urls && urls.length > 0) {
		const isAllowed = urls.some(url => pathname === url || pathname.startsWith(url + '/'));
		return isAllowed ? <Outlet /> : <Unauthorized />;
	}

	// Permissions loaded but no URLs assigned → block everything
	return <Unauthorized />;
};

export default PermissionRoute;
