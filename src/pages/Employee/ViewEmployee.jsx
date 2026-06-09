import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../../data/apis/endpoints';
import http from '../../lib/axios/axios';
import { formatDate, formatDateTime } from '../../utils/methods/formatDate';

// ─── Read-only field — returns null when empty so sections can detect no data ─
const Field = ({ label, value }) => {
	if (value === null || value === undefined || value === '' || (value === 0 && label !== 'Salary (₹)')) return null;
	return (
		<div className="col-span-12 sm:col-span-6">
			<p className="mb-[3px] text-[10.5px] font-medium uppercase tracking-wide text-text-3">{label}</p>
			<p className="text-[13px] font-medium text-text-1">{value}</p>
		</div>
	);
};

// ─── Collapsible section — hides entirely when all children are null ──────────
const Section = ({ title, defaultOpen = false, children }) => {
	const [open, setOpen] = useState(defaultOpen);
	const visible = React.Children.toArray(children).filter(Boolean);
	if (visible.length === 0) return null;

	return (
		<div className="mb-3 overflow-hidden rounded-[8px] border border-divider bg-card">
			<button
				type="button"
				onClick={() => setOpen(v => !v)}
				className="flex w-full items-center justify-between px-[14px] py-[10px] text-left transition hover:bg-field"
			>
				<span className="text-[12px] font-bold uppercase tracking-wider text-brand-light">{title}</span>
				<svg
					viewBox="0 0 20 20"
					fill="currentColor"
					className={`h-[14px] w-[14px] text-text-3 transition-transform ${open ? 'rotate-180' : ''}`}
				>
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
						clipRule="evenodd"
					/>
				</svg>
			</button>
			{open && (
				<div className="grid grid-cols-12 gap-x-[16px] gap-y-[12px] border-t border-divider px-[14px] py-[12px]">
					{children}
				</div>
			)}
		</div>
	);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = formatDate;
const fmtDt = formatDateTime;

// ─── Main page ────────────────────────────────────────────────────────────────
const ViewEmployee = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [emp, setEmp] = useState(null);
	const [docs, setDocs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const [empRes, docsRes] = await Promise.all([
					http.post(API.EMPLOYEES.GET(id)),
					http.post(API.EMPLOYEE_DOCUMENTS.GET_BY_EMPLOYEE(id)).catch(() => ({ data: [] }))
				]);
				setEmp(empRes?.data || null);
				setDocs(Array.isArray(docsRes?.data) ? docsRes.data : []);
			} catch {
				setError('Failed to load employee details.');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [id]);

	if (loading) return <div className="p-10 text-center text-[13px] text-text-3">Loading…</div>;
	if (error) return <div className="p-10 text-center text-[13px] text-red-500">{error}</div>;
	if (!emp) return <div className="p-10 text-center text-[13px] text-text-3">Employee not found.</div>;

	return (
		<div className="mx-auto w-full pb-6 pt-[4px]">
			{/* Header */}
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h1 className="text-[18px] font-semibold text-text-1">{emp.employee_Name}</h1>
					{emp.employee_Code && <p className="text-[12px] text-text-3">Code: {emp.employee_Code}</p>}
				</div>
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="text-[12px] font-medium text-brand-light hover:underline"
				>
					← Back to list
				</button>
			</div>

			{/* Deleted banner */}
			{emp.is_deleted === 1 && (
				<div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[12px]">
					<p className="font-semibold text-red-700">This employee has been deleted</p>
					{emp.deleted_at && (
						<p className="mt-1 text-red-600">
							Deleted on: <span className="font-medium">{fmtDt(emp.deleted_at)}</span>
						</p>
					)}
					{(emp.employee_Deleted_Reason || emp.delete_reason) && (
						<p className="mt-1 text-red-600">
							Reason: <span className="font-medium">{emp.employee_Deleted_Reason || emp.delete_reason}</span>
						</p>
					)}
					{emp.deleted_by_user_Name && (
						<p className="mt-1 text-red-600">
							Deleted by: <span className="font-medium">{emp.deleted_by_user_Name}</span>
						</p>
					)}
				</div>
			)}

			{/* ── Basic Information — always open ─────────────────────────────────── */}
			<Section title="Basic Information" defaultOpen>
				<Field label="Employee Name" value={emp.employee_Name} />
				<Field label="Employee Code" value={emp.employee_Code} />
				<Field label="Branch" value={emp.branch_Name} />
				<Field label="Department" value={emp.department_Name} />
				<Field label="Designation" value={emp.designation_Name} />
				<Field label="Section" value={emp.section_Name} />
				<Field label="Employee Type" value={emp.employee_type_Name} />
				<Field label="Employee Category" value={emp.employee_category_Name} />
			</Section>

			{/* ── Contact Details ──────────────────────────────────────────────────── */}
			<Section title="Contact Details">
				<Field label="Email ID" value={emp.email_Id} />
				<Field label="Mobile Number" value={emp.mobile_Number} />
				<Field label="Alternate Mobile" value={emp.alternate_Mobile_Number} />
			</Section>

			{/* ── Employment Details ───────────────────────────────────────────────── */}
			<Section title="Employment Details">
				<Field label="Joining Date" value={fmt(emp.joining_Date)} />
				<Field label="Salary (₹)" value={emp.salary != null ? `₹ ${emp.salary}` : null} />
				<Field
					label="Working Status"
					value={emp.is_working === 1 ? 'Currently Working' : emp.is_working === 0 ? 'Left' : null}
				/>
				{emp.is_working === 0 && (
					<>
						<Field label="Left On" value={fmt(emp.left_on)} />
						<Field label="With Effect From" value={fmt(emp.with_effect_from)} />
					</>
				)}
			</Section>

			{/* ── Address ─────────────────────────────────────────────────────────── */}
			<Section title="Address">
				<Field label="Residential Address" value={emp.address} />
				<Field label="Office Address" value={emp.office_Address} />
			</Section>

			{/* ── Personal Details ─────────────────────────────────────────────────── */}
			<Section title="Personal Details">
				<Field label="Father's Name" value={emp.father_Name} />
				<Field label="Mother's Name" value={emp.mother_Name} />
				<Field label="Date of Birth" value={fmt(emp.date_Of_Birth)} />
				<Field label="Blood Group" value={emp.blood_Group} />
				<Field label="Qualification" value={emp.qualification} />
			</Section>

			{/* ── Statutory Information ────────────────────────────────────────────── */}
			<Section title="Statutory Information">
				<Field label="ESI Number" value={emp.esi_Number} />
				<Field label="EPF Number" value={emp.epf_Number} />
				<Field label="PAN Number" value={emp.pan_Number} />
				<Field label="Passport Number" value={emp.passport_Number} />
			</Section>

			{/* ── Additional Information ───────────────────────────────────────────── */}
			<Section title="Additional Information">
				{emp.additional_Information ? (
					<div className="col-span-12">
						<p className="whitespace-pre-wrap text-[13px] font-medium text-text-1">{emp.additional_Information}</p>
					</div>
				) : null}
			</Section>

			{/* ── Documents ────────────────────────────────────────────────────────── */}
			{docs.length > 0 && (
				<div className="mb-3 overflow-hidden rounded-[8px] border border-divider bg-card">
					<div className="px-[14px] py-[10px]">
						<span className="text-[12px] font-bold uppercase tracking-wider text-brand-light">Documents</span>
					</div>
					<div className="flex flex-col gap-2 border-t border-divider px-[14px] py-[12px]">
						{docs.map(doc => (
							<a
								key={doc.employee_document_Id}
								href={doc.employee_document_File_Key}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 rounded-[6px] border border-divider bg-field px-3 py-2.5 transition hover:border-brand-light"
							>
								<svg
									className="h-5 w-5 shrink-0 text-brand-light"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
								</svg>
								<div className="min-w-0 flex-1">
									{doc.document_Name && <p className="text-[11px] font-semibold text-text-3">{doc.document_Name}</p>}
									<p className="truncate text-[12px] font-medium text-text-1">
										{doc.employee_document_File_Name || doc.employee_document_File_Key}
									</p>
								</div>
								<svg
									className="h-4 w-4 shrink-0 text-text-3"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
									<polyline points="15 3 21 3 21 9" />
									<line x1="10" y1="14" x2="21" y2="3" />
								</svg>
							</a>
						))}
					</div>
				</div>
			)}

			{/* Timestamps */}
			<div className="mt-3 flex flex-wrap gap-4 text-[11px] text-text-3">
				{emp.created_at && <span>Created: {fmtDt(emp.created_at)}</span>}
				{emp.updated_at && <span>Updated: {fmtDt(emp.updated_at)}</span>}
			</div>
		</div>
	);
};

export default ViewEmployee;
