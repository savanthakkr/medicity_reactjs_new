export { API } from './endpoints';
export { loginApi } from './services/auth';
export {
	myPermissionsApi,
	accessCategoryListApi,
	permissionListApi,
	createPermissionApi,
	updatePermissionApi,
	deletePermissionApi
} from './services/permission';
export {
	roleListApi,
	roleDetailsApi,
	createRoleApi,
	updateRoleApi,
	deleteRoleApi,
	assignPermissionsApi,
	rolePermissionsApi
} from './services/role';
export {
	categoryListApi,
	categoryDetailsApi,
	createCategoryApi,
	updateCategoryApi,
	updateCategoryStatusApi,
	deleteCategoryApi
} from './services/category';
export {
	userListApi,
	userDetailsApi,
	createUserApi,
	updateUserApi,
	deleteUserApi,
	updateUserStatusApi,
	changeUserPasswordApi,
	myProfileApi
} from './services/user';
export {
	zoneListApi,
	zoneDetailsApi,
	createZoneApi,
	updateZoneApi,
	deleteZoneApi,
	updateZoneStatusApi
} from './services/zone';
export {
  docOnboardListApi,
  docOnboardCreateApi,
  docOnboardGetApi,
  docOnboardSaveDraftApi,
  docOnboardUpdateApi,
  docOnboardSubmitApi,
  docOnboardUploadDocumentsApi,
  docOnboardDeleteApi,
  docOnboardApproveApi,
  docOnboardRejectApi,
  docOnboardSendBackApi,
} from "./services/docOnboard";

export { doctorAuditTrailApi, doctorAuditTrailDetailsApi } from './services/docAudit';
