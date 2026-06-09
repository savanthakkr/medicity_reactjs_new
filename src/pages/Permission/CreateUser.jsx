import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import FormSection from '../../components/common/FormSection';
import BackIcon from '../../assets/icons/BackIcon.jsx';
import CloseIcon from '../../assets/icons/CloseIcon.jsx';
import { createUserApi, updateUserApi, userDetailsApi, roleListApi } from '../../data/apis';
import { BROWSER_STORAGE_KEYS } from '../../utils/constants/browserStorageKeys';
import { getDataInBrowser } from '../../utils/methods/DataInBrowser';

const VISIBLE_GROUP_LIMIT = 4;

const CreateUser = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEdit = Boolean(id);

	const authUser = getDataInBrowser(BROWSER_STORAGE_KEYS.authUser) || {};
	const clientId = authUser?.user?.client_id ?? authUser?.client_id ?? 1;

	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		groups: []
	});

	const [allRoles, setAllRoles] = useState([]);
	const [groupSearch, setGroupSearch] = useState('');
	const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
	const [showAllGroups, setShowAllGroups] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});
	const groupRef = useRef(null);

	useEffect(() => {
		const loadRoles = async () => {
			try {
				const res = await roleListApi(clientId);
				setAllRoles(res?.data || []);
			} catch (err) {
				setError(err?.data?.message || 'Failed to load roles');
			}
		};
		loadRoles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!isEdit) return;
		const loadUser = async () => {
			setLoading(true);
			try {
				const res = await userDetailsApi(id);
				const u = res?.data || {};
				setForm(f => ({
					...f,
					name: u.user_Name || '',
					email: u.user_Email || '',
					groups:
						Array.isArray(u.access_group_Ids) && u.access_group_Ids.length > 0
							? u.access_group_Ids
							: u.access_group_Id
								? [u.access_group_Id]
								: []
				}));
			} catch (err) {
				setError(err?.data?.message || 'Failed to load user');
			} finally {
				setLoading(false);
			}
		};
		loadUser();
	}, [id, isEdit]);

	useEffect(() => {
		if (!groupDropdownOpen) return;
		const onClick = e => {
			if (groupRef.current && !groupRef.current.contains(e.target)) setGroupDropdownOpen(false);
		};
		document.addEventListener('mousedown', onClick);
		return () => document.removeEventListener('mousedown', onClick);
	}, [groupDropdownOpen]);

	const set = key => e => {
		setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));
		setFieldErrors(fe => ({ ...fe, [key]: '' }));
	};

	const availableGroups = useMemo(() => {
		const q = groupSearch.trim().toLowerCase();
		return allRoles.filter(r => {
			const rid = r.access_group_Id ?? r.id;
			const name = r.access_group_Name || r.name || '';
			return !form.groups.includes(rid) && (q ? name.toLowerCase().includes(q) : true);
		});
	}, [groupSearch, form.groups, allRoles]);

	const visibleGroupChips = showAllGroups ? form.groups : form.groups.slice(0, VISIBLE_GROUP_LIMIT);
	const remainingGroupCount = form.groups.length - visibleGroupChips.length;

	const findRoleName = rid => {
		const r = allRoles.find(x => (x.access_group_Id ?? x.id) === rid);
		return r?.access_group_Name || r?.name || `Group ${rid}`;
	};

	const addGroup = role => {
		const rid = role.access_group_Id ?? role.id;
		setForm(f => (f.groups.includes(rid) ? f : { ...f, groups: [...f.groups, rid] }));
		setFieldErrors(fe => ({ ...fe, groups: '' }));
		setGroupSearch('');
		setGroupDropdownOpen(false);
	};

	const removeGroup = rid => setForm(f => ({ ...f, groups: f.groups.filter(x => x !== rid) }));

	const onSubmit = async e => {
		e.preventDefault();
		setError('');
		const user_Name = form.name.trim();
		const user_Email = form.email.trim();
		const access_group_Ids = form.groups;

		const errs = {};
		if (!user_Name) errs.name = 'User name is required';
		if (!user_Email) errs.email = 'Email is required';
		if (!isEdit && !form.password) errs.password = 'Password is required';
		if (access_group_Ids.length === 0) errs.groups = 'At least one group is required';
		if (Object.keys(errs).length > 0) {
			setFieldErrors(errs);
			return;
		}
		setFieldErrors({});

		setSubmitting(true);
		try {
			if (isEdit) {
				await updateUserApi(id, {
					access_group_Ids,
					user_Name,
					user_Email
				});
			} else {
				await createUserApi({
					client_Id: clientId,
					access_group_Ids,
					user_Name,
					user_Email,
					password: form.password
				});
			}
			navigate(-1);
		} catch (err) {
			setError(err?.data?.message || 'Failed to save user');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section className="mx-auto w-full pb-10 pt-[6px]">
			<button
				type="button"
				onClick={() => navigate(-1)}
				className="mb-[13px] inline-flex items-center gap-1 text-[22px] font-medium tracking-[-0.02em] text-text-1 transition hover:text-text-2"
			>
				<BackIcon className="h-5 w-5" />
				<span>User Group</span>
			</button>

			{error && (
				<div className="mb-[10px] rounded-[6px] bg-red-50 px-[12px] py-[8px] text-[12px] text-red-600">{error}</div>
			)}

			{loading && <p className="mb-[10px] text-[12px] text-text-3">Loading…</p>}

			<form id="user-form" onSubmit={onSubmit} noValidate>
				<FormSection
					title={isEdit ? 'Edit User' : 'New User'}
					subtitle={isEdit ? 'Update the user details' : 'Fill The Form to Create User'}
				>
					<div className="grid grid-cols-1 gap-x-[24px] gap-y-[16px] md:grid-cols-2">
						<Input
							label="User Name"
							id="name"
							placeholder="Enter Your Name"
							value={form.name}
							error={fieldErrors.name}
							onChange={set('name')}
							required
						/>
						<Input
							label="Email"
							id="email"
							type="email"
							placeholder="Enter Email"
							value={form.email}
							error={fieldErrors.email}
							onChange={set('email')}
							required
						/>
						<Input
							label="Password"
							id="password"
							type="password"
							placeholder="Enter Password"
							value={form.password}
							error={fieldErrors.password}
							onChange={set('password')}
							required={!isEdit}
						/>

						<div ref={groupRef}>
							<label htmlFor="group-search" className="form-label">
								Group
								<span className="text-red-500 ml-0.5">*</span>
							</label>
							<div className="relative">
								<input
									id="group-search"
									type="text"
									className={`form-input pr-9 ${fieldErrors.groups ? '!border-red-500' : ''}`}
									placeholder="Search Group Name"
									value={groupSearch}
									onChange={e => {
										setGroupSearch(e.target.value);
										setGroupDropdownOpen(true);
									}}
									onFocus={() => setGroupDropdownOpen(true)}
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
									aria-hidden="true"
								>
									<circle cx="11" cy="11" r="7" />
									<path d="m21 21-4.3-4.3" />
								</svg>
								{groupDropdownOpen && availableGroups.length > 0 && (
									<div className="absolute left-0 right-0 top-full z-30 mt-[4px] max-h-[220px] overflow-y-auto rounded-[8px] border border-divider bg-card shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
										{availableGroups.map(role => {
											const rid = role.access_group_Id ?? role.id;
											const name = role.access_group_Name || role.name;
											return (
												<button
													type="button"
													key={rid}
													onClick={() => addGroup(role)}
													className="block w-full px-[12px] py-[8px] text-left text-[12px] text-text-1 hover:bg-field"
												>
													{name}
												</button>
											);
										})}
									</div>
								)}
							</div>
							{fieldErrors.groups && (
								<p className="mt-[4px] text-[11px] leading-tight text-red-600">{fieldErrors.groups}</p>
							)}
							{form.groups.length > 0 && (
								<div className="mt-[10px] flex flex-wrap items-center gap-[8px]">
									{visibleGroupChips.map(rid => (
										<span
											key={rid}
											className="inline-flex items-center gap-[6px] rounded-full border border-brand-light bg-card px-[12px] py-[5px] text-[12px] font-medium text-brand-light"
										>
											{findRoleName(rid)}
											<button
												type="button"
												onClick={() => removeGroup(rid)}
												className="inline-flex h-[14px] w-[14px] items-center justify-center text-brand-light hover:text-red-500"
												aria-label={`Remove ${findRoleName(rid)}`}
											>
												<CloseIcon className="h-[10px] w-[10px]" />
											</button>
										</span>
									))}
									{!showAllGroups && remainingGroupCount > 0 && (
										<button
											type="button"
											onClick={() => setShowAllGroups(true)}
											className="inline-flex items-center rounded-full bg-brand-light px-[14px] py-[5px] text-[12px] font-semibold text-white hover:brightness-95"
										>
											View More (+{remainingGroupCount})
										</button>
									)}
									{showAllGroups && form.groups.length > VISIBLE_GROUP_LIMIT && (
										<button
											type="button"
											onClick={() => setShowAllGroups(false)}
											className="inline-flex items-center rounded-full bg-brand-light px-[14px] py-[5px] text-[12px] font-semibold text-white hover:brightness-95"
										>
											View Less
										</button>
									)}
								</div>
							)}
						</div>
					</div>
				</FormSection>
			</form>

			<div className="mt-[6px] flex justify-end gap-[10px]">
				<Button variant="outline" onClick={() => navigate(-1)}>
					<span className="min-w-[72px] text-center">Cancel</span>
				</Button>
				<Button type="submit" form="user-form" disabled={submitting}>
					<span className="min-w-[72px] text-center">
						{submitting ? (isEdit ? 'Updating…' : 'Creating…') : isEdit ? 'Update' : 'Create'}
					</span>
				</Button>
			</div>
		</section>
	);
};

export default CreateUser;
