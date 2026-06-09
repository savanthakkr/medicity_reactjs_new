import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import Input from '../../../components/common/Input.jsx';
import Select from '../../../components/common/Select.jsx';
import DateInput from '../../../components/common/DateInput.jsx';
import FormLayout from '../../../components/common/FormLayout.jsx';
import DocumentManager from '../../../components/common/DocumentManager.jsx';
import { usePermissions } from '../../../hooks/usePermissions.js';
import { PERM } from '../../../utils/constants/permissionKeys';

const INITIAL = {
	employee_Id: '',
	leave_type_Id: '',
	leave_from: '',
	leave_to: '',
	comments: ''
};

const FieldError = ({ msg }) => (msg ? <p className="mt-1 text-[11px] text-red-600">{msg}</p> : null);

const AddEmployeeLeave = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);

	const { can, isSuperAdmin } = usePermissions();
	// Admin/HR can apply leave on behalf of any employee
	const isAdmin = isSuperAdmin || can(PERM.EMPLOYEE_LEAVE.APPROVE_ALL);

	const [form, setForm] = useState(INITIAL);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
	const [employees, setEmployees] = useState([]);
	const [leaveTypes, setLeaveTypes] = useState([]);
	const [empBalances, setEmpBalances] = useState([]);
	const [balanceLoading, setBalanceLoading] = useState(false);
	const [myEmployee, setMyEmployee] = useState(null); // logged-in user's employee record

	// Document upload state
	const [uploadedDocs, setUploadedDocs] = useState([]); // reported by DocumentManager
	const [existingDocs, setExistingDocs] = useState([]); // docs already saved (edit mode)

	// Load dropdowns based on role
	useEffect(() => {
		const requests = [http.post(API.LEAVE_TYPES.LIST, { page: 1, limit: 200, is_active: 1 })];
		if (isAdmin) {
			requests.push(http.post(API.EMPLOYEES.LIST, { page: 1, limit: 500, is_active: 1 }));
		} else {
			// Non-admin: only fetch their own employee profile
			requests.push(http.post(API.EMPLOYEES.MY_PROFILE));
		}

		Promise.all(requests)
			.then(([ltRes, empOrProfile]) => {
				setLeaveTypes(
					(ltRes?.data?.list || []).map(l => ({
						value: String(l.leave_type_Id),
						label: l.leave_type_Name
					}))
				);

				if (isAdmin) {
					setEmployees(
						(empOrProfile?.data?.list || []).map(e => ({
							value: String(e.employee_Id),
							label: `${e.employee_Name}${e.employee_Code ? ` (${e.employee_Code})` : ''}`
						}))
					);
				} else {
					// Regular employee: auto-set to their own record
					const emp = empOrProfile?.data?.employee || null;
					setMyEmployee(emp);
					if (emp) {
						setForm(f => ({ ...f, employee_Id: String(emp.employee_Id) }));
					}
				}
			})
			.catch(() => {})
			.finally(() => setDropdownsLoaded(true));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAdmin]);

	// Load existing record in edit mode
	useEffect(() => {
		if (!id) return;
		setFetching(true);
		Promise.all([http.post(API.EMPLOYEE_LEAVES.GET(id)), http.post(API.EMPLOYEE_LEAVES.DOCUMENTS(id))])
			.then(([leaveRes, docsRes]) => {
				const d = leaveRes?.data;
				if (d) {
					setForm({
						employee_Id: d.employee_Id ? String(d.employee_Id) : '',
						leave_type_Id: d.leave_type_Id ? String(d.leave_type_Id) : '',
						leave_from: d.leave_from ? d.leave_from.split('T')[0] : '',
						leave_to: d.leave_to ? d.leave_to.split('T')[0] : '',
						comments: d.comments || ''
					});
				}
				setExistingDocs(Array.isArray(docsRes?.data) ? docsRes.data : []);
			})
			.catch(() => addToast({ type: 'error', message: 'Failed to load leave' }))
			.finally(() => setFetching(false));
	}, [id]);

	// When employee is selected, fetch their configured leave balances
	useEffect(() => {
		if (!form.employee_Id || id) return; // skip in edit mode
		setBalanceLoading(true);
		setEmpBalances([]);
		http
			.post(API.EMPLOYEE_LEAVES.BALANCE(form.employee_Id))
			.then(res => setEmpBalances(res?.data || []))
			.catch(() => setEmpBalances([]))
			.finally(() => setBalanceLoading(false));
	}, [form.employee_Id, id]);

	const handleChange = e => {
		const { name, value } = e.target;
		setForm(f => ({ ...f, [name]: value }));
		setErrors(p => ({ ...p, [name]: '' }));
	};

	const removeExistingDoc = async doc => {
		try {
			await http.post(API.EMPLOYEE_LEAVES.DELETE_DOCUMENT(doc.employee_leave_document_Id));
			setExistingDocs(prev => prev.filter(d => d.employee_leave_document_Id !== doc.employee_leave_document_Id));
		} catch {
			addToast({ type: 'error', message: 'Failed to remove document' });
		}
	};

	// Auto-calculate number of days
	const leaveDays = (() => {
		if (!form.leave_from || !form.leave_to) return null;
		const diff = Math.ceil((new Date(form.leave_to) - new Date(form.leave_from)) / (1000 * 60 * 60 * 24)) + 1;
		return diff > 0 ? diff : null;
	})();

	const validate = () => {
		const errs = {};
		if (!form.employee_Id) errs.employee_Id = 'Employee is required.';
		if (!form.leave_type_Id) errs.leave_type_Id = 'Leave type is required.';
		if (!form.leave_from) errs.leave_from = 'Leave from date is required.';
		if (!form.leave_to) errs.leave_to = 'Leave to date is required.';
		if (form.leave_from && form.leave_to && new Date(form.leave_to) < new Date(form.leave_from))
			errs.leave_to = 'Leave To cannot be before Leave From.';
		return errs;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		// Guard: non-admin must have an employee record linked
		if (!id && !isAdmin && !myEmployee) {
			addToast({ type: 'error', message: 'Your account is not linked to an employee record. Contact admin.' });
			return;
		}
		// Guard: block submission if configuration is missing (add mode)
		if (!id && isBlocked) {
			addToast({
				type: 'error',
				message: noLeaveTypes
					? 'Cannot apply leave: No leave types configured. Contact admin.'
					: 'Cannot apply leave: No leave balance configured for this employee. Contact admin.'
			});
			return;
		}
		const errs = validate();
		setErrors(errs);
		if (Object.keys(errs).length > 0) return;

		setLoading(true);
		try {
			const payload = {
				employee_Id: Number(form.employee_Id),
				leave_type_Id: Number(form.leave_type_Id),
				leave_from: form.leave_from,
				leave_to: form.leave_to,
				comments: form.comments.trim() || null,
				documents: uploadedDocs
			};

			if (id) {
				await http.post(API.EMPLOYEE_LEAVES.UPDATE(id), payload);
				// Save any newly uploaded docs for existing leave
				if (uploadedDocs.length > 0) {
					await http.post(API.EMPLOYEE_LEAVES.ADD_DOCUMENTS(id), { documents: uploadedDocs }).catch(() => {});
				}
				addToast({ type: 'success', message: 'Leave updated successfully' });
			} else {
				await http.post(API.EMPLOYEE_LEAVES.CREATE, payload);
				addToast({ type: 'success', message: 'Leave created successfully' });
			}
			navigate(ROUTES.EMPLOYEE_LEAVES);
		} catch (err) {
			addToast({ type: 'error', message: err?.response?.data?.message || 'Operation failed' });
		} finally {
			setLoading(false);
		}
	};

	if (fetching) return <div className="p-10 text-center text-text-3 text-[13px]">Loading…</div>;

	// Derive blocking conditions (add mode only)
	const noLeaveTypes = !id && dropdownsLoaded && leaveTypes.length === 0;
	const noBalanceForEmp = !id && form.employee_Id && !balanceLoading && empBalances.length === 0;
	const isBlocked = noLeaveTypes || noBalanceForEmp;

	return (
		<FormLayout
			title={id ? 'Edit Employee Leave' : 'Add Employee Leave'}
			backTo={ROUTES.EMPLOYEE_LEAVES}
			subtitle={id ? 'Update leave details.' : 'Record a new leave entry for an employee.'}
			onSubmit={handleSubmit}
			formId="employee-leave-form"
			loading={loading}
			isEdit={Boolean(id)}
		>
			<div className="flex flex-col gap-[23px]">
				{/* ── Blocking banners ────────────────────────────────────────── */}
				{noLeaveTypes && (
					<div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3">
						<p className="text-[13px] font-semibold text-amber-700">No Leave Types Configured</p>
						<p className="mt-1 text-[12px] text-amber-600">
							No leave types have been set up in the system. Please contact your administrator to configure leave types
							before applying for leave.
						</p>
					</div>
				)}

				{!noLeaveTypes && noBalanceForEmp && (
					<div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3">
						<p className="text-[13px] font-semibold text-amber-700">No Leave Configuration Found</p>
						<p className="mt-1 text-[12px] text-amber-600">
							No leave balance has been configured for this employee. Please contact your administrator to set up leave
							balance before applying for leave.
						</p>
					</div>
				)}

				<div
					className={`grid grid-cols-1 gap-[10px] xl:grid-cols-2 ${isBlocked ? 'pointer-events-none opacity-50' : ''}`}
				>
					{/* Employee — admins see full dropdown; employees see only themselves */}
					<div>
						{isAdmin ? (
							<>
								<Select
									label="Employee"
									name="employee_Id"
									id="employee_Id"
									value={form.employee_Id}
									onChange={handleChange}
									placeholder="Select employee..."
									options={employees}
									required
								/>
								<FieldError msg={errors.employee_Id} />
							</>
						) : (
							<>
								<label className="form-label">
									Employee <span className="text-red-500">*</span>
								</label>
								<div className="form-input cursor-default select-none bg-field text-[12px] text-text-1">
									{myEmployee ? (
										`${myEmployee.employee_Name}${myEmployee.employee_Code ? ` (${myEmployee.employee_Code})` : ''}`
									) : (
										<span className="italic text-text-3">No employee profile linked to your account</span>
									)}
								</div>
								{!myEmployee && dropdownsLoaded && (
									<p className="mt-1 text-[11px] text-amber-600">
										Your account is not linked to an employee record. Contact admin.
									</p>
								)}
							</>
						)}
					</div>

					{/* Leave Type */}
					<div>
						<Select
							label="Leave Type"
							name="leave_type_Id"
							id="leave_type_Id"
							value={form.leave_type_Id}
							onChange={handleChange}
							placeholder="Select leave type..."
							options={leaveTypes}
							required
						/>
						<FieldError msg={errors.leave_type_Id} />
					</div>

					{/* Leave From */}
					<div>
						<DateInput
							label="Leave From"
							name="leave_from"
							id="leave_from"
							value={form.leave_from}
							onChange={handleChange}
							required
						/>
						<FieldError msg={errors.leave_from} />
					</div>

					{/* Leave To */}
					<div>
						<DateInput
							label="Leave To"
							name="leave_to"
							id="leave_to"
							value={form.leave_to}
							onChange={handleChange}
							required
						/>
						<FieldError msg={errors.leave_to} />
					</div>

					{/* Days display */}
					{leaveDays && (
						<div className="xl:col-span-2">
							<p className="text-[12px] text-text-2">
								Total leave days:{' '}
								<span className="font-bold text-brand-light">
									{leaveDays} day{leaveDays > 1 ? 's' : ''}
								</span>
							</p>
						</div>
					)}

					{/* Comments */}
					<div className="xl:col-span-2">
						<label htmlFor="comments" className="form-label">
							Comments
						</label>
						<textarea
							id="comments"
							name="comments"
							value={form.comments}
							onChange={handleChange}
							rows={3}
							maxLength={250}
							className="form-input resize-none w-full"
							placeholder="Enter any comments or reason for leave..."
						/>
						<p className="mt-1 text-[10.5px] text-text-3 text-right">{form.comments.length}/250</p>
					</div>

					{/* Document Upload */}
					<div className="xl:col-span-2">
						<label className="form-label mb-2 block">Supporting Documents</label>
						<DocumentManager
							showDocumentType={false}
							onChange={setUploadedDocs}
							existingDocs={existingDocs}
							onRemoveExisting={removeExistingDoc}
						/>
					</div>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddEmployeeLeave;
