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

const ViewConsultationCharge = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();

	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	const canView = canAll(PERM.CONSULTATION_CHARGE.LIST, PERM.CONSULTATION_CHARGE.VIEW);

	useEffect(() => {
		const fetchChargeDetails = async () => {
			try {
				setLoading(true);
				const res = await http.get(API.DOC_CHARGES.GET(id));
				const chargeData = res?.data || res;
				if (chargeData) {
					setData(chargeData);
				} else {
					addToast({ type: 'error', message: 'Charge details not found' });
					navigate(ROUTES.DOCTOR_CONSULTATION_CHARGES);
				}
			} catch (error) {
				console.error('Failed to fetch charge details:', error);
				addToast({ type: 'error', message: 'Failed to load consultation charge details' });
				navigate(ROUTES.DOCTOR_CONSULTATION_CHARGES);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchChargeDetails();
		}
	}, [id, navigate, addToast]);

	if (!canView) return <Unauthorized />;

	const statusBadgeColor = data
		? data.is_active
			? 'border-onboard-success/30 text-onboard-success bg-onboard-success-bg'
			: 'border-pill-draft/30 text-pill-draft bg-pill-draft/10'
		: '';

	return (
		<FormLayout
			title="Consultation Charge Details"
			backTo={ROUTES.DOCTOR_CONSULTATION_CHARGES}
			subtitle="Detailed review of the consultation fee rule configuration."
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
							{data.is_active ? 'Active / Approved' : 'Inactive / Pending'}
						</span>
						<span className="text-text-3 text-xs">
							{data.doc_Name} • {data.doc_Code}
						</span>
					</div>

					<div className="space-y-[10px] text-xs">
						{/* 1. Rule details */}
						<div className="border border-divider rounded-md bg-field overflow-hidden">
							<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
								<span className="font-semibold text-text-1 text-xs">Charge Details</span>
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
									<span className="text-text-3">Service Type:</span>
									<p className="font-semibold text-text-2 mt-0.5">{data.doc_charge_service_type_Name || '—'}</p>
								</div>
								<div>
									<span className="text-text-3">Amount:</span>
									<p className="font-bold text-brand-light mt-0.5">
										₹ {data.doc_charge_Amount ? parseFloat(data.doc_charge_Amount).toFixed(2) : '0.00'}
									</p>
								</div>
								<div>
									<span className="text-text-3">Effective From:</span>
									<p className="font-semibold text-text-2 mt-0.5">
										{data.doc_charge_Effective_From
											? dayjs(data.doc_charge_Effective_From).format('DD MMM YYYY')
											: '—'}
									</p>
								</div>
								<div>
									<span className="text-text-3">Effective To:</span>
									<p className="font-semibold text-text-2 mt-0.5">
										{data.doc_charge_Effective_To
											? dayjs(data.doc_charge_Effective_To).format('DD MMM YYYY')
											: 'Ongoing (No End Date)'}
									</p>
								</div>
							</div>
						</div>

						{/* 2. Audit details */}
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

export default ViewConsultationCharge;
