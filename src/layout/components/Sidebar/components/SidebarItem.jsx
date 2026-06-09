import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ item, isOpen, expanded, onToggle }) => {
	const location = useLocation();
	const isActive = item.path && location.pathname === item.path;
	const Icon = item.icon;

	return item.path ? (
		<Link
			to={item.path}
			onClick={onToggle}
			className={`flex items-center px-3 py-2 rounded-md transition-all hover:bg-accent text-card-foreground ${
				isActive ? 'bg-muted font-semibold' : ''
			}`}
		>
			{Icon && <Icon size={20} />}
			{isOpen && <span className="ml-3">{item.name}</span>}
		</Link>
	) : (
		<button
			onClick={onToggle}
			className={`flex items-center w-full px-3 py-2 rounded-md transition-all hover:bg-accent text-card-foreground ${
				expanded ? 'bg-muted' : ''
			}`}
		>
			{Icon && <Icon size={20} />}
			{isOpen && <span className="ml-3">{item.name}</span>}
			{isOpen && item.children && <span className="ml-auto text-sm">{expanded ? '▲' : '▶'}</span>}
		</button>
	);
};

export default SidebarItem;
