import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import FormLayout from "../../../components/common/FormLayout";
import OnboardingReviewPanel from "../../../components/Doctor/OnboardingReviewPanel";
import ROUTES from "../../../utils/constants/routes";
import {
  docOnboardGetApi,
  docOnboardApproveApi,
  docOnboardRejectApi,
  docOnboardSendBackApi,
} from "../../../data/apis";
import { API } from "../../../data/apis/endpoints";
import http from "../../../lib/axios/axios";
import { useConfirm } from "../../../hooks/useConfirm";
import { useSetAtom } from "jotai";
import { addToastAtom } from "../../../data/states/toastAtom";
import RejectReasonModal from "../../../components/common/RejectReasonModal";
import { usePermissions } from "../../../hooks/usePermissions";
import Unauthorized from "../../Unauthorized";
import { PERM } from "../../../utils/constants/permissionKey2";

const OnboardingDetails = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const id = searchParams.get('id');
	const confirm = useConfirm();
	const addToast = useSetAtom(addToastAtom);

	const [loading, setLoading] = useState(true);
	const [form, setForm] = useState(null);
	const [rejectionReason, setRejectionReason] = useState(null);
	const [reviewComments, setReviewComments] = useState(null);
	const [statesList, setStatesList] = useState([]);
	const [citiesList, setCitiesList] = useState([]);
	const [degreesList, setDegreesList] = useState([]);
	const [specializationsList, setSpecializationsList] = useState([]);
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [sendBackModalOpen, setSendBackModalOpen] = useState(false);

	// Load master dropdown data
	useEffect(() => {
		const load = async () => {
			try {
				const [statesRes, degreesRes, specsRes] = await Promise.all([
					http.post(API.STATES.LIST, { page: 1, limit: 1000, is_active: 1 }),
					http.post(API.DEGREES.LIST, { page: 1, limit: 1000, is_active: 1 }),
					http.post(API.DOC_SPECIALIZATION_MASTER.LIST, { page: 1, limit: 1000, is_active: 1 })
				]);
				if (statesRes?.success || statesRes?.data?.list) setStatesList(statesRes.data?.list || statesRes.list || []);
				if (degreesRes?.success || degreesRes?.data?.list)
					setDegreesList(degreesRes.data?.list || degreesRes.list || []);
				if (specsRes?.success || specsRes?.data?.list)
					setSpecializationsList(specsRes.data?.list || specsRes.list || []);
			} catch (err) {
				console.error('Failed to load master data', err);
			}
		};
		load();
	}, []);

	// Load cities when state is known
	useEffect(() => {
		if (form?.state) {
			http
				.post(API.CITIES.LIST, {
					page: 1,
					limit: 1000,
					state_Id: Number(form.state)
				})
				.then(res => {
					if (res?.success || res?.data?.list) setCitiesList(res.data?.list || res.list || []);
				})
				.catch(err => console.error('Failed to load cities', err));
		}
	}, [form?.state]);

	// Load onboarding record
	useEffect(() => {
		if (!id) return;
		setLoading(true);
		docOnboardGetApi(id)
			.then(res => {
				if (res?.success && res.data) {
					const d = res.data;

					// Map degrees & specializations to objects with id/name
					const degrees = (d.degrees || []).map(deg => ({
						id: String(deg.id),
						name: deg.name
					}));
					const specializations = (d.specializations || []).map(s => ({
						id: String(s.id),
						name: s.name
					}));

					// Map documents
					const docMap = {};
					for (const doc of d.documents || []) {
						const fieldName = doc.fileName?.split('_')[0];
						if (fieldName) {
							docMap[fieldName] = {
								name: doc.fileName?.replace(fieldName + '_', '') || doc.fileName,
								fileKey: doc.fileKey,
								size: doc.sizeBytes ? (doc.sizeBytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A',
								uploadId: doc.id
							};
						}
					}

          setForm({
            fullName: `${d.firstName || ""} ${d.lastName || ""}`.trim(),
            dob: d.dob || "",
            gender: d.gender || "",
            email: d.email || "",
            mobileCode: "+91",
            mobile: d.mobile || "",
            alternateMobileCode: "+91",
            alternateMobile: d.alternateMobile || "",
            address: d.address || "",
            state: d.state ? String(d.state) : "",
            city: d.city ? String(d.city) : "",
            pinCode: d.pinCode || "",
            registrationNumber: d.registrationNumber || "",
            registrationCouncil: d.registrationCouncil || "",
            registrationExpiryDate: d.registrationExpiryDate || "",
            experienceYears: d.experienceYears || "",
            subSpecialization: d.subSpecialization || "",
            degrees,
            specializations,
            shiftStartTime: d.shiftStartTime || "",
            shiftEndTime: d.shiftEndTime || "",
            workingDays: d.workingDays || [],
            bankAccountNumber: d.bankAccountNumber || "",
            bankName: d.bankName || "",
            ifscCode: d.ifscCode || "",
            accountHolderName: d.accountHolderName || "",
            panNumber: d.panNumber || "",
            commissionType: d.commissionType || "",
            commissionValue: d.commissionValue || "",
            consultationCharge: d.consultationCharge || "",
            degreeCertificate: docMap.degreeCertificate || null,
            registrationCertificate: docMap.registrationCertificate || null,
            govIdProof: docMap.govIdProof || null,
            photograph: docMap.photograph || null,
            statusId: d.statusId,
            status: d.status,
            resubmissionCount: d.resubmissionCount || 0,
          });

					if (d.status === 'Rejected' || d.statusId === 4) {
						// The rejection reason comes from the list; the GET may or may not include it.
						// Try to read from the raw record if available.
						setRejectionReason(d.rejectionReason || null);
					}
					if (d.status === 'Sent Back' || d.statusId === 5) {
						setReviewComments(d.reviewComments || null);
					}
				}
			})
			.catch(err => console.error('Failed to load onboarding details', err))
			.finally(() => setLoading(false));
	}, [id]);

	const { canAll } = usePermissions();
	const canViewDetails = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.VIEW);
	const canApprove = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.APPROVE);
	const canReject = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.REJECT);
	const canSendBack = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.SEND_BACK);

	if (!canViewDetails) return <Unauthorized />;

	const statusBadgeColor = (() => {
		if (!form) return '';
		switch (form.status) {
			case 'Submitted':
				return 'border-pill-submitted/30 text-pill-submitted bg-pill-submitted/10';
			case 'Approved':
				return 'border-onboard-success/30 text-onboard-success bg-onboard-success-bg';
			case 'Rejected':
				return 'border-onboard-error/30 text-onboard-error bg-onboard-error-bg';
			case 'Sent Back':
				return 'border-pill-sent-back/30 text-pill-sent-back bg-pill-sent-back/10';
			default:
				return 'border-pill-draft/30 text-pill-draft bg-pill-draft/10';
		}
	})();

  const handleApprove = () => {
    confirm({
      title: "Approve Onboarding",
      message: `Are you sure you want to approve doctor onboarding for ${form.fullName}? This will create a Doctor Master record and link all documents.`,
      confirmLabel: "Approve",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await docOnboardApproveApi(id);
          addToast({ type: "success", message: `Onboarding approved successfully!` });
          navigate(ROUTES.DOCTOR_ONBOARDING_LIST);
        } catch (err) {
          console.error("Approval failed:", err);
          addToast({ type: "error", message: err?.response?.data?.message || "Failed to approve onboarding record" });
        }
      },
    });
  };

	const handleRejectSubmit = async reason => {
		try {
			await docOnboardRejectApi(id, { rejection_reason: reason });
			addToast({ type: 'success', message: 'Onboarding application rejected successfully' });
			navigate(ROUTES.DOCTOR_ONBOARDING_LIST);
		} catch (err) {
			console.error('Rejection failed:', err);
			addToast({ type: 'error', message: err?.response?.data?.message || 'Failed to reject onboarding record' });
			throw err;
		}
	};

	const handleSendBackSubmit = async comments => {
		try {
			await docOnboardSendBackApi(id, { review_comments: comments });
			addToast({ type: 'success', message: 'Onboarding application sent back successfully' });
			navigate(ROUTES.DOCTOR_ONBOARDING_LIST);
		} catch (err) {
			console.error('Send back failed:', err);
			addToast({ type: 'error', message: err?.response?.data?.message || 'Failed to send back onboarding record' });
			throw err;
		}
	};

	const footerContent =
		form && form.statusId === 2 ? (
			<div className="flex justify-end gap-[10px] p-[10px]">
				{canApprove && (
					<button
						type="button"
						onClick={handleApprove}
						className="rounded-[4px] bg-btn-approve px-[16px] py-[6px] text-xs font-semibold text-white hover:brightness-90 transition cursor-pointer"
					>
						Approve
					</button>
				)}
				{form.resubmissionCount < 3 ? (
					canSendBack && (
						<button
							type="button"
							onClick={() => setSendBackModalOpen(true)}
							className="rounded-[4px] bg-btn-send-back px-[16px] py-[6px] text-xs font-semibold text-white hover:brightness-90 transition cursor-pointer"
						>
							Send Back
						</button>
					)
				) : (
					canReject && (
						<button
							type="button"
							onClick={() => setRejectModalOpen(true)}
							className="rounded-[4px] bg-btn-reject px-[16px] py-[6px] text-xs font-semibold text-white hover:brightness-90 transition cursor-pointer"
						>
							Reject
						</button>
					)
				)}
			</div>
		) : null;

  return (
    <FormLayout
      title="Onboarding Details"
      backTo={ROUTES.DOCTOR_ONBOARDING_LIST}
      footer={form && form.statusId === 2 ? footerContent : null}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-3 text-sm">
          Loading details…
        </div>
      ) : !form ? (
        <div className="flex items-center justify-center py-20 text-text-3 text-sm">
          Record not found.
        </div>
      ) : (
        <div className="p-[20px] space-y-[14px]">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${statusBadgeColor}`}
            >
              {form.status}
            </span>
            <span className="text-text-3 text-xs">
              {form.fullName}
            </span>
            {form.resubmissionCount > 0 && (
              <span className="text-text-3 text-xs font-medium">
                • Resubmitted: {form.resubmissionCount} / 3
              </span>
            )}
          </div>

					<OnboardingReviewPanel
						form={form}
						statesList={statesList}
						citiesList={citiesList}
						degreesList={degreesList}
						specializationsList={specializationsList}
						rejectionReason={rejectionReason}
						reviewComments={reviewComments}
						isAdminFlow={true}
					/>

          <RejectReasonModal
            open={rejectModalOpen}
            onClose={() => setRejectModalOpen(false)}
            title="Reject Doctor Onboarding"
            onConfirm={handleRejectSubmit}
            infoContent={
              form && (
                <div>
                  <p className="font-semibold">{form.fullName}</p>
                  <p className="text-[11px] mt-0.5">{form.email} • {form.mobile}</p>
                </div>
              )
            }
          />

          <RejectReasonModal
            open={sendBackModalOpen}
            onClose={() => setSendBackModalOpen(false)}
            title="Send Back for Corrections"
            onConfirm={handleSendBackSubmit}
            confirmLabel="Send Back"
            inputLabel="Reviewer Feedback"
            placeholder="Enter specific areas/fields requiring corrections..."
            requiredMessage="Reviewer comments are required to send back the application."
            loadingLabel="Sending Back..."
            buttonColorClass="!bg-btn-send-back hover:!brightness-90 hover:!bg-btn-send-back text-white"
            infoContent={
              form && (
                <div>
                  <p className="font-semibold">Sending back {form.fullName}</p>
                  <p className="text-[11px] mt-0.5">Resubmissions made so far: {form.resubmissionCount} / 3</p>
                </div>
              )
            }
          />
        </div>
      )}
    </FormLayout>
  );
};

export default OnboardingDetails;
