import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../data/states/toastAtom';
import ROUTES from '../../utils/constants/routes';
import { API } from '../../data/apis/endpoints';
import { useAutoRevalidate } from '../../hooks/useAutoRevalidate';
import TableActions from '../../components/common/TableActions.jsx';
import CommonTable from '../../components/common/CommonTable.jsx';
import http from '../../lib/axios/axios';
import TableLayout from '../../components/common/TableLayout.jsx';
import TableSearch from '../../components/common/TableSearch.jsx';
import Filter from '../../components/common/Filter.jsx';
import AssignLoginModal from './AssignLoginModal.jsx';
import AssignPermissionsModal from './AssignPermissionsModal.jsx';
import UserKeyIcon from '../../assets/icons/UserKeyIcon.jsx';
import Unauthorized from '../Unauthorized';
import ShieldCheckIcon from '../../assets/icons/ShieldCheckIcon.jsx';
import DotsVerticalIcon from '../../assets/icons/DotsVerticalIcon.jsx';
import UserRemoveIcon from '../../assets/icons/UserRemoveIcon.jsx';
import { usePermissions } from '../../hooks/usePermissions.js';
import { PERM } from '../../utils/constants/permissionKeys';
import Switch from '../../components/common/Switch.jsx';
import Button from '../../components/common/Button.jsx';
import { downloadExcel } from '../../utils/methods/downloadExcel';

// ─── Portal dropdown — renders outside the table so overflow never clips it ───
const MoreActionsMenu = ({ employee, onAssignLogin, onAssignPermissions, onRemoveLogin }) => {
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState({ top: 0, right: 0 });
	const btnRef = useRef(null);
	const dropdownRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		const handleOutside = e => {
			const insideBtn = btnRef.current?.contains(e.target);
			const insideDropdown = dropdownRef.current?.contains(e.target);
			if (!insideBtn && !insideDropdown) setOpen(false);
		};
		const handleScroll = () => setOpen(false);
		document.addEventListener('click', handleOutside);
		window.addEventListener('scroll', handleScroll, true);
		return () => {
			document.removeEventListener('click', handleOutside);
			window.removeEventListener('scroll', handleScroll, true);
		};
	}, [open]);

	const handleToggle = () => {
		if (!open && btnRef.current) {
			const rect = btnRef.current.getBoundingClientRect();
			setPos({
				top: rect.bottom + window.scrollY + 4,
				right: window.innerWidth - rect.right + window.scrollX
			});
		}
		setOpen(v => !v);
	};

	const close = () => setOpen(false);
	const hasLogin = Boolean(employee.user_Id);

	const dropdown =
		open &&
		createPortal(
			<div
				ref={dropdownRef}
				style={{ position: 'absolute', top: pos.top, right: pos.right, zIndex: 9999 }}
				className="w-[220px] rounded-[10px] border border-divider bg-card py-1 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
			>
				<button
					type="button"
					onClick={() => {
						close();
						onAssignLogin(employee);
					}}
					className="flex w-full items-center gap-[10px] px-[14px] py-[9px] text-left text-[12.5px] text-text-1 hover:bg-field transition-colors"
				>
					<UserKeyIcon className="h-4 w-4 shrink-0 text-brand-light" />
					<span className="flex-1">{hasLogin ? 'Edit Login Access' : 'Assign Login Access'}</span>
					{hasLogin && <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" title="Has login" />}
				</button>

				<div className="mx-3 border-t border-divider" />

				<button
					type="button"
					onClick={() => {
						close();
						onAssignPermissions(employee);
					}}
					disabled={!hasLogin}
					className={`flex w-full items-center gap-[10px] px-[14px] py-[9px] text-left text-[12.5px] transition-colors
          ${hasLogin ? 'text-text-1 hover:bg-field' : 'cursor-not-allowed text-text-disabled'}`}
				>
					<ShieldCheckIcon className={`h-4 w-4 shrink-0 ${hasLogin ? 'text-brand-light' : 'text-text-disabled'}`} />
					<span className="flex-1">Assign Permissions</span>
					{!hasLogin && <span className="shrink-0 text-[10px] text-text-disabled">No login</span>}
				</button>

				{hasLogin && (
					<>
						<div className="mx-3 border-t border-divider" />
						<button
							type="button"
							onClick={() => {
								close();
								onRemoveLogin(employee);
							}}
							className="flex w-full items-center gap-[10px] px-[14px] py-[9px] text-left text-[12.5px] text-red-500 hover:bg-red-50 transition-colors"
						>
							<UserRemoveIcon className="h-4 w-4 shrink-0" />
							<span className="flex-1">Remove Login &amp; Permissions</span>
						</button>
					</>
				)}
			</div>,
			document.body
		);

	return (
		<>
			<button
				ref={btnRef}
				type="button"
				onClick={handleToggle}
				title="More actions"
				className={`inline-flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border transition
          ${
						open
							? 'border-brand-light bg-brand-light/10 text-brand-light'
							: 'border-divider bg-card text-text-2 hover:border-brand-light hover:text-brand-light'
					}`}
			>
				<DotsVerticalIcon />
			</button>
			{dropdown}
		</>
	);
};

// ─── Active / Inactive toggle switch ─────────────────────────────────────────

// ─── List page ────────────────────────────────────────────────────────────────
const EmployeeList = () => {
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { can, canAll } = usePermissions();

	const canView = can(PERM.EMPLOYEE.LIST);
	const canStatus = can(PERM.EMPLOYEE.STATUS);
	const canViewDetails = can(PERM.EMPLOYEE.VIEW);

	const [searchParams, setSearchParams] = useSearchParams();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

	// Search
	const [search, setSearch] = useState('');

	// ── Filter — persisted in URL so it survives navigation ────────────────────
	const filterFromUrl = useMemo(() => {
		const raw = searchParams.get('filter') || 'active,inactive';
		const parts = raw.split(',');
		return {
			active: parts.includes('active'),
			inactive: parts.includes('inactive')
		};
	}, [searchParams]);

	const activeFilter = filterFromUrl;

	// Compute backend params from filter
	const is_active_val = useMemo(() => {
		const { active, inactive } = activeFilter;

		let is_active_val;
		if (active && !inactive) is_active_val = 1;
		else if (!active && inactive) is_active_val = 0;
		else if (!active && !inactive) is_active_val = -1;
		return is_active_val;
	}, [activeFilter]);

	const filterOptions = useMemo(
		() => [
			{ id: 'active', label: 'Active', checked: activeFilter.active },
			{ id: 'inactive', label: 'Inactive', checked: activeFilter.inactive }
		],
		[activeFilter]
	);

	const handleSearch = value => {
		setSearch(value);
		setPage(1);
	};

	const handleFilterToggle = id => {
		const next = { ...activeFilter, [id]: !activeFilter[id] };
		const parts = Object.keys(next).filter(k => next[k]);
		setSearchParams(
			prev => {
				const p = new URLSearchParams(prev);
				p.set('filter', parts.length ? parts.join(',') : 'active,inactive');
				return p;
			},
			{ replace: true }
		);
		setPage(1);
	};

	// Modals
	const [loginModal, setLoginModal] = useState({ open: false, employee: null });
	const [permModal, setPermModal] = useState({ open: false, employee: null });
	// Prevent double-click on status toggle
	const [togglingId, setTogglingId] = useState(null);

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.EMPLOYEES.DOWNLOAD_EXCEL,
			fileName: 'employees.xlsx',
			payload: { search, is_active: is_active_val }
		});
	};

	// ── Main list fetch ────────────────────────────────────────────────────────
	const { data, loading, mutate } = useAutoRevalidate(API.EMPLOYEES.LIST, {
		page,
		limit: pageSize,
		search: search || undefined,
		is_active: is_active_val
	});

	if (!canView) {
		return <Unauthorized />;
	}

	// Auto-go-back if page becomes empty after deactivation
	useEffect(() => {
		if (data && !loading && (!data.list || data.list.length === 0) && page > 1) {
			setPage(p => p - 1);
		}
	}, [data, loading, page]);

	// ── Handlers ──────────────────────────────────────────────────────────────
	const handleToggleStatus = useCallback(
		async emp => {
			if (togglingId) return;
			setTogglingId(emp.employee_Id);
			try {
				await http.post(API.EMPLOYEES.TOGGLE_STATUS(emp.employee_Id));
				addToast({
					type: 'success',
					message: `Employee marked as ${emp.is_active === 1 ? 'Inactive' : 'Active'} successfully`
				});
				mutate();
			} catch {
				addToast({ type: 'error', message: 'Failed to update status' });
			} finally {
				setTogglingId(null);
			}
		},
		[togglingId, mutate, addToast]
	);

	const handleAssignLogin = useCallback(emp => setLoginModal({ open: true, employee: emp }), []);
	const handleAssignPermissions = useCallback(
		emp => {
			if (!emp.user_Id) {
				addToast({ type: 'error', message: 'Assign login access to this employee first' });
				return;
			}
			setPermModal({ open: true, employee: emp });
		},
		[addToast]
	);

	const handleRemoveLogin = useCallback(
		emp => {
			if (!window.confirm(`Remove login access for ${emp.employee_Name}? This cannot be undone.`)) return;
			(async () => {
				try {
					await http.post(API.EMPLOYEES.REMOVE_LOGIN(emp.employee_Id));
					addToast({ type: 'success', message: 'Login access removed successfully' });
					mutate();
				} catch {
					addToast({ type: 'error', message: 'Failed to remove login access' });
				}
			})();
		},
		[mutate, addToast]
	);

	// ── Columns ───────────────────────────────────────────────────────────────
	const columns = useMemo(
		() => [
			{
				key: 'id',
				label: '#',
				widthClassName: 'w-[50px]',
				render: (_, index) => <span>{(page - 1) * pageSize + index + 1}</span>
			},
			{
				key: 'employee_Name',
				label: 'Employee',
				widthClassName: 'min-w-[180px]',
				render: item => (
					<div className="flex flex-col gap-[4px]">
						<div className="flex items-center gap-2">
							<span className="font-bold text-text-1">{item.employee_Name}</span>
							{item.user_Id && item.is_active === 1 && (
								<span title="Has active system login" className="inline-block h-2 w-2 rounded-full bg-green-500" />
							)}
							{item.user_Id && item.is_active === 0 && !item.is_deleted && (
								<span
									title="Login exists but employee is inactive"
									className="inline-block h-2 w-2 rounded-full bg-gray-400"
								/>
							)}
						</div>
						{item.employee_Code && <p className="text-[11px] text-text-3">{item.employee_Code}</p>}
					</div>
				)
			},
			{
				key: 'department_Name',
				label: 'Department',
				widthClassName: 'min-w-[140px]',
				render: item => (
					<span className="text-text-2">{item.department_Name || <span className="italic text-text-3">—</span>}</span>
				)
			},
			{
				key: 'designation_Name',
				label: 'Designation',
				widthClassName: 'min-w-[140px]',
				render: item => (
					<span className="text-text-2">{item.designation_Name || <span className="italic text-text-3">—</span>}</span>
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
				key: 'email_Id',
				label: 'Email',
				widthClassName: 'min-w-[180px]',
				render: item => (
					<span className="text-text-2">{item.email_Id || <span className="italic text-text-3">—</span>}</span>
				)
			},
			{
				key: 'mobile_Number',
				label: 'Mobile',
				widthClassName: 'min-w-[120px]',
				render: item => (
					<span className="text-text-2">{item.mobile_Number || <span className="italic text-text-3">—</span>}</span>
				)
			},
			{
				key: 'is_working',
				label: 'Status',
				widthClassName: 'w-[110px]',
				render: item =>
					item.is_deleted ? (
						<span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">Deleted</span>
					) : canStatus ? (
						<Switch
							checked={Boolean(item.is_active)}
							disabled={togglingId === item.employee_Id}
							onChange={() => handleToggleStatus(item)}
						/>
					) : (
						<span className="italic text-[11px] text-text-3">{item.is_active === 1 ? 'Active' : 'Inactive'}</span>
					)
			},
			{
				key: 'actions',
				label: 'Actions',
				widthClassName: 'w-[130px]',
				render: item => (
					<div className="flex items-center gap-2">
						{/* View button — shown only with VIEW permission */}
						{canViewDetails && (
							<button
								type="button"
								onClick={() => navigate(ROUTES.VIEW_EMPLOYEE.replace(':id', item.employee_Id))}
								className="inline-flex h-[15px] w-[15px] items-center justify-center text-text-3 transition hover:text-brand-light"
								aria-label="View employee"
								title="View details"
							>
								<svg viewBox="0 0 20 20" fill="currentColor" className="h-[15px] w-[15px]">
									<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
									<path
										fillRule="evenodd"
										d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						)}
						<TableActions
							onEdit={
								!item.is_deleted && can(PERM.EMPLOYEE.EDIT)
									? () => navigate(ROUTES.EDIT_EMPLOYEE.replace(':id', item.employee_Id))
									: undefined
							}
						/>
						{!item.is_deleted && item.is_active === 1 && (
							<MoreActionsMenu
								employee={item}
								onAssignLogin={handleAssignLogin}
								onAssignPermissions={handleAssignPermissions}
								onRemoveLogin={handleRemoveLogin}
							/>
						)}
					</div>
				)
			}
		],
		[
			navigate,
			page,
			pageSize,
			togglingId,
			handleToggleStatus,
			handleAssignLogin,
			handleAssignPermissions,
			handleRemoveLogin,
			can,
			canStatus,
			canViewDetails
		]
	);

	return (
		<>
			<TableLayout
				title="Employees"
				addLabel={can(PERM.EMPLOYEE.ADD) ? 'Add Employee' : undefined}
				addAction={can(PERM.EMPLOYEE.ADD) ? ROUTES.ADD_EMPLOYEE : undefined}
				extraAction={
					canAll(PERM.EMPLOYEE.LIST, PERM.EMPLOYEE.EXCEL) ? (
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
						<TableSearch onSearch={handleSearch} placeholder="Search by name, code, email, mobile…" />
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

			<AssignLoginModal
				open={loginModal.open}
				employee={loginModal.employee}
				onClose={() => setLoginModal({ open: false, employee: null })}
				onSuccess={mutate}
			/>

			<AssignPermissionsModal
				open={permModal.open}
				employee={permModal.employee}
				onClose={() => setPermModal({ open: false, employee: null })}
				onSuccess={mutate}
			/>
		</>
	);
};

export default EmployeeList;
