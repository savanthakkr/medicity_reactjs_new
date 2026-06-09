import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorAuditTrailDetailsApi } from '@/data/apis';
import { formatDateTime } from '@/utils/methods/formatDate';
import ROUTES from '@/utils/constants/routes';
import FormLayout from '@/components/common/FormLayout';
import { usePermissions } from '../../hooks/usePermissions';
import Unauthorized from '../Unauthorized';
import { PERM } from '../../utils/constants/permissionKey2';

const ACTION_BADGES = {
	Create: 'border-pill-approved/30 text-pill-approved bg-pill-approved/10',
	Update: 'border-pill-submitted/30 text-pill-submitted bg-pill-submitted/10',
	Activate: 'border-pill-approved/30 text-pill-approved bg-pill-approved/10',
	Deactivate: 'border-pill-rejected/30 text-pill-rejected bg-pill-rejected/10',
	Approve: 'border-pill-approved/30 text-pill-approved bg-pill-approved/10',
	Reject: 'border-pill-rejected/30 text-pill-rejected bg-pill-rejected/10',
	'Send Back': 'border-pill-sent-back/30 text-pill-sent-back bg-pill-sent-back/10',
	Upload: 'border-pill-draft/30 text-pill-draft bg-pill-draft/10',
	Verify: 'border-pill-approved/30 text-pill-approved bg-pill-approved/10'
};

const DetailField = ({ label, value, render }) => {
	if (value === null || value === undefined || value === '') return null;
	return (
		<div>
			<span className="text-text-3 font-medium">{label}:</span>
			{render ? <div className="mt-0.5">{render()}</div> : <p className="font-semibold text-text-2 mt-0.5">{value}</p>}
		</div>
	);
};

const formatValue = (val) => {
	if (val === null || val === undefined) return 'NULL';
	if (typeof val === 'object') return JSON.stringify(val);
	return String(val);
};

const AuditTrailDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { canAll } = usePermissions();
	const [audit, setAudit] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const res = await doctorAuditTrailDetailsApi(id);
				setAudit(res?.data || null);
			} catch (err) {
				setError('Failed to load audit log details.');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [id]);

	const canViewDetails = canAll(PERM.DOCTOR_AUDIT_TRAIL.LIST, PERM.DOCTOR_AUDIT_TRAIL.VIEW);

	if (!canViewDetails) return <Unauthorized />;

	if (loading) return <div className="p-10 text-center text-[13px] text-text-3">Loading details…</div>;
	if (error) return <div className="p-10 text-center text-[13px] text-red-500">{error}</div>;
	if (!audit) return <div className="p-10 text-center text-[13px] text-text-3">Audit log not found.</div>;

	return (
		<FormLayout
			title="Audit Details"
			backTo={ROUTES.DOCTOR_AUDIT_TRAIL}
			footer={
				null
			}
		>
			<div className="p-[20px] space-y-[14px]">
				{/* Basic Information */}
				<div className="border border-divider rounded-md bg-field overflow-hidden">
					<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
						<span className="font-semibold text-text-1 text-xs">Basic Information</span>
					</div>
					<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-[16px] text-xs">
						<DetailField
							label="Doctor"
							value={audit.doctor_Name ? `${audit.doctor_Name} (${audit.doctor_Code || 'N/A'})` : 'Onboarding'}
						/>
						<DetailField
							label="Timestamp"
							value={audit.changed_at ? formatDateTime(audit.changed_at) : '—'}
						/>
						<DetailField
							label="Action Type"
							value={audit.doc_audit_Action || 'Update'}
							render={() => {
								const action = audit.doc_audit_Action || 'Update';
								const badgeClass = ACTION_BADGES[action] || 'border-pill-draft/30 text-pill-draft bg-pill-draft/10';
								return (
									<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
										{action}
									</span>
								);
							}}
						/>
						<DetailField
							label="Performed By"
							value={audit.changed_by_name || 'System'}
						/>
						<DetailField
							label="Affected Field"
							value={audit.doc_audit_Field_Name}
							render={() => (
								<code className="px-1.5 py-0.5 rounded bg-field text-text-1 text-xs border border-divider font-mono">
									{audit.doc_audit_Field_Name}
								</code>
							)}
						/>
						<DetailField
							label="Affected Table"
							value={audit.doc_audit_Table_Name}
							render={() => (
								<code className="text-xs px-1.5 py-0.5 rounded bg-field border border-divider font-mono">
									{audit.doc_audit_Table_Name}
								</code>
							)}
						/>
					</div>
				</div>

				{/* Field Changes */}
				{audit.doc_audit_Field_Name && (
					<div className="border border-divider rounded-md bg-field overflow-hidden">
						<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
							<span className="font-semibold text-text-1 text-xs">Modified Values</span>
						</div>
						<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
							<div>
								<span className="text-text-3 font-medium">Old Value:</span>
								<div className="mt-1 text-[12px] text-onboard-error line-through bg-onboard-error-bg px-3 py-2 rounded border border-onboard-error/30 font-mono min-h-[38px] flex items-center break-all">
									{formatValue(audit.doc_audit_Old_Value)}
								</div>
							</div>
							<div>
								<span className="text-text-3 font-medium">New Value:</span>
								<div className="mt-1 text-[12px] text-onboard-success bg-onboard-success-bg px-3 py-2 rounded border border-onboard-success/30 font-mono min-h-[38px] flex items-center break-all font-semibold">
									{formatValue(audit.doc_audit_New_Value)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Remarks */}
				<div className="border border-divider rounded-md bg-field overflow-hidden">
					<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
						<span className="font-semibold text-text-1 text-xs">Remarks / Notes</span>
					</div>
					<div className="p-4 text-xs">
						<div className="text-text-2 bg-background/50 p-3 rounded border border-divider leading-relaxed min-h-[38px] flex items-center italic">
							{audit.doc_audit_Remarks || 'No remarks provided.'}
						</div>
					</div>
				</div>
			</div>
		</FormLayout>
	);
};

export default AuditTrailDetails;
