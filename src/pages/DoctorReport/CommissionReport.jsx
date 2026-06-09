import React, { useMemo, useState, useEffect } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../data/states/toastAtom';
import { API } from '../../data/apis/endpoints';
import { useAutoRevalidate } from '../../hooks/useAutoRevalidate';
import CommonTable from '../../components/common/CommonTable.jsx';
import TableLayout from '../../components/common/TableLayout.jsx';
import TableSearch from '../../components/common/TableSearch.jsx';
import DateInput from '../../components/common/DateInput.jsx';
import Button from '../../components/common/Button';
import Filter from '../../components/common/Filter.jsx';
import { downloadExcel } from '@/utils/methods/downloadExcel';
import dayjs from 'dayjs';
import http from '../../lib/axios/axios';
import { usePermissions } from '../../hooks/usePermissions';
import Unauthorized from '../Unauthorized';
import { PERM } from '../../utils/constants/permissionKey2';

const CommissionReport = () => {
	const addToast = useSetAtom(addToastAtom);
	const { can } = usePermissions();
	const canView = can(PERM.DOCTOR_REPORT.COMMISSION);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'doc_Name', direction: 'asc' });
	const [search, setSearch] = useState('');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');

	const [activeFilter, setActiveFilter] = useState({
		active: true,
		inactive: true
	});
	const [checkedDoctors, setCheckedDoctors] = useState({});
	const [checkedDepts, setCheckedDepts] = useState({});

	const is_active_val = useMemo(() => {
		if (activeFilter.active && !activeFilter.inactive) return 1;
		if (activeFilter.inactive && !activeFilter.active) return 0;
		if (!activeFilter.active && !activeFilter.inactive) return -1;
		return undefined;
	}, [activeFilter]);

	const doc_Id_val = useMemo(() => {
		const checkedIds = Object.keys(checkedDoctors).filter(id => checkedDoctors[id]);
		if (checkedIds.length === 1) return checkedIds[0];
		return undefined;
	}, [checkedDoctors]);

	const department_Id_val = useMemo(() => {
		const checkedIds = Object.keys(checkedDepts).filter(id => checkedDepts[id]);
		if (checkedIds.length === 1) return checkedIds[0];
		return undefined;
	}, [checkedDepts]);

	const [doctors, setDoctors] = useState([]);
	const [departments, setDepartments] = useState([]);

  const filterOptions = useMemo(() => {
    const list = [
      { id: "active", label: "Active", checked: activeFilter.active },
      { id: "inactive", label: "Inactive", checked: activeFilter.inactive }
    ];

    departments.forEach(dept => {
      list.push({
        id: `dept_${dept.value}`,
        label: dept.label,
        checked: !!checkedDepts[dept.value],
        group: "Department"
      });
    });

    doctors.forEach(doc => {
      list.push({
        id: `doc_${doc.value}`,
        label: doc.label,
        checked: !!checkedDoctors[doc.value],
        group: "Doctor"
      });
    });

		return list;
	}, [activeFilter, doctors, checkedDoctors, departments, checkedDepts]);

	const dateOptions = useMemo(
		() => [
			{ id: 'date_from', label: 'From Date', value: dateFrom },
			{ id: 'date_to', label: 'To Date', value: dateTo }
		],
		[dateFrom, dateTo]
	);

	const handleFilterToggle = id => {
		if (id === 'active' || id === 'inactive') {
			setActiveFilter(prev => ({
				...prev,
				[id]: !prev[id]
			}));
		} else if (id.startsWith('doc_')) {
			const docVal = id.replace('doc_', '');
			setCheckedDoctors(prev => ({
				...prev,
				[docVal]: !prev[docVal]
			}));
		} else if (id.startsWith('dept_')) {
			const deptVal = id.replace('dept_', '');
			setCheckedDepts(prev => ({
				...prev,
				[deptVal]: !prev[deptVal]
			}));
		}
		setPage(1);
	};

	const handleDateChange = (id, value) => {
		if (id === 'date_from') {
			setDateFrom(value);
		} else if (id === 'date_to') {
			setDateTo(value);
		}
		setPage(1);
	};

  // Load dropdown datasets
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [docsRes, deptsRes] = await Promise.all([
          http.post(API.DOCTORS.LIST, { page: 1, limit: 500 }),
          http.post(API.DEPARTMENTS.LIST, { page: 1, limit: 200 })
        ]);
        const docsList = docsRes?.list || docsRes?.data?.list || [];
        const deptsList = deptsRes?.data?.list || deptsRes?.list || [];
        setDoctors(docsList.map(d => ({ value: String(d.doc_Id), label: `${d.doc_Name} (${d.doc_Code || "No ID"})` })));
        setDepartments(deptsList.map(d => ({ value: String(d.department_Id), label: d.department_Name })));

				const initialDocs = {};
				docsList.forEach(d => {
					initialDocs[String(d.doc_Id)] = true;
				});
				setCheckedDoctors(initialDocs);

				const initialDepts = {};
				deptsList.forEach(d => {
					initialDepts[String(d.department_Id)] = true;
				});
				setCheckedDepts(initialDepts);
			} catch (error) {
				console.error('Failed to load filter dropdowns:', error);
			}
		};
		loadFilters();
	}, []);

	const { data, loading } = useAutoRevalidate(API.REPORTS.COMMISSION, {
		page,
		limit: pageSize,
		sortBy: sortConfig.key,
		sortOrder: sortConfig.direction,
		search: search || undefined,
		doc_Id: doc_Id_val,
		department_Id: department_Id_val,
		is_active: is_active_val,
		date_from: dateFrom || undefined,
		date_to: dateTo || undefined
	});

	const handleSearch = value => {
		setSearch(value);
		setPage(1);
	};

	const handleDownloadExcel = async () => {
		try {
			await downloadExcel({
				url: API.REPORTS.COMMISSION_EXPORT,
				fileName: 'commission_report.xlsx',
				payload: {
					search: search || undefined,
					doc_Id: doc_Id_val,
					department_Id: department_Id_val,
					is_active: is_active_val,
					date_from: dateFrom || undefined,
					date_to: dateTo || undefined
				}
			});
			addToast({ type: 'success', message: 'Commission report exported successfully' });
		} catch (error) {
			console.error(error);
			addToast({ type: 'error', message: 'Failed to download commission report' });
		}
	};

	const columns = useMemo(
		() => [
			{
				key: 'id',
				label: '#',
				widthClassName: 'w-[50px]',
				render: (_, index) => <span>{(page - 1) * pageSize + index + 1}</span>
			},
			{
				key: 'doc_Name',
				label: 'Doctor Profile',
				widthClassName: 'min-w-[180px]',
				render: item => (
					<div className="flex flex-col">
						<span className="font-semibold text-text-1">{item.doc_Name}</span>
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
				widthClassName: 'min-w-[150px]',
				render: item => <span className="text-text-2">{item.department_Name || '—'}</span>
			},
			{
				key: 'doc_commission_Type',
				label: 'Rule Type',
				widthClassName: 'min-w-[120px]',
				render: item => <span className="text-text-2">{item.doc_commission_Type}</span>
			},
			{
				key: 'doc_commission_Value',
				label: 'Value',
				widthClassName: 'min-w-[120px]',
				render: item => (
					<span className="text-text-2 font-medium">
						{item.doc_commission_Type === 'Percentage'
							? `${item.doc_commission_Value}%`
							: `₹${parseFloat(item.doc_commission_Value).toFixed(2)}`}
					</span>
				)
			},
			{
				key: 'doc_commission_Effective_From',
				label: 'Effective From',
				widthClassName: 'min-w-[130px]',
				render: item => (
					<span className="text-text-2">
						{item.doc_commission_Effective_From ? dayjs(item.doc_commission_Effective_From).format('DD MMM YYYY') : '—'}
					</span>
				)
			},
			{
				key: 'doc_commission_Effective_To',
				label: 'Effective To',
				widthClassName: 'min-w-[130px]',
				render: item => (
					<span className="text-text-2">
						{item.doc_commission_Effective_To
							? dayjs(item.doc_commission_Effective_To).format('DD MMM YYYY')
							: 'Present'}
					</span>
				)
			},
			{
				key: 'approval_status',
				label: 'Approval',
				widthClassName: 'min-w-[110px]',
				render: item => (
					<span
						className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
							item.approval_status_Name === 'Approved'
								? 'bg-green-100 text-green-700'
								: item.approval_status_Name === 'Rejected'
									? 'bg-red-100 text-red-700'
									: 'bg-yellow-100 text-yellow-700'
						}`}
					>
						{item.approval_status_Name || 'Pending'}
					</span>
				)
			},
			{
				key: 'is_active',
				label: 'Status',
				widthClassName: 'w-[100px]',
				render: item => (
					<span
						className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
							item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
						}`}
					>
						{item.is_active ? 'Active' : 'Inactive'}
					</span>
				)
			}
		],
		[page, pageSize]
	);

	if (!canView) return <Unauthorized />;

	return (
		<TableLayout
			title="Doctor Commission Configuration Report"
			extraAction={
				<Button
					variant="unstyled"
					onClick={handleDownloadExcel}
					className="inline-flex h-[29px] items-center rounded-[6px] border border-[#1eafc0] bg-transparent px-[13px] py-[6px] font-semibold leading-none text-text-1 transition hover:brightness-95"
					style={{ fontSize: 'var(--entity-add-text)' }}
				>
					Download Excel
				</Button>
			}
			filterContent={
				<div className="flex flex-wrap items-center gap-3">
					<TableSearch onSearch={handleSearch} placeholder="Search by type..." />

					<Filter
						options={filterOptions}
						onChange={handleFilterToggle}
						dateOptions={dateOptions}
						onDateChange={handleDateChange}
					/>
				</div>
			}
		>
			<CommonTable
				columns={columns}
				sortableColumns={['doc_Name', 'doc_commission_Effective_From', 'doc_commission_Value']}
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
		</TableLayout>
	);
};

export default CommissionReport;
