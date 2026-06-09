import React, { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useAutoRevalidate } from '@/hooks/useAutoRevalidate';
import { API } from '@/data/apis/endpoints';
import CommonTable from '@/components/common/CommonTable.jsx';
import TableLayout from '@/components/common/TableLayout.jsx';
import TableSearch from '@/components/common/TableSearch.jsx';
import Filter from '@/components/common/Filter.jsx';
import TableActions from '@/components/common/TableActions.jsx';
import { useNavigate } from 'react-router-dom';
import ROUTES from '@/utils/constants/routes';
import { usePermissions } from '../../hooks/usePermissions';
import Unauthorized from '../Unauthorized';
import { PERM } from '../../utils/constants/permissionKey2';

const ACTION_BADGES = {
	Create: 'border-pill-approved text-pill-approved',
	Update: 'border-pill-submitted text-pill-submitted',
	Activate: 'border-pill-approved text-pill-approved',
	Deactivate: 'border-pill-rejected text-pill-rejected',
	Approve: 'border-pill-approved text-pill-approved',
	Reject: 'border-pill-rejected text-pill-rejected',
	'Send Back': 'border-pill-sent-back text-pill-sent-back',
	Upload: 'border-pill-draft text-pill-draft',
	Verify: 'border-pill-approved text-pill-approved'
};

const AuditTrail = () => {
	const navigate = useNavigate();
	const { can, canAll } = usePermissions();
	const canViewList = can(PERM.DOCTOR_AUDIT_TRAIL.LIST);
	const canViewDetails = canAll(PERM.DOCTOR_AUDIT_TRAIL.LIST, PERM.DOCTOR_AUDIT_TRAIL.VIEW);

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [search, setSearch] = useState('');
	const [sortConfig, setSortConfig] = useState({ key: 'changed_at', direction: 'desc' });

	// Filter state
	const [activeFilter, setActiveFilter] = useState({
		Create: true,
		Update: true,
		Deactivate: true,
		Approve: true,
		Reject: true,
		'Send Back': true
	});
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	// Compute backend parameter for action
	const action_val = useMemo(() => {
		const trues = Object.keys(activeFilter).filter(k => activeFilter[k]);
		if (trues.length === 6 || trues.length === 0) return undefined;
		if (trues.length === 1) return trues[0];
		return undefined;
	}, [activeFilter]);

	// Fetch logs using SWR wrapper
	const { data, loading } = useAutoRevalidate(API.DOCTORS.AUDIT_TRAIL, {
		page,
		limit: pageSize,
		search: search || undefined,
		action: action_val,
		startDate: startDate || undefined,
		endDate: endDate || undefined,
		sortBy: sortConfig.key,
		sortOrder: sortConfig.direction
	});

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

	const handleDateChange = (id, value) => {
		if (id === 'startDate') setStartDate(value);
		if (id === 'endDate') setEndDate(value);
		setPage(1);
	};

	const filterOptions = useMemo(
		() => [
			{ id: 'Create', label: 'Create', checked: activeFilter.Create, group: 'Action' },
			{ id: 'Update', label: 'Update', checked: activeFilter.Update, group: 'Action' },
			{ id: 'Deactivate', label: 'Deactivate', checked: activeFilter.Deactivate, group: 'Action' },
			{ id: 'Approve', label: 'Approve', checked: activeFilter.Approve, group: 'Action' },
			{ id: 'Reject', label: 'Reject', checked: activeFilter.Reject, group: 'Action' },
			{ id: 'Send Back', label: 'Send Back', checked: activeFilter['Send Back'], group: 'Action' }
		],
		[activeFilter]
	);

	const dateFilterOptions = useMemo(
		() => [
			{ id: 'startDate', label: 'Start Date', value: startDate },
			{ id: 'endDate', label: 'End Date', value: endDate }
		],
		[startDate, endDate]
	);

	const columns = useMemo(
		() => {
			const cols = [
				{
					key: 'index',
					label: '#',
					widthClassName: 'w-[50px]',
					render: (_, index) => <span>{(page - 1) * pageSize + index + 1}</span>
				},
				{
					key: 'changed_at',
					label: 'Date & Time',
					widthClassName: 'min-w-[150px]',
					render: item => {
						if (!item.changed_at) return <span className="text-text-2">—</span>;
						const date = new Date(item.changed_at);
						return (
							<span className="text-text-1 font-medium">
								{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</span>
						);
					}
				},
				{
					key: 'doctor_Name',
					label: 'Doctor',
					widthClassName: 'min-w-[160px]',
					render: item => <span className="font-medium text-text-1">{item.doctor_Name || '—'}</span>
				},
				{
					key: 'doctor_Code',
					label: 'Doctor ID',
					widthClassName: 'min-w-[120px]',
					render: item => (
						<span className="text-[11px] text-text-3 font-semibold tracking-wider uppercase">
							{item.doctor_Code || 'N/A'}
						</span>
					)
				},
				{
					key: 'doc_audit_Action',
					label: 'Action',
					widthClassName: 'w-[130px]',
					render: item => {
						const action = item.doc_audit_Action || 'Update';
						const badgeClass = ACTION_BADGES[action] || 'border-pill-draft text-pill-draft';
						return (
							<span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}>
								{action}
							</span>
						);
					}
				},
				{
					key: 'doc_audit_Field_Name',
					label: 'Field Modified',
					widthClassName: 'min-w-[140px]',
					render: item => {
						if (!item.doc_audit_Field_Name) return <span className="text-text-2">—</span>;
						return (
							<code className="px-1.5 py-0.5 rounded bg-field text-text-1 text-xs border border-divider">
								{item.doc_audit_Field_Name}
							</code>
						);
					}
				},
				{
					key: 'changed_by_name',
					label: 'Changed By',
					widthClassName: 'min-w-[130px]',
					render: item => <span className="text-text-2 font-medium">{item.changed_by_name || 'System'}</span>
				},
				{
					key: 'doc_audit_Remarks',
					label: 'Remarks',
					widthClassName: 'min-w-[200px]',
					render: item => (
						<span className="text-text-2 truncate block max-w-[220px]" title={item.doc_audit_Remarks}>
							{item.doc_audit_Remarks || '—'}
						</span>
					)
				}
			];

			if (canViewDetails) {
				cols.push({
					key: 'details',
					label: 'Details',
					widthClassName: 'w-[80px]',
					render: item => (
						<TableActions
							onView={() => navigate(ROUTES.DOCTOR_AUDIT_TRAIL_DETAILS.replace(':id', item.doc_audit_Id))}
						/>
					)
				});
			}

			return cols;
		},
		[page, pageSize, navigate, canViewDetails]
	);

	if (!canViewList) return <Unauthorized />;

	return (
		<TableLayout
			title="Audit Trail"
			filterContent={
				<div className="flex items-center gap-2">
					<TableSearch onSearch={handleSearch} placeholder="Search by remarks, doctor, user…" />
					<Filter 
						options={filterOptions} 
						dateOptions={dateFilterOptions}
						onChange={handleFilterToggle} 
						onDateChange={handleDateChange}
					/>
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
				sortableColumns={['changed_at', 'doctor_Name', 'changed_by_name', 'doc_audit_Remarks']}
				sortConfig={sortConfig}
				onSortChange={config => {
					setSortConfig(config);
					setPage(1);
				}}
			/>
		</TableLayout>
	);
};

export default AuditTrail;
