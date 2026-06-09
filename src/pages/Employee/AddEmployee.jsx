import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../data/states/toastAtom';
import { API } from '../../data/apis/endpoints';
import ROUTES from '../../utils/constants/routes';
import http from '../../lib/axios/axios';
import Input from '../../components/common/Input.jsx';
import PhoneInput from '../../components/common/PhoneInput.jsx';
import Select from '../../components/common/Select.jsx';
import DateInput from '../../components/common/DateInput.jsx';
import FormLayout from '../../components/common/FormLayout.jsx';
import FormSection from '../../components/common/FormSection.jsx';
import DocumentManager from '../../components/common/DocumentManager.jsx';
import Unauthorized from '../Unauthorized';
import { usePermissions } from '../../hooks/usePermissions.js';
import { PERM } from '../../utils/constants/permissionKeys';

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
	{ value: 'MALE', label: 'Male' },
	{ value: 'FEMALE', label: 'Female' },
	{ value: 'OTHER', label: 'Other' }
];

const BLOOD_GROUP_OPTIONS = [
	{ value: 'A+', label: 'A+' },
	{ value: 'A-', label: 'A-' },
	{ value: 'B+', label: 'B+' },
	{ value: 'B-', label: 'B-' },
	{ value: 'AB+', label: 'AB+' },
	{ value: 'AB-', label: 'AB-' },
	{ value: 'O+', label: 'O+' },
	{ value: 'O-', label: 'O-' }
];

const INITIAL_FORM = {
	employee_Name: '',
	employee_Code: '',
	branch_Id: '',
	reporting_employee_Id: '',
	branch_Ids: [], // UI-only: all selected branch IDs (first = primary stored in branch_Id)
	department_Id: '',
	section_Id: '',
	designation_Id: '',
	employee_type_Id: '',
	employee_category_Id: '',
	email_Id: '',
	mobile_Number: '',
	alternate_Mobile_Number: '',
	joining_Date: '',
	is_working: '1',
	left_on: '',
	with_effect_from: '',
	salary: '',
	address: '',
	office_Address: '',
	father_Name: '',
	mother_Name: '',
	gender: '',
	date_Of_Birth: '',
	blood_Group: '',
	qualification: '',
	esi_Number: '',
	epf_Number: '',
	pan_Number: '',
	passport_Number: '',
	additional_Information: ''
};

// ─── Validation helpers ───────────────────────────────────────────────────────

const REGEX = {
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	mobile: /^[6-9]\d{9}$/, // Indian 10-digit mobile
	pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
	passport: /^[A-Z]{1}[0-9]{7}$/, // Indian passport: letter + 7 digits
	alphaNum: /^[a-zA-Z0-9\-/_]+$/
};

function validateForm(form) {
	const errors = {};

	// ── Required ──────────────────────────────────────────────────────────
	if (!form.employee_Name.trim()) {
		errors.employee_Name = 'Employee name is required.';
	} else if (form.employee_Name.trim().length > 150) {
		errors.employee_Name = 'Employee name must not exceed 150 characters.';
	}

	if (!form.branch_Ids || form.branch_Ids.length === 0) {
		errors.branch_Id = 'At least one branch is required.';
	}

	// ── Email ─────────────────────────────────────────────────────────────
	if (form.email_Id.trim()) {
		if (!REGEX.email.test(form.email_Id.trim())) {
			errors.email_Id = 'Please enter a valid email address (e.g. john@example.com).';
		} else if (form.email_Id.trim().length > 150) {
			errors.email_Id = 'Email must not exceed 150 characters.';
		}
	}

	// ── Mobile ────────────────────────────────────────────────────────────
	if (form.mobile_Number.trim()) {
		const mobile = form.mobile_Number.replace(/\s|-/g, '');
		if (!/^\d+$/.test(mobile)) {
			errors.mobile_Number = 'Mobile number must contain digits only.';
		} else if (!REGEX.mobile.test(mobile)) {
			errors.mobile_Number = 'Enter a valid 10-digit Indian mobile number starting with 6–9.';
		}
	}

	// ── Alternate Mobile ──────────────────────────────────────────────────
	if (form.alternate_Mobile_Number.trim()) {
		const alt = form.alternate_Mobile_Number.replace(/\s|-/g, '');
		if (!/^\d+$/.test(alt)) {
			errors.alternate_Mobile_Number = 'Alternate mobile must contain digits only.';
		} else if (!REGEX.mobile.test(alt)) {
			errors.alternate_Mobile_Number = 'Enter a valid 10-digit Indian mobile number starting with 6–9.';
		} else if (alt === form.mobile_Number.replace(/\s|-/g, '')) {
			errors.alternate_Mobile_Number = 'Alternate mobile must be different from primary mobile.';
		}
	}

	// ── Salary ────────────────────────────────────────────────────────────
	if (form.salary !== '' && form.salary !== null) {
		const sal = Number(form.salary);
		if (isNaN(sal) || sal < 0) {
			errors.salary = 'Salary must be a positive number.';
		} else if (sal > 9999999999.99) {
			errors.salary = 'Salary value is too large.';
		}
	}

	// ── Date of Birth ─────────────────────────────────────────────────────
	if (form.date_Of_Birth) {
		const dob = new Date(form.date_Of_Birth);
		const today = new Date();
		if (isNaN(dob.getTime())) {
			errors.date_Of_Birth = 'Please enter a valid date of birth.';
		} else if (dob >= today) {
			errors.date_Of_Birth = 'Date of birth must be in the past.';
		} else {
			const age = today.getFullYear() - dob.getFullYear();
			if (age < 18) {
				errors.date_Of_Birth = 'Employee must be at least 18 years old.';
			} else if (age > 80) {
				errors.date_Of_Birth = 'Please check the date of birth entered.';
			}
		}
	}

	// ── Joining Date ──────────────────────────────────────────────────────
	if (form.joining_Date) {
		const jd = new Date(form.joining_Date);
		if (isNaN(jd.getTime())) {
			errors.joining_Date = 'Please enter a valid joining date.';
		}
	}

	// ── Left On (required when not working) ───────────────────────────────
	if (form.is_working === '0') {
		if (!form.left_on) {
			errors.left_on = 'Left on date is required when employee has left.';
		} else if (form.joining_Date && new Date(form.left_on) < new Date(form.joining_Date)) {
			errors.left_on = 'Left on date cannot be before joining date.';
		}
	}

	// ── With Effect From ─────────────────────────────────────────────────
	if (form.with_effect_from && form.joining_Date) {
		if (new Date(form.with_effect_from) < new Date(form.joining_Date)) {
			errors.with_effect_from = 'With effect from date cannot be before joining date.';
		}
	}

	// ── PAN Number ───────────────────────────────────────────────────────
	if (form.pan_Number.trim()) {
		const pan = form.pan_Number.trim().toUpperCase();
		if (!REGEX.pan.test(pan)) {
			errors.pan_Number = 'Invalid PAN format. Expected format: AAAAA9999A (e.g. ABCDE1234F).';
		}
	}

	// ── Passport Number ───────────────────────────────────────────────────
	if (form.passport_Number.trim()) {
		const passport = form.passport_Number.trim().toUpperCase();
		if (!REGEX.passport.test(passport)) {
			errors.passport_Number = 'Invalid passport format. Expected: 1 letter + 7 digits (e.g. A1234567).';
		}
	}

	// ── ESI Number  (numeric only, 10–17 digits) ────────────────────────────
	// ── ESI Number  (numeric only, 10–17 digits) ────────────────────────────
	if (form.esi_Number.trim()) {
		const esi = form.esi_Number.trim();
		if (!/^\d{10,17}$/.test(esi)) {
			errors.esi_Number = 'ESI number must contain digits only and be between 10 and 17 digits.';
		}
	}

	// ── PF Number  (format: XX/XXXXX/XXX/XXXXXXX  e.g. WB/12345/000/1234567) ──
	if (form.epf_Number.trim()) {
		const epf = form.epf_Number.trim().toUpperCase();
		if (!/^[A-Z]{2}\/\d{1,7}\/\d{1,3}\/\d{1,7}$/.test(epf)) {
			errors.epf_Number = 'Invalid PF number format. Expected: XX/XXXXX/XXX/XXXXXXX (e.g. WB/12345/000/1234567).';
		}
	}

	return errors;
}

// ─── Error message component ──────────────────────────────────────────────────
const FieldError = ({ msg }) => (msg ? <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p> : null);

// ─── Component ────────────────────────────────────────────────────────────────

// ─── Branch multi-select chip component ──────────────────────────────────────
const BranchMultiSelect = ({ selectedIds, onChange, branches, error }) => {
	const [search, setSearch] = useState('');
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		if (!open) return;
		const handler = e => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	const available = useMemo(() => {
		const q = search.trim().toLowerCase();
		return branches.filter(b => {
			const inSelected = selectedIds.includes(b.value);
			const matchesSearch = q ? b.label.toLowerCase().includes(q) : true;
			return !inSelected && matchesSearch;
		});
	}, [search, selectedIds, branches]);

	const getLabel = id => branches.find(b => b.value === id)?.label || id;

	const add = b => {
		onChange([...selectedIds, b.value]);
		setSearch('');
		setOpen(false);
	};

	const remove = id => onChange(selectedIds.filter(x => x !== id));

	return (
		<div>
			<label className="form-label">
				Branch <span className="text-red-500">*</span>
				<span className="ml-1 text-[10px] font-normal text-text-3">(first selected = primary)</span>
			</label>
			<div ref={ref} className="relative">
				<input
					id="branch_Id"
					type="text"
					className={`form-input pr-9 ${error ? '!border-red-500' : ''}`}
					placeholder="Search and select branch…"
					value={search}
					onChange={e => {
						setSearch(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					autoComplete="off"
				/>
				<svg
					className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="7" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				{open && available.length > 0 && (
					<div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[200px] overflow-y-auto rounded-[8px] border border-divider bg-card shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
						{available.map(b => (
							<button
								type="button"
								key={b.value}
								onClick={() => add(b)}
								className="block w-full px-3 py-2 text-left text-[12px] text-text-1 hover:bg-field"
							>
								{b.label}
							</button>
						))}
					</div>
				)}
			</div>
			{error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
			{selectedIds.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-2">
					{selectedIds.map((id, i) => (
						<span
							key={id}
							className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
								i === 0
									? 'border border-brand-light bg-brand-light/10 text-brand-light'
									: 'border border-divider bg-field text-text-2'
							}`}
						>
							{i === 0 && <span className="mr-0.5 font-semibold">★</span>}
							{getLabel(id)}
							<button
								type="button"
								onClick={() => remove(id)}
								className="ml-0.5 text-current opacity-60 hover:opacity-100 transition text-[13px] leading-none"
							>
								×
							</button>
						</span>
					))}
				</div>
			)}
			{selectedIds.length > 1 && (
				<p className="mt-1 text-[10.5px] text-text-3">★ = primary branch (used for employee code prefix)</p>
			)}
		</div>
	);
};

const AddEmployee = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();
	const [fetching, setFetching] = useState(false);
	const [loading, setLoading] = useState(false);

	const canAdd = canAll(PERM.EMPLOYEE.LIST, PERM.EMPLOYEE.ADD);
	const canEdit = canAll(PERM.EMPLOYEE.LIST, PERM.EMPLOYEE.EDIT);

	if (id && !canEdit) {
		return <Unauthorized />;
	}

	if (!id && !canAdd) {
		return <Unauthorized />;
	}

	const [form, setForm] = useState(INITIAL_FORM);
	const [errors, setErrors] = useState({});
	const [submitted, setSubmitted] = useState(false); // show errors only after first submit attempt
	const [showAdditional, setShowAdditional] = useState(false);
	const [mobileCode, setMobileCode] = useState('+91');
	const [altMobileCode, setAltMobileCode] = useState('+91');

	// Dropdown data
	const [departments, setDepartments] = useState([]);
	const [designations, setDesignations] = useState([]);
	const [branches, setBranches] = useState([]);
	const [sections, setSections] = useState([]);
	const [employeeTypes, setEmployeeTypes] = useState([]);
	const [employeeCategories, setEmployeeCategories] = useState([]);
	const [allEmployees, setAllEmployees] = useState([]); // for reporting manager dropdown

	// Document upload
	const [documentMasters, setDocumentMasters] = useState([]);
	const [uploadedDocs, setUploadedDocs] = useState([]); // reported by DocumentManager: [{ document_Id, document_url, document_name }]
	const [existingDocs, setExistingDocs] = useState([]);

	// Derive the branch code prefix from the selected branch
	// Primary branch is always first in branch_Ids
	const branchCode = useMemo(() => {
		const primaryId = form.branch_Ids[0] ?? '';
		const b = branches.find(b => b.value === primaryId);
		return b?.code || '';
	}, [branches, form.branch_Ids]);

	const generateCode = prefix => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
		const code = `${prefix}-${suffix}`;
		return code.slice(0, 12);
	};

	// Auto-generate employee code whenever branch changes (create mode only)
	useEffect(() => {
		if (id) return; // don't regenerate on edit
		if (branchCode) {
			setForm(prev => ({ ...prev, employee_Code: generateCode(branchCode) }));
		} else {
			setForm(prev => ({ ...prev, employee_Code: '' }));
		}
	}, [branchCode, id]);

	// Load dropdown data on mount
	useEffect(() => {
		const loadDropdowns = async () => {
			try {
				const [deptRes, desRes, branchRes, secRes, etRes, ecRes, empRes, docRes] = await Promise.all([
					http.post(API.DEPARTMENTS.LIST, { page: 1, limit: 200, is_active: 1 }),
					http.post(API.DESIGNATIONS.LIST, { page: 1, limit: 200, is_active: 1 }),
					http.post(API.BRANCHES.LIST, { page: 1, limit: 200, is_active: 1 }),
					http.post(API.SECTIONS.LIST, { page: 1, limit: 200, is_active: 1 }),
					http.post(API.EMPLOYEE_TYPES.LIST, { page: 1, limit: 200, is_active: 1 }),
					http.post(API.EMPLOYEE_CATEGORIES.LIST, { page: 1, limit: 200, is_active: 1 }),
					http.post(API.EMPLOYEES.LIST, { page: 1, limit: 500, is_active: 1 }),
					http.post(API.DOCUMENTS.LIST, { page: 1, limit: 500, is_active: 1 })
				]);

				setDepartments(
					(deptRes.data?.list || []).map(d => ({
						value: String(d.department_Id),
						label: d.department_Name
					}))
				);
				setDesignations(
					(desRes.data?.list || []).map(d => ({
						value: String(d.designation_Id),
						label: d.designation_Name
					}))
				);
				setBranches(
					(branchRes.data?.list || []).map(b => ({
						value: String(b.branch_Id),
						label: b.branch_Name,
						code: b.branch_Code || ''
					}))
				);
				setSections(
					(secRes.data?.list || []).map(s => ({
						value: String(s.section_Id),
						label: s.section_Name
					}))
				);
				setEmployeeTypes(
					(etRes.data?.list || []).map(t => ({
						value: String(t.employee_type_Id),
						label: t.employee_type_Name
					}))
				);
				setEmployeeCategories(
					(ecRes.data?.list || []).map(c => ({
						value: String(c.employee_category_Id),
						label: c.employee_category_Name
					}))
				);
				setAllEmployees(
					(empRes.data?.list || []).map(e => ({
						value: String(e.employee_Id),
						label: `${e.employee_Name}${e.employee_Code ? ` (${e.employee_Code})` : ''}`
					}))
				);
				setDocumentMasters(
					(docRes.data?.list || []).map(d => ({
						value: String(d.document_Id),
						label: d.document_Name
					}))
				);
			} catch (err) {
				console.error('Failed to load dropdown data:', err);
			}
		};

		loadDropdowns();
	}, []);

	// Load employee data when editing
	useEffect(() => {
		if (id) {
			const fetchEmployee = async () => {
				setFetching(true);
				try {
					const [response, docsRes] = await Promise.all([
						http.post(API.EMPLOYEES.GET(id)),
						http.post(API.EMPLOYEE_DOCUMENTS.GET_BY_EMPLOYEE(id)).catch(() => ({ data: [] }))
					]);
					setExistingDocs(Array.isArray(docsRes?.data) ? docsRes.data : []);
					if (response.data) {
						const emp = response.data;
						setForm({
							employee_Name: emp.employee_Name || '',
							employee_Code: emp.employee_Code || '',
							branch_Id: emp.branch_Id ? String(emp.branch_Id) : '',
							branch_Ids: emp.branch_Id ? [String(emp.branch_Id)] : [],
							reporting_employee_Id: emp.reporting_employee_Id ? String(emp.reporting_employee_Id) : '',
							department_Id: emp.department_Id ? String(emp.department_Id) : '',
							section_Id: emp.section_Id ? String(emp.section_Id) : '',
							designation_Id: emp.designation_Id ? String(emp.designation_Id) : '',
							employee_type_Id: emp.employee_type_Id ? String(emp.employee_type_Id) : '',
							employee_category_Id: emp.employee_category_Id ? String(emp.employee_category_Id) : '',
							email_Id: emp.email_Id || '',
							mobile_Number: emp.mobile_Number || '',
							alternate_Mobile_Number: emp.alternate_Mobile_Number || '',
							joining_Date: emp.joining_Date ? emp.joining_Date.split('T')[0] : '',
							is_working: emp.is_working !== undefined ? String(emp.is_working) : '1',
							left_on: emp.left_on ? emp.left_on.split('T')[0] : '',
							with_effect_from: emp.with_effect_from ? emp.with_effect_from.split('T')[0] : '',
							salary: emp.salary || '',
							address: emp.address || '',
							office_Address: emp.office_Address || '',
							gender: emp.gender || '',
							father_Name: emp.father_Name || '',
							mother_Name: emp.mother_Name || '',
							date_Of_Birth: emp.date_Of_Birth ? emp.date_Of_Birth.split('T')[0] : '',
							blood_Group: emp.blood_Group || '',
							qualification: emp.qualification || '',
							esi_Number: emp.esi_Number || '',
							epf_Number: emp.epf_Number || '',
							pan_Number: emp.pan_Number || '',
							passport_Number: emp.passport_Number || '',
							additional_Information: emp.additional_Information || ''
						});
					}
				} catch (error) {
					console.error('Fetch failed:', error);
					addToast({ type: 'error', message: 'Failed to fetch employee details' });
				} finally {
					setFetching(false);
				}
			};
			fetchEmployee();
		}
	}, [id, addToast]);

	if (id && !canEdit) {
		return <Unauthorized />;
	}

	if (!id && !canAdd) {
		return <Unauthorized />;
	}

	// Re-validate on every change after first submit attempt
	const handleChange = e => {
		const { name, value } = e.target;
		const updated = { ...form, [name]: value };
		setForm(updated);
		if (submitted) {
			setErrors(validateForm(updated));
		}
	};

	const removeExistingDoc = async doc => {
		try {
			await http.post(API.EMPLOYEE_DOCUMENTS.DELETE(doc.employee_document_Id));
			setExistingDocs(prev => prev.filter(d => d.employee_document_Id !== doc.employee_document_Id));
		} catch {
			addToast({ type: 'error', message: 'Failed to remove document' });
		}
	};

	const saveDocuments = async empId => {
		if (uploadedDocs.length === 0) return;
		await http.post(API.EMPLOYEE_DOCUMENTS.ADD(empId), { documents: uploadedDocs }).catch(() => {});
	};

	const buildPayload = () => {
		const payload = { ...form };
		// Primary branch = first in branch_Ids array
		payload.branch_Id = form.branch_Ids.length > 0 ? form.branch_Ids[0] : '';
		// Remove branch_Ids from payload (no DB column for it)
		delete payload.branch_Ids;
		// Trim all string fields
		Object.keys(payload).forEach(k => {
			if (typeof payload[k] === 'string') payload[k] = payload[k].trim();
		});
		// Uppercase PAN and Passport
		if (payload.pan_Number) payload.pan_Number = payload.pan_Number.toUpperCase();
		if (payload.passport_Number) payload.passport_Number = payload.passport_Number.toUpperCase();
		// Convert FK IDs to numbers or null
		[
			'branch_Id',
			'department_Id',
			'section_Id',
			'designation_Id',
			'employee_type_Id',
			'employee_category_Id',
			'reporting_employee_Id'
		].forEach(f => {
			payload[f] = payload[f] ? Number(payload[f]) : null;
		});
		payload.is_working = Number(payload.is_working);
		payload.salary = payload.salary ? Number(payload.salary) : null;
		// Remove empty date strings → null
		['joining_Date', 'left_on', 'with_effect_from', 'date_Of_Birth'].forEach(f => {
			if (!payload[f]) payload[f] = null;
		});
		// Remove empty optional strings → null
		[
			'email_Id',
			'mobile_Number',
			'alternate_Mobile_Number',
			'address',
			'office_Address',
			'father_Name',
			'mother_Name',
			'gender',
			'blood_Group',
			'qualification',
			'esi_Number',
			'epf_Number',
			'pan_Number',
			'passport_Number',
			'additional_Information'
		].forEach(f => {
			if (payload[f] === '') payload[f] = null;
		});
		return payload;
	};

	// Fields that live inside the collapsible "Additional Details" section
	const ADDITIONAL_DETAIL_FIELDS = new Set([
		'email_Id',
		'mobile_Number',
		'alternate_Mobile_Number',
		'joining_Date',
		'salary',
		'left_on',
		'with_effect_from',
		'address',
		'office_Address',
		'father_Name',
		'mother_Name',
		'gender',
		'date_Of_Birth',
		'blood_Group',
		'qualification',
		'esi_Number',
		'epf_Number',
		'pan_Number',
		'passport_Number',
		'additional_Information'
	]);

	const handleSubmit = async e => {
		e.preventDefault();
		setSubmitted(true);

		const validationErrors = validateForm(form);
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			// If any error belongs to the Additional Details section, expand it so inline errors are visible
			const hasAdditionalError = Object.keys(validationErrors).some(f => ADDITIONAL_DETAIL_FIELDS.has(f));
			if (hasAdditionalError) setShowAdditional(true);

			// Generic summary toast — individual inline errors appear under each field
			addToast({ type: 'error', message: 'Please fill in all required fields correctly.' });

			// Wait for React to re-render (section expand + error state), then scroll to
			// the first error field that actually exists in the DOM. Some fields (e.g. branch_Id
			// inside BranchMultiSelect) may take an extra tick to mount, so we use 150ms.
			setTimeout(() => {
				const errorFields = Object.keys(validationErrors);
				for (const field of errorFields) {
					const el = document.getElementById(field);
					if (el) {
						el.scrollIntoView({ behavior: 'smooth', block: 'center' });
						el.focus?.();
						break;
					}
				}
			}, 150);

			return;
		}

		setLoading(true);
		try {
			const payload = buildPayload();
			if (id) {
				await http.post(API.EMPLOYEES.UPDATE(id), payload);
				await saveDocuments(id);
				addToast({ type: 'success', message: 'Employee updated successfully' });
				setTimeout(() => navigate(-1), 500);
			} else {
				const res = await http.post(API.EMPLOYEES.CREATE, payload);
				const newId = res?.data?.employee_Id || res?.data?.insertId;
				if (newId) await saveDocuments(newId);
				addToast({ type: 'success', message: 'Employee created successfully' });
				navigate(ROUTES.EMPLOYEES);
			}
		} catch (error) {
			const backendMsg = error?.response?.data?.message || error?.message || 'Operation failed. Please try again.';
			addToast({ type: 'error', message: backendMsg });

			// Surface ESI / EPF backend errors inline under the field
			const fieldErrors = {};
			const lc = backendMsg.toLowerCase();
			if (lc.includes('esi')) fieldErrors.esi_Number = backendMsg;
			if (lc.includes('epf') || lc.includes('pf number')) fieldErrors.epf_Number = backendMsg;
			if (Object.keys(fieldErrors).length > 0) {
				setErrors(prev => ({ ...prev, ...fieldErrors }));
				setShowAdditional(true);
				setTimeout(() => {
					const key = Object.keys(fieldErrors)[0];
					document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}, 150);
			}
		} finally {
			setLoading(false);
		}
	};

	if (fetching) return <div className="p-10 text-center text-text-2 font-medium">Loading employee details...</div>;

	return (
		<FormLayout
			title={id ? 'Edit Employee' : 'Add Employee'}
			backTo={ROUTES.EMPLOYEES}
			subtitle={id ? 'Update employee information.' : 'Register a new employee in the system.'}
			onSubmit={handleSubmit}
			formId="employee-form"
			loading={loading}
			isEdit={Boolean(id)}
		>
			<div className="flex flex-col gap-2">
				{/* ── Basic Information ─────────────────────────────────────────── */}
				<FormSection title="Basic Information" subtitle="Primary employee identification details.">
					<div className="grid grid-cols-12 gap-x-[8px] gap-y-[8px]">
						{/* 1 — Employee Name */}
						<div className="col-span-12 sm:col-span-6">
							<Input
								label="Employee Name"
								name="employee_Name"
								id="employee_Name"
								value={form.employee_Name}
								onChange={handleChange}
								placeholder="Enter Employee Name..."
								required
								error={errors.employee_Name}
							/>
						</div>

						{/* 2 — Branch (first = primary/required, others optional) */}
						<div className="col-span-12 sm:col-span-6">
							<BranchMultiSelect
								selectedIds={form.branch_Ids}
								onChange={ids => {
									setForm(f => ({
										...f,
										branch_Ids: ids,
										branch_Id: ids[0] ?? ''
									}));
									if (submitted) setErrors(e => ({ ...e, branch_Id: '' }));
								}}
								branches={branches}
								error={errors.branch_Id}
							/>
						</div>

						{/* 3 — Employee ID (auto-generated, read-only) */}
						<div className="col-span-12 sm:col-span-6">
							<label className="form-label">Employee ID</label>
							<div className="flex gap-2">
								<div
									className={`form-input flex-1 select-none bg-field ${form.employee_Code ? 'font-mono text-brand-light' : 'text-text-3'}`}
								>
									{form.employee_Code || (branchCode ? 'Generating…' : 'Select a branch first')}
								</div>
								{!id && branchCode && (
									<button
										type="button"
										onClick={() => setForm(prev => ({ ...prev, employee_Code: generateCode(branchCode) }))}
										className="inline-flex items-center rounded-[6px] border border-divider px-[10px] text-[11px] text-text-2 transition hover:border-brand-light hover:text-brand-light"
										title="Generate a new code"
									>
										↻
									</button>
								)}
							</div>
							<p className="mt-1 text-[10.5px] text-text-3">
								{id ? 'Employee ID cannot be changed.' : 'Auto-generated from branch. Click ↻ to regenerate.'}
							</p>
						</div>

						<div className="col-span-12 sm:col-span-6">
							<Select
								label="Department"
								name="department_Id"
								id="department_Id"
								value={form.department_Id}
								onChange={handleChange}
								placeholder="Select Department..."
								options={departments}
							/>
						</div>

						<div className="col-span-12 sm:col-span-6">
							<Select
								label="Designation"
								name="designation_Id"
								id="designation_Id"
								value={form.designation_Id}
								onChange={handleChange}
								placeholder="Select Designation..."
								options={designations}
							/>
						</div>

						<div className="col-span-12 sm:col-span-6">
							<Select
								label="Section"
								name="section_Id"
								id="section_Id"
								value={form.section_Id}
								onChange={handleChange}
								placeholder="Select Section..."
								options={sections}
							/>
						</div>

						<div className="col-span-12 sm:col-span-6">
							<Select
								label="Employee Type"
								name="employee_type_Id"
								id="employee_type_Id"
								value={form.employee_type_Id}
								onChange={handleChange}
								placeholder="Select Employee Type..."
								options={employeeTypes}
							/>
						</div>

						<div className="col-span-12 sm:col-span-6">
							<Select
								label="Employee Category"
								name="employee_category_Id"
								id="employee_category_Id"
								value={form.employee_category_Id}
								onChange={handleChange}
								placeholder="Select Employee Category..."
								options={employeeCategories}
							/>
						</div>

						<div className="col-span-12 sm:col-span-6">
							<Select
								label="Reporting Manager"
								name="reporting_employee_Id"
								id="reporting_employee_Id"
								value={form.reporting_employee_Id}
								onChange={handleChange}
								placeholder="Select Reporting Manager..."
								options={allEmployees.filter(e => e.value !== String(id || ''))}
							/>
						</div>
					</div>
				</FormSection>

				{/* ── Toggle additional sections ────────────────────────────────── */}
				<button
					type="button"
					onClick={() => setShowAdditional(v => !v)}
					className="flex items-center gap-2 self-start rounded-[6px] border border-brand-light px-[14px] py-[7px] text-[12px] font-semibold text-brand-light transition hover:bg-brand-light hover:text-white"
				>
					{showAdditional ? (
						<>
							<svg viewBox="0 0 20 20" fill="currentColor" className="h-[14px] w-[14px]">
								<path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
							</svg>
							Hide Additional Details
						</>
					) : (
						<>
							<svg viewBox="0 0 20 20" fill="currentColor" className="h-[14px] w-[14px]">
								<path
									fillRule="evenodd"
									d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
									clipRule="evenodd"
								/>
							</svg>
							{id ? 'Edit Additional Details' : 'Add Additional Details'}
						</>
					)}
				</button>

				{showAdditional && (
					<>
						{/* ── Contact Details ───────────────────────────────────────────── */}
						<FormSection title="Contact Details" subtitle="Email and phone contact information.">
							<div className="grid grid-cols-12 gap-x-[8px] gap-y-[8px]">
								<div className="col-span-12 sm:col-span-6">
									<Input
										label="Email ID"
										name="email_Id"
										id="email_Id"
										type="email"
										value={form.email_Id}
										onChange={handleChange}
										placeholder="Enter Email ID..."
									/>
									<FieldError msg={errors.email_Id} />
								</div>

								<div className="col-span-12 sm:col-span-6">
									<PhoneInput
										label="Mobile Number"
										name="mobile_Number"
										id="mobile_Number"
										value={form.mobile_Number}
										onChange={handleChange}
										code={mobileCode}
										onCodeChange={setMobileCode}
										maxLength={10}
										placeholder="Enter mobile number"
										required
										error={errors.mobile_Number}
									/>
								</div>

								<div className="col-span-12 sm:col-span-6">
									<PhoneInput
										label="Alternate Mobile"
										name="alternate_Mobile_Number"
										id="alternate_Mobile_Number"
										value={form.alternate_Mobile_Number}
										onChange={handleChange}
										code={altMobileCode}
										onCodeChange={setAltMobileCode}
										maxLength={10}
										placeholder="Enter alternate mobile"
										error={errors.alternate_Mobile_Number}
									/>
								</div>
							</div>
						</FormSection>

						{/* ── Employment Details ────────────────────────────────────────── */}
						<FormSection title="Employment Details" subtitle="Joining, salary and working status.">
							<div className="grid grid-cols-12 gap-x-[8px] gap-y-[8px]">
								<div className="col-span-12 sm:col-span-4">
									<DateInput
										label="Joining Date"
										name="joining_Date"
										id="joining_Date"
										value={form.joining_Date}
										onChange={handleChange}
									/>
									<FieldError msg={errors.joining_Date} />
								</div>

								<div className="col-span-12 sm:col-span-4">
									<Input
										label="Salary (₹)"
										name="salary"
										id="salary"
										type="number"
										min="0"
										value={form.salary}
										onChange={handleChange}
										placeholder="Enter Salary..."
									/>
									<FieldError msg={errors.salary} />
								</div>

								<div className="col-span-12 sm:col-span-4">
									<Select
										label="Working Status"
										name="is_working"
										id="is_working"
										value={form.is_working}
										onChange={handleChange}
										options={[
											{ value: '1', label: 'Currently Working' },
											{ value: '0', label: 'Left' }
										]}
									/>
								</div>

								{form.is_working === '0' && (
									<>
										<div className="col-span-12 sm:col-span-6">
											<DateInput
												label="Left On"
												name="left_on"
												id="left_on"
												value={form.left_on}
												onChange={handleChange}
											/>
											<FieldError msg={errors.left_on} />
										</div>
										<div className="col-span-12 sm:col-span-6">
											<DateInput
												label="With Effect From"
												name="with_effect_from"
												id="with_effect_from"
												value={form.with_effect_from}
												onChange={handleChange}
											/>
											<FieldError msg={errors.with_effect_from} />
										</div>
									</>
								)}
							</div>
						</FormSection>

						{/* ── Address ───────────────────────────────────────────────────── */}
						<FormSection title="Address" subtitle="Residential and office address.">
							<div className="grid grid-cols-12 gap-x-[8px] gap-y-[8px]">
								<div className="col-span-12 sm:col-span-6">
									<label htmlFor="address" className="form-label">
										Residential Address
									</label>
									<textarea
										id="address"
										name="address"
										value={form.address}
										onChange={handleChange}
										rows={3}
										className="form-input resize-none"
										placeholder="Enter Residential Address..."
									/>
								</div>

								<div className="col-span-12 sm:col-span-6">
									<label htmlFor="office_Address" className="form-label">
										Office Address
									</label>
									<textarea
										id="office_Address"
										name="office_Address"
										value={form.office_Address}
										onChange={handleChange}
										rows={3}
										className="form-input resize-none"
										placeholder="Enter Office Address..."
									/>
								</div>
							</div>
						</FormSection>

						{/* ── Personal Details ──────────────────────────────────────────── */}
						<FormSection title="Personal Details" subtitle="Personal information of the employee.">
							<div className="grid grid-cols-12 gap-x-[8px] gap-y-[8px]">
								<div className="col-span-12 sm:col-span-4">
									<Select
										label="Gender"
										name="gender"
										id="gender"
										value={form.gender}
										onChange={handleChange}
										placeholder="Select Gender..."
										options={GENDER_OPTIONS}
									/>
								</div>

								<div className="col-span-12 sm:col-span-4">
									<Input
										label="Father's Name"
										name="father_Name"
										id="father_Name"
										value={form.father_Name}
										onChange={handleChange}
										placeholder="Enter Father's Name..."
									/>
								</div>

								<div className="col-span-12 sm:col-span-4">
									<Input
										label="Mother's Name"
										name="mother_Name"
										id="mother_Name"
										value={form.mother_Name}
										onChange={handleChange}
										placeholder="Enter Mother's Name..."
									/>
								</div>

								<div className="col-span-12 sm:col-span-4">
									<DateInput
										label="Date of Birth"
										name="date_Of_Birth"
										id="date_Of_Birth"
										value={form.date_Of_Birth}
										onChange={handleChange}
									/>
									<FieldError msg={errors.date_Of_Birth} />
								</div>

								<div className="col-span-12 sm:col-span-4">
									<Select
										label="Blood Group"
										name="blood_Group"
										id="blood_Group"
										value={form.blood_Group}
										onChange={handleChange}
										placeholder="Select Blood Group..."
										options={BLOOD_GROUP_OPTIONS}
									/>
								</div>

								<div className="col-span-12 sm:col-span-8">
									<Input
										label="Qualification"
										name="qualification"
										id="qualification"
										value={form.qualification}
										onChange={handleChange}
										placeholder="Enter Qualification..."
									/>
								</div>
							</div>
						</FormSection>

						{/* ── Statutory Information ─────────────────────────────────────── */}
						<FormSection title="Statutory Information" subtitle="ESI, EPF, PAN and passport details.">
							<div className="grid grid-cols-12 gap-x-[8px] gap-y-[8px]">
								<div className="col-span-12 sm:col-span-6">
									<Input
										label="ESI Number"
										name="esi_Number"
										id="esi_Number"
										value={form.esi_Number}
										inputMode="numeric"
										maxLength={17}
										onChange={e => {
											const val = e.target.value.replace(/\D/g, '');
											setForm(f => ({ ...f, esi_Number: val }));
											setErrors(p => ({ ...p, esi_Number: '' }));
										}}
										placeholder="e.g. 12345678901234567"
										error={errors.esi_Number}
									/>
								</div>

								<div className="col-span-12 sm:col-span-6">
									<Input
										label="PF Number"
										name="epf_Number"
										id="epf_Number"
										value={form.epf_Number}
										onChange={e => {
											const val = e.target.value.replace(/[^A-Za-z0-9/]/g, '').toUpperCase();
											setForm(f => ({ ...f, epf_Number: val }));
											setErrors(p => ({ ...p, epf_Number: '' }));
										}}
										placeholder="e.g. WB/12345/000/1234567"
										maxLength={20}
										error={errors.epf_Number}
									/>
								</div>

								<div className="col-span-12 sm:col-span-6">
									<Input
										label="PAN Number"
										name="pan_Number"
										id="pan_Number"
										value={form.pan_Number}
										onChange={handleChange}
										placeholder="Enter PAN Number..."
										maxLength={10}
									/>
									<FieldError msg={errors.pan_Number} />
								</div>

								<div className="col-span-12 sm:col-span-6">
									<Input
										label="Passport Number"
										name="passport_Number"
										id="passport_Number"
										value={form.passport_Number}
										onChange={handleChange}
										placeholder="Enter Passport Number..."
										maxLength={8}
									/>
									<FieldError msg={errors.passport_Number} />
								</div>
							</div>
						</FormSection>

						{/* ── Documents ────────────────────────────────────────────────── */}
						<FormSection title="Documents" subtitle="Upload identity, qualification, or other supporting documents.">
							<DocumentManager
								documentMasters={documentMasters}
								showDocumentType={true}
								onChange={setUploadedDocs}
								existingDocs={existingDocs}
								onRemoveExisting={removeExistingDoc}
							/>
						</FormSection>

						{/* ── Additional Information ────────────────────────────────────── */}
						<FormSection title="Additional Information" subtitle="Any other relevant details.">
							<label htmlFor="additional_Information" className="form-label">
								Additional Information
							</label>
							<textarea
								id="additional_Information"
								name="additional_Information"
								value={form.additional_Information}
								onChange={handleChange}
								rows={4}
								className="form-input resize-none"
								placeholder="Enter Additional Information..."
							/>
						</FormSection>
					</>
				)}
			</div>
		</FormLayout>
	);
};

export default AddEmployee;
