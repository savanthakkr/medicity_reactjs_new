import { atom } from 'jotai';
import { BROWSER_STORAGE_KEYS } from '../../utils/constants/browserStorageKeys';
import { getDataInBrowser, setDataInBrowser } from '../../utils/methods/DataInBrowser';

const createPersistedAtom = (storageKey, fallbackValue) => {
	const baseAtom = atom(getDataInBrowser(storageKey) ?? fallbackValue);
	return atom(
		get => get(baseAtom),
		(_get, set, nextValue) => {
			set(baseAtom, nextValue);
			setDataInBrowser(storageKey, nextValue);
		}
	);
};

const atomConfig = {
	navItemsAlignmentAtom: [BROWSER_STORAGE_KEYS.navitemAlignments, 'right'],
	sidebarAlignmentAtom: [BROWSER_STORAGE_KEYS.sidebarAlignment, 'left'],
	themeAtom: [BROWSER_STORAGE_KEYS.theme, 'light'],
	languageAtom: [BROWSER_STORAGE_KEYS.language, 'en'],
	fontSizeAtom: [BROWSER_STORAGE_KEYS.fontSize, 'medium']
};

const generatedAtoms = Object.fromEntries(
	Object.entries(atomConfig).map(([name, [storageKey, fallbackValue]]) => [
		name,
		createPersistedAtom(storageKey, fallbackValue)
	])
);

export const { navItemsAlignmentAtom, sidebarAlignmentAtom, themeAtom, languageAtom, fontSizeAtom } = generatedAtoms;
