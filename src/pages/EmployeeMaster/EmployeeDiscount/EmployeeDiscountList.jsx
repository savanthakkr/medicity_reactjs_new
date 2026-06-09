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
import TableLayout from '../../../components/common/TableLayout.jsx';
import TableSearch from '../../../components/common/TableSearch.jsx';
import http from '../../../lib/axios/axios';
import { useConfirm } from '../../../hooks/useConfirm';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';
import { formatDate } from '../../../utils/methods/formatDate';
import Unauthorized from '../../Unauthorized';
import Button from '../../../components/common/Button.jsx';
import { downloadExcel } from '../../../utils/methods/downloadExcel';

const EmployeeDiscountList = () => {
	const navigate = useNavigate();
	const confirm = useConfirm();
	const addToast = useSetAtom(addToastAtom);
	const { can, canAll } = usePermissions();

	const canView = can(PERM.DISCOUNT_ALLOWED.LIST);
	const canAdd = canAll(PERM.DISCOUNT_ALLOWED.LIST, PERM.DISCOUNT_ALLOWED.ADD);
	const canEdit = canAll(PERM.DISCOUNT_ALLOWED.LIST, PERM.DISCOUNT_ALLOWED.EDIT);
	const canDelete = canAll(PERM.DISCOUNT_ALLOWED.LIST, PERM.DISCOUNT_ALLOWED.DELETE);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [search, setSearch] = useState('');

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.EMPLOYEE_DISCOUNTS.DOWNLOAD_EXCEL,
			fileName: 'discount-allowed.xlsx',
			payload: { search }
		});
	};

	const { data, loading, mutate } = useAutoRevalidate(API.EMPLOYEE_DISCOUNTS.LIST, {
		page,
		limit: pageSize,
		search: search || undefined
	});

	React.useEffect(() => {
		if (data && !loading && (!data.list || data.list.length === 0) && page > 1) {
			setPage(p => p - 1);
		}
	}, [data, loading, page]);

	const handleDelete = id => {
		confirm({
			title: 'Delete Discount',
			message: 'Are you sure you want to delete this discount record?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					await http.post(API.EMPLOYEE_DISCOUNTS.DELETE(id));
					addToast({ type: 'success', message: 'Discount deleted successfully' });
					mutate();
				} catch {
					addToast({ type: 'error', message: 'Failed to delete discount' });
				}
			}
		});
	};

	const columns = useMemo(
		() => [
			{
				key: 'id',
				label: '#',
				widthClassName: 'w-[50px]',
				render: (_, i) => <span>{(page - 1) * pageSize + i + 1}</span>
			},
			{
				key: 'employee_Name',
				label: 'Employee',
				widthClassName: 'min-w-[180px]',
				render: item => (
					<div className="flex flex-col gap-[4px]">
						<p className="font-bold text-text-1">{item.employee_Name}</p>
						{item.employee_Code && <p className="text-[11px] text-text-3">{item.employee_Code}</p>}
					</div>
				)
			},
			{
				key: 'branch_Name',
				label: 'Branch',
				widthClassName: 'min-w-[120px]',
				render: item => (
					<span className="text-text-2">{item.branch_Name || <span className="italic text-text-3">—</span>}</span>
				)
			},
			{
				key: 'designation_Name',
				label: 'Designation',
				widthClassName: 'min-w-[120px]',
				render: item => (
					<span className="text-text-2">{item.designation_Name || <span className="italic text-text-3">—</span>}</span>
				)
			},
			{
				key: 'max_discount_percentage',
				label: 'Discount %',
				widthClassName: 'w-[90px]',
				render: item => <span className="font-semibold text-brand-light">{item.max_discount_percentage ?? 0}%</span>
			},
			{
				key: 'max_discount_per_month',
				label: 'Max / Month',
				widthClassName: 'min-w-[110px]',
				render: item => (
					<span className="text-text-2">
						{item.max_discount_per_month != null ? (
							`₹ ${item.max_discount_per_month}`
						) : (
							<span className="italic text-text-3">—</span>
						)}
					</span>
				)
			},
			{
				key: 'max_discount_per_bill',
				label: 'Max / Bill',
				widthClassName: 'min-w-[110px]',
				render: item => (
					<span className="text-text-2">
						{item.max_discount_per_bill != null ? (
							`₹ ${item.max_discount_per_bill}`
						) : (
							<span className="italic text-text-3">—</span>
						)}
					</span>
				)
			},
			{
				key: 'effective_from',
				label: 'Effective From',
				widthClassName: 'min-w-[110px]',
				render: item => <span className="text-text-2">{formatDate(item.effective_from)}</span>
			},
			{
				key: 'effective_to',
				label: 'Effective To',
				widthClassName: 'min-w-[110px]',
				render: item => <span className="text-text-2">{formatDate(item.effective_to)}</span>
			},
			{
				key: 'share_type',
				label: 'Share Type',
				widthClassName: 'min-w-[120px]',
				render: item => (
					<span className="rounded-full bg-brand-light/10 px-2 py-0.5 text-[11px] font-medium text-brand-light">
						{item.share_type_Name || <span className="italic text-text-3">—</span>}
					</span>
				)
			},
			{
				key: 'actions',
				label: 'Actions',
				widthClassName: 'w-[100px]',
				render: item => (
					<TableActions
						onEdit={
							canEdit
								? () => navigate(ROUTES.EDIT_EMPLOYEE_DISCOUNT.replace(':id', item.discount_allowed_Id))
								: undefined
						}
						onDelete={canDelete ? () => handleDelete(item.discount_allowed_Id) : undefined}
					/>
				)
			}
		],
		[navigate, page, pageSize, canEdit, canDelete]
	);

	if (!canView) return <Unauthorized />;

	return (
		<TableLayout
			title="Discount Allowed"
			addLabel={canAdd ? 'Add Discount' : undefined}
			addAction={canAdd ? ROUTES.ADD_EMPLOYEE_DISCOUNT : undefined}
			extraAction={
				canAll(PERM.DISCOUNT_ALLOWED.LIST, PERM.DISCOUNT_ALLOWED.EXCEL) ? (
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
				<TableSearch
					onSearch={v => {
						setSearch(v);
						setPage(1);
					}}
					placeholder="Search by employee name or code…"
				/>
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
				onPageSizeChange={s => {
					setPageSize(s);
					setPage(1);
				}}
			/>
		</TableLayout>
	);
};

export default EmployeeDiscountList;
