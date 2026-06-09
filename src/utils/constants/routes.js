const ROUTES = {
	ROOT: '/',
	LOGIN: '/login',
	PROFILE: '/Doctor-profile',
	SETTINGS: '/settings',
	SIMPLE_FORM: '/form/simple-form',
	MULTI_STEP_FORM: '/form/multi-step-form',
	MULTI_SECTION_FORM: '/form/multi-section-form',
	USERS: '/users',

	EMPLOYEES: '/employees',
	ADD_EMPLOYEE: '/employees/add',
	EDIT_EMPLOYEE: '/employees/edit/:id',
	VIEW_EMPLOYEE: '/employees/view/:id',
	EMPLOYEE_PROFILE: '/employee/profile',

  // Doctor Management
  DOCTOR_DASHBOARD: "/doctor-management/dashboard",
  DOCTORS: "/doctor-management",
  ADD_DOCTOR: "/doctor-management/add",
  EDIT_DOCTOR: "/doctor-management/edit/:id",
  VIEW_DOCTOR: "/doctor-management/view/:id",
  DOCTOR_ONBOARDING_LIST: "/doctor-management/onboarding",
  DOCTOR_ONBOARDING_WIZARD: "/doctor-management/onboarding/wizard",
  DOCTOR_ONBOARDING_DETAILS: "/doctor-management/onboarding/details",
  DOCTOR_ONBOARD_REGISTER: "/doctor-management/onboard/register",
  DOCTOR_AUDIT_TRAIL: "/doctor-management/audit-trail",
  DOCTOR_AUDIT_TRAIL_DETAILS: "/doctor-management/audit-trail/details/:id",
  DOCTOR_CONSULTATION_CHARGES: "/doctor-finance/consultation-charges",
  ADD_DOCTOR_CONSULTATION_CHARGE: "/doctor-finance/consultation-charges/add",
  EDIT_DOCTOR_CONSULTATION_CHARGE: "/doctor-finance/consultation-charges/edit/:id",
  VIEW_DOCTOR_CONSULTATION_CHARGE: "/doctor-finance/consultation-charges/view/:id",

  DOCTOR_COMMISSIONS: "/doctor-finance/commissions",
  ADD_DOCTOR_COMMISSION: "/doctor-finance/commissions/add",
  EDIT_DOCTOR_COMMISSION: "/doctor-finance/commissions/edit/:id",
  VIEW_DOCTOR_COMMISSION: "/doctor-finance/commissions/view/:id",


	// Doctor Master Data
	DOCTOR_MASTER_DEGREE: '/doctor-master/degrees',
	ADD_DOCTOR_MASTER_DEGREE: '/doctor-master/degrees/add',
	EDIT_DOCTOR_MASTER_DEGREE: '/doctor-master/degrees/edit/:id',
	DOCTOR_MASTER_SPECIALIZATION: '/doctor-master/specializations',
	ADD_DOCTOR_MASTER_SPECIALIZATION: '/doctor-master/specializations/add',
	EDIT_DOCTOR_MASTER_SPECIALIZATION: '/doctor-master/specializations/edit/:id',
	DOCTOR_MASTER_CHARGE_SERVICE_TYPE: '/doctor-master/charge-service-types',
	ADD_DOCTOR_MASTER_CHARGE_SERVICE_TYPE: '/doctor-master/charge-service-types/add',
	EDIT_DOCTOR_MASTER_CHARGE_SERVICE_TYPE: '/doctor-master/charge-service-types/edit/:id',
	DOCTOR_MASTER_DOC_TYPE: '/doctor-master/doc-types',
	ADD_DOCTOR_MASTER_DOC_TYPE: '/doctor-master/doc-types/add',
	EDIT_DOCTOR_MASTER_DOC_TYPE: '/doctor-master/doc-types/edit/:id',

	// Master Data
	CITIES: '/master/cities',
	ADD_CITY: '/master/cities/add',
	EDIT_CITY: '/master/cities/edit/:id',

	STATES: '/master/states',
	ADD_STATE: '/master/states/add',
	EDIT_STATE: '/master/states/edit/:id',

	ZONES: '/master/zones',
	ADD_ZONE: '/master/zones/add',
	EDIT_ZONE: '/master/zones/edit/:id',

	AREAS: '/admin/areas',
	ADD_AREA: '/admin/areas/add',
	EDIT_AREA: '/admin/areas/edit/:id',

	COLLECTION_TYPES: '/admin/collection-types',
	ADD_COLLECTION_TYPE: '/admin/collection-types/add',
	EDIT_COLLECTION_TYPE: '/admin/collection-types/edit/:id',

	DISCOUNT_REASONS: '/admin/discount-reasons',
	ADD_DISCOUNT_REASON: '/admin/discount-reasons/add',
	EDIT_DISCOUNT_REASON: '/admin/discount-reasons/edit/:id',

	REPORT_ROLES: '/admin/report-roles',
	ADD_REPORT_ROLE: '/admin/report-roles/add',
	EDIT_REPORT_ROLE: '/admin/report-roles/edit/:id',

	ASSIGN_REPORT_ROLES: '/admin/assign-report-roles',
	ADD_ASSIGN_REPORT_ROLE: '/admin/assign-report-roles/add',
	EDIT_ASSIGN_REPORT_ROLE: '/admin/assign-report-roles/edit/:id',

	DOCUMENTS: '/admin/documents',
	ADD_DOCUMENT: '/admin/documents/add',
	EDIT_DOCUMENT: '/admin/documents/edit/:id',

	CIRCULARS: '/admin/circulars',
	ADD_CIRCULAR: '/admin/circulars/add',
	EDIT_CIRCULAR: '/admin/circulars/edit/:id',

	ORGANISMS: '/admin/organisms',
	ADD_ORGANISM: '/admin/organisms/add',
	EDIT_ORGANISM: '/admin/organisms/edit/:id',

	FRANCHISE_TYPES: '/admin/franchise-types',
	ADD_FRANCHISE_TYPE: '/admin/franchise-types/add',
	EDIT_FRANCHISE_TYPE: '/admin/franchise-types/edit/:id',

	AREAS: '/master/areas',
	ADD_AREA: '/master/areas/add',
	EDIT_AREA: '/master/areas/edit/:id',

	DEPARTMENT_TYPES: '/admin/department-type',
	ADD_DEPARTMENT_TYPE: '/admin/department-type/add',
	EDIT_DEPARTMENT_TYPE: '/admin/department-type/edit/:id',

	// Employee Master Data
	DEPARTMENTS: '/employee-master/departments',
	ADD_DEPARTMENT: '/employee-master/departments/add',
	EDIT_DEPARTMENT: '/employee-master/departments/edit/:id',

	DESIGNATIONS: '/employee-master/designations',
	ADD_DESIGNATION: '/employee-master/designations/add',
	EDIT_DESIGNATION: '/employee-master/designations/edit/:id',

	// Permission Management
	PERMISSIONS: '/permissions',
	GROUPS: '/permissions/groups',
	USER_GROUP: '/permissions/user-group',
	ADD_USER: '/permissions/user-group/add',
	EDIT_USER: '/permissions/user-group/edit/:id',

	SECTIONS: '/employee-master/sections',
	ADD_SECTION: '/employee-master/sections/add',
	EDIT_SECTION: '/employee-master/sections/edit/:id',

	EMPLOYEE_TYPES: '/employee-master/employee-types',
	ADD_EMPLOYEE_TYPE: '/employee-master/employee-types/add',
	EDIT_EMPLOYEE_TYPE: '/employee-master/employee-types/edit/:id',

	EMPLOYEE_CATEGORIES: '/employee-master/employee-categories',
	ADD_EMPLOYEE_CATEGORY: '/employee-master/employee-categories/add',
	EDIT_EMPLOYEE_CATEGORY: '/employee-master/employee-categories/edit/:id',
	EMPLOYEE_DISCOUNTS: '/employee-master/discount-allowed',
	ADD_EMPLOYEE_DISCOUNT: '/employee-master/discount-allowed/add',
	EDIT_EMPLOYEE_DISCOUNT: '/employee-master/discount-allowed/edit/:id',
	EMPLOYEE_LEAVES: '/employee-master/employee-leaves',
	ADD_EMPLOYEE_LEAVE: '/employee-master/employee-leaves/add',
	EDIT_EMPLOYEE_LEAVE: '/employee-master/employee-leaves/edit/:id',
	LEAVE_APPROVALS: '/employee-management/leave-approvals',
	LEAVE_BALANCE: '/employee-management/leave-balance',

	BRANCH_LIST: '/dashboard/branches',
	ADD_BRANCH: '/dashboard/branches/add',
	EDIT_BRANCH: '/dashboard/branches/edit/:id',
	LEAVE_TYPE_LIST: '/dashboard/leave-types',
	ADD_LEAVE_TYPE: '/dashboard/leave-types/add',
	EDIT_LEAVE_TYPE: '/dashboard/leave-types/edit/:id',
	SHARE_TYPE_LIST: '/dashboard/share-types',
	ADD_SHARE_TYPE: '/dashboard/share-types/add',
	EDIT_SHARE_TYPE: '/dashboard/share-types/edit/:id',

	TABLE: '/table',
	DESIGN_SYSTEM: '/design-system',
	REACT_BOUNDARY: '/react-boundary',
	REGISTRATION_EXPIRY_REPORT: "/doctor-report/registration-expiry",
	COMMISSION_REPORT: "/doctor-report/commission",
	INCOME_REPORT: "/doctor-report/income",
	NOT_FOUND: '*'
};

export default ROUTES;
