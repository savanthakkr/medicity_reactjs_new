import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom, fontSizeAtom } from '../data/states/appAtoms';

/**
 * useUpdateThemeToDOM
 * Syncs your dynamic context theme to the <html> element's classList.
 * Ensures your CSS variables update properly.
 */
export const useUpdateThemeToDOM = () => {
	const theme = useAtomValue(themeAtom);
	const fontSize = useAtomValue(fontSizeAtom);

	useEffect(() => {
		const root = document.documentElement;

		if (!theme) return; // skip if theme is not set yet

		if (theme === 'dark') {
			root.classList.add('dark');
			root.classList.remove('light');
		} else if (theme === 'light') {
			root.classList.add('light');
			root.classList.remove('dark');
		} else {
			console.error(`Invalid theme "${theme}" received in useUpdateThemeToDOM.`);
		}
	}, [theme]);

	useEffect(() => {
		const root = document.documentElement;
		const scale = ['small', 'medium', 'large'].includes(fontSize) ? fontSize : 'medium';

		root.classList.remove('scale-small', 'scale-medium', 'scale-large');
		root.classList.add(`scale-${scale}`);
	}, [fontSize]);
};
