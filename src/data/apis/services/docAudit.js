import http from '../../../lib/axios/axios';
import { API } from '../endpoints';

export const doctorAuditTrailApi = (params = {}) => http.post(API.DOCTORS.AUDIT_TRAIL, params);

export const doctorAuditTrailDetailsApi = id => http.post(API.DOCTORS.AUDIT_TRAIL_DETAILS(id));
