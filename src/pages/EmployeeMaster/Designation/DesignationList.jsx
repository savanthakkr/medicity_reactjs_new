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
import Filter from '../../../components/common/Filter.jsx';
import Switch from '../../../components/common/Switch.jsx';
import CommonTable from '../../../components/common/CommonTable.jsx';
import http from '../../../lib/axios/axios';
import { useConfirm } from '../../../hooks/useConfirm';
import TableLayout from '../../../components/common/TableLayout.jsx';
import Unauthorized from '../../Unauthorized';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';
import Button from '../../../components/common/Button';
import { downloadExcel } from '../../../utils/methods/downloadExcel';

const DesignationList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const { canAll, can } = usePermissions();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [search, setSearch] = useState('');
	const [togglingId, setTogglingId] = useState(null);
	const addToast = useSetAtom(addToastAtom);

	const [activeFilter, setActiveFilter] = useState({ active: true, inactive: true });

	const is_active_val = useMemo(() => {
		if (activeFilter.active && !activeFilter.inactive) return 1;
		if (activeFilter.inactive && !activeFilter.active) return 0;
		if (!activeFilter.active && !activeFilter.inactive) return -1;
		return undefined;
	}, [activeFilter]);

	const canView = can(PERM.DESIGNATION.LIST);
	const canAdd = canAll(PERM.DESIGNATION.LIST, PERM.DESIGNATION.ADD);
	const canEdit = canAll(PERM.DESIGNATION.LIST, PERM.DESIGNATION.EDIT);
	const canDelete = canAll(PERM.DESIGNATION.LIST, PERM.DESIGNATION.DELETE);

	const { data, loading, mutate } = useAutoRevalidate(API.DESIGNATIONS.LIST, {
		page,
		limit: pageSize,
		search,
		is_active: is_active_val
	});

	const handleSearch = value => {
		setSearch(value);
		setPage(1);
	};

	React.useEffect(() => {
		if (data && !loading && (!data.list || data.list.length === 0) && page > 1) {
			setPage(p => p - 1);
		}
	}, [data, loading, page]);

	const handleDelete = async id => {
		confirm({
			title: 'Delete Designation',
			message: 'Are you sure you want to delete this designation?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					await http.delete(API.DESIGNATIONS.DELETE(id));
					if (data?.list?.length === 1 && page > 1) {
						setPage(p => p - 1);
					} else {
						mutate();
					}
				} catch (error) {
					console.error('Delete failed:', error);
				}
			}
		});
	};

	const handleStatusToggle = async item => {
		const newStatus = item.is_active === 1 ? 0 : 1;
		setTogglingId(item.designation_Id);
		try {
			const res = await http.put(API.DESIGNATIONS.STATUS(item.designation_Id));
			const updatedList = data?.list?.map(d =>
				d.designation_Id === item.designation_Id ? { ...d, is_active: newStatus } : d
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

	const filterOptions = useMemo(
		() => [
			{ id: 'active', label: 'Active', checked: activeFilter.active },
			{ id: 'inactive', label: 'Inactive', checked: activeFilter.inactive }
		],
		[activeFilter]
	);

	const handleFilterToggle = id => {
		setActiveFilter(prev => ({ ...prev, [id]: !prev[id] }));
		setPage(1);
	};

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.DESIGNATIONS.DOWNLOAD_EXCEL,
			fileName: 'designations.xlsx',
			payload: { search, is_active: is_active_val }
		});
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
				key: 'designation_Name',
				label: 'Designation Name',
				widthClassName: 'min-w-[180px]',
				render: item => <span className="font-bold text-text-1">{item.designation_Name}</span>
			},
			{
				key: 'department_Name',
				label: 'Department',
				widthClassName: 'min-w-[160px]',
				render: item => <span>{item.department_Name || <span className="italic text-text-3">—</span>}</span>
			},
			{
				key: 'designation_Description',
				label: 'Description',
				widthClassName: 'min-w-[200px]',
				render: item => (
					<span className="text-text-2">
						{item.designation_Description || <span className="italic text-text-3">—</span>}
					</span>
				)
			},
			{
				key: 'status',
				label: 'Status',
				widthClassName: 'w-[100px]',
				render: item =>
					canAll(PERM.DESIGNATION.LIST, PERM.DESIGNATION.STATUS) ? (
						<Switch
							checked={item.is_active === 1}
							disabled={togglingId === item.designation_Id}
							onChange={() => handleStatusToggle(item)}
						/>
					) : (
						<span className="text-[11px] text-text-3 italic">{item.is_active === 1 ? 'Active' : 'Inactive'}</span>
					)
			},
			{
				key: 'actions',
				label: 'Actions',
				widthClassName: 'w-[100px]',
				render: item => (
					<TableActions
						onEdit={canEdit ? () => navigate(ROUTES.EDIT_DESIGNATION.replace(':id', item.designation_Id)) : undefined}
						onDelete={canDelete ? () => handleDelete(item.designation_Id) : undefined}
					/>
				)
			}
		],
		[navigate, page, pageSize, togglingId, canEdit, canDelete]
	);

	if (!canView) {
		return <Unauthorized />;
	}

	return (
		<TableLayout
			title="Designations"
			addLabel={canAdd ? 'Add Designation' : undefined}
			addAction={canAdd ? ROUTES.ADD_DESIGNATION : undefined}
			extraAction={
				canAll(PERM.DESIGNATION.LIST, PERM.DESIGNATION.EXCEL) ? (
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
					<TableSearch onSearch={handleSearch} placeholder="Search by Designation Name" />
					<Filter options={filterOptions} onChange={handleFilterToggle} />
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
				onPageSizeChange={size => {
					setPageSize(size);
					setPage(1);
				}}
			/>
		</TableLayout>
	);
};

export default DesignationList;
