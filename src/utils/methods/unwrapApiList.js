import { unwrapApiData } from './unwrapApiData.js';

export function unwrapApiList(response, fallback = []) {
	const unwrapped = unwrapApiData(response, fallback);

	if (Array.isArray(unwrapped)) return unwrapped;
	if (Array.isArray(unwrapped?.list)) return unwrapped.list;
	if (Array.isArray(response?.list)) return response.list;

	return fallback;
}
