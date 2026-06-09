import React, { useState, useEffect } from 'react';

const DesignTemplate = () => {
	const [scale, setScale] = useState('medium');
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove('scale-small', 'scale-medium', 'scale-large');
		root.classList.add(`scale-${scale}`);
	}, [scale]);

	useEffect(() => {
		const root = document.documentElement;
		if (isDark) {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}, [isDark]);

	return (
		<div className="p-8 space-y-12 max-w-6xl mx-auto">
			{/* Controls */}
			<div className="flex flex-wrap gap-4 items-center justify-between bg-bg-2 p-6 rounded-custom border border-bg-3">
				<div className="space-y-2">
					<h3 className="text-h4">Accessibility Settings</h3>
					<div className="flex gap-2">
						{['small', 'medium', 'large'].map(s => (
							<button
								key={s}
								onClick={() => setScale(s)}
								className={`px-4 py-2 rounded-custom capitalize transition-all ${
									scale === s ? 'bg-primary-start text-white' : 'bg-bg-1 border border-bg-3'
								}`}
							>
								{s}
							</button>
						))}
					</div>
				</div>
				<div className="space-y-2">
					<h3 className="text-h4">Theme Mode</h3>
					<button onClick={() => setIsDark(!isDark)} className="btn-fill">
						Switch to {isDark ? 'Light' : 'Dark'} Mode
					</button>
				</div>
			</div>

			{/* Typography */}
			<section className="space-y-6">
				<h2 className="text-h2 border-b border-bg-3 pb-2">Typography</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="space-y-4 bg-bg-1 p-6 rounded-custom border border-bg-3">
						<h1 className="text-h1">H1 - Heading 1</h1>
						<h2 className="text-h2">H2 - Heading 2</h2>
						<h3 className="text-h3">H3 - Heading 3</h3>
						<h4 className="text-h4">H4 - Heading 4</h4>
						<h5 className="text-h5">H5 - Heading 5</h5>
						<h6 className="text-h6">H6 - Heading 6</h6>
					</div>
					<div className="space-y-4 bg-bg-1 p-6 rounded-custom border border-bg-3">
						<p className="text-p1">
							Paragraph 1 - Regular (Standard reading text). Lorem ipsum dolor sit amet, consectetur adipiscing elit.
							Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
						</p>
						<p className="text-p2">
							Paragraph 2 - Medium (Smaller annotation or caption text). Ut enim ad minim veniam, quis nostrud
							exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
						</p>
					</div>
				</div>
			</section>

			{/* Buttons */}
			<section className="space-y-6">
				<h2 className="text-h2 border-b border-bg-3 pb-2">Buttons</h2>
				<div className="flex flex-wrap gap-6 bg-bg-1 p-6 rounded-custom border border-bg-3">
					<div className="space-y-2">
						<p className="text-p2 text-text-3 uppercase">Fill Button</p>
						<button className="btn-fill">Save Changes</button>
					</div>
					<div className="space-y-2">
						<p className="text-p2 text-text-3 uppercase">Ghost Button</p>
						<button className="btn-ghost">Clear Filter</button>
					</div>
				</div>
			</section>

			{/* Color Palettes */}
			<section className="space-y-6">
				<h2 className="text-h2 border-b border-bg-3 pb-2">Color Palettes</h2>

				{/* KPI Cards */}
				<div className="space-y-4">
					<h3 className="text-h3">Dashboard KPI Card Gradients</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{[1, 2, 3, 4].map(i => (
							<div
								key={i}
								className={`h-24 rounded-custom bg-gradient-to-r from-kpi-${i}-start to-kpi-${i}-end flex items-center justify-center text-white font-bold`}
							>
								KPI CARD {i}
							</div>
						))}
					</div>
				</div>

				{/* Pie Charts */}
				<div className="space-y-4">
					<h3 className="text-h3">Pie Chart Gradients</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{[1, 2, 3, 4].map(i => (
							<div
								key={i}
								className={`h-24 rounded-custom bg-gradient-to-r from-pie-${i}-start to-pie-${i}-end flex items-center justify-center text-white font-bold`}
							>
								PIE {i}
							</div>
						))}
					</div>
				</div>

				{/* Alerts */}
				<div className="space-y-4">
					<h3 className="text-h3">Alert Colors</h3>
					<div className="grid grid-cols-2 gap-4">
						<div className="h-24 rounded-custom bg-alert-1 flex items-center justify-center text-white font-bold">
							ALERT 1 (#FF9800)
						</div>
						<div className="h-24 rounded-custom bg-alert-2 flex items-center justify-center text-white font-bold">
							ALERT 2 (#EF5350)
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default DesignTemplate;
