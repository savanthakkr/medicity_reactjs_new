import http from '../../../lib/axios/axios';
import { API } from '../endpoints';

export const userListApi = ({ client_Id, search = '' } = {}) =>
	http.post(API.USER.LIST, null, {
		params: { client_Id, search }
	});

export const userDetailsApi = userId => http.post(API.USER.DETAILS(userId));

export const createUserApi = ({ client_Id, access_group_Ids, user_Name, user_Email, user_Mobile, password }) =>
	http.post(API.USER.CREATE, {
		client_Id,
		access_group_Ids,
		user_Name,
		user_Email,
		user_Mobile,
		password
	});

export const updateUserApi = (userId, { access_group_Ids, user_Name, user_Email, user_Mobile }) =>
	http.put(API.USER.UPDATE(userId), {
		access_group_Ids,
		user_Name,
		user_Email,
		user_Mobile
	});

export const deleteUserApi = userId => http.delete(API.USER.DELETE(userId));

export const updateUserStatusApi = (userId, is_active) => http.patch(API.USER.STATUS(userId), { is_active });

export const changeUserPasswordApi = (userId, password) => http.patch(API.USER.CHANGE_PASSWORD(userId), { password });

export const myProfileApi = () => http.post(API.USER.MY_PROFILE);
