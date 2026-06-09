import http from '../../../lib/axios/axios';
import { API } from '../endpoints';

export const loginApi = ({ user_Email, user_Password }) => http.post(API.AUTH.LOGIN, { user_Email, user_Password });
