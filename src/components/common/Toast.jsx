import React from 'react';
import { useAtom } from 'jotai';
import { toastsAtom } from '../../data/states/toastAtom';

const Toast = () => {
	const [toasts, setToasts] = useAtom(toastsAtom);

	if (toasts.length === 0) return null;

	return (
		<div className="fixed top-5 right-5 z-[100] flex flex-col gap-2">
			{toasts.map(toast => (
				<div
					key={toast.id}
					className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all animate-in fade-in slide-in-from-right-5 duration-300 ${
						toast.type === 'success'
							? 'border-green-100 bg-green-50 text-green-800'
							: toast.type === 'error'
								? 'border-red-100 bg-red-50 text-red-800'
								: 'border-blue-100 bg-blue-50 text-blue-800'
					}`}
				>
					<div className="flex-1 text-sm font-medium">{toast.message}</div>
					<button
						onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
						className="text-current opacity-50 hover:opacity-100"
					>
						×
					</button>
				</div>
			))}
		</div>
	);
};

export default Toast;
