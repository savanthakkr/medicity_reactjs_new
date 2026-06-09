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
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';
import TableLayout from '../../../components/common/TableLayout.jsx';
// import Button from "@mui/material/Button";
import { downloadExcel } from '@/utils/methods/downloadExcel';
import Button from '@/components/common/Button';
import Switch from '../../../components/common/Switch.jsx';
import Filter from '../../../components/common/Filter.jsx';

const StateList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const { canAll } = usePermissions();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'state_Id', direction: 'desc' });
	const [search, setSearch] = useState('');
	const [togglingId, setTogglingId] = useState(null);
	const addToast = useSetAtom(addToastAtom);

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

	const { data, loading, mutate } = useAutoRevalidate(API.STATES.LIST, {
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
			title: 'Delete State',
			message: 'Are you sure you want to delete this state?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					const res = await http.delete(API.STATES.DELETE(id));
					addToast({ type: 'success', message: res?.msg || 'State deleted successfully' });
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
						message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to delete state'
					});
				}
			}
		});
	};

	const handleStatusToggle = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1;
		setTogglingId(id);
		try {
			const res = await http.put(API.STATES.STATUS(id), { inputData: { is_active: newStatus } });
			// Optimistic update
			const updatedList = data?.list?.map(item => (item.state_Id === id ? { ...item, is_active: newStatus } : item));
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

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.STATES.DOWNLOAD_EXCEL,
			fileName: 'states.xlsx'
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
		() => [
			{
				key: 'id',
				label: '#',
				widthClassName: 'w-[50px]',
				render: (_, index) => <span>{(page - 1) * pageSize + index + 1}</span>
			},
			{
				key: 'state_Name',
				label: 'State Name',
				widthClassName: 'min-w-[200px]'
			},
			{
				key: 'status',
				label: 'Status',
				widthClassName: 'w-[100px]',
				render: item =>
					canAll(PERM.STATE.LIST, PERM.STATE.STATUS) ? (
						<Switch
							checked={item.is_active === 1}
							disabled={togglingId === item.state_Id}
							onChange={() => handleStatusToggle(item.state_Id, item.is_active)}
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
						onEdit={
							canAll(PERM.STATE.LIST, PERM.STATE.EDIT)
								? () => navigate(ROUTES.EDIT_STATE.replace(':id', item.state_Id))
								: undefined
						}
						onDelete={canAll(PERM.STATE.LIST, PERM.STATE.DELETE) ? () => handleDelete(item.state_Id) : undefined}
					/>
				)
			}
		],
		[navigate, page, pageSize, data, togglingId]
	);

	return (
		<TableLayout
			title="States"
			addLabel={canAll(PERM.STATE.LIST, PERM.STATE.ADD) ? 'Add State' : undefined}
			addAction={canAll(PERM.STATE.LIST, PERM.STATE.ADD) ? ROUTES.ADD_STATE : undefined}
			extraAction={
				canAll(PERM.STATE.LIST, PERM.STATE.EXCEL) ? (
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
					<TableSearch onSearch={handleSearch} placeholder="Search by State Name" />
					<Filter options={filterOptions} onChange={handleFilterToggle} />
				</div>
			}
		>
			<CommonTable
				columns={columns}
				sortableColumns={['state_Name']}
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

export default StateList;
