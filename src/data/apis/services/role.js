import http from '../../../lib/axios/axios';
import { API } from '../endpoints';

export const roleListApi = client_Id =>
	http.post(API.ROLE.LIST, null, {
		params: { client_Id }
	});

export const roleDetailsApi = roleId => http.post(API.ROLE.DETAILS(roleId));

export const createRoleApi = ({ client_Id, access_group_Name, access_group_Description }) =>
	http.post(API.ROLE.CREATE, {
		client_Id,
		access_group_Name,
		access_group_Description
	});

export const updateRoleApi = (roleId, { access_group_Name, access_group_Description }) =>
	http.put(API.ROLE.UPDATE(roleId), {
		access_group_Name,
		access_group_Description
	});

export const deleteRoleApi = roleId => http.delete(API.ROLE.DELETE(roleId));

export const assignPermissionsApi = ({ access_group_Id, access_Ids }) =>
	http.post(API.ROLE.ASSIGN_PERMISSIONS, {
		access_group_Id,
		access_Ids
	});

export const rolePermissionsApi = roleId => http.post(API.ROLE.PERMISSIONS(roleId));
