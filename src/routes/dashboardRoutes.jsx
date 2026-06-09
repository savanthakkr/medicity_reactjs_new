import { Navigate } from 'react-router-dom';
import ROUTES from '../utils/constants/routes';
import SimpleForm from '../pages/form/SimpleForm';
import MultiStepForm from '../pages/form/MultiStepForm';
import MultiSectionForm from '../pages/form/MultiSectionForm';
import DashboardLayout from '../layout/DashboardLayout';
import Dashboard from '../pages/Dashboard';
// import Settings from '../pages/Settings/Settings';
import NotFound from '../pages/NotFound';
import GridView from '../pages/views/GridView';
import ListView from '../pages/views/ListView';
import TableView from '../pages/views/TableView';
import DoctorProfile from '../pages/DoctorProfile';
import EmployeeProfile from '../pages/Employee/EmployeeProfile';
import Table from '../pages/table/Table';
import Login from '../pages/Login';
import DoctorList from '../pages/DoctorManagement/Doctor/Doctor';
import AddDoctor from '../pages/DoctorManagement/Doctor/AddDoctor';
import ViewDoctor from '../pages/DoctorManagement/Doctor/ViewDoctor';
import OnboardingList from '../pages/DoctorManagement/Onboarding/OnboardingList';
import DoctorDashboard from '../pages/DoctorManagement/DoctorDashboard';
import OnboardingWizard from '../pages/DoctorManagement/Onboarding/OnboardingWizard';
import OnboardingDetails from '../pages/DoctorManagement/Onboarding/OnboardingDetails';
import AuditTrail from '../pages/DoctorManagement/AuditTrail';
import AuditTrailDetails from '../pages/DoctorManagement/AuditTrailDetails';
import ConsultationCharges from '../pages/DoctorFinance/ConsultationCharges';
import AddConsultationCharge from '../pages/DoctorFinance/AddConsultationCharge';
import EditConsultationCharge from '../pages/DoctorFinance/EditConsultationCharge';
import ViewConsultationCharge from '../pages/DoctorFinance/ViewConsultationCharge';
import CommissionList from '../pages/DoctorFinance/CommissionList';
import AddCommission from '../pages/DoctorFinance/AddCommission';
import EditCommission from '../pages/DoctorFinance/EditCommission';
import ViewCommission from '../pages/DoctorFinance/ViewCommission';
import RegistrationExpiryReport from '../pages/DoctorReport/RegistrationExpiryReport';
import CommissionReport from '../pages/DoctorReport/CommissionReport';
import IncomeReport from '../pages/DoctorReport/IncomeReport';
import EmployeeList from '../pages/Employee/EmployeeList';
import AddEmployee from '../pages/Employee/AddEmployee';
import ViewEmployee from '../pages/Employee/ViewEmployee';
import ReactBoundary from '../pages/ReactBoundary';

import StateList from '../pages/MasterData/State/StateList';
import AddState from '../pages/MasterData/State/AddState';
import CityList from '../pages/MasterData/City/CityList';
import AddCity from '../pages/MasterData/City/AddCity';
import AreaList from '../pages/Admin/Area/AreaList';
import AddArea from '../pages/Admin/Area/AddArea';
import CollectionTypeList from '../pages/Admin/CollectionType/CollectionTypeList';
import AddCollectionType from '../pages/Admin/CollectionType/AddCollectionType';
import DiscountReasonList from '../pages/Admin/DiscountReason/DiscountReasonList';
import AddDiscountReason from '../pages/Admin/DiscountReason/AddDiscountReason';
import ZoneList from '../pages/MasterData/Zone/ZoneList';
import AddZone from '../pages/MasterData/Zone/AddZone';
import BranchList from '../pages/MasterData/Branch/BranchList';
import AddBranch from '../pages/MasterData/Branch/AddBranch';
import LeaveTypeList from '../pages/MasterData/LeaveType/LeaveTypeList';
import AddLeaveType from '../pages/MasterData/LeaveType/AddLeaveType';
import ShareTypeList from '../pages/MasterData/ShareType/ShareTypeList';
import AddShareType from '../pages/MasterData/ShareType/AddShareType';

import DepartmentList from '../pages/EmployeeMaster/Department/DepartmentList';
import AddDepartment from '../pages/EmployeeMaster/Department/AddDepartment';
import DesignationList from '../pages/EmployeeMaster/Designation/DesignationList';
import AddDesignation from '../pages/EmployeeMaster/Designation/AddDesignation';
import SectionList from '../pages/EmployeeMaster/Section/SectionList';
import AddSection from '../pages/EmployeeMaster/Section/AddSection';
import EmployeeTypeList from '../pages/EmployeeMaster/EmployeeType/EmployeeTypeList';
import AddEmployeeType from '../pages/EmployeeMaster/EmployeeType/AddEmployeeType';
import EmployeeCategoryList from '../pages/EmployeeMaster/EmployeeCategory/EmployeeCategoryList';
import AddEmployeeCategory from '../pages/EmployeeMaster/EmployeeCategory/AddEmployeeCategory';
import EmployeeDiscountList from '../pages/EmployeeMaster/EmployeeDiscount/EmployeeDiscountList';
import AddEmployeeDiscount from '../pages/EmployeeMaster/EmployeeDiscount/AddEmployeeDiscount';
import EmployeeLeaveList from '../pages/Employee/EmployeeLeave/EmployeeLeaveList';
import AddEmployeeLeave from '../pages/Employee/EmployeeLeave/AddEmployeeLeave';
import LeaveApprovals from '../pages/Employee/EmployeeLeave/LeaveApprovals';
import LeaveBalance from '../pages/Employee/EmployeeLeave/LeaveBalance';

import DepartmentTypeList from '../pages/Admin/DepartmentType/DepartmentTypeList';
import AddDepartmentType from '../pages/Admin/DepartmentType/AddDepartmentType';
import ReportRoleList from '../pages/Admin/ReportRole/ReportRoleList';
import AddReportRole from '../pages/Admin/ReportRole/AddReportRole';
import AssignReportRoleList from '../pages/Admin/AssignReportRole/AssignReportRoleList';
import AddAssignReportRole from '../pages/Admin/AssignReportRole/AddAssignReportRole';
import DocumentList from '../pages/Admin/Document/DocumentList';
import AddDocument from '../pages/Admin/Document/AddDocument';
import CircularList from '../pages/Admin/Circular/CircularList';
import AddCircular from '../pages/Admin/Circular/AddCircular';
import OrganismList from '../pages/Admin/Organism/OrganismList';
import AddOrganism from '../pages/Admin/Organism/AddOrganism';
import FranchiseTypeList from '../pages/Admin/FranchiseType/FranchiseTypeList';
import AddFranchiseType from '../pages/Admin/FranchiseType/AddFranchiseType';

import Permission from '../pages/Permission/Permission';
import Roles from '../pages/Permission/Roles';
import UserGroup from '../pages/Permission/UserGroup';
import CreateUser from '../pages/Permission/CreateUser';

import DocSpecializationList from '../pages/DoctorMaster/DocSpecialization/DocSpecializationList';
import AddDocSpecialization from '../pages/DoctorMaster/DocSpecialization/AddDocSpecialization';
import DocChargeServiceTypeList from '../pages/DoctorMaster/DocChargeServiceType/DocChargeServiceTypeList';
import AddDocChargeServiceType from '../pages/DoctorMaster/DocChargeServiceType/AddDocChargeServiceType';
import DocTypeList from '../pages/DoctorMaster/DocType/DocTypeList';
import AddDocType from '../pages/DoctorMaster/DocType/AddDocType';

import ProtectedRoute from '../components/ProtectedRoute';
import PermissionRoute from '../components/PermissionRoute';
import AddDegree from '@/pages/DoctorMaster/Degree/AddDegree';
import DegreeList from '@/pages/DoctorMaster/Degree/DegreeList';

export const dashboardRoutes = [
	{ path: ROUTES.LOGIN, element: <Login /> },
	{ path: ROUTES.DOCTOR_ONBOARD_REGISTER, element: <OnboardingWizard /> },
	{
		element: <ProtectedRoute />,
		children: [
			{
				path: '/',
				element: <DashboardLayout />,
				children: [
					{ index: true, element: <Navigate to={ROUTES.STATES} replace /> },

					// Always-accessible routes (profile, not permission-gated)
					{ path: ROUTES.PROFILE.slice(1), element: <DoctorProfile /> },
					{ path: ROUTES.EMPLOYEE_PROFILE.slice(1), element: <EmployeeProfile /> },
					{ path: ROUTES.SIMPLE_FORM.slice(1), element: <SimpleForm /> },
					{ path: ROUTES.MULTI_STEP_FORM.slice(1), element: <MultiStepForm /> },
					{
						path: ROUTES.MULTI_SECTION_FORM.slice(1),
						element: <MultiSectionForm />
					},
					{ path: ROUTES.TABLE.slice(1), element: <Table /> },
					{ path: ROUTES.EMPLOYEES.slice(1), element: <EmployeeList /> },
					{ path: ROUTES.ADD_EMPLOYEE.slice(1), element: <AddEmployee /> },
					{ path: ROUTES.EDIT_EMPLOYEE.slice(1), element: <AddEmployee /> },

					// Master Data
					{ path: ROUTES.STATES.slice(1), element: <StateList /> },
					{ path: ROUTES.ADD_STATE.slice(1), element: <AddState /> },
					{ path: ROUTES.EDIT_STATE.slice(1), element: <AddState /> },

					{ path: ROUTES.CITIES.slice(1), element: <CityList /> },
					{ path: ROUTES.ADD_CITY.slice(1), element: <AddCity /> },
					{ path: ROUTES.EDIT_CITY.slice(1), element: <AddCity /> },

					{ path: ROUTES.AREAS.slice(1), element: <AreaList /> },
					{ path: ROUTES.ADD_AREA.slice(1), element: <AddArea /> },
					{ path: ROUTES.EDIT_AREA.slice(1), element: <AddArea /> },

					{ path: ROUTES.DEPARTMENT_TYPES.slice(1), element: <DepartmentTypeList /> },
					{ path: ROUTES.ADD_DEPARTMENT_TYPE.slice(1), element: <AddDepartmentType /> },
					{ path: ROUTES.EDIT_DEPARTMENT_TYPE.slice(1), element: <AddDepartmentType /> },

					{ path: ROUTES.COLLECTION_TYPES.slice(1), element: <CollectionTypeList /> },
					{ path: ROUTES.ADD_COLLECTION_TYPE.slice(1), element: <AddCollectionType /> },
					{ path: ROUTES.EDIT_COLLECTION_TYPE.slice(1), element: <AddCollectionType /> },

					{ path: ROUTES.DISCOUNT_REASONS.slice(1), element: <DiscountReasonList /> },
					{ path: ROUTES.ADD_DISCOUNT_REASON.slice(1), element: <AddDiscountReason /> },
					{ path: ROUTES.EDIT_DISCOUNT_REASON.slice(1), element: <AddDiscountReason /> },

					{ path: ROUTES.REPORT_ROLES.slice(1), element: <ReportRoleList /> },
					{ path: ROUTES.ADD_REPORT_ROLE.slice(1), element: <AddReportRole /> },
					{ path: ROUTES.EDIT_REPORT_ROLE.slice(1), element: <AddReportRole /> },

					{ path: ROUTES.ASSIGN_REPORT_ROLES.slice(1), element: <AssignReportRoleList /> },
					{ path: ROUTES.ADD_ASSIGN_REPORT_ROLE.slice(1), element: <AddAssignReportRole /> },
					{ path: ROUTES.EDIT_ASSIGN_REPORT_ROLE.slice(1), element: <AddAssignReportRole /> },

					{ path: ROUTES.DOCUMENTS.slice(1), element: <DocumentList /> },
					{ path: ROUTES.ADD_DOCUMENT.slice(1), element: <AddDocument /> },
					{ path: ROUTES.EDIT_DOCUMENT.slice(1), element: <AddDocument /> },

					{ path: ROUTES.CIRCULARS.slice(1), element: <CircularList /> },
					{ path: ROUTES.ADD_CIRCULAR.slice(1), element: <AddCircular /> },
					{ path: ROUTES.EDIT_CIRCULAR.slice(1), element: <AddCircular /> },

					{ path: ROUTES.ORGANISMS.slice(1), element: <OrganismList /> },
					{ path: ROUTES.ADD_ORGANISM.slice(1), element: <AddOrganism /> },
					{ path: ROUTES.EDIT_ORGANISM.slice(1), element: <AddOrganism /> },

					{ path: ROUTES.FRANCHISE_TYPES.slice(1), element: <FranchiseTypeList /> },
					{ path: ROUTES.ADD_FRANCHISE_TYPE.slice(1), element: <AddFranchiseType /> },
					{ path: ROUTES.EDIT_FRANCHISE_TYPE.slice(1), element: <AddFranchiseType /> },

					{ path: ROUTES.ZONES.slice(1), element: <ZoneList /> },
					{ path: ROUTES.ADD_ZONE.slice(1), element: <AddZone /> },
					{ path: ROUTES.EDIT_ZONE.slice(1), element: <AddZone /> },

					{ path: ROUTES.BRANCH_LIST.slice(1), element: <BranchList /> },
					{ path: ROUTES.ADD_BRANCH.slice(1), element: <AddBranch /> },
					{ path: ROUTES.EDIT_BRANCH.slice(1), element: <AddBranch /> },
					{ path: ROUTES.LEAVE_TYPE_LIST.slice(1), element: <LeaveTypeList /> },
					{ path: ROUTES.ADD_LEAVE_TYPE.slice(1), element: <AddLeaveType /> },
					{ path: ROUTES.EDIT_LEAVE_TYPE.slice(1), element: <AddLeaveType /> },
					{ path: ROUTES.SHARE_TYPE_LIST.slice(1), element: <ShareTypeList /> },
					{ path: ROUTES.ADD_SHARE_TYPE.slice(1), element: <AddShareType /> },
					{ path: ROUTES.EDIT_SHARE_TYPE.slice(1), element: <AddShareType /> },

					// Employee Master Data
					{ path: ROUTES.DEPARTMENTS.slice(1), element: <DepartmentList /> },
					{ path: ROUTES.ADD_DEPARTMENT.slice(1), element: <AddDepartment /> },
					{ path: ROUTES.EDIT_DEPARTMENT.slice(1), element: <AddDepartment /> },

					{ path: ROUTES.DESIGNATIONS.slice(1), element: <DesignationList /> },
					{ path: ROUTES.ADD_DESIGNATION.slice(1), element: <AddDesignation /> },
					{ path: ROUTES.EDIT_DESIGNATION.slice(1), element: <AddDesignation /> },

					{ path: ROUTES.SECTIONS.slice(1), element: <SectionList /> },
					{ path: ROUTES.ADD_SECTION.slice(1), element: <AddSection /> },
					{ path: ROUTES.EDIT_SECTION.slice(1), element: <AddSection /> },

					{ path: ROUTES.EMPLOYEE_TYPES.slice(1), element: <EmployeeTypeList /> },
					{ path: ROUTES.ADD_EMPLOYEE_TYPE.slice(1), element: <AddEmployeeType /> },
					{ path: ROUTES.EDIT_EMPLOYEE_TYPE.slice(1), element: <AddEmployeeType /> },

					{ path: ROUTES.EMPLOYEE_CATEGORIES.slice(1), element: <EmployeeCategoryList /> },
					{ path: ROUTES.ADD_EMPLOYEE_CATEGORY.slice(1), element: <AddEmployeeCategory /> },
					{ path: ROUTES.EDIT_EMPLOYEE_CATEGORY.slice(1), element: <AddEmployeeCategory /> },

					// Permission Management
					{ path: ROUTES.PERMISSIONS.slice(1), element: <Permission /> },
					{ path: ROUTES.GROUPS.slice(1), element: <Roles /> },
					{ path: ROUTES.USER_GROUP.slice(1), element: <UserGroup /> },
					{ path: ROUTES.ADD_USER.slice(1), element: <CreateUser /> },
					{ path: ROUTES.EDIT_USER.slice(1), element: <CreateUser /> },

					{ path: ROUTES.REACT_BOUNDARY.slice(1), element: <ReactBoundary /> },

					// Permission-gated routes
					{
						element: <PermissionRoute />,
						children: [
							// { path: ROUTES.SETTINGS.slice(1), element: <Settings /> },
							{ path: ROUTES.SIMPLE_FORM.slice(1), element: <SimpleForm /> },
							{ path: ROUTES.MULTI_STEP_FORM.slice(1), element: <MultiStepForm /> },
							{
								path: ROUTES.MULTI_SECTION_FORM.slice(1),
								element: <MultiSectionForm />
							},
							{ path: ROUTES.TABLE.slice(1), element: <Table /> },
							{ path: ROUTES.DOCTOR_DASHBOARD.slice(1), element: <DoctorDashboard /> },
							{ path: ROUTES.DOCTORS.slice(1), element: <DoctorList /> },
							{ path: ROUTES.ADD_DOCTOR.slice(1), element: <AddDoctor /> },
              { path: ROUTES.EDIT_DOCTOR.slice(1), element: <AddDoctor /> },
              { path: ROUTES.VIEW_DOCTOR.slice(1), element: <ViewDoctor /> },
              { path: ROUTES.DOCTOR_ONBOARDING_LIST.slice(1), element: <OnboardingList /> },
              { path: ROUTES.DOCTOR_ONBOARDING_WIZARD.slice(1), element: <OnboardingWizard /> },
              { path: ROUTES.DOCTOR_ONBOARDING_DETAILS.slice(1), element: <OnboardingDetails /> },
              { path: ROUTES.DOCTOR_AUDIT_TRAIL.slice(1), element: <AuditTrail /> },
              { path: ROUTES.DOCTOR_AUDIT_TRAIL_DETAILS.slice(1), element: <AuditTrailDetails /> },
              { path: ROUTES.DOCTOR_CONSULTATION_CHARGES.slice(1), element: <ConsultationCharges /> },
              { path: ROUTES.ADD_DOCTOR_CONSULTATION_CHARGE.slice(1), element: <AddConsultationCharge /> },
              { path: ROUTES.EDIT_DOCTOR_CONSULTATION_CHARGE.slice(1), element: <EditConsultationCharge /> },
              { path: ROUTES.VIEW_DOCTOR_CONSULTATION_CHARGE.slice(1), element: <ViewConsultationCharge /> },
              { path: ROUTES.DOCTOR_COMMISSIONS.slice(1), element: <CommissionList /> },
              { path: ROUTES.ADD_DOCTOR_COMMISSION.slice(1), element: <AddCommission /> },
              { path: ROUTES.EDIT_DOCTOR_COMMISSION.slice(1), element: <EditCommission /> },
              { path: ROUTES.VIEW_DOCTOR_COMMISSION.slice(1), element: <ViewCommission /> },
							{ path: ROUTES.EMPLOYEES.slice(1), element: <EmployeeList /> },
							{ path: ROUTES.ADD_EMPLOYEE.slice(1), element: <AddEmployee /> },
							{ path: ROUTES.EDIT_EMPLOYEE.slice(1), element: <AddEmployee /> },
							{ path: ROUTES.VIEW_EMPLOYEE.slice(1), element: <ViewEmployee /> },

							// Master Data
							{ path: ROUTES.STATES.slice(1), element: <StateList /> },
							{ path: ROUTES.ADD_STATE.slice(1), element: <AddState /> },
							{ path: ROUTES.EDIT_STATE.slice(1), element: <AddState /> },

							{ path: ROUTES.CITIES.slice(1), element: <CityList /> },
							{ path: ROUTES.ADD_CITY.slice(1), element: <AddCity /> },
							{ path: ROUTES.EDIT_CITY.slice(1), element: <AddCity /> },

							{ path: ROUTES.AREAS.slice(1), element: <AreaList /> },
							{ path: ROUTES.ADD_AREA.slice(1), element: <AddArea /> },
							{ path: ROUTES.EDIT_AREA.slice(1), element: <AddArea /> },

							{ path: ROUTES.DEPARTMENT_TYPES.slice(1), element: <DepartmentTypeList /> },
							{ path: ROUTES.ADD_DEPARTMENT_TYPE.slice(1), element: <AddDepartmentType /> },
							{ path: ROUTES.EDIT_DEPARTMENT_TYPE.slice(1), element: <AddDepartmentType /> },

							{ path: ROUTES.COLLECTION_TYPES.slice(1), element: <CollectionTypeList /> },
							{ path: ROUTES.ADD_COLLECTION_TYPE.slice(1), element: <AddCollectionType /> },
							{ path: ROUTES.EDIT_COLLECTION_TYPE.slice(1), element: <AddCollectionType /> },

							{ path: ROUTES.DISCOUNT_REASONS.slice(1), element: <DiscountReasonList /> },
							{ path: ROUTES.ADD_DISCOUNT_REASON.slice(1), element: <AddDiscountReason /> },
							{ path: ROUTES.EDIT_DISCOUNT_REASON.slice(1), element: <AddDiscountReason /> },

							{ path: ROUTES.ZONES.slice(1), element: <ZoneList /> },
							{ path: ROUTES.ADD_ZONE.slice(1), element: <AddZone /> },
							{ path: ROUTES.EDIT_ZONE.slice(1), element: <AddZone /> },

							{ path: ROUTES.BRANCH_LIST.slice(1), element: <BranchList /> },
							{ path: ROUTES.ADD_BRANCH.slice(1), element: <AddBranch /> },
							{ path: ROUTES.EDIT_BRANCH.slice(1), element: <AddBranch /> },
							{ path: ROUTES.LEAVE_TYPE_LIST.slice(1), element: <LeaveTypeList /> },
							{ path: ROUTES.ADD_LEAVE_TYPE.slice(1), element: <AddLeaveType /> },
							{ path: ROUTES.EDIT_LEAVE_TYPE.slice(1), element: <AddLeaveType /> },
							{ path: ROUTES.SHARE_TYPE_LIST.slice(1), element: <ShareTypeList /> },
							{ path: ROUTES.ADD_SHARE_TYPE.slice(1), element: <AddShareType /> },
							{ path: ROUTES.EDIT_SHARE_TYPE.slice(1), element: <AddShareType /> },

							// Employee Master Data
							{ path: ROUTES.DEPARTMENTS.slice(1), element: <DepartmentList /> },
							{ path: ROUTES.ADD_DEPARTMENT.slice(1), element: <AddDepartment /> },
							{ path: ROUTES.EDIT_DEPARTMENT.slice(1), element: <AddDepartment /> },

							{ path: ROUTES.DESIGNATIONS.slice(1), element: <DesignationList /> },
							{ path: ROUTES.ADD_DESIGNATION.slice(1), element: <AddDesignation /> },
							{ path: ROUTES.EDIT_DESIGNATION.slice(1), element: <AddDesignation /> },

							{ path: ROUTES.SECTIONS.slice(1), element: <SectionList /> },
							{ path: ROUTES.ADD_SECTION.slice(1), element: <AddSection /> },
							{ path: ROUTES.EDIT_SECTION.slice(1), element: <AddSection /> },

							{ path: ROUTES.EMPLOYEE_TYPES.slice(1), element: <EmployeeTypeList /> },
							{ path: ROUTES.ADD_EMPLOYEE_TYPE.slice(1), element: <AddEmployeeType /> },
							{ path: ROUTES.EDIT_EMPLOYEE_TYPE.slice(1), element: <AddEmployeeType /> },

							{ path: ROUTES.EMPLOYEE_CATEGORIES.slice(1), element: <EmployeeCategoryList /> },
							{ path: ROUTES.ADD_EMPLOYEE_CATEGORY.slice(1), element: <AddEmployeeCategory /> },
							{ path: ROUTES.EDIT_EMPLOYEE_CATEGORY.slice(1), element: <AddEmployeeCategory /> },

							{ path: ROUTES.EMPLOYEE_DISCOUNTS.slice(1), element: <EmployeeDiscountList /> },
							{ path: ROUTES.ADD_EMPLOYEE_DISCOUNT.slice(1), element: <AddEmployeeDiscount /> },
							{ path: ROUTES.EDIT_EMPLOYEE_DISCOUNT.slice(1), element: <AddEmployeeDiscount /> },

							{ path: ROUTES.EMPLOYEE_LEAVES.slice(1), element: <EmployeeLeaveList /> },
							{ path: ROUTES.ADD_EMPLOYEE_LEAVE.slice(1), element: <AddEmployeeLeave /> },
							{ path: ROUTES.EDIT_EMPLOYEE_LEAVE.slice(1), element: <AddEmployeeLeave /> },
							{ path: ROUTES.LEAVE_APPROVALS.slice(1), element: <LeaveApprovals /> },
							{ path: ROUTES.LEAVE_BALANCE.slice(1), element: <LeaveBalance /> },

							// Doctor Master Data
							{ path: ROUTES.DOCTOR_MASTER_DEGREE.slice(1), element: <DegreeList /> },
							{ path: ROUTES.ADD_DOCTOR_MASTER_DEGREE.slice(1), element: <AddDegree /> },
							{ path: ROUTES.EDIT_DOCTOR_MASTER_DEGREE.slice(1), element: <AddDegree /> },
							{ path: ROUTES.DOCTOR_MASTER_SPECIALIZATION.slice(1), element: <DocSpecializationList /> },
							{ path: ROUTES.ADD_DOCTOR_MASTER_SPECIALIZATION.slice(1), element: <AddDocSpecialization /> },
							{ path: ROUTES.EDIT_DOCTOR_MASTER_SPECIALIZATION.slice(1), element: <AddDocSpecialization /> },
							{ path: ROUTES.DOCTOR_MASTER_CHARGE_SERVICE_TYPE.slice(1), element: <DocChargeServiceTypeList /> },
							{ path: ROUTES.ADD_DOCTOR_MASTER_CHARGE_SERVICE_TYPE.slice(1), element: <AddDocChargeServiceType /> },
							{ path: ROUTES.EDIT_DOCTOR_MASTER_CHARGE_SERVICE_TYPE.slice(1), element: <AddDocChargeServiceType /> },
							{ path: ROUTES.DOCTOR_MASTER_DOC_TYPE.slice(1), element: <DocTypeList /> },
							{ path: ROUTES.ADD_DOCTOR_MASTER_DOC_TYPE.slice(1), element: <AddDocType /> },
							{ path: ROUTES.EDIT_DOCTOR_MASTER_DOC_TYPE.slice(1), element: <AddDocType /> },

							// Permission Management
							{ path: ROUTES.PERMISSIONS.slice(1), element: <Permission /> },
							{ path: ROUTES.GROUPS.slice(1), element: <Roles /> },
							{ path: ROUTES.USER_GROUP.slice(1), element: <UserGroup /> },
							{ path: ROUTES.ADD_USER.slice(1), element: <CreateUser /> },
							{ path: ROUTES.EDIT_USER.slice(1), element: <CreateUser /> },

							// Doctor Reports
							{ path: ROUTES.REGISTRATION_EXPIRY_REPORT.slice(1), element: <RegistrationExpiryReport /> },
							{ path: ROUTES.COMMISSION_REPORT.slice(1), element: <CommissionReport /> },
							{ path: ROUTES.INCOME_REPORT.slice(1), element: <IncomeReport /> }
						]
					},
					{ path: ROUTES.NOT_FOUND, element: <NotFound /> }
				]
			}
		]
	}
];
