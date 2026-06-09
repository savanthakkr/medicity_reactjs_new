import http from '../../../lib/axios/axios';
import { API } from '../endpoints';

export const categoryListApi = ({ search = '' } = {}) =>
	http.post(API.CATEGORY.LIST, null, {
		params: { search }
	});

export const categoryDetailsApi = categoryId => http.post(API.CATEGORY.DETAILS(categoryId));

export const createCategoryApi = ({ client_Id, access_category_Name, access_category_Description }) =>
	http.post(API.CATEGORY.CREATE, {
		client_Id,
		access_category_Name,
		access_category_Description
	});

export const updateCategoryApi = (categoryId, { access_category_Name, access_category_Description }) =>
	http.put(API.CATEGORY.UPDATE(categoryId), {
		access_category_Name,
		access_category_Description
	});

export const updateCategoryStatusApi = (categoryId, is_active) =>
	http.patch(API.CATEGORY.STATUS(categoryId), { is_active });

export const deleteCategoryApi = categoryId => http.delete(API.CATEGORY.DELETE(categoryId));
