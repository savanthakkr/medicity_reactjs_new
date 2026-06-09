import http from '../../../lib/axios/axios';
import { API } from '../endpoints';

export const zoneListApi = ({ page, limit, search, sortBy, sortOrder, is_active } = {}) =>
	http.post(API.ZONES.LIST, {
		page,
		limit,
		search,
		sortBy,
		sortOrder,
		is_active
	});

export const zoneDetailsApi = zoneId => http.post(API.ZONES.GET(zoneId));

export const createZoneApi = ({ zone_Name }) => http.post(API.ZONES.CREATE, { zone_Name });

export const updateZoneApi = (zoneId, { zone_Name }) => http.post(API.ZONES.UPDATE(zoneId), { zone_Name });

export const deleteZoneApi = zoneId => http.delete(API.ZONES.DELETE(zoneId));

export const updateZoneStatusApi = (zoneId, is_active) =>
	http.put(API.ZONES.STATUS(zoneId), { inputData: { is_active } });
