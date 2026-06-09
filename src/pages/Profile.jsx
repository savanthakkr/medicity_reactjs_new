import React, { useEffect, useState } from 'react';
import { API } from '../data/apis/endpoints';
import http from '../lib/axios/axios';
import { formatDate } from '../utils/methods/formatDate';

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = formatDate;

const InfoRow = ({ label, value }) => {
	if (!value) return null;
	return (
		<div className="flex flex-col gap-[2px]">
			<p className="text-[10.5px] font-medium uppercase tracking-wide text-text-3">{label}</p>
			<p className="text-[13px] font-medium text-text-1">{value}</p>
		</div>
	);
};

const LeaveCard = ({ balance }) => {
	const total = Number(balance.opening_balance) + Number(balance.credited_balance);
	const used = Number(balance.used_balance);
	const available = Number(balance.available_balance);
	const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

	return (
		<div className="rounded-[8px] border border-divider bg-card p-[14px]">
			<p className="mb-2 text-[12px] font-bold text-brand-light">{balance.leave_type_Name}</p>
			<div className="grid grid-cols-3 gap-2 mb-3">
				<div className="text-center">
					<p className="text-[18px] font-bold text-text-1">{total}</p>
					<p className="text-[10px] text-text-3">Total</p>
				</div>
				<div className="text-center">
					<p className="text-[18px] font-bold text-red-500">{used}</p>
					<p className="text-[10px] text-text-3">Used</p>
				</div>
				<div className="text-center">
					<p className={`text-[18px] font-bold ${available < 0 ? 'text-red-500' : 'text-green-600'}`}>{available}</p>
					<p className="text-[10px] text-text-3">Available</p>
				</div>
			</div>
			<div className="h-[5px] w-full rounded-full bg-field overflow-hidden">
				<div
					className={`h-full rounded-full ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-green-400'}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
			{balance.pending_count > 0 && (
				<p className="mt-2 text-[11px] text-amber-600">
					<span className="font-semibold">{balance.pending_count}</span> leave{balance.pending_count > 1 ? 's' : ''}{' '}
					pending approval
				</p>
			)}
		</div>
	);
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Profile = () => {
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		http
			.post(API.EMPLOYEES.MY_PROFILE)
			.then(res => setProfileData(res?.data || null))
			.catch(() => setError('Failed to load profile'))
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <div className="p-10 text-center text-[13px] text-text-3">Loading profile…</div>;
	if (error) return <div className="p-10 text-center text-[13px] text-red-500">{error}</div>;

	const emp = profileData?.employee;
	const balances = profileData?.leave_balances || [];
	const pending = profileData?.pending_leaves || 0;

	return (
		<div className="mx-auto max-w-3xl pb-8 pt-4">
			{/* ── Header ─────────────────────────────────────────────────────── */}
			<div className="mb-6 flex items-center gap-4">
				<div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-brand-light text-[22px] font-bold text-white">
					{emp?.employee_Name?.[0]?.toUpperCase() || '?'}
				</div>
				<div>
					<h1 className="text-[20px] font-bold text-text-1">{emp?.employee_Name || '—'}</h1>
					<p className="text-[12px] text-text-3">
						{emp?.designation_Name || ''}
						{emp?.designation_Name && emp?.department_Name ? ' · ' : ''}
						{emp?.department_Name || ''}
					</p>
					{emp?.employee_Code && <p className="text-[11px] text-text-3">Code: {emp.employee_Code}</p>}
				</div>
			</div>

			{!emp ? (
				<div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-700">
					No employee profile is linked to your account. Contact your admin.
				</div>
			) : (
				<>
					{/* ── Employee Info ─────────────────────────────────────────── */}
					<div className="mb-6 rounded-[8px] border border-divider bg-card p-[16px]">
						<h2 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-brand-light">Employee Details</h2>
						<div className="grid grid-cols-2 gap-x-[20px] gap-y-[14px] sm:grid-cols-3">
							<InfoRow label="Branch" value={emp.branch_Name} />
							<InfoRow label="Department" value={emp.department_Name} />
							<InfoRow label="Designation" value={emp.designation_Name} />
							<InfoRow label="Employee Type" value={emp.employee_type_Name} />
							<InfoRow label="Joining Date" value={fmt(emp.joining_Date)} />
							<InfoRow label="Email" value={emp.email_Id} />
							<InfoRow label="Mobile" value={emp.mobile_Number} />
							<InfoRow label="Working Status" value={emp.is_working === 1 ? 'Currently Working' : 'Left'} />
						</div>
					</div>

					{/* ── Leave Summary ─────────────────────────────────────────── */}
					<div>
						<div className="mb-3 flex items-center justify-between">
							<h2 className="text-[11px] font-bold uppercase tracking-wider text-brand-light">
								Leave Balance ({new Date().getFullYear()})
							</h2>
							{pending > 0 && (
								<span className="rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-semibold text-amber-700">
									{pending} pending
								</span>
							)}
						</div>

						{balances.length === 0 ? (
							<div className="rounded-[8px] border border-divider bg-field px-4 py-6 text-center text-[12px] text-text-3">
								No leave balance configured yet. Contact your admin.
							</div>
						) : (
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{balances.map(b => (
									<LeaveCard key={b.employee_leave_balance_Id} balance={b} />
								))}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default Profile;
