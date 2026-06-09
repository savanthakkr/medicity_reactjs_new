import { generateXToken } from '@/utils/methods/generateXToken';
import { getDataInBrowser } from '@/utils/methods/DataInBrowser';
import { BROWSER_STORAGE_KEYS } from '@/utils/constants/browserStorageKeys';
import { store } from '@/data/states/store';
import { addToastAtom } from '@/data/states/toastAtom';
import axios from 'axios';

const config = {
	baseURL: import.meta.env.VITE_API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
};

const client = axios.create({
	baseURL: config.baseURL,
	headers: config.headers
});

client.interceptors.request.use(async requestConfig => {
	const nextConfig = { ...requestConfig };
	const method = (nextConfig.method || 'get').toLowerCase();

	nextConfig.headers = {
		...(nextConfig.headers || {}),
		Appname: import.meta.env.VITE_APP_NAME || '',
		lng: 'rjs'
	};

	// Attach the JWT on every request (matches the Postman `Authorization` header).
	// Read from storage so it survives page reloads, not just the post-login session.
	const token = getDataInBrowser(BROWSER_STORAGE_KEYS.authToken);
	if (token) {
		nextConfig.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
	}

	const isMultipart = nextConfig.data instanceof FormData;
	if (method !== 'get' && nextConfig.data && !isMultipart) {
		nextConfig.headers['X-Token'] = await generateXToken(nextConfig.data);
	}

	return nextConfig;
});

// --- Centralized toast handling ---------------------------------------
// Toasts are surfaced centrally ONLY for these modules: Permission groups
// (category), Permissions, Roles, Users and Auth. Every other module
// (departments, cities, etc.) keeps its own per-page toasts, so they are
// intentionally NOT handled here to avoid duplicate toasts.
const MANAGED_URL_RE = /^\/?(category|permission|role|user|auth)\//i;

// Within a managed module, these path segments mean a write succeeded.
// Note: `assign-permissions` is intentionally excluded — it fires on every
// checkbox toggle, so a success toast there would be too noisy.
const MUTATION_SEG_RE = /\/(create|update|delete|status|change-password|login)(\b|\/|$)/i;

const isManagedUrl = (url = '') => MANAGED_URL_RE.test(url);
const isMutationUrl = (url = '') => isManagedUrl(url) && MUTATION_SEG_RE.test(url);

const showToast = (type, message) => {
	if (!message) return;
	store.set(addToastAtom, { type, message });
};

client.interceptors.response.use(
	response => {
		const url = response.config?.url;
		const data = response?.data;
		if (data && typeof data === 'object' && isManagedUrl(url)) {
			const status = data.status;
			const msg = data.msg || data.message;
			if (status === 'error' || status === 'fail') {
				// Backend returned HTTP 200 but flagged a failure in the body.
				showToast('error', msg || 'Something went wrong');
			} else if (isMutationUrl(url) && msg) {
				showToast('success', msg);
			}
		}
		return response;
	},
	error => {
		// Auto-logout when server returns 401 (deactivated account, invalid token, etc.)
		if (error?.response?.status === 401) {
			const message = error?.response?.data?.message || error?.response?.data?.msg || '';
			localStorage.clear();
			sessionStorage.clear();
			if (!window.location.pathname.includes('/login')) {
				// Pass the reason as a URL param so the login page can display it
				const reason = encodeURIComponent(message || 'Your session has expired. Please log in again.');
				window.location.href = `/login?reason=${reason}`;
			}
			return Promise.reject(error);
		}

		if (isManagedUrl(error?.config?.url)) {
			const data = error?.response?.data;
			showToast('error', data?.msg || data?.message || error?.message || 'Something went wrong');
		}
		return Promise.reject(error);
	}
);

function setConfig(nextConfig = {}) {
	if (nextConfig.baseURL) {
		config.baseURL = nextConfig.baseURL;
		client.defaults.baseURL = nextConfig.baseURL;
	}
	if (nextConfig.headers) {
		config.headers = {
			...config.headers,
			...nextConfig.headers
		};
		client.defaults.headers.common = {
			...client.defaults.headers.common,
			...nextConfig.headers
		};
	}
}

async function get(url, options = {}) {
	const response = await client.get(url, options);
	return response.data;
}

// Every backend endpoint expects the request body wrapped as { inputData: ... }.
// If the caller already provides that shape, it passes through unchanged (no double-wrap).
// If the caller sends a plain object, it is wrapped automatically.
function normalizePayload(body) {
	if (body && typeof body === 'object' && 'inputData' in body) {
		return body;
	}
	return { inputData: body ?? {} };
}

async function post(url, body, options = {}) {
	const response = await client.post(url, normalizePayload(body), options);
	return response.data;
}

// Backend serves updates/deletes/status changes over POST (see Postman collection),
// so put/patch/delete are routed through POST.
async function put(url, body, options = {}) {
	const response = await client.post(url, normalizePayload(body), options);
	return response.data;
}

async function patch(url, body, options = {}) {
	const response = await client.post(url, normalizePayload(body), options);
	return response.data;
}

async function deleteRequest(url, options = {}) {
	const response = await client.post(url, normalizePayload(options?.data), options);
	return response.data;
}

async function upload(url, formData, options = {}) {
	const response = await client.post(url, formData, {
		...options,
		headers: {
			'Content-Type': 'multipart/form-data',
			...(options.headers || {})
		}
	});
	return response.data;
}

function clearCache() {}

async function revalidate(url, options = {}) {
	return get(url, options);
}

export default {
	setConfig,
	get,
	post,
	put,
	patch,
	delete: deleteRequest,
	upload,
	clearCache,
	revalidate
};
