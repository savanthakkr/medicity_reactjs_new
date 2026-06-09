// useGetAllPosts.jsx
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';

export const useGetAllPosts = ({ search = '', sortBy = 'id', order = 'asc', page = 1, limit = 10 } = {}) => {
	const queryParams = new URLSearchParams({
		_page: page,
		_limit: limit,
		_sort: sortBy,
		_order: order,
		...(search ? { q: search } : {}) // 'q' is supported by JSONPlaceholder for full-text search
	});

	const url = `https://jsonplaceholder.typicode.com/posts?${queryParams.toString()}`;
	const { data: posts, error, loading, mutate } = useAutoRevalidate(url);

	return { posts, error, loading, mutate };
};
