import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSetAtom } from "jotai";
import { addToastAtom } from "../../../data/states/toastAtom";
import { API } from "../../../data/apis/endpoints";
import ROUTES from "../../../utils/constants/routes";
import http from "../../../lib/axios/axios";
import Input from "../../../components/common/Input.jsx";
import Select from "../../../components/common/Select.jsx";
import AutoComplete from '@/components/dropdown/AutoComplete';
import { usePermissions } from "../../../hooks/usePermissions";
import Unauthorized from "../../Unauthorized";
import { PERM } from "../../../utils/constants/permissionKey2";
import DateInput from "../../../components/common/DateInput.jsx";
import FormLayout from "../../../components/common/FormLayout.jsx";
import FormSection from "../../../components/common/FormSection.jsx";
import Switch from "../../../components/common/Switch.jsx";
import { validateIFSC } from "../../../utils/methods/validations";
import DocumentUploadField from "../../../components/common/DocumentUploadField";
import DocumentPreviewModal from "../../../components/common/DocumentPreviewModal";
import TimeInput from "../../../components/common/TimeInput.jsx";
// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM = {
	doc_Name: '',
	doc_Mobile_Number: '',
	doc_Alternate_Mobile_Number: '',
	doc_Email: '',
	department_Id: '',
	doc_type_Id: '',
	state_Id: '',
	city_Id: '',
	doc_Address: '',
	doc_Pin_Code: '',

	degree_Ids: [], // array of IDs
	specialization_Ids: [], // array of objects { id: string, is_primary: boolean }
	doc_Experience_Years: '',
	doc_Sub_Specialization: '',
	doc_Registration_Number: '',
	doc_Registration_Council: '',
	doc_Registration_Expiry_Date: '',

	doc_Shift_Start_Time: '',
	doc_Shift_End_Time: '',
	doc_Working_Days: [], // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	doc_Default_Consultation_Charge: '',
	doc_Default_Commission_Type: 'Percentage',
	doc_Default_Commission_Value: '',

	doc_Account_Holder_Name: '',
	doc_Bank_Name: '',
	doc_Bank_Account_Number: '',
	doc_IFSC_Code: '',
	doc_PAN_Number: '',

	is_active: '1'
};

const WORKING_DAYS_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Validation helpers ───────────────────────────────────────────────────────

const REGEX = {
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	mobile: /^[6-9]\d{9}$/, // Indian 10-digit mobile
	pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
	ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/
};

function validateForm(form) {
	const errors = {};

	if (!form.doc_Name.trim()) {
		errors.doc_Name = 'Doctor name is required.';
	} else if (form.doc_Name.trim().length < 3 || form.doc_Name.trim().length > 100) {
		errors.doc_Name = 'Name must be 3-100 characters.';
	}

	if (!form.doc_Mobile_Number.trim()) {
		errors.doc_Mobile_Number = 'Mobile number is required.';
	} else if (!REGEX.mobile.test(form.doc_Mobile_Number.replace(/\s|-/g, ''))) {
		errors.doc_Mobile_Number = 'Valid 10-digit mobile required.';
	}

	if (!form.doc_Email.trim()) {
		errors.doc_Email = 'Email ID is required.';
	} else if (!REGEX.email.test(form.doc_Email.trim())) {
		errors.doc_Email = 'Valid email required.';
	}

	if (!form.department_Id) errors.department_Id = 'Department is required.';
	if (!form.doc_type_Id) errors.doc_type_Id = 'Doctor Type is required.';
	if (!form.state_Id) errors.state_Id = 'State is required.';
	if (!form.city_Id) errors.city_Id = 'City is required.';

	if (!form.degree_Ids || form.degree_Ids.length === 0) {
		errors.degree_Ids = 'At least one degree is required.';
	}
	if (!form.specialization_Ids || form.specialization_Ids.length === 0) {
		errors.specialization_Ids = 'At least one specialization is required.';
	} else if (!form.specialization_Ids.some(s => s.is_primary)) {
		errors.specialization_Ids = 'One specialization must be primary.';
	}

	if (!form.doc_Registration_Number.trim()) {
		errors.doc_Registration_Number = 'Registration number is required.';
	}

	if (!form.doc_Default_Consultation_Charge) {
		errors.doc_Default_Consultation_Charge = 'Consultation Charge is required.';
	} else if (Number(form.doc_Default_Consultation_Charge) < 0) {
		errors.doc_Default_Consultation_Charge = 'Must be positive.';
	}

	if (!form.doc_Default_Commission_Type) errors.doc_Default_Commission_Type = 'Commission Type is required.';

	if (form.doc_Default_Commission_Value !== '') {
		const val = Number(form.doc_Default_Commission_Value);
		if (isNaN(val) || val < 0 || val > 100) {
			errors.doc_Default_Commission_Value = 'Must be 0-100.';
		}
	} else {
		errors.doc_Default_Commission_Value = 'Commission Value is required.';
	}

	if (form.doc_IFSC_Code.trim() && !validateIFSC(form.doc_IFSC_Code)) {
		errors.doc_IFSC_Code = 'Invalid IFSC format.';
	}

	if (form.doc_Shift_Start_Time && form.doc_Shift_End_Time) {
		if (form.doc_Shift_End_Time <= form.doc_Shift_Start_Time) {
			errors.doc_Shift_End_Time = 'Shift End Time must be greater than Shift Start Time.';
		}
	}

	return errors;
}

const FieldError = ({ msg }) => (msg ? <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p> : null);

// ─── Multi-Select Components ──────────────────────────────────────────────────

const MultiSelectDegree = ({ selectedIds, onChange, options, error }) => {
	const available = useMemo(() => {
		return options.filter(o => !selectedIds.includes(o.value));
	}, [selectedIds, options]);

	const getLabel = id => options.find(o => o.value === id)?.label || id;

	const remove = id => onChange(selectedIds.filter(x => x !== id));

	return (
		<div className="flex flex-col gap-[6px]">
			<label className="form-label">
				Degree <span className="text-red-500">*</span>
			</label>
			<AutoComplete
				options={available}
				value={null}
				placeholder="Select Degree"
				onChange={(_, selectedOption) => {
					if (selectedOption) {
						onChange([...selectedIds, selectedOption.value]);
					}
				}}
				error={error}
			/>
			{selectedIds.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-2">
					{selectedIds.map(id => (
						<span
							key={id}
							className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium border border-brand-light bg-brand-light/10 text-brand-light"
						>
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
		</div>
	);
};

const MultiSelectSpecialization = ({ selectedItems, onChange, options, error }) => {
	const available = useMemo(() => {
		const selectedIds = selectedItems.map(i => i.id);
		return options.filter(o => !selectedIds.includes(o.value));
	}, [selectedItems, options]);

	const getLabel = id => options.find(o => o.value === id)?.label || id;

	const add = o => {
		onChange([...selectedItems, { id: o.value, is_primary: selectedItems.length === 0 }]);
	};

	const remove = id => {
		const next = selectedItems.filter(x => x.id !== id);
		if (next.length > 0 && !next.some(x => x.is_primary)) {
			next[0].is_primary = true;
		}
		onChange(next);
	};

	const setPrimary = id => {
		onChange(selectedItems.map(x => ({ ...x, is_primary: x.id === id })));
	};

	return (
		<div className="flex flex-col gap-[6px]">
			<label className="form-label">
				Specialization <span className="text-red-500">*</span>
			</label>
			<AutoComplete
				options={available}
				value={null}
				placeholder="Select Specialization"
				onChange={(_, selectedOption) => {
					if (selectedOption) {
						add(selectedOption);
					}
				}}
				error={error}
			/>
			{selectedItems.length > 0 && (
				<div className="mt-2 flex flex-col gap-2">
					{selectedItems.map(item => (
						<div
							key={item.id}
							className="flex items-center gap-3 rounded-[6px] border border-divider bg-field px-3 py-2"
						>
							<span className="flex-1 text-[12px] font-medium text-text-1">{getLabel(item.id)}</span>
							<label className="flex items-center gap-1.5 cursor-pointer">
								<input
									type="radio"
									name="primary_specialization"
									checked={item.is_primary}
									onChange={() => setPrimary(item.id)}
									className="h-3 w-3 accent-brand-light cursor-pointer"
								/>
								<span className="text-[11px] text-text-2">Primary</span>
							</label>
							<button
								type="button"
								onClick={() => remove(item.id)}
								className="ml-2 text-red-500 hover:text-red-600 transition text-[13px] leading-none"
							>
								×
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

// ─── Component ────────────────────────────────────────────────────────────────

const AddDoctor = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [fetching, setFetching] = useState(false);
	const [loading, setLoading] = useState(false);

	const [form, setForm] = useState(INITIAL_FORM);
	const [errors, setErrors] = useState({});
	const [submitted, setSubmitted] = useState(false);

	// Document states matching OnboardingWizard structure
	const [previewModal, setPreviewModal] = useState({ open: false, field: null, label: '' });
	const [fileDataUrls, setFileDataUrls] = useState({});
	const [fileObjects, setFileObjects] = useState({});
	const [filesMetadata, setFilesMetadata] = useState({
		photo: null,
		degree_certificate: null,
		registration_certificate: null,
		govt_id_proof: null
	});

	// Dropdown data
	const [departments, setDepartments] = useState([]);
	const [docTypes, setDocTypes] = useState([]);
	const [degrees, setDegrees] = useState([]);
	const [specializations, setSpecializations] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);

	useEffect(() => {
		const loadDropdowns = async () => {
			try {
				const [deptRes, typeRes, degRes, specRes, stateRes] = await Promise.all([
					http.post(API.DEPARTMENTS.LIST, { page: 1, limit: 200, is_active: 1 }),
					http.post(API.DOC_TYPE.LIST, { page: 1, limit: 200, is_active: 1 }),
					http.post(API.DEGREES.LIST, { page: 1, limit: 200, is_active: 1 }),
					http.post(API.DOC_SPECIALIZATION_MASTER.LIST, { page: 1, limit: 200, is_active: 1 }),
					http.post(API.STATES.LIST, { page: 1, limit: 200, is_active: 1 })
				]);

				setDepartments(
					(deptRes.data?.list || []).map(d => ({ value: String(d.department_Id), label: d.department_Name }))
				);
				setDocTypes((typeRes.data?.list || []).map(t => ({ value: String(t.doc_type_Id), label: t.doc_type_Name })));
				setDegrees((degRes.data?.list || []).map(d => ({ value: String(d.degree_Id), label: d.degree_Name })));
				setSpecializations(
					(specRes.data?.list || []).map(s => ({
						value: String(s.doc_specialization_master_Id),
						label: s.doc_specialization_master_Name
					}))
				);
				setStates((stateRes.data?.list || []).map(s => ({ value: String(s.state_Id), label: s.state_Name })));
			} catch (err) {
				console.error('Failed to load dropdown data:', err);
			}
		};
		loadDropdowns();
	}, []);

	useEffect(() => {
		if (form.state_Id) {
			http.post(API.CITIES.LIST, { page: 1, limit: 500, state_Id: form.state_Id, is_active: 1 }).then(res => {
				setCities((res.data?.list || []).map(c => ({ value: String(c.city_Id), label: c.city_Name })));
			});
		} else {
			setCities([]);
		}
	}, [form.state_Id]);

	useEffect(() => {
		if (id) {
			const fetchDoctor = async () => {
				setFetching(true);
				try {
					const response = await http.post(API.DOCTORS.GET(id));
					const doc = response && response.doc_Id ? response : response?.data;
					if (doc) {
						setForm({
							doc_Name: doc.doc_Name || '',
							doc_Mobile_Number: doc.doc_Mobile_Number || '',
							doc_Alternate_Mobile_Number: doc.doc_Alternate_Mobile_Number || '',
							doc_Email: doc.doc_Email || '',
							department_Id: doc.department_Id ? String(doc.department_Id) : '',
							doc_type_Id: doc.doc_type_Id ? String(doc.doc_type_Id) : '',
							state_Id: doc.state_Id ? String(doc.state_Id) : '',
							city_Id: doc.city_Id ? String(doc.city_Id) : '',
							doc_Address: doc.doc_Address || '',
							doc_Pin_Code: doc.doc_Pin_Code || '',

							degree_Ids: doc.degrees ? doc.degrees.map(d => String(d.doc_degree_master_Id)) : [],
							specialization_Ids: doc.specializations
								? doc.specializations.map(s => ({
										id: String(s.doc_specialization_master_Id),
										is_primary: Boolean(s.is_primary)
									}))
								: [],

							doc_Experience_Years: doc.doc_Experience_Years ? String(doc.doc_Experience_Years) : '',
							doc_Sub_Specialization: doc.doc_Sub_Specialization || '',
							doc_Registration_Number: doc.doc_Registration_Number || '',
							doc_Registration_Council: doc.doc_Registration_Council || '',
							doc_Registration_Expiry_Date: doc.doc_Registration_Expiry_Date
								? doc.doc_Registration_Expiry_Date.split('T')[0]
								: '',

							doc_Shift_Start_Time: doc.doc_Shift_Start_Time || '',
							doc_Shift_End_Time: doc.doc_Shift_End_Time || '',
							doc_Working_Days: doc.doc_Working_Days
								? typeof doc.doc_Working_Days === 'string'
									? JSON.parse(doc.doc_Working_Days)
									: doc.doc_Working_Days
								: [],

							doc_Default_Consultation_Charge: doc.doc_Default_Consultation_Charge || '',
							doc_Default_Commission_Type: doc.doc_Default_Commission_Type || 'Percentage',
							doc_Default_Commission_Value: doc.doc_Default_Commission_Value || '',

							doc_Account_Holder_Name: doc.doc_Account_Holder_Name || '',
							doc_Bank_Name: doc.doc_Bank_Name || '',
							doc_Bank_Account_Number: doc.doc_Bank_Account_Number || '',
							doc_IFSC_Code: doc.doc_IFSC_Code || '',
							doc_PAN_Number: doc.doc_PAN_Number || '',

							is_active: doc.is_active !== undefined ? String(doc.is_active) : '1'
						});
						if (doc.documents && doc.documents.length > 0) {
							const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/';
							const hostUrl = baseUrl.replace(/\/api\/?$/, '');
							const initialDataUrls = {};
							const initialMetadata = {};

							doc.documents.forEach(d => {
								const url = `${hostUrl}/${d.doc_upload_File_Key}`;
								let field = null;
								if (d.doc_upload_File_Name.startsWith('photo_')) field = 'photo';
								else if (d.doc_upload_File_Name.startsWith('degree_certificate_')) field = 'degree_certificate';
								else if (d.doc_upload_File_Name.startsWith('registration_certificate_'))
									field = 'registration_certificate';
								else if (d.doc_upload_File_Name.startsWith('govt_id_proof_')) field = 'govt_id_proof';

								if (field) {
									initialDataUrls[field] = url;
									initialMetadata[field] = {
										name: d.doc_upload_File_Name.replace(field + '_', ''),
										size: d.doc_upload_Size_Bytes ? (d.doc_upload_Size_Bytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A',
										type: url.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
									};
								}
							});
							setFileDataUrls(initialDataUrls);
							setFilesMetadata(initialMetadata);
						} else if (doc.doc_upload_File_Key) {
							const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/';
							const hostUrl = baseUrl.replace(/\/api\/?$/, '');
							setFileDataUrls(prev => ({ ...prev, photo: `${hostUrl}/${doc.doc_upload_File_Key}` }));
							setFilesMetadata(prev => ({
								...prev,
								photo: { name: 'photo', size: 'N/A', type: 'image/jpeg' }
							}));
						}
					}
				} catch (error) {
					console.error('Fetch failed:', error);
					addToast({ type: 'error', message: 'Failed to fetch doctor details' });
				} finally {
					setFetching(false);
				}
			};
			fetchDoctor();
		}
	}, [id, addToast]);

	const handleFileChange = (field, file) => {
		if (!file) return;

		// Validation
		const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
		if (!allowedTypes.includes(file.type)) {
			addToast({ type: 'error', message: `Failed to select ${file.name}: Invalid file type` });
			return;
		}

		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			addToast({ type: 'error', message: `Failed to select ${file.name}: File exceeds 5MB limit` });
			return;
		}

		// Store file object for upload
		setFileObjects(prev => ({ ...prev, [field]: file }));
		setFilesMetadata(prev => ({
			...prev,
			[field]: {
				name: file.name,
				size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
				type: file.type
			}
		}));
		addToast({ type: 'success', message: `${file.name} selected for upload` });

		// Read data URL for preview
		const reader = new FileReader();
		reader.onload = evt => {
			setFileDataUrls(prev => ({ ...prev, [field]: evt.target.result }));
		};
		reader.readAsDataURL(file);
	};

	const handleRemoveFile = field => {
		setFilesMetadata(prev => ({ ...prev, [field]: null }));
		setFileDataUrls(prev => ({ ...prev, [field]: undefined }));
		setFileObjects(prev => ({ ...prev, [field]: undefined }));
	};

	const openPreview = (field, label) => {
		setPreviewModal({ open: true, field, label });
	};

	const closePreview = () => {
		setPreviewModal({ open: false, field: null, label: '' });
	};

	const handleChange = e => {
		const { name, value } = e.target;
		const updated = { ...form, [name]: value };
		// If state changes, clear city
		if (name === 'state_Id') updated.city_Id = '';

		setForm(updated);
		if (submitted) {
			setErrors(validateForm(updated));
		} else if (name === 'doc_Shift_End_Time' || name === 'doc_Shift_Start_Time') {
			setTimeout(() => {
				setErrors(prev => {
					const nextErrors = { ...prev };
					const start = updated.doc_Shift_Start_Time;
					const end = updated.doc_Shift_End_Time;
					if (start && end && end <= start) {
						nextErrors.doc_Shift_End_Time = 'Shift End Time must be greater than Shift Start Time.';
					} else {
						delete nextErrors.doc_Shift_End_Time;
					}
					return nextErrors;
				});
			}, 0);
		}
	};

	const toggleWorkingDay = day => {
		setForm(f => {
			const days = [...f.doc_Working_Days];
			if (days.includes(day)) {
				return { ...f, doc_Working_Days: days.filter(d => d !== day) };
			} else {
				return { ...f, doc_Working_Days: [...days, day] };
			}
		});
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setSubmitted(true);

		const validationErrors = validateForm(form);
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			const firstError = Object.values(validationErrors)[0];
			addToast({ type: 'error', message: firstError });
			return;
		}

		setLoading(true);
		try {
			const payload = { ...form };
			if (payload.doc_Registration_Expiry_Date === '') payload.doc_Registration_Expiry_Date = null;
			if (payload.doc_Shift_Start_Time === '') payload.doc_Shift_Start_Time = null;
			if (payload.doc_Shift_End_Time === '') payload.doc_Shift_End_Time = null;
			if (payload.doc_Bank_Account_Number === '') payload.doc_Bank_Account_Number = null;
			if (payload.doc_Bank_Name === '') payload.doc_Bank_Name = null;
			if (payload.doc_IFSC_Code === '') payload.doc_IFSC_Code = null;
			if (payload.doc_Account_Holder_Name === '') payload.doc_Account_Holder_Name = null;
			if (payload.doc_PAN_Number === '') payload.doc_PAN_Number = null;

			payload.department_Id = Number(payload.department_Id);
			payload.doc_type_Id = Number(payload.doc_type_Id);
			payload.state_Id = Number(payload.state_Id);
			payload.city_Id = Number(payload.city_Id);
			payload.doc_Default_Consultation_Charge = Number(payload.doc_Default_Consultation_Charge);
			payload.doc_Default_Commission_Value = Number(payload.doc_Default_Commission_Value);
			if (payload.doc_Experience_Years) payload.doc_Experience_Years = Number(payload.doc_Experience_Years);
			else payload.doc_Experience_Years = null;

			payload.is_active = Number(payload.is_active);

			if (id) {
				await http.post(API.DOCTORS.UPDATE(id), { inputData: payload });

				const formData = new FormData();
				let hasFiles = false;
				const fields = ['photo', 'degree_certificate', 'registration_certificate', 'govt_id_proof'];
				for (const field of fields) {
					if (fileObjects[field]) {
						formData.append(field, fileObjects[field]);
						hasFiles = true;
					}
				}

				if (hasFiles) {
					await http.upload(API.DOCTORS.UPLOAD_DOCUMENTS(id), formData);
				}
				addToast({ type: 'success', message: 'Doctor updated successfully' });
				setTimeout(() => navigate(-1), 500);
			} else {
				const createRes = await http.post(API.DOCTORS.CREATE, { inputData: payload });
				const newDocId = createRes?.data?.docId || createRes?.docId;

				if (newDocId) {
					const formData = new FormData();
					let hasFiles = false;
					const fields = ['photo', 'degree_certificate', 'registration_certificate', 'govt_id_proof'];
					for (const field of fields) {
						if (fileObjects[field]) {
							formData.append(field, fileObjects[field]);
							hasFiles = true;
						}
					}
					if (hasFiles) {
						await http.upload(API.DOCTORS.UPLOAD_DOCUMENTS(newDocId), formData);
					}
				}
				addToast({ type: 'success', message: 'Doctor created successfully' });
				navigate(ROUTES.DOCTORS);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.msg || 'Operation failed. Please try again.' });
		} finally {
			setLoading(false);
		}
	};

	const { canAll } = usePermissions();
	const canAdd = canAll(PERM.DOCTOR.LIST, PERM.DOCTOR.ADD);
	const canEdit = canAll(PERM.DOCTOR.LIST, PERM.DOCTOR.EDIT);
	const isAllowed = id ? canEdit : canAdd;

	if (!isAllowed) return <Unauthorized />;

	if (fetching) return <div className="p-10 text-center text-text-2 font-medium">Loading doctor details...</div>;

	return (
		<FormLayout
			title={id ? 'Edit Doctor' : 'Add Doctor'}
			backTo={ROUTES.DOCTORS}
			subtitle={id ? 'Update doctor information.' : 'Register a new doctor in the system.'}
			onSubmit={handleSubmit}
			formId="doctor-form"
			loading={loading}
			isEdit={Boolean(id)}
		>
			<div className="flex flex-col gap-2 add-doctor-form-container">
				<FormSection title="Basic Details" subtitle="Primary identification details.">
					<div className="grid grid-cols-12 gap-x-[8px] gap-y-[8px]">
						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Doctor Name"
								name="doc_Name"
								id="doc_Name"
								value={form.doc_Name}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
								required
							/>
							<FieldError msg={errors.doc_Name} />
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Mobile Number"
								name="doc_Mobile_Number"
								id="doc_Mobile_Number"
								value={form.doc_Mobile_Number}
								onChange={handleChange}
								maxLength={10}
								wrapperClassName="flex flex-col gap-[6px]"
								required
							/>
							<FieldError msg={errors.doc_Mobile_Number} />
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Alternate Mobile"
								name="doc_Alternate_Mobile_Number"
								id="doc_Alternate_Mobile_Number"
								value={form.doc_Alternate_Mobile_Number}
								onChange={handleChange}
								maxLength={10}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Email ID"
								name="doc_Email"
								id="doc_Email"
								type="email"
								value={form.doc_Email}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
								required
							/>
							<FieldError msg={errors.doc_Email} />
						</div>

						<div className="col-span-12 sm:col-span-4 flex flex-col gap-[6px]">
							<label className="font-medium leading-none text-text-1 text-[12px]">
								State <span className="text-red-500">*</span>
							</label>
							<AutoComplete
								options={states}
								value={states.find(opt => opt.value === String(form.state_Id)) || null}
								placeholder="Select State"
								onChange={(_, selectedOption) => {
									const val = selectedOption?.value || '';
									const updated = { ...form, state_Id: val, city_Id: '' };
									setForm(updated);
									if (submitted) {
										setErrors(validateForm(updated));
									}
								}}
							/>
							<FieldError msg={errors.state_Id} />
						</div>

						<div className="col-span-12 sm:col-span-4 flex flex-col gap-[6px]">
							<label className="font-medium leading-none text-text-1 text-[12px]">
								City <span className="text-red-500">*</span>
							</label>
							<AutoComplete
								options={cities}
								value={cities.find(opt => opt.value === String(form.city_Id)) || null}
								placeholder="Select City"
								onChange={(_, selectedOption) => {
									const val = selectedOption?.value || '';
									const updated = { ...form, city_Id: val };
									setForm(updated);
									if (submitted) {
										setErrors(validateForm(updated));
									}
								}}
							/>
							<FieldError msg={errors.city_Id} />
						</div>

						<div className="col-span-12 sm:col-span-8">
							<Input
								label="Address"
								name="doc_Address"
								id="doc_Address"
								value={form.doc_Address}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Pin Code"
								name="doc_Pin_Code"
								id="doc_Pin_Code"
								value={form.doc_Pin_Code}
								onChange={handleChange}
								maxLength={10}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
						</div>

						<div className="col-span-12 sm:col-span-6 flex flex-col gap-[6px]">
							<label className="font-medium leading-none text-text-1 text-[12px]">
								Department <span className="text-red-500">*</span>
							</label>
							<AutoComplete
								options={departments}
								value={departments.find(opt => opt.value === String(form.department_Id)) || null}
								placeholder="Select Department"
								onChange={(_, selectedOption) => {
									const val = selectedOption?.value || '';
									const updated = { ...form, department_Id: val };
									setForm(updated);
									if (submitted) {
										setErrors(validateForm(updated));
									}
								}}
							/>
							<FieldError msg={errors.department_Id} />
						</div>

						<div className="col-span-12 sm:col-span-6 flex flex-col gap-[6px]">
							<label className="font-medium leading-none text-text-1 text-[12px]">
								Doctor Type <span className="text-red-500">*</span>
							</label>
							<AutoComplete
								options={docTypes}
								value={docTypes.find(opt => opt.value === String(form.doc_type_Id)) || null}
								placeholder="Select Doctor Type"
								onChange={(_, selectedOption) => {
									const val = selectedOption?.value || '';
									const updated = { ...form, doc_type_Id: val };
									setForm(updated);
									if (submitted) {
										setErrors(validateForm(updated));
									}
								}}
							/>
							<FieldError msg={errors.doc_type_Id} />
						</div>
					</div>
				</FormSection>

				<FormSection title="Professional Details" subtitle="Qualifications and registration.">
					<div className="grid grid-cols-12 gap-x-[8px] gap-y-[8px]">
						<div className="col-span-12 sm:col-span-6">
							<MultiSelectDegree
								selectedIds={form.degree_Ids}
								onChange={ids => {
									setForm(f => ({ ...f, degree_Ids: ids }));
									if (submitted) setErrors(e => ({ ...e, degree_Ids: '' }));
								}}
								options={degrees}
								error={errors.degree_Ids}
							/>
						</div>

						<div className="col-span-12 sm:col-span-6">
							<MultiSelectSpecialization
								selectedItems={form.specialization_Ids}
								onChange={items => {
									setForm(f => ({ ...f, specialization_Ids: items }));
									if (submitted) setErrors(e => ({ ...e, specialization_Ids: '' }));
								}}
								options={specializations}
								error={errors.specialization_Ids}
							/>
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Sub-Specialization"
								name="doc_Sub_Specialization"
								id="doc_Sub_Specialization"
								value={form.doc_Sub_Specialization}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Experience (Years)"
								name="doc_Experience_Years"
								id="doc_Experience_Years"
								type="number"
								min="0"
								step="0.1"
								value={form.doc_Experience_Years}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Registration Council"
								name="doc_Registration_Council"
								id="doc_Registration_Council"
								value={form.doc_Registration_Council}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
						</div>

						<div className="col-span-12 sm:col-span-6">
							<Input
								label="Registration Number"
								name="doc_Registration_Number"
								id="doc_Registration_Number"
								value={form.doc_Registration_Number}
								onChange={handleChange}
								disabled={Boolean(id)}
								wrapperClassName="flex flex-col gap-[6px]"
								required
							/>
							<FieldError msg={errors.doc_Registration_Number} />
						</div>

						<div className="col-span-12 sm:col-span-6">
							<DateInput
								label="Registration Expiry Date"
								name="doc_Registration_Expiry_Date"
								id="doc_Registration_Expiry_Date"
								value={form.doc_Registration_Expiry_Date}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
						</div>
					</div>
				</FormSection>

				<FormSection title="Availability" subtitle="Working days and shift timings.">
					<div className="grid grid-cols-12 gap-x-[8px] gap-y-[8px]">
						<div className="col-span-12 sm:col-span-6 flex flex-col gap-[6px]">
							<label className="font-medium leading-none text-text-1 text-[12px]">Working Days</label>
							<div className="flex flex-wrap gap-2">
								{WORKING_DAYS_OPTIONS.map(day => (
									<label
										key={day}
										className="flex items-center gap-1 cursor-pointer bg-field px-3 py-1 rounded-full border border-divider"
									>
										<input
											type="checkbox"
											className="accent-brand-light"
											checked={form.doc_Working_Days.includes(day)}
											onChange={() => toggleWorkingDay(day)}
										/>
										<span className="text-[12px]">{day}</span>
									</label>
								))}
							</div>
						</div>

						<div className="col-span-12 sm:col-span-3">
							<TimeInput
								label="Shift Start Time"
								name="doc_Shift_Start_Time"
								id="doc_Shift_Start_Time"
								value={form.doc_Shift_Start_Time}
								onChange={handleChange}
								error={errors.doc_Shift_Start_Time}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
						</div>

						<div className="col-span-12 sm:col-span-3">
							<TimeInput
								label="Shift End Time"
								name="doc_Shift_End_Time"
								id="doc_Shift_End_Time"
								value={form.doc_Shift_End_Time}
								onChange={handleChange}
								error={errors.doc_Shift_End_Time}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
						</div>
					</div>
				</FormSection>

				<FormSection title="Financial Details" subtitle="Consultation charges and commission details.">
					<div className="grid grid-cols-12 gap-x-[8px] gap-y-[8px]">
						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Consultation Charge (₹)"
								name="doc_Default_Consultation_Charge"
								id="doc_Default_Consultation_Charge"
								type="number"
								min="0"
								step="0.01"
								value={form.doc_Default_Consultation_Charge}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
								required
							/>
							<FieldError msg={errors.doc_Default_Consultation_Charge} />
						</div>

						<div className="col-span-12 sm:col-span-4 flex flex-col gap-[6px]">
							<label className="font-medium leading-none text-text-1 text-[12px]">
								Commission Type <span className="text-red-500">*</span>
							</label>
							<AutoComplete
								options={[
									{ value: 'Fixed', label: 'Fixed Amount' },
									{ value: 'Percentage', label: 'Percentage' }
								]}
								value={
									[
										{ value: 'Fixed', label: 'Fixed Amount' },
										{ value: 'Percentage', label: 'Percentage' }
									].find(opt => opt.value === form.doc_Default_Commission_Type) || null
								}
								placeholder="Select Commission Type"
								onChange={(_, selectedOption) => {
									const val = selectedOption?.value || '';
									const updated = { ...form, doc_Default_Commission_Type: val };
									setForm(updated);
									if (submitted) {
										setErrors(validateForm(updated));
									}
								}}
							/>
							<FieldError msg={errors.doc_Default_Commission_Type} />
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Commission Value"
								name="doc_Default_Commission_Value"
								id="doc_Default_Commission_Value"
								type="number"
								min="0"
								step="0.01"
								value={form.doc_Default_Commission_Value}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
								required
							/>
							<FieldError msg={errors.doc_Default_Commission_Value} />
						</div>

						<div className="col-span-12 sm:col-span-6">
							<Input
								label="Account Holder Name"
								name="doc_Account_Holder_Name"
								id="doc_Account_Holder_Name"
								value={form.doc_Account_Holder_Name}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
							<FieldError msg={errors.doc_Account_Holder_Name} />
						</div>

						<div className="col-span-12 sm:col-span-6">
							<Input
								label="Bank Name"
								name="doc_Bank_Name"
								id="doc_Bank_Name"
								value={form.doc_Bank_Name}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
							<FieldError msg={errors.doc_Bank_Name} />
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="Bank Account Number"
								name="doc_Bank_Account_Number"
								id="doc_Bank_Account_Number"
								type="text"
								value={form.doc_Bank_Account_Number}
								onChange={handleChange}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
							<FieldError msg={errors.doc_Bank_Account_Number} />
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="IFSC Code"
								name="doc_IFSC_Code"
								id="doc_IFSC_Code"
								value={form.doc_IFSC_Code}
								onChange={handleChange}
								maxLength={11}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
							<FieldError msg={errors.doc_IFSC_Code} />
						</div>

						<div className="col-span-12 sm:col-span-4">
							<Input
								label="PAN Number"
								name="doc_PAN_Number"
								id="doc_PAN_Number"
								value={form.doc_PAN_Number}
								onChange={handleChange}
								maxLength={10}
								wrapperClassName="flex flex-col gap-[6px]"
							/>
							<FieldError msg={errors.doc_PAN_Number} />
						</div>
					</div>
				</FormSection>

				<FormSection title="Document Uploads" subtitle="Upload required certificates and proofs.">
					<div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 lg:grid-cols-4">
						{[
							{ id: 'photo', label: 'Photograph', hint: 'Recent passport-size photo' },
							{ id: 'degree_certificate', label: 'Degree Certificate', hint: 'Degree or qualification proof' },
							{
								id: 'registration_certificate',
								label: 'Registration Cert.',
								hint: 'Medical council registration copy'
							},
							{ id: 'govt_id_proof', label: 'Government ID', hint: 'Aadhaar, PAN, passport, or equivalent' }
						].map(doc => (
							<DocumentUploadField
								key={doc.id}
								id={doc.id}
								label={doc.label}
								hint={doc.hint}
								file={filesMetadata[doc.id]}
								fileDataUrl={fileDataUrls[doc.id]}
								onFileChange={file => handleFileChange(doc.id, file)}
								onRemove={() => handleRemoveFile(doc.id)}
								onPreview={() => openPreview(doc.id, doc.label)}
							/>
						))}
					</div>
				</FormSection>
			</div>

			{/* Document Preview Modal */}
			<DocumentPreviewModal
				open={previewModal.open}
				file={filesMetadata[previewModal.field]}
				fileDataUrl={fileDataUrls[previewModal.field]}
				label={previewModal.label}
				onClose={closePreview}
			/>
		</FormLayout>
	);
};

export default AddDoctor;
