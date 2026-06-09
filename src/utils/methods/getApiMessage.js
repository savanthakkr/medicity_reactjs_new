export function getApiMessage(source, fallback = '') {
	if (!source) return fallback;

	return (
		source?.msg ||
		source?.message ||
		source?.data?.msg ||
		source?.data?.message ||
		source?.response?.data?.msg ||
		source?.response?.data?.message ||
		fallback
	);
}
