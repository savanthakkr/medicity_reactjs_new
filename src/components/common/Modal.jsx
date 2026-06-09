/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '../../assets/icons/CloseIcon.jsx';

const Modal = ({ open, onClose, title, children, footer, widthClassName = 'max-w-[420px]' }) => {
	useEffect(() => {
		if (!open) return;
		const onKey = e => e.key === 'Escape' && onClose?.();
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, onClose]);

	if (!open) return null;

	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />
			<div
				role="dialog"
				aria-modal="true"
				className={`relative z-[1] w-full ${widthClassName} rounded-[10px] border border-divider bg-card shadow-[0_30px_60px_rgba(0,0,0,0.35)]`}
			>
				<div className="flex items-center justify-between border-b border-divider px-[16px] py-[12px]">
					<h2 className="text-[15px] font-semibold leading-none text-text-1">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-6 w-6 items-center justify-center rounded text-text-2 transition hover:text-text-1"
						aria-label="Close"
					>
						<CloseIcon className="h-4 w-4" />
					</button>
				</div>
				<div className="px-[16px] py-[16px]">{children}</div>
				{footer && (
					<div className="flex items-center justify-end gap-[10px] border-t border-divider px-[16px] py-[12px]">
						{footer}
					</div>
				)}
			</div>
		</div>,
		document.body
	);
};

export default Modal;
