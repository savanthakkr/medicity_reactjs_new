import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from '../../assets/icons/SearchIcon.jsx';

const TableSearch = ({ onSearch, placeholder = 'Search across medical database...', delay = 500 }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const onSearchRef = useRef(onSearch);

	useEffect(() => {
		onSearchRef.current = onSearch;
	}, [onSearch]);

	useEffect(() => {
		const handler = setTimeout(() => {
			if (onSearchRef.current) {
				onSearchRef.current(searchTerm);
			}
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [searchTerm, delay]);

	return (
		<div className="relative w-[300px]">
			<input
				type="text"
				placeholder={placeholder}
				value={searchTerm}
				onChange={e => setSearchTerm(e.target.value)}
				className="h-[34px] w-full rounded-[6px] border border-divider bg-card pl-[14px] pr-[36px] font-medium tracking-[-0.04em] text-text-1 outline-none transition focus:border-[#1eafc0] focus:ring-2 focus:ring-[#21c4d6]/15"
				style={{
					fontSize: 'var(--entity-table-text, 12px)'
				}}
			/>
			<div className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-text-2">
				<SearchIcon className="h-[14px] w-[14px]" />
			</div>
		</div>
	);
};

export default TableSearch;
