import { atom } from 'jotai';

export const confirmAtom = atom({
	isOpen: false,
	title: 'Confirm Action',
	message: 'Are you sure you want to proceed?',
	confirmLabel: 'Confirm',
	cancelLabel: 'Cancel',
	isLoading: false,
	isDestructive: true,
	onConfirm: null,
	onCancel: null
});
