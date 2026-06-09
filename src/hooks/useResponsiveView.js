import { useEffect, useState } from 'react';

export default function useResponsiveView() {
	const [state, setState] = useState(getCurrentState());

	useEffect(() => {
		function handleResize() {
			setState(getCurrentState());
		}

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return state;
}

function getCurrentState() {
	// SSR-safe check
	if (typeof window === 'undefined') {
		return { view: 'desktop', isMobile: false, isTablet: false, isDesktop: true };
	}

	const width = window.innerWidth;
	let view = '';
	let isMobile = false;
	let isTablet = false;
	let isDesktop = false;

	if (width < 768) {
		view = 'mobile';
		isMobile = true;
	} else if (width >= 768 && width < 1024) {
		view = 'tablet';
		isTablet = true;
	} else {
		view = 'desktop';
		isDesktop = true;
	}

	return { view, isMobile, isTablet, isDesktop };
}
