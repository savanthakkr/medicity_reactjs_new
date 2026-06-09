import React from 'react';
import { useAtom } from 'jotai';
import { confirmAtom } from '../../data/states/confirmAtom';
import Button from './Button';

const ConfirmationModal = () => {
	const [confirm, setConfirm] = useAtom(confirmAtom);

	if (!confirm.isOpen) return null;

	const handleConfirm = async () => {
		if (confirm.onConfirm) {
			setConfirm(prev => ({ ...prev, isLoading: true }));
			try {
				await confirm.onConfirm();
			} catch (error) {
				console.error('Confirmation error:', error);
			} finally {
				setConfirm(prev => ({ ...prev, isOpen: false, isLoading: false }));
			}
		} else {
			setConfirm(prev => ({ ...prev, isOpen: false }));
		}
	};

	const handleCancel = () => {
		if (confirm.isLoading) return;
		if (confirm.onCancel) confirm.onCancel();
		setConfirm(prev => ({ ...prev, isOpen: false }));
	};

	return (
		<div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
				onClick={handleCancel}
			/>
			<div className="relative w-full max-w-md scale-in animate-in zoom-in-95 duration-200 rounded-xl border border-divider bg-card p-6 shadow-2xl">
				<h3 className="mb-2 text-h3 font-bold text-text-1">{confirm.title}</h3>
				<p className="mb-8 text-p1 text-text-2">{confirm.message}</p>

				<div className="flex justify-end gap-3">
					<Button variant="outline" onClick={handleCancel} disabled={confirm.isLoading}>
						{confirm.cancelLabel}
					</Button>
					<Button
						onClick={handleConfirm}
						loading={confirm.isLoading}
						className={
							confirm.isDestructive !== false
								? 'bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 text-white'
								: ''
						}
					>
						{confirm.isLoading
							? confirm.isDestructive !== false
								? 'Deleting...'
								: 'Confirming...'
							: confirm.confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
