import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useClickOutside from '../hooks/useClickOutside';

/**
 * DropdownMenu
 * ------------
 * A reusable dropdown menu with optional nested submenus.
 *
 * Props:
 * @param {JSX.Element | (open: boolean) => JSX.Element} menuButton - The button or element to open the menu. If a function, gets `open` state.
 * @param {Array} items - The menu items array. Each item supports:
 *   - name: string (required)
 *   - path?: string (navigates using React Router <Link>)
 *   - action?: () => void (executes function on click)
 *   - children?: Array (renders nested submenu)
 *
 * Usage:
 * const items = [
 *   { name: "Home", path: "/" },
 *   {
 *     name: "Settings",
 *     children: [
 *       { name: "Profile", path: "/profile" },
 *       { name: "Security", path: "/security" },
 *     ],
 *   },
 *   { name: "Logout", action: () => alert("Logging out") },
 * ];
 *
 * <DropdownMenu
 *   menuButton={<button className="bg-blue-500 text-white p-2 rounded">Menu</button>}
 *   items={items}
 * />
 */

const DropdownMenu = ({ menuButton, items, customWidth = 50 }) => {
	const [open, setOpen] = useState(false);
	const ref = useRef();

	const toggleOpen = () => setOpen(prev => !prev);

	useClickOutside(ref, () => setOpen(false));

	return (
		<div className="relative inline-block overflow-visible" ref={ref}>
			<div onClick={toggleOpen} className="cursor-pointer">
				{typeof menuButton === 'function' ? menuButton(open) : menuButton}
			</div>

			<ul
				className={`absolute left-0 mt-1 bg-card shadow rounded w-[${customWidth}] z-50 transform transition-transform duration-300 origin-top ${
					open ? 'scale-y-100 opacity-100 visible' : 'scale-y-0 opacity-0 invisible pointer-events-none'
				}`}
			>
				{items.map((item, idx) => (
					<DropdownMenuItem key={idx} item={item} closeMenu={() => setOpen(false)} />
				))}
			</ul>
		</div>
	);
};

const DropdownMenuItem = ({ item, closeMenu }) => {
	const [subOpen, setSubOpen] = useState(false);
	const [submenuDirection, setSubmenuDirection] = useState('right');
	const ref = useRef();

	const hasChildren = item.children && item.children.length > 0;

	useClickOutside(ref, () => {
		setSubOpen(false);
	});

	const toggleSubOpen = () => {
		setSubOpen(prev => {
			const next = !prev;
			if (next && ref.current) {
				const rect = ref.current.getBoundingClientRect();
				const submenuWidth = 192; // w-48 = 192px
				const viewportWidth = window.innerWidth;

				if (rect.right + submenuWidth > viewportWidth - 20) {
					setSubmenuDirection('left');
				} else {
					setSubmenuDirection('right');
				}
			}
			return next;
		});
	};

	const handleItemClick = () => {
		if (item.action) item.action();
		if (item.path) closeMenu();
	};

	const getSubmenuClasses = () => {
		const baseClasses = 'absolute top-0 bg-card shadow-lg rounded-md w-48 z-[100] py-1';

		if (submenuDirection === 'left') {
			return `${baseClasses} right-full mr-1`;
		} else {
			return `${baseClasses} left-full ml-1`;
		}
	};

	return (
		<li className="relative" ref={ref}>
			{hasChildren ? (
				<>
					<button
						onClick={toggleSubOpen}
						className="flex justify-between items-center w-full px-4 py-2 hover:bg-accent text-card-foreground text-left transition-colors duration-200"
					>
						<span>{item.name}</span>
						<span className={`transform transition-transform duration-200 text-xs ml-2 ${subOpen ? 'rotate-90' : ''}`}>
							▶
						</span>
					</button>

					<ul
						className={`${getSubmenuClasses()} transition-opacity duration-300 ${
							subOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
						}`}
					>
						{item.children.map((subItem, idx) => (
							<DropdownMenuItem key={`${subItem.name}-${idx}`} item={subItem} closeMenu={closeMenu} />
						))}
					</ul>
				</>
			) : item.path ? (
				<Link
					to={item.path}
					className="block px-4 py-2 hover:bg-accent text-card-foreground transition-colors duration-200"
					onClick={closeMenu}
				>
					{item.name}
				</Link>
			) : (
				<button
					onClick={handleItemClick}
					className="block w-full text-left px-4 py-2 hover:bg-accent text-card-foreground transition-colors duration-200"
				>
					{item.name}
				</button>
			)}
		</li>
	);
};

export default DropdownMenu;
