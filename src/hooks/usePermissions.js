import { useAtomValue } from 'jotai';
import { permissionsAtom } from '../data/states/permissionsAtom';
import { getDataInBrowser } from '../utils/methods/DataInBrowser';
import { BROWSER_STORAGE_KEYS } from '../utils/constants/browserStorageKeys';

export function usePermissions() {
	const permissions = useAtomValue(permissionsAtom);

	const isSuperAdmin = permissions?.isSuperAdmin === true;

	/** Check a single permission key. */
	const can = key => {
		if (isSuperAdmin) return true;
		if (permissions === null) {
			const isLoggedIn = Boolean(getDataInBrowser(BROWSER_STORAGE_KEYS.authToken));
			return !isLoggedIn;
		}
		return (permissions.keys ?? []).includes(key);
	};

	/**
	 * Check multiple keys — ALL must pass.
	 * Use to enforce dependencies, e.g.:
	 *   canAll("STATE_LIST", "STATE_EDIT")
	 *   → requires both STATE_LIST and STATE_EDIT to be assigned.
	 *   → if STATE_LIST is missing, STATE_EDIT is also denied (it's useless without the list).
	 */
	const canAll = (...keys) => keys.every(k => can(k));

	return { can, canAll, isSuperAdmin };
}
