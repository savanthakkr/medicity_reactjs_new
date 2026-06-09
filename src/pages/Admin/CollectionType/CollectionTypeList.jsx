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
import http from '../../../lib/axios/axios';
import { useConfirm } from '../../../hooks/useConfirm';
import TableLayout from '../../../components/common/TableLayout.jsx';
import Switch from '../../../components/common/Switch.jsx';
import TableSearch from '../../../components/common/TableSearch.jsx';
import Filter from '../../../components/common/Filter.jsx';

import { downloadExcel } from '@/utils/methods/downloadExcel';
import Button from '@/components/common/Button';
import Unauthorized from '../../Unauthorized';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';

const CollectionTypeList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const addToast = useSetAtom(addToastAtom);
	const { can, canAll } = usePermissions();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
	const [togglingId, setTogglingId] = useState(null);

	const canView = can(PERM.COLLECTION_TYPE.LIST);
	const canAdd = canAll(PERM.COLLECTION_TYPE.LIST, PERM.COLLECTION_TYPE.ADD);
	const canEdit = canAll(PERM.COLLECTION_TYPE.LIST, PERM.COLLECTION_TYPE.EDIT);
	const canDelete = canAll(PERM.COLLECTION_TYPE.LIST, PERM.COLLECTION_TYPE.DELETE);
	const [search, setSearch] = useState('');

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

	const { data, loading, mutate } = useAutoRevalidate(API.COLLECTION_TYPES.LIST, {
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

	// Auto-redirect if current page becomes empty (e.g. after deletion)
	React.useEffect(() => {
		if (data && !loading && (!data.list || data.list.length === 0) && page > 1) {
			setPage(p => p - 1);
		}
	}, [data, loading, page]);

	const handleDelete = async id => {
		confirm({
			title: 'Delete Collection Type',
			message: 'Are you sure you want to delete this collection type?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					const res = await http.delete(API.COLLECTION_TYPES.DELETE(id));
					addToast({ type: 'success', message: res?.msg || 'Collection type deleted successfully' });
					// If this was the only item on the current page, go back one page
					if (data?.list?.length === 1 && page > 1) {
						setPage(p => p - 1);
					} else {
						mutate();
					}
				} catch (error) {
					console.error('Delete failed:', error);
					addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to delete collection type' });
				}
			}
		});
	};

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.COLLECTION_TYPES.DOWNLOAD_EXCEL,
			fileName: 'collection-types.xlsx',
			payload: {
				search,
				is_active: is_active_val
			}
		});
	};

	const handleStatusToggle = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1;
		setTogglingId(id);
		try {
			const res = await http.put(API.COLLECTION_TYPES.STATUS(id), { inputData: { is_active: newStatus } });
			const updatedList = data?.list?.map(item =>
				item.collection_type_Id === id ? { ...item, is_active: newStatus } : item
			);
			if (updatedList) {
				mutate({ ...data, list: updatedList }, false);
				addToast({ type: 'success', message: res?.msg || 'Status updated successfully.' });
			}
		} catch (error) {
			console.error('Status update failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to update status' });
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
				key: 'collection_type_Name',
				label: 'Collection Type Name',
				widthClassName: 'min-w-[200px]'
			},
			{
				key: 'collection_type_Description',
				label: 'Description',
				widthClassName: 'min-w-[300px]',
				render: item => <span>{item.collection_type_Description || '—'}</span>
			},

			{
				key: 'status',
				label: 'Status',
				widthClassName: 'w-[100px]',
				render: item => (
					<Switch
						checked={item.is_active === 1}
						disabled={togglingId === item.collection_type_Id}
						onChange={() => handleStatusToggle(item.collection_type_Id, item.is_active)}
					/>
				)
			},
			{
				key: 'actions',
				label: 'Actions',
				widthClassName: 'w-[100px]',
				render: item => (
					<TableActions
						onEdit={
							canEdit ? () => navigate(ROUTES.EDIT_COLLECTION_TYPE.replace(':id', item.collection_type_Id)) : undefined
						}
						onDelete={canDelete ? () => handleDelete(item.collection_type_Id) : undefined}
					/>
				)
			}
		],
		[navigate, page, pageSize, data, togglingId, canEdit, canDelete]
	);

	if (!canView) return <Unauthorized />;

	return (
		<TableLayout
			title="Collection Types"
			addLabel={canAdd ? 'Add Collection Type' : undefined}
			addAction={canAdd ? ROUTES.ADD_COLLECTION_TYPE : undefined}
			extraAction={
				<Button
					variant="unstyled"
					onClick={handleDownloadExcel}
					className="inline-flex h-[29px] items-center rounded-[6px] border border-[#1eafc0] bg-transparent px-[13px] py-[6px] font-semibold leading-none text-text-1 transition hover:brightness-95"
					style={{ fontSize: 'var(--entity-add-text)' }}
				>
					Download Excel
				</Button>
			}
			filterContent={
				<div className="flex items-center gap-2">
					<TableSearch onSearch={handleSearch} placeholder="Search by Collection Type Name and Description" />
					<Filter options={filterOptions} onChange={handleFilterToggle} />
				</div>
			}
		>
			<CommonTable
				columns={columns}
				sortableColumns={['collection_type_Name', 'collection_type_Description']}
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

export default CollectionTypeList;
