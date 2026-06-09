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

const DocChargeServiceTypeList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const { can, canAll } = usePermissions();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'doc_charge_service_type_Id', direction: 'desc' });
	const [search, setSearch] = useState('');
	const [togglingId, setTogglingId] = useState(null);
	const addToast = useSetAtom(addToastAtom);

	const [activeFilter, setActiveFilter] = useState({
		active: true,
		inactive: true
	});

	const canView = can(PERM.CHARGE_SERVICE_TYPE.LIST);
	const canAdd = canAll(PERM.CHARGE_SERVICE_TYPE.LIST, PERM.CHARGE_SERVICE_TYPE.ADD);
	const canEdit = canAll(PERM.CHARGE_SERVICE_TYPE.LIST, PERM.CHARGE_SERVICE_TYPE.EDIT);
	const canDelete = canAll(PERM.CHARGE_SERVICE_TYPE.LIST, PERM.CHARGE_SERVICE_TYPE.DELETE);
	const canStatus = canAll(PERM.CHARGE_SERVICE_TYPE.LIST, PERM.CHARGE_SERVICE_TYPE.STATUS);
	const canExcel = canAll(PERM.CHARGE_SERVICE_TYPE.LIST, PERM.CHARGE_SERVICE_TYPE.EXCEL);

	const is_active_val = useMemo(() => {
		if (activeFilter.active && !activeFilter.inactive) return 1;
		if (activeFilter.inactive && !activeFilter.active) return 0;
		if (!activeFilter.active && !activeFilter.inactive) return -1;
		return undefined;
	}, [activeFilter]);

	const { data, loading, mutate } = useAutoRevalidate(API.DOC_CHARGE_SERVICE_TYPE.LIST, {
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
			title: 'Delete Charge Service Type',
			message: 'Are you sure you want to delete this charge service type?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					const res = await http.delete(API.DOC_CHARGE_SERVICE_TYPE.DELETE(id));
					addToast({ type: 'success', message: res?.data?.msg || 'Charge service type deleted successfully' });
					if (data?.list?.length === 1 && page > 1) {
						setPage(p => p - 1);
					} else {
						mutate();
					}
				} catch (error) {
					console.error('Delete failed:', error);
					addToast({
						type: 'error',
						message:
							error?.response?.data?.msg || error?.response?.data?.message || 'Failed to delete charge service type'
					});
				}
			}
		});
	};

	const handleStatusToggle = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1;
		setTogglingId(id);
		try {
			await http.put(API.DOC_CHARGE_SERVICE_TYPE.STATUS(id), { inputData: { is_active: newStatus } });
			const updatedList = data?.list?.map(item =>
				item.doc_charge_service_type_Id === id ? { ...item, is_active: newStatus } : item
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
			url: API.DOC_CHARGE_SERVICE_TYPE.DOWNLOAD_EXCEL,
			fileName: 'doc_charge_service_types.xlsx'
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
					key: 'doc_charge_service_type_Name',
					label: 'Name',
					widthClassName: 'min-w-[180px]',
					render: item => <span className="font-semibold text-text-1">{item.doc_charge_service_type_Name}</span>
				},
				{
					key: 'doc_charge_service_type_Description',
					label: 'Description',
					widthClassName: 'min-w-[250px]',
					render: item => (
						<span className="text-text-2">
							{item.doc_charge_service_type_Description || <span className="italic text-text-3">—</span>}
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
							disabled={!canStatus || togglingId === item.doc_charge_service_type_Id}
							onChange={() => {
								if (!canStatus) return;
								handleStatusToggle(item.doc_charge_service_type_Id, item.is_active);
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
								navigate(ROUTES.EDIT_DOCTOR_MASTER_CHARGE_SERVICE_TYPE.replace(':id', item.doc_charge_service_type_Id))
								: undefined
							}
							onDelete={canDelete ? () => handleDelete(item.doc_charge_service_type_Id) : undefined}
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
			title="Charge Service Types"
			addLabel={canAdd ? "Add Charge Service Type" : undefined}
			addAction={canAdd ? ROUTES.ADD_DOCTOR_MASTER_CHARGE_SERVICE_TYPE : undefined}
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
						<TableSearch onSearch={handleSearch} placeholder="Search by Name or Description" />
						<Filter options={filterOptions} onChange={handleFilterToggle} />
					</div>
				) : undefined
			}
		>
			<CommonTable
				columns={columns}
				sortableColumns={['doc_charge_service_type_Name', 'doc_charge_service_type_Description']}
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

export default DocChargeServiceTypeList;
