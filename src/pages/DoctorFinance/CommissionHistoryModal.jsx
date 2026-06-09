import React, { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../data/states/toastAtom';
import { API } from '../../data/apis/endpoints';
import http from '../../lib/axios/axios';
import Modal from '../../components/common/Modal.jsx';
import dayjs from 'dayjs';

const CommissionHistoryModal = ({ open, onClose, doctor }) => {
	const addToast = useSetAtom(addToastAtom);
	const [fetching, setFetching] = useState(false);
	const [history, setHistory] = useState([]);

	useEffect(() => {
		if (!open || !doctor?.doc_Id) return;

		const loadHistory = async () => {
			setFetching(true);
			try {
				const res = await http.get(API.DOC_COMMISSIONS.HISTORY(doctor.doc_Id));
				if (res.data?.success) {
					setHistory(res.data.data.history || []);
				}
			} catch (err) {
				console.error('Failed to load doctor commission history', err);
				addToast({ type: 'error', message: 'Failed to load commission history' });
			} finally {
				setFetching(false);
			}
		};

		loadHistory();
	}, [open, doctor?.doc_Id, addToast]);

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={`Commission History — ${doctor?.doc_Name || 'Doctor'}`}
			widthClassName="max-w-[750px]"
		>
			{fetching ? (
				<div className="py-8 text-center text-sm text-text-3">Loading history...</div>
			) : (
				<div className="flex flex-col gap-4">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm text-text-2">
							<thead className="bg-field text-xs text-text-1 uppercase font-semibold">
								<tr>
									<th className="px-4 py-3 rounded-tl-[6px]">Type</th>
									<th className="px-4 py-3">Value</th>
									<th className="px-4 py-3">Effective From</th>
									<th className="px-4 py-3">Effective To</th>
									<th className="px-4 py-3">Approval</th>
									<th className="px-4 py-3 rounded-tr-[6px]">Active Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-divider">
								{history.map((item, idx) => (
									<tr key={item.doc_commission_Id || idx} className="hover:bg-field/50 transition-colors">
										<td className="px-4 py-3 font-medium text-text-1">{item.doc_commission_Type}</td>
										<td className="px-4 py-3 text-brand-light font-bold">
											{item.doc_commission_Type === 'Percentage'
												? `${item.doc_commission_Value}%`
												: `₹${parseFloat(item.doc_commission_Value).toFixed(2)}`}
										</td>
										<td className="px-4 py-3">
											{item.doc_commission_Effective_From
												? dayjs(item.doc_commission_Effective_From).format('DD MMM YYYY')
												: '—'}
										</td>
										<td className="px-4 py-3">
											{item.doc_commission_Effective_To
												? dayjs(item.doc_commission_Effective_To).format('DD MMM YYYY')
												: 'Active'}
										</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													item.doc_status_Name === 'Approved'
														? 'bg-green-100 text-green-800'
														: item.doc_status_Name === 'Rejected'
															? 'bg-red-100 text-red-800'
															: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{item.doc_status_Name || 'Pending'}
											</span>
										</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
											>
												{item.is_active ? 'Active' : 'Inactive'}
											</span>
										</td>
									</tr>
								))}
								{history.length === 0 && (
									<tr>
										<td colSpan="6" className="px-4 py-8 text-center italic text-text-3">
											No commission history found for this doctor.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</Modal>
	);
};

export default CommissionHistoryModal;
