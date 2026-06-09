import React, { useMemo, useState, useEffect } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../utils/constants/routes";
import { usePermissions } from "../../../hooks/usePermissions";
import Unauthorized from "../../Unauthorized";
import { PERM } from "../../../utils/constants/permissionKey2";
import TableLayout from "../../../components/common/TableLayout";
import CommonTable from "../../../components/common/CommonTable";
import TableActions from "../../../components/common/TableActions";
import TableSearch from "../../../components/common/TableSearch";
import Filter from "../../../components/common/Filter";
import Button from "../../../components/common/Button";
import { useConfirm } from "../../../hooks/useConfirm";
import { useSetAtom } from "jotai";
import { addToastAtom } from "../../../data/states/toastAtom";
import Modal from "../../../components/common/Modal";
import RejectReasonModal from "../../../components/common/RejectReasonModal";
import Tooltip from "../../../components/dropdown/Tooltip";
import { BROWSER_STORAGE_KEYS } from "../../../utils/constants/browserStorageKeys";
import { getDataInBrowser } from "../../../utils/methods/DataInBrowser";
import { useAutoRevalidate } from "../../../hooks/useAutoRevalidate";
import {
  API,
  docOnboardCreateApi,
  docOnboardDeleteApi,
  docOnboardApproveApi,
  docOnboardRejectApi,
  docOnboardSendBackApi,
} from "../../../data/apis";

const STATUS_MAP = {
	1: 'Draft',
	2: 'Submitted',
	3: 'Approved',
	4: 'Rejected',
	5: 'Sent Back'
};

const OnboardingList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const addToast = useSetAtom(addToastAtom);

	const { can, canAll } = usePermissions();

	const canViewList = can(PERM.DOCTOR_ONBOARDING.LIST);
	const canAdd = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.ADD);
	const canEdit = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.EDIT);
	const canDelete = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.DELETE);
	const canViewDetails = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.VIEW);
	const canApprove = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.APPROVE);
	const canReject = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.REJECT);
	const canSendBack = canAll(PERM.DOCTOR_ONBOARDING.LIST, PERM.DOCTOR_ONBOARDING.SEND_BACK);

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'doc_onboard_Id', direction: 'desc' });
	const [search, setSearch] = useState('');
	const [rejectModal, setRejectModal] = useState({ open: false, item: null });
	const [sendBackModal, setSendBackModal] = useState({ open: false, item: null });

	const [showInitiateModal, setShowInitiateModal] = useState(false);
	const [initiationMode, setInitiationMode] = useState('admin'); // "admin" or "self"
	const [initiationStep, setInitiationStep] = useState(1);
	const [initLoading, setInitLoading] = useState(false);
	const [linkCopied, setLinkCopied] = useState(false);
	const [createdOnboardId, setCreatedOnboardId] = useState(null);

	const selfRegLink = useMemo(() => {
		if (!createdOnboardId) return '';
		const authUser = getDataInBrowser(BROWSER_STORAGE_KEYS.authUser) || {};
		const generatorId = authUser.user_Id || authUser.id || authUser.user?.user_Id || authUser.user?.id || 1;
		const generatorName =
			authUser.user_Name || authUser.name || authUser.user?.user_Name || authUser.user?.name || 'Admin';
		const generatorEmail =
			authUser.user_Email ||
			authUser.email ||
			authUser.user?.user_Email ||
			authUser.user?.email ||
			'admin@medicity.com';
		const clientId = authUser.client_Id || authUser.user?.client_Id || 1;
		const timestamp = Date.now();

		const tokenData = {
			id: generatorId,
			name: generatorName,
			email: generatorEmail,
			client_id: clientId,
			timestamp: timestamp,
			onboard_id: createdOnboardId
		};

    const tokenString = btoa(unescape(encodeURIComponent(JSON.stringify(tokenData))));
    return `${window.location.origin}${ROUTES.DOCTOR_ONBOARD_REGISTER}?token=${tokenString}`;
  }, [createdOnboardId]);

	const handleCopyLink = () => {
		navigator.clipboard.writeText(selfRegLink);
		setLinkCopied(true);
		addToast({ type: 'success', message: 'Self-registration link copied to clipboard!' });
		setTimeout(() => setLinkCopied(false), 2000);
	};

	const [statusFilter, setStatusFilter] = useState({
		Draft: true,
		Submitted: true,
		Approved: true,
		Rejected: true,
		'Sent Back': true
	});

	const [stepFilter, setStepFilter] = useState({
		Personal: true,
		Qualification: true,
		Shift: true,
		Financial: true,
		Document: true,
		Review: true
	});

	// Build status IDs array from filter checkboxes
	const activeStatusIds = useMemo(() => {
		const ids = [];
		if (statusFilter.Draft) ids.push(1);
		if (statusFilter.Submitted) ids.push(2);
		if (statusFilter.Approved) ids.push(3);
		if (statusFilter.Rejected) ids.push(4);
		if (statusFilter['Sent Back']) ids.push(5);
		return ids;
	}, [statusFilter]);

	// Build step names array from filter checkboxes
	const activeStepValues = useMemo(() => {
		const steps = [];
		if (stepFilter.Personal) steps.push('Personal');
		if (stepFilter.Qualification) steps.push('Qualification');
		if (stepFilter.Shift) steps.push('Shift');
		if (stepFilter.Financial) steps.push('Financial');
		if (stepFilter.Document) steps.push('Document');
		if (stepFilter.Review) steps.push('Review');

		if (steps.length === 0) {
			steps.push('N/A');
		}
		return steps;
	}, [stepFilter]);

	const sortByVal = useMemo(() => {
		if (sortConfig.key === 'name') return 'doc_onboard_Name';
		if (sortConfig.key === 'id') return 'doc_onboard_Id';
		if (sortConfig.key === 'email') return 'doc_onboard_Email';
		if (sortConfig.key === 'mobile') return 'doc_onboard_Mobile_Number';
		if (sortConfig.key === 'registrationNumber') return 'doc_onboard_Registration_Number';
		return sortConfig.key;
	}, [sortConfig.key]);

	const { data, loading, mutate } = useAutoRevalidate(API.DOC_ONBOARD.LIST, {
		page,
		limit: pageSize,
		sortBy: sortByVal,
		sortOrder: sortConfig.direction,
		search: search || undefined,
		statusIds: activeStatusIds.length < 5 ? activeStatusIds : undefined,
		currentSteps: activeStepValues.length < 6 ? activeStepValues : undefined
	});

	const formattedOnboardings = useMemo(() => {
		return (data?.list || []).map(item => ({
			id: item.doc_onboard_Id,
			name: item.doc_onboard_Name || 'Unnamed Doctor',
			email: item.doc_onboard_Email || '—',
			mobile: item.doc_onboard_Mobile_Number || '—',
			registrationNumber: item.doc_onboard_Registration_Number || '—',
			currentStep: item.doc_onboard_Current_Step || 'N/A',
			status: item.status || STATUS_MAP[item.doc_onboard_status_Id] || 'Draft',
			createdAt: item.created_at,
			rejectionReason: item.doc_onboard_Rejection_Reason,
			approvedAt: item.doc_onboard_Approved_At,
			rejectedAt: item.doc_onboard_Rejected_At,
			approvedByName: item.approved_by_name,
			rejectedByName: item.rejected_by_name,
			resubmissionCount: item.doc_onboard_Resubmission_Count || 0,
			reviewComments: item.doc_onboard_Review_Comments || ''
		}));
	}, [data?.list]);

	// Auto-redirect if current page becomes empty (e.g. after deletion)
	useEffect(() => {
		if (data && !loading && (!data.list || data.list.length === 0) && page > 1) {
			setPage(p => p - 1);
		}
	}, [data, loading, page]);

	// Self-registration: create draft via API and transition to link display
	const handleInitiateSelfReg = async () => {
		setInitLoading(true);
		try {
			const res = await docOnboardCreateApi({
				currentStep: 'Personal'
			});
			if (res?.success && res.data?.doc_onboard_Id) {
				setCreatedOnboardId(res.data.doc_onboard_Id);
				setInitiationStep(2);
				mutate();
			} else {
				addToast({ type: 'error', message: 'Failed to create onboarding draft' });
			}
		} catch (err) {
			console.error('Self-reg creation failed:', err);
			addToast({ type: 'error', message: 'Failed to create onboarding draft' });
		} finally {
			setInitLoading(false);
		}
	};

	const handleSearch = value => {
		setSearch(value);
		setPage(1);
	};

	const handleFilterToggle = id => {
		if (id in statusFilter) {
			setStatusFilter(prev => ({
				...prev,
				[id]: !prev[id]
			}));
		} else if (id in stepFilter) {
			setStepFilter(prev => ({
				...prev,
				[id]: !prev[id]
			}));
		}
		setPage(1);
	};

	const filterOptions = useMemo(
		() => [
			{ id: 'Draft', label: 'Draft', checked: statusFilter.Draft },
			{ id: 'Submitted', label: 'Submitted', checked: statusFilter.Submitted },
			{ id: 'Approved', label: 'Approved', checked: statusFilter.Approved },
			{ id: 'Rejected', label: 'Rejected', checked: statusFilter.Rejected },
			{ id: 'Sent Back', label: 'Sent Back', checked: statusFilter['Sent Back'] },
			{ id: 'Personal', label: 'Personal', checked: stepFilter.Personal },
			{ id: 'Qualification', label: 'Qualifications', checked: stepFilter.Qualification },
			{ id: 'Shift', label: 'Shift Details', checked: stepFilter.Shift },
			{ id: 'Financial', label: 'Financial', checked: stepFilter.Financial },
			{ id: 'Document', label: 'Documents', checked: stepFilter.Document },
			{ id: 'Review', label: 'Review', checked: stepFilter.Review }
		],
		[statusFilter, stepFilter]
	);

	const handleDelete = id => {
		confirm({
			title: 'Discard Onboarding',
			message: 'Are you sure you want to discard this doctor onboarding application?',
			confirmLabel: 'Discard',
			onConfirm: async () => {
				try {
					await docOnboardDeleteApi(id);
					addToast({ type: 'success', message: 'Onboarding record discarded successfully' });
					if (formattedOnboardings.length === 1 && page > 1) {
						setPage(p => p - 1);
					} else {
						mutate();
					}
				} catch (err) {
					console.error('Delete failed:', err);
					addToast({ type: 'error', message: 'Failed to delete onboarding record' });
				}
			}
		});
	};

	const handleApprove = item => {
		confirm({
			title: 'Approve Onboarding',
			message: `Are you sure you want to approve doctor onboarding for ${item.name}? This will create a Doctor Master record and link all documents.`,
			confirmLabel: 'Approve',
			isDestructive: false,
			onConfirm: async () => {
				try {
					await docOnboardApproveApi(item.id);
					addToast({ type: 'success', message: `Onboarding approved for ${item.name} successfully!` });
					mutate();
				} catch (err) {
					console.error('Approval failed:', err);
					addToast({ type: 'error', message: err?.response?.data?.message || 'Failed to approve onboarding record' });
				}
			}
		});
	};

	const handleRejectSubmit = async reason => {
		if (!rejectModal.item) return;
		try {
			await docOnboardRejectApi(rejectModal.item.id, { rejection_reason: reason });
			addToast({ type: 'success', message: `Onboarding rejected for ${rejectModal.item.name}` });
			mutate();
		} catch (err) {
			console.error('Rejection failed:', err);
			addToast({ type: 'error', message: err?.response?.data?.message || 'Failed to reject onboarding record' });
			throw err;
		}
	};

	const handleSendBackSubmit = async comments => {
		if (!sendBackModal.item) return;
		try {
			await docOnboardSendBackApi(sendBackModal.item.id, { review_comments: comments });
			addToast({ type: 'success', message: `Onboarding application sent back to ${sendBackModal.item.name}` });
			mutate();
		} catch (err) {
			console.error('Send back failed:', err);
			addToast({ type: 'error', message: err?.response?.data?.message || 'Failed to send back onboarding record' });
			throw err;
		}
	};

  const columns = useMemo(
    () => {
      const cols = [
        {
          key: "id",
          label: "#",
          widthClassName: "w-[60px]",
          render: (_, index) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        {
          key: "name",
          label: "Doctor Name",
          widthClassName: "min-w-[180px]",
          render: (item) => (
            <span className="text-text-1 font-medium leading-none">
              {item.name || "Unnamed Doctor"}
            </span>
          ),
        },
        {
          key: "email",
          label: "Email ID",
          widthClassName: "min-w-[180px]",
        },
        {
          key: "mobile",
          label: "Mobile No.",
          widthClassName: "min-w-[120px]",
        },
        {
          key: "registrationNumber",
          label: "Reg. Number",
          widthClassName: "min-w-[120px]",
          render: (item) => <span>{item.registrationNumber || "N/A"}</span>,
        },
        {
          key: "currentStep",
          label: "Current Step",
          widthClassName: "min-w-[120px]",
          render: (item) => (
            <span className="inline-block rounded-full border border-brand-light px-2 py-0.5 text-[11px] font-medium text-brand-light">
              {item.currentStep}
            </span>
          ),
        },
        {
          key: "status",
          label: "Status",
          widthClassName: "w-[150px]",
          render: (item) => {
            let badgeColor = "border-pill-draft text-pill-draft";
            if (item.status === "Submitted") {
              badgeColor = "border-pill-submitted text-pill-submitted";
            } else if (item.status === "Approved") {
              badgeColor = "border-pill-approved text-pill-approved";
            } else if (item.status === "Rejected") {
              badgeColor = "border-pill-rejected text-pill-rejected";
            } else if (item.status === "Sent Back") {
              badgeColor = "border-pill-sent-back text-pill-sent-back";
            }
            return (
              <div>
                <div className="flex items-center gap-1">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeColor}`}>
                    {item.status}
                  </span>
                </div>
                {item.status === "Approved" && item.approvedByName && (
                  <p className="mt-[2px] text-[10px] text-text-3">
                    by {item.approvedByName}
                  </p>
                )}
                {item.status === "Rejected" && item.rejectedByName && (
                  <p className="mt-[2px] text-[10px] text-text-3">
                    by {item.rejectedByName}
                  </p>
                )}
                {item.resubmissionCount > 0 && (
                  <p className="mt-[4px] text-[10px] font-medium text-text-2">
                    Resubmitted: {item.resubmissionCount}/3
                  </p>
                )}
              </div>
            );
          },
        }
      ];

      const hasAnyAction = canViewDetails || canEdit || canDelete || canApprove || canReject || canSendBack;
      if (hasAnyAction) {
        cols.push({
          key: "actions",
          label: "Actions",
          widthClassName: "w-[200px]",
          render: (item) => {
            if (item.status === "Submitted") {
              return (
                <div className="flex gap-1.5 items-center">
                  <TableActions
                    onView={canViewDetails ? () => navigate(`${ROUTES.DOCTOR_ONBOARDING_DETAILS}?id=${item.id}`) : undefined}
                  />
                  {canApprove && (
                    <button
                      type="button"
                      onClick={() => handleApprove(item)}
                      className="rounded-[4px] bg-btn-approve px-[8px] py-[3px] text-[11px] font-semibold text-white hover:brightness-90 transition shrink-0"
                    >
                      Approve
                    </button>
                  )}
                  {item.resubmissionCount < 3 ? (
                    canSendBack && (
                      <button
                        type="button"
                        onClick={() => setSendBackModal({ open: true, item })}
                        className="rounded-[4px] bg-btn-send-back px-[8px] py-[3px] text-[11px] font-semibold text-white hover:brightness-90 transition shrink-0"
                      >
                        Send Back
                      </button>
                    )
                  ) : (
                    canReject && (
                      <button
                        type="button"
                        onClick={() => setRejectModal({ open: true, item })}
                        className="rounded-[4px] bg-btn-reject px-[8px] py-[3px] text-[11px] font-semibold text-white hover:brightness-90 transition shrink-0"
                      >
                        Reject
                      </button>
                    )
                  )}
                </div>
              );
            }
            return (
              <TableActions
                onView={canViewDetails ? () => navigate(`${ROUTES.DOCTOR_ONBOARDING_DETAILS}?id=${item.id}`) : undefined}
                onEdit={(item.status === "Rejected" || item.status === "Approved" || !canEdit) ? undefined : () => navigate(`${ROUTES.DOCTOR_ONBOARDING_WIZARD}?id=${item.id}`)}
                onDelete={canDelete ? () => handleDelete(item.id) : undefined}
              />
            );
          },
        });
      }

      return cols;
    },
    [navigate, page, pageSize, formattedOnboardings, canViewDetails, canEdit, canDelete, canApprove, canReject, canSendBack]
  );

	if (!canViewList) return <Unauthorized />;

	return (
		<>
			<TableLayout
				title="Doctor Onboarding List"
				addLabel={canAdd ? "Start Onboarding" : undefined}
				addAction={canAdd ? () => {
					setInitiationMode('admin');
					setInitiationStep(1);
					setCreatedOnboardId(null);
					setShowInitiateModal(true);
				} : undefined}
				filterContent={
					canViewList ? (
						<div className="flex items-center gap-2">
							<TableSearch onSearch={handleSearch} placeholder="Search Onboardings" />
							<Filter options={filterOptions} onChange={handleFilterToggle} />
						</div>
					) : undefined
				}
			>
				<CommonTable
					columns={columns}
					sortableColumns={['name', 'id', 'email', 'mobile', 'registrationNumber']}
					sortConfig={sortConfig}
					onSortChange={setSortConfig}
					data={formattedOnboardings}
					currentPage={page}
					totalPages={data?.totalPages || 1}
					pageSize={pageSize}
					totalItems={data?.totalItems || 0}
					onPageChange={setPage}
					onPageSizeChange={size => {
						setPageSize(size);
						setPage(1);
					}}
					loading={loading}
				/>
			</TableLayout>

			<Modal
				open={showInitiateModal}
				onClose={() => setShowInitiateModal(false)}
				title="Start Doctor Onboarding"
				widthClassName="max-w-[480px]"
				footer={
					<div className="flex justify-end gap-[10px]">
						{initiationStep === 1 ? (
							<>
								<Button type="button" variant="outline" onClick={() => setShowInitiateModal(false)}>
									Cancel
								</Button>
								<Button
									type="button"
									loading={initLoading}
									onClick={() => {
										if (initiationMode === 'admin') {
											setShowInitiateModal(false);
											navigate(ROUTES.DOCTOR_ONBOARDING_WIZARD);
										} else {
											handleInitiateSelfReg();
										}
									}}
								>
									Proceed
								</Button>
							</>
						) : (
							<Button
								type="button"
								onClick={() => {
									setShowInitiateModal(false);
									setCreatedOnboardId(null);
								}}
							>
								Finish
							</Button>
						)}
					</div>
				}
			>
				<div className="space-y-[16px]">
					<p className="text-p2 text-text-3">
						{initiationStep === 1
							? 'Select how you would like to initiate the onboarding process for the new doctor.'
							: 'Generate an authorization link that allows the doctor to complete the wizard remotely.'}
					</p>

					<div className="min-h-[140px]">
						{initiationStep === 1 ? (
							<div className="grid grid-cols-2 gap-[12px]">
								{/* Admin Entry Option Card */}
								<div
									onClick={() => setInitiationMode('admin')}
									className={`flex flex-col p-[16px] rounded-[8px] border-2 cursor-pointer transition-all hover:shadow-sm h-full ${
										initiationMode === 'admin' ? 'border-brand-light bg-field/30' : 'border-divider bg-card'
									}`}
								>
									<div className="flex items-center gap-[8px] mb-[8px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className={`h-[18px] w-[18px] ${initiationMode === 'admin' ? 'text-brand-light' : 'text-text-3'}`}
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth="2"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
										<span className="text-[12px] font-semibold text-text-1">Internal Admin</span>
									</div>
									<p className="text-[11px] text-text-3 leading-relaxed">
										Directly fill in credentials and details on this device (HR/Staff entry).
									</p>
								</div>

								{/* Self Registration Option Card */}
								<div
									onClick={() => setInitiationMode('self')}
									className={`flex flex-col p-[16px] rounded-[8px] border-2 cursor-pointer transition-all hover:shadow-sm h-full ${
										initiationMode === 'self' ? 'border-brand-light bg-field/30' : 'border-divider bg-card'
									}`}
								>
									<div className="flex items-center gap-[8px] mb-[8px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className={`h-[18px] w-[18px] ${initiationMode === 'self' ? 'text-brand-light' : 'text-text-3'}`}
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth="2"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
											/>
										</svg>
										<span className="text-[12px] font-semibold text-text-1">Self Registration</span>
									</div>
									<p className="text-[11px] text-text-3 leading-relaxed">
										Generate an authorization link that allows the doctor to complete the wizard remotely.
									</p>
								</div>
							</div>
						) : (
							<div className="bg-field p-[16px] rounded-[6px] border border-divider space-y-[12px] h-full flex flex-col justify-center">
								<span className="text-[12px] font-semibold text-text-2">Generated Self-Registration Link</span>
								<div className="flex gap-[8px]">
									<input
										type="text"
										readOnly
										value={selfRegLink}
										className="form-input flex-1 bg-card text-text-2 border border-divider rounded px-[10px] py-[8px] text-[12px] outline-none focus:border-brand-light"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={handleCopyLink}
										className="px-[14px] py-[8px] text-[12px] shrink-0"
									>
										{linkCopied ? 'Copied' : 'Copy Link'}
									</Button>
								</div>
								<p className="text-[11px] text-text-3 leading-normal">
									Copy this link to share with the doctor. The onboarding draft record has already been created.
								</p>
							</div>
						)}
					</div>
				</div>
			</Modal>

			<RejectReasonModal
				open={rejectModal.open}
				onClose={() => setRejectModal({ open: false, item: null })}
				title="Reject Doctor Onboarding"
				onConfirm={handleRejectSubmit}
				infoContent={
					rejectModal.item && (
						<div>
							<p className="font-semibold">{rejectModal.item.name}</p>
							<p className="text-[11px] mt-0.5">
								{rejectModal.item.email} • {rejectModal.item.mobile}
							</p>
						</div>
					)
				}
			/>

			<RejectReasonModal
				open={sendBackModal.open}
				onClose={() => setSendBackModal({ open: false, item: null })}
				title="Send Back for Corrections"
				onConfirm={handleSendBackSubmit}
				confirmLabel="Send Back"
				inputLabel="Reviewer Feedback"
				placeholder="Enter specific areas/fields requiring corrections..."
				requiredMessage="Reviewer comments are required to send back the application."
				loadingLabel="Sending Back..."
				buttonColorClass="!bg-btn-send-back hover:!brightness-90 hover:!bg-btn-send-back text-white"
				infoContent={
					sendBackModal.item && (
						<div>
							<p className="font-semibold">Sending back {sendBackModal.item.name}</p>
							<p className="text-[11px] mt-0.5">
								Resubmissions made so far: {sendBackModal.item.resubmissionCount} / 3
							</p>
						</div>
					)
				}
			/>
		</>
	);
};

export default OnboardingList;
