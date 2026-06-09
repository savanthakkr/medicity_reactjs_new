import { useSetAtom } from 'jotai';
import { confirmAtom } from '../data/states/confirmAtom';

export const useConfirm = () => {
	const setConfirm = useSetAtom(confirmAtom);

	const confirm = ({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, isDestructive }) => {
		setConfirm({
			isOpen: true,
			title: title || 'Confirm Action',
			message: message || 'Are you sure you want to proceed?',
			confirmLabel: confirmLabel || 'Confirm',
			cancelLabel: cancelLabel || 'Cancel',
			isDestructive: isDestructive !== undefined ? isDestructive : true,
			onConfirm,
			onCancel
		});
	};

	return confirm;
};
