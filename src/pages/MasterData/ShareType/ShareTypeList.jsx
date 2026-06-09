import React, { useMemo, useState, useEffect } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useNavigate } from 'react-router-dom';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Switch from '../../../components/common/Switch.jsx';
import http from '../../../lib/axios/axios';
import CommonTable from '../../../components/common/CommonTable';
import TableSearch from '../../../components/common/TableSearch.jsx';
import TableActions from '../../../components/common/TableActions.jsx';
import { useConfirm } from '../../../hooks/useConfirm';
import TableLayout from '../../../components/common/TableLayout.jsx';
import Filter from '../../../components/common/Filter.jsx';
import Button from '@/components/common/Button';
import { downloadExcel } from '@/utils/methods/downloadExcel';
import Unauthorized from '../../Unauthorized';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';

const ShareTypeList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const { can, canAll } = usePermissions();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'share_type_Id', direction: 'desc' });
	const [search, setSearch] = useState('');
	const [togglingId, setTogglingId] = useState(null);
	const addToast = useSetAtom(addToastAtom);

	const canView = can(PERM.SHARE_TYPE.LIST);
	const canAdd = canAll(PERM.SHARE_TYPE.LIST, PERM.SHARE_TYPE.ADD);
	const canEdit = canAll(PERM.SHARE_TYPE.LIST, PERM.SHARE_TYPE.EDIT);
	const canDelete = canAll(PERM.SHARE_TYPE.LIST, PERM.SHARE_TYPE.DELETE);
	const canStatus = canAll(PERM.SHARE_TYPE.LIST, PERM.SHARE_TYPE.STATUS);
	const canExcel = canAll(PERM.SHARE_TYPE.LIST, PERM.SHARE_TYPE.EXCEL);

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

	const { data, error, loading, mutate } = useAutoRevalidate(API.SHARE_TYPES.LIST, {
		inputData: {
			page,
			limit: pageSize,
			sortBy: sortConfig.key,
			sortOrder: sortConfig.direction,
			search,
			is_active: is_active_val
		}
	});

	const handleSearch = value => {
		setSearch(value);
		setPage(1);
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

	// Auto-paginate back if the current page becomes empty (e.g., after deletion)
	useEffect(() => {
		if (!loading && data?.list?.length === 0 && page > 1) {
			setPage(page - 1);
		}
	}, [data, page, loading]);

	const handleDelete = async id => {
		confirm({
			title: 'Delete Share Type',
			message: 'Are you sure you want to delete this share type?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					const res = await http.post(API.SHARE_TYPES.DELETE(id));
					addToast({ type: 'success', message: res?.msg || 'Share type deleted successfully' });
					mutate();
				} catch (error) {
					console.error('Delete failed:', error);
					addToast({
						type: 'error',
						message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to delete share type'
					});
				}
			}
		});
	};
	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.SHARE_TYPES.DOWNLOAD_EXCEL,
			fileName: 'sharetype.xlsx'
		});
	};

	const handleStatusToggle = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1;
		setTogglingId(id);
		try {
			const res = await http.put(API.SHARE_TYPES.STATUS(id), { inputData: { is_active: newStatus } });
			const updatedList = data?.list?.map(item =>
				item.share_type_Id === id ? { ...item, is_active: newStatus } : item
			);
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

	const columns = useMemo(
		() => [
			{
				key: 'id',
				label: '#',
				widthClassName: 'w-[50px]',
				render: (_, index) => <span>{(page - 1) * pageSize + index + 1}</span>
			},
			{
				key: 'share_type_Name',
				label: 'Share Type Name',
				widthClassName: 'min-w-[200px]'
			},
			{
				key: 'share_type_Description',
				label: 'Description',
				widthClassName: 'min-w-[300px]',
				render: item => (
					<span className="text-text-2">
						{item.share_type_Description || <span className="italic text-text-3">—</span>}
					</span>
				)
			},
			{
				key: 'status',
				label: 'Status',
				widthClassName: 'w-[100px]',
				render: item => (
					<Switch
						checked={item.is_active === 1}
						disabled={!canStatus || togglingId === item.share_type_Id}
						onChange={() => canStatus && handleStatusToggle(item.share_type_Id, item.is_active)}
					/>
				)
			},
			{
				key: 'actions',
				label: 'Actions',
				widthClassName: 'w-[100px]',
				render: item => (
					<TableActions
						onEdit={canEdit ? () => navigate(ROUTES.EDIT_SHARE_TYPE.replace(':id', item.share_type_Id)) : undefined}
						onDelete={canDelete ? () => handleDelete(item.share_type_Id) : undefined}
					/>
				)
			}
		],
		[navigate, page, pageSize, data, togglingId, canEdit, canDelete, canStatus]
	);

	if (!canView) return <Unauthorized />;

	return (
		<TableLayout
			title="Share Types"
			addLabel={canAdd ? 'Add Share Type' : undefined}
			addAction={canAdd ? ROUTES.ADD_SHARE_TYPE : undefined}
			filterContent={
				<div className="flex items-center gap-2">
					<TableSearch onSearch={handleSearch} placeholder="Search by Share Type Name or Description" />
					<Filter options={filterOptions} onChange={handleFilterToggle} />
				</div>
			}
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
		>
			<CommonTable
				columns={columns}
				sortableColumns={['share_type_Name', 'share_type_Description']}
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

export default ShareTypeList;
