import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../data/states/toastAtom';
import { API } from '../../data/apis/endpoints';
import ROUTES from '../../utils/constants/routes';
import http from '../../lib/axios/axios';
import FormLayout from '../../components/common/FormLayout.jsx';
import dayjs from 'dayjs';
import { usePermissions } from '../../hooks/usePermissions';
import Unauthorized from '../Unauthorized';
import { PERM } from '../../utils/constants/permissionKey2';

const ViewCommission = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();

	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	const canView = canAll(PERM.COMMISSION.LIST, PERM.COMMISSION.VIEW);

	useEffect(() => {
		const fetchCommissionDetails = async () => {
			try {
				setLoading(true);
				const res = await http.get(API.DOC_COMMISSIONS.GET(id));
				const commData = res?.data || res;
				if (commData) {
					setData(commData);
				} else {
					addToast({ type: 'error', message: 'Commission details not found' });
					navigate(ROUTES.DOCTOR_COMMISSIONS);
				}
			} catch (error) {
				console.error('Failed to fetch commission details:', error);
				addToast({ type: 'error', message: 'Failed to load commission configuration details' });
				navigate(ROUTES.DOCTOR_COMMISSIONS);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchCommissionDetails();
		}
	}, [id, navigate, addToast]);

	if (!canView) return <Unauthorized />;

	const approvalStatus = data?.approval_status_Name || 'Pending';
	const statusBadgeColor = (() => {
		if (!data) return '';
		switch (approvalStatus) {
			case 'Approved':
				return 'border-onboard-success/30 text-onboard-success bg-onboard-success-bg';
			case 'Rejected':
				return 'border-onboard-error/30 text-onboard-error bg-onboard-error-bg';
			default:
				return 'border-pill-draft/30 text-pill-draft bg-pill-draft/10';
		}
	})();

	return (
		<FormLayout
			title="Commission Setup Details"
			backTo={ROUTES.DOCTOR_COMMISSIONS}
			subtitle="Detailed review of the doctor commission and sharing rule configuration."
			footer={null}
		>
			{loading ? (
				<div className="flex items-center justify-center py-20 text-text-3 text-sm">
					Loading details…
				</div>
			) : !data ? (
				<div className="flex items-center justify-center py-20 text-text-3 text-sm">
					Record not found.
				</div>
			) : (
				<div className="p-[20px] space-y-[14px]">
					{/* Status badge */}
					<div className="flex items-center gap-3">
						<span
							className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${statusBadgeColor}`}
						>
							{approvalStatus}
						</span>
						<span className="text-text-3 text-xs">
							{data.doc_Name} • {data.doc_Code}
						</span>
					</div>

					<div className="space-y-[10px] text-xs">
						{/* 1. Rule configuration details */}
						<div className="border border-divider rounded-md bg-field overflow-hidden">
							<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
								<span className="font-semibold text-text-1 text-xs">Commission details</span>
							</div>
							<div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-[10px]">
								<div>
									<span className="text-text-3">Doctor Name:</span>
									<p className="font-semibold text-text-2 mt-0.5">{data.doc_Name || '—'}</p>
								</div>
								<div>
									<span className="text-text-3">Doctor ID / Code:</span>
									<p className="font-semibold text-text-2 mt-0.5 font-mono">{data.doc_Code || '—'}</p>
								</div>
								<div>
									<span className="text-text-3">Commission Rule Type:</span>
									<p className="font-semibold text-text-2 mt-0.5">{data.doc_commission_Type || '—'}</p>
								</div>
								<div>
									<span className="text-text-3">Value:</span>
									<p className="font-bold text-brand-light mt-0.5">
										{data.doc_commission_Type === 'Percentage'
											? `${data.doc_commission_Value}%`
											: `₹ ${data.doc_commission_Value ? parseFloat(data.doc_commission_Value).toFixed(2) : '0.00'}`}
									</p>
								</div>
								<div>
									<span className="text-text-3">Effective From:</span>
									<p className="font-semibold text-text-2 mt-0.5">
										{data.doc_commission_Effective_From
											? dayjs(data.doc_commission_Effective_From).format('DD MMM YYYY')
											: '—'}
									</p>
								</div>
								<div>
									<span className="text-text-3">Effective To:</span>
									<p className="font-semibold text-text-2 mt-0.5">
										{data.doc_commission_Effective_To
											? dayjs(data.doc_commission_Effective_To).format('DD MMM YYYY')
											: 'Ongoing (No End Date)'}
									</p>
								</div>
							</div>
						</div>

						{/* 2. Status details */}
						<div className="border border-divider rounded-md bg-field overflow-hidden">
							<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
								<span className="font-semibold text-text-1 text-xs">Approval & Active Status</span>
							</div>
							<div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-[10px]">
								<div>
									<span className="text-text-3">Approval Status:</span>
									<p className="font-semibold text-text-2 mt-0.5">{approvalStatus}</p>
								</div>
								<div>
									<span className="text-text-3">Manually Activated:</span>
									<p className="font-semibold text-text-2 mt-0.5">
										{data.is_active === 1 ? 'Yes (Active)' : 'No (Inactive)'}
									</p>
								</div>
								{data.approved_at && (
									<div>
										<span className="text-text-3">Approved At:</span>
										<p className="font-semibold text-text-2 mt-0.5">
											{dayjs(data.approved_at).format('DD MMM YYYY hh:mm A')}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* 3. Audit details */}
						<div className="border border-divider rounded-md bg-field overflow-hidden">
							<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
								<span className="font-semibold text-text-1 text-xs">Metadata & Audit Trail</span>
							</div>
							<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-[10px]">
								<div>
									<span className="text-text-3">Created At:</span>
									<p className="font-semibold text-text-2 mt-0.5">
										{data.created_at ? dayjs(data.created_at).format('DD MMM YYYY hh:mm A') : '—'}
									</p>
								</div>
								<div>
									<span className="text-text-3">Last Updated:</span>
									<p className="font-semibold text-text-2 mt-0.5">
										{data.updated_at ? dayjs(data.updated_at).format('DD MMM YYYY hh:mm A') : '—'}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</FormLayout>
	);
};

export default ViewCommission;
