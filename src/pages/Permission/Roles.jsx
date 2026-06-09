import React, { useEffect, useMemo, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { fontSizeAtom } from '../../data/states/appAtoms.js';
import { addToastAtom } from '../../data/states/toastAtom';
import TableLayout from '../../components/common/TableLayout.jsx';
import SectionTab from '../../components/common/SectionTab.jsx';
import Input from '../../components/common/Input.jsx';
import Checkbox from '../../components/common/Checkbox.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import EditIcon from '../../assets/icons/EditIcon.jsx';
import DeleteIcon from '../../assets/icons/DeleteIcon.jsx';
import { useConfirm } from '../../hooks/useConfirm';
import {
	roleListApi,
	createRoleApi,
	updateRoleApi,
	deleteRoleApi,
	rolePermissionsApi,
	assignPermissionsApi,
	accessCategoryListApi,
	permissionListApi
} from '../../data/apis';
import { BROWSER_STORAGE_KEYS } from '../../utils/constants/browserStorageKeys';
import { getDataInBrowser } from '../../utils/methods/DataInBrowser';

const PAGE_SCALES = {
	small: { '--roles-title': '14px', '--roles-text': '11px', '--roles-section': '11px' },
	medium: { '--roles-title': '16px', '--roles-text': '13px', '--roles-section': '12px' },
	large: { '--roles-title': '18px', '--roles-text': '14px', '--roles-section': '13px' }
};

const Roles = () => {
	const fontSize = useAtomValue(fontSizeAtom) || 'medium';
	const scale = PAGE_SCALES[fontSize] ?? PAGE_SCALES.medium;
	const addToast = useSetAtom(addToastAtom);

	const confirm = useConfirm();
	const authUser = getDataInBrowser(BROWSER_STORAGE_KEYS.authUser) || {};
	const clientId = authUser?.user?.client_id ?? authUser?.client_id ?? 1;

	const [roles, setRoles] = useState([]);
	const [selectedRoleId, setSelectedRoleId] = useState(null);
	const [rolePermissionIds, setRolePermissionIds] = useState([]);
	const [permissionGroups, setPermissionGroups] = useState([]);
	const [roleSearch, setRoleSearch] = useState('');
	const [permissionSearch, setPermissionSearch] = useState('');
	const [loadingRoles, setLoadingRoles] = useState(false);
	const [loadingPermissions, setLoadingPermissions] = useState(false);
	const [error, setError] = useState('');

	const [roleModal, setRoleModal] = useState({
		open: false,
		mode: 'add',
		id: null,
		name: '',
		description: ''
	});
	const [roleNameError, setRoleNameError] = useState('');

	useEffect(() => {
		const loadRoles = async () => {
			setLoadingRoles(true);
			setError('');
			try {
				const res = await roleListApi(clientId);
				const list = res?.data || [];
				setRoles(list);
				if (list.length && selectedRoleId == null) {
					setSelectedRoleId(list[0].access_group_Id ?? list[0].id ?? null);
				}
			} catch (err) {
				setError(err?.data?.message || 'Failed to load roles');
			} finally {
				setLoadingRoles(false);
			}
		};
		loadRoles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const loadPermissions = async () => {
			setLoadingPermissions(true);
			try {
				const catRes = await accessCategoryListApi();
				const categories = catRes?.data || [];
				const groups = await Promise.all(
					categories.map(async cat => {
						const id = cat.access_category_Id ?? cat.id;
						const permRes = await permissionListApi(id);
						return {
							key: id,
							title: cat.access_category_Name || cat.name || '',
							description: cat.access_category_Description || cat.description || '',
							permissions: permRes?.data || []
						};
					})
				);
				setPermissionGroups(groups);
			} catch (err) {
				setError(err?.data?.message || 'Failed to load permissions');
			} finally {
				setLoadingPermissions(false);
			}
		};
		loadPermissions();
	}, []);

	useEffect(() => {
		if (selectedRoleId == null) {
			setRolePermissionIds([]);
			return;
		}
		const loadRolePerms = async () => {
			try {
				const res = await rolePermissionsApi(selectedRoleId);
				const ids = (res?.data || []).map(p => p.access_Id ?? p.id);
				setRolePermissionIds(ids);
			} catch (err) {
				setError(err?.data?.message || 'Failed to load role permissions');
			}
		};
		loadRolePerms();
	}, [selectedRoleId]);

	const selectedRole = roles.find(r => (r.access_group_Id ?? r.id) === selectedRoleId);

	const filteredRoles = useMemo(() => {
		const q = roleSearch.trim().toLowerCase();
		return q ? roles.filter(r => (r.access_group_Name || r.name || '').toLowerCase().includes(q)) : roles;
	}, [roles, roleSearch]);

	const filteredGroups = useMemo(() => {
		const q = permissionSearch.trim().toLowerCase();
		if (!q) return permissionGroups;
		return permissionGroups
			.map(g => ({
				...g,
				permissions: g.permissions.filter(p => (p.access_Name || '').toLowerCase().includes(q))
			}))
			.filter(g => g.permissions.length > 0);
	}, [permissionSearch, permissionGroups]);

	const togglePermission = async perm => {
		if (!selectedRole) return;
		const id = perm.access_Id ?? perm.id;
		const has = rolePermissionIds.includes(id);
		const nextIds = has ? rolePermissionIds.filter(x => x !== id) : [...rolePermissionIds, id];
		setRolePermissionIds(nextIds);
		try {
			await assignPermissionsApi({
				access_group_Id: selectedRoleId,
				access_Ids: nextIds
			});
			addToast({
				type: 'success',
				message: has ? 'Permission removed' : 'Permission assigned'
			});
		} catch (err) {
			setError(err?.data?.message || 'Failed to update permissions');
			setRolePermissionIds(rolePermissionIds);
		}
	};

	const toggleAllInGroup = async group => {
		if (!selectedRole) return;
		const groupIds = group.permissions.map(p => p.access_Id ?? p.id);
		const allSelected = groupIds.every(id => rolePermissionIds.includes(id));

		// If all selected → deselect all in group; otherwise → select all in group
		const nextIds = allSelected
			? rolePermissionIds.filter(id => !groupIds.includes(id))
			: [...new Set([...rolePermissionIds, ...groupIds])];

		setRolePermissionIds(nextIds);
		try {
			await assignPermissionsApi({ access_group_Id: selectedRoleId, access_Ids: nextIds });
			addToast({ type: 'success', message: allSelected ? 'All permissions removed' : 'All permissions assigned' });
		} catch (err) {
			setError(err?.data?.message || 'Failed to update permissions');
			setRolePermissionIds(rolePermissionIds);
		}
	};

	const openAddRole = () => {
		setRoleNameError('');
		setRoleModal({ open: true, mode: 'add', id: null, name: '', description: '' });
	};
	const openEditRole = role => {
		setRoleNameError('');
		setRoleModal({
			open: true,
			mode: 'edit',
			id: role.access_group_Id ?? role.id,
			name: role.access_group_Name || role.name || '',
			description: role.access_group_Description || role.description || ''
		});
	};
	const closeRoleModal = () => {
		setRoleNameError('');
		setRoleModal(m => ({ ...m, open: false }));
	};

	const saveRole = async () => {
		const name = roleModal.name.trim();
		if (!name) {
			setRoleNameError('Role name is required');
			return;
		}
		setRoleNameError('');
		try {
			if (roleModal.mode === 'edit' && roleModal.id != null) {
				await updateRoleApi(roleModal.id, {
					access_group_Name: name,
					access_group_Description: roleModal.description
				});
			} else {
				await createRoleApi({
					client_Id: clientId,
					access_group_Name: name,
					access_group_Description: roleModal.description
				});
			}
			const res = await roleListApi(clientId);
			const list = res?.data || [];
			setRoles(list);
			if (roleModal.mode === 'add' && list.length) {
				setSelectedRoleId(list[list.length - 1].access_group_Id ?? list[list.length - 1].id);
			}
		} catch (err) {
			// Failure toast is raised centrally by the axios interceptor.
			setError(err?.data?.message || 'Failed to save role');
		} finally {
			closeRoleModal();
		}
	};

	const deleteRole = id => {
		confirm({
			title: 'Delete Group',
			message: 'Are you sure you want to delete this group?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					await deleteRoleApi(id);
					const next = roles.filter(r => (r.access_group_Id ?? r.id) !== id);
					setRoles(next);
					if (id === selectedRoleId) {
						setSelectedRoleId(next[0]?.access_group_Id ?? next[0]?.id ?? null);
					}
				} catch (err) {
					setError(err?.data?.message || 'Failed to delete role');
				}
			}
		});
	};

	const totalPermissions = permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0);
	const selectedCount = rolePermissionIds.length;
	const selectedRoleName = selectedRole?.access_group_Name || selectedRole?.name || '—';

	return (
		<TableLayout title="Groups" addLabel="Add Groups" addAction={openAddRole}>
			<div style={scale}>
				{error && (
					<div className="mb-[10px] rounded-[6px] bg-red-50 px-[12px] py-[8px] text-[12px] text-red-600">{error}</div>
				)}

				<div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[minmax(280px,360px)_1fr]">
					{/* LEFT: Roles */}
					<div>
						<div className="relative z-[1] flex items-center">
							<SectionTab title="Select Groups" subtitle="Choose A Groups" />
						</div>
						<div className="-mt-px rounded-[0_10px_10px_10px] border border-divider bg-card p-[12px] shadow-sm">
							<Input
								id="role-search"
								placeholder="Search Groups"
								value={roleSearch}
								onChange={e => setRoleSearch(e.target.value)}
								className="!min-h-[32px] !py-1 text-[12px]"
								wrapperClassName="mb-[10px]"
							/>

							<ul className="custom-scrollbar flex max-h-[520px] flex-col gap-[8px] overflow-y-auto pr-[2px]">
								{loadingRoles && (
									<li
										className="rounded-[8px] border border-dashed border-divider px-[12px] py-[18px] text-center text-text-3"
										style={{ fontSize: 'var(--roles-text)' }}
									>
										Loading…
									</li>
								)}
								{!loadingRoles && filteredRoles.length === 0 && (
									<li
										className="rounded-[8px] border border-dashed border-divider px-[12px] py-[18px] text-center text-text-3"
										style={{ fontSize: 'var(--roles-text)' }}
									>
										No groups found
									</li>
								)}
								{filteredRoles.map(role => {
									const id = role.access_group_Id ?? role.id;
									const name = role.access_group_Name || role.name || '';
									const isActive = id === selectedRoleId;
									return (
										<li key={id}>
											<button
												type="button"
												onClick={() => setSelectedRoleId(id)}
												className={`group relative flex w-full items-center justify-between rounded-[8px] border px-[12px] py-[10px] text-left transition ${
													isActive
														? 'border-brand-light bg-[color-mix(in_srgb,var(--secondary-color)_10%,var(--card-color))]'
														: 'border-divider bg-card hover:border-brand-light/60'
												}`}
											>
												<div className="min-w-0">
													<div
														className={`truncate font-semibold leading-tight ${isActive ? 'text-brand-light' : 'text-text-1'}`}
														style={{ fontSize: 'var(--roles-text)' }}
													>
														{name}
													</div>
													{role.access_group_Description && (
														<div
															className="mt-[2px] truncate text-text-3"
															style={{ fontSize: 'calc(var(--roles-text) - 2px)' }}
														>
															{role.access_group_Description}
														</div>
													)}
												</div>
												<div className="flex items-center gap-[6px]">
													<div
														className={`flex items-center gap-[4px] ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}
													>
														<span
															role="button"
															tabIndex={0}
															onClick={e => {
																e.stopPropagation();
																openEditRole(role);
															}}
															onKeyDown={e => {
																if (e.key === 'Enter') {
																	e.stopPropagation();
																	openEditRole(role);
																}
															}}
															className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[4px] text-text-2 hover:bg-field hover:text-text-1"
															aria-label="Edit role"
														>
															<EditIcon className="h-[13px] w-[13px]" />
														</span>
														<span
															role="button"
															tabIndex={0}
															onClick={e => {
																e.stopPropagation();
																deleteRole(id);
															}}
															onKeyDown={e => {
																if (e.key === 'Enter') {
																	e.stopPropagation();
																	deleteRole(id);
																}
															}}
															className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[4px] text-red-500 hover:bg-red-500/10 hover:text-red-600"
															aria-label="Delete role"
														>
															<DeleteIcon className="h-[13px] w-[13px]" />
														</span>
													</div>
												</div>
											</button>
										</li>
									);
								})}
							</ul>
						</div>
					</div>

					{/* RIGHT: Permissions */}
					<div>
						<div className="relative z-[1] flex items-center justify-between">
							<SectionTab
								title="Permissions"
								subtitle={`${selectedCount} of ${totalPermissions} selected for ${selectedRoleName}`}
							/>
						</div>
						<div className="-mt-px min-h-[460px] rounded-[0_10px_10px_10px] border border-divider bg-card p-[14px] shadow-sm">
							<Input
								id="perm-search"
								placeholder="Search Permissions"
								value={permissionSearch}
								onChange={e => setPermissionSearch(e.target.value)}
								className="!min-h-[32px] !py-1 text-[12px]"
								wrapperClassName="mb-[14px]"
							/>

							{loadingPermissions ? (
								<p className="py-12 text-center text-text-3" style={{ fontSize: 'var(--roles-text)' }}>
									Loading…
								</p>
							) : !selectedRole ? (
								<p className="py-12 text-center text-text-3" style={{ fontSize: 'var(--roles-text)' }}>
									Select a role to assign permissions.
								</p>
							) : (
								<div className="custom-scrollbar flex max-h-[480px] flex-col gap-[14px] overflow-y-auto pr-[4px]">
									{filteredGroups.length === 0 && (
										<p className="py-8 text-center text-text-3" style={{ fontSize: 'var(--roles-text)' }}>
											No permissions match your search.
										</p>
									)}
									{filteredGroups.map(g => {
										const groupIds = g.permissions.map(p => p.access_Id ?? p.id);
										const selectedCount = groupIds.filter(id => rolePermissionIds.includes(id)).length;
										const allSelected = selectedCount === groupIds.length;
										const someSelected = selectedCount > 0 && !allSelected;

										return (
											<div key={g.key} className="rounded-[8px] border border-divider bg-background/40 p-[12px]">
												{/* Group header with Select All */}
												<div className="mb-[8px] flex items-center justify-between">
													<div
														className="font-bold tracking-[0.04em] text-brand-light"
														style={{ fontSize: 'var(--roles-section)' }}
													>
														{g.title}
													</div>
													<label className="inline-flex cursor-pointer items-center gap-[5px]">
														<span className="relative inline-flex h-4 w-4 shrink-0">
															<input
																type="checkbox"
																checked={allSelected}
																ref={el => {
																	if (el) el.indeterminate = someSelected;
																}}
																onChange={() => toggleAllInGroup(g)}
																className="peer absolute inset-0 cursor-pointer opacity-0"
															/>
															<span
																className={`flex h-4 w-4 items-center justify-center rounded-[4px] border-[1.2px] transition
																	${
																		allSelected
																			? 'border-brand-light bg-brand-light/10 text-brand-light'
																			: someSelected
																				? 'border-brand-light bg-brand-light/10 text-brand-light'
																				: 'border-divider bg-background text-transparent'
																	}`}
															>
																{allSelected && (
																	<svg className="h-[9px] w-[9px]" viewBox="0 0 10 10" fill="none">
																		<path
																			d="M1.5 5l2.5 2.5 4.5-5"
																			stroke="currentColor"
																			strokeWidth="1.5"
																			strokeLinecap="round"
																			strokeLinejoin="round"
																		/>
																	</svg>
																)}
																{someSelected && (
																	<svg className="h-[9px] w-[9px]" viewBox="0 0 10 10" fill="none">
																		<path d="M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
																	</svg>
																)}
															</span>
														</span>
														<span className="text-[11px] font-semibold text-text-2">
															{allSelected ? 'Deselect All' : 'Select All'}
															{selectedCount > 0 && (
																<span className="ml-1 text-text-3">
																	({selectedCount}/{groupIds.length})
																</span>
															)}
														</span>
													</label>
												</div>
												{g.description && (
													<div className="mb-[8px] text-text-3" style={{ fontSize: 'calc(var(--roles-text) - 1px)' }}>
														{g.description}
													</div>
												)}
												<div className="flex flex-wrap gap-x-[18px] gap-y-[8px]">
													{g.permissions.map(perm => {
														const pid = perm.access_Id ?? perm.id;
														return (
															<Checkbox
																key={pid}
																id={`${g.key}-${pid}`}
																label={perm.access_Name}
																checked={rolePermissionIds.includes(pid)}
																onChange={() => togglePermission(perm)}
																labelClassName="!text-[12px] !font-medium text-text-1"
															/>
														);
													})}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Role modal */}
				<Modal
					open={roleModal.open}
					onClose={closeRoleModal}
					title={roleModal.mode === 'edit' ? 'Edit Groups' : 'Add Groups'}
					footer={
						<>
							<Button
								variant="outline"
								onClick={closeRoleModal}
								className="!min-h-[32px] !rounded-[6px] !px-[18px] !py-[6px] !text-[12px]"
							>
								Cancel
							</Button>
							<Button onClick={saveRole} className="!min-h-[32px] !rounded-[6px] !px-[22px] !py-[6px] !text-[12px]">
								{roleModal.mode === 'edit' ? 'Update' : 'Add'}
							</Button>
						</>
					}
				>
					<div className="flex flex-col gap-[12px]">
						<Input
							id="role-name"
							label="Groups Name"
							placeholder="e.g. Lab Technician"
							value={roleModal.name}
							error={roleNameError}
							onChange={e => {
								setRoleModal(m => ({ ...m, name: e.target.value }));
								setRoleNameError('');
							}}
							required
						/>
						<Input
							id="role-desc"
							label="Description"
							placeholder="Short Description"
							value={roleModal.description}
							onChange={e => setRoleModal(m => ({ ...m, description: e.target.value }))}
						/>
					</div>
				</Modal>
			</div>
		</TableLayout>
	);
};

export default Roles;
