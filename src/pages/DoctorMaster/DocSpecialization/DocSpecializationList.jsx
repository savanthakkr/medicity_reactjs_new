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
import Button from '@/components/common/Button';
import Switch from '../../../components/common/Switch.jsx';
import Filter from '../../../components/common/Filter.jsx';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKey2';
import Unauthorized from '../../Unauthorized';

const DocSpecializationList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const { can, canAll } = usePermissions();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'doc_specialization_master_Id', direction: 'desc' });
	const [search, setSearch] = useState('');
	const [togglingId, setTogglingId] = useState(null);
	const addToast = useSetAtom(addToastAtom);

	const [activeFilter, setActiveFilter] = useState({
		active: true,
		inactive: true
	});

	const canView = can(PERM.SPECIALIZATION.LIST);
	const canAdd = canAll(PERM.SPECIALIZATION.LIST, PERM.SPECIALIZATION.ADD);
	const canEdit = canAll(PERM.SPECIALIZATION.LIST, PERM.SPECIALIZATION.EDIT);
	const canDelete = canAll(PERM.SPECIALIZATION.LIST, PERM.SPECIALIZATION.DELETE);
	const canStatus = canAll(PERM.SPECIALIZATION.LIST, PERM.SPECIALIZATION.STATUS);
	const canExcel = canAll(PERM.SPECIALIZATION.LIST, PERM.SPECIALIZATION.EXCEL);

	const is_active_val = useMemo(() => {
		if (activeFilter.active && !activeFilter.inactive) return 1;
		if (activeFilter.inactive && !activeFilter.active) return 0;
		if (!activeFilter.active && !activeFilter.inactive) return -1;
		return undefined;
	}, [activeFilter]);

	const { data, loading, mutate } = useAutoRevalidate(API.DOC_SPECIALIZATION_MASTER.LIST, {
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
			title: 'Delete Specialization',
			message: 'Are you sure you want to delete this specialization?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					const res = await http.delete(API.DOC_SPECIALIZATION_MASTER.DELETE(id));
					addToast({ type: 'success', message: res?.data?.msg || 'Specialization deleted successfully' });
					if (data?.list?.length === 1 && page > 1) {
						setPage(p => p - 1);
					} else {
						mutate();
					}
				} catch (error) {
					console.error('Delete failed:', error);
					addToast({
						type: 'error',
						message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to delete specialization'
					});
				}
			}
		});
	};

	const handleStatusToggle = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1;
		setTogglingId(id);
		try {
			await http.put(API.DOC_SPECIALIZATION_MASTER.STATUS(id), { inputData: { is_active: newStatus } });
			const updatedList = data?.list?.map(item =>
				item.doc_specialization_master_Id === id ? { ...item, is_active: newStatus } : item
			);
			if (updatedList) {
				mutate({ ...data, list: updatedList }, false);
			}
			addToast({ type: 'success', message: 'Status updated successfully' });
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
			url: API.DOC_SPECIALIZATION_MASTER.DOWNLOAD_EXCEL,
			fileName: 'doc_specializations.xlsx'
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
					key: 'doc_specialization_master_Code',
					label: 'Code',
					widthClassName: 'min-w-[120px]',
					render: item => <span className="font-bold text-text-1">{item.doc_specialization_master_Code}</span>
				},
				{
					key: 'doc_specialization_master_Name',
					label: 'Specialization Name',
					widthClassName: 'min-w-[180px]',
					render: item => <span className="font-semibold text-text-1">{item.doc_specialization_master_Name}</span>
				},
				{
					key: 'department_Name',
					label: 'Department',
					widthClassName: 'min-w-[150px]',
					render: item => <span>{item.department_Name || <span className="italic text-text-3">—</span>}</span>
				},
				{
					key: 'doc_specialization_master_Description',
					label: 'Description',
					widthClassName: 'min-w-[200px]',
					render: item => (
						<span className="text-text-2">
							{item.doc_specialization_master_Description || <span className="italic text-text-3">—</span>}
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
							disabled={!canStatus || togglingId === item.doc_specialization_master_Id}
							onChange={() => {
								if (!canStatus) return;
								handleStatusToggle(item.doc_specialization_master_Id, item.is_active);
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
							onEdit={canEdit ? () =>
								navigate(ROUTES.EDIT_DOCTOR_MASTER_SPECIALIZATION.replace(':id', item.doc_specialization_master_Id))
								: undefined
							}
							onDelete={canDelete ? () => handleDelete(item.doc_specialization_master_Id) : undefined}
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
			title="Specializations"
			addLabel={canAdd ? "Add Specialization" : undefined}
			addAction={canAdd ? ROUTES.ADD_DOCTOR_MASTER_SPECIALIZATION : undefined}
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
						<TableSearch onSearch={handleSearch} placeholder="Search by Specialization Name or Code" />
						<Filter options={filterOptions} onChange={handleFilterToggle} />
					</div>
				) : undefined
			}
		>
			<CommonTable
				columns={columns}
				sortableColumns={[
					'doc_specialization_master_Code',
					'doc_specialization_master_Name',
					'department_Name',
					'doc_specialization_master_Description'
				]}
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

export default DocSpecializationList;
