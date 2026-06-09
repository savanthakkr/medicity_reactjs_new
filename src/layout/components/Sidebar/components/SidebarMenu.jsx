import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ChevronRight from '../../../../assets/icons/ChevronRight.jsx';

const SidebarMenu = ({ item, isOpen, expandSidebar, activePath, currentPath, onAction }) => {
	const location = useLocation();
	const Icon = item.icon;
	const hasChildren = Array.isArray(item.children) && item.children.length > 0;
	const isOnActivePath = activePath?.[0] === item.name;

	const [open, setOpen] = useState(isOnActivePath);

	useEffect(() => {
		if (isOnActivePath) setOpen(true);
	}, [isOnActivePath]);

	const isLeafActive = !hasChildren && activePath?.[0] === item.name;

	const handleParentClick = () => {
		if (item.action) {
			onAction?.(item.action);
			return;
		}

		if (!isOpen && expandSidebar) {
			expandSidebar();
			if (hasChildren) setOpen(true);
			return;
		}

		if (hasChildren) setOpen(p => !p);
	};

	const RowContent = (
		<>
			<span className="flex items-center gap-3 min-w-0">
				{Icon && <Icon />}
				{isOpen && <span className="text-sm font-medium truncate">{item.name}</span>}
			</span>
			{isOpen && hasChildren && (
				<ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${hasChildren && open ? 'rotate-90' : ''}`} />
			)}
		</>
	);

	const baseRow = 'flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all';
	const activeRow = 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30';
	const idleRow = 'text-slate-200/90 hover:bg-white/5';

	return (
		<li>
			{item.path && !hasChildren ? (
				<Link
					to={item.path}
					className={`${baseRow} ${isLeafActive ? activeRow : idleRow}`}
					onClick={() => {
						if (!isOpen && expandSidebar) {
							expandSidebar();
						}
					}}
				>
					{RowContent}
				</Link>
			) : (
				<button
					type="button"
					onClick={handleParentClick}
					className={`${baseRow} w-full ${isOnActivePath && (!open || !isOpen) ? activeRow : idleRow}`}
				>
					{RowContent}
				</button>
			)}

			{hasChildren && open && isOpen && (
				<ul className="relative mt-1 ml-5 pl-5 space-y-3">
					{/* Main vertical line */}
					<span className="absolute left-1 top-0 bottom-3 border-l-2 !border-l-[#296F9F]" />

					{item.children.map(child => {
						const childActive = activePath?.[0] === item.name && activePath?.[1] === child.name;

						return (
							<li key={child.name} className="relative">
								{/* curved branch connector */}
								<span
									aria-hidden
									className="absolute -left-4 top-0 w-4 h-6 border-l-2 border-b-2 !border-l-[#296F9F] !border-b-[#296F9F] rounded-bl-xl"
								/>

								<Link
									to={child.path || '#'}
									className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
										childActive
											? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
											: 'text-slate-300 hover:bg-white/5 hover:text-white'
									}`}
								>
									<span className="truncate">{child.name}</span>

									{childActive && <span className="w-1.5 h-1.5 rounded-full bg-[#002F50]" />}
								</Link>
							</li>
						);
					})}
				</ul>
			)}
		</li>
	);
};

export default SidebarMenu;
