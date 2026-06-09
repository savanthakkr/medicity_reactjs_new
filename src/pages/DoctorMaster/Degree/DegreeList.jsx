import React, { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../../utils/constants/routes';
import { API } from '../../../data/apis/endpoints';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import { useAutoRevalidate, useConfirm, usePermissions } from '../../../hooks';
import TableActions from '../../../components/common/TableActions.jsx';
import TableSearch from '../../../components/common/TableSearch.jsx';
import CommonTable from '../../../components/common/CommonTable.jsx';
import http from '../../../lib/axios/axios';

import TableLayout from '../../../components/common/TableLayout.jsx';
import { downloadExcel } from '@/utils/methods/downloadExcel';
import Button from '@/components/common/Button';
import Switch from '../../../components/common/Switch.jsx';
import Filter from '../../../components/common/Filter.jsx';
import Unauthorized from '../../Unauthorized';
import { PERM } from '../../../utils/constants/permissionKey2';

const DegreeList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const { can, canAll } = usePermissions();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'degree_Id', direction: 'desc' });
	const [search, setSearch] = useState('');
	const [togglingId, setTogglingId] = useState(null);
	const addToast = useSetAtom(addToastAtom);

	const [activeFilter, setActiveFilter] = useState({
		active: true,
		inactive: true
	});

	const canView = can(PERM.DEGREE.LIST);
	const canAdd = canAll(PERM.DEGREE.LIST, PERM.DEGREE.ADD);
	const canEdit = canAll(PERM.DEGREE.LIST, PERM.DEGREE.EDIT);
	const canDelete = canAll(PERM.DEGREE.LIST, PERM.DEGREE.DELETE);
	const canStatus = canAll(PERM.DEGREE.LIST, PERM.DEGREE.STATUS);
	const canExcel = canAll(PERM.DEGREE.LIST, PERM.DEGREE.EXCEL);

	const is_active_val = useMemo(() => {
		if (activeFilter.active && !activeFilter.inactive) return 1;
		if (activeFilter.inactive && !activeFilter.active) return 0;
		if (!activeFilter.active && !activeFilter.inactive) return -1;
		return undefined;
	}, [activeFilter]);

	const { data, loading, mutate } = useAutoRevalidate(API.DEGREES.LIST, {
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
			title: 'Delete Degree',
			message: 'Are you sure you want to delete this degree?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					const res = await http.delete(API.DEGREES.DELETE(id));
					addToast({ type: 'success', message: res?.data?.msg || 'Degree deleted successfully' });
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
						message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to delete degree'
					});
				}
			}
		});
	};

	const handleStatusToggle = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1;
		setTogglingId(id);
		try {
			await http.put(API.DEGREES.STATUS(id), { inputData: { is_active: newStatus } });
			// Optimistic update
			const updatedList = data?.list?.map(item => (item.degree_Id === id ? { ...item, is_active: newStatus } : item));
			if (updatedList) {
				mutate({ ...data, list: updatedList }, false);
				addToast({ type: 'success', message: 'Status updated successfully.' });
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

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.DEGREES.DOWNLOAD_EXCEL,
			fileName: 'degrees.xlsx'
		});
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
		() => {
			const cols = [
				{
					key: 'id',
					label: '#',
					widthClassName: 'w-[50px]',
					render: (_, index) => <span>{(page - 1) * pageSize + index + 1}</span>
				},
				{
					key: 'degree_Name',
					label: 'Degree Name',
					widthClassName: 'min-w-[200px]'
				},
				{
					key: 'status',
					label: 'Status',
					widthClassName: 'w-[100px]',
					render: item => (
						<Switch
							checked={item.is_active === 1}
							disabled={!canStatus || togglingId === item.degree_Id}
							onChange={() => {
								if (!canStatus) return;
								handleStatusToggle(item.degree_Id, item.is_active);
							}}
						/>
					)
				}
			];

			if (canEdit || canDelete) {
				cols.push({
					key: 'actions',
					label: 'Actions',
					widthClassName: 'w-[100px]',
					render: item => (
						<TableActions
							onEdit={canEdit ? () => navigate(ROUTES.EDIT_DOCTOR_MASTER_DEGREE.replace(':id', item.degree_Id)) : undefined}
							onDelete={canDelete ? () => handleDelete(item.degree_Id) : undefined}
						/>
					)
				});
			}

			return cols;
		},
		[navigate, page, pageSize, data, togglingId, canEdit, canDelete, canStatus]
	);

	if (!canView) return <Unauthorized />;

	return (
		<TableLayout
			title="Degrees"
			addLabel={canAdd ? 'Add Degree' : undefined}
			addAction={canAdd ? ROUTES.ADD_DOCTOR_MASTER_DEGREE : undefined}
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
				canView ? (
					<div className="flex items-center gap-2">
						<TableSearch onSearch={handleSearch} placeholder="Search by Degree Name" />
						<Filter options={filterOptions} onChange={handleFilterToggle} />
					</div>
				) : undefined
			}
		>
			<CommonTable
				columns={columns}
				sortableColumns={['degree_Name']}
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

export default DegreeList;
