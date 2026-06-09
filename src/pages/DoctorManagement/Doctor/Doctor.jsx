import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import ROUTES from '../../../utils/constants/routes';
import { API } from '../../../data/apis/endpoints';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import TableActions from '../../../components/common/TableActions.jsx';
import CommonTable from '../../../components/common/CommonTable.jsx';
import http from '../../../lib/axios/axios';
import TableLayout from '../../../components/common/TableLayout.jsx';
import TableSearch from '../../../components/common/TableSearch.jsx';
import Filter from '../../../components/common/Filter.jsx';
import Switch from '../../../components/common/Switch.jsx';
import Button from '../../../components/common/Button';
import { createPortal } from 'react-dom';
import AssignLoginModal from './AssignLoginModal.jsx';
import DotsVerticalIcon from '../../../assets/icons/DotsVerticalIcon.jsx';
import UserKeyIcon from '../../../assets/icons/UserKeyIcon.jsx';
import UserRemoveIcon from '../../../assets/icons/UserRemoveIcon.jsx';
import { usePermissions } from '../../../hooks/usePermissions';
import Unauthorized from '../../Unauthorized';
import { PERM } from '../../../utils/constants/permissionKey2';
import { downloadExcel } from '../../../utils/methods/downloadExcel';

// ─── Portal dropdown — renders outside the table so overflow never clips it ───
const MoreActionsMenu = ({ doctor, onAssignLogin, onRemoveLogin }) => {
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
	const hasLogin = Boolean(doctor.user_Id); // Ensure user_Id is returned by Doctor list API

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
						onAssignLogin(doctor);
					}}
					className="flex w-full items-center gap-[10px] px-[14px] py-[9px] text-left text-[12.5px] text-text-1 hover:bg-field transition-colors"
				>
					<UserKeyIcon className="h-4 w-4 shrink-0 text-brand-light" />
					<span className="flex-1">{hasLogin ? 'Edit Login Access' : 'Assign Login Access'}</span>
					{hasLogin && <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" title="Has login" />}
				</button>

				{hasLogin && (
					<>
						<div className="mx-3 border-t border-divider" />
						<button
							type="button"
							onClick={() => {
								close();
								onRemoveLogin(doctor);
							}}
							className="flex w-full items-center gap-[10px] px-[14px] py-[9px] text-left text-[12.5px] text-red-500 hover:bg-red-50 transition-colors"
						>
							<UserRemoveIcon className="h-4 w-4 shrink-0" />
							<span className="flex-1">Remove Login Access</span>
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

const DoctorList = () => {
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const { can, canAll } = usePermissions();
	const [searchParams, setSearchParams] = useSearchParams();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'doc_Id', direction: 'desc' });
	const [loginModal, setLoginModal] = useState({ open: false, doctor: null });

	const canView = can(PERM.DOCTOR.LIST);
	const canAdd = canAll(PERM.DOCTOR.LIST, PERM.DOCTOR.ADD);
	const canEdit = canAll(PERM.DOCTOR.LIST, PERM.DOCTOR.EDIT);
	const canDelete = canAll(PERM.DOCTOR.LIST, PERM.DOCTOR.DELETE);
	const canStatus = canAll(PERM.DOCTOR.LIST, PERM.DOCTOR.STATUS);
	const canExcel = canAll(PERM.DOCTOR.LIST, PERM.DOCTOR.EXCEL);
	const canAssignLogin = canAll(PERM.DOCTOR.LIST, PERM.DOCTOR.ASSIGN_LOGIN);

	// Search
	const [search, setSearch] = useState('');

	const [activeFilter, setActiveFilter] = useState({
		active: true,
		inactive: true,
		deleted: false
	});

	const { is_active_val, show_deleted_val } = useMemo(() => {
		const { active, inactive, deleted } = activeFilter;
		const hasNonDeleted = active || inactive;

		let show_deleted_val = undefined;
		if (deleted && hasNonDeleted) show_deleted_val = 'all';
		else if (deleted && !hasNonDeleted) show_deleted_val = 1;

		let is_active_val;
		if (active && !inactive) is_active_val = 1;
		else if (!active && inactive) is_active_val = 0;
		else if (!active && !inactive && !deleted) is_active_val = -1;

		return { is_active_val, show_deleted_val };
	}, [activeFilter]);

	const filterOptions = useMemo(
		() => [
			{ id: 'active', label: 'Active', checked: activeFilter.active },
			{ id: 'inactive', label: 'Inactive', checked: activeFilter.inactive },
			{ id: 'deleted', label: 'Deleted', checked: activeFilter.deleted }
		],
		[activeFilter]
	);

	const handleSearch = value => {
		setSearch(value);
		setPage(1);
	};

	const handleFilterToggle = id => {
		setActiveFilter(prev => ({
			...prev,
			[id]: !prev[id]
		}));
		setPage(1);
	};

	const [togglingId, setTogglingId] = useState(null);

	console.log(
		'[Doctor.jsx] Rendering DoctorList with filter state:',
		activeFilter,
		'computed is_active_val:',
		is_active_val,
		'show_deleted_val:',
		show_deleted_val
	);

	const { data, loading, mutate } = useAutoRevalidate(API.DOCTORS.LIST, {
		page,
		limit: pageSize,
		search: search || undefined,
		sortBy: sortConfig.key,
		sortOrder: sortConfig.direction,
		is_active: is_active_val,
		show_deleted: show_deleted_val
	});

	const handleToggleStatus = async doc => {
		if (togglingId) return;
		setTogglingId(doc.doc_Id);
		try {
			const newStatus = doc.is_active ? 0 : 1;
			await http.post(API.DOCTORS.TOGGLE_STATUS(doc.doc_Id), { inputData: { is_active: newStatus } });
			const updatedList = data?.list?.map(item =>
				item.doc_Id === doc.doc_Id ? { ...item, is_active: newStatus } : item
			);
			if (updatedList) {
				mutate({ ...data, list: updatedList }, false);
			}
		} catch {
			addToast({ type: 'error', message: 'Failed to update status' });
		} finally {
			setTogglingId(null);
		}
	};

	const handleDelete = async doc => {
		if (!window.confirm(`Are you sure you want to delete ${doc.doc_Name}?`)) return;
		try {
			await http.delete(API.DOCTORS.DELETE(doc.doc_Id));
			addToast({ type: 'success', message: 'Doctor deleted successfully' });
			mutate();
		} catch {
			addToast({ type: 'error', message: 'Failed to delete doctor' });
		}
	};

	const handleDownloadExcel = async () => {
		await downloadExcel({
			url: API.DOCTORS.DOWNLOAD_EXCEL,
			fileName: 'doctors.xlsx'
		});
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
					key: 'doc_Name',
					label: 'Doctor Name',
					widthClassName: 'min-w-[160px]',
					render: item => (
						<div className="flex flex-col">
							<div className="flex items-center gap-2">
								<span className="font-bold text-text-1">{item.doc_Name}</span>
								{item.user_Id && (
									<span title="Has system login" className="inline-block h-2 w-2 rounded-full bg-green-500" />
								)}
							</div>
						</div>
					)
				},
				{
					key: 'doc_Code',
					label: 'Doctor Id',
					widthClassName: 'min-w-[120px]',
					render: item => <span className="text-text-2">{item.doc_Code || '—'}</span>
				},
				{
					key: 'department_Name',
					label: 'Department',
					widthClassName: 'min-w-[140px]',
					render: item => <span className="text-text-2">{item.department_Name || '—'}</span>
				},
				{
					key: 'doc_Mobile_Number',
					label: 'Mobile',
					widthClassName: 'min-w-[120px]',
					render: item => <span className="text-text-2">{item.doc_Mobile_Number || '—'}</span>
				},
				{
					key: 'doc_Registration_Number',
					label: 'Registration',
					widthClassName: 'min-w-[140px]',
					render: item => <span className="text-text-2">{item.doc_Registration_Number || '—'}</span>
				},
				{
					key: 'is_active',
					label: 'Status',
					widthClassName: 'w-[110px]',
					render: item =>
						item.is_deleted ? (
							<span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">Deleted</span>
						) : (
							<div title={item.is_active ? 'Active' : 'Inactive'} className="inline-block">
								<Switch
									checked={item.is_active === 1}
									disabled={!canStatus || togglingId === item.doc_Id}
									onChange={() => {
										if (!canStatus) return;
										handleToggleStatus(item);
									}}
								/>
							</div>
						)
				}
			];

			const hasActions = canView || canEdit || canDelete || canAssignLogin;
			if (hasActions) {
				cols.push({
					key: 'actions',
					label: 'Actions',
					widthClassName: 'w-[120px]',
					render: item => (
						<div className="flex items-center gap-2">
							<TableActions
								onView={() => navigate(ROUTES.VIEW_DOCTOR.replace(':id', item.doc_Id))}
								onEdit={canEdit && !item.is_deleted ? () => navigate(ROUTES.EDIT_DOCTOR.replace(':id', item.doc_Id)) : undefined}
								onDelete={canDelete && !item.is_deleted ? () => handleDelete(item) : undefined}
							/>
							{canAssignLogin && (
								<MoreActionsMenu
									doctor={item}
									onAssignLogin={doc => setLoginModal({ open: true, doctor: doc })}
									onRemoveLogin={doc => {
										if (!window.confirm(`Remove login access for ${doc.doc_Name}? This cannot be undone.`)) return;
										(async () => {
											try {
												await http.post(API.DOCTORS.REMOVE_LOGIN(doc.doc_Id));
												addToast({ type: 'success', message: 'Login access removed successfully' });
												mutate();
											} catch {
												addToast({ type: 'error', message: 'Failed to remove login access' });
											}
										})();
									}}
								/>
							)}
						</div>
					)
				});
			}

			return cols;
		},
		[navigate, page, pageSize, data, togglingId, canStatus, canEdit, canDelete, canAssignLogin]
	);

	if (!canView) return <Unauthorized />;

	return (
		<TableLayout
			title="Doctors"
			addLabel={canAdd ? "Add Doctor" : undefined}
			addAction={canAdd ? ROUTES.ADD_DOCTOR : undefined}
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
						<TableSearch onSearch={handleSearch} placeholder="Search by name, code, email, mobile…" />
						<Filter options={filterOptions} onChange={handleFilterToggle} />
					</div>
				) : undefined
			}
		>
			<CommonTable
				columns={columns}
				sortableColumns={['doc_Name']}
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
			<AssignLoginModal
				open={loginModal.open}
				doctor={loginModal.doctor}
				onClose={() => setLoginModal({ open: false, doctor: null })}
				onSuccess={mutate}
			/>
		</TableLayout>
	);
};

export default DoctorList;
