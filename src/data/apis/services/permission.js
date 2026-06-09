import http from '../../../lib/axios/axios';
import { API } from '../endpoints';

export const myPermissionsApi = () => http.post(API.PERMISSION.MY_PERMISSIONS);

export const accessCategoryListApi = () => http.post(API.PERMISSION.CATEGORIES);

export const permissionListApi = access_category_Id =>
	http.post(API.PERMISSION.LIST, null, {
		params: { access_category_Id }
	});

export const createPermissionApi = ({ client_Id, access_category_Id, access_Name, access_Key, access_URL }) =>
	http.post(API.PERMISSION.CREATE, {
		client_Id,
		access_category_Id,
		access_Name,
		access_Key,
		access_URL
	});

export const updatePermissionApi = (permissionId, { access_Name, access_Key, access_URL }) =>
	http.put(API.PERMISSION.UPDATE(permissionId), {
		access_Name,
		access_Key,
		access_URL
	});

export const deletePermissionApi = permissionId => http.delete(API.PERMISSION.DELETE(permissionId));
