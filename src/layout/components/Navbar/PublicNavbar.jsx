import { useState } from 'react';
import TextSizeIcon from '../../../assets/icons/TextSizeIcon.jsx';
import { useAtom } from 'jotai';
import { fontSizeAtom } from '../../../data/states/appAtoms.js';
import ThemeToggle from './components/ThemeToggle.jsx';
import Tooltip from '@/components/dropdown/Tooltip.jsx';
import { themeAtom } from '../../../data/states/appAtoms.js';
import CustomSelect from '../../../components/dropdown/Select.jsx';

const FONT_SIZE_OPTIONS = ['small', 'medium', 'large'];

const formatLabel = value => value.charAt(0).toUpperCase() + value.slice(1);

const PublicNavbar = () => {
	const [fontSize = 'medium', setFontSize] = useAtom(fontSizeAtom);
	const [tooltipOpen, setTooltipOpen] = useState(false);
	const [theme] = useAtom(themeAtom);
	const isDark = theme === 'dark';

	const handleFontSizeChange = event => {
		const nextSize = event.target.value;
		setFontSize(nextSize);
	};

	return (
		<nav className="flex h-16 items-center justify-between border-b border-divider bg-background px-6 shadow-sm">
			{/* Left branding */}
			<div className="flex items-center gap-3">
				<img src={isDark ? '/logo.png' : '/logo-light.png'} alt="Medicity Logo" className="h-8 w-auto" />
			</div>

			{/* Right actions */}
			<div className="flex items-center gap-5">
				<div className="flex items-center gap-1">
					<TextSizeIcon className="h-4 w-4" />
					<Tooltip describeChild title="Text size" open={tooltipOpen}>
						<div
							className="relative flex items-center"
							onMouseEnter={() => setTooltipOpen(true)}
							onMouseLeave={() => setTooltipOpen(false)}
						>
							<CustomSelect
								value={fontSize}
								onClick={() => setTooltipOpen(false)}
								onFocus={() => setTooltipOpen(false)}
								onChange={handleFontSizeChange}
								options={FONT_SIZE_OPTIONS.map(size => ({
									value: size,
									label: formatLabel(size)
								}))}
								minWidth={110}
								aria-label="Choose app font size"
							/>
						</div>
					</Tooltip>

					<Tooltip describeChild title={isDark ? 'Convert Light mode' : 'Convert Dark mode'}>
						<div className="flex">
							<ThemeToggle />
						</div>
					</Tooltip>
				</div>
			</div>
		</nav>
	);
};

export default PublicNavbar;
