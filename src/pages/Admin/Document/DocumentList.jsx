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

const DocumentList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const addToast = useSetAtom(addToastAtom);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
	const [togglingId, setTogglingId] = useState(null);
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

	const { data, loading, mutate } = useAutoRevalidate(API.DOCUMENTS.LIST, {
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
			title: 'Delete Document',
			message: 'Are you sure you want to delete this document?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					const res = await http.post(API.DOCUMENTS.DELETE(id));
					addToast({ type: 'success', message: res?.data?.msg || 'Document deleted successfully' });
					if (data?.list?.length === 1 && page > 1) {
						setPage(p => p - 1);
					} else {
						mutate();
					}
				} catch (error) {
					console.error('Delete failed:', error);
					addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to delete document' });
				}
			}
		});
	};

	const handleStatusToggle = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1;
		setTogglingId(id);
		try {
			await http.post(API.DOCUMENTS.STATUS(id), { inputData: { is_active: newStatus } });
			const updatedList = data?.list?.map(item => (item.document_Id === id ? { ...item, is_active: newStatus } : item));
			if (updatedList) {
				mutate({ ...data, list: updatedList }, false);
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
				key: 'document_Name',
				label: 'Document Name',
				widthClassName: 'min-w-[200px]'
			},
			{
				key: 'document_Description',
				label: 'Description',
				widthClassName: 'min-w-[300px]',
				render: item => <span>{item.document_Description || '—'}</span>
			},
			{
				key: 'status',
				label: 'Status',
				widthClassName: 'w-[100px]',
				render: item => (
					<Switch
						checked={item.is_active === 1}
						disabled={togglingId === item.document_Id}
						onChange={() => handleStatusToggle(item.document_Id, item.is_active)}
					/>
				)
			},
			{
				key: 'actions',
				label: 'Actions',
				widthClassName: 'w-[100px]',
				render: item => (
					<TableActions
						onEdit={() => navigate(ROUTES.EDIT_DOCUMENT.replace(':id', item.document_Id))}
						onDelete={() => handleDelete(item.document_Id)}
					/>
				)
			}
		],
		[navigate, page, pageSize, data, togglingId]
	);

	return (
		<TableLayout
			title="Documents"
			addLabel="Add Document"
			addAction={ROUTES.ADD_DOCUMENT}
			filterContent={
				<div className="flex items-center gap-2">
					<TableSearch onSearch={handleSearch} placeholder="Search Documents" />
					<Filter options={filterOptions} onChange={handleFilterToggle} />
				</div>
			}
		>
			<CommonTable
				columns={columns}
				sortableColumns={['document_Name', 'document_Description']}
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

export default DocumentList;
