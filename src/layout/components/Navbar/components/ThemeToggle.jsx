import React from 'react';
import { WbSunny, DarkMode } from '@mui/icons-material';
import { useAtom } from 'jotai';
import { themeAtom } from '../../../../data/states/appAtoms';

const ThemeToggle = () => {
	const [theme, setTheme] = useAtom(themeAtom);

	const toggleTheme = () => {
		const nextTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(nextTheme);
	};

	const isDark = theme === 'dark';

	return (
		<button
			onClick={toggleTheme}
			className={`relative flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-all duration-300 ease-in-out ${
				isDark ? 'bg-[#2C3742]' : 'bg-slate-200'
			}`}
			aria-label="Toggle theme"
		>
			<div
				className={`flex h-6 w-6 items-center justify-center rounded-full bg-brand-light text-white shadow-sm transition-transform duration-300 ease-in-out ${
					isDark ? 'translate-x-6' : 'translate-x-0'
				}`}
			>
				{isDark ? <DarkMode sx={{ fontSize: 16 }} /> : <WbSunny sx={{ fontSize: 16 }} />}
			</div>
		</button>
	);
};

export default ThemeToggle;
