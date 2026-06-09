import React, { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import { API } from '../../../data/apis/endpoints';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import { usePaginationResetOnEmptyPage } from '../../../hooks/usePaginationResetOnEmptyPage';
import CommonTable from '../../../components/common/CommonTable.jsx';
import TableLayout from '../../../components/common/TableLayout.jsx';
import TableSearch from '../../../components/common/TableSearch.jsx';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import Input from '../../../components/common/Input.jsx';
import Select from '../../../components/common/Select.jsx';
import http from '../../../lib/axios/axios';
import TableActions from '../../../components/common/TableActions.jsx';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERM } from '../../../utils/constants/permissionKeys';
import Unauthorized from '../../Unauthorized';
import { downloadExcel } from '../../../utils/methods/downloadExcel';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => ({
	value: String(CURRENT_YEAR - i),
	label: String(CURRENT_YEAR - i)
}));

const BalanceBar = ({ used, total }) => {
	const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
	return (
		<div className="w-full min-w-[120px]">
			<div className="flex justify-between text-[10px] text-text-3 mb-[2px]">
				<span>Used: {used}</span>
				<span>Total: {total || '—'}</span>
			</div>
			<div className="h-[6px] w-full rounded-full bg-field overflow-hidden">
				<div
					className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-green-400'}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
};

const LeaveBalance = () => {
	const addToast = useSetAtom(addToastAtom);
	const { can, canAll } = usePermissions();

	const canView = can(PERM.LEAVE_BALANCE.LIST);
	const canSet = canAll(PERM.LEAVE_BALANCE.LIST, PERM.LEAVE_BALANCE.SET);
	const canExcel = canAll(PERM.LEAVE_BALANCE.LIST, PERM.LEAVE_BALANCE.EXCEL);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [search, setSearch] = useState('');
	const [year, setYear] = useState(String(CURRENT_YEAR));
	const [modal, setModal] = useState({
		open: false,
		loading: false,
		employee_Id: '',
		leave_type_Id: '',
		opening_balance: '',
		credited_balance: ''
	});
	const [errors, setErrors] = useState({});

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.EMPLOYEE_LEAVES.DOWNLOAD_EXCEL_BALANCE,
			fileName: 'leave-balance.xlsx',
			payload: { year }
		});
	};

	const { data, loading, mutate } = useAutoRevalidate(API.EMPLOYEE_LEAVES.BALANCE_LIST, {
		page,
		limit: pageSize,
		year,
		search: search || undefined
	});

	usePaginationResetOnEmptyPage(data, loading, page, setPage);

	// Load employees and leave types for the modal
	const { data: empData } = useAutoRevalidate(API.EMPLOYEES.LIST, { page: 1, limit: 500, is_active: 1 });
	const { data: ltData } = useAutoRevalidate(API.LEAVE_TYPES.LIST, { page: 1, limit: 200 });

	const employees = (empData?.list || []).map(e => ({
		value: String(e.employee_Id),
		label: `${e.employee_Name}${e.employee_Code ? ` (${e.employee_Code})` : ''}`
	}));
	const leaveTypes = (ltData?.list || []).map(l => ({
		value: String(l.leave_type_Id),
		label: l.leave_type_Name
	}));

	const openModal = (row = null) => {
		if (row) {
			setModal({
				open: true,
				loading: false,
				isEdit: true,
				employee_Id: String(row.employee_Id),
				employee_Name: row.employee_Name || '',
				leave_type_Id: String(row.leave_type_Id),
				opening_balance: String(row.opening_balance),
				credited_balance: String(row.credited_balance)
			});
		} else {
			setModal({
				open: true,
				loading: false,
				isEdit: false,
				employee_Id: '',
				employee_Name: '',
				leave_type_Id: '',
				opening_balance: '',
				credited_balance: ''
			});
		}
		setErrors({});
	};

	const handleSave = async () => {
		const errs = {};
		if (!modal.employee_Id) errs.employee_Id = 'Required';
		if (!modal.leave_type_Id) errs.leave_type_Id = 'Required';
		if (Object.keys(errs).length) {
			setErrors(errs);
			return;
		}

		setModal(m => ({ ...m, loading: true }));
		try {
			await http.post(API.EMPLOYEE_LEAVES.SET_BALANCE, {
				employee_Id: Number(modal.employee_Id),
				leave_type_Id: Number(modal.leave_type_Id),
				opening_balance: Number(modal.opening_balance) || 0,
				credited_balance: Number(modal.credited_balance) || 0,
				year: Number(year)
			});
			addToast({ type: 'success', message: 'Leave balance saved' });
			setModal(m => ({ ...m, open: false }));
			mutate();
		} catch (err) {
			addToast({ type: 'error', message: err?.response?.data?.message || 'Failed to save' });
			setModal(m => ({ ...m, loading: false }));
		}
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
				widthClassName: 'min-w-[160px]',
				render: item => (
					<div className="flex flex-col gap-[4px]">
						<p className="font-bold text-text-1">{item.employee_Name}</p>
						{item.employee_Code && <p className="text-[11px] text-text-3">{item.employee_Code}</p>}
					</div>
				)
			},
			{
				key: 'leave_type_Name',
				label: 'Leave Type',
				widthClassName: 'min-w-[120px]',
				render: item => (
					<span className="rounded-full bg-brand-light/10 px-2 py-0.5 text-[11px] font-medium text-brand-light">
						{item.leave_type_Name}
					</span>
				)
			},
			{
				key: 'opening_balance',
				label: 'Opening',
				widthClassName: 'w-[80px]',
				render: item => <span className="text-text-2">{item.opening_balance}</span>
			},
			{
				key: 'credited_balance',
				label: 'Credited',
				widthClassName: 'w-[80px]',
				render: item => <span className="text-text-2">{item.credited_balance}</span>
			},
			{
				key: 'used_balance',
				label: 'Used',
				widthClassName: 'w-[70px]',
				render: item => <span className="font-semibold text-red-500">{item.used_balance}</span>
			},
			{
				key: 'available_balance',
				label: 'Available',
				widthClassName: 'w-[80px]',
				render: item => (
					<span className={`font-semibold ${Number(item.available_balance) < 0 ? 'text-red-500' : 'text-green-600'}`}>
						{item.available_balance}
					</span>
				)
			},
			{
				key: 'pending_days',
				label: 'Pending Days',
				widthClassName: 'w-[90px]',
				render: item => (
					<span className={`font-semibold ${Number(item.pending_days) > 0 ? 'text-amber-600' : 'text-text-3 italic'}`}>
						{Number(item.pending_days) > 0 ? item.pending_days : '—'}
					</span>
				)
			},
			{
				key: 'effective_available',
				label: 'Effective Avail.',
				widthClassName: 'w-[100px]',
				render: item => (
					<span
						className={`font-semibold ${Number(item.effective_available) < 0 ? 'text-red-500' : 'text-brand-light'}`}
					>
						{item.effective_available ?? item.available_balance}
					</span>
				)
			},
			{
				key: 'bar',
				label: 'Usage',
				widthClassName: 'min-w-[160px]',
				render: item => (
					<BalanceBar
						used={Number(item.used_balance)}
						total={Number(item.opening_balance) + Number(item.credited_balance)}
					/>
				)
			},
			{
				key: 'pending_count',
				label: 'Pending',
				widthClassName: 'w-[70px]',
				render: item =>
					item.pending_count > 0 ? (
						<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
							{item.pending_count}
						</span>
					) : (
						<span className="italic text-text-3">—</span>
					)
			},
			{
				key: 'actions',
				label: '',
				widthClassName: 'w-[70px]',
				render: item => <TableActions onEdit={canSet ? () => openModal(item) : undefined} />
			}
		],
		[page, pageSize, canSet]
	);

	if (!canView) return <Unauthorized />;

	return (
		<>
			<TableLayout
				title="Leave Balance"
				addLabel={canSet ? 'Set Balance' : undefined}
				addAction={canSet ? () => openModal() : undefined}
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
					<div className="flex items-center gap-2">
						<TableSearch
							onSearch={v => {
								setSearch(v);
								setPage(1);
							}}
							placeholder="Search employee or leave type…"
						/>
						<select
							value={year}
							onChange={e => {
								setYear(e.target.value);
								setPage(1);
							}}
							className="h-[34px] rounded-[6px] border border-divider bg-card px-2 text-[12px] text-text-1 outline-none focus:border-brand-light"
						>
							{YEARS.map(y => (
								<option key={y.value} value={y.value}>
									{y.label}
								</option>
							))}
						</select>
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

			<Modal
				open={modal.open}
				onClose={() => setModal(m => ({ ...m, open: false }))}
				title={modal.isEdit ? 'Edit Leave Balance' : 'Set Leave Balance'}
				widthClassName="max-w-[460px]"
				footer={
					<>
						<Button variant="outline" onClick={() => setModal(m => ({ ...m, open: false }))} disabled={modal.loading}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={modal.loading}>
							{modal.loading ? 'Saving…' : 'Save Balance'}
						</Button>
					</>
				}
			>
				<div className="flex flex-col gap-3">
					{modal.isEdit ? (
						<div>
							<label className="form-label">Employee</label>
							<div className="form-input cursor-not-allowed select-none bg-field text-[12px] text-text-2">
								{modal.employee_Name || '—'}
							</div>
							<p className="mt-1 text-[10.5px] text-text-3">Employee cannot be changed while editing.</p>
						</div>
					) : (
						<Select
							label="Employee"
							id="bal-employee"
							value={modal.employee_Id}
							onChange={e => setModal(m => ({ ...m, employee_Id: e.target.value }))}
							placeholder="Select employee..."
							options={employees}
							required
							error={errors.employee_Id}
						/>
					)}
					<Select
						label="Leave Type"
						id="bal-leave-type"
						value={modal.leave_type_Id}
						onChange={e => setModal(m => ({ ...m, leave_type_Id: e.target.value }))}
						placeholder="Select leave type..."
						options={leaveTypes}
						required
						error={errors.leave_type_Id}
					/>
					<div className="grid grid-cols-2 gap-3">
						<Input
							label="Opening Balance (days)"
							id="bal-opening"
							type="number"
							min="0"
							step="0.5"
							value={modal.opening_balance}
							onChange={e => setModal(m => ({ ...m, opening_balance: e.target.value }))}
							placeholder="e.g. 12"
						/>
						<Input
							label="Credited Balance (days)"
							id="bal-credited"
							type="number"
							min="0"
							step="0.5"
							value={modal.credited_balance}
							onChange={e => setModal(m => ({ ...m, credited_balance: e.target.value }))}
							placeholder="e.g. 0"
						/>
					</div>
					{(modal.opening_balance || modal.credited_balance) && (
						<div className="rounded-[6px] bg-brand-light/5 px-3 py-2 text-[12px] text-brand-light">
							Total available = {(Number(modal.opening_balance) || 0) + (Number(modal.credited_balance) || 0)} days{' '}
							(before deducting any used leaves)
						</div>
					)}
					<p className="text-[11px] text-text-3">
						Year: <strong>{year}</strong> — If employee already has approved leaves, available = opening + credited −
						used.
					</p>
				</div>
			</Modal>
		</>
	);
};

export default LeaveBalance;
