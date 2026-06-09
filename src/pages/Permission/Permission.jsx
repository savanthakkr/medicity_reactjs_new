import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { fontSizeAtom } from '../../data/states/appAtoms.js';
import TableLayout from '../../components/common/TableLayout.jsx';
import SectionTab from '../../components/common/SectionTab.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import AddIcon from '../../assets/icons/AddIcon.jsx';
import EditIcon from '../../assets/icons/EditIcon.jsx';
import DeleteIcon from '../../assets/icons/DeleteIcon.jsx';
import { useConfirm } from '../../hooks/useConfirm';
import {
	accessCategoryListApi,
	permissionListApi,
	createPermissionApi,
	updatePermissionApi,
	deletePermissionApi,
	createCategoryApi,
	updateCategoryApi,
	deleteCategoryApi
} from '../../data/apis';
import { API } from '../../data/apis/endpoints';
import { BROWSER_STORAGE_KEYS } from '../../utils/constants/browserStorageKeys';
import { getDataInBrowser } from '../../utils/methods/DataInBrowser';
import http from '../../lib/axios/axios';

const PAGE_SCALES = {
	small: { '--perm-title': '14px', '--perm-text': '11px', '--perm-chip': '10px' },
	medium: { '--perm-title': '16px', '--perm-text': '13px', '--perm-chip': '12px' },
	large: { '--perm-title': '18px', '--perm-text': '14px', '--perm-chip': '13px' }
};

const PermissionGroup = () => {
	const fontSize = useAtomValue(fontSizeAtom) || 'medium';
	const scale = PAGE_SCALES[fontSize] ?? PAGE_SCALES.medium;

	const confirm = useConfirm();
	const authUser = getDataInBrowser(BROWSER_STORAGE_KEYS.authUser) || {};
	const clientId = authUser?.user?.client_id ?? authUser?.client_id ?? 1;

	const [categories, setCategories] = useState([]);
	const [permissions, setPermissions] = useState([]);
	const [selectedId, setSelectedId] = useState(null);
	const [categorySearch, setCategorySearch] = useState('');
	const [permissionSearch, setPermissionSearch] = useState('');
	const [loadingCategories, setLoadingCategories] = useState(false);
	const [loadingPermissions, setLoadingPermissions] = useState(false);
	const [error, setError] = useState('');

	const [categoryModal, setCategoryModal] = useState({
		open: false,
		mode: 'add',
		id: null,
		name: '',
		description: ''
	});
	const [permissionModal, setPermissionModal] = useState({
		open: false,
		mode: 'add',
		id: null,
		access_Name: '',
		access_Key: '',
		urlTags: [], // array of URL strings stored as comma-separated in DB
		urlInput: '', // current value being typed in the URL tag field
		keyTouched: false
	});
	const [permErrors, setPermErrors] = useState({});
	const [catNameError, setCatNameError] = useState('');
	const [keyLoading, setKeyLoading] = useState(false);
	const keyDebounceRef = useRef(null);

	// Calls the backend pretty_url function and converts the result to UPPER_SNAKE_CASE
	const generateKeyFromName = name => {
		if (!name.trim()) {
			setPermissionModal(m => ({ ...m, access_Key: '' }));
			return;
		}
		setKeyLoading(true);
		clearTimeout(keyDebounceRef.current);
		keyDebounceRef.current = setTimeout(async () => {
			try {
				const res = await http.post(API.UTILS.PRETTY_URL, { str: name });
				const slug = res?.data?.result ?? res?.result ?? '';
				setPermissionModal(m => {
					// Only update if the user still hasn't manually edited the key
					if (m.keyTouched) return m;
					return { ...m, access_Key: slug.replace(/-/g, '_').toUpperCase() };
				});
			} catch {
				// silently ignore — user can type the key manually
			} finally {
				setKeyLoading(false);
			}
		}, 350);
	};

	const loadCategories = async ({ preserveSelection = true } = {}) => {
		setLoadingCategories(true);
		setError('');
		try {
			const res = await accessCategoryListApi();
			const list = res?.data || [];
			setCategories(list);
			setSelectedId(prev => {
				const stillExists = list.some(c => (c.access_category_Id ?? c.id) === prev);
				if (preserveSelection && prev != null && stillExists) return prev;
				return list[0]?.access_category_Id ?? list[0]?.id ?? null;
			});
		} catch (err) {
			setError(err?.data?.message || 'Failed to load categories');
		} finally {
			setLoadingCategories(false);
		}
	};

	useEffect(() => {
		loadCategories();
	}, []);

	useEffect(() => {
		if (selectedId == null) {
			setPermissions([]);
			return;
		}
		const loadPermissions = async () => {
			setLoadingPermissions(true);
			try {
				const res = await permissionListApi(selectedId);
				setPermissions(res?.data || []);
			} catch (err) {
				setError(err?.data?.message || 'Failed to load permissions');
			} finally {
				setLoadingPermissions(false);
			}
		};
		loadPermissions();
	}, [selectedId]);

	const selectedCategory = categories.find(c => (c.access_category_Id ?? c.id) === selectedId);

	const filteredCategories = useMemo(() => {
		const q = categorySearch.trim().toLowerCase();
		return q ? categories.filter(c => (c.access_category_Name || c.name || '').toLowerCase().includes(q)) : categories;
	}, [categories, categorySearch]);

	const filteredPermissions = useMemo(() => {
		const q = permissionSearch.trim().toLowerCase();
		return q ? permissions.filter(p => (p.access_Name || '').toLowerCase().includes(q)) : permissions;
	}, [permissions, permissionSearch]);

	const openAddCategory = () => {
		setCatNameError('');
		setCategoryModal({ open: true, mode: 'add', id: null, name: '', description: '' });
	};
	const openEditCategory = cat => {
		setCatNameError('');
		setCategoryModal({
			open: true,
			mode: 'edit',
			id: cat.access_category_Id ?? cat.id,
			name: cat.access_category_Name || cat.name || '',
			description: cat.access_category_Description || cat.description || ''
		});
	};
	const closeCategoryModal = () => {
		setCatNameError('');
		setCategoryModal(m => ({ ...m, open: false }));
	};

	const saveCategory = async () => {
		const name = categoryModal.name.trim();
		if (!name) {
			setCatNameError('Group name is required');
			return;
		}
		setCatNameError('');
		try {
			if (categoryModal.mode === 'edit' && categoryModal.id != null) {
				await updateCategoryApi(categoryModal.id, {
					access_category_Name: name,
					access_category_Description: categoryModal.description
				});
			} else {
				await createCategoryApi({
					client_Id: clientId,
					access_category_Name: name,
					access_category_Description: categoryModal.description
				});
			}
			await loadCategories();
		} catch (err) {
			// Failure toast is raised centrally by the axios interceptor.
			setError(err?.data?.message || 'Failed to save category');
		} finally {
			closeCategoryModal();
		}
	};

	const deleteCategory = id => {
		if (id == null) return;
		confirm({
			title: 'Delete Category',
			message: 'Are you sure you want to delete this category?',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					await deleteCategoryApi(id);
					await loadCategories({ preserveSelection: id !== selectedId });
				} catch (err) {
					setError(err?.data?.message || 'Failed to delete group');
				}
			}
		});
	};

	const openAddPermission = () => {
		setPermErrors({});
		setPermissionModal({
			open: true,
			mode: 'add',
			id: null,
			access_Name: '',
			access_Key: '',
			urlTags: [],
			urlInput: '',
			keyTouched: false
		});
	};
	const openEditPermission = perm => {
		setPermErrors({});
		setPermissionModal({
			open: true,
			mode: 'edit',
			id: perm.access_Id ?? perm.id,
			access_Name: perm.access_Name || '',
			access_Key: perm.access_Key || '',
			urlTags: (perm.access_URL || '')
				.split(',')
				.map(s => s.trim())
				.filter(Boolean),
			urlInput: '',
			keyTouched: true
		});
	};
	const closePermissionModal = () => {
		setPermErrors({});
		setPermissionModal(m => ({ ...m, open: false }));
	};

	const savePermission = async () => {
		if (!selectedCategory) return;
		const access_Name = permissionModal.access_Name.trim();
		const access_Key = permissionModal.access_Key.trim();

		// Commit any text sitting in the urlInput box before saving
		const pendingUrl = permissionModal.urlInput.trim();
		const allTags = pendingUrl ? [...new Set([...permissionModal.urlTags, pendingUrl])] : permissionModal.urlTags;
		const access_URL = allTags.join(',');

		const errs = {};
		if (!access_Name) errs.access_Name = 'Permission name is required';
		if (!access_Key) errs.access_Key = 'Permission key is required';
		if (Object.keys(errs).length > 0) {
			setPermErrors(errs);
			return;
		}
		setPermErrors({});
		setError('');

		try {
			if (permissionModal.mode === 'edit' && permissionModal.id != null) {
				await updatePermissionApi(permissionModal.id, {
					access_Name,
					access_Key,
					access_URL
				});
			} else {
				await createPermissionApi({
					client_Id: clientId,
					access_category_Id: selectedId,
					access_Name,
					access_Key,
					access_URL
				});
			}
			const res = await permissionListApi(selectedId);
			setPermissions(res?.data || []);
		} catch (err) {
			setError(err?.data?.message || 'Failed to save permission');
		} finally {
			closePermissionModal();
		}
	};

	const deletePermission = perm => {
		const id = perm.access_Id ?? perm.id;
		if (id == null) return;
		confirm({
			title: 'Delete Permission',
			message: `Are you sure you want to delete "${perm.access_Name}"?`,
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					await deletePermissionApi(id);
					const res = await permissionListApi(selectedId);
					setPermissions(res?.data || []);
				} catch (err) {
					setError(err?.data?.message || 'Failed to delete permission');
				}
			}
		});
	};

	return (
		<TableLayout title="Category">
			<div style={scale}>
				{error && (
					<div className="mb-[10px] rounded-[6px] bg-red-50 px-[12px] py-[8px] text-[12px] text-red-600">{error}</div>
				)}

				<div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[minmax(280px,360px)_1fr]">
					{/* LEFT: Categories */}
					<div>
						<div className="relative z-[1] flex items-center">
							<SectionTab title="Permission Category" subtitle={`${categories.length} Categories`} />
						</div>
						<div className="-mt-px rounded-[0_10px_10px_10px] border border-divider bg-card p-[12px] shadow-sm">
							<div className="mb-[10px] flex items-center gap-[8px]">
								<Input
									id="category-search"
									placeholder="Search Category"
									value={categorySearch}
									onChange={e => setCategorySearch(e.target.value)}
									className="!min-h-[32px] !py-1 text-[12px]"
								/>
								<Button
									onClick={openAddCategory}
									className="!min-h-[32px] !rounded-[6px] !px-[12px] !py-[6px] !text-[12px] whitespace-nowrap"
								>
									<span className="inline-flex items-center gap-[4px]">
										Add Category
										<AddIcon />
									</span>
								</Button>
							</div>

							<ul className="custom-scrollbar flex max-h-[520px] flex-col gap-[8px] overflow-y-auto pr-[2px]">
								{loadingCategories && (
									<li
										className="rounded-[8px] border border-dashed border-divider px-[12px] py-[18px] text-center text-text-3"
										style={{ fontSize: 'var(--perm-text)' }}
									>
										Loading…
									</li>
								)}
								{!loadingCategories && filteredCategories.length === 0 && (
									<li
										className="rounded-[8px] border border-dashed border-divider px-[12px] py-[18px] text-center text-text-3"
										style={{ fontSize: 'var(--perm-text)' }}
									>
										No category found
									</li>
								)}
								{filteredCategories.map(cat => {
									const id = cat.access_category_Id ?? cat.id;
									const name = cat.access_category_Name || cat.name || '';
									const desc = cat.access_category_Description || cat.description || '';
									const isActive = id === selectedId;
									return (
										<li key={id}>
											<button
												type="button"
												onClick={() => setSelectedId(id)}
												className={`group relative flex w-full items-center justify-between rounded-[8px] border px-[12px] py-[10px] text-left transition ${
													isActive
														? 'border-brand-light bg-[color-mix(in_srgb,var(--secondary-color)_10%,var(--card-color))]'
														: 'border-divider bg-card hover:border-brand-light/60'
												}`}
											>
												<div className="min-w-0">
													<div
														className={`truncate font-semibold leading-tight ${isActive ? 'text-brand-light' : 'text-text-1'}`}
														style={{ fontSize: 'var(--perm-text)' }}
													>
														{name}
													</div>
													{desc && (
														<div className="truncate text-text-3" style={{ fontSize: 'var(--perm-text)' }}>
															{desc}
														</div>
													)}
												</div>
												<div
													className={`flex items-center gap-[6px] ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}
												>
													<span
														role="button"
														tabIndex={0}
														onClick={e => {
															e.stopPropagation();
															openEditCategory(cat);
														}}
														onKeyDown={e => {
															if (e.key === 'Enter') {
																e.stopPropagation();
																openEditCategory(cat);
															}
														}}
														className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[4px] text-text-2 hover:bg-field hover:text-text-1"
														aria-label="Edit group"
													>
														<EditIcon className="h-[13px] w-[13px]" />
													</span>
													<span
														role="button"
														tabIndex={0}
														onClick={e => {
															e.stopPropagation();
															deleteCategory(id);
														}}
														onKeyDown={e => {
															if (e.key === 'Enter') {
																e.stopPropagation();
																deleteCategory(id);
															}
														}}
														className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[4px] text-red-500 hover:bg-red-500/10 hover:text-red-600"
														aria-label="Delete group"
													>
														<DeleteIcon className="h-[13px] w-[13px]" />
													</span>
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
						<div className="relative z-[1] flex items-center">
							<SectionTab
								title="Permissions"
								subtitle={
									selectedCategory
										? `${permissions.length} permissions for ${selectedCategory.access_category_Name || selectedCategory.name}`
										: `${permissions.length} Permission(s)`
								}
							/>
						</div>
						<div className="-mt-px min-h-[420px] rounded-[0_10px_10px_10px] border border-divider bg-card p-[12px] shadow-sm">
							<div className="mb-[12px] flex items-center gap-[8px]">
								<Input
									id="permission-search"
									placeholder="Search Permissions"
									value={permissionSearch}
									onChange={e => setPermissionSearch(e.target.value)}
									className="!min-h-[32px] !py-1 text-[12px]"
								/>
								<Button
									onClick={openAddPermission}
									disabled={!selectedCategory}
									className="!min-h-[32px] !rounded-[6px] !px-[12px] !py-[6px] !text-[12px] whitespace-nowrap"
								>
									<span className="inline-flex items-center gap-[4px]">
										Add Permission
										<AddIcon />
									</span>
								</Button>
							</div>

							{loadingPermissions ? (
								<p className="py-12 text-center text-text-3" style={{ fontSize: 'var(--perm-text)' }}>
									Loading…
								</p>
							) : !selectedCategory ? (
								<p className="py-12 text-center text-text-3" style={{ fontSize: 'var(--perm-text)' }}>
									Select a group to view permissions.
								</p>
							) : filteredPermissions.length === 0 ? (
								<p className="py-12 text-center text-text-3" style={{ fontSize: 'var(--perm-text)' }}>
									No permissions in this group yet.
								</p>
							) : (
								<div className="flex flex-wrap gap-[8px]">
									{filteredPermissions.map(perm => {
										const id = perm.access_Id ?? perm.id;
										return (
											<span
												key={id}
												className="inline-flex items-center gap-[6px] rounded-[6px] border border-brand-light/40 bg-[color-mix(in_srgb,var(--secondary-color)_14%,var(--card-color))] px-[10px] py-[5px] font-medium text-text-1"
												style={{ fontSize: 'var(--perm-chip)' }}
											>
												<span className="leading-none">{perm.access_Name}</span>
												<button
													type="button"
													onClick={() => openEditPermission(perm)}
													className="inline-flex h-[16px] w-[16px] items-center justify-center text-text-2 hover:text-brand-light"
													aria-label={`Edit ${perm.access_Name}`}
												>
													<EditIcon className="h-[11px] w-[11px]" />
												</button>
												<button
													type="button"
													onClick={() => deletePermission(perm)}
													className="inline-flex h-[16px] w-[16px] items-center justify-center text-text-2 hover:text-red-500"
													aria-label={`Delete ${perm.access_Name}`}
												>
													<DeleteIcon className="h-[13px] w-[13px]" />
												</button>
											</span>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Category (Group) modal — create/update via the category API */}
				<Modal
					open={categoryModal.open}
					onClose={closeCategoryModal}
					title={categoryModal.mode === 'edit' ? 'Edit Category' : 'Add Category'}
					footer={
						<>
							<Button
								variant="outline"
								onClick={closeCategoryModal}
								className="!min-h-[32px] !rounded-[6px] !px-[18px] !py-[6px] !text-[12px]"
							>
								Cancel
							</Button>
							<Button onClick={saveCategory} className="!min-h-[32px] !rounded-[6px] !px-[22px] !py-[6px] !text-[12px]">
								{categoryModal.mode === 'edit' ? 'Update' : 'Add'}
							</Button>
						</>
					}
				>
					<div className="flex flex-col gap-[12px]">
						<Input
							id="cat-name"
							label="Category Name"
							placeholder="Enter Category Name"
							value={categoryModal.name}
							error={catNameError}
							onChange={e => {
								setCategoryModal(m => ({ ...m, name: e.target.value }));
								setCatNameError('');
							}}
							required
						/>
						<Input
							id="cat-desc"
							label="Description"
							placeholder="Short Description"
							value={categoryModal.description}
							onChange={e => setCategoryModal(m => ({ ...m, description: e.target.value }))}
						/>
					</div>
				</Modal>

				{/* Permission modal */}
				<Modal
					open={permissionModal.open}
					onClose={closePermissionModal}
					title={permissionModal.mode === 'edit' ? 'Edit Permission' : 'Add Permission'}
					footer={
						<>
							<Button
								variant="outline"
								onClick={closePermissionModal}
								className="!min-h-[32px] !rounded-[6px] !px-[18px] !py-[6px] !text-[12px]"
							>
								Cancel
							</Button>
							<Button
								onClick={savePermission}
								className="!min-h-[32px] !rounded-[6px] !px-[22px] !py-[6px] !text-[12px]"
							>
								{permissionModal.mode === 'edit' ? 'Update' : 'Add'}
							</Button>
						</>
					}
				>
					<div className="flex flex-col gap-[12px]">
						<Input
							id="perm-name"
							label="Permission Name"
							placeholder="e.g. View Patient Records"
							value={permissionModal.access_Name}
							error={permErrors.access_Name}
							onChange={e => {
								const name = e.target.value;
								setPermissionModal(m => ({ ...m, access_Name: name }));
								setPermErrors(p => ({ ...p, access_Name: '' }));
								// Trigger debounced API call only when key hasn't been manually edited
								if (!permissionModal.keyTouched) generateKeyFromName(name);
							}}
							required
						/>
						<div className="flex flex-col gap-[4px]">
							<Input
								id="perm-key"
								label={
									<span className="inline-flex items-center gap-[6px]">
										Permission Key
										{keyLoading && (
											<svg className="h-[12px] w-[12px] animate-spin text-brand-light" viewBox="0 0 24 24" fill="none">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
											</svg>
										)}
									</span>
								}
								placeholder="e.g. VIEW_PATIENT_RECORDS"
								value={permissionModal.access_Key}
								error={permErrors.access_Key}
								onChange={e => {
									setPermissionModal(m => ({
										...m,
										access_Key: e.target.value,
										keyTouched: true
									}));
									setPermErrors(p => ({ ...p, access_Key: '' }));
								}}
								required
							/>
							{!permissionModal.keyTouched && permissionModal.access_Name && (
								<p className="text-[10.5px] text-text-3 pl-[2px]">Auto-generated from name — edit to override</p>
							)}
							{permissionModal.keyTouched && permissionModal.mode === 'add' && (
								<button
									type="button"
									onClick={() => {
										setPermissionModal(m => ({ ...m, keyTouched: false, access_Key: '' }));
										generateKeyFromName(permissionModal.access_Name);
									}}
									className="self-start text-[10.5px] text-brand-light hover:underline pl-[2px]"
								>
									↺ Reset to auto-generated
								</button>
							)}
						</div>
						{/* ── URL tag input ─────────────────────────────────────────── */}
						<div className="flex flex-col gap-[4px]">
							<label className="form-label">
								Permission URL <span className="text-text-3 font-normal">(Optional)</span>
							</label>

							{/* Tag box */}
							<div
								className={`flex min-h-[38px] flex-wrap items-center gap-[6px] rounded-[6px] border px-[10px] py-[6px] cursor-text transition
                ${permErrors.access_URL ? 'border-red-400 bg-red-50' : 'border-divider bg-card focus-within:border-brand-light'}`}
								onClick={e => e.currentTarget.querySelector('input')?.focus()}
							>
								{/* Existing URL chips */}
								{permissionModal.urlTags.map((tag, i) => (
									<span
										key={i}
										className="inline-flex items-center gap-[4px] rounded-[4px] bg-brand-light/10 border border-brand-light/30 px-[8px] py-[2px] text-[11px] text-brand-light font-medium"
									>
										{tag}
										<button
											type="button"
											onClick={() => {
												setPermissionModal(m => ({
													...m,
													urlTags: m.urlTags.filter((_, idx) => idx !== i)
												}));
												setPermErrors(p => ({ ...p, access_URL: '' }));
											}}
											className="ml-[1px] flex items-center opacity-70 hover:opacity-100 transition"
											aria-label={`Remove ${tag}`}
										>
											<DeleteIcon className="h-[11px] w-[11px]" />
										</button>
									</span>
								))}

								{/* New URL input */}
								<input
									id="perm-url"
									type="text"
									value={permissionModal.urlInput}
									placeholder={
										permissionModal.urlTags.length === 0 ? 'e.g. /patients, /patients/list' : 'Add another URL…'
									}
									className="min-w-[160px] flex-1 bg-transparent text-[12px] text-text-1 outline-none placeholder:text-text-disabled"
									onChange={e => {
										setPermissionModal(m => ({ ...m, urlInput: e.target.value }));
										setPermErrors(p => ({ ...p, access_URL: '' }));
									}}
									onKeyDown={e => {
										// Add tag on Enter or comma
										if (e.key === 'Enter' || e.key === ',') {
											e.preventDefault();
											const val = permissionModal.urlInput.trim().replace(/,+$/, '');
											if (val && !permissionModal.urlTags.includes(val)) {
												setPermissionModal(m => ({
													...m,
													urlTags: [...m.urlTags, val],
													urlInput: ''
												}));
											} else {
												setPermissionModal(m => ({ ...m, urlInput: '' }));
											}
										}
										// Backspace on empty input removes last tag
										if (e.key === 'Backspace' && !permissionModal.urlInput && permissionModal.urlTags.length > 0) {
											setPermissionModal(m => ({
												...m,
												urlTags: m.urlTags.slice(0, -1)
											}));
										}
									}}
									onBlur={() => {
										const val = permissionModal.urlInput.trim().replace(/,+$/, '');
										if (val && !permissionModal.urlTags.includes(val)) {
											setPermissionModal(m => ({
												...m,
												urlTags: [...m.urlTags, val],
												urlInput: ''
											}));
										}
									}}
								/>
							</div>

							{permErrors.access_URL && <p className="text-[11px] text-red-500">{permErrors.access_URL}</p>}
							{!permErrors.access_URL && (
								<p className="text-[10.5px] text-text-3">
									Press <kbd className="rounded bg-field px-[4px] py-[1px] font-mono text-[10px]">Enter</kbd> or{' '}
									<kbd className="rounded bg-field px-[4px] py-[1px] font-mono text-[10px]">,</kbd> to add each URL
								</p>
							)}
						</div>
					</div>
				</Modal>
			</div>
		</TableLayout>
	);
};

export default PermissionGroup;
