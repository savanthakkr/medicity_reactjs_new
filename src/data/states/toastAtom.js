import { atom } from 'jotai';

export const toastsAtom = atom([]);

export const addToastAtom = atom(null, (get, set, toast) => {
	const id = Date.now();
	const newToast = { id, ...toast };
	set(toastsAtom, prev => [...prev, newToast]);

	// Auto-remove after 3 seconds
	setTimeout(() => {
		set(toastsAtom, prev => prev.filter(t => t.id !== id));
	}, 3000);
});
