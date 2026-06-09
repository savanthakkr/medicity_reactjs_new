export const API = {
	AUTH: {
		LOGIN: 'auth/login',
		REGISTER: 'auth/register',
		PROFILE: 'auth/profile'
	},
	PRODUCT: {
		LIST: 'products',
		DETAILS: id => `products/${id}`
	},
	CITIES: {
		CREATE: 'cities/create',
		LIST: 'cities/list',
		GET: id => `cities/get/${id}`,
		UPDATE: id => `cities/update/${id}`,
		STATUS: id => `cities/status/${id}`,
		DELETE: id => `cities/delete/${id}`,
		DOWNLOAD_EXCEL: 'cities/download-excel'
	},
	STATES: {
		CREATE: 'states/create',
		LIST: 'states/list',
		GET: id => `states/get/${id}`,
		UPDATE: id => `states/update/${id}`,
		STATUS: id => `states/status/${id}`,
		DELETE: id => `states/delete/${id}`,
		DOWNLOAD_EXCEL: 'states/download-excel'
	},
	DEGREES: {
		CREATE: 'degrees/create',
		LIST: 'degrees/list',
		GET: id => `degrees/get/${id}`,
		UPDATE: id => `degrees/update/${id}`,
		STATUS: id => `degrees/status/${id}`,
		DELETE: id => `degrees/delete/${id}`,
		DOWNLOAD_EXCEL: 'degrees/download-excel'
	},
	ZONES: {
		CREATE: 'zones/create',
		LIST: 'zones/list',
		GET: id => `zones/get/${id}`,
		UPDATE: id => `zones/update/${id}`,
		STATUS: id => `zones/status/${id}`,
		DELETE: id => `zones/delete/${id}`,
		DOWNLOAD_EXCEL: 'zones/download-excel'
	},
	AREAS: {
		CREATE: 'areas/create',
		LIST: 'areas/list',
		GET: id => `areas/get/${id}`,
		UPDATE: id => `areas/update/${id}`,
		STATUS: id => `areas/status/${id}`,
		DELETE: id => `areas/delete/${id}`,
		DOWNLOAD_EXCEL: '/areas/download-excel'
	},
	REPORT_ROLES: {
		CREATE: 'report-roles/create',
		LIST: 'report-roles/list',
		GET: id => `report-roles/get/${id}`,
		UPDATE: id => `report-roles/update/${id}`,
		STATUS: id => `report-roles/status/${id}`,
		DELETE: id => `report-roles/delete/${id}`
	},
	ASSIGN_REPORT_ROLES: {
		CREATE: 'assign-report-roles/create',
		LIST: 'assign-report-roles/list',
		GET: id => `assign-report-roles/get/${id}`,
		UPDATE: id => `assign-report-roles/update/${id}`,
		STATUS: id => `assign-report-roles/status/${id}`,
		DELETE: id => `assign-report-roles/delete/${id}`
	},
	DOCUMENTS: {
		CREATE: 'documents/create',
		LIST: 'documents/list',
		GET: id => `documents/get/${id}`,
		UPDATE: id => `documents/update/${id}`,
		STATUS: id => `documents/status/${id}`,
		DELETE: id => `documents/delete/${id}`
	},
	EMPLOYEE_DOCUMENTS: {
		GET_BY_EMPLOYEE: empId => `employee-documents/by-employee/${empId}`,
		ADD: empId => `employee-documents/add/${empId}`,
		DELETE: id => `employee-documents/delete/${id}`
	},
	CIRCULARS: {
		CREATE: 'circulars/create',
		LIST: 'circulars/list',
		GET: id => `circulars/get/${id}`,
		UPDATE: id => `circulars/update/${id}`,
		STATUS: id => `circulars/status/${id}`,
		DELETE: id => `circulars/delete/${id}`
	},
	ORGANISMS: {
		CREATE: 'organisms/create',
		LIST: 'organisms/list',
		GET: id => `organisms/get/${id}`,
		UPDATE: id => `organisms/update/${id}`,
		STATUS: id => `organisms/status/${id}`,
		DELETE: id => `organisms/delete/${id}`
	},
	FRANCHISE_TYPES: {
		CREATE: 'franchise-types/create',
		LIST: 'franchise-types/list',
		GET: id => `franchise-types/get/${id}`,
		UPDATE: id => `franchise-types/update/${id}`,
		STATUS: id => `franchise-types/status/${id}`,
		DELETE: id => `franchise-types/delete/${id}`
	},
	COLLECTION_TYPES: {
		CREATE: 'collection-types/create',
		LIST: 'collection-types/list',
		GET: id => `collection-types/get/${id}`,
		UPDATE: id => `collection-types/update/${id}`,
		STATUS: id => `collection-types/status/${id}`,
		DELETE: id => `collection-types/delete/${id}`,
		DOWNLOAD_EXCEL: '/collection-types/download-excel'
	},
	DISCOUNT_REASONS: {
		CREATE: 'discount-reasons/create',
		LIST: 'discount-reasons/list',
		GET: id => `discount-reasons/get/${id}`,
		UPDATE: id => `discount-reasons/update/${id}`,
		STATUS: id => `discount-reasons/status/${id}`,
		DELETE: id => `discount-reasons/delete/${id}`,
		DOWNLOAD_EXCEL: '/discount-reasons/download-excel'
	},
	DESIGNATIONS: {
		CREATE: 'designations/create',
		LIST: 'designations/list',
		GET: id => `designations/get/${id}`,
		UPDATE: id => `designations/update/${id}`,
		DELETE: id => `designations/delete/${id}`,
		STATUS: id => `designations/status/${id}`,
		DOWNLOAD_EXCEL: 'designations/download-excel'
	},
	DEPARTMENTS: {
		CREATE: 'departments/create',
		LIST: 'departments/list',
		GET: id => `departments/get/${id}`,
		UPDATE: id => `departments/update/${id}`,
		DELETE: id => `departments/delete/${id}`,
		STATUS: id => `departments/status/${id}`,
		DOWNLOAD_EXCEL: 'departments/download-excel'
	},
	DOC_SPECIALIZATION_MASTER: {
		CREATE: 'doc-specialization-master/create',
		LIST: 'doc-specialization-master/list',
		GET: id => `doc-specialization-master/get/${id}`,
		UPDATE: id => `doc-specialization-master/update/${id}`,
		DELETE: id => `doc-specialization-master/delete/${id}`,
		STATUS: id => `doc-specialization-master/status/${id}`,
		DOWNLOAD_EXCEL: 'doc-specialization-master/download-excel'
	},
	DOC_CHARGE_SERVICE_TYPE: {
		CREATE: 'doc-charge-service-type/create',
		LIST: 'doc-charge-service-type/list',
		GET: id => `doc-charge-service-type/get/${id}`,
		UPDATE: id => `doc-charge-service-type/update/${id}`,
		DELETE: id => `doc-charge-service-type/delete/${id}`,
		STATUS: id => `doc-charge-service-type/status/${id}`,
		DOWNLOAD_EXCEL: 'doc-charge-service-type/download-excel'
	},
	DOC_TYPE: {
		CREATE: 'doc-type/create',
		LIST: 'doc-type/list',
		GET: id => `doc-type/get/${id}`,
		UPDATE: id => `doc-type/update/${id}`,
		DELETE: id => `doc-type/delete/${id}`,
		STATUS: id => `doc-type/status/${id}`,
		DOWNLOAD_EXCEL: 'doc-type/download-excel'
	},
	PERMISSION: {
		MY_PERMISSIONS: 'permission/my-permissions',
		CATEGORIES: 'permission/categories',
		LIST: 'permission/list',
		CREATE: 'permission/create',
		UPDATE: id => `permission/update/${id}`,
		DELETE: id => `permission/delete/${id}`
	},
	ROLE: {
		LIST: 'role/list',
		DETAILS: id => `role/details/${id}`,
		CREATE: 'role/create',
		UPDATE: id => `role/update/${id}`,
		DELETE: id => `role/delete/${id}`,
		ASSIGN_PERMISSIONS: 'role/assign-permissions',
		PERMISSIONS: id => `role/permissions/${id}`
	},
	CATEGORY: {
		LIST: 'category/list',
		DETAILS: id => `category/details/${id}`,
		CREATE: 'category/create',
		UPDATE: id => `category/update/${id}`,
		STATUS: id => `category/status/${id}`,
		DELETE: id => `category/delete/${id}`
	},
	USER: {
		LIST: 'user/list',
		DETAILS: id => `user/details/${id}`,
		CREATE: 'user/create',
		UPDATE: id => `user/update/${id}`,
		DELETE: id => `user/delete/${id}`,
		STATUS: id => `user/status/${id}`,
		CHANGE_PASSWORD: id => `user/change-password/${id}`,
		MY_PROFILE: 'user/my-profile'
	},
	BRANCHES: {
		CREATE: '/branches/create',
		LIST: '/branches/list',
		GET: id => `/branches/get/${id}`,
		UPDATE: id => `/branches/update/${id}`,
		STATUS: id => `/branches/status/${id}`,
		DELETE: id => `/branches/delete/${id}`,
		DOWNLOAD_EXCEL: '/branches/download-excel'
	},
	LEAVE_TYPES: {
		CREATE: '/leave-types/create',
		LIST: '/leave-types/list',
		GET: id => `/leave-types/get/${id}`,
		UPDATE: id => `/leave-types/update/${id}`,
		STATUS: id => `/leave-types/status/${id}`,
		DELETE: id => `/leave-types/delete/${id}`,
		DOWNLOAD_EXCEL: '/leave-types/download-excel'
	},
	SHARE_TYPES: {
		CREATE: '/share-types/create',
		LIST: '/share-types/list',
		GET: id => `/share-types/get/${id}`,
		UPDATE: id => `/share-types/update/${id}`,
		STATUS: id => `/share-types/status/${id}`,
		DELETE: id => `/share-types/delete/${id}`,
		DOWNLOAD_EXCEL: '/share-types/download-excel'
	},
	SECTIONS: {
		CREATE: '/sections/create',
		LIST: '/sections/list',
		GET: id => `/sections/get/${id}`,
		UPDATE: id => `/sections/update/${id}`,
		DELETE: id => `/sections/delete/${id}`,
		STATUS: id => `/sections/status/${id}`,
		DOWNLOAD_EXCEL: '/sections/download-excel'
	},
	EMPLOYEE_TYPES: {
		CREATE: '/employee-types/create',
		LIST: '/employee-types/list',
		GET: id => `/employee-types/get/${id}`,
		UPDATE: id => `/employee-types/update/${id}`,
		DELETE: id => `/employee-types/delete/${id}`,
		STATUS: id => `/employee-types/status/${id}`,
		DOWNLOAD_EXCEL: '/employee-types/download-excel'
	},
	EMPLOYEE_CATEGORIES: {
		CREATE: '/employee-categories/create',
		LIST: '/employee-categories/list',
		GET: id => `/employee-categories/get/${id}`,
		UPDATE: id => `/employee-categories/update/${id}`,
		DELETE: id => `/employee-categories/delete/${id}`,
		STATUS: id => `/employee-categories/status/${id}`,
		DOWNLOAD_EXCEL: '/employee-categories/download-excel'
	},

	EMPLOYEE_LEAVES: {
		CREATE: "/employee-leaves/create",
		LIST: "/employee-leaves/list",
		GET: (id) => `/employee-leaves/get/${id}`,
		UPDATE: (id) => `/employee-leaves/update/${id}`,
		DELETE: (id) => `/employee-leaves/delete/${id}`,
		APPROVE: (id) => `/employee-leaves/approve/${id}`,
		REJECT: (id) => `/employee-leaves/reject/${id}`,
		ACTIONS: (id) => `/employee-leaves/actions/${id}`,
		BALANCE_LIST: "/employee-leaves/balance-list",
		BALANCE: (empId) => `/employee-leaves/balance/${empId}`,
		SET_BALANCE: "/employee-leaves/set-balance",
		DOCUMENTS: leaveId => `/employee-leaves/documents/${leaveId}`,
		ADD_DOCUMENTS: leaveId => `/employee-leaves/add-documents/${leaveId}`,
		DELETE_DOCUMENT: id => `/employee-leaves/delete-document/${id}`,
		DOWNLOAD_EXCEL: '/employee-leaves/download-excel',
		DOWNLOAD_EXCEL_BALANCE: '/employee-leaves/download-excel-balance'
	},
	EMPLOYEE_DISCOUNTS: {
		CREATE: "/discount-allowed/create",
		LIST: "/discount-allowed/list",
		GET: (id) => `/discount-allowed/get/${id}`,
		UPDATE: (id) => `/discount-allowed/update/${id}`,
		DELETE: (id) => `/discount-allowed/delete/${id}`,
		DOWNLOAD_EXCEL: '/discount-allowed/download-excel',
	},
	DEPARTMENT_TYPES: {
		LIST: "/department-type/list",
		CREATE: "/department-type/create",
		GET: (id) => `/department-type/get/${id}`,
		UPDATE: (id) => `/department-type/update/${id}`,
		STATUS: (id) => `/department-type/status/${id}`,
		DELETE: (id) => `/department-type/delete/${id}`,
		DOWNLOAD_EXCEL: "/department-type/download-excel",
	},
	UTILS: {
		PRETTY_URL: "/utils/pretty-url",
	},
	EMPLOYEES: {
		MY_PROFILE: "/employees/my-profile",
		CREATE: "/employees/create",
		LIST: "/employees/list",
		GET: (id) => `/employees/get/${id}`,
		UPDATE: (id) => `/employees/update/${id}`,
		DELETE: (id) => `/employees/delete/${id}`,         
		TOGGLE_STATUS: (id) => `/employees/toggle-status/${id}`,
		ASSIGN_LOGIN: (id) => `/employees/assign-login/${id}`,
		LOGIN_DETAILS: (id) => `/employees/login-details/${id}`,
		REMOVE_LOGIN: (id) => `/employees/remove-login/${id}`,
		DOWNLOAD_EXCEL: '/employees/download-excel',
	},
	DOCTORS: {
		DASHBOARD_STATS: "/doctor-dashboard/stats",
		DASHBOARD_EXPIRY_ALERTS: "/doctor-dashboard/expiry-alerts",
		DASHBOARD_EXPORT: "/doctor-dashboard/export-excel",
		CREATE: "/doctors/create",
		LIST: "/doctors/list",
		GET: (id) => `/doctors/get/${id}`,
		UPDATE: (id) => `/doctors/update/${id}`,
		DELETE: (id) => `/doctors/delete/${id}`,
		TOGGLE_STATUS: (id) => `/doctors/toggle-status/${id}`,
		DOWNLOAD_EXCEL: "/doctors/download-excel",
		UPLOAD_DOCUMENTS: (id) => `/doctors/upload-documents/${id}`,
		PROFILE: "/doctors/profile",
		ASSIGN_LOGIN: (id) => `/doctors/assign-login/${id}`,
		LOGIN_DETAILS: (id) => `/doctors/login-details/${id}`,
		REMOVE_LOGIN: (id) => `/doctors/remove-login/${id}`,
		AUDIT_TRAIL: "/doc-audit",
		AUDIT_TRAIL_DETAILS: (id) => `/doc-audit/details/${id}`,
	},
	DOC_CHARGES: {
		LIST: "doc-charges/list",
		GET: (id) => `doc-charges/get/${id}`,
		UPDATE: (id) => `doc-charges/update/${id}`,
		GET_BY_DOCTOR: (docId) => `doc-charges/doctor/${docId}`,
		SAVE: "doc-charges/save",
		ADD_SINGLE: "doc-charges/add-single",
		HISTORY: (docId) => `doc-charges/history/${docId}`,
		DELETE: (id) => `doc-charges/delete/${id}`
	},
	DOC_COMMISSIONS: {
		LIST: "doc-commissions/list",
		GET: (id) => `doc-commissions/get/${id}`,
		UPDATE: (id) => `doc-commissions/update/${id}`,
		ADD_SINGLE: "doc-commissions/add-single",
		STATUS: (id) => `doc-commissions/status/${id}`,
		HISTORY: (docId) => `doc-commissions/history/${docId}`,
		DELETE: (id) => `doc-commissions/delete/${id}`
	},
	DOC_ONBOARD: {
		CREATE: "/doc-onboard/create",
		LIST: "/doc-onboard/list",
		GET: (id) => `/doc-onboard/get/${id}`,
		SAVE_DRAFT: (id) => `/doc-onboard/save-draft/${id}`,
		UPDATE: (id) => `/doc-onboard/update/${id}`,
		SUBMIT: (id) => `/doc-onboard/submit/${id}`,
		UPLOAD_DOCUMENTS: (id) => `/doc-onboard/upload-documents/${id}`,
		DELETE: (id) => `/doc-onboard/delete/${id}`,
		APPROVE: (id) => `/doc-onboard/approve/${id}`,
		REJECT: (id) => `/doc-onboard/reject/${id}`,
		SEND_BACK: (id) => `/doc-onboard/send-back/${id}`,
	},
	REPORTS: {
		REGISTRATION_EXPIRY: "reports/registration-expiry",
		REGISTRATION_EXPIRY_EXPORT: "reports/registration-expiry/export",
		COMMISSION: "reports/commission",
		COMMISSION_EXPORT: "reports/commission/export",
	},
	INCOME_REPORTS: {
		LIST: "income-reports/list",
		DOWNLOAD_EXCEL: "income-reports/download-excel",
	},
};
