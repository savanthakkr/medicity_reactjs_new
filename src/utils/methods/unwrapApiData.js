export function unwrapApiData(response, fallback = null) {
	if (response == null) return fallback;

	return response?.data ?? response;
}
