import React, { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { addToastAtom } from "../../data/states/toastAtom";
import { confirmAtom } from "../../data/states/confirmAtom";
import { API } from "../../data/apis/endpoints";
import ROUTES from "../../utils/constants/routes";
import { useAutoRevalidate } from "../../hooks/useAutoRevalidate";
import CommonTable from "../../components/common/CommonTable.jsx";
import TableLayout from "../../components/common/TableLayout.jsx";
import TableSearch from "../../components/common/TableSearch.jsx";
import Filter from "../../components/common/Filter.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import Switch from "../../components/common/Switch.jsx";
import CommissionHistoryModal from "./CommissionHistoryModal.jsx";
import dayjs from "dayjs";
import http from "../../lib/axios/axios";
import { usePermissions } from '../../hooks/usePermissions';
import Unauthorized from '../Unauthorized';
import { PERM } from '../../utils/constants/permissionKey2';

const CommissionList = () => {
	const addToast = useSetAtom(addToastAtom);
	const setConfirm = useSetAtom(confirmAtom);
	const navigate = useNavigate();
	const { can, canAll } = usePermissions();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
	const [search, setSearch] = useState('');
	const [activeFilter, setActiveFilter] = useState({
		active: true,
		inactive: false
	});
	const [historyModal, setHistoryModal] = useState({ open: false, doctor: null });
	const [togglingId, setTogglingId] = useState(null);

	const canView = can(PERM.COMMISSION.LIST);
	const canAdd = canAll(PERM.COMMISSION.LIST, PERM.COMMISSION.ADD);
	const canEdit = canAll(PERM.COMMISSION.LIST, PERM.COMMISSION.EDIT);
	const canDelete = canAll(PERM.COMMISSION.LIST, PERM.COMMISSION.DELETE);
	const canStatus = canAll(PERM.COMMISSION.LIST, PERM.COMMISSION.STATUS);
	const canViewHistory = canAll(PERM.COMMISSION.LIST, PERM.COMMISSION.VIEW);

	const is_active_val = useMemo(() => {
		if (activeFilter.active && !activeFilter.inactive) return 1;
		if (activeFilter.inactive && !activeFilter.active) return 0;
		return undefined;
	}, [activeFilter]);

	const { data, loading, mutate } = useAutoRevalidate(API.DOC_COMMISSIONS.LIST, {
		page,
		limit: pageSize,
		sortBy: sortConfig.key,
		sortOrder: sortConfig.direction,
		search,
		is_active: is_active_val
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

	const filterOptions = useMemo(
		() => [
			{ id: 'active', label: 'Active Commissions', checked: activeFilter.active },
			{ id: 'inactive', label: 'Inactive Commissions', checked: activeFilter.inactive }
		],
		[activeFilter]
	);

	const handleHistoryClick = item => {
		setHistoryModal({ open: true, doctor: { doc_Id: item.doc_Id, doc_Name: item.doc_Name } });
	};

	const handleStatusToggle = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1;
		setTogglingId(id);
		try {
			await http.put(API.DOC_COMMISSIONS.STATUS(id), { inputData: { is_active: newStatus } });
			const updatedList = data?.list?.map(item =>
				item.doc_commission_Id === id ? { ...item, is_active: newStatus } : item
			);
			if (updatedList) {
				mutate({ ...data, list: updatedList }, false);
			}
		} catch (error) {
			console.error('Status update failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to update status' });
		} finally {
			setTogglingId(null);
		}
	};

	const handleDeleteClick = id => {
		setConfirm({
			isOpen: true,
			title: 'Delete Commission Configuration',
			message: 'Are you sure you want to delete this commission setup? This action cannot be undone.',
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
			onConfirm: async () => {
				try {
					await http.post(API.DOC_COMMISSIONS.DELETE(id));
					addToast({ type: 'success', message: 'Commission configuration deleted successfully' });
					mutate();
				} catch (error) {
					console.error(error);
					addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to delete commission' });
				}
			}
		});
	};

  const columns = useMemo(() => {
    const cols = [
      {
        key: "id",
        label: "#",
        widthClassName: "w-[50px]",
        render: (_, index) => <span>{(page - 1) * pageSize + index + 1}</span>
      },
      {
        key: "doc_Name",
        label: "Doctor Profile",
        widthClassName: "min-w-[200px]",
        render: (item) => (
          <div className="flex flex-col">
            <span className="font-semibold text-text-1">{item.doc_Name}</span>
          </div>
        )
      },
      {
        key: "doc_Code",
        label: "Doctor Id",
        widthClassName: "min-w-[120px]",
        render: (item) => <span className="text-text-2">{item.doc_Code || "—"}</span>
      },
      {
        key: "department_Name",
        label: "Department",
        widthClassName: "min-w-[150px]",
        render: (item) => <span className="text-text-2">{item.department_Name || "—"}</span>
      },
      {
        key: "doc_commission_Type",
        label: "Rule Type",
        widthClassName: "min-w-[120px]",
        render: (item) => <span className="text-text-2">{item.doc_commission_Type}</span>
      },
      {
        key: "doc_commission_Value",
        label: "Value",
        widthClassName: "min-w-[120px]",
        render: (item) => (
          <span className="text-text-2">
            {item.doc_commission_Type === "Percentage" ? `${item.doc_commission_Value}%` : `₹${parseFloat(item.doc_commission_Value).toFixed(2)}`}
          </span>
        )
      },
      {
        key: "doc_commission_Effective_From",
        label: "Effective From",
        widthClassName: "min-w-[150px]",
        render: (item) => <span className="text-text-2">{dayjs(item.doc_commission_Effective_From).format("DD MMM YYYY")}</span>
      },
      {
        key: "approval_status",
        label: "Approval",
        widthClassName: "min-w-[120px]",
        render: (item) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.approval_status_Name === 'Approved' ? 'bg-green-100 text-green-800' :
            item.approval_status_Name === 'Rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {item.approval_status_Name || 'Pending'}
          </span>
        )
      },
      {
        key: "status",
        label: "Active Status",
        widthClassName: "w-[120px]",
        render: (item) => (
          <div title={item.is_active ? "Active" : "Inactive"} className="inline-block">
            <Switch 
              checked={item.is_active === 1} 
              disabled={!canStatus || togglingId === item.doc_commission_Id} 
              onChange={() => {
                if (!canStatus) return;
                handleStatusToggle(item.doc_commission_Id, item.is_active);
              }}
            />
          </div>
        )
      }
    ];

    if (canEdit || canDelete || canViewHistory) {
      cols.push({
        key: "actions",
        label: "Actions",
        widthClassName: "w-[120px]",
        render: (item) => (
          <TableActions
            onView={canViewHistory ? () => navigate(ROUTES.VIEW_DOCTOR_COMMISSION.replace(':id', item.doc_commission_Id)) : undefined} 
            onEdit={canEdit ? () => navigate(ROUTES.EDIT_DOCTOR_COMMISSION.replace(':id', item.doc_commission_Id)) : undefined}
            onDelete={canDelete ? () => handleDeleteClick(item.doc_commission_Id) : undefined}
          />
        )
      });
    }

    return cols;
  }, [page, pageSize, navigate, data, togglingId, canStatus, canEdit, canDelete, canViewHistory]);

  if (!canView) return <Unauthorized />;

  return (
    <TableLayout
      title="Doctor Commission / IP Setup"
      addLabel={canAdd ? "Add Commission" : undefined}
      addAction={canAdd ? ROUTES.ADD_DOCTOR_COMMISSION : undefined}
      filterContent={
        <div className="flex items-center gap-2">
          <TableSearch onSearch={handleSearch} placeholder="Search by Doctor Name, Code, or Type" />
          <Filter options={filterOptions} onChange={handleFilterToggle} />
        </div>
      }
    >
      <CommonTable
        columns={columns}
        sortableColumns={["doc_Name"]}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        data={data?.list || []}
        loading={loading}
        currentPage={page}
        totalPages={data?.totalPages || 1}
        pageSize={pageSize}
        totalItems={data?.totalItems || 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

			<CommissionHistoryModal
				open={historyModal.open}
				onClose={() => setHistoryModal({ open: false, doctor: null })}
				doctor={historyModal.doctor}
			/>
		</TableLayout>
	);
};

export default CommissionList;
