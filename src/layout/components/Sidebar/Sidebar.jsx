import SidebarMenu from './components/SidebarMenu';
import { useEffect, useState } from 'react';
import useResponsiveView from '../../../hooks/useResponsiveView';
import { SIDEBAR_ITEMS } from './components/sidebarConfig.js';
import DashboardSmallIcon from '@/assets/icons/DashboardSmallIcon';
import { useLocation } from 'react-router-dom';
import { findMenuPathByPathname } from '../../../utils/methods/mapPathnameToMenuPath';
import ChevronRight from '@/assets/icons/ChevronRight';
import { useAtom, useAtomValue } from 'jotai';
import { themeAtom } from '../../../data/states/appAtoms.js';
import { permissionsAtom } from '../../../data/states/permissionsAtom.js';

const Sidebar = () => {
	const { isDesktop } = useResponsiveView();
	const location = useLocation();

	const [isOpen, setIsSidebarOpen] = useState(true);
	const [activePath, setActivePath] = useState([]);

	const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

	const [theme] = useAtom(themeAtom);
	const isDark = theme === 'dark';

	const permissions = useAtomValue(permissionsAtom);

	// Returns true when a sidebar leaf path is accessible to the current user.
	// - null         → permissions not loaded yet → show all (safe boot state)
	// - isSuperAdmin → show all
	// - urls present → show only matching
	// - urls empty   → show nothing (no permissions assigned)
	const isPathAllowed = path => {
		if (permissions === null) return true;
		const { isSuperAdmin, urls } = permissions;
		if (isSuperAdmin) return true;
		if (!urls || urls.length === 0) return false;
		return urls.some(url => path === url || path.startsWith(url + '/'));
	};

	useEffect(() => {
		setIsSidebarOpen(isDesktop);
	}, [isDesktop]);

	useEffect(() => {
		const matchedPath = findMenuPathByPathname(SIDEBAR_ITEMS, location.pathname);
		setActivePath(matchedPath ?? []);
	}, [location.pathname]);

	const menuItems = SIDEBAR_ITEMS.filter(item => item.name !== 'Logout').reduce((acc, item) => {
		// Leaf item (no children) — check path directly
		if (!Array.isArray(item.children)) {
			if (!item.path || isPathAllowed(item.path)) acc.push(item);
			return acc;
		}
		// Group with children — keep only permitted children
		const visibleChildren = item.children.filter(child => child.path && isPathAllowed(child.path));
		if (visibleChildren.length > 0) {
			acc.push({ ...item, children: visibleChildren });
		}
		return acc;
	}, []);

	return (
		<aside
			className={`h-screen flex flex-col transition-all duration-300 ${isOpen ? 'w-[270px]' : 'w-16'
				} relative bg-brand-gradient-deep text-white shadow-xl`}
		>
			{/* Logo */}
			<div className="relative flex items-center justify-between px-4 py-5">
				{isOpen ? (
					<div className="flex items-center gap-2">
						<img src="/logo.png" alt="Logo" />
					</div>
				) : (
					// <StarIcon />
					<DashboardSmallIcon className="w-8 h-8" />
				)}

				<button
					onClick={toggleSidebar}
					className={`
      absolute
      -right-[11px]
      top-1/2
      -translate-y-1/2
      z-50
      flex items-center justify-center
      w-[21px] h-[21px]
      rounded-full border
      shadow-md
      transition-all
      ${isDark ? 'bg-[#1B2A39] border-[#546D88]' : 'bg-[#CAD4DE] border-[#5D656C]'}
    `}
				>
					<ChevronRight
						className={`
        w-[12px] h-[12px]
        transition-transform duration-300
        ${isDark ? 'text-white' : 'text-black'}
        ${isOpen ? 'rotate-180' : 'rotate-0'}
      `}
					/>
				</button>
			</div>

			{/* Menu */}
			{/* <ul className="mt-3 mb-5 space-y-1 px-3 flex-1 "> */}
			<ul className="mt-3 space-y-1 px-3 flex-1 overflow-y-auto pb-24 custom-scrollbar">
				{menuItems.map(item => (
					<SidebarMenu
						key={item.name}
						item={item}
						isOpen={isOpen}
						expandSidebar={() => setIsSidebarOpen(true)}
						activePath={activePath}
						setActivePath={setActivePath}
						currentPath={[item.name]}
					/>
				))}
			</ul>
		</aside>
	);
};

export default Sidebar;
