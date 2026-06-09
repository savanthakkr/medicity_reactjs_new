import React, { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../../utils/constants/routes';
import { API } from '../../../data/apis/endpoints';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import TableActions from '../../../components/common/TableActions.jsx';
import TableSearch from '../../../components/common/TableSearch.jsx';
import CommonTable from '../../../components/common/CommonTable.jsx';
import http from '../../../lib/axios/axios';
import { useConfirm } from '../../../hooks/useConfirm';
import TableLayout from '../../../components/common/TableLayout.jsx';
import { downloadExcel } from '@/utils/methods/downloadExcel';
import Switch from '../../../components/common/Switch.jsx';
import Button from '@/components/common/Button';
import Filter from '../../../components/common/Filter.jsx';
import Unauthorized from '../../Unauthorized';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';

const BranchList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const { can, canAll } = usePermissions();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'branch_Id', direction: 'desc' });
	const [search, setSearch] = useState('');
	const [togglingId, setTogglingId] = useState(null);
	const addToast = useSetAtom(addToastAtom);

	const canView = can(PERM.BRANCH.LIST);
	const canAdd = canAll(PERM.BRANCH.LIST, PERM.BRANCH.ADD);
	const canEdit = canAll(PERM.BRANCH.LIST, PERM.BRANCH.EDIT);
	const canDelete = canAll(PERM.BRANCH.LIST, PERM.BRANCH.DELETE);
	const canStatus = canAll(PERM.BRANCH.LIST, PERM.BRANCH.STATUS);
	const canExcel = canAll(PERM.BRANCH.LIST, PERM.BRANCH.EXCEL);

	const [activeFilter, setActiveFilter] = useState({
		active: true,
		inactive: true
	});

	const is_active_val = useMemo(() => {
		if (activeFilter.active && !activeFilter.inactive) return 1;
		if (activeFilter.inactive && !activeFilter.active) return 0;
		if (!activeFilter.active && !activeFilter.inactive) return -1;
		return undefined;
	}, [activeFilter]);

	const { data, loading, mutate } = useAutoRevalidate(API.BRANCHES.LIST, {
		page,
		limit: pageSize,
		sortBy: sortConfig.key,
		sortOrder: sortConfig.direction,
		search,
		is_active: is_active_val
	});

	const handleSearch = value => {
		setSearch(value);
		setPage(1);
	};

	// Auto-redirect if current page becomes empty (e.g. after deletion)
	React.useEffect(() => {
		if (data && !loading && (!data.list || data.list.length === 0) && page > 1) {
			setPage(p => p - 1);
		}
	}, [data, loading, page]);

	const handleDelete = async id => {
		confirm({
			title: 'Delete Branch',
			message: 'Are you sure you want to delete this branch?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					const res = await http.delete(API.BRANCHES.DELETE(id));
					addToast({ type: 'success', message: res?.msg || 'Branch deleted successfully' });
					// If this was the only item on the current page, go back one page
					if (data?.list?.length === 1 && page > 1) {
						setPage(p => p - 1);
					} else {
						mutate();
					}
				} catch (error) {
					console.error('Delete failed:', error);
					addToast({
						type: 'error',
						message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to delete branch'
					});
				}
			}
		});
	};

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.BRANCHES.DOWNLOAD_EXCEL,
			fileName: 'branches.xlsx'
		});
	};

	const handleStatusToggle = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1;
		setTogglingId(id);
		try {
			const res = await http.put(API.BRANCHES.STATUS(id), { inputData: { is_active: newStatus } });
			// Optimistic update
			const updatedList = data?.list?.map(item => (item.branch_Id === id ? { ...item, is_active: newStatus } : item));
			if (updatedList) {
				mutate({ ...data, list: updatedList }, false);
				addToast({ type: 'success', message: res?.msg || 'Status updated successfully.' });
			}
		} catch (error) {
			console.error('Status update failed:', error);
			addToast({
				type: 'error',
				message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to update status'
			});
		} finally {
			setTogglingId(null);
		}
	};

	const filterOptions = useMemo(
		() => [
			{ id: 'active', label: 'Active', checked: activeFilter.active },
			{ id: 'inactive', label: 'Inactive', checked: activeFilter.inactive }
		],
		[activeFilter]
	);

	const handleFilterToggle = id => {
		setActiveFilter(prev => ({
			...prev,
			[id]: !prev[id]
		}));
		setPage(1);
	};

	const columns = useMemo(
		() => [
			{
				key: 'id',
				label: '#',
				widthClassName: 'w-[50px]',
				render: (_, index) => <span>{(page - 1) * pageSize + index + 1}</span>
			},
			{
				key: 'branch_Name',
				label: 'Branch Name',
				widthClassName: 'min-w-[200px]'
			},
			{
				key: 'branch_Code',
				label: 'Code',
				widthClassName: 'min-w-[100px]',
				render: item => <span>{item.branch_Code || <span className="italic text-text-3">—</span>}</span>
			},
			{
				key: 'branch_City',
				label: 'City',
				widthClassName: 'min-w-[130px]',
				render: item => (
					<span className="text-text-2">{item.branch_City || <span className="italic text-text-3">—</span>}</span>
				)
			},
			{
				key: 'branch_State',
				label: 'State',
				widthClassName: 'min-w-[130px]',
				render: item => (
					<span className="text-text-2">{item.branch_State || <span className="italic text-text-3">—</span>}</span>
				)
			},
			{
				key: 'branch_Zone',
				label: 'Zone',
				widthClassName: 'min-w-[130px]',
				render: item => (
					<span className="text-text-2">{item.branch_Zone || <span className="italic text-text-3">—</span>}</span>
				)
			},
			{
				key: 'branch_PinCode',
				label: 'Pin Code',
				widthClassName: 'min-w-[100px]',
				render: item => (
					<span className="text-text-2">{item.branch_PinCode || <span className="italic text-text-3">—</span>}</span>
				)
			},
			{
				key: 'status',
				label: 'Status',
				widthClassName: 'w-[100px]',
				render: item => (
					<Switch
						checked={item.is_active === 1}
						disabled={!canStatus || togglingId === item.branch_Id}
						onChange={() => canStatus && handleStatusToggle(item.branch_Id, item.is_active)}
					/>
				)
			},
			{
				key: 'actions',
				label: 'Actions',
				widthClassName: 'w-[100px]',
				render: item => (
					<TableActions
						onEdit={canEdit ? () => navigate(ROUTES.EDIT_BRANCH.replace(':id', item.branch_Id)) : undefined}
						onDelete={canDelete ? () => handleDelete(item.branch_Id) : undefined}
					/>
				)
			}
		],
		[navigate, page, pageSize, data, togglingId, canEdit, canDelete, canStatus]
	);

	if (!canView) return <Unauthorized />;

	return (
		<TableLayout
			title="Branches"
			addLabel={canAdd ? 'Add Branch' : undefined}
			addAction={canAdd ? ROUTES.ADD_BRANCH : undefined}
			extraAction={
				canExcel ? (
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
					<TableSearch onSearch={handleSearch} placeholder="Search by Branch Name" />
					<Filter options={filterOptions} onChange={handleFilterToggle} />
				</div>
			}
		>
			<CommonTable
				columns={columns}
				sortableColumns={['branch_Name', 'branch_City', 'branch_State', 'branch_Zone']}
				sortConfig={sortConfig}
				onSortChange={setSortConfig}
				data={data?.list || []}
				loading={loading}
				currentPage={page}
				totalPages={data?.totalPages || 1}
				pageSize={pageSize}
				totalItems={data?.totalItems || 0}
				onPageChange={setPage}
				onPageSizeChange={size => {
					setPageSize(size);
					setPage(1);
				}}
			/>
		</TableLayout>
	);
};

export default BranchList;
