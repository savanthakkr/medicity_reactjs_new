import React, { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../../utils/constants/routes';
import { API } from '../../../data/apis/endpoints';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import TableActions from '../../../components/common/TableActions.jsx';
import CommonTable from '../../../components/common/CommonTable.jsx';
import TableLayout from '../../../components/common/TableLayout.jsx';
import TableSearch from '../../../components/common/TableSearch.jsx';
import Filter from '../../../components/common/Filter.jsx';
import http from '../../../lib/axios/axios';
import { useConfirm } from '../../../hooks/useConfirm';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';
import Unauthorized from '../../Unauthorized';
import { formatDate } from '../../../utils/methods/formatDate';
import Button from '../../../components/common/Button.jsx';
import { downloadExcel } from '../../../utils/methods/downloadExcel';

const STATUS_STYLES = {
	PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
	APPROVED: 'bg-green-50 text-green-700 border border-green-200',
	REJECTED: 'bg-red-50 text-red-700 border border-red-200',
	CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200'
};

const fmt = formatDate;

const EmployeeLeaveList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const addToast = useSetAtom(addToastAtom);
	const { can, canAll } = usePermissions();

	const canView = can(PERM.EMPLOYEE_LEAVE.LIST);
	const canAdd = canAll(PERM.EMPLOYEE_LEAVE.LIST, PERM.EMPLOYEE_LEAVE.ADD);
	const canEdit = canAll(PERM.EMPLOYEE_LEAVE.LIST, PERM.EMPLOYEE_LEAVE.EDIT);
	const canDelete = canAll(PERM.EMPLOYEE_LEAVE.LIST, PERM.EMPLOYEE_LEAVE.DELETE);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState({
		PENDING: true,
		APPROVED: true,
		REJECTED: true,
		CANCELLED: true
	});

	const activeStatuses = Object.keys(statusFilter).filter(k => statusFilter[k]);
	const statusParam = activeStatuses.length === 4 ? undefined : activeStatuses[0] || undefined;

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.EMPLOYEE_LEAVES.DOWNLOAD_EXCEL,
			fileName: 'employee-leaves.xlsx',
			payload: { search, status: statusParam }
		});
	};

	const { data, loading, mutate } = useAutoRevalidate(API.EMPLOYEE_LEAVES.LIST, {
		page,
		limit: pageSize,
		search: search || undefined,
		status: statusParam
	});

	React.useEffect(() => {
		if (data && !loading && (!data.list || data.list.length === 0) && page > 1) {
			setPage(p => p - 1);
		}
	}, [data, loading, page]);

	const handleDelete = id => {
		confirm({
			title: 'Delete Leave',
			message: 'Are you sure you want to delete this leave record?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					await http.post(API.EMPLOYEE_LEAVES.DELETE(id));
					addToast({ type: 'success', message: 'Leave deleted successfully' });
					mutate();
				} catch {
					addToast({ type: 'error', message: 'Failed to delete leave' });
				}
			}
		});
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
						{item.leave_type_Name || '—'}
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
				key: 'leave_status',
				label: 'Status',
				widthClassName: 'w-[110px]',
				render: item => (
					<span
						className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[item.leave_status] || ''}`}
					>
						{item.leave_status}
					</span>
				)
			},
			{
				key: 'rejection_reason',
				label: 'Reason',
				widthClassName: 'min-w-[140px]',
				render: item => (
					<span className="text-[11px] text-text-2 line-clamp-1">
						{item.rejection_reason || item.comments || <span className="italic text-text-3">—</span>}
					</span>
				)
			},
			{
				key: 'actions',
				label: 'Actions',
				widthClassName: 'w-[100px]',
				render: item => (
					<TableActions
						onEdit={
							canEdit && item.leave_status === 'PENDING'
								? () => navigate(ROUTES.EDIT_EMPLOYEE_LEAVE.replace(':id', item.employee_leave_Id))
								: undefined
						}
						onDelete={
							canDelete && item.leave_status === 'PENDING' ? () => handleDelete(item.employee_leave_Id) : undefined
						}
					/>
				)
			}
		],
		[navigate, page, pageSize, canEdit, canDelete]
	);

	if (!canView) return <Unauthorized />;

	return (
		<TableLayout
			title="Employee Leaves"
			addLabel={canAdd ? 'Apply Leave' : undefined}
			addAction={canAdd ? ROUTES.ADD_EMPLOYEE_LEAVE : undefined}
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
					<Filter options={filterOptions} onChange={id => setStatusFilter(p => ({ ...p, [id]: !p[id] }))} />
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
	);
};

export default EmployeeLeaveList;
