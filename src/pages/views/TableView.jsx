import { useState } from 'react';
import { useGetAllPosts } from '../../data/apis/swrs/useGetAllPosts.jsx';

export default function TableView() {
	const [search, setSearch] = useState('');
	const [sortBy, setSortBy] = useState('id');
	const [order, setOrder] = useState('asc');
	const [page, setPage] = useState(1);
	const limit = 6;

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
			<h1 className="text-2xl font-bold mb-4 text-card-foreground">Posts Table</h1>

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

			{/* Loading & Error */}
			{loading && <p className="text-muted-foreground p-4">Loading posts...</p>}
			{error && <p className="text-red-500 p-4">Error: {error}</p>}

			{/* Table */}
			{!loading && !error && (
				<>
					<div className="overflow-x-auto">
						<table className="min-w-full border border-border text-sm">
							<thead className="bg-muted text-muted-foreground">
								<tr>
									<th className="text-left px-4 py-2 border-b">ID</th>
									<th className="text-left px-4 py-2 border-b">Title</th>
									<th className="text-left px-4 py-2 border-b">Body</th>
								</tr>
							</thead>
							<tbody>
								{posts.map(post => (
									<tr key={post.id} className="hover:bg-accent">
										<td className="px-4 py-2 border-b">{post.id}</td>
										<td className="px-4 py-2 border-b">{post.title}</td>
										<td className="px-4 py-2 border-b">{post.body}</td>
									</tr>
								))}
							</tbody>
						</table>
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
