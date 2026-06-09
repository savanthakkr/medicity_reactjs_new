import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../data/states/toastAtom';
import { API } from '../../data/apis/endpoints';
import http from '../../lib/axios/axios';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import DeleteIcon from '../../assets/icons/DeleteIcon.jsx';
import { roleListApi } from '../../data/apis';
import { getDataInBrowser } from '../../utils/methods/DataInBrowser';
import { BROWSER_STORAGE_KEYS } from '../../utils/constants/browserStorageKeys';

// ─── Group multi-select chip ──────────────────────────────────────────────────
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

// ─── Main Modal ───────────────────────────────────────────────────────────────

const AssignLoginModal = ({ open, onClose, employee, onSuccess }) => {
	const addToast = useSetAtom(addToastAtom);

	const authUser = getDataInBrowser(BROWSER_STORAGE_KEYS.authUser) || {};
	const clientId = authUser?.user?.client_id ?? authUser?.client_id ?? 1;

	const isEdit = Boolean(employee?.user_Id);

	const [form, setForm] = useState({ user_Username: '', user_Email: '', password: '', access_group_Ids: [] });
	const [errors, setErrors] = useState({});
	const [allRoles, setAllRoles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);

	// Load roles and (if editing) existing login details when modal opens
	useEffect(() => {
		if (!open) return;

		// Auto-generate username: "{employee_code}_{employee_name}" e.g. "2304-savan_john_doe"
		const autoUsername = (() => {
			const code = (employee?.employee_Code || '').trim().toLowerCase().replace(/\s+/g, '_');
			const name = (employee?.employee_Name || '')
				.trim()
				.toLowerCase()
				.replace(/\s+/g, '_')
				.replace(/[^a-z0-9._-]/g, '');
			if (code && name) return `${code}_${name}`;
			return code || name;
		})();

		setForm({
			user_Username: autoUsername,
			user_Email: employee?.email_Id || '',
			password: '',
			access_group_Ids: []
		});
		setErrors({});

		const load = async () => {
			setFetching(true);
			try {
				// Load available roles — exclude system/admin groups so employees
				// cannot accidentally be given unrestricted super-admin access.
				const rolesRes = await roleListApi(clientId);
				const roles = (rolesRes?.data || []).filter(r => !r.is_system_group);
				setAllRoles(roles);

				// If employee already has a linked user, load their details
				if (employee?.user_Id) {
					const res = await http.post(API.EMPLOYEES.LOGIN_DETAILS(employee.employee_Id));
					const details = res?.data;
					if (details) {
						setForm(prev => ({
							...prev,
							user_Username: details.user_Name || prev.user_Username,
							user_Email: details.user_Email || prev.user_Email,
							access_group_Ids: Array.isArray(details.access_group_Ids) ? details.access_group_Ids : []
						}));
					}
				}
			} catch (err) {
				console.error('Failed to load login data', err);
			} finally {
				setFetching(false);
			}
		};
		load();
	}, [open, employee?.employee_Id, employee?.user_Id]);

	const validate = () => {
		const errs = {};
		if (!form.user_Username.trim()) errs.user_Username = 'Username is required';
		else if (/\s/.test(form.user_Username.trim())) errs.user_Username = 'Username cannot contain spaces';
		if (!form.user_Email.trim()) errs.user_Email = 'Email is required';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.user_Email.trim()))
			errs.user_Email = 'Enter a valid email address';
		if (!isEdit && !form.password.trim()) errs.password = 'Password is required';
		if (form.password.trim() && form.password.trim().length < 6)
			errs.password = 'Password must be at least 6 characters';
		if (form.access_group_Ids.length === 0) errs.access_group_Ids = 'Select at least one group';
		return errs;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		const errs = validate();
		setErrors(errs);
		if (Object.keys(errs).length > 0) return;

		setLoading(true);
		try {
			await http.post(API.EMPLOYEES.ASSIGN_LOGIN(employee.employee_Id), {
				user_Name: form.user_Username.trim(),
				user_Email: form.user_Email.trim(),
				password: form.password.trim() || undefined,
				access_group_Ids: form.access_group_Ids
			});
			addToast({
				type: 'success',
				message: isEdit ? 'Login updated successfully' : 'Login created successfully'
			});
			onSuccess?.();
			onClose();
		} catch (err) {
			console.error(err);
			const msg = err?.response?.data?.message || 'Operation failed. Please try again.';
			addToast({ type: 'error', message: msg });
		} finally {
			setLoading(false);
		}
	};

	const set = key => e => {
		setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));
		setErrors(prev => ({ ...prev, [key]: '' }));
	};

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={isEdit ? `Edit Login — ${employee?.employee_Name}` : `Assign Login — ${employee?.employee_Name}`}
			widthClassName="max-w-[520px]"
			footer={
				<>
					<Button variant="outline" onClick={onClose} disabled={loading}>
						Cancel
					</Button>
					<Button type="submit" form="assign-login-form" disabled={loading || fetching}>
						{loading ? (isEdit ? 'Updating…' : 'Creating…') : isEdit ? 'Update Login' : 'Create Login'}
					</Button>
				</>
			}
		>
			{fetching ? (
				<p className="py-6 text-center text-sm text-text-3">Loading…</p>
			) : (
				<form id="assign-login-form" onSubmit={handleSubmit} noValidate>
					<div className="flex flex-col gap-4">
						{/* Info badge when editing */}
						{isEdit && (
							<div className="rounded-[6px] bg-blue-50 px-3 py-2 text-[12px] text-blue-700">
								This employee already has login access. Leave <strong>password</strong> blank to keep the current one.
							</div>
						)}

						<div>
							<label className="form-label">Employee Name</label>
							<div className="form-input bg-field text-text-2 cursor-default select-none">
								{employee?.employee_Name || '—'}
							</div>
						</div>

						<div>
							<Input
								label="Username"
								id="login-user-username"
								placeholder="Enter username"
								value={form.user_Username}
								error={errors.user_Username}
								onChange={set('user_Username')}
								required
							/>
							{!errors.user_Username && (
								<p className="mt-1 text-[11px] text-text-3">
									Auto-generated from employee code + name — you can edit it.
								</p>
							)}
						</div>

						<Input
							label="Email"
							id="login-user-email"
							type="email"
							placeholder="Enter email address"
							value={form.user_Email}
							error={errors.user_Email}
							onChange={set('user_Email')}
							required
						/>

						<Input
							label={isEdit ? 'New Password (optional)' : 'Password'}
							id="login-password"
							type="password"
							placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter password'}
							value={form.password}
							error={errors.password}
							onChange={set('password')}
							required={!isEdit}
						/>

						<GroupSelector
							groupIds={form.access_group_Ids}
							onChange={ids => {
								setForm(f => ({ ...f, access_group_Ids: ids }));
								setErrors(e => ({ ...e, access_group_Ids: '' }));
							}}
							allRoles={allRoles}
							error={errors.access_group_Ids}
						/>
					</div>
				</form>
			)}
		</Modal>
	);
};

export default AssignLoginModal;
