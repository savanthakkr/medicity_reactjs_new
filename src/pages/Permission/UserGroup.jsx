import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { fontSizeAtom } from '../../data/states/appAtoms.js';
import ROUTES from '../../utils/constants/routes';
import TableLayout from '../../components/common/TableLayout.jsx';
import CommonTable from '../../components/common/CommonTable.jsx';
import CommonPagination from '../../components/common/CommonPagination.jsx';
import EditIcon from '../../assets/icons/EditIcon.jsx';
import DeleteIcon from '../../assets/icons/DeleteIcon.jsx';
import { userListApi, deleteUserApi } from '../../data/apis';
import { BROWSER_STORAGE_KEYS } from '../../utils/constants/browserStorageKeys';
import { getDataInBrowser } from '../../utils/methods/DataInBrowser';
import { useConfirm } from '../../hooks/useConfirm';

const PAGE_SCALES = {
	small: {
		'--ug-title': '14px',
		'--ug-table-text': '10px',
		'--ug-footer-text': '10px',
		'--ug-add-text': '10px'
	},
	medium: {
		'--ug-title': '20px',
		'--ug-table-text': '12px',
		'--ug-footer-text': '12px',
		'--ug-add-text': '12px'
	},
	large: {
		'--ug-title': '24px',
		'--ug-table-text': '16px',
		'--ug-footer-text': '16px',
		'--ug-add-text': '16px'
	}
};

const UserGroup = () => {
	const navigate = useNavigate();
	const fontSize = useAtomValue(fontSizeAtom) || 'medium';
	const scale = PAGE_SCALES[fontSize] ?? PAGE_SCALES.medium;

	const authUser = getDataInBrowser(BROWSER_STORAGE_KEYS.authUser) || {};
	const clientId = authUser?.user?.client_id ?? authUser?.client_id ?? 1;

	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const confirm = useConfirm();
	const [pageSize, setPageSize] = useState(20);

	const fetchUsers = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await userListApi({ client_Id: clientId });
			setUsers(res?.data || []);
		} catch (err) {
			setError(err?.data?.message || 'Failed to load users');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDelete = user => {
		const id = user.user_Id ?? user.id;
		confirm({
			title: 'Delete User',
			message: `Are you sure you want to delete ${user.user_Name || 'this user'}?`,
			confirmLabel: 'Delete',
			onConfirm: async () => {
				try {
					await deleteUserApi(id);
					await fetchUsers();
				} catch (err) {
					setError(err?.data?.message || 'Failed to delete user');
				}
			}
		});
	};

	const totalItems = users.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const pagedUsers = useMemo(() => {
		const start = (page - 1) * pageSize;
		return users.slice(start, start + pageSize);
	}, [users, page, pageSize]);

	const columns = useMemo(
		() => [
			{
				key: 'id',
				label: '#',
				widthClassName: 'w-[50px]',
				render: (_, index) => <span>{(page - 1) * pageSize + index + 1}</span>
			},
			{
				key: 'name',
				label: 'Persons Name',
				widthClassName: '',
				render: u => <span className="font-bold text-text-1">{u.user_Name || u.name || '—'}</span>
			},
			{
				key: 'email',
				label: 'Email',
				widthClassName: '',
				render: u => <span className="text-text-2">{u.user_Email || '—'}</span>
			},
			{
				key: 'group',
				label: 'Group',
				widthClassName: '',
				render: u => {
					const names = u.access_group_Names ? u.access_group_Names.split(', ').filter(Boolean) : [];
					if (names.length === 0) return <span className="text-text-3">—</span>;
					return (
						<div className="flex flex-wrap gap-1">
							{names.map(name => (
								<span
									key={name}
									className="inline-block rounded-full border border-brand-light px-2 py-0.5 text-[11px] font-medium text-brand-light"
								>
									{name}
								</span>
							))}
						</div>
					);
				}
			},
			{
				key: 'actions',
				label: 'Action',
				widthClassName: '',
				render: u => {
					const id = u.user_Id ?? u.id;
					return (
						<div className="flex gap-2">
							<button
								type="button"
								className="inline-flex h-[15px] w-[15px] items-center justify-center text-[#66727d] transition hover:text-text-1"
								onClick={() => navigate(ROUTES.EDIT_USER.replace(':id', id))}
								aria-label="Edit user"
							>
								<EditIcon className="h-[15px] w-[15px]" />
							</button>
							<button
								type="button"
								className="inline-flex h-[15px] w-[15px] items-center justify-center transition hover:opacity-80"
								onClick={() => handleDelete(u)}
								aria-label="Delete user"
							>
								<DeleteIcon className="h-[15px] w-[15px]" />
							</button>
						</div>
					);
				}
			}
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[navigate]
	);

	return (
		<TableLayout title="User Group" addLabel="Add User" addAction={ROUTES.ADD_USER}>
			<div style={scale}>
				{error && (
					<div className="mb-[10px] rounded-[6px] bg-red-50 px-[12px] py-[8px] text-[12px] text-red-600">{error}</div>
				)}

				{loading ? (
					<p className="py-12 text-center text-text-3 text-[13px]">Loading…</p>
				) : (
					<CommonTable columns={columns} data={pagedUsers} style={scale} />
				)}

				<CommonPagination
					currentPage={page}
					totalPages={totalPages}
					pageSize={pageSize}
					totalItems={totalItems}
					onPageChange={setPage}
					onPageSizeChange={size => {
						setPageSize(size);
						setPage(1);
					}}
					style={scale}
				/>
			</div>
		</TableLayout>
	);
};

export default UserGroup;
