import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import Stepper from '../../../components/common/Stepper';
import Input from '../../../components/common/Input';
import DateInput from '../../../components/common/DateInput';
import TimeInput from '../../../components/common/TimeInput';
import AutoComplete from '../../../components/dropdown/AutoComplete';
import MultiSelect from '../../../components/common/MultiSelect';
import Checkbox from '../../../components/common/Checkbox';
import Radio from '../../../components/common/Radio';
import TextArea from '../../../components/common/TextArea';
import Button from '../../../components/common/Button';
import FormLayout from '../../../components/common/FormLayout';
import ROUTES from '../../../utils/constants/routes';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import http from '../../../lib/axios/axios';
import { API } from '../../../data/apis/endpoints';
import { usePermissions } from '../../../hooks/usePermissions';
import Unauthorized from '../../Unauthorized';
import { PERM } from '../../../utils/constants/permissionKey2';
import {
  docOnboardCreateApi,
  docOnboardGetApi,
  docOnboardSaveDraftApi,
  docOnboardSubmitApi,
  docOnboardUploadDocumentsApi,
} from "../../../data/apis";
import { validatePAN, validateIFSC } from "../../../utils/methods/validations";
import PublicNavbar from "../../../layout/components/Navbar/PublicNavbar";
import OnboardingReviewPanel from "../../../components/Doctor/OnboardingReviewPanel";
import DocumentUploadField from "../../../components/common/DocumentUploadField";
import DocumentPreviewModal from "../../../components/common/DocumentPreviewModal";


const STEPS = ['Personal', 'Qualifications', 'Shift Details', 'Financial', 'Documents', 'Review'];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MIN_DOCTOR_AGE = 18;
const MAX_EXPERIENCE_YEARS = 999.99;
const MAX_SUB_SPECIALIZATION_LENGTH = 120;

// Map step enum from DB to step number
const STEP_MAP = {
	Personal: 1,
	Qualification: 2,
	Shift: 3,
	Financial: 4,
	Document: 5,
	Review: 6
};

// Map step number to DB enum
const STEP_ENUM = {
	1: 'Personal',
	2: 'Qualification',
	3: 'Shift',
	4: 'Financial',
	5: 'Document',
	6: 'Review'
};

const OnboardingWizard = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const rawEditId = searchParams.get('id');
	const token = searchParams.get('token');
	const addToast = useSetAtom(addToastAtom);
	const { canAll } = usePermissions();

	const [activeStep, setActiveStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [draftLoading, setDraftLoading] = useState(false);
	const [nextLoading, setNextLoading] = useState(false);
	const [pageLoading, setPageLoading] = useState(false);

	const [decodedToken, setDecodedToken] = useState(null);
	const [tokenError, setTokenError] = useState('');
	const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
	const [isOnboardRejected, setIsOnboardRejected] = useState(false);
	const [rejectionReason, setRejectionReason] = useState('');

	// Decode and validate token if present
	useEffect(() => {
		if (token) {
			try {
				const jsonStr = decodeURIComponent(escape(atob(token)));
				const data = JSON.parse(jsonStr);

				// Validate timestamp (7 days)
				const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
				if (data.timestamp && Date.now() - data.timestamp < sevenDaysMs) {
					setDecodedToken(data);

					// Set the x-self-reg-token header on the Axios instance so all subsequent requests are authenticated!
					http.setConfig({
						headers: {
							'x-self-reg-token': token
						}
					});
				} else {
					setTokenError('This self-registration link has expired. Please request a new link.');
				}
			} catch (err) {
				setTokenError('Invalid self-registration link.');
			}
		}
	}, [token]);

	const editId = rawEditId || decodedToken?.onboard_id;

	const canAdd = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.ADD);
	const canEdit = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.EDIT);
	const isAllowed = token ? true : (editId ? canEdit : canAdd);

	// Document preview modal state
	const [previewModal, setPreviewModal] = useState({ open: false, field: null, label: '' });
	// Store file data URLs for preview
	const [fileDataUrls, setFileDataUrls] = useState({});
	const previewObjectUrlsRef = useRef({});
	// Store actual File objects for upload
	const [fileObjects, setFileObjects] = useState({});

	// Upload progress states (real progress from API)
	const [uploadProgress, setUploadProgress] = useState({
		degreeCertificate: null,
		registrationCertificate: null,
		govIdProof: null,
		photograph: null
	});

	// Error states for validation
	const [errors, setErrors] = useState({});
	const [pendingDocumentRemovals, setPendingDocumentRemovals] = useState({});
	const maxDobDate = dayjs().subtract(MIN_DOCTOR_AGE, 'year');

	const sanitizeFullName = value => (value || '').replace(/[^A-Za-z\s]/g, '').replace(/\s{2,}/g, ' ');
	const sanitizePinCode = value => (value || '').replace(/\D/g, '').slice(0, 6);
	const sanitizeBankAccountNumber = value => (value || '').replace(/\D/g, '');
	const sanitizeSubSpecialization = value => (value || '').slice(0, MAX_SUB_SPECIALIZATION_LENGTH);
	const getSaveErrorMessage = err => {
		const message = err?.response?.data?.message || err?.data?.message || err?.message || '';
		if (/Out of range value for column 'doc_onboard_Experience_Years'/i.test(message)) {
			return `Total Experience must be ${MAX_EXPERIENCE_YEARS} years or less`;
		}
		if (/Data too long for column 'doc_onboard_Sub_Specialization'/i.test(message)) {
			return `Sub-Specialization details must be ${MAX_SUB_SPECIALIZATION_LENGTH} characters or less`;
		}
		return message || 'Failed to save data';
	};
	const getRemovedDocumentIds = () =>
		Object.values(pendingDocumentRemovals)
			.map(id => Number(id))
			.filter(Number.isFinite);

	// Form State
	const [form, setForm] = useState({
		initiatorType: 'admin',
		doctorEmail: '',
		doctorMobile: '',

		// Personal Details
		fullName: '',
		dob: '',
		gender: 'Male',
		email: '',
		mobileCode: '+91',
		mobile: '',
		alternateMobileCode: '+91',
		alternateMobile: '',
		address: '',
		state: '',
		city: '',
		pinCode: '',

		// Qualification
		department: '',
		docType: '',
		degrees: [],
		specializations: [],
		registrationNumber: '',
		registrationCouncil: '',
		registrationExpiryDate: '',
		experienceYears: '',
		subSpecialization: '',

		// Shift
		shiftStartTime: '09:00',
		shiftEndTime: '17:00',
		workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],

		// Financial
		bankAccountNumber: '',
		bankName: '',
		ifscCode: '',
		accountHolderName: '',
		panNumber: '',
		commissionType: 'Percentage',
		commissionValue: '',
		consultationCharge: '',

		// Documents (metadata from API)
		degreeCertificate: null,
		registrationCertificate: null,
		govIdProof: null,
		photograph: null
	});

	const [statesList, setStatesList] = useState([]);
	const [citiesList, setCitiesList] = useState([]);
	const [degreesList, setDegreesList] = useState([]);
	const [specializationsList, setSpecializationsList] = useState([]);
	const [departmentsList, setDepartmentsList] = useState([]);
	const [docTypesList, setDocTypesList] = useState([]);

	// Load master list dropdown data
	useEffect(() => {
		const loadMasterData = async () => {
			try {
				const [statesRes, degreesRes, specsRes, deptsRes, docTypesRes] = await Promise.all([
					http.post(API.STATES.LIST, { page: 1, limit: 1000, is_active: 1 }),
					http.post(API.DEGREES.LIST, { page: 1, limit: 1000, is_active: 1 }),
					http.post(API.DOC_SPECIALIZATION_MASTER.LIST, { page: 1, limit: 1000, is_active: 1 }),
					http.post(API.DEPARTMENTS.LIST, { page: 1, limit: 1000, is_active: 1 }),
					http.post(API.DOC_TYPE.LIST, { page: 1, limit: 1000, is_active: 1 })
				]);

				if (statesRes?.success || statesRes?.data?.list) {
					setStatesList(statesRes.data?.list || statesRes.list || []);
				}
				if (degreesRes?.success || degreesRes?.data?.list) {
					setDegreesList(degreesRes.data?.list || degreesRes.list || []);
				}
				if (specsRes?.success || specsRes?.data?.list) {
					setSpecializationsList(specsRes.data?.list || specsRes.list || []);
				}
				if (deptsRes?.success || deptsRes?.data?.list) {
					setDepartmentsList(deptsRes.data?.list || deptsRes.list || []);
				}
				if (docTypesRes?.success || docTypesRes?.data?.list) {
					setDocTypesList(docTypesRes.data?.list || docTypesRes.list || []);
				}
			} catch (err) {
				console.error('Failed to load master dropdown data', err);
			}
		};
		loadMasterData();
	}, []);

	// Load cities dynamically when state changes
	useEffect(() => {
		if (form.state) {
			http
				.post(API.CITIES.LIST, { page: 1, limit: 1000, state_Id: Number(form.state), is_active: 1 })
				.then(res => {
					if (res?.success || res?.data?.list) {
						setCitiesList(res.data?.list || res.list || []);
					}
				})
				.catch(err => {
					console.error('Failed to load cities', err);
				});
		} else {
			setCitiesList([]);
		}
	}, [form.state]);

	// Load existing onboarding from API
	useEffect(() => {
		if (editId) {
			setPageLoading(true);
			docOnboardGetApi(editId)
				.then(res => {
					if (res?.success && res.data) {
						const d = res.data;

						// Prevent showing onboarding wizard steps if already submitted, approved, or rejected in self-onboarding flow
						if (token) {
							if (d.status === 'Submitted' || d.status === 'Approved') {
								setIsSubmittedSuccess(true);
								setPageLoading(false);
								return;
							}
							if (d.status === 'Rejected') {
								setIsOnboardRejected(true);
								setRejectionReason(d.rejectionReason || '');
								setPageLoading(false);
								return;
							}
						}

            setForm((prev) => ({
              ...prev,
              fullName: `${d.firstName || ""} ${d.lastName || ""}`.trim(),
              dob: d.dob || "",
              gender: d.gender || "Male",
              email: d.email || "",
              mobile: d.mobile || "",
              alternateMobile: d.alternateMobile || "",
              address: d.address || "",
              state: d.state ? String(d.state) : "",
              city: d.city ? String(d.city) : "",
              pinCode: d.pinCode || "",
              department: (d.department || d.department_Id) ? String(d.department || d.department_Id) : "",
              docType: (d.docType || d.doc_type_Id) ? String(d.docType || d.doc_type_Id) : "",
              registrationNumber: d.registrationNumber || "",
              registrationCouncil: d.registrationCouncil || "",
              registrationExpiryDate: d.registrationExpiryDate || "",
              experienceYears: d.experienceYears || "",
              subSpecialization: d.subSpecialization || "",
              degrees: (d.degrees || []).map((deg) => String(deg.id)),
              specializations: (d.specializations || []).map((s) => String(s.id)),
              shiftStartTime: d.shiftStartTime || "09:00",
              shiftEndTime: d.shiftEndTime || "17:00",
              workingDays: d.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              bankAccountNumber: d.bankAccountNumber || "",
              bankName: d.bankName || "",
              ifscCode: d.ifscCode || "",
              accountHolderName: d.accountHolderName || "",
              panNumber: d.panNumber || "",
              commissionType: d.commissionType || "Percentage",
              commissionValue: d.commissionValue || "",
              consultationCharge: d.consultationCharge || "",
            }));

						// Map uploaded documents
						if (d.documents && d.documents.length > 0) {
							const docMap = {};
							const initialDataUrls = {};
							const apiBase = import.meta.env.VITE_API_BASE_URL || '';
							const serverRoot = apiBase.replace(/\/api\/?$/, '');

							for (const doc of d.documents) {
								const fieldName = doc.fileName?.split('_')[0];
								if (fieldName) {
									docMap[fieldName] = {
										name: doc.fileName?.replace(fieldName + '_', '') || doc.fileName,
										size: doc.sizeBytes ? (doc.sizeBytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A',
										type: 'application/octet-stream',
										uploadId: doc.id,
										fileKey: doc.fileKey
									};
									if (doc.fileKey) {
										initialDataUrls[fieldName] = `${serverRoot}/${doc.fileKey}`;
									}
								}
							}
							setForm(prev => ({
								...prev,
								degreeCertificate: docMap.degreeCertificate || null,
								registrationCertificate: docMap.registrationCertificate || null,
								govIdProof: docMap.govIdProof || null,
								photograph: docMap.photograph || null
							}));
						setFileDataUrls(initialDataUrls);
						setPendingDocumentRemovals({});
					}

						// Set active step from DB
						const stepNum = STEP_MAP[d.currentStep] || 1;
						setActiveStep(stepNum);
					}
				})
				.catch(err => {
					console.error('Failed to load onboarding', err);
					addToast({ type: 'error', message: 'Failed to load onboarding data' });
				})
				.finally(() => setPageLoading(false));
		}
	}, [editId]);

	useEffect(() => {
		return () => {
			Object.values(previewObjectUrlsRef.current).forEach(url => {
				if (typeof url === 'string' && url.startsWith('blob:')) {
					URL.revokeObjectURL(url);
				}
			});
		};
	}, []);

	const set = key => e => {
		const value = e?.target ? e.target.value : e;
		setForm(prev => {
			const updated = { ...prev, [key]: value };

			if (key === 'shiftStartTime' || key === 'shiftEndTime') {
				setTimeout(() => {
					setErrors(errs => {
						const nextErrors = { ...errs };
						const start = updated.shiftStartTime;
						const end = updated.shiftEndTime;
						if (start && end && end <= start) {
							nextErrors.shiftEndTime = 'Shift End Time must be greater than Shift Start Time';
						} else {
							delete nextErrors.shiftEndTime;
							if (start && nextErrors.shiftStartTime) delete nextErrors.shiftStartTime;
						}
						return nextErrors;
					});
				}, 0);
			}

			return updated;
		});

		// Clear validation error on change
		if (errors[key] && key !== 'shiftStartTime' && key !== 'shiftEndTime') {
			setErrors(prev => ({ ...prev, [key]: '' }));
		}
	};

	const handleCheckboxListChange = (key, value) => {
		setForm(prev => {
			const list = prev[key] || [];
			const updated = list.includes(value) ? list.filter(item => item !== value) : [...list, value];
			return { ...prev, [key]: updated };
		});
	};

	// Helper for dynamic cities
	const cityOptions = useMemo(() => {
		return citiesList.map(c => ({ value: String(c.city_Id), label: c.city_Name }));
	}, [citiesList]);

	// Document validations and upload
	const handleFileChange = async (field, file) => {
		if (!file) return;

		// Validation
		const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
		if (!allowedTypes.includes(file.type)) {
			setErrors(prev => ({
				...prev,
				[field]: 'Invalid file type. Supported types: PDF, JPG, PNG.'
			}));
			addToast({ type: 'error', message: `Failed to select ${file.name}: Invalid file type` });
			return;
		}

		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			setErrors(prev => ({
				...prev,
				[field]: 'File size exceeds 5MB limit.'
			}));
			addToast({ type: 'error', message: `Failed to select ${file.name}: File exceeds 5MB limit` });
			return;
		}

		// Clear error
		setErrors(prev => ({ ...prev, [field]: '' }));

		// Always store file locally in memory first
		setFileObjects(prev => ({ ...prev, [field]: file }));
		setForm(prev => ({
			...prev,
			[field]: {
				name: file.name,
				size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
				type: file.type
			}
		}));
		addToast({ type: 'success', message: `${file.name} selected for upload` });

		const previousPreviewUrl = previewObjectUrlsRef.current[field];
		if (typeof previousPreviewUrl === 'string' && previousPreviewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(previousPreviewUrl);
		}

		const previewUrl = URL.createObjectURL(file);
		previewObjectUrlsRef.current[field] = previewUrl;
		setFileDataUrls(prev => ({ ...prev, [field]: previewUrl }));
		setForm(prev => ({
			...prev,
			[field]: {
				...prev[field],
				url: previewUrl
			}
		}));
		setPendingDocumentRemovals(prev => {
			if (!prev[field]) return prev;
			const next = { ...prev };
			delete next[field];
			return next;
		});
	};

	const handleRemoveFile = field => {
		const currentFile = form[field];
		const previewUrl = previewObjectUrlsRef.current[field];
		if (typeof previewUrl === 'string' && previewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(previewUrl);
		}
		delete previewObjectUrlsRef.current[field];

		if (currentFile?.uploadId && !fileObjects[field]) {
			setPendingDocumentRemovals(prev => ({ ...prev, [field]: currentFile.uploadId }));
		} else {
			setPendingDocumentRemovals(prev => {
				if (!prev[field]) return prev;
				const next = { ...prev };
				delete next[field];
				return next;
			});
		}

		setForm(prev => ({
			...prev,
			[field]: null
		}));
		setFileDataUrls(prev => ({ ...prev, [field]: undefined }));
		setFileObjects(prev => ({ ...prev, [field]: undefined }));
	};

	const openPreview = (field, label) => {
		setPreviewModal({ open: true, field, label });
	};

	const closePreview = () => {
		setPreviewModal({ open: false, field: null, label: '' });
	};

	// Build the payload for API calls
	const buildPayload = () => {
		const nameParts = (form.fullName || '').trim().split(' ');
		const firstName = nameParts[0] || '';
		const lastName = nameParts.slice(1).join(' ') || '';
		return {
			firstName: firstName,
			lastName: lastName,
			dob: form.dob,
			gender: form.gender,
			email: form.email,
			mobile: form.mobile,
			alternateMobile: form.alternateMobile,
			address: form.address,
			state: form.state ? Number(form.state) : null,
			city: form.city ? Number(form.city) : null,
			pinCode: form.pinCode,
			department_Id: form.department ? Number(form.department) : null,
			doc_type_Id: form.docType ? Number(form.docType) : null,
			registrationNumber: form.registrationNumber,
			registrationCouncil: form.registrationCouncil,
			registrationExpiryDate: form.registrationExpiryDate,
			experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
			subSpecialization: form.subSpecialization,
			shiftStartTime: form.shiftStartTime,
			shiftEndTime: form.shiftEndTime,
			workingDays: form.workingDays,
			bankAccountNumber: form.bankAccountNumber,
			bankName: form.bankName,
			ifscCode: form.ifscCode,
			accountHolderName: form.accountHolderName,
			panNumber: form.panNumber,
			commissionType: form.commissionType,
			commissionValue: form.commissionValue ? Number(form.commissionValue) : null,
			consultationCharge: form.consultationCharge ? Number(form.consultationCharge) : null,
			currentStep: STEP_ENUM[activeStep] || 'Personal',
			degree_Ids: form.degrees.map(Number),
			specialization_Ids: form.specializations.map(Number),
			removedDocumentIds: getRemovedDocumentIds()
		};
	};

	const buildStepPayload = (step = activeStep) => {
		const nameParts = (form.fullName || '').trim().split(' ');
		const firstName = nameParts[0] || '';
		const lastName = nameParts.slice(1).join(' ') || '';

		const currentStep = STEP_ENUM[step] || STEP_ENUM[1] || 'Personal';
		const payloadByStep = {
			1: {
				firstName,
				lastName,
				dob: form.dob,
				gender: form.gender,
				email: form.email,
				mobile: form.mobile,
				alternateMobile: form.alternateMobile,
				address: form.address,
				state: form.state ? Number(form.state) : null,
				city: form.city ? Number(form.city) : null,
				pinCode: form.pinCode,
				currentStep,
				removedDocumentIds: getRemovedDocumentIds()
			},
			2: {
				department_Id: form.department ? Number(form.department) : null,
				doc_type_Id: form.docType ? Number(form.docType) : null,
				registrationNumber: form.registrationNumber,
				registrationCouncil: form.registrationCouncil,
				registrationExpiryDate: form.registrationExpiryDate,
				experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
				subSpecialization: form.subSpecialization,
				degree_Ids: form.degrees.map(Number),
				specialization_Ids: form.specializations.map(Number),
				currentStep,
				removedDocumentIds: getRemovedDocumentIds()
			},
			3: {
				shiftStartTime: form.shiftStartTime,
				shiftEndTime: form.shiftEndTime,
				workingDays: form.workingDays,
				currentStep,
				removedDocumentIds: getRemovedDocumentIds()
			},
			4: {
				bankAccountNumber: form.bankAccountNumber,
				bankName: form.bankName,
				ifscCode: form.ifscCode,
				accountHolderName: form.accountHolderName,
				panNumber: form.panNumber,
				commissionType: form.commissionType,
				commissionValue: form.commissionValue ? Number(form.commissionValue) : null,
				consultationCharge: form.consultationCharge ? Number(form.consultationCharge) : null,
				currentStep,
				removedDocumentIds: getRemovedDocumentIds()
			},
			5: {
				currentStep,
				removedDocumentIds: getRemovedDocumentIds()
			},
			6: {
				currentStep,
				removedDocumentIds: getRemovedDocumentIds()
			}
		};

		return payloadByStep[step] || payloadByStep[1];
	};

	// Upload any pending files after onboard creation
	const uploadPendingFiles = async onboardId => {
		const fields = ['degreeCertificate', 'registrationCertificate', 'govIdProof', 'photograph'];
		for (const field of fields) {
			if (fileObjects[field]) {
				// Show upload progress starting at 0%
				setUploadProgress(prev => ({ ...prev, [field]: 0 }));

				const formData = new FormData();
				formData.append(field, fileObjects[field]);
				try {
					const res = await docOnboardUploadDocumentsApi(onboardId, formData, progressEvent => {
						const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						setUploadProgress(prev => ({ ...prev, [field]: percent }));
					});

					// Reset progress after success
					setUploadProgress(prev => ({ ...prev, [field]: null }));

					if (res?.success && res.documents?.[field]) {
						const uploaded = res.documents[field];
						setForm(prev => ({
							...prev,
							[field]: {
								name: uploaded.fileName || fileObjects[field].name,
								size: (fileObjects[field].size / 1024 / 1024).toFixed(2) + ' MB',
								type: fileObjects[field].type,
								uploadId: uploaded.doc_upload_Id,
								fileKey: uploaded.fileKey
							}
						}));
					}
				} catch (err) {
					console.error(`Failed to upload pending file ${field}:`, err);
					setUploadProgress(prev => ({ ...prev, [field]: null }));
					setErrors(prev => ({ ...prev, [field]: `Upload failed: ${err.message || 'Error'}` }));
				}
			}
		}
		setFileObjects({});
	};

  // Form Validation per step
  const validateStep = () => {
    const stepErrors = {};
    if (activeStep === 1) {
      const dobValue = form.dob ? dayjs(form.dob) : null;
      if (!form.fullName) {
        stepErrors.fullName = "Full name is required";
      } else if (!/^[A-Za-z\s]+$/.test(form.fullName.trim())) {
        stepErrors.fullName = "Full name can contain only alphabets and spaces";
      }
      if (!form.dob) {
        stepErrors.dob = "DOB is required";
      } else if (!dobValue || !dobValue.isValid()) {
        stepErrors.dob = "Invalid date of birth";
      } else if (dobValue.isAfter(dayjs(), 'day')) {
        stepErrors.dob = "Date of birth cannot be in the future";
      } else if (dayjs().diff(dobValue, 'year') < MIN_DOCTOR_AGE) {
        stepErrors.dob = "Doctor must be at least 18 years old";
      }
      if (!form.email) {
        stepErrors.email = "Email is required";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
        stepErrors.email = "Invalid email format";
      }
      if (!form.mobile) {
        stepErrors.mobile = "Mobile number is required";
      } else if (!/^\d{10}$/.test(form.mobile)) {
        stepErrors.mobile = "Mobile number must be exactly 10 digits";
      }
      if (form.alternateMobile && !/^\d{10}$/.test(form.alternateMobile)) {
        stepErrors.alternateMobile = "Alternative mobile number must be exactly 10 digits";
      }
      if (!form.address) stepErrors.address = "Address is required";
      if (!form.state) stepErrors.state = "State is required";
      if (!form.city) stepErrors.city = "City is required";
      if (!form.pinCode) {
        stepErrors.pinCode = "Pin Code is required";
      } else if (!/^\d{6}$/.test(form.pinCode)) {
        stepErrors.pinCode = "Pin Code must be exactly 6 digits";
      }
    } else if (activeStep === 2) {
      const dobValue = form.dob ? dayjs(form.dob) : null;
      if (!form.department) stepErrors.department = "Department is required";
      if (!form.docType) stepErrors.docType = "Doctor Type is required";
      if (form.degrees.length === 0) stepErrors.degrees = "Please select at least one degree";
      if (form.specializations.length === 0) stepErrors.specializations = "Please select at least one specialization";
      if (!form.registrationNumber) stepErrors.registrationNumber = "Registration number is required";
      if (!form.registrationCouncil) stepErrors.registrationCouncil = "Registration council is required";
      if (!form.registrationExpiryDate) stepErrors.registrationExpiryDate = "Registration expiry date is required";
      if (!form.experienceYears) {
        stepErrors.experienceYears = "Experience is required";
      } else {
        const experienceYears = Number(form.experienceYears);
        if (!Number.isFinite(experienceYears) || experienceYears < 0) {
          stepErrors.experienceYears = "Experience must be a valid number";
        } else if (experienceYears > MAX_EXPERIENCE_YEARS) {
          stepErrors.experienceYears = `Experience must be ${MAX_EXPERIENCE_YEARS} years or less`;
        } else if (dobValue?.isValid()) {
          const ageYears = dayjs().diff(dobValue, 'year', true);
          if (experienceYears > ageYears) {
            stepErrors.experienceYears = "Total experience cannot be greater than age";
          }
        }
      }
      if (form.subSpecialization && form.subSpecialization.length > MAX_SUB_SPECIALIZATION_LENGTH) {
        stepErrors.subSpecialization = `Sub-Specialization details must be ${MAX_SUB_SPECIALIZATION_LENGTH} characters or less`;
      }
    } else if (activeStep === 3) {
      if (form.workingDays.length === 0) stepErrors.workingDays = "Please select at least one working day";
      if (!form.shiftStartTime) stepErrors.shiftStartTime = "Shift Start Time is required";
      if (!form.shiftEndTime) stepErrors.shiftEndTime = "Shift End Time is required";
      if (form.shiftStartTime && form.shiftEndTime) {
        if (form.shiftEndTime <= form.shiftStartTime) {
          stepErrors.shiftEndTime = "Shift End Time must be greater than Shift Start Time";
        }
      }
    } else if (activeStep === 4) {
      if (!form.bankAccountNumber) stepErrors.bankAccountNumber = "Account number is required";
      else if (!/^\d+$/.test(form.bankAccountNumber)) {
        stepErrors.bankAccountNumber = "Bank account number can contain only digits";
      }
      if (!form.bankName) stepErrors.bankName = "Bank name is required";
      else if (!/^[A-Za-z\s]+$/.test(form.bankName.trim())) {
        stepErrors.bankName = "Bank name can contain only alphabets and spaces";
      }
      if (!form.ifscCode) {
        stepErrors.ifscCode = "IFSC code is required";
      } else if (!validateIFSC(form.ifscCode)) {
        stepErrors.ifscCode = "Invalid IFSC code format";
      }
      if (!form.accountHolderName) stepErrors.accountHolderName = "Account holder name is required";
      else if (!/^[A-Za-z\s]+$/.test(form.accountHolderName.trim())) {
        stepErrors.accountHolderName = "Account holder name can contain only alphabets and spaces";
      }
      if (!form.panNumber) {
        stepErrors.panNumber = "PAN number is required";
      } else if (!validatePAN(form.panNumber)) {
        stepErrors.panNumber = "Invalid PAN number format";
      }
      if (!form.commissionValue) stepErrors.commissionValue = "Commission value is required";
      if (!form.consultationCharge) stepErrors.consultationCharge = "Consultation charge is required";
    } else if (activeStep === 5) {
      if (!form.degreeCertificate) stepErrors.degreeCertificate = "Degree certificate is required";
      if (!form.registrationCertificate) stepErrors.registrationCertificate = "Registration certificate is required";
      if (!form.govIdProof) stepErrors.govIdProof = "Government ID proof is required";
      if (!form.photograph) stepErrors.photograph = "Photograph is required";
    }

		setErrors(stepErrors);
		return Object.keys(stepErrors).length === 0;
	};

	// Save as Draft — no validation, persists current data to API
	const handleSaveDraft = async () => {
		setDraftLoading(true);
		try {
			const payload = buildStepPayload();
			let currentId = editId;

			if (!currentId) {
				// Create a new draft first
				const createRes = await docOnboardCreateApi(payload);
				if (createRes?.success && createRes.data?.doc_onboard_Id) {
					currentId = createRes.data.doc_onboard_Id;
					setSearchParams({ id: currentId });
					// Upload any pending files
					await uploadPendingFiles(currentId);
				} else {
					addToast({ type: 'error', message: getSaveErrorMessage(createRes) });
					setDraftLoading(false);
					return;
				}
			} else {
				// Update existing draft
				await docOnboardSaveDraftApi(currentId, payload);
				await uploadPendingFiles(currentId);
			}

			addToast({ type: 'success', message: 'Draft saved successfully!' });
			setPendingDocumentRemovals({});
		} catch (err) {
			console.error('Save draft error:', err);
			addToast({ type: 'error', message: getSaveErrorMessage(err) });
		} finally {
			setDraftLoading(false);
		}
	};

	const handleNext = async () => {
		if (!validateStep()) {
			addToast({ type: 'error', message: 'Please resolve form validation errors before proceeding' });
			return;
		}

		setNextLoading(true);
		try {
			const payload = buildStepPayload();
			let currentId = editId || searchParams.get('id');

			if (!currentId) {
				const createRes = await docOnboardCreateApi(payload);
				if (createRes?.success && createRes.data?.doc_onboard_Id) {
					currentId = createRes.data.doc_onboard_Id;
					setSearchParams({ id: currentId });
					await uploadPendingFiles(currentId);
				} else {
					addToast({ type: 'error', message: getSaveErrorMessage(createRes) });
					setNextLoading(false);
					return;
				}
			} else {
				await docOnboardSaveDraftApi(currentId, payload);
				await uploadPendingFiles(currentId);
			}
		} catch (err) {
			console.error('Save error during next:', err);
			addToast({ type: 'error', message: getSaveErrorMessage(err) });
			setNextLoading(false);
			return;
		} finally {
			setNextLoading(false);
		}

		if (activeStep < STEPS.length) {
			setActiveStep(activeStep + 1);
		}
		setPendingDocumentRemovals({});
	};

	const handleBack = () => {
		if (activeStep > 1) {
			setActiveStep(activeStep - 1);
		}
	};

	// Submit final Onboarding workflow
	const handleSubmit = async e => {
		e.preventDefault();
		if (activeStep < STEPS.length) {
			handleNext();
			return;
		}

		if (!validateStep()) return;

		setLoading(true);
		try {
			const payload = buildPayload();
			let currentId = editId;

			if (!currentId) {
				const createRes = await docOnboardCreateApi(payload);
				if (createRes?.success && createRes.data?.doc_onboard_Id) {
					currentId = createRes.data.doc_onboard_Id;
					await uploadPendingFiles(currentId);
				} else {
					addToast({ type: 'error', message: getSaveErrorMessage(createRes) });
					setLoading(false);
					return;
				}
			} else {
				await uploadPendingFiles(currentId);
			}

			await docOnboardSubmitApi(currentId, payload);
			addToast({ type: 'success', message: 'Doctor onboarding form submitted successfully!' });
			setPendingDocumentRemovals({});
			if (token) {
				setIsSubmittedSuccess(true);
			} else {
				navigate(ROUTES.DOCTOR_ONBOARDING_LIST);
			}
		} catch (err) {
			console.error('Submit error:', err);
			addToast({ type: 'error', message: getSaveErrorMessage(err) });
		} finally {
			setLoading(false);
		}
	};

	if (!isAllowed) return <Unauthorized />;

	if (tokenError) {
		return (
			<div className={`${token ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background flex flex-col`}>
				{token && <PublicNavbar />}
				<div className="flex-1 flex items-center justify-center bg-[#EBF1F7] dark:bg-background p-6">
					<div className="w-full max-w-lg bg-card rounded-2xl shadow-xl p-8 border border-divider text-center space-y-6">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-onboard-error-bg text-onboard-error">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
								className="w-8 h-8"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-text-1">Link Expired or Invalid</h2>
						<p className="text-text-3 text-p2 max-w-md mx-auto">{tokenError}</p>
					</div>
				</div>
			</div>
		);
	}

	if (isSubmittedSuccess) {
		return (
			<div className={`${token ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background flex flex-col`}>
				{token && <PublicNavbar />}
				<div className="flex-1 flex items-center justify-center bg-[#EBF1F7] dark:bg-background p-6">
					<div className="w-full max-w-lg bg-card rounded-2xl shadow-xl p-8 border border-divider text-center space-y-6">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-onboard-success-bg text-onboard-success">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
								className="w-8 h-8"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-text-1 mb-[15px]">Registration Submitted!</h2>
						<p className="text-text-3 text-p2 max-w-md mx-auto mb-[15px]">
							Thank you for completing your onboarding details. Your profile and documents have been successfully
							submitted for review.
						</p>
						<p className="text-text-3 text-p3">An administrator will review your application shortly.</p>
					</div>
				</div>
			</div>
		);
	}

	if (isOnboardRejected) {
		return (
			<div className={`${token ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background flex flex-col`}>
				{token && <PublicNavbar />}
				<div className="flex-1 flex items-center justify-center bg-[#EBF1F7] dark:bg-background p-6">
					<div className="w-full max-w-lg bg-card rounded-2xl shadow-xl p-8 border border-divider text-center space-y-6">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-onboard-error-bg text-onboard-error">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
								className="w-8 h-8"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-text-1">Registration Rejected</h2>
						<p className="text-text-3 text-p2 max-w-md mx-auto">
							Your onboarding registration was reviewed and rejected.
						</p>
						{rejectionReason && (
							<div className="p-4 bg-field rounded-lg border border-divider text-left space-y-1">
								<span className="text-xs font-semibold text-text-2">Reason for rejection:</span>
								<p className="text-sm text-text-1">{rejectionReason}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	if (pageLoading) {
		return (
			<div className={`${token ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background flex flex-col`}>
				{token && <PublicNavbar />}
				<div className={`flex-1 ${token ? 'px-6 py-4 max-w-5xl mx-auto w-full' : ''}`}>
					<FormLayout
						title="Doctor Onboarding"
						tabTitle="Loading..."
						backTo={token ? null : ROUTES.DOCTOR_ONBOARDING_LIST}
						subtitle="Loading onboarding data..."
						formId="onboarding-wizard-form"
						onSubmit={e => e.preventDefault()}
						footer={<div />}
					>
						<div className="flex items-center justify-center py-20">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-light" />
							<span className="ml-3 text-text-3 text-sm">Loading onboarding data...</span>
						</div>
					</FormLayout>
				</div>
			</div>
		);
	}

	return (
		<div className={`${token ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background flex flex-col`}>
			{token && <PublicNavbar />}
			<div className={`flex-1 ${token ? 'overflow-auto px-6 py-4 max-w-5xl mx-auto w-full' : ''}`}>
				<FormLayout
					title="Doctor Onboarding"
					tabTitle={token ? 'Start Self Onboarding' : editId ? 'Edit Onboarding' : 'Start New Onboarding'}
					backTo={token ? null : ROUTES.DOCTOR_ONBOARDING_LIST}
					subtitle="Complete the step-by-step credentials and document validation process."
					formId="onboarding-wizard-form"
					onSubmit={handleSubmit}
					footer={
						<div className="flex w-full justify-between items-center mt-4">
							{activeStep > 1 ? (
								<Button type="button" variant="outline" onClick={handleBack}>
									Back
								</Button>
							) : (
								<div />
							)}

							<div className="flex items-center gap-[10px]">
								{/* Save as Draft — always visible */}
								<Button type="button" variant="outline" onClick={handleSaveDraft} loading={draftLoading}>
									Save as Draft
								</Button>

								{activeStep < STEPS.length ? (
									<Button type="button" onClick={handleNext} loading={nextLoading}>
										Next
									</Button>
								) : (
									<Button type="submit" form="onboarding-wizard-form" loading={loading}>
										Submit Onboarding
									</Button>
								)}
							</div>
						</div>
					}
				>
					{/* Progress Stepper */}
					<div className="mb-[5px]">
						<Stepper
							steps={STEPS}
							activeStep={activeStep}
							onStepClick={step => {
								if (step < activeStep || validateStep()) {
									setActiveStep(step);
								}
							}}
						/>
					</div>

					<div className="p-[20px]">
						{/* STEP 1: PERSONAL DETAILS */}
						{activeStep === 1 && (
							<div className="space-y-[10px]">
								<h3 className="text-h4 font-semibold text-text-1 border-b border-divider pb-2">
									1. Doctor Personal Details
								</h3>

							<Input
								label="Full Name"
								id="fullName"
								placeholder="Enter Full Name"
								value={form.fullName}
								onChange={e => {
									const value = sanitizeFullName(e.target.value);
									setForm(prev => ({ ...prev, fullName: value }));
									if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
								}}
								error={errors.fullName}
								required
							/>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
									<DateInput
										label="Date of Birth"
										id="dob"
										value={form.dob}
										onChange={set('dob')}
										maxDate={maxDobDate}
										disableFuture
										error={errors.dob}
										required
									/>
									<div className="flex flex-col">
										<label className="form-label" htmlFor="gender">
											Gender
										</label>
										<AutoComplete
											id="gender"
											options={[
												{ value: 'Male', label: 'Male' },
												{ value: 'Female', label: 'Female' },
												{ value: 'Other', label: 'Other' }
											]}
											value={
												[
													{ value: 'Male', label: 'Male' },
													{ value: 'Female', label: 'Female' },
													{ value: 'Other', label: 'Other' }
												].find(o => o.value === form.gender) || null
											}
											onChange={(_, selectedOption) => {
												setForm(prev => ({ ...prev, gender: selectedOption?.value || '' }));
												if (errors.gender) setErrors(prev => ({ ...prev, gender: '' }));
											}}
											error={errors.gender}
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
									<Input
										label="Email Address"
										id="email"
										type="email"
										value={form.email}
										onChange={set('email')}
										error={errors.email}
										required
									/>
									<Input
										label="Mobile Number"
										id="mobile"
										maxLength={10}
										value={form.mobile}
										onChange={e => {
											const val = e.target.value.replace(/\D/g, '');
											setForm(prev => ({ ...prev, mobile: val }));
											if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
										}}
										error={errors.mobile}
										required
									/>
									<Input
										label="Alternative Mobile Number"
										id="alternateMobile"
										maxLength={10}
										value={form.alternateMobile}
										onChange={e => {
											const val = e.target.value.replace(/\D/g, '');
											setForm(prev => ({ ...prev, alternateMobile: val }));
											if (errors.alternateMobile) setErrors(prev => ({ ...prev, alternateMobile: '' }));
										}}
										error={errors.alternateMobile}
									/>
								</div>

								<TextArea
									label="Full Residential Address"
									id="address"
									placeholder="Building No, Street Name, Area"
									value={form.address}
									onChange={set('address')}
									error={errors.address}
									required
								/>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
									<div className="flex flex-col">
										<label className="form-label" htmlFor="state">
											State <span className="text-red-500 ml-0.5">*</span>
										</label>
										<AutoComplete
											id="state"
											placeholder="Select State"
											options={statesList.map(s => ({ value: String(s.state_Id), label: s.state_Name }))}
											value={
												form.state && statesList.find(s => String(s.state_Id) === String(form.state))
													? {
															value: String(form.state),
															label: statesList.find(s => String(s.state_Id) === String(form.state))?.state_Name
														}
													: null
											}
											onChange={(_, selectedOption) => {
												setForm(prev => ({ ...prev, state: selectedOption?.value || '', city: '' }));
												if (errors.state) setErrors(prev => ({ ...prev, state: '' }));
											}}
											error={errors.state}
										/>
									</div>
									<div className="flex flex-col">
										<label className="form-label" htmlFor="city">
											City <span className="text-red-500 ml-0.5">*</span>
										</label>
										<AutoComplete
											id="city"
											placeholder="Select City"
											options={cityOptions}
											value={
												form.city && citiesList.find(c => String(c.city_Id) === String(form.city))
													? {
															value: String(form.city),
															label: citiesList.find(c => String(c.city_Id) === String(form.city))?.city_Name
														}
													: null
											}
											disabled={!form.state}
											onChange={(_, selectedOption) => {
												setForm(prev => ({ ...prev, city: selectedOption?.value || '' }));
												if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
											}}
											error={errors.city}
										/>
									</div>
									<Input
										label="Pin Code"
										id="pinCode"
										placeholder="6-digit ZIP code"
										value={form.pinCode}
										inputMode="numeric"
										maxLength={6}
										onChange={e => {
											const value = sanitizePinCode(e.target.value);
											setForm(prev => ({ ...prev, pinCode: value }));
											if (errors.pinCode) setErrors(prev => ({ ...prev, pinCode: '' }));
										}}
										error={errors.pinCode}
										required
									/>
								</div>
							</div>
						)}

						{/* STEP 2: QUALIFICATION ENTRY */}
						{activeStep === 2 && (
							<div className="space-y-[10px]">
								<h3 className="text-h4 font-semibold text-text-1 border-b border-divider pb-2">
									2. Qualifications & Specialty
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] mb-[10px]">
									{/* Department */}
									<div className="flex flex-col">
										<label className="form-label" htmlFor="department">
											Department <span className="text-red-500">*</span>
										</label>
										<AutoComplete
											id="department"
											placeholder="Select Department"
											options={departmentsList.map(d => ({ value: String(d.department_Id), label: d.department_Name }))}
											value={
												form.department &&
												departmentsList.find(d => String(d.department_Id) === String(form.department))
													? {
															value: String(form.department),
															label: departmentsList.find(d => String(d.department_Id) === String(form.department))
																?.department_Name
														}
													: null
											}
											onChange={(_, selectedOption) => {
												setForm(prev => ({ ...prev, department: selectedOption?.value || '' }));
												if (errors.department) setErrors(prev => ({ ...prev, department: '' }));
											}}
											error={errors.department}
										/>
									</div>

									{/* Doctor Type */}
									<div className="flex flex-col">
										<label className="form-label" htmlFor="docType">
											Doctor Type <span className="text-red-500">*</span>
										</label>
										<AutoComplete
											id="docType"
											placeholder="Select Doctor Type"
											options={docTypesList.map(d => ({ value: String(d.doc_type_Id), label: d.doc_type_Name }))}
											value={
												form.docType && docTypesList.find(d => String(d.doc_type_Id) === String(form.docType))
													? {
															value: String(form.docType),
															label: docTypesList.find(d => String(d.doc_type_Id) === String(form.docType))
																?.doc_type_Name
														}
													: null
											}
											onChange={(_, selectedOption) => {
												setForm(prev => ({ ...prev, docType: selectedOption?.value || '' }));
												if (errors.docType) setErrors(prev => ({ ...prev, docType: '' }));
											}}
											error={errors.docType}
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
									{/* Degrees Multi-Select */}
									<MultiSelect
										id="degrees"
										label="Degree(s)"
										required
										placeholder="Search and select degree(s)…"
										options={degreesList.map(d => ({ label: d.degree_Name, value: String(d.degree_Id) }))}
										value={form.degrees}
										onChange={ids => {
											setForm(prev => ({ ...prev, degrees: ids }));
											if (errors.degrees) setErrors(prev => ({ ...prev, degrees: '' }));
										}}
										error={errors.degrees}
									/>

									{/* Specializations Multi-Select */}
									<MultiSelect
										id="specializations"
										label="Specialization(s)"
										required
										placeholder="Search and select specialization(s)…"
										options={specializationsList.map(s => ({
											label: s.doc_specialization_master_Name,
											value: String(s.doc_specialization_master_Id)
										}))}
										value={form.specializations}
										onChange={ids => {
											setForm(prev => ({ ...prev, specializations: ids }));
											if (errors.specializations) setErrors(prev => ({ ...prev, specializations: '' }));
										}}
										error={errors.specializations}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
									<Input
										label="Registration Number"
										id="registrationNumber"
										placeholder="Medical Council Reg No"
										value={form.registrationNumber}
										onChange={set('registrationNumber')}
										error={errors.registrationNumber}
										required
									/>
									<Input
										label="Registration Council"
										id="registrationCouncil"
										placeholder="State Medical Council Name"
										value={form.registrationCouncil}
										onChange={set('registrationCouncil')}
										error={errors.registrationCouncil}
										required
									/>
									<DateInput
										label="Council Expiry Date"
										id="registrationExpiryDate"
										value={form.registrationExpiryDate}
										onChange={set('registrationExpiryDate')}
										error={errors.registrationExpiryDate}
										required
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
									<Input
										label="Total Experience (Years)"
										id="experienceYears"
										type="number"
										step="0.1"
										min={0}
										max={MAX_EXPERIENCE_YEARS}
										inputMode="decimal"
										placeholder="e.g. 8.5"
										value={form.experienceYears}
										onChange={e => {
											setForm(prev => ({ ...prev, experienceYears: e.target.value }));
											if (errors.experienceYears) setErrors(prev => ({ ...prev, experienceYears: '' }));
										}}
										error={errors.experienceYears}
										required
									/>
									<Input
										label="Sub-Specialization details"
										id="subSpecialization"
										placeholder="e.g. Pediatric Cardiology, Rhinoplasty"
										value={form.subSpecialization}
										maxLength={MAX_SUB_SPECIALIZATION_LENGTH}
										onChange={e => {
											setForm(prev => ({ ...prev, subSpecialization: sanitizeSubSpecialization(e.target.value) }));
											if (errors.subSpecialization) setErrors(prev => ({ ...prev, subSpecialization: '' }));
										}}
										error={errors.subSpecialization}
									/>
								</div>
							</div>
						)}

						{/* STEP 3: SHIFT DETAILS */}
						{activeStep === 3 && (
							<div className="space-y-[10px]">
								<h3 className="text-h4 font-semibold text-text-1 border-b border-divider pb-2">
									3. Availability & Shift Configuration
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
									<TimeInput
										label="Shift Start Time"
										id="shiftStartTime"
										value={form.shiftStartTime}
										onChange={set('shiftStartTime')}
										error={errors.shiftStartTime}
										required
									/>
									<TimeInput
										label="Shift End Time"
										id="shiftEndTime"
										value={form.shiftEndTime}
										onChange={set('shiftEndTime')}
										error={errors.shiftEndTime}
										required
									/>
								</div>

								<div className="space-y-2">
									<span className="form-label">
										Working Week Day(s) <span className="text-red-500">*</span>
									</span>
									<div className="flex flex-wrap gap-[10px] p-3 border border-divider rounded-md bg-field">
										{DAYS_OF_WEEK.map(day => (
											<Checkbox
												key={day}
												id={`day-${day}`}
												label={day}
												checked={form.workingDays.includes(day)}
												onChange={() => handleCheckboxListChange('workingDays', day)}
											/>
										))}
									</div>
									{errors.workingDays && <p className="text-[11px] text-red-600">{errors.workingDays}</p>}
								</div>
							</div>
						)}

						{/* STEP 4: FINANCIAL DETAILS */}
						{activeStep === 4 && (
							<div className="space-y-[10px]">
								<h3 className="text-h4 font-semibold text-text-1 border-b border-divider pb-2">
									4. Financial & Banking Configuration
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
									<Input
										label="Account Holder Name"
										id="accountHolderName"
										placeholder="Name as in Bank passbook"
										value={form.accountHolderName}
										onChange={e => {
											const value = sanitizeFullName(e.target.value);
											setForm(prev => ({ ...prev, accountHolderName: value }));
											if (errors.accountHolderName) setErrors(prev => ({ ...prev, accountHolderName: '' }));
										}}
										error={errors.accountHolderName}
										required
									/>
									<Input
										label="Bank Account Number"
										id="bankAccountNumber"
										placeholder="Enter Bank Account No"
										value={form.bankAccountNumber}
										inputMode="numeric"
										onChange={e => {
											const value = sanitizeBankAccountNumber(e.target.value);
											setForm(prev => ({ ...prev, bankAccountNumber: value }));
											if (errors.bankAccountNumber) setErrors(prev => ({ ...prev, bankAccountNumber: '' }));
										}}
										error={errors.bankAccountNumber}
										required
									/>
									<Input
										label="Bank Name"
										id="bankName"
										placeholder="e.g. State Bank of India"
										value={form.bankName}
										onChange={e => {
											const value = sanitizeFullName(e.target.value);
											setForm(prev => ({ ...prev, bankName: value }));
											if (errors.bankName) setErrors(prev => ({ ...prev, bankName: '' }));
										}}
										error={errors.bankName}
										required
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
									<Input
										label="IFSC Code"
										id="ifscCode"
										placeholder="11-digit IFSC"
										value={form.ifscCode}
										onChange={set('ifscCode')}
										error={errors.ifscCode}
										required
									/>
									<Input
										label="PAN Number"
										id="panNumber"
										placeholder="10-digit PAN (Alphanumeric)"
										value={form.panNumber}
										onChange={set('panNumber')}
										error={errors.panNumber}
										required
									/>
								</div>

								<div className="bg-field p-4 rounded-md border border-divider space-y-[10px]">
									<span className="text-xs font-semibold text-text-2">Payout & Charge Setup</span>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
										<div className="flex flex-col">
											<label className="form-label" htmlFor="commissionType">
												Commission Type
											</label>
											<AutoComplete
												id="commissionType"
												options={[
													{ value: 'Percentage', label: 'Percentage %' },
													{ value: 'Fixed', label: 'Fixed Amount' }
												]}
												value={
													[
														{ value: 'Percentage', label: 'Percentage %' },
														{ value: 'Fixed', label: 'Fixed Amount' }
													].find(o => o.value === form.commissionType) || null
												}
												onChange={(_, selectedOption) => {
													setForm(prev => ({ ...prev, commissionType: selectedOption?.value || '' }));
													if (errors.commissionType) setErrors(prev => ({ ...prev, commissionType: '' }));
												}}
												error={errors.commissionType}
											/>
										</div>
										<Input
											label={form.commissionType === 'Percentage' ? 'Commission (%)' : 'Commission Value'}
											id="commissionValue"
											type="number"
											placeholder={form.commissionType === 'Percentage' ? 'e.g. 15' : 'e.g. 500'}
											value={form.commissionValue}
											onChange={set('commissionValue')}
											error={errors.commissionValue}
											required
										/>
										<Input
											label="Consultation Charge"
											id="consultationCharge"
											type="number"
											placeholder="Consultation fee amount"
											value={form.consultationCharge}
											onChange={set('consultationCharge')}
											error={errors.consultationCharge}
											required
										/>
									</div>
								</div>
							</div>
						)}

						{/* STEP 5: DOCUMENT UPLOAD */}
						{activeStep === 5 && (
							<div className="space-y-[14px]">
								<div className="flex flex-col gap-2 border-b border-divider pb-3 sm:flex-row sm:items-end sm:justify-between">
									<div>
										<h3 className="text-h4 font-semibold text-text-1">5. Credential Document Verification</h3>
										<p className="mt-1 text-[11px] text-text-3">
											Upload clear scan copies for verification before submitting the onboarding request.
										</p>
									</div>
									<span className="w-fit rounded-full border border-brand-light/40 bg-brand-light/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-light">
										PDF, JPG, PNG - Max 5MB
									</span>
								</div>

								<div className="grid grid-cols-1 gap-[12px] md:grid-cols-2">
									{[
										{ id: 'degreeCertificate', label: 'Degree Certificate', hint: 'Degree or qualification proof' },
										{
											id: 'registrationCertificate',
											label: 'Council Registration Certificate',
											hint: 'Medical council registration copy'
										},
										{ id: 'govIdProof', label: 'Government ID Proof', hint: 'Aadhaar, PAN, passport, or equivalent' },
										{ id: 'photograph', label: 'Photograph', hint: 'Recent passport-size photo' }
									].map(doc => (
										<DocumentUploadField
											key={doc.id}
											id={doc.id}
											label={doc.label}
											hint={doc.hint}
											required
											file={form[doc.id]}
											progress={uploadProgress[doc.id]}
											error={errors[doc.id]}
											fileDataUrl={fileDataUrls[doc.id]}
											onFileChange={file => handleFileChange(doc.id, file)}
											onRemove={() => handleRemoveFile(doc.id)}
											onPreview={() => openPreview(doc.id, doc.label)}
										/>
									))}
									<p className="md:col-span-2 text-xs text-text-3">
										Note: Files are uploaded immediately when an onboarding ID exists. Draft files are uploaded after
										the first save.
									</p>
								</div>
							</div>
						)}

						{/* Document Preview Modal */}
						<DocumentPreviewModal
							open={previewModal.open}
							file={form[previewModal.field]}
							fileDataUrl={fileDataUrls[previewModal.field]}
							label={previewModal.label}
							onClose={closePreview}
						/>

						{/* STEP 6: REVIEW AND SUBMIT */}
						{activeStep === 6 && (
							<div className="space-y-[10px]">
								<h3 className="text-h4 font-semibold text-text-1 border-b border-divider pb-2">
									6. Review Onboarding Details
								</h3>
								<OnboardingReviewPanel
									form={form}
									statesList={statesList}
									citiesList={citiesList}
									degreesList={degreesList}
									specializationsList={specializationsList}
									onEdit={step => setActiveStep(step)}
									isAdminFlow={!token}
								/>
							</div>
						)}
					</div>
				</FormLayout>
			</div>
		</div>
	);
};

export default OnboardingWizard;
