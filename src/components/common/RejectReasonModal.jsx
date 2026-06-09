import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import TextArea from './TextArea';

const RejectReasonModal = ({
	open,
	onClose,
	title,
	onConfirm,
	infoContent = null,
	confirmLabel = 'Reject',
	placeholder = 'Enter reason for rejection...',
	maxLength = 150,
	inputLabel = 'Rejection Reason',
	requiredMessage = 'Rejection reason is required.',
	loadingLabel = 'Rejecting...',
	buttonColorClass = '!bg-red-600 hover:!brightness-90 hover:!bg-red-600 text-white'
}) => {
	const [reason, setReason] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (open) {
			setReason('');
			setError('');
			setLoading(false);
		}
	}, [open]);

	const handleSubmit = async e => {
		e?.preventDefault();
		const trimmed = reason.trim();
		if (!trimmed) {
			setError(requiredMessage);
			return;
		}
		setError('');
		setLoading(true);
		try {
			await onConfirm(trimmed);
			onClose();
		} catch (err) {
			console.error('Action failed:', err);
			setError(err?.response?.data?.message || err?.message || 'Action failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			open={open}
			onClose={loading ? undefined : onClose}
			title={title}
			widthClassName="max-w-[440px]"
			footer={
				<>
					<Button variant="outline" onClick={onClose} disabled={loading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} loading={loading} className={buttonColorClass}>
						{loading ? loadingLabel : confirmLabel}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				{infoContent && (
					<div className="rounded-[6px] bg-amber-50 px-3 py-2 text-[12px] text-amber-700">{infoContent}</div>
				)}
				<div>
					<TextArea
						label={inputLabel}
						id="rejection-reason-input"
						required
						rows={3}
						value={reason}
						onChange={e => {
							setReason(e.target.value);
							if (e.target.value.trim()) setError('');
						}}
						placeholder={placeholder}
						className="resize-none w-full"
						maxLength={maxLength}
						error={error}
					/>
					<p className="mt-1 text-[10.5px] text-text-3 text-right">
						{reason.length}/{maxLength}
					</p>
				</div>
			</form>
		</Modal>
	);
};

export default RejectReasonModal;
