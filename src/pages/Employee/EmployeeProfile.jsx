import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../data/apis/endpoints';
import http from '../../lib/axios/axios';
import { formatDate } from '../../utils/methods/formatDate';
import ROUTES from '../../utils/constants/routes';

const fmt = formatDate;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
	PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
	APPROVED: 'bg-green-50 text-green-700 border border-green-200',
	REJECTED: 'bg-red-50 text-red-700 border border-red-200',
	CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200'
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => {
	if (!value && value !== 0) return null;
	return (
		<div className="flex flex-col gap-[3px]">
			<p className="text-[10.5px] font-medium uppercase tracking-wide text-text-3">{label}</p>
			<p className="text-[13px] font-medium text-text-1 break-words">{value}</p>
		</div>
	);
};

const SectionCard = ({ title, children }) => {
	const visible = React.Children.toArray(children).filter(Boolean);
	if (visible.length === 0) return null;
	return (
		<div className="rounded-[8px] border border-divider bg-card">
			<div className="border-b border-divider px-[16px] py-[10px]">
				<h3 className="text-[11px] font-bold uppercase tracking-wider text-brand-light">{title}</h3>
			</div>
			<div className="grid grid-cols-2 gap-x-[20px] gap-y-[14px] px-[16px] py-[14px] sm:grid-cols-3">{children}</div>
		</div>
	);
};

const LeaveCard = ({ balance }) => {
	const total = Number(balance.opening_balance || 0) + Number(balance.credited_balance || 0);
	const used = Number(balance.used_balance || 0);
	const available = Number(balance.available_balance || 0);
	const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

	return (
		<div className="rounded-[8px] border border-divider bg-card p-[14px]">
			<p className="mb-3 text-[12px] font-bold text-brand-light">{balance.leave_type_Name}</p>
			<div className="grid grid-cols-3 gap-2 mb-3">
				<div className="text-center">
					<p className="text-[20px] font-bold text-text-1">{total}</p>
					<p className="text-[10px] text-text-3">Total</p>
				</div>
				<div className="text-center">
					<p className="text-[20px] font-bold text-red-500">{used}</p>
					<p className="text-[10px] text-text-3">Used</p>
				</div>
				<div className="text-center">
					<p className={`text-[20px] font-bold ${available < 0 ? 'text-red-500' : 'text-green-600'}`}>{available}</p>
					<p className="text-[10px] text-text-3">Available</p>
				</div>
			</div>
			<div className="h-[5px] w-full rounded-full bg-field overflow-hidden">
				<div
					className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-green-400'}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
			{balance.pending_count > 0 && (
				<p className="mt-2 text-[11px] text-amber-600">
					<span className="font-semibold">{balance.pending_count}</span> pending approval
				</p>
			)}
		</div>
	);
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const EmployeeProfile = () => {
	const navigate = useNavigate();
	const [profileData, setProfileData] = useState(null);
	const [leaves, setLeaves] = useState([]);
	const [loading, setLoading] = useState(true);
	const [leavesLoading, setLeavesLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		http
			.post(API.EMPLOYEES.MY_PROFILE)
			.then(res => {
				setProfileData(res?.data || null);

				// Fetch own leave history after profile loads
				setLeavesLoading(true);
				http
					.post(API.EMPLOYEE_LEAVES.LIST, { page: 1, limit: 10 })
					.then(r => setLeaves(r?.data?.list || []))
					.catch(() => {})
					.finally(() => setLeavesLoading(false));
			})
			.catch(() => setError('Failed to load profile.'))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="flex h-[200px] items-center justify-center">
				<p className="text-[13px] text-text-3">Loading profile…</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-[200px] items-center justify-center">
				<p className="text-[13px] text-red-500">{error}</p>
			</div>
		);
	}

	const emp = profileData?.employee;
	const balances = profileData?.leave_balances || [];
	const pendingTotal = profileData?.pending_leaves || 0;

	return (
		<div className="mx-auto w-full max-w-5xl pb-10">
			{/* ── Header ──────────────────────────────────────────────────────── */}
			<div className="mb-6 flex items-center gap-4 rounded-[10px] border border-divider bg-card px-[20px] py-[16px]">
				<div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-brand-light text-[22px] font-bold text-white">
					{emp?.employee_Name?.[0]?.toUpperCase() || '?'}
				</div>
				<div className="min-w-0 flex-1">
					<h1 className="text-[18px] font-bold text-text-1">{emp?.employee_Name || '—'}</h1>
					<p className="text-[12px] text-text-2">
						{[emp?.designation_Name, emp?.department_Name].filter(Boolean).join(' · ')}
					</p>
					{emp?.employee_Code && <p className="mt-[2px] text-[11px] text-text-3">Code: {emp.employee_Code}</p>}
				</div>
				{emp && (
					<span
						className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
							emp.is_active === 1
								? 'bg-green-50 text-green-700 border border-green-200'
								: 'bg-red-50 text-red-700 border border-red-200'
						}`}
					>
						{emp.is_active === 1 ? 'Active' : 'Inactive'}
					</span>
				)}
			</div>

			{!emp ? (
				<div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-4 text-[13px] text-amber-700">
					No employee profile is linked to your account. Please contact your administrator.
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{/* ── Two-column layout: details + leave balance ─────────────── */}
					<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
						{/* Left: Employee Info */}
						<div className="flex flex-col gap-4">
							<SectionCard title="Basic Information">
								<InfoRow label="Employee Name" value={emp.employee_Name} />
								<InfoRow label="Employee Code" value={emp.employee_Code} />
								<InfoRow label="Branch" value={emp.branch_Name} />
								<InfoRow label="Department" value={emp.department_Name} />
								<InfoRow label="Designation" value={emp.designation_Name} />
								<InfoRow label="Section" value={emp.section_Name} />
								<InfoRow label="Employee Type" value={emp.employee_type_Name} />
								<InfoRow label="Employee Category" value={emp.employee_category_Name} />
							</SectionCard>

							<SectionCard title="Employment Details">
								<InfoRow label="Joining Date" value={fmt(emp.joining_Date)} />
								<InfoRow label="Working Status" value={emp.is_working === 1 ? 'Currently Working' : 'Left'} />
								{emp.is_working === 0 && (
									<>
										<InfoRow label="Left On" value={fmt(emp.left_on)} />
										<InfoRow label="With Effect From" value={fmt(emp.with_effect_from)} />
									</>
								)}
								{emp.salary != null && emp.salary !== '' && <InfoRow label="Salary (₹)" value={`₹ ${emp.salary}`} />}
							</SectionCard>

							<SectionCard title="Contact Details">
								<InfoRow label="Email ID" value={emp.email_Id} />
								<InfoRow label="Mobile Number" value={emp.mobile_Number} />
								<InfoRow label="Alternate Mobile" value={emp.alternate_Mobile_Number} />
							</SectionCard>

							<SectionCard title="Personal Details">
								<InfoRow label="Gender" value={emp.gender} />
								<InfoRow label="Date of Birth" value={fmt(emp.date_Of_Birth)} />
								<InfoRow label="Blood Group" value={emp.blood_Group} />
								<InfoRow label="Father's Name" value={emp.father_Name} />
								<InfoRow label="Mother's Name" value={emp.mother_Name} />
								<InfoRow label="Qualification" value={emp.qualification} />
							</SectionCard>

							<SectionCard title="Address">
								<InfoRow label="Residential Address" value={emp.address} />
								<InfoRow label="Office Address" value={emp.office_Address} />
							</SectionCard>

							<SectionCard title="Statutory Information">
								<InfoRow label="ESI Number" value={emp.esi_Number} />
								<InfoRow label="EPF / PF Number" value={emp.epf_Number} />
								<InfoRow label="PAN Number" value={emp.pan_Number} />
								<InfoRow label="Passport Number" value={emp.passport_Number} />
							</SectionCard>
						</div>

						{/* Right: Leave Balance */}
						<div className="flex flex-col gap-4">
							<div className="rounded-[8px] border border-divider bg-card">
								<div className="flex items-center justify-between border-b border-divider px-[16px] py-[10px]">
									<h3 className="text-[11px] font-bold uppercase tracking-wider text-brand-light">
										Leave Balance ({new Date().getFullYear()})
									</h3>
									{pendingTotal > 0 && (
										<span className="rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-semibold text-amber-700">
											{pendingTotal} pending
										</span>
									)}
								</div>
								<div className="p-[14px]">
									{balances.length === 0 ? (
										<div className="rounded-[8px] border border-divider bg-field px-4 py-6 text-center text-[12px] text-text-3">
											No leave balance configured. Contact your admin.
										</div>
									) : (
										<div className="flex flex-col gap-3">
											{balances.map(b => (
												<LeaveCard key={b.employee_leave_balance_Id} balance={b} />
											))}
										</div>
									)}
								</div>
							</div>

							{/* Apply Leave shortcut */}
							<button
								type="button"
								onClick={() => navigate(ROUTES.ADD_EMPLOYEE_LEAVE)}
								className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-brand-light bg-brand-light/5 px-4 py-3 text-[13px] font-semibold text-brand-light transition hover:bg-brand-light/10"
							>
								<svg
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M12 5v14M5 12h14" />
								</svg>
								Apply for Leave
							</button>
						</div>
					</div>

					{/* ── Recent Leaves ────────────────────────────────────────────── */}
					<div className="rounded-[8px] border border-divider bg-card">
						<div className="flex items-center justify-between border-b border-divider px-[16px] py-[10px]">
							<h3 className="text-[11px] font-bold uppercase tracking-wider text-brand-light">Recent Leaves</h3>
							<button
								type="button"
								onClick={() => navigate(ROUTES.EMPLOYEE_LEAVES)}
								className="text-[11px] font-medium text-brand-light hover:underline"
							>
								View all →
							</button>
						</div>

						{leavesLoading ? (
							<div className="px-[16px] py-8 text-center text-[12px] text-text-3">Loading leaves…</div>
						) : leaves.length === 0 ? (
							<div className="px-[16px] py-8 text-center text-[12px] text-text-3">No leave records found.</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-[12px]">
									<thead>
										<tr className="border-b border-divider bg-field">
											<th className="px-[14px] py-[8px] text-left font-semibold text-text-2">Leave Type</th>
											<th className="px-[14px] py-[8px] text-left font-semibold text-text-2">From</th>
											<th className="px-[14px] py-[8px] text-left font-semibold text-text-2">To</th>
											<th className="px-[14px] py-[8px] text-left font-semibold text-text-2">Days</th>
											<th className="px-[14px] py-[8px] text-left font-semibold text-text-2">Status</th>
										</tr>
									</thead>
									<tbody>
										{leaves.map((l, i) => {
											const days =
												l.leave_from && l.leave_to
													? Math.ceil((new Date(l.leave_to) - new Date(l.leave_from)) / (1000 * 60 * 60 * 24)) + 1
													: '—';
											return (
												<tr
													key={l.employee_leave_Id}
													className={`border-b border-divider last:border-0 ${i % 2 === 0 ? '' : 'bg-field/40'}`}
												>
													<td className="px-[14px] py-[8px] font-medium text-text-1">{l.leave_type_Name || '—'}</td>
													<td className="px-[14px] py-[8px] text-text-2">{fmt(l.leave_from)}</td>
													<td className="px-[14px] py-[8px] text-text-2">{fmt(l.leave_to)}</td>
													<td className="px-[14px] py-[8px] text-text-2">
														{typeof days === 'number' ? `${days}d` : days}
													</td>
													<td className="px-[14px] py-[8px]">
														<span
															className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
																STATUS_STYLES[l.leave_status] || 'bg-field text-text-2'
															}`}
														>
															{l.leave_status}
														</span>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>

					{/* Additional Info */}
					{emp.additional_Information && (
						<div className="rounded-[8px] border border-divider bg-card">
							<div className="border-b border-divider px-[16px] py-[10px]">
								<h3 className="text-[11px] font-bold uppercase tracking-wider text-brand-light">
									Additional Information
								</h3>
							</div>
							<p className="whitespace-pre-wrap px-[16px] py-[14px] text-[13px] text-text-1">
								{emp.additional_Information}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default EmployeeProfile;
