import React, { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';
import { API } from '../../../data/apis/endpoints';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import CommonTable from '../../../components/common/CommonTable.jsx';
import TableLayout from '../../../components/common/TableLayout.jsx';
import TableSearch from '../../../components/common/TableSearch.jsx';
import Filter from '../../../components/common/Filter.jsx';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import TableActions from '../../../components/common/TableActions.jsx';
import http from '../../../lib/axios/axios';
import { formatDate } from '../../../utils/methods/formatDate';
import { downloadExcel } from '../../../utils/methods/downloadExcel';

const STATUS_STYLES = {
	PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
	APPROVED: 'bg-green-50 text-green-700 border border-green-200',
	REJECTED: 'bg-red-50 text-red-700 border border-red-200',
	CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200'
};

const fmt = formatDate;

const LeaveApprovals = () => {
	const addToast = useSetAtom(addToastAtom);
	const { can, canAll } = usePermissions();

	// Determine filter mode from permissions:
	// APPROVE_ALL → see everyone's leaves
	// APPROVE_TEAM only → see only team's leaves
	const canApproveAll = can(PERM.EMPLOYEE_LEAVE.APPROVE_ALL);
	const canApproveTeam = can(PERM.EMPLOYEE_LEAVE.APPROVE_TEAM);
	const filterMode = canApproveAll ? 'all' : canApproveTeam ? 'team' : 'none';

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState({
		PENDING: true,
		APPROVED: false,
		REJECTED: false,
		CANCELLED: false
	});

	// Reject modal state
	const [rejectModal, setRejectModal] = useState({ open: false, leave: null, reason: '', loading: false });

	// Details modal state
	const [detailModal, setDetailModal] = useState({ open: false, leave: null, docs: [], docsLoading: false });

	const activeStatuses = Object.keys(statusFilter).filter(k => statusFilter[k]);
	const statusParam = activeStatuses.length === 1 ? activeStatuses[0] : undefined;

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.EMPLOYEE_LEAVES.DOWNLOAD_EXCEL,
			fileName: 'leave-approvals.xlsx',
			payload: { search, status: statusParam, filter_mode: filterMode }
		});
	};

	const { data, loading, mutate } = useAutoRevalidate(API.EMPLOYEE_LEAVES.LIST, {
		page,
		limit: pageSize,
		search: search || undefined,
		status: statusParam,
		filter_mode: filterMode
	});

	React.useEffect(() => {
		if (data && !loading && (!data.list || data.list.length === 0) && page > 1) {
			setPage(p => p - 1);
		}
	}, [data, loading, page]);

	const openDetail = leave => {
		setDetailModal({ open: true, leave, docs: [], docsLoading: true });
		http
			.post(API.EMPLOYEE_LEAVES.DOCUMENTS(leave.employee_leave_Id))
			.then(res => setDetailModal(m => ({ ...m, docs: Array.isArray(res?.data) ? res.data : [], docsLoading: false })))
			.catch(() => setDetailModal(m => ({ ...m, docsLoading: false })));
	};

	const handleApprove = async leave => {
		try {
			await http.post(API.EMPLOYEE_LEAVES.APPROVE(leave.employee_leave_Id));
			addToast({ type: 'success', message: `Leave approved for ${leave.employee_Name}` });
			mutate();
		} catch (err) {
			addToast({ type: 'error', message: err?.response?.data?.message || 'Failed to approve' });
		}
	};

	const handleRejectSubmit = async () => {
		setRejectModal(m => ({ ...m, loading: true }));
		try {
			await http.post(API.EMPLOYEE_LEAVES.REJECT(rejectModal.leave.employee_leave_Id), {
				rejection_reason: rejectModal.reason.trim()
			});
			addToast({ type: 'success', message: `Leave rejected for ${rejectModal.leave.employee_Name}` });
			setRejectModal({ open: false, leave: null, reason: '', loading: false });
			mutate();
		} catch (err) {
			addToast({ type: 'error', message: err?.response?.data?.message || 'Failed to reject' });
			setRejectModal(m => ({ ...m, loading: false }));
		}
	};

	const filterOptions = useMemo(
		() => [
			{ id: 'PENDING', label: 'Pending', checked: statusFilter.PENDING },
			{ id: 'APPROVED', label: 'Approved', checked: statusFilter.APPROVED },
			{ id: 'REJECTED', label: 'Rejected', checked: statusFilter.REJECTED },
			{ id: 'CANCELLED', label: 'Cancelled', checked: statusFilter.CANCELLED }
		],
		[statusFilter]
	);

	const columns = useMemo(
		() => [
			{
				key: 'id',
				label: '#',
				widthClassName: 'w-[50px]',
				render: (_, i) => <span>{(page - 1) * pageSize + i + 1}</span>
			},
			{
				key: 'employee_Name',
				label: 'Employee',
				widthClassName: 'min-w-[160px]',
				render: item => (
					<div className="flex flex-col gap-[4px]">
						<p className="font-bold text-text-1">{item.employee_Name}</p>
						{item.employee_Code && <p className="text-[11px] text-text-3">{item.employee_Code}</p>}
					</div>
				)
			},
			{
				key: 'leave_type_Name',
				label: 'Leave Type',
				widthClassName: 'min-w-[120px]',
				render: item => (
					<span className="rounded-full bg-brand-light/10 px-2 py-0.5 text-[11px] font-medium text-brand-light">
						{item.leave_type_Name}
					</span>
				)
			},
			{
				key: 'leave_from',
				label: 'From',
				widthClassName: 'w-[100px]',
				render: item => <span className="text-text-2">{fmt(item.leave_from)}</span>
			},
			{
				key: 'leave_to',
				label: 'To',
				widthClassName: 'w-[100px]',
				render: item => <span className="text-text-2">{fmt(item.leave_to)}</span>
			},
			{
				key: 'applied_for',
				label: 'Days',
				widthClassName: 'w-[60px]',
				render: item => <span className="font-semibold text-text-1">{item.applied_for ?? '—'}</span>
			},
			{
				key: 'comments',
				label: 'Comments',
				widthClassName: 'min-w-[140px]',
				render: item => (
					<span className="text-[11px] text-text-2 line-clamp-1">
						{item.comments || <span className="italic text-text-3">—</span>}
					</span>
				)
			},
			{
				key: 'leave_status',
				label: 'Status',
				widthClassName: 'w-[110px]',
				render: item => (
					<div>
						<span
							className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[item.leave_status] || ''}`}
						>
							{item.leave_status}
						</span>
						{item.leave_status === 'REJECTED' && item.rejection_reason && (
							<p className="mt-[2px] text-[10px] text-red-500 line-clamp-1" title={item.rejection_reason}>
								{item.rejection_reason}
							</p>
						)}
						{item.leave_status === 'APPROVED' && item.approved_by_name && (
							<p className="mt-[2px] text-[10px] text-text-3">by {item.approved_by_name}</p>
						)}
					</div>
				)
			},
			{
				key: 'actions',
				label: 'Actions',
				widthClassName: 'w-[200px]',
				render: item => (
					<div className="flex items-center gap-3">
						<TableActions onView={() => openDetail(item)} />
						{item.leave_status === 'PENDING' && (
							<>
								<button
									type="button"
									onClick={() => handleApprove(item)}
									className="rounded-[4px] bg-green-500 px-[8px] py-[3px] text-[11px] font-semibold text-white hover:brightness-90 transition"
								>
									Approve
								</button>
								<button
									type="button"
									onClick={() => setRejectModal({ open: true, leave: item, reason: '', loading: false })}
									className="rounded-[4px] bg-red-500 px-[8px] py-[3px] text-[11px] font-semibold text-white hover:brightness-90 transition"
								>
									Reject
								</button>
							</>
						)}
					</div>
				)
			}
		],
		[page, pageSize]
	);

	if (filterMode === 'none') {
		return (
			<div className="p-10 text-center text-[13px] text-text-3">
				You do not have permission to approve or reject leaves.
			</div>
		);
	}

	return (
		<>
			<TableLayout
				title={canApproveAll ? 'Leave Approvals — All Employees' : 'Leave Approvals — My Team'}
				extraAction={
					canAll(PERM.EMPLOYEE_LEAVE.LIST, PERM.EMPLOYEE_LEAVE.EXCEL) ? (
						<Button
							variant="unstyled"
							onClick={handleDownloadExcel}
							className="inline-flex h-[29px] items-center rounded-[6px] border border-[#1eafc0] bg-transparent px-[13px] py-[6px] font-semibold leading-none text-text-1 transition hover:brightness-95"
							style={{ fontSize: 'var(--entity-add-text)' }}
						>
							Download Excel
						</Button>
					) : undefined
				}
				filterContent={
					<div className="flex items-center gap-2">
						<TableSearch
							onSearch={v => {
								setSearch(v);
								setPage(1);
							}}
							placeholder="Search employee or leave type…"
						/>
						<Filter
							options={filterOptions}
							onChange={id => {
								setStatusFilter(p => ({ ...p, [id]: !p[id] }));
								setPage(1);
							}}
						/>
					</div>
				}
			>
				<CommonTable
					columns={columns}
					data={data?.list || []}
					loading={loading}
					currentPage={page}
					totalPages={data?.totalPages || 1}
					pageSize={pageSize}
					totalItems={data?.totalItems || 0}
					onPageChange={setPage}
					onPageSizeChange={s => {
						setPageSize(s);
						setPage(1);
					}}
				/>
			</TableLayout>

			{/* Details / Documents modal */}
			<Modal
				open={detailModal.open}
				onClose={() => setDetailModal({ open: false, leave: null, docs: [], docsLoading: false })}
				title={`Leave Details — ${detailModal.leave?.employee_Name || ''}`}
				widthClassName="max-w-[520px]"
				footer={
					<Button
						variant="outline"
						onClick={() => setDetailModal({ open: false, leave: null, docs: [], docsLoading: false })}
					>
						Close
					</Button>
				}
			>
				{detailModal.leave && (
					<div className="flex flex-col gap-4">
						{/* Leave info */}
						<div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-[8px] border border-divider bg-field p-4">
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-wide text-text-3">Employee</p>
								<p className="text-[13px] font-medium text-text-1">{detailModal.leave.employee_Name}</p>
								{detailModal.leave.employee_Code && (
									<p className="text-[11px] text-text-3">{detailModal.leave.employee_Code}</p>
								)}
							</div>
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-wide text-text-3">Leave Type</p>
								<p className="text-[13px] font-medium text-text-1">{detailModal.leave.leave_type_Name}</p>
							</div>
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-wide text-text-3">From</p>
								<p className="text-[13px] text-text-1">{fmt(detailModal.leave.leave_from)}</p>
							</div>
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-wide text-text-3">To</p>
								<p className="text-[13px] text-text-1">{fmt(detailModal.leave.leave_to)}</p>
							</div>
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-wide text-text-3">Days</p>
								<p className="text-[13px] font-semibold text-text-1">{detailModal.leave.applied_for ?? '—'}</p>
							</div>
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-wide text-text-3">Status</p>
								<span
									className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[detailModal.leave.leave_status] || ''}`}
								>
									{detailModal.leave.leave_status}
								</span>
							</div>
							{detailModal.leave.comments && (
								<div className="col-span-2">
									<p className="text-[10px] font-semibold uppercase tracking-wide text-text-3">Comments</p>
									<p className="text-[12px] text-text-1">{detailModal.leave.comments}</p>
								</div>
							)}
							{detailModal.leave.rejection_reason && (
								<div className="col-span-2">
									<p className="text-[10px] font-semibold uppercase tracking-wide text-text-3">Rejection Reason</p>
									<p className="text-[12px] text-red-600">{detailModal.leave.rejection_reason}</p>
								</div>
							)}
						</div>

						{/* Documents */}
						<div>
							<p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-text-2">Supporting Documents</p>
							{detailModal.docsLoading ? (
								<p className="text-[12px] text-text-3">Loading documents…</p>
							) : detailModal.docs.length === 0 ? (
								<p className="rounded-[6px] border border-divider bg-field px-4 py-3 text-[12px] italic text-text-3">
									No documents attached to this leave.
								</p>
							) : (
								<div className="flex flex-col gap-2">
									{detailModal.docs.map(doc => (
										<a
											key={doc.employee_leave_document_Id}
											href={doc.employee_leave_document_File_Key}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-3 rounded-[6px] border border-divider bg-card px-3 py-2.5 transition hover:border-brand-light"
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
											<span className="flex-1 truncate text-[12px] font-medium text-brand-light">
												{doc.employee_leave_document_File_Name || doc.employee_leave_document_File_Key}
											</span>
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
							)}
						</div>
					</div>
				)}
			</Modal>

			{/* Reject modal */}
			<Modal
				open={rejectModal.open}
				onClose={() => setRejectModal({ open: false, leave: null, reason: '', loading: false })}
				title={`Reject Leave — ${rejectModal.leave?.employee_Name}`}
				widthClassName="max-w-[440px]"
				footer={
					<>
						<Button
							variant="outline"
							onClick={() => setRejectModal({ open: false, leave: null, reason: '', loading: false })}
							disabled={rejectModal.loading}
						>
							Cancel
						</Button>
						<Button
							onClick={handleRejectSubmit}
							disabled={rejectModal.loading}
							className="!bg-red-600 hover:!brightness-90"
						>
							{rejectModal.loading ? 'Rejecting…' : 'Reject Leave'}
						</Button>
					</>
				}
			>
				<div className="flex flex-col gap-3">
					{rejectModal.leave && (
						<div className="rounded-[6px] bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
							<p>
								<strong>{rejectModal.leave.leave_type_Name}</strong> — {rejectModal.leave.applied_for} day(s)
							</p>
							<p className="text-[11px] mt-0.5">
								{fmt(rejectModal.leave.leave_from)} → {fmt(rejectModal.leave.leave_to)}
							</p>
						</div>
					)}
					<div>
						<label className="form-label">Rejection Reason</label>
						<textarea
							rows={3}
							value={rejectModal.reason}
							onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
							placeholder="Enter reason for rejection..."
							className="form-input resize-none w-full"
							maxLength={150}
						/>
						<p className="mt-1 text-[10.5px] text-text-3 text-right">{rejectModal.reason.length}/150</p>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default LeaveApprovals;
