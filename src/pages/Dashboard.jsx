import { useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { fontSizeAtom } from '../data/states/appAtoms.js';

import { DASHBOARD_SCALES } from '../utils/constants/ui.js';

const kpiCards = [
	{
		label: 'Total Patients',
		value: '12,845',
		suffix: 'Patients',
		delta: '12%',
		gradientVar: '--background-image-gradient-kpi-1'
	},
	{
		label: 'Average TAT',
		value: '22.5',
		suffix: 'Hours',
		delta: '5%',
		gradientVar: '--background-image-gradient-kpi-2'
	},
	{
		label: 'Total Tests Conducted',
		value: '18,542',
		suffix: 'Reports',
		delta: '8',
		gradientVar: '--background-image-gradient-kpi-3'
	},
	{
		label: 'Pending Reports',
		value: '124',
		suffix: 'Reports',
		delta: '3',
		gradientVar: '--background-image-gradient-kpi-4'
	}
];

const franchiseData = [
	{ name: 'Belgachia', value: 720 },
	{ name: 'Kankurgachi', value: 320 },
	{ name: 'Rajarhat', value: 650 },
	{ name: 'Alipore', value: 520 },
	{ name: 'Nowdapara', value: 800 },
	{ name: 'Durgapur', value: 300 },
	{ name: 'Dum Dum', value: 450 }
];

const alerts = [
	{
		time: '1 hour ago',
		title: 'TAT delay',
		color: '#ef5350',
		sub: '8 tests pending for >24h'
	},
	{
		time: '1 hour ago',
		title: 'Low inventory',
		color: '#ff9800',
		sub: 'Reagent stock below 20%'
	},
	{
		time: '1 hour ago',
		title: 'Low inventory',
		color: '#ff9800',
		sub: 'Reagent stock below 20%'
	},
	{
		time: '1 hour ago',
		title: 'Machine & Instrumentation',
		color: '#1eafc0',
		sub: '3 machines scheduled for maintenance'
	},
	{
		time: '1 hour ago',
		title: 'Machine & Instrumentation',
		color: '#1eafc0',
		sub: '3 machines scheduled for maintenance'
	}
];

const doctors = [
	{ name: 'Dr.Deep Banerjee', spec: 'Pathology', perf: '120 Patients' },
	{ name: 'Dr.Yan Mehra', spec: 'Hematology', perf: '98 Patients' },
	{ name: 'Dr.Aryan Kapoor', spec: 'Cardiology', perf: '76 Patients' },
	{ name: 'Dr.Kriti Reddy', spec: 'Neurology', perf: '34 Patients' },
	{ name: 'Dr. Rohan Verma', spec: 'Oncology', perf: '87 Patients' },
	{ name: 'Dr.Priya Sharma', spec: 'Pediatrics', perf: '45 Patients' },
	{ name: 'Dr.Arjun Singh', spec: 'Urology', perf: '23 Patients' },
	{ name: 'Dr.Diya Patel', spec: 'Nephrology', perf: '56 Patients' },
	{ name: 'Dr.Neil Gupta', spec: 'Endocrinology', perf: '89 Patients' },
	{ name: 'Dr.Anika Joshi', spec: 'Gastroenterology', perf: '67 Patients' }
];

const Card = ({ children, className = '' }) => (
	<section className={`rounded-card border border-divider bg-card shadow-[var(--dash-card-shadow)] ${className}`}>
		{children}
	</section>
);

const SectionTitle = ({ children, className = '' }) => (
	<h2 className={`font-semibold leading-7 text-text-1 ${className}`} style={{ fontSize: 'var(--dash-section-title)' }}>
		{children}
	</h2>
);

const StatCard = ({ card }) => (
	<article
		className="relative flex flex-col justify-between rounded-card px-[10px] py-[15px] text-white"
		style={{
			backgroundImage: `var(${card.gradientVar})`,
			minHeight: 'var(--dash-card-stat)'
		}}
	>
		<div className="flex items-start justify-between gap-3">
			<p className="font-semibold leading-4 text-white" style={{ fontSize: 'var(--dash-kpi-label)' }}>
				{card.label}
			</p>
			<span
				className="inline-flex h-[22px] min-w-[31px] items-center justify-center rounded-full bg-white px-2 font-bold leading-4 text-[#031421]"
				style={{ fontSize: 'var(--dash-caption)' }}
			>
				&uarr; {card.delta}
			</span>
		</div>

		<div className="mt-[16px] flex items-end gap-2">
			<strong className="font-bold leading-none tracking-[-0.04em]" style={{ fontSize: 'var(--dash-kpi-value)' }}>
				{card.value}
			</strong>
			<span className="mb-1 font-semibold leading-none" style={{ fontSize: 'var(--dash-caption)' }}>
				{card.suffix}
			</span>
		</div>
	</article>
);

const TogglePills = ({ active, options, onChange }) => (
	<div className="flex h-6 items-start gap-[10px]">
		{options.map(option => (
			<button
				key={option}
				type="button"
				onClick={() => onChange(option)}
				className={`h-6 rounded-full px-3 py-1 font-medium leading-4 transition ${
					active === option ? 'bg-primary text-white' : 'bg-field text-text-2'
				}`}
				style={{ fontSize: 'var(--dash-pill)' }}
			>
				{option}
			</button>
		))}
	</div>
);

const FranchisePerformance = () => {
	const [tab, setTab] = useState('Revenue');
	const yLabels = [800, 500, 300, 100, 50];
	const max = 800;

	return (
		<Card className="flex flex-col p-[10px]" style={{ minHeight: 'var(--dash-card-row1)' }}>
			<div className="flex items-center justify-between">
				<SectionTitle>Franchise Performance</SectionTitle>
				<TogglePills active={tab} options={['Revenue', 'Tests', 'TAT']} onChange={setTab} />
			</div>

			<div className="relative mt-[24px] flex-1 pl-[34px] pr-[2px] min-h-[250px]">
				<div
					className="absolute left-0 top-[21px] flex h-[153px] flex-col justify-between font-semibold text-text-2"
					style={{ fontSize: 'var(--dash-caption)' }}
				>
					{yLabels.map(label => (
						<span key={label}>{label}</span>
					))}
				</div>

				<div className="absolute bottom-[65px] left-[58px] right-[9px] top-[23px] flex items-end justify-between">
					{franchiseData.map(item => (
						<div key={item.name} className="flex w-[30px] justify-center h-full items-end">
							<div
								className="w-[30px] rounded-full"
								style={{
									height: `${(item.value / max) * 100}%`,
									backgroundImage: 'var(--dash-franchise-bar)'
								}}
							/>
						</div>
					))}
				</div>

				<div
					className="absolute bottom-[35px] left-[58px] right-[9px] flex justify-between font-semibold text-text-2"
					style={{ fontSize: 'var(--dash-caption)' }}
				>
					{franchiseData.map(item => (
						<div key={item.name} className="flex w-[30px] justify-center">
							<span className="origin-top-right -rotate-45 whitespace-nowrap block -translate-x-1 translate-y-1">
								{item.name}
							</span>
						</div>
					))}
				</div>
			</div>
		</Card>
	);
};

const TestDistribution = () => {
	const segments = [
		{ value: 42, color: '#d79a00', offset: 0 },
		{ value: 12, color: '#3ee7c4', offset: 42 },
		{ value: 36, color: '#1c39df', offset: 54 },
		{ value: 24, color: '#2684ff', offset: 90 }
	];
	const radius = 64;
	const circumference = 2 * Math.PI * radius;
	const total = 114;

	return (
		<Card className="flex flex-col p-[10px]" style={{ minHeight: 'var(--dash-card-row1)' }}>
			<SectionTitle>Test Distribution</SectionTitle>
			<div className="relative flex-1 min-h-[180px]">
				<svg viewBox="0 0 520 260" className="absolute inset-0 h-full w-full">
					<g transform="translate(260 136) rotate(-90)">
						<circle r={radius} fill="none" stroke="var(--dash-pie-ring-bg)" strokeWidth="36" />
						{segments.map(segment => (
							<circle
								key={segment.color}
								r={radius}
								fill="none"
								stroke={segment.color}
								strokeWidth="36"
								strokeDasharray={`${(segment.value / total) * circumference - 7} ${circumference}`}
								strokeDashoffset={-(segment.offset / total) * circumference}
							/>
						))}
					</g>

					<polyline points="191,80 165,48 125,48" fill="none" stroke="var(--text-2)" />
					<text x="125" y="40" fill="var(--text-3)" textAnchor="end" fontSize="12">
						Pathology
					</text>
					<text x="125" y="65" fill="var(--text-2)" textAnchor="end" fontSize="22" fontWeight="700">
						24%
					</text>

					<polyline points="326,80 350,48 410,48" fill="none" stroke="var(--text-2)" />
					<text x="410" y="40" fill="var(--text-3)" fontSize="12">
						Blood Tests
					</text>
					<text x="410" y="65" fill="var(--text-2)" fontSize="22" fontWeight="700">
						42%
					</text>

					<polyline points="190,190 164,222 120,222" fill="none" stroke="var(--text-2)" />
					<text x="120" y="214" fill="var(--text-3)" textAnchor="end" fontSize="12">
						Microbiology
					</text>
					<text x="120" y="239" fill="var(--text-2)" textAnchor="end" fontSize="22" fontWeight="700">
						36%
					</text>

					<polyline points="330,188 355,222 412,222" fill="none" stroke="var(--text-2)" />
					<text x="412" y="214" fill="var(--text-3)" fontSize="12">
						Radiology
					</text>
					<text x="412" y="239" fill="var(--text-2)" fontSize="22" fontWeight="700">
						12%
					</text>
				</svg>
			</div>
		</Card>
	);
};

const RevenueVsTests = () => {
	const [hoverData, setHoverData] = useState({
		label: 'Rajarhat',
		rev: 56.256,
		x: 278,
		y: 82
	});
	const svgRef = useRef(null);
	const chartData = [
		{ label: 'Belgachia', rev: 10, test: 20 },
		{ label: 'Kankurgachi', rev: 18, test: 15 },
		{ label: 'Rajarhat', rev: 14, test: 23 },
		{ label: 'Alipore', rev: 30, test: 24 },
		{ label: 'Nowdapara', rev: 31, test: 14 },
		{ label: 'Durgapur', rev: 21, test: 20 },
		{ label: '', rev: 22, test: 14 }
	];
	const w = 545;
	const h = 240;
	const padX = 34;
	const padY = 18;
	const innerW = 492;
	const innerH = 165;
	const maxVal = 50;

	const pointsFor = key =>
		chartData.map((point, index) => ({
			x: padX + (index / (chartData.length - 1)) * innerW,
			y: padY + innerH - (point[key] / maxVal) * innerH
		}));

	const getPath = (key, area = false) => {
		const points = pointsFor(key);
		let path = `M ${points[0].x} ${points[0].y}`;
		for (let i = 0; i < points.length - 1; i += 1) {
			const current = points[i];
			const next = points[i + 1];
			const cp = current.x + (next.x - current.x) / 2;
			path += ` C ${cp} ${current.y}, ${cp} ${next.y}, ${next.x} ${next.y}`;
		}
		if (!area) return path;
		return `${path} L ${padX + innerW} ${padY + innerH} L ${padX} ${padY + innerH} Z`;
	};

	const handleMove = event => {
		const svg = svgRef.current;
		if (!svg) return;
		const rect = svg.getBoundingClientRect();
		const mouseX = ((event.clientX - rect.left) / rect.width) * w;
		const index = Math.max(
			0,
			Math.min(chartData.length - 1, Math.round(((mouseX - padX) / innerW) * (chartData.length - 1)))
		);
		const point = chartData[index];
		const x = padX + (index / (chartData.length - 1)) * innerW;
		const y = padY + innerH - (point.rev / maxVal) * innerH;
		setHoverData({ ...point, x, y });
	};

	return (
		<Card className="flex flex-col p-[10px]" style={{ minHeight: 'var(--dash-card-revtest)' }}>
			<div className="mb-[10px] flex items-center justify-between">
				<SectionTitle>Revenue vs Tests</SectionTitle>
				<div className="flex items-center gap-4 font-medium text-text-2" style={{ fontSize: 'var(--dash-caption)' }}>
					<span className="flex items-center gap-1">
						<span className="h-[7px] w-[7px] rounded-full bg-primary" />
						Revenue
					</span>
					<span className="flex items-center gap-1">
						<span className="h-[7px] w-[7px] rounded-full bg-secondary" />
						Tests
					</span>
				</div>
			</div>

			<svg
				ref={svgRef}
				viewBox={`0 0 ${w} ${h}`}
				className="w-full flex-1 min-h-[150px] overflow-visible"
				onMouseMove={handleMove}
				onMouseLeave={() => setHoverData({ label: 'Rajarhat', rev: 56.256, x: 278, y: 82 })}
			>
				<defs>
					<linearGradient id="revenueArea" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stopColor="var(--dash-revenue-area-top)" />
						<stop offset="100%" stopColor="var(--dash-revenue-area-bottom)" />
					</linearGradient>
				</defs>

				{[50, 30, 20, 10].map(tick => {
					const y = padY + innerH - (tick / maxVal) * innerH;
					return (
						<g key={tick}>
							<line x1={padX} x2={padX + innerW} y1={y} y2={y} stroke="var(--dash-chart-grid)" />
							<text x={padX - 12} y={y + 4} textAnchor="end" fill="var(--text-2)" fontSize="12" fontWeight="500">
								{tick}k
							</text>
						</g>
					);
				})}

				{chartData.slice(0, -1).map((point, index) => {
					const x = padX + (index / (chartData.length - 1)) * innerW;
					const textY = padY + innerH + 16;
					return (
						<g key={point.label}>
							<line x1={x} x2={x} y1={padY} y2={padY + innerH} stroke="var(--dash-chart-grid)" />
							<text
								x={x}
								y={textY}
								textAnchor="end"
								fill="var(--text-2)"
								fontSize="12"
								fontWeight="600"
								transform={`rotate(-45, ${x}, ${textY})`}
							>
								{point.label}
							</text>
						</g>
					);
				})}

				<path d={getPath('rev', true)} fill="url(#revenueArea)" />
				<path d={getPath('test')} fill="none" stroke="var(--secondary-color)" strokeLinecap="round" strokeWidth="4" />
				<path d={getPath('rev')} fill="none" stroke="var(--primary-color)" strokeLinecap="round" strokeWidth="4" />

				{hoverData && (
					<g transform={`translate(${hoverData.x} ${hoverData.y})`}>
						<circle r="5" fill="var(--card-color)" stroke="var(--primary-color)" strokeWidth="3" />
						<g transform="translate(0 -20)">
							<rect x="-34" y="-39" width="68" height="40" rx="4" fill="var(--dash-tooltip-bg)" />
							<path d="M -5 0 L 0 7 L 5 0 Z" fill="var(--dash-tooltip-bg)" />
							<text x="0" y="-23" fill="var(--dash-tooltip-fg)" textAnchor="middle" fontSize="10" fontWeight="700">
								Revenue
							</text>
							<text x="0" y="-9" fill="var(--dash-tooltip-fg)" textAnchor="middle" fontSize="12" fontWeight="700">
								56,256
							</text>
						</g>
					</g>
				)}
			</svg>
		</Card>
	);
};

const SmallDonut = ({ percent, color, label }) => {
	const radius = 36;
	const circumference = 2 * Math.PI * radius;
	const dash = (percent / 100) * circumference;

	return (
		<div className="flex flex-col items-center gap-[10px]">
			<div
				className="relative"
				style={{
					height: 'var(--dash-donut-size)',
					width: 'var(--dash-donut-size)'
				}}
			>
				<svg viewBox="0 0 106 106" className="-rotate-90 h-full w-full">
					<circle cx="53" cy="53" r={radius} fill="none" stroke="var(--dash-donut-track)" strokeWidth="24" />
					{/* Dark inner circle / Progress arc */}
					<circle
						cx="53"
						cy="53"
						r={radius}
						fill="none"
						stroke={color}
						strokeDasharray={`${dash} ${circumference - dash}`}
						strokeWidth="24"
					/>
				</svg>
				<span
					className="absolute inset-0 flex items-center justify-center font-semibold text-text-1"
					style={{ fontSize: 'var(--dash-donut-percent)' }}
				>
					{percent}%
				</span>
			</div>
			<span className="font-semibold text-text-2" style={{ fontSize: 'var(--dash-caption)' }}>
				{label}
			</span>
		</div>
	);
};

const SampleStatus = () => (
	<Card className="flex flex-col px-[10px] pb-[26px] pt-[10px]" style={{ minHeight: 'var(--dash-card-sample)' }}>
		<SectionTitle>Sample Status</SectionTitle>
		<div className="mt-[25px] flex flex-1 flex-col items-center justify-between">
			<SmallDonut percent={81} color="#5169f2" label="Sample Collected" />
			<SmallDonut percent={62} color="#2684ff" label="Testing in Progress" />
			<SmallDonut percent={22} color="#3ee7c4" label="Result Ready" />
		</div>
	</Card>
);

const Alerts = () => {
	return (
		<Card className="flex flex-col p-[10px]" style={{ minHeight: 'var(--dash-card-sample)' }}>
			<div className="flex items-center justify-between">
				<SectionTitle>Alerts</SectionTitle>
				<span
					className="flex h-6 w-6 items-center justify-center rounded-full bg-alert-2 font-bold leading-4 text-white"
					style={{ fontSize: 'var(--dash-caption)' }}
				>
					4
				</span>
			</div>
			<div className="mt-[30px] flex flex-1 flex-col pb-[16px]">
				{alerts.map((alert, index) => (
					<article
						key={`${alert.title}-${index}`}
						className={`border-divider flex flex-1 flex-col justify-center ${
							index === alerts.length - 1 ? '' : 'border-b'
						}`}
					>
						<p className="font-normal leading-4 text-text-3" style={{ fontSize: 'var(--dash-caption)' }}>
							{alert.time}
						</p>
						<p
							className="mt-2 font-semibold leading-5"
							style={{
								color: alert.color,
								fontSize: 'var(--dash-body)'
							}}
						>
							{alert.title}
						</p>
						<p className="font-semibold leading-none text-text-2" style={{ fontSize: 'var(--dash-caption)' }}>
							{alert.sub}
						</p>
					</article>
				))}
			</div>
		</Card>
	);
};

const Members = () => {
	const [tab, setTab] = useState('Active Doctors');

	return (
		<Card className="flex flex-col p-[10px] h-[487px]" style={{ minHeight: 'var(--dash-card-members)' }}>
			<div className="flex items-center justify-between">
				<SectionTitle>Members</SectionTitle>
				<TogglePills active={tab} options={['Active Doctors', 'Active Employees']} onChange={setTab} />
			</div>
			<div className="mt-[14px] flex-1 overflow-hidden rounded-[6px] border border-divider">
				<table
					className="h-full w-full table-fixed border-collapse text-left font-medium"
					style={{ fontSize: 'var(--dash-caption)' }}
				>
					<thead>
						<tr className="bg-brand-gradient text-white" style={{ height: 'var(--dash-member-head)' }}>
							<th className="px-[20px] font-medium">Doctor Name</th>
							<th className="px-[20px] font-medium">Specialization</th>
							<th className="px-[20px] font-medium">Performance</th>
						</tr>
					</thead>
					<tbody>
						{doctors.map((doctor, row) => (
							<tr
								key={`${doctor.name}-${doctor.spec}`}
								className={`border-b border-divider last:border-b-0 ${row % 2 === 1 ? 'bg-[var(--dash-member-row-alt)]' : 'bg-[var(--dash-member-row)]'}`}
							>
								<td className="px-[20px] text-text-2">{doctor.name}</td>
								<td className="px-[20px] text-text-2">{doctor.spec}</td>
								<td className="px-[20px] text-text-2">{doctor.perf}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Card>
	);
};

const RevenueOverview = () => {
	const items = [
		{
			label: 'Outstanding',
			value: '61%',
			share: 50,
			barClassName: 'rounded-l-[9px]',
			gradient: 'linear-gradient(135deg, #3ee7c4 0%, #26dbc1 38%, #10bc99 100%)'
		},
		{
			label: 'Expenses',
			value: '17%',
			share: 26,
			barClassName: '',
			gradient: 'linear-gradient(135deg, #ffc933 0%, #f2be3a 36%, #d79a00 100%)'
		},
		{
			label: 'Net Profit',
			value: '22%',
			share: 24,
			barClassName: 'rounded-r-[9px]',
			gradient: 'linear-gradient(135deg, #4b97ff 0%, #2684ff 40%, #1b69d0 100%)'
		}
	];

	return (
		<Card
			className="flex flex-col border-transparent px-[24px] pb-[16px] pt-[14px]"
			style={{ minHeight: 'var(--dash-card-revover)' }}
		>
			<SectionTitle>Revenue Overview</SectionTitle>
			<div className="mt-[18px] flex flex-1 gap-[12px]">
				{items.map(item => (
					<div
						key={item.label}
						className="relative flex min-h-[130px] flex-col justify-between pl-[14px]"
						style={{ flexGrow: item.share, flexBasis: 0 }}
					>
						<span
							className="absolute left-0 top-[6px] h-[5px] w-[5px] rounded-full"
							style={{ backgroundColor: 'var(--dash-rev-marker)' }}
						/>
						<span
							className="absolute left-[2px] top-[11px] bottom-0 w-px"
							style={{ backgroundColor: 'var(--dash-rev-marker)' }}
						/>

						<div className="pt-[1px]">
							<p
								className="font-medium leading-none"
								style={{
									fontSize: 'var(--dash-revover-label)',
									color: 'var(--dash-rev-label)'
								}}
							>
								{item.label}
							</p>
							<p
								className="mt-[6px] font-medium leading-none tracking-[-0.04em]"
								style={{
									fontSize: 'var(--dash-revover-value)',
									color: 'var(--dash-rev-value)'
								}}
							>
								{item.value}
							</p>
						</div>

						<div
							className={item.barClassName}
							style={{
								height: 'var(--dash-rev-bar)',
								backgroundImage: item.gradient
							}}
						/>
					</div>
				))}
			</div>
		</Card>
	);
};

const Dashboard = () => {
	const fontSize = useAtomValue(fontSizeAtom) ?? 'medium';
	const scale = DASHBOARD_SCALES[fontSize] ?? DASHBOARD_SCALES.medium;

	return (
		<div className="w-full " style={scale} data-dashboard-scale={fontSize}>
			<h1 className="mb-[10px] font-bold leading-7 text-text-1" style={{ fontSize: 'var(--dash-page-title)' }}>
				Dashboard
			</h1>

			<div className="grid grid-cols-4 gap-[20px]">
				{kpiCards.map(card => (
					<StatCard key={card.label} card={card} />
				))}
			</div>

			<div className="mt-[16px] grid grid-cols-1 lg:grid-cols-2 gap-[20px] auto-rows-min">
				<FranchisePerformance />
				<TestDistribution />

				<div className="flex flex-col h-full gap-[20px]">
					<RevenueVsTests />
					<Members />
					<Members />
				</div>

				<div className="flex flex-col h-full gap-[20px]">
					<div className="grid grid-cols-[1fr_1fr] gap-[20px] flex-1">
						<SampleStatus />
						<Alerts />
					</div>
					<RevenueOverview />
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
