import { atom } from 'jotai';
import { BROWSER_STORAGE_KEYS } from '../../utils/constants/browserStorageKeys';
import { getDataInBrowser, setDataInBrowser } from '../../utils/methods/DataInBrowser';

// null  = permissions never loaded (safe passthrough — e.g. during initial app boot)
// {...} = permissions explicitly loaded from the server
const DEFAULT_PERMISSIONS = null;

const basePermissionsAtom = atom(getDataInBrowser(BROWSER_STORAGE_KEYS.permissions) ?? DEFAULT_PERMISSIONS);

/** Read / write atom — writing persists to localStorage automatically. */
export const permissionsAtom = atom(
	get => get(basePermissionsAtom),
	(_get, set, nextValue) => {
		set(basePermissionsAtom, nextValue);
		setDataInBrowser(BROWSER_STORAGE_KEYS.permissions, nextValue);
	}
);
