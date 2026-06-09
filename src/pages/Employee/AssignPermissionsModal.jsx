import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../data/states/toastAtom';
import { API } from '../../data/apis/endpoints';
import http from '../../lib/axios/axios';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import DeleteIcon from '../../assets/icons/DeleteIcon.jsx';
import { roleListApi } from '../../data/apis';
import { getDataInBrowser } from '../../utils/methods/DataInBrowser';
import { BROWSER_STORAGE_KEYS } from '../../utils/constants/browserStorageKeys';

// ─── Group selector (same design pattern as AssignLoginModal) ─────────────────
const VISIBLE_LIMIT = 4;

const GroupSelector = ({ groupIds, onChange, allRoles, error }) => {
	const [search, setSearch] = useState('');
	const [open, setOpen] = useState(false);
	const [showAll, setShowAll] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		if (!open) return;
		const handler = e => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	const available = useMemo(() => {
		const q = search.trim().toLowerCase();
		return allRoles.filter(r => {
			const id = r.access_group_Id ?? r.id;
			const name = (r.access_group_Name || r.name || '').toLowerCase();
			return !groupIds.includes(id) && (q ? name.includes(q) : true);
		});
	}, [search, groupIds, allRoles]);

	const getName = id => {
		const r = allRoles.find(x => (x.access_group_Id ?? x.id) === id);
		return r?.access_group_Name || r?.name || `Group ${id}`;
	};

	const addGroup = role => {
		const id = role.access_group_Id ?? role.id;
		if (!groupIds.includes(id)) onChange([...groupIds, id]);
		setSearch('');
		setOpen(false);
	};

	const removeGroup = id => onChange(groupIds.filter(x => x !== id));
	const visible = showAll ? groupIds : groupIds.slice(0, VISIBLE_LIMIT);
	const remaining = groupIds.length - visible.length;

	return (
		<div>
			<label className="form-label">
				Access Groups <span className="text-red-500">*</span>
			</label>
			<div ref={ref} className="relative">
				<input
					type="text"
					className={`form-input pr-9 ${error ? '!border-red-500' : ''}`}
					placeholder="Search and select groups…"
					value={search}
					onChange={e => {
						setSearch(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					autoComplete="off"
				/>
				<svg
					className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="7" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				{open && available.length > 0 && (
					<div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[200px] overflow-y-auto rounded-[8px] border border-divider bg-card shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
						{available.map(role => {
							const id = role.access_group_Id ?? role.id;
							return (
								<button
									type="button"
									key={id}
									onClick={() => addGroup(role)}
									className="block w-full px-3 py-2 text-left text-[12px] text-text-1 hover:bg-field"
								>
									{role.access_group_Name || role.name}
								</button>
							);
						})}
					</div>
				)}
			</div>
			{error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
			{groupIds.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-2">
					{visible.map(id => (
						<span
							key={id}
							className="inline-flex items-center gap-1 rounded-full border border-brand-light bg-card px-3 py-1 text-[11px] font-medium text-brand-light"
						>
							{getName(id)}
							<button
								type="button"
								onClick={() => removeGroup(id)}
								className="inline-flex h-3 w-3 items-center justify-center hover:text-red-500"
							>
								<DeleteIcon className="h-[12px] w-[12px]" />
							</button>
						</span>
					))}
					{!showAll && remaining > 0 && (
						<button
							type="button"
							onClick={() => setShowAll(true)}
							className="rounded-full bg-brand-light px-3 py-1 text-[11px] font-semibold text-white hover:brightness-95"
						>
							+{remaining} more
						</button>
					)}
					{showAll && groupIds.length > VISIBLE_LIMIT && (
						<button
							type="button"
							onClick={() => setShowAll(false)}
							className="rounded-full bg-brand-light px-3 py-1 text-[11px] font-semibold text-white hover:brightness-95"
						>
							Show less
						</button>
					)}
				</div>
			)}
		</div>
	);
};

// ─── Main modal ───────────────────────────────────────────────────────────────

const AssignPermissionsModal = ({ open, onClose, employee, onSuccess }) => {
	const addToast = useSetAtom(addToastAtom);

	const authUser = getDataInBrowser(BROWSER_STORAGE_KEYS.authUser) || {};
	const clientId = authUser?.user?.client_id ?? authUser?.client_id ?? 1;

	const [groupIds, setGroupIds] = useState([]);
	const [groupError, setGroupError] = useState('');
	const [allRoles, setAllRoles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);

	useEffect(() => {
		if (!open) return;
		setGroupIds([]);
		setGroupError('');

		const load = async () => {
			setFetching(true);
			try {
				const [rolesRes, detailsRes] = await Promise.all([
					roleListApi(clientId),
					http.post(API.EMPLOYEES.LOGIN_DETAILS(employee.employee_Id))
				]);
				setAllRoles(rolesRes?.data || []);
				const ids = detailsRes?.data?.access_group_Ids;
				setGroupIds(Array.isArray(ids) ? ids : []);
			} catch (err) {
				console.error('Failed to load permissions data', err);
			} finally {
				setFetching(false);
			}
		};
		load();
	}, [open, employee?.employee_Id, clientId]);

	const handleSubmit = async e => {
		e.preventDefault();
		if (groupIds.length === 0) {
			setGroupError('Select at least one access group');
			return;
		}
		setGroupError('');
		setLoading(true);
		try {
			// Re-use the assign-login endpoint — pass current name/email + new groups only
			// (password left blank so backend won't change it)
			const detailsRes = await http.post(API.EMPLOYEES.LOGIN_DETAILS(employee.employee_Id));
			const user = detailsRes?.data || {};
			await http.post(API.EMPLOYEES.ASSIGN_LOGIN(employee.employee_Id), {
				user_Name: user.user_Name || employee.employee_Name,
				user_Email: user.user_Email || employee.email_Id || '',
				access_group_Ids: groupIds
				// no password field → backend keeps existing hash
			});
			addToast({ type: 'success', message: 'Permissions updated successfully' });
			onSuccess?.();
			onClose();
		} catch (err) {
			console.error(err);
			const msg = err?.response?.data?.message || 'Failed to update permissions';
			addToast({ type: 'error', message: msg });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={`Assign Permissions — ${employee?.employee_Name}`}
			widthClassName="max-w-[480px]"
			footer={
				<>
					<Button variant="outline" onClick={onClose} disabled={loading}>
						Cancel
					</Button>
					<Button type="submit" form="assign-permissions-form" disabled={loading || fetching}>
						{loading ? 'Saving…' : 'Save Permissions'}
					</Button>
				</>
			}
		>
			{fetching ? (
				<p className="py-6 text-center text-sm text-text-3">Loading…</p>
			) : (
				<form id="assign-permissions-form" onSubmit={handleSubmit} noValidate>
					<div className="mb-3 rounded-[6px] bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
						Select which access groups this employee's login account belongs to.
					</div>
					<GroupSelector
						groupIds={groupIds}
						onChange={ids => {
							setGroupIds(ids);
							setGroupError('');
						}}
						allRoles={allRoles}
						error={groupError}
					/>
				</form>
			)}
		</Modal>
	);
};

export default AssignPermissionsModal;
