import http from '../../../lib/axios/axios';
import { API } from '../endpoints';

export const docOnboardListApi = (params = {}) => http.post(API.DOC_ONBOARD.LIST, params);

export const docOnboardCreateApi = (data = {}) => http.post(API.DOC_ONBOARD.CREATE, data);

export const docOnboardGetApi = id => http.post(API.DOC_ONBOARD.GET(id));

export const docOnboardSaveDraftApi = (id, data = {}) => http.post(API.DOC_ONBOARD.SAVE_DRAFT(id), data);

export const docOnboardUpdateApi = (id, data = {}) => http.post(API.DOC_ONBOARD.UPDATE(id), data);

export const docOnboardSubmitApi = (id, data = {}) => http.post(API.DOC_ONBOARD.SUBMIT(id), data);

export const docOnboardUploadDocumentsApi = (id, formData, onUploadProgress) =>
	http.upload(API.DOC_ONBOARD.UPLOAD_DOCUMENTS(id), formData, { onUploadProgress });

export const docOnboardDeleteApi = id => http.post(API.DOC_ONBOARD.DELETE(id));

export const docOnboardApproveApi = id => http.post(API.DOC_ONBOARD.APPROVE(id));

export const docOnboardRejectApi = (id, data = {}) => http.post(API.DOC_ONBOARD.REJECT(id), data);

export const docOnboardSendBackApi = (id, data = {}) => http.post(API.DOC_ONBOARD.SEND_BACK(id), data);
