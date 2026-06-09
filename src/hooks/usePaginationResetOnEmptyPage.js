import { useEffect } from 'react';

export function usePaginationResetOnEmptyPage(data, loading, page, setPage) {
	useEffect(() => {
		if (!data || loading || page <= 1) return;

		const list = Array.isArray(data?.list) ? data.list : [];
		if (list.length === 0) {
			setPage(currentPage => currentPage - 1);
		}
	}, [data, loading, page, setPage]);
}
