import React, { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import ROUTES from '../../../utils/constants/routes';
import { API } from '../../../data/apis/endpoints';
import { addToastAtom } from '../../../data/states/toastAtom';
import { deleteZoneApi, updateZoneStatusApi } from '../../../data/apis';
import { useAutoRevalidate, useConfirm, usePaginationResetOnEmptyPage, usePermissions } from '../../../hooks';
import { downloadExcel, getApiMessage, getErrorMessage } from '../../../utils/methods';
import TableActions from '../../../components/common/TableActions.jsx';
import TableSearch from '../../../components/common/TableSearch.jsx';
import CommonTable from '../../../components/common/CommonTable.jsx';
import TableLayout from '../../../components/common/TableLayout.jsx';
import Switch from '../../../components/common/Switch.jsx';
import Button from '@/components/common/Button';
import Filter from '../../../components/common/Filter.jsx';
import Unauthorized from '../../Unauthorized';
import { PERM } from '../../../utils/constants/permissionKeys';

const ZoneList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const addToast = useSetAtom(addToastAtom);
	const { can, canAll } = usePermissions();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({
		key: 'zone_Id',
		direction: 'desc'
	});
	const [search, setSearch] = useState('');
	const [togglingId, setTogglingId] = useState(null);
	const [activeFilter, setActiveFilter] = useState({
		active: true,
		inactive: true
	});

	const canView = can(PERM.ZONE.LIST);
	const canAdd = canAll(PERM.ZONE.LIST, PERM.ZONE.ADD);
	const canEdit = canAll(PERM.ZONE.LIST, PERM.ZONE.EDIT);
	const canDelete = canAll(PERM.ZONE.LIST, PERM.ZONE.DELETE);
	const canStatus = canAll(PERM.ZONE.LIST, PERM.ZONE.STATUS);

	const isActiveValue = useMemo(() => {
		if (activeFilter.active && !activeFilter.inactive) return 1;
		if (activeFilter.inactive && !activeFilter.active) return 0;
		if (!activeFilter.active && !activeFilter.inactive) return -1;
		return undefined;
	}, [activeFilter]);

	const filterOptions = useMemo(
		() => [
			{ id: 'active', label: 'Active', checked: activeFilter.active },
			{ id: 'inactive', label: 'Inactive', checked: activeFilter.inactive }
		],
		[activeFilter]
	);

	const { data, loading, mutate } = useAutoRevalidate(API.ZONES.LIST, {
		page,
		limit: pageSize,
		sortBy: sortConfig.key,
		sortOrder: sortConfig.direction,
		search,
		is_active: isActiveValue
	});

	usePaginationResetOnEmptyPage(data, loading, page, setPage);

	const handleSearch = value => {
		setSearch(value);
		setPage(1);
	};

	const handleFilterToggle = id => {
		setActiveFilter(previousFilter => ({
			...previousFilter,
			[id]: !previousFilter[id]
		}));
		setPage(1);
	};

	const handleDelete = zoneId => {
		confirm({
			title: 'Delete Zone',
			message: 'Are you sure you want to delete this zone?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					const response = await deleteZoneApi(zoneId);

					addToast({
						type: 'success',
						message: getApiMessage(response, 'Zone deleted successfully')
					});

					if (data?.list?.length === 1 && page > 1) {
						setPage(currentPage => currentPage - 1);
					} else {
						mutate();
					}
				} catch (error) {
					addToast({
						type: 'error',
						message: getErrorMessage(error, 'Failed to delete zone')
					});
				}
			}
		});
	};

	const handleStatusToggle = async (zoneId, currentStatus) => {
		const nextStatus = currentStatus === 1 ? 0 : 1;

		setTogglingId(zoneId);

		try {
			const res = await updateZoneStatusApi(zoneId, nextStatus);

			const updatedList = data?.list?.map(item =>
				item.zone_Id === zoneId ? { ...item, is_active: nextStatus } : item
			);

			if (updatedList) {
				mutate({ ...data, list: updatedList }, false);
				addToast({ type: 'success', message: res?.msg || 'Status updated successfully.' });
			}
		} catch (error) {
			addToast({
				type: 'error',
				message: getErrorMessage(error, 'Failed to update status')
			});
		} finally {
			setTogglingId(null);
		}
	};

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.ZONES.DOWNLOAD_EXCEL,
			fileName: 'zones.xlsx'
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
				key: 'zone_Name',
				label: 'Zone Name',
				widthClassName: 'min-w-[200px]'
			},
			{
				key: 'status',
				label: 'Status',
				widthClassName: 'w-[100px]',
				render: item => (
					<Switch
						checked={item.is_active === 1}
						disabled={!canStatus || togglingId === item.zone_Id}
						onChange={() => {
							if (!canStatus) return;
							handleStatusToggle(item.zone_Id, item.is_active);
						}}
					/>
				)
			},
			{
				key: 'actions',
				label: 'Actions',
				widthClassName: 'w-[100px]',
				render: item => (
					<TableActions
						onEdit={canEdit ? () => navigate(ROUTES.EDIT_ZONE.replace(':id', item.zone_Id)) : undefined}
						onDelete={canDelete ? () => handleDelete(item.zone_Id) : undefined}
					/>
				)
			}
		],
		[canDelete, canEdit, canStatus, navigate, page, pageSize, togglingId, data]
	);

	if (!canView) return <Unauthorized />;

	return (
		<TableLayout
			title="Zones"
			addLabel={canAdd ? 'Add Zone' : undefined}
			addAction={canAdd ? ROUTES.ADD_ZONE : undefined}
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
					<TableSearch onSearch={handleSearch} placeholder="Search by Zone Name" />
					<Filter options={filterOptions} onChange={handleFilterToggle} />
				</div>
			}
		>
			<CommonTable
				columns={columns}
				sortableColumns={['zone_Name']}
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

export default ZoneList;
