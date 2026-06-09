// utils/findMenuPathByPathname.js
export function findMenuPathByPathname(menuItems, pathname) {
	let bestMatch = null;
	let maxLen = -1;

	function traverse(items, currentPath) {
		for (const item of items) {
			const newPath = [...currentPath, item.name];

			if (item.path && (item.path === pathname || (item.path !== '/' && pathname.startsWith(item.path + '/')))) {
				if (item.path.length > maxLen) {
					maxLen = item.path.length;
					bestMatch = newPath;
				}
			}

			if (item.children) {
				traverse(item.children, newPath);
			}
		}
	}

	traverse(menuItems, []);
	return bestMatch;
}
