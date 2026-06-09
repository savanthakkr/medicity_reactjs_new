import { useState } from 'react';
import { useGetAllPosts } from '../../data/apis/swrs/useGetAllPosts.jsx';

export default function ListView() {
	const [search, setSearch] = useState('');
	const [sortBy, setSortBy] = useState('id');
	const [order, setOrder] = useState('asc');
	const [page, setPage] = useState(1);
	const limit = 10;

	const { posts, error, loading } = useGetAllPosts({
		search,
		sortBy,
		order,
		page,
		limit
	});

	const handleSearchChange = e => {
		setSearch(e.target.value);
		setPage(1);
	};

	const handleSortChange = e => {
		setSortBy(e.target.value);
	};

	const toggleOrder = () => {
		setOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
	};

	return (
		<>
			<h1 className="text-2xl font-bold mb-4 text-card-foreground">Posts List</h1>

			{/* Controls */}
			<div className="flex flex-wrap gap-2 mb-4">
				<input
					value={search}
					onChange={handleSearchChange}
					placeholder="Search posts..."
					className="border px-2 py-1 rounded w-full sm:w-auto"
				/>
				<select value={sortBy} onChange={handleSortChange} className="border px-2 py-1 rounded">
					<option value="id">ID</option>
					<option value="title">Title</option>
				</select>
				<button onClick={toggleOrder} className="bg-muted px-3 py-1 rounded">
					{order === 'asc' ? '⬆ Asc' : '⬇ Desc'}
				</button>
			</div>

			{/* Loader/Error */}
			{loading && <p className="text-muted-foreground p-4">Loading posts...</p>}
			{error && <p className="text-red-500 p-4">Error: {error}</p>}

			{/* List */}
			{!loading && !error && (
				<>
					<div className="space-y-4">
						{posts.map(post => (
							<div
								key={post.id}
								className="bg-card text-card-foreground p-4 rounded shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
							>
								<div className="flex-1">
									<h2 className="font-bold text-lg mb-1">
										#{post.id} - {post.title}
									</h2>
									<p className="text-muted-foreground text-sm">{post.body}</p>
								</div>
							</div>
						))}
					</div>

					{/* Pagination */}
					<div className="flex justify-center items-center gap-2 mt-6">
						<button
							onClick={() => setPage(prev => Math.max(prev - 1, 1))}
							disabled={page === 1}
							className="px-4 py-1 bg-muted rounded disabled:opacity-50"
						>
							Prev
						</button>
						<span>Page {page}</span>
						<button onClick={() => setPage(prev => prev + 1)} className="px-4 py-1 bg-muted rounded">
							Next
						</button>
					</div>
				</>
			)}
		</>
	);
}
