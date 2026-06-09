import React, { useState } from 'react';
import DocumentPreviewModal from '../common/DocumentPreviewModal';

/**
 * OnboardingReviewPanel
 *
 * Props:
 *   form          - the onboarding form/data object
 *   statesList    - list of state objects (for name lookup)
 *   citiesList    - list of city objects (for name lookup)
 *   degreesList   - list of degree master objects (for name lookup)
 *   specializationsList - list of specialization master objects
 *   onEdit        - optional; if provided, "Edit" buttons are shown for each section.
 *                   Called with the step index number (1-5).
 *   rejectionReason - optional; if provided, a rejection reason block is shown at the bottom.
 *   isAdminFlow   - boolean, if true shows "Admin Internal Flow" label for initiation type
 */
const OnboardingReviewPanel = ({
	form = {},
	statesList = [],
	citiesList = [],
	degreesList = [],
	specializationsList = [],
	onEdit,
	rejectionReason,
	reviewComments,
	isAdminFlow = true
}) => {
	const [previewModal, setPreviewModal] = useState({ open: false, file: null, fileDataUrl: '', label: '' });
	const formatMobile = (code, number) => (number ? `${code ? `${code} ` : ''}${number}` : '—');

	const EditBtn = ({ step }) =>
		onEdit ? (
			<button
				type="button"
				onClick={() => onEdit(step)}
				className="text-[#1eafc0] hover:underline font-semibold text-xs"
			>
				Edit
			</button>
		) : null;

  const maskBankAccountNumber = (num) => {
    if (!num) return "—";
    const str = String(num).trim();
    if (str.length <= 4) return str;
    return "X".repeat(str.length - 4) + str.slice(-4);
  };

  const maskPANNumber = (pan) => {
    if (!pan) return "—";
    const str = String(pan).trim();
    if (str.length !== 10) {
      if (str.length > 5) {
        return str.slice(0, 5) + "*".repeat(Math.max(0, str.length - 6)) + (str.length > 9 ? str.slice(-1) : "");
      }
      return str;
    }
    return str.slice(0, 5) + "****" + str.slice(-1);
  };

  const stateName =
    statesList.find((s) => String(s.state_Id) === String(form.state))
      ?.state_Name ||
    form.state ||
    "—";
  const cityName =
    citiesList.find((c) => String(c.city_Id) === String(form.city))
      ?.city_Name ||
    form.city ||
    "—";

	const findDegreeName = entry => {
		const entryId = String(entry?.id ?? entry);
		const degree = degreesList.find(
			d => String(d.doc_degree_master_Id ?? d.degree_Id ?? d.id) === entryId
		);

		return degree?.doc_degree_master_Name || degree?.degree_Name || entry?.name || entry;
	};

	const findSpecializationName = entry => {
		const entryId = String(entry?.id ?? entry);
		const specialization = specializationsList.find(
			s => String(s.doc_specialization_master_Id ?? s.specialization_Id ?? s.id) === entryId
		);

		return (
			specialization?.doc_specialization_master_Name ||
			specialization?.specialization_Name ||
			entry?.name ||
			entry
		);
	};

	const degreeNames = (form.degrees || []).map(findDegreeName).join(', ') || '—';

	const specNames = (form.specializations || []).map(findSpecializationName).join(', ') || '—';

	return (
		<div className="space-y-[10px] text-xs">
			{/* 1. Initiation Section */}
			<div className="border border-divider rounded-md bg-field overflow-hidden">
				<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
					<span className="font-semibold text-text-1 text-xs">Initiation Details</span>
				</div>
				<div className="p-4 grid grid-cols-2 gap-[10px]">
					<div>
						<span className="text-text-3">Onboarding Type:</span>
						<p className="font-semibold text-text-2 mt-0.5">
							{isAdminFlow ? 'Admin Internal Flow' : 'Self Registration Flow'}
						</p>
					</div>
					{(form.doctorEmail || form.doctorMobile) && (
						<div>
							<span className="text-text-3">Initiation Contacts:</span>
							<p className="font-semibold text-text-2 mt-0.5">
								{form.doctorEmail || 'N/A'} / {form.doctorMobile || 'N/A'}
							</p>
						</div>
					)}
				</div>
			</div>

      {/* 2. Personal Details */}
      <div className="border border-divider rounded-md bg-field overflow-hidden">
        <div className="flex justify-between items-center bg-divider/25 px-4 py-2">
          <span className="font-semibold text-text-1 text-xs">
            1. Personal Details
          </span>
          <EditBtn step={1} />
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-[10px]">
          <div>
            <span className="text-text-3">Name:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {form.fullName || `${form.firstName || ""} ${form.lastName || ""}`.trim() || "—"}
            </p>
          </div>
          <div>
            <span className="text-text-3">DOB &amp; Gender:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {form.dob} ({form.gender})
            </p>
          </div>
          <div>
            <span className="text-text-3">Email ID:</span>
            <p className="font-semibold text-text-2 mt-0.5">{form.email}</p>
          </div>
          <div>
            <span className="text-text-3">Mobile No:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {formatMobile(form.mobileCode, form.mobile)}
            </p>
          </div>
          <div>
            <span className="text-text-3">Alternative Mobile No:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {formatMobile(form.alternateMobileCode, form.alternateMobile)}
            </p>
          </div>
          <div>
            <span className="text-text-3">State & City:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {stateName} - {cityName}
            </p>
          </div>
          <div>
            <span className="text-text-3">Address &amp; Pin:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {form.address}, {form.pinCode}
            </p>
          </div>
        </div>
      </div>

			{/* 3. Qualifications */}
			<div className="border border-divider rounded-md bg-field overflow-hidden">
				<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
					<span className="font-semibold text-text-1 text-xs">2. Qualifications &amp; Specialties</span>
					<EditBtn step={2} />
				</div>
				<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-[10px]">
					<div>
						<span className="text-text-3">Selected Degree(s):</span>
						<p className="font-semibold text-text-2 mt-0.5">{degreeNames}</p>
					</div>
					<div>
						<span className="text-text-3">Specialization(s):</span>
						<p className="font-semibold text-text-2 mt-0.5">{specNames}</p>
					</div>
					<div>
						<span className="text-text-3">Council Registration Number:</span>
						<p className="font-semibold text-text-2 mt-0.5">
							{form.registrationNumber} ({form.registrationCouncil})
						</p>
					</div>
					<div>
						<span className="text-text-3">Expiry &amp; Exp Years:</span>
						<p className="font-semibold text-text-2 mt-0.5">
							Expiry: {form.registrationExpiryDate} | Exp: {form.experienceYears} Years
						</p>
					</div>
				</div>
			</div>

			{/* 4. Shift Details */}
			<div className="border border-divider rounded-md bg-field overflow-hidden">
				<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
					<span className="font-semibold text-text-1 text-xs">3. Shift Configuration</span>
					<EditBtn step={3} />
				</div>
				<div className="p-4 grid grid-cols-2 gap-[10px]">
					<div>
						<span className="text-text-3">Shift Timings:</span>
						<p className="font-semibold text-text-2 mt-0.5">
							{form.shiftStartTime} to {form.shiftEndTime}
						</p>
					</div>
					<div>
						<span className="text-text-3">Availability Week Days:</span>
						<p className="font-semibold text-text-2 mt-0.5">{(form.workingDays || []).join(', ')}</p>
					</div>
				</div>
			</div>

      {/* 5. Financial */}
      <div className="border border-divider rounded-md bg-field overflow-hidden">
        <div className="flex justify-between items-center bg-divider/25 px-4 py-2">
          <span className="font-semibold text-text-1 text-xs">
            4. Financial Setup
          </span>
          <EditBtn step={4} />
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-[10px]">
          <div>
            <span className="text-text-3">Account Holder:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {form.accountHolderName}
            </p>
          </div>
          <div>
            <span className="text-text-3">Bank Details:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {form.bankName} (IFSC: {form.ifscCode})
            </p>
          </div>
          <div>
            <span className="text-text-3">Account Number:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {maskBankAccountNumber(form.bankAccountNumber)}
            </p>
          </div>
          <div>
            <span className="text-text-3">PAN Number:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {maskPANNumber(form.panNumber)}
            </p>
          </div>
          <div>
            <span className="text-text-3">Commission Configuration:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              {form.commissionType} ({form.commissionValue})
            </p>
          </div>
          <div>
            <span className="text-text-3">Consultation Fee:</span>
            <p className="font-semibold text-text-2 mt-0.5">
              ₹ {form.consultationCharge}
            </p>
          </div>
        </div>
      </div>

			{/* 6. Documents */}
			<div className="border border-divider rounded-md bg-field overflow-hidden">
				<div className="flex justify-between items-center bg-divider/25 px-4 py-2">
					<span className="font-semibold text-text-1 text-xs">5. Uploaded Documents</span>
					<EditBtn step={5} />
				</div>
				<div className="p-4 grid grid-cols-2 gap-[10px]">
					{[
						{ label: 'Degree Certificate', val: form.degreeCertificate },
						{
							label: 'Registration Certificate',
							val: form.registrationCertificate
						},
						{ label: 'Govt ID Proof', val: form.govIdProof },
						{ label: 'Photograph', val: form.photograph }
					].map(doc => (
						<div key={doc.label}>
							<span className="text-text-3">{doc.label}:</span>
							<div className="flex items-center gap-2 mt-0.5">
								<p className="font-semibold text-text-2 truncate max-w-[200px] sm:max-w-[300px]">
									{doc.val ? doc.val.name || 'Uploaded' : 'Missing'}
								</p>
								{doc.val && (doc.val.fileKey || doc.val.url) && (
									<button
										type="button"
										onClick={() =>
											setPreviewModal({
												open: true,
												file: doc.val,
												fileDataUrl: doc.val.fileKey || doc.val.url,
												label: doc.label
											})
										}
										className="text-[#1eafc0] hover:underline font-semibold text-xs ml-1 cursor-pointer"
									>
										View
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Rejection Reason — only shown when provided */}
			{rejectionReason && (
				<div className="border border-onboard-error/30 rounded-md bg-onboard-error-bg overflow-hidden">
					<div className="flex items-center gap-2 bg-onboard-error/10 px-4 py-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="w-4 h-4 text-onboard-error"
						>
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="font-semibold text-onboard-error text-xs">Rejection Reason</span>
					</div>
					<div className="p-4">
						<p className="text-onboard-error font-medium leading-relaxed">{rejectionReason}</p>
					</div>
				</div>
			)}

			{/* Review Comments / Sent Back Feedback — only shown when provided */}
			{reviewComments && (
				<div className="border border-pill-sent-back/30 rounded-md bg-pill-sent-back/10 overflow-hidden">
					<div className="flex items-center gap-2 bg-pill-sent-back/15 px-4 py-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="w-4 h-4 text-pill-sent-back"
						>
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="font-semibold text-pill-sent-back text-xs">
							Reviewer Comments (Sent Back for Corrections)
						</span>
					</div>
					<div className="p-4">
						<p className="text-pill-sent-back font-medium leading-relaxed text-xs">{reviewComments}</p>
					</div>
				</div>
			)}

			{/* Document Preview Modal */}
			<DocumentPreviewModal
				open={previewModal.open}
				file={previewModal.file}
				fileDataUrl={previewModal.fileDataUrl}
				label={previewModal.label}
				onClose={() => setPreviewModal({ open: false, file: null, fileDataUrl: '', label: '' })}
			/>
		</div>
	);
};

export default OnboardingReviewPanel;
