import React, { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../data/states/toastAtom';
import { API } from '../data/apis/endpoints';
import http from '../lib/axios/axios';
import FormSection from '../components/common/FormSection.jsx';
import MailIcon from '../assets/icons/MailIcon.jsx';
import CalendarIcon from '../assets/icons/CalendarIcon.jsx';
import WalletIcon from '../assets/icons/WalletIcon.jsx';
import ShieldCheckIcon from '../assets/icons/ShieldCheckIcon.jsx';
import EyeIcon from '../assets/icons/EyeIcon.jsx';
import { formatDate } from '../utils/methods/formatDate';

const InfoItem = ({ label, value }) => (
	<div className="flex flex-col gap-1 py-3 px-3 rounded-lg bg-field/30 border border-divider/40">
		<span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">{label}</span>
		<span className="text-[13px] font-medium text-text-1 break-words">{value || '—'}</span>
	</div>
);

const DocumentRow = ({ title, url, fileName }) => {
	if (!url) return null;
	const isPdf = url.toLowerCase().endsWith('.pdf') || url.includes('PDF_DOCUMENT');
	return (
		<div className="flex items-center justify-between border border-divider rounded-xl p-3 bg-field/40 hover:bg-field/70 transition-all shadow-sm">
			<div className="flex items-center gap-3">
				<div className="p-2 bg-brand-light/10 text-brand-light rounded-lg flex items-center justify-center font-bold text-[10px]">
					{isPdf ? 'PDF' : 'IMG'}
				</div>
				<div className="flex flex-col min-w-0">
					<span className="text-xs font-semibold text-text-1">{title}</span>
					<span className="text-[10px] text-text-3 max-w-[150px] sm:max-w-xs truncate">
						{fileName || 'Document file'}
					</span>
				</div>
			</div>
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-light/10 hover:bg-brand-light/20 text-brand-light font-medium rounded-lg text-xs transition"
			>
				<EyeIcon className="w-3.5 h-3.5" />
				<span>View</span>
			</a>
		</div>
	);
};

const DoctorProfile = () => {
	const addToast = useSetAtom(addToastAtom);
	const [loading, setLoading] = useState(true);
	const [doctor, setDoctor] = useState(null);

	useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			try {
				const response = await http.post(API.DOCTORS.PROFILE);
				const docData = response?.data || response;
				if (docData) {
					setDoctor(docData);
				} else {
					setDoctor(null);
				}
			} catch (error) {
				console.error('Failed to fetch doctor profile:', error);
				const errorMsg =
					error?.response?.data?.msg || error?.response?.data?.message || 'Failed to load doctor profile';
				addToast({ type: 'error', message: errorMsg });
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [addToast]);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-light border-t-transparent"></div>
				<span className="text-sm font-medium text-text-2">Loading Profile...</span>
			</div>
		);
	}

	if (!doctor) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4 max-w-md mx-auto">
				<div className="p-4 bg-red-500/10 text-red-500 rounded-full mb-4">
					<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-bold text-text-1 mb-2">Profile Not Found</h3>
				<p className="text-sm text-text-3">
					No doctor profile is associated with this account. Please contact your system administrator to link your user
					ID.
				</p>
			</div>
		);
	}

	// Parse working days safely
	let workingDays = [];
	try {
		if (doctor.doc_Working_Days) {
			workingDays =
				typeof doctor.doc_Working_Days === 'string' ? JSON.parse(doctor.doc_Working_Days) : doctor.doc_Working_Days;
		}
	} catch (e) {
		console.error('Failed to parse working days:', e);
	}

	// Map document URLs
	let photoUrl = '';
	let degreeUrl = '';
	let regUrl = '';
	let govtUrl = '';

	let photoName = '';
	let degreeName = '';
	let regName = '';
	let govtName = '';

	const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/';
	const hostUrl = baseUrl.replace(/\/api\/?$/, '');

	if (doctor.documents && doctor.documents.length > 0) {
		doctor.documents.forEach(d => {
			const url = `${hostUrl}/${d.doc_upload_File_Key}`;
			const nameLower = d.doc_upload_File_Name.toLowerCase();
			if (nameLower.startsWith('photo_')) {
				photoUrl = url;
				photoName = d.doc_upload_File_Name;
			} else if (nameLower.startsWith('degree_certificate_')) {
				degreeUrl = url;
				degreeName = d.doc_upload_File_Name;
			} else if (nameLower.startsWith('registration_certificate_')) {
				regUrl = url;
				regName = d.doc_upload_File_Name;
			} else if (nameLower.startsWith('govt_id_proof_')) {
				govtUrl = url;
				govtName = d.doc_upload_File_Name;
			}
		});
	}

	if (!photoUrl && doctor.doc_upload_File_Key) {
		photoUrl = `${hostUrl}/${doctor.doc_upload_File_Key}`;
		photoName = 'photo_profile';
	}

	const initials = doctor.doc_Name
		? doctor.doc_Name
				.split(' ')
				.map(n => n[0])
				.join('')
				.substring(0, 2)
				.toUpperCase()
		: 'DR';

	const WORKING_DAYS_ALL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	return (
		<div className="mx-auto max-w-6xl pb-8 px-2 md:px-4">
			{/* Banner / Header Card */}
			<div className="relative mb-6 rounded-2xl overflow-hidden border border-divider/50 bg-card p-6 shadow-md transition-all">
				{/* Decorative background gradient */}
				<div className="absolute inset-0 bg-gradient-to-r from-brand-light/10 via-transparent to-brand-light/5 pointer-events-none" />

				<div className="relative flex flex-col md:flex-row items-center gap-6 z-[1]">
					{/* Avatar Container */}
					<div className="relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden border-2 border-brand-light/30 bg-field flex items-center justify-center shadow-inner">
						{photoUrl ? (
							<img src={photoUrl} alt={doctor.doc_Name} className="h-full w-full object-cover" />
						) : (
							<span className="text-3xl font-bold text-brand-light/80 tracking-wide">{initials}</span>
						)}
					</div>

					{/* User Meta */}
					<div className="flex-1 text-center md:text-left">
						<div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1.5">
							<h2 className="text-xl md:text-2xl font-bold text-text-1 tracking-tight">{doctor.doc_Name}</h2>
							<span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border border-divider bg-field text-text-2">
								{doctor.doc_Code}
							</span>
							<span
								className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${
									doctor.is_active === 1 || doctor.is_active === '1'
										? 'border-green-500/20 bg-green-500/10 text-green-500'
										: 'border-red-500/20 bg-red-500/10 text-red-500'
								}`}
							>
								{doctor.is_active === 1 || doctor.is_active === '1' ? 'Active' : 'Inactive'}
							</span>
						</div>

						<p className="text-sm font-semibold text-brand-light flex items-center justify-center md:justify-start gap-1.5 mb-3">
							<span>{doctor.department_Name || 'No Department'}</span>
							<span className="h-1 w-1 rounded-full bg-text-3" />
							<span className="text-text-2 font-medium">{doctor.doc_type_Name || 'General Practitioner'}</span>
						</p>

						<div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2">
							<div className="flex items-center gap-1.5 text-xs text-text-2">
								<MailIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
								<span>{doctor.doc_Email}</span>
							</div>
							<div className="flex items-center gap-1.5 text-xs text-text-2">
								<svg className="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
									/>
								</svg>
								<span>{doctor.doc_Mobile_Number}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Profile Details Grids */}
			<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
				{/* Left Columns (8 cols on md) */}
				<div className="md:col-span-8 flex flex-col gap-6">
					{/* Personal Info */}
					<FormSection title="Personal & Contact Information" subtitle="Primary identity and contact address.">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<InfoItem label="Full Name" value={doctor.doc_Name} />
							<InfoItem label="Email Address" value={doctor.doc_Email} />
							<InfoItem label="Mobile Number" value={doctor.doc_Mobile_Number} />
							<InfoItem label="Alternate Mobile" value={doctor.doc_Alternate_Mobile_Number} />
							<div className="sm:col-span-2">
								<InfoItem label="Home Address" value={doctor.doc_Address} />
							</div>
							<InfoItem label="City" value={doctor.city_Name} />
							<InfoItem label="State" value={doctor.state_Name} />
							<InfoItem label="Pin Code" value={doctor.doc_Pin_Code} />
						</div>
					</FormSection>

					{/* Professional Credentials */}
					<FormSection title="Professional & Credentials" subtitle="Qualifications, specializations and registrations.">
						<div className="flex flex-col gap-5">
							{/* Specializations & Degrees Lists */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2 p-3.5 bg-field/30 border border-divider/40 rounded-xl">
									<span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Degrees</span>
									{doctor.degrees && doctor.degrees.length > 0 ? (
										<div className="flex flex-wrap gap-1.5 mt-1">
											{doctor.degrees.map(deg => (
												<span
													key={deg.doc_degree_Id}
													className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-brand-light/20 bg-brand-light/5 text-brand-light"
												>
													{deg.doc_degree_master_Name}
												</span>
											))}
										</div>
									) : (
										<span className="text-xs text-text-3">No degrees declared</span>
									)}
								</div>

								<div className="flex flex-col gap-2 p-3.5 bg-field/30 border border-divider/40 rounded-xl">
									<span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">
										Specializations
									</span>
									{doctor.specializations && doctor.specializations.length > 0 ? (
										<div className="flex flex-wrap gap-1.5 mt-1">
											{doctor.specializations.map(spec => (
												<span
													key={spec.doc_specialization_Id}
													className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1 ${
														spec.is_primary === 1 || spec.is_primary === '1' || spec.is_primary === true
															? 'border-green-500/20 bg-green-500/5 text-green-500'
															: 'border-divider bg-field/50 text-text-2'
													}`}
												>
													{spec.doc_specialization_master_Name}
													{(spec.is_primary === 1 || spec.is_primary === '1' || spec.is_primary === true) && (
														<span className="text-[8px] bg-green-500 text-white rounded-full px-1 py-0.5 leading-none">
															Primary
														</span>
													)}
												</span>
											))}
										</div>
									) : (
										<span className="text-xs text-text-3">No specializations declared</span>
									)}
								</div>
							</div>

							<hr className="border-divider/50" />

							{/* Grid fields */}
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
								<InfoItem
									label="Experience (Years)"
									value={doctor.doc_Experience_Years ? `${doctor.doc_Experience_Years} Years` : null}
								/>
								<InfoItem label="Sub-Specialization" value={doctor.doc_Sub_Specialization} />
								<InfoItem label="Registration Number" value={doctor.doc_Registration_Number} />
								<InfoItem label="Registration Council" value={doctor.doc_Registration_Council} />
								<InfoItem label="Expiry Date" value={formatDate(doctor.doc_Registration_Expiry_Date) || null} />
							</div>
						</div>
					</FormSection>
				</div>

				{/* Right Columns (4 cols on md) */}
				<div className="md:col-span-4 flex flex-col gap-6">
					{/* Shift Timings */}
					<FormSection title="Timings & Duty" subtitle="Duty schedule and shift timings.">
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Working Days</span>
								<div className="flex flex-wrap gap-1.5 mt-1">
									{WORKING_DAYS_ALL.map(day => {
										const isActive = workingDays.includes(day);
										return (
											<span
												key={day}
												className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
													isActive
														? 'border-brand-light/30 bg-brand-light/10 text-brand-light'
														: 'border-divider/50 bg-field/20 text-text-3 opacity-60'
												}`}
											>
												{day}
											</span>
										);
									})}
								</div>
							</div>

							<hr className="border-divider/50" />

							<div className="grid grid-cols-2 gap-4">
								<InfoItem label="Shift Start Time" value={doctor.doc_Shift_Start_Time} />
								<InfoItem label="Shift End Time" value={doctor.doc_Shift_End_Time} />
							</div>
						</div>
					</FormSection>

					{/* Accounts & Charges */}
					<FormSection title="Financial & Bank details" subtitle="Charges, commissions and accounts.">
						<div className="flex flex-col gap-4">
							<div className="grid grid-cols-2 gap-4">
								<InfoItem
									label="Consultation Fee"
									value={doctor.doc_Default_Consultation_Charge ? `₹${doctor.doc_Default_Consultation_Charge}` : null}
								/>
								<InfoItem
									label="Commission"
									value={
										doctor.doc_Default_Commission_Value
											? `${doctor.doc_Default_Commission_Value} (${doctor.doc_Default_Commission_Type})`
											: null
									}
								/>
							</div>

							<hr className="border-divider/50" />

							<div className="flex flex-col gap-3">
								<InfoItem label="Account Holder" value={doctor.doc_Account_Holder_Name} />
								<InfoItem label="Bank Name" value={doctor.doc_Bank_Name} />
								<InfoItem label="Account Number" value={doctor.doc_Bank_Account_Number} />
								<InfoItem label="IFSC Code" value={doctor.doc_IFSC_Code} />
								<InfoItem label="PAN Card Number" value={doctor.doc_PAN_Number} />
							</div>
						</div>
					</FormSection>

					{/* Documents Section */}
					{(degreeUrl || regUrl || govtUrl) && (
						<FormSection title="Uploaded Documents" subtitle="Qualifications and verification files.">
							<div className="flex flex-col gap-3">
								<DocumentRow title="Degree Certificate" url={degreeUrl} fileName={degreeName} />
								<DocumentRow title="Registration Certificate" url={regUrl} fileName={regName} />
								<DocumentRow title="Govt ID Proof" url={govtUrl} fileName={govtName} />
							</div>
						</FormSection>
					)}
				</div>
			</div>
		</div>
	);
};

export default DoctorProfile;
