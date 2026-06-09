import React, { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../data/states/toastAtom';
import { API } from '../../data/apis/endpoints';
import http from '../../lib/axios/axios';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { formatDateTime } from '../../utils/methods/formatDate';

const DeleteEmployeeModal = ({ open, onClose, employee, onSuccess }) => {
	const addToast = useSetAtom(addToastAtom);
	const [loading, setLoading] = useState(false);
	const [reason, setReason] = useState('');
	const [error, setError] = useState('');
	const [now, setNow] = useState('');

	// Reset state and capture current datetime each time modal opens
	useEffect(() => {
		if (!open) return;
		setReason('');
		setError('');
		setNow(formatDateTime(new Date()));
	}, [open]);

	const handleConfirm = async () => {
		if (!reason.trim()) {
			setError('Delete reason is required.');
			return;
		}
		setError('');
		setLoading(true);
		try {
			await http.post(API.EMPLOYEES.DELETE(employee.employee_Id), {
				delete_reason: reason.trim()
			});
			addToast({ type: 'success', message: 'Employee deleted successfully' });
			onSuccess?.();
			onClose();
		} catch (err) {
			const msg = err?.response?.data?.message || 'Failed to delete employee';
			addToast({ type: 'error', message: msg });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Delete Employee"
			widthClassName="max-w-[440px]"
			footer={
				<>
					<Button variant="outline" onClick={onClose} disabled={loading}>
						Cancel
					</Button>
					<Button onClick={handleConfirm} disabled={loading} className="!bg-red-600 hover:!brightness-90">
						{loading ? 'Deleting…' : 'Delete'}
					</Button>
				</>
			}
		>
			{/* Warning banner */}
			<div className="flex items-start gap-3 rounded-[8px] bg-red-50 px-4 py-3 mb-4">
				<svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
						clipRule="evenodd"
					/>
				</svg>
				<div className="text-[12.5px] text-red-800">
					<p className="font-semibold">Delete {employee?.employee_Name}?</p>
					<p className="mt-1 text-red-700 leading-relaxed">
						This employee will be permanently removed from all lists. This action cannot be undone.
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-3">
				{/* Current date/time — readonly display */}
				<div>
					<label className="form-label">Deleted At</label>
					<div className="form-input bg-field text-text-2 cursor-default select-none text-[12px]">{now}</div>
				</div>

				{/* Delete reason — required */}
				<div>
					<label className="form-label">
						Delete Reason <span className="text-red-500">*</span>
					</label>
					<textarea
						rows={3}
						value={reason}
						onChange={e => {
							setReason(e.target.value);
							setError('');
						}}
						placeholder="Enter reason for deleting this employee..."
						className={`form-input resize-none w-full ${error ? '!border-red-500' : ''}`}
					/>
					{error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
				</div>
			</div>
		</Modal>
	);
};

export default DeleteEmployeeModal;
