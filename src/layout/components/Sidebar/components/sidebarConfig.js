import ROUTES from '../../../../utils/constants/routes';
import DashboardIcon from '../../../../assets/icons/DashboardIcon.jsx';
import PatientIcon from '../../../../assets/icons/PatientIcon.jsx';
import BellIcon from '../../../../assets/icons/BellIcon.jsx';
import WalletIcon from '../../../../assets/icons/WalletIcon.jsx';
import CommissionIcon from '../../../../assets/icons/CommissionIcon.jsx';
import ReportIcon from '../../../../assets/icons/ReportIcon.jsx';
import FranchiseIcon from '../../../../assets/icons/FranchiseIcon.jsx';
import EmployeeIcon from '../../../../assets/icons/EmployeeIcon.jsx';
import LogoutIcon from '../../../../assets/icons/LogoutIcon.jsx';

export const SIDEBAR_ITEMS = [
	// {
	//   name: "Dashboard",
	//   path: ROUTES.ROOT,
	//   icon: DashboardIcon,
	// },
	// {
	//   name: "Patient & Booking",
	//   icon: PatientIcon,
	//   children: [
	//     { name: "Patients", path: "/patients" },
	//     { name: "Bookings", path: "/bookings" },
	//   ],
	// },
	// {
	//   name: "Notifications",
	//   icon: BellIcon,
	//   children: [
	//     { name: "All", path: "/notifications/all" },
	//     { name: "Unread", path: "/notifications/unread" },
	//   ],
	// },
	// {
	//   name: "Accounts & Payments",
	//   icon: WalletIcon,
	//   children: [
	//     { name: "Invoices", path: "/accounts/invoices" },
	//     { name: "Payments", path: "/accounts/payments" },
	//   ],
	// },
	// {
	//   name: "Commission",
	//   icon: CommissionIcon,
	//   children: [
	//     { name: "Earnings", path: "/commission/earnings" },
	//     { name: "Payouts", path: "/commission/payouts" },
	//   ],
	// },
	// {
	//   name: "Reports",
	//   icon: ReportIcon,
	//   children: [
	//     { name: "Sales", path: "/reports/sales" },
	//     { name: "Analytics", path: "/reports/analytics" },
	//   ],
	// },
	// {
	//   name: "Franchise Management",
	//   icon: FranchiseIcon,
	//   children: [
	//     { name: "Franchises", path: "/franchise/list" },
	//     { name: "Add Franchise", path: "/franchise/add" },
	//   ],
	// },
	{
		name: 'Admin',
		icon: DashboardIcon,
		children: [
			{ name: 'Area', path: ROUTES.AREAS },
			{ name: 'Collection Type', path: ROUTES.COLLECTION_TYPES },
			{ name: 'Department Type', path: ROUTES.DEPARTMENT_TYPES },
			{ name: 'Discount Reason', path: ROUTES.DISCOUNT_REASONS }
		]
	},
	{
		name: 'Doctor Finance',
		icon: WalletIcon,
		children: [
			{ name: 'Commission Setup', path: ROUTES.DOCTOR_COMMISSIONS },
			{ name: 'Consultation Fee', path: ROUTES.DOCTOR_CONSULTATION_CHARGES }
		]
	},
	{
		name: 'Doctor Management',
		icon: EmployeeIcon,
		children: [
			{ name: 'Audit Trail', path: ROUTES.DOCTOR_AUDIT_TRAIL },
			{ name: 'Dashboard', path: ROUTES.DOCTOR_DASHBOARD },
			{ name: 'Doctors', path: ROUTES.DOCTORS },
			{ name: 'Onboarding List', path: ROUTES.DOCTOR_ONBOARDING_LIST }
		]
	},
	{
		name: 'Doctor Master Data',
		icon: EmployeeIcon,
		children: [
			{ name: 'Charge Service Type', path: ROUTES.DOCTOR_MASTER_CHARGE_SERVICE_TYPE },
			{ name: 'Degree', path: ROUTES.DOCTOR_MASTER_DEGREE },
			{ name: 'Doctor Type', path: ROUTES.DOCTOR_MASTER_DOC_TYPE },
			{ name: 'Specialization', path: ROUTES.DOCTOR_MASTER_SPECIALIZATION }
		]
	},
	{
		name: 'Doctor Report',
		icon: ReportIcon,
		children: [
			{ name: 'Commission Report', path: ROUTES.COMMISSION_REPORT },
			{ name: 'Income Report', path: ROUTES.INCOME_REPORT },
			{ name: 'Registration Expiry', path: ROUTES.REGISTRATION_EXPIRY_REPORT }
		]
	},
	{
		name: 'Employee Management',
		icon: EmployeeIcon,
		children: [
			{ name: 'Discount Allowed', path: ROUTES.EMPLOYEE_DISCOUNTS },
			{ name: 'Employee Leaves', path: ROUTES.EMPLOYEE_LEAVES },
			{ name: 'Employees', path: ROUTES.EMPLOYEES },
			{ name: 'Leave Approvals', path: ROUTES.LEAVE_APPROVALS },
			{ name: 'Leave Balance', path: ROUTES.LEAVE_BALANCE }
		]
	},
	{
		name: 'Employee Master Data',
		icon: ReportIcon,
		children: [
			{ name: 'Department', path: ROUTES.DEPARTMENTS },
			{ name: 'Designation', path: ROUTES.DESIGNATIONS },
			{ name: 'Employee Category', path: ROUTES.EMPLOYEE_CATEGORIES },
			{ name: 'Employee Type', path: ROUTES.EMPLOYEE_TYPES },
			{ name: 'Section', path: ROUTES.SECTIONS }
		]
	},
	{
		name: 'Master Data',
		icon: DashboardIcon,
		children: [
			{ name: 'Branch', path: ROUTES.BRANCH_LIST },
			{ name: 'City', path: ROUTES.CITIES },
			{ name: 'Leave Type', path: ROUTES.LEAVE_TYPE_LIST },
			{ name: 'Share Type', path: ROUTES.SHARE_TYPE_LIST },
			{ name: 'State', path: ROUTES.STATES },
			{ name: 'Zone', path: ROUTES.ZONES }
		]
	},
	{
		name: 'Permission Management',
		icon: EmployeeIcon,
		children: [
			{ name: 'Permission Category', path: ROUTES.PERMISSIONS },
			{ name: 'Permission Groups', path: ROUTES.GROUPS }
		]
	},
	{
		name: 'Logout',
		path: '/logout',
		icon: LogoutIcon
	}
];
