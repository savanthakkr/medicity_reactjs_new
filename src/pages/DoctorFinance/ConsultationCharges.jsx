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
import ConfirmationModal from "../../components/common/ConfirmationModal.jsx";
import ChargeHistoryModal from "./ChargeHistoryModal.jsx";
import dayjs from "dayjs";
import http from "../../lib/axios/axios";
import { usePermissions } from '../../hooks/usePermissions';
import Unauthorized from '../Unauthorized';
import { PERM } from '../../utils/constants/permissionKey2';

const ConsultationCharges = () => {
	const addToast = useSetAtom(addToastAtom);
	const setConfirm = useSetAtom(confirmAtom);
	const navigate = useNavigate();
	const { can, canAll } = usePermissions();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortConfig, setSortConfig] = useState({ key: 'doc_Name', direction: 'asc' });
	const [search, setSearch] = useState('');
	const [activeFilter, setActiveFilter] = useState({
		active: true,
		inactive: false
	});
	const [historyModal, setHistoryModal] = useState({ open: false, doctor: null });

	const canView = can(PERM.CONSULTATION_CHARGE.LIST);
	const canAdd = canAll(PERM.CONSULTATION_CHARGE.LIST, PERM.CONSULTATION_CHARGE.ADD);
	const canEdit = canAll(PERM.CONSULTATION_CHARGE.LIST, PERM.CONSULTATION_CHARGE.EDIT);
	const canDelete = canAll(PERM.CONSULTATION_CHARGE.LIST, PERM.CONSULTATION_CHARGE.DELETE);
	const canViewHistory = canAll(PERM.CONSULTATION_CHARGE.LIST, PERM.CONSULTATION_CHARGE.VIEW);

	const is_active_val = useMemo(() => {
		if (activeFilter.active && !activeFilter.inactive) return 1;
		if (activeFilter.inactive && !activeFilter.active) return 0;
		return undefined;
	}, [activeFilter]);

	const { data, loading, mutate } = useAutoRevalidate(API.DOC_CHARGES.LIST, {
		page,
		limit: pageSize,
		sortBy: sortConfig.key,
		sortOrder: sortConfig.direction,
		search,
		is_active: is_active_val,
		show_deleted: 0
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
			{ id: 'active', label: 'Active Doctors', checked: activeFilter.active },
			{ id: 'inactive', label: 'Inactive Doctors', checked: activeFilter.inactive }
		],
		[activeFilter]
	);

	const handleHistoryClick = item => {
		// History modal expects a doctor object with doc_Id
		setHistoryModal({ open: true, doctor: { doc_Id: item.doc_Id, doc_Name: item.doc_Name } });
	};

	const handleDeleteClick = id => {
		setConfirm({
			isOpen: true,
			title: 'Delete Consultation Charge',
			message: 'Are you sure you want to delete this consultation charge? This action cannot be undone.',
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
			onConfirm: async () => {
				try {
					await http.post(API.DOC_CHARGES.DELETE(id));
					addToast({ type: 'success', message: 'Charge deleted successfully' });
					mutate();
				} catch (error) {
					console.error(error);
					addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to delete charge' });
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
            <span className="text-[11px] text-text-3 font-mono">{item.doc_Code}</span>
          </div>
        )
      },
      {
        key: "department_Name",
        label: "Department",
        widthClassName: "min-w-[150px]",
        render: (item) => <span className="text-text-2">{item.department_Name}</span>
      },
      {
        key: "doc_charge_service_type_Name",
        label: "Service Type",
        widthClassName: "min-w-[150px]",
        render: (item) => <span className="font-semibold text-text-1">{item.doc_charge_service_type_Name}</span>
      },
      {
        key: "doc_charge_Amount",
        label: "Amount (₹)",
        widthClassName: "min-w-[120px]",
        render: (item) => <span className="text-brand-light font-bold">₹{parseFloat(item.doc_charge_Amount).toFixed(2)}</span>
      },
      {
        key: "doc_charge_Effective_From",
        label: "Effective From",
        widthClassName: "min-w-[150px]",
        render: (item) => <span className="text-text-2">{dayjs(item.doc_charge_Effective_From).format("DD MMM YYYY")}</span>
      },
      {
        key: "status",
        label: "Status",
        widthClassName: "w-[100px]",
        render: (item) => (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${item.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {item.is_active ? "Active" : "Inactive"}
          </span>
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
            onView={canViewHistory ? () => navigate(ROUTES.VIEW_DOCTOR_CONSULTATION_CHARGE.replace(':id', item.doc_charge_Id)) : undefined} 
            onEdit={canEdit ? () => navigate(ROUTES.EDIT_DOCTOR_CONSULTATION_CHARGE.replace(':id', item.doc_charge_Id)) : undefined}
            onDelete={canDelete ? () => handleDeleteClick(item.doc_charge_Id) : undefined}
          />
        )
      });
    }

    return cols;
  }, [page, pageSize, navigate, canEdit, canDelete, canViewHistory]);

  if (!canView) return <Unauthorized />;

  return (
    <TableLayout
      title="Doctor Consultation Fee"
      addLabel={canAdd ? "Add Consultation" : undefined}
      addAction={canAdd ? ROUTES.ADD_DOCTOR_CONSULTATION_CHARGE : undefined}
      filterContent={
        <div className="flex items-center gap-2">
          <TableSearch onSearch={handleSearch} placeholder="Search by Doctor Name or Code" />
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


			<ChargeHistoryModal
				open={historyModal.open}
				onClose={() => setHistoryModal({ open: false, doctor: null })}
				doctor={historyModal.doctor}
			/>
		</TableLayout>
	);
};

export default ConsultationCharges;
