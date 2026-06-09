// components/FigmaPagination.jsx
import React from 'react';
import { DEFAULT_COMPACT_PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/utils/constants/ui';

const CommonPagination = ({
	currentPage = 1,
	totalPages = 1,
	pageSize = DEFAULT_PAGE_SIZE,
	totalItems = 0,
	onPageChange,
	onPageSizeChange
}) => {
	const start = (currentPage - 1) * pageSize + 1;
	const end = Math.min(currentPage * pageSize, totalItems);

	const getPages = () => {
		const pages = [];

		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
				pages.push(i);
			} else if (pages[pages.length - 1] !== '...') {
				pages.push('...');
			}
		}

		return pages;
	};

	const pages = getPages();

	return (
		<div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t">
			{/* LEFT TEXT */}
			<p className="text-sm text-slate-500">
				Showing {start}-{end} of {totalItems} results
			</p>

			{/* RIGHT CONTROLS */}
			<div className="flex items-center gap-4">
				{/* PAGE NUMBERS */}
				<div className="flex items-center gap-2">
					{/* PREV */}
					<button
						onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
						className="text-slate-400 hover:text-black px-2"
					>
						‹
					</button>

					{pages.map((page, index) =>
						page === '...' ? (
							<span key={index} className="px-2 text-slate-400">
								...
							</span>
						) : (
							<button
								key={index}
								onClick={() => onPageChange(page)}
								className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition ${
									currentPage === page
										? 'border-2 border-brand-light bg-brand-soft text-brand-light ring-0 ring-brand-light shadow-none'
										: 'text-slate-600 hover:bg-slate-200'
								}`}
							>
								{page}
							</button>
						)
					)}

					{/* NEXT */}
					<button
						onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
						className="text-slate-400 hover:text-black px-2"
					>
						›
					</button>
				</div>

				{/* PAGE SIZE */}
				<select
					value={pageSize}
					onChange={e => onPageSizeChange(Number(e.target.value))}
					className="border rounded-md px-2 py-1 text-sm text-slate-600"
				>
					{DEFAULT_COMPACT_PAGE_SIZE_OPTIONS.map(size => (
						<option key={size} value={size}>
							{size} / page
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export default CommonPagination;
