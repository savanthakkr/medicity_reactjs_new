import React, { useState, useMemo, useRef, useEffect } from 'react';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChevronDown from '../../assets/icons/ChevronDown.jsx';
import { NO_DATA_DARK_ASSET, NO_DATA_LIGHT_ASSET } from '@/utils/constants/assets.js';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '@/utils/constants/ui';
import Button from './Button.jsx';
import Tooltip from '../dropdown/Tooltip.jsx';
import { useAtom } from 'jotai';
import { themeAtom } from '@/data/states/appAtoms.js';

const getVisiblePages = (currentPage, totalPages) => {
	const pages = [];

	for (let page = 1; page <= totalPages; page += 1) {
		if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
			pages.push(page);
		} else if (pages[pages.length - 1] !== '...') {
			pages.push('...');
		}
	}

	return pages;
};

const getTextFromNode = node => {
	if (node === null || node === undefined) return '';
	if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
		return String(node);
	}
	if (Array.isArray(node)) {
		return node.map(getTextFromNode).join('');
	}
	if (React.isValidElement(node)) {
		return getTextFromNode(node.props.children);
	}
	return '';
};

const truncateReactElement = (element, truncatedText) => {
	if (!React.isValidElement(element)) return element;

	const children = element.props.children;

	if (typeof children === 'string') {
		return React.cloneElement(element, {
			className: `${element.props.className || ''} cursor-pointer`
		}, truncatedText);
	}

	if (Array.isArray(children)) {
		let replaced = false;
		const newChildren = children.map(child => {
			if (!replaced && typeof child === 'string') {
				replaced = true;
				return truncatedText;
			}
			if (!replaced && React.isValidElement(child)) {
				const tc = truncateReactElement(child, truncatedText);
				if (tc !== child) {
					replaced = true;
					return tc;
				}
			}
			return child;
		});

		if (replaced) {
			return React.cloneElement(element, {
				className: `${element.props.className || ''} cursor-pointer`
			}, ...newChildren);
		}
	}

	if (React.isValidElement(children)) {
		const newChild = truncateReactElement(children, truncatedText);
		if (newChild !== children) {
			return React.cloneElement(element, {
				className: `${element.props.className || ''} cursor-pointer`
			}, newChild);
		}
	}

	return element;
};

const CellRenderer = ({ content, column }) => {
	const label = String(column?.label || column?.header || '').toLowerCase();
	const fieldKey = String(column?.key || column?.accessor || '').toLowerCase();
	const isControlColumn =
		fieldKey === 'actions' || fieldKey === 'status' || label.includes('action') || label.includes('status');

	const text = getTextFromNode(content).trim();

	if (!isControlColumn) {
		const isPrimitive =
			content === null || content === undefined || typeof content !== 'object' || !React.isValidElement(content);
		const lower = text.toLowerCase();
		const isPlaceholder =
			lower === '-' || lower === '_' || lower === '—' || lower === '–' || lower === 'n/a' || lower === 'na';
		const isEmpty = !text || isPlaceholder;
		if (isEmpty && (isPrimitive || isPlaceholder)) {
			return 'N/A';
		}
	}

	if (!isControlColumn && text.length > 18) {
		const truncated = text.slice(0, 18) + '..';
		const isPrimitive =
			content === null || content === undefined || typeof content !== 'object' || !React.isValidElement(content);

		if (isPrimitive) {
			return (
				<Tooltip title={text}>
					<span className="cursor-pointer">{truncated}</span>
				</Tooltip>
			);
		} else {
			return (
				<Tooltip title={text}>
					{truncateReactElement(content, truncated)}
				</Tooltip>
			);
		}
	}

	return content;
};

/**
 * CommonTable Component with built-in pagination support.
 *
 * @param {Object[]} columns - Array of column configurations.
 *   Each column can have:
 *   - key/accessor: Key to get data from row object
 *   - label/header: Text to display in header
 *   - widthClassName: Tailwind class for width (e.g., "w-[45px]")
 *   - render: (row) => JSX - Custom render function for the cell
 * @param {Object[]} data - Array of row objects
 * @param {Object} style - Style object for the container (e.g., for responsive scale variables)
 * @param {string} containerClassName - Additional classes for the container
 * @param {number} currentPage - Current active page (optional, for pagination)
 * @param {number} totalPages - Total number of pages (optional, for pagination)
 * @param {number} pageSize - Number of items per page (optional, for pagination)
 * @param {number} totalItems - Total number of items (optional, for pagination)
 * @param {function} onPageChange - Callback when page changes (optional, enables pagination)
 * @param {function} onPageSizeChange - Callback when page size changes (optional)
 * @param {number[]} pageSizeOptions - Options for page size selector
 */
const CommonTable = ({
	columns = [],
	data = [],
	style = {},
	containerClassName = '',
	currentPage = 1,
	totalPages = 1,
	pageSize = DEFAULT_PAGE_SIZE,
	totalItems = 0,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
	loading = false,
	sortableColumns = [],
	sortConfig: externalSortConfig,
	defaultSortConfig = { key: 'created_at', direction: 'desc' },
	onSortChange
}) => {
	const [internalSortConfig, setInternalSortConfig] = useState(defaultSortConfig);
	const currentSortConfig = onSortChange && externalSortConfig ? externalSortConfig : internalSortConfig;

	const col0Ref = useRef(null);
	const [col0Width, setCol0Width] = useState(0);

	const theadRef = useRef(null);
	const [theadWidth, setTheadWidth] = useState(0);

	const [theme] = useAtom(themeAtom);

	const isDark = theme === 'dark';

	useEffect(() => {
		const updateWidths = () => {
			if (col0Ref.current) setCol0Width(col0Ref.current.offsetWidth);
			if (theadRef.current) setTheadWidth(theadRef.current.offsetWidth);
		};

		updateWidths();

		const observer = new ResizeObserver(() => {
			updateWidths();
		});

		if (theadRef.current) observer.observe(theadRef.current);
		if (col0Ref.current) observer.observe(col0Ref.current);

		return () => observer.disconnect();
	}, [columns, data]);

	const handleSort = key => {
		let newSortConfig;

		if (currentSortConfig?.key !== key) {
			newSortConfig = { key, direction: 'asc' };
		} else if (currentSortConfig?.direction === 'asc') {
			newSortConfig = { key, direction: 'desc' };
		} else {
			newSortConfig = defaultSortConfig;
		}

		if (onSortChange) {
			onSortChange(newSortConfig);
		} else {
			setInternalSortConfig(newSortConfig);
		}
	};

	const sortedData = useMemo(() => {
		if (onSortChange) return data;
		if (!internalSortConfig || !internalSortConfig.key) return data;

		return [...data].sort((a, b) => {
			let aValue = a[internalSortConfig.key];
			let bValue = b[internalSortConfig.key];

			if (aValue === undefined || aValue === null) aValue = '';
			if (bValue === undefined || bValue === null) bValue = '';

			if (
				internalSortConfig.key === 'timestamp' ||
				internalSortConfig.key === 'createdAt' ||
				internalSortConfig.key === 'updatedAt'
			) {
				const timeA = new Date(aValue).getTime() || 0;
				const timeB = new Date(bValue).getTime() || 0;
				if (timeA < timeB) return internalSortConfig.direction === 'asc' ? -1 : 1;
				if (timeA > timeB) return internalSortConfig.direction === 'asc' ? 1 : -1;
				return 0;
			}

			if (typeof aValue === 'string' && typeof bValue === 'string') {
				const strA = aValue.toLowerCase();
				const strB = bValue.toLowerCase();
				if (strA < strB) return internalSortConfig.direction === 'asc' ? -1 : 1;
				if (strA > strB) return internalSortConfig.direction === 'asc' ? 1 : -1;
				return 0;
			}

			if (aValue < bValue) return internalSortConfig.direction === 'asc' ? -1 : 1;
			if (aValue > bValue) return internalSortConfig.direction === 'asc' ? 1 : -1;
			return 0;
		});
	}, [data, internalSortConfig, onSortChange]);

	const showPagination = Boolean(onPageChange);
	const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const end = Math.min(currentPage * pageSize, totalItems);

	const visiblePages = useMemo(
		() => (showPagination ? getVisiblePages(currentPage, totalPages) : []),
		[showPagination, currentPage, totalPages]
	);

	return (
		<div className={`flex flex-col gap-4 ${containerClassName}`} style={style}>
			<div className="flex-1 overflow-hidden rounded-[8px] border border-divider bg-card shadow-sm">
				<div className="overflow-x-auto h-full">
					<table className="min-w-full table-fixed border-collapse text-left">
						<thead ref={theadRef}>
							<tr
								className="h-[40px] text-[#f9fbfd]"
								style={{
									backgroundImage:
										'linear-gradient(93.3504deg, rgb(5, 81, 133) 1.7261%, rgb(30, 175, 192) 53.076%, rgb(5, 81, 133) 102.14%)'
								}}
							>
								{columns.map((column, index) => {
									const fieldKey = column.key || column.accessor;
									const isSortable = sortableColumns.includes(fieldKey);
									return (
										<th
											key={fieldKey || index}
											ref={index === 0 ? col0Ref : undefined}
											className={`${column.widthClassName || ''} px-[10px] font-medium leading-none ${isSortable ? 'cursor-pointer select-none' : ''} ${index <= 1 ? 'sticky z-10' : ''}`}
											style={{
												fontSize: 'var(--entity-table-text, var(--doctor-table-text, 12px))',
												...(index <= 1
													? {
															left: index === 0 ? 0 : col0Width,
															backgroundImage:
																'linear-gradient(93.3504deg, rgb(5, 81, 133) 1.7261%, rgb(30, 175, 192) 53.076%, rgb(5, 81, 133) 102.14%)',
															backgroundSize: `${theadWidth}px 100%`,
															backgroundPosition: index === 0 ? '0 0' : `-${col0Width}px 0`
														}
													: {})
											}}
											onClick={() => isSortable && handleSort(fieldKey)}
										>
											<div className="flex items-center gap-1">
												{column.label || column.header}
												{isSortable && (
													<div className="flex flex-col -space-y-[4px]">
														<ChevronDown
															strokeWidth="3"
															className={`h-3 w-3 rotate-180 transition-opacity ${currentSortConfig.key === fieldKey && currentSortConfig.direction === 'asc' ? 'opacity-100' : 'opacity-40'}`}
														/>
														<ChevronDown
															strokeWidth="3"
															className={`h-3 w-3 transition-opacity ${currentSortConfig.key === fieldKey && currentSortConfig.direction === 'desc' ? 'opacity-100' : 'opacity-40'}`}
														/>
													</div>
												)}
											</div>
										</th>
									);
								})}
							</tr>
						</thead>

						<tbody>
							{loading ? (
								Array.from({ length: 5 }).map((_, rowIndex) => (
									<tr key={rowIndex} className="h-[40px] border-b border-[rgba(202,212,222,0.55)] bg-card">
										{columns.map((column, colIndex) => (
											<td
												key={colIndex}
												className={`px-[10px] py-[7px] ${colIndex <= 1 ? 'sticky z-10 bg-card' : ''}`}
												style={colIndex <= 1 ? { left: colIndex === 0 ? 0 : col0Width } : {}}
											>
												<div className="h-4 w-full animate-pulse rounded bg-slate-50 dark:bg-slate-400/15" />
											</td>
										))}
									</tr>
								))
							) : sortedData.length > 0 ? (
								sortedData.map((row, rowIndex) => (
									<tr
										key={row.id || rowIndex}
										className={`group h-[40px] border-b border-[rgba(202,212,222,0.55)] bg-card leading-none text-text-2 ${
											rowIndex === sortedData.length - 1 ? 'border-b-0' : ''
										}`}
										style={{
											fontSize: 'var(--entity-table-text, var(--doctor-table-text, 12px))'
										}}
									>
										{columns.map((column, colIndex) => (
											<td
												key={`${rowIndex}-${column.key || column.accessor || colIndex}`}
												className={`px-[10px] py-[7px] transition-colors duration-200 group-hover:bg-field ${
													colIndex <= 1 ? 'sticky z-10 bg-card' : ''
												}`}
												style={colIndex <= 1 ? { left: colIndex === 0 ? 0 : col0Width } : {}}
											>
												<CellRenderer
													column={column}
													content={column.render ? column.render(row, rowIndex) : row[column.key || column.accessor]}
												/>
											</td>
										))}
									</tr>
								))
							) : (
								<tr>
									<td colSpan={columns.length} className="px-[10px] py-[30px]">
										<div className="flex flex-col items-center justify-center gap-3">
											<img
												src={isDark ? NO_DATA_DARK_ASSET : NO_DATA_LIGHT_ASSET}
												alt="No data"
												className="h-[140px] w-auto"
											/>

											<p className="text-center font-medium text-text-3">No data available</p>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{showPagination && (
				<div className="flex flex-wrap items-center justify-between gap-4">
					<p
						className="font-normal leading-none tracking-[-0.04em] text-text-1"
						style={{ fontSize: 'var(--entity-table-text, var(--doctor-footer-text, 12px))' }}
					>
						Showing {start} - {end} of {totalItems} results
					</p>

					<div className="flex flex-wrap items-center gap-[20px]">
						{/* Page Navigation */}
						<div
							className="flex items-center gap-[9px] font-medium leading-none text-text-1"
							style={{ fontSize: 'var(--entity-table-text, var(--doctor-footer-text, 12px))' }}
						>
							<Tooltip title="Previous">
								<Button
									variant="unstyled"
									onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
									className="flex h-[24px] w-[12px] items-center justify-center text-text-1 transition hover:text-brand-light disabled:cursor-not-allowed disabled:text-[#cad4de]"
									disabled={currentPage === 1}
									aria-label="Previous page"
								>
									<ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
								</Button>
							</Tooltip>

							{visiblePages.map((pageItem, index) =>
								pageItem === '...' ? (
									<span
										key={`ellipsis-${index}`}
										className="text-text-1"
										style={{ fontSize: 'var(--entity-table-text, var(--doctor-footer-text, 12px))' }}
									>
										...
									</span>
								) : (
									<Button
										key={pageItem}
										variant="unstyled"
										onClick={() => onPageChange?.(pageItem)}
										className={`flex h-[24px] min-w-[24px] items-center justify-center rounded-full px-[7px] transition ${
											pageItem === currentPage
												? 'border border-[#1eafc0] bg-brand-soft text-[#1eafc0]'
												: 'text-text-1 hover:text-brand-light'
										}`}
										style={{ fontSize: 'var(--entity-table-text, var(--doctor-footer-text, 12px))' }}
										aria-current={pageItem === currentPage ? 'page' : undefined}
									>
										{pageItem}
									</Button>
								)
							)}

							<Tooltip title="Next">
								<Button
									variant="unstyled"
									onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
									className="flex h-[24px] w-[12px] items-center justify-center text-text-1 transition hover:text-brand-light disabled:cursor-not-allowed disabled:text-[#cad4de]"
									disabled={currentPage === totalPages || totalPages === 0}
									aria-label="Next page"
								>
									<ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
								</Button>
							</Tooltip>
						</div>

						{/* Page Size Selector */}
						{onPageSizeChange && (
							<Tooltip title="Page Size">
								<div className="relative cursor-pointer">
									<select
										value={pageSize}
										onChange={event => {
											onPageSizeChange?.(Number(event.target.value));
										}}
										className="h-[31px] cursor-pointer appearance-none rounded-[6px] border border-divider bg-card pl-[10px] pr-[26px] font-medium tracking-[-0.04em] text-text-1 outline-none transition focus:border-[#21c4d6] focus:ring-2 focus:ring-[#21c4d6]/15"
										style={{
											fontSize: 'var(--entity-table-text, var(--doctor-footer-text, 12px))'
										}}
										aria-label="Select page size"
									>
										{pageSizeOptions.map(option => (
											<option key={option} value={option}>
												{option} / page
											</option>
										))}
									</select>

									<span className="pointer-events-none absolute right-[8px] top-1/2 -translate-y-1/2 text-text-2">
										<ChevronDown className="h-[12px] w-[12px] rotate-[-90deg]" />
									</span>
								</div>
							</Tooltip>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default CommonTable;
