import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormLayout from '../../../components/common/FormLayout';
import { API } from '../../../data/apis/endpoints';
import http from '../../../lib/axios/axios';
import dayjs from 'dayjs';
import ROUTES from '../../../utils/constants/routes';
import DocumentPreviewModal from '../../../components/common/DocumentPreviewModal';

// ─── Box section component matching OnboardingReviewPanel ─────────────────────
const ReviewSection = ({ title, colsClassName = "grid-cols-1 md:grid-cols-3", children }) => {
	const visible = React.Children.toArray(children).filter(Boolean);
	if (visible.length === 0) return null;
	return (
		<div className="border border-divider rounded-md bg-field overflow-hidden">
			<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
				<span className="font-semibold text-text-1 text-xs">{title}</span>
			</div>
			<div className={`p-4 grid ${colsClassName} gap-[10px]`}>
				{children}
			</div>
		</div>
	);
};

// ─── Field component matching OnboardingReviewPanel ───────────────────────────
const ReviewField = ({ label, value }) => {
	if (value === null || value === undefined || value === '' || value === '—') return null;
	return (
		<div>
			<span className="text-text-3">{label}:</span>
			<p className="font-semibold text-text-2 mt-0.5">{value}</p>
		</div>
	);
};

// ─── Main ViewDoctor Component ───────────────────────────────────────────────
const ViewDoctor = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [doc, setDoc] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// Dropdown states for ID to Name lookups
	const [departments, setDepartments] = useState([]);
	const [docTypes, setDocTypes] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);

	const [previewModal, setPreviewModal] = useState({ open: false, file: null, fileDataUrl: '', label: '' });

	// Fetch master data for ID resolution
	useEffect(() => {
		const loadMasterData = async () => {
			try {
				const [deptRes, typeRes, stateRes] = await Promise.all([
					http.post(API.DEPARTMENTS.LIST, { page: 1, limit: 1000, is_active: 1 }),
					http.post(API.DOC_TYPE.LIST, { page: 1, limit: 1000, is_active: 1 }),
					http.post(API.STATES.LIST, { page: 1, limit: 1000, is_active: 1 })
				]);
				setDepartments((deptRes.data?.list || []).map(d => ({ value: String(d.department_Id), label: d.department_Name })));
				setDocTypes((typeRes.data?.list || []).map(t => ({ value: String(t.doc_type_Id), label: t.doc_type_Name })));
				setStates((stateRes.data?.list || []).map(s => ({ value: String(s.state_Id), label: s.state_Name })));
			} catch (err) {
				console.error('Failed to load master lookup data:', err);
			}
		};
		loadMasterData();
	}, []);

	// Fetch doctor details
	useEffect(() => {
		const loadDoctor = async () => {
			setLoading(true);
			try {
				const res = await http.post(API.DOCTORS.GET(id));
				const data = res && res.doc_Id ? res : res?.data;
				if (data) {
					setDoc(data);
				} else {
					setError('Doctor record not found.');
				}
			} catch (err) {
				console.error('Failed to fetch doctor details:', err);
				setError('Failed to load doctor details.');
			} finally {
				setLoading(false);
			}
		};
		loadDoctor();
	}, [id]);

	// Fetch cities when state is loaded
	useEffect(() => {
		if (doc?.state_Id) {
			http.post(API.CITIES.LIST, { page: 1, limit: 1000, state_Id: doc.state_Id, is_active: 1 })
				.then(res => {
					setCities((res.data?.list || []).map(c => ({ value: String(c.city_Id), label: c.city_Name })));
				})
				.catch(err => console.error('Failed to load cities:', err));
		}
	}, [doc?.state_Id]);

	if (loading) {
		return (
			<FormLayout title="Doctor Details" backTo={ROUTES.DOCTORS}>
				<div className="flex items-center justify-center py-20 text-text-3 text-sm">
					Loading details…
				</div>
			</FormLayout>
		);
	}

	if (error || !doc) {
		return (
			<FormLayout title="Doctor Details" backTo={ROUTES.DOCTORS}>
				<div className="flex items-center justify-center py-20 text-red-500 text-sm">
					{error || 'Doctor not found.'}
				</div>
			</FormLayout>
		);
	}

	// Mask helpers
	const maskBankAccountNumber = num => {
		if (!num) return '—';
		const str = String(num).trim();
		if (str.length <= 4) return str;
		return 'X'.repeat(str.length - 4) + str.slice(-4);
	};

	const maskPANNumber = pan => {
		if (!pan) return '—';
		const str = String(pan).trim();
		if (str.length !== 10) {
			if (str.length > 5) {
				return str.slice(0, 5) + '*'.repeat(Math.max(0, str.length - 6)) + (str.length > 9 ? str.slice(-1) : '');
			}
			return str;
		}
		return str.slice(0, 5) + '****' + str.slice(-1);
	};

	// Name resolutions
	const departmentName = departments.find(d => String(d.value) === String(doc.department_Id))?.label || doc.department_Id || '—';
	const docTypeName = docTypes.find(t => String(t.value) === String(doc.doc_type_Id))?.label || doc.doc_type_Id || '—';
	const stateName = states.find(s => String(s.value) === String(doc.state_Id))?.label || doc.state_Id || '—';
	const cityName = cities.find(c => String(c.value) === String(doc.city_Id))?.label || doc.city_Id || '—';

	const degreeNames = (doc.degrees || []).map(d => d.doc_degree_master_Name || d.degree_Name).filter(Boolean).join(', ') || '—';
	const specializationNames = (doc.specializations || [])
		.map(s => (s.doc_specialization_master_Name || s.specialization_Name) + (s.is_primary ? ' (Primary)' : ''))
		.filter(Boolean)
		.join(', ') || '—';

	// Availability days
	let workingDays = [];
	if (doc.doc_Working_Days) {
		try {
			workingDays = typeof doc.doc_Working_Days === 'string' ? JSON.parse(doc.doc_Working_Days) : doc.doc_Working_Days;
		} catch (e) {
			console.error('Failed to parse working days:', e);
		}
	}

	// Document mapping
	const docMap = {};
	for (const docObj of doc.documents || []) {
		const fileName = docObj.doc_upload_File_Name;
		const fieldName = fileName?.split('_')[0];
		if (fieldName) {
			docMap[fieldName] = {
				name: fileName?.replace(fieldName + '_', '') || fileName,
				fileKey: docObj.doc_upload_File_Key,
				size: docObj.doc_upload_Size_Bytes ? (docObj.doc_upload_Size_Bytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A',
				uploadId: docObj.doc_upload_Id
			};
		}
	}

	const statusBadgeColor = doc.is_active
		? 'border-onboard-success/30 text-onboard-success bg-onboard-success-bg'
		: 'border-onboard-error/30 text-onboard-error bg-onboard-error-bg';

	return (
		<FormLayout title="Doctor Details" backTo={ROUTES.DOCTORS}>
			<div className="p-[20px] space-y-[14px]">
				{/* Status badge and metadata row */}
				<div className="flex items-center gap-3">
					<span className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${statusBadgeColor}`}>
						{doc.is_active ? 'Active' : 'Inactive'}
					</span>
					<span className="text-text-3 text-xs">
						{doc.doc_Name}
					</span>
					{doc.doc_Code && (
						<span className="text-text-3 text-xs font-medium">
							• Code: {doc.doc_Code}
						</span>
					)}
				</div>

				<div className="space-y-[10px] text-xs">
					{/* 1. Basic Information */}
					<ReviewSection title="Basic Information">
						<ReviewField label="Doctor Name" value={doc.doc_Name} />
						<ReviewField label="Doctor Code" value={doc.doc_Code} />
						<ReviewField label="Department" value={departmentName} />
						<ReviewField label="Doctor Type" value={docTypeName} />
						<ReviewField label="Status" value={doc.is_active === 1 ? 'Active' : 'Inactive'} />
					</ReviewSection>

					{/* 2. Contact Details */}
					<ReviewSection title="Contact Details">
						<ReviewField label="Email ID" value={doc.doc_Email} />
						<ReviewField label="Mobile Number" value={doc.doc_Mobile_Number} />
						<ReviewField label="Alternate Mobile" value={doc.doc_Alternate_Mobile_Number} />
						<ReviewField label="State & City" value={doc.state_Id && doc.city_Id ? `${stateName} - ${cityName}` : '—'} />
						<ReviewField label="Address" value={doc.doc_Address} />
						<ReviewField label="Pin Code" value={doc.doc_Pin_Code} />
					</ReviewSection>

					{/* 3. Qualifications & Specialties */}
					<ReviewSection title="Qualifications & Specialties" colsClassName="grid-cols-1 md:grid-cols-2">
						<ReviewField label="Selected Degree(s)" value={degreeNames} />
						<ReviewField label="Specialization(s)" value={specializationNames} />
						<ReviewField label="Sub Specialization" value={doc.doc_Sub_Specialization} />
						<ReviewField label="Experience" value={doc.doc_Experience_Years ? `${doc.doc_Experience_Years} Years` : '—'} />
						<ReviewField label="Council Registration Number" value={doc.doc_Registration_Number ? `${doc.doc_Registration_Number} (${doc.doc_Registration_Council || '—'})` : '—'} />
						<ReviewField label="Registration Expiry Date" value={doc.doc_Registration_Expiry_Date ? dayjs(doc.doc_Registration_Expiry_Date).format('DD/MM/YYYY') : '—'} />
					</ReviewSection>

					{/* 4. Shift Configuration */}
					<ReviewSection title="Shift Configuration" colsClassName="grid-cols-2">
						<ReviewField label="Shift Timings" value={doc.doc_Shift_Start_Time && doc.doc_Shift_End_Time ? `${doc.doc_Shift_Start_Time.slice(0, 5)} to ${doc.doc_Shift_End_Time.slice(0, 5)}` : '—'} />
						<ReviewField label="Availability Week Days" value={workingDays.join(', ') || '—'} />
					</ReviewSection>

					{/* 5. Financial Setup */}
					<ReviewSection title="Financial Setup">
						<ReviewField label="Account Holder" value={doc.doc_Account_Holder_Name} />
						<ReviewField label="Bank Details" value={doc.doc_Bank_Name ? `${doc.doc_Bank_Name} (IFSC: ${doc.doc_IFSC_Code || '—'})` : '—'} />
						<ReviewField label="Account Number" value={maskBankAccountNumber(doc.doc_Bank_Account_Number)} />
						<ReviewField label="PAN Number" value={maskPANNumber(doc.doc_PAN_Number)} />
						<ReviewField label="Commission Configuration" value={doc.doc_Default_Commission_Type ? `${doc.doc_Default_Commission_Type} (${doc.doc_Default_Commission_Value})` : '—'} />
						<ReviewField label="Consultation Fee" value={doc.doc_Default_Consultation_Charge ? `₹ ${parseFloat(doc.doc_Default_Consultation_Charge).toFixed(2)}` : '—'} />
					</ReviewSection>

					{/* 6. Uploaded Documents */}
					<ReviewSection title="Uploaded Documents" colsClassName="grid-cols-2">
						{[
							{ label: 'Degree Certificate', val: docMap.degree },
							{ label: 'Registration Certificate', val: docMap.registration },
							{ label: 'Govt ID Proof', val: docMap.govt },
							{ label: 'Photograph', val: docMap.photo }
						].map(docItem => (
							<div key={docItem.label}>
								<span className="text-text-3">{docItem.label}:</span>
								<div className="flex items-center gap-2 mt-0.5">
									<p className="font-semibold text-text-2 truncate max-w-[200px] sm:max-w-[300px]">
										{docItem.val ? docItem.val.name || 'Uploaded' : 'Missing'}
									</p>
									{docItem.val && docItem.val.fileKey && (
										<button
											type="button"
											onClick={() =>
												setPreviewModal({
													open: true,
													file: docItem.val,
													fileDataUrl: docItem.val.fileKey,
													label: docItem.label
												})
											}
											className="text-brand-light hover:underline font-semibold text-xs ml-1 cursor-pointer"
										>
											View
										</button>
									)}
								</div>
							</div>
						))}
					</ReviewSection>
				</div>

				{/* Timestamps */}
				<div className="mt-3 flex flex-wrap gap-4 text-[11px] text-text-3">
					{doc.created_at && <span>Created: {dayjs(doc.created_at).format('DD MMM YYYY HH:mm')}</span>}
					{doc.updated_at && <span>Updated: {dayjs(doc.updated_at).format('DD MMM YYYY HH:mm')}</span>}
				</div>
			</div>

			{/* Document Preview Modal */}
			<DocumentPreviewModal
				open={previewModal.open}
				file={previewModal.file}
				fileDataUrl={previewModal.fileDataUrl}
				label={previewModal.label}
				onClose={() => setPreviewModal({ open: false, file: null, fileDataUrl: '', label: '' })}
			/>
		</FormLayout>
	);
};

export default ViewDoctor;
