import React, { useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { fontSizeAtom } from '../../data/states/appAtoms.js';
import { DASHBOARD_SCALES } from '../../utils/constants/ui.js';
import { useAutoRevalidate } from '../../hooks/useAutoRevalidate';
import { API } from '../../data/apis/endpoints';
import ROUTES from '../../utils/constants/routes';
import { downloadExcel } from '../../utils/methods/downloadExcel';
import Button from '../../components/common/Button';
import PieChart from '../../components/common/PieChart';
import CommonTable from '../../components/common/CommonTable.jsx';
import { usePermissions } from '../../hooks/usePermissions';
import Unauthorized from '../Unauthorized';
import { PERM } from '../../utils/constants/permissionKey2';

// Custom icons inline for robust loading
const ShieldAlertIcon = ({ className = "h-5 w-5" }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
	</svg>
);

const LinkIcon = ({ className = "h-4 w-4" }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
	</svg>
);

const ExcelIcon = ({ className = "h-4 w-4" }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
	</svg>
);

const ChevronLeftIcon = ({ className = "h-4 w-4" }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
	</svg>
);

const ChevronRightIcon = ({ className = "h-4 w-4" }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
	</svg>
);

const Card = ({ children, className = '', style = {} }) => (
	<section style={style} className={`rounded-card border border-divider bg-card shadow-[var(--dash-card-shadow)] transition-all duration-300 hover:shadow-md ${className}`}>
		{children}
	</section>
);

const SectionTitle = ({ children, className = '' }) => (
	<h2 className={`font-semibold leading-7 text-text-1 ${className}`} style={{ fontSize: 'var(--dash-section-title)' }}>
		{children}
	</h2>
);

const StatCard = ({ label, value, suffix, gradientVar, isAlert = false, onExport = null }) => (
	<article
		className="relative flex flex-col justify-between rounded-card px-[16px] py-[20px] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default overflow-hidden group"
		style={{
			backgroundImage: `var(${gradientVar})`,
			minHeight: 'var(--dash-card-stat)',
			boxShadow: 'var(--dash-card-shadow)'
		}}
	>
		<div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
		<div className="flex items-start justify-between gap-3 relative z-10">
			<p className="font-semibold leading-4 text-white/90" style={{ fontSize: 'var(--dash-kpi-label)' }}>
				{label}
			</p>
			{/* <div className="flex items-center gap-1.5 shrink-0">
				{onExport && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onExport();
						}}
						title="Export to Excel"
						className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 duration-200"
					>
						<ExcelIcon className="h-3.5 w-3.5" />
					</button>
				)}
			</div> */}
		</div>

		<div className="mt-[12px] flex items-end gap-2 relative z-10">
			<strong className="font-bold leading-none tracking-[-0.04em]" style={{ fontSize: 'var(--dash-kpi-value)' }}>
				{value}
			</strong>
			<span className="mb-1 font-semibold leading-none text-white/80" style={{ fontSize: 'var(--dash-caption)' }}>
				{suffix}
			</span>
		</div>
	</article>
);

const MONTH_NAMES = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to determine severity-based colors and emojis
const getDaySeverity = (dayAlerts) => {
	if (!dayAlerts || dayAlerts.length === 0) return null;
	const minDays = Math.min(...dayAlerts.map(a => a.days_until_expiry));

	if (minDays <= 30) {
		return {
			text: '🔴',
			colorClass: 'bg-red-500/10 text-red-600 border border-red-500/20 dark:bg-red-500/15 dark:text-red-400',
			dotClass: 'bg-red-600 dark:bg-red-400'
		};
	} else if (minDays <= 60) {
		return {
			text: '🟠',
			colorClass: 'bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:bg-orange-500/15 dark:text-orange-400',
			dotClass: 'bg-orange-500 dark:bg-orange-400'
		};
	} else if (minDays <= 90) {
		return {
			text: '🟡',
			colorClass: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:bg-yellow-500/15 dark:text-yellow-400',
			dotClass: 'bg-yellow-500 dark:bg-yellow-400'
		};
	} else {
		return {
			text: '🟢',
			colorClass: 'bg-green-500/10 text-green-600 border border-green-500/20 dark:bg-green-500/15 dark:text-green-400',
			dotClass: 'bg-green-500 dark:bg-green-400'
		};
	}
};

const DoctorDashboard = () => {
	const navigate = useNavigate();
	const { can, canAll } = usePermissions();
	const fontSize = useAtomValue(fontSizeAtom) ?? 'medium';
	const scale = DASHBOARD_SCALES[fontSize] ?? DASHBOARD_SCALES.medium;

	const canView = can(PERM.DOCTOR_DASHBOARD.VIEW);
	const canExcel = canAll(PERM.DOCTOR_DASHBOARD.VIEW, PERM.DOCTOR_DASHBOARD.EXCEL);

	const expiryColumns = useMemo(() => [
		{
			key: 'id',
			label: '#',
			widthClassName: 'w-[45px]',
			render: (_, index) => <span className="text-text-3">{index + 1}</span>
		},
		{
			key: 'doc_Name',
			label: 'Doctor',
			widthClassName: 'min-w-[180px]',
			render: (item) => (
				<div className="leading-tight">
					<div className="font-semibold text-text-2">{item.doc_Name}</div>
					<div className="text-[9.5px] text-text-3 font-normal">{item.department_Name || '—'}</div>
				</div>
			)
		},
		{
			key: 'doc_Code',
			label: 'Code',
			widthClassName: 'w-[100px]',
			render: (item) => <span className="text-text-3 font-semibold">{item.doc_Code}</span>
		},
		{
			key: 'doc_Registration_Expiry_Date',
			label: 'Expiry',
			widthClassName: 'w-[100px]',
			render: (item) => <span className="text-text-2">{item.doc_Registration_Expiry_Date ? item.doc_Registration_Expiry_Date.split('T')[0] : '—'}</span>
		},
		{
			key: 'status',
			label: 'Status',
			widthClassName: 'w-[80px]',
			render: (item) => {
				const isExpired = item.days_until_expiry < 0;
				return isExpired ? (
					<span className="inline-flex rounded-full bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400">
						Expired
					</span>
				) : (
					<span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold border ${item.days_until_expiry <= 30
							? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
							: item.days_until_expiry <= 60
								? 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400'
								: item.days_until_expiry <= 90
									? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
									: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
						}`}>
						{item.days_until_expiry}d
					</span>
				);
			}
		}
	], []);

	const earningsColumns = useMemo(() => [
		{
			key: 'doc_Name',
			label: 'Doctor Profile',
			widthClassName: 'min-w-[180px]',
			render: (item) => (
				<div className="leading-tight">
					<div className="font-semibold text-text-2">{item.doc_Name}</div>
					<div className="text-[9.5px] text-text-3 font-normal">{item.department_Name || '—'} ({item.doc_Code})</div>
				</div>
			)
		},
		{
			key: 'consultations',
			label: 'Consultations',
			widthClassName: 'w-[100px]',
			render: (item) => <span className="text-text-2 font-semibold">{item.consultations}</span>
		},
		{
			key: 'revenue',
			label: 'Total Revenue',
			widthClassName: 'w-[110px]',
			render: (item) => <span className="text-text-2">₹{item.revenue?.toFixed(2)}</span>
		},
		{
			key: 'commission',
			label: 'Commission',
			widthClassName: 'w-[100px]',
			render: (item) => <span className="text-text-3">₹{item.commission?.toFixed(2)}</span>
		},
		{
			key: 'net_income',
			label: 'Net Income',
			widthClassName: 'w-[110px]',
			render: (item) => <span className="text-brand-light font-bold">₹{item.net_income?.toFixed(2)}</span>
		}
	], []);

	// Registration Expiry Alerts State
	const [expiryTab, setExpiryTab] = useState('calendar'); // 'calendar', '7days', '1month', '1yr', 'custom'
	const [customStartDate, setCustomStartDate] = useState('');
	const [customEndDate, setCustomEndDate] = useState('');
	const [appliedStartDate, setAppliedStartDate] = useState('');
	const [appliedEndDate, setAppliedEndDate] = useState('');
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
	const [selectedDay, setSelectedDay] = useState(null); // null means all days in month

	// Visible calendar dates range for SWR fetching
	const calendarDates = useMemo(() => {
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
		return {
			startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
			endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
		};
	}, [currentYear, currentMonth]);

	// Fetch Stats API using SWR-like hook
	const { data: statsData, loading: statsLoading } = useAutoRevalidate(API.DOCTORS.DASHBOARD_STATS, {});

	// Conditional URL to avoid premature fetching when either date is not applied
	const expiryUrl = (expiryTab === 'custom' && (!appliedStartDate || !appliedEndDate))
		? null
		: API.DOCTORS.DASHBOARD_EXPIRY_ALERTS;

	// Fetch Expiry Alerts API using SWR-like hook
	const { data: expiryData, loading: expiryLoading, mutate: mutateExpiry } = useAutoRevalidate(
		expiryUrl,
		{
			expiryRange: expiryTab === 'calendar' ? 'custom' : expiryTab,
			startDate: expiryTab === 'calendar' ? calendarDates.startDate : (expiryTab === 'custom' ? appliedStartDate : undefined),
			endDate: expiryTab === 'calendar' ? calendarDates.endDate : (expiryTab === 'custom' ? appliedEndDate : undefined)
		}
	);

	// Local state for actual Doctor Income Report
	const [incomeReportList, setIncomeReportList] = useState([]);

	React.useEffect(() => {
		if (statsData?.incomeAccess) {
			setIncomeReportList(statsData.incomeAccess);
		}
	}, [statsData?.incomeAccess]);

	// Export Dashboard Excel (Aggregated Dashboard Data)
	const handleExportDashboard = async () => {
		await downloadExcel({
			url: API.DOCTORS.DASHBOARD_EXPORT,
			fileName: 'doctor_management_dashboard_summary.xlsx',
			payload: {
				exportType: 'aggregate',
				incomeAccessList: incomeReportList,
				expiryRange: expiryTab === 'calendar' ? 'custom' : expiryTab,
				startDate: expiryTab === 'calendar' ? calendarDates.startDate : (expiryTab === 'custom' ? customStartDate : undefined),
				endDate: expiryTab === 'calendar' ? calendarDates.endDate : (expiryTab === 'custom' ? customEndDate : undefined)
			}
		});
	};

	// Export Active Doctors Excel
	const handleExportActiveDoctors = async () => {
		await downloadExcel({
			url: API.DOCTORS.DASHBOARD_EXPORT,
			fileName: 'active_doctors_list.xlsx',
			payload: { exportType: 'active' }
		});
	};

	// Export Alerts Excel
	const handleExportAlerts = async () => {
		await downloadExcel({
			url: API.DOCTORS.DASHBOARD_EXPORT,
			fileName: `expiry_alerts_${expiryTab}.xlsx`,
			payload: {
				exportType: 'expiry_alerts',
				expiryRange: expiryTab === 'calendar' ? 'custom' : expiryTab,
				startDate: expiryTab === 'calendar' ? calendarDates.startDate : (expiryTab === 'custom' ? customStartDate : undefined),
				endDate: expiryTab === 'calendar' ? calendarDates.endDate : (expiryTab === 'custom' ? customEndDate : undefined)
			}
		});
	};

	// Export Onboarded This Month Excel
	const handleExportOnboardedMonth = async () => {
		await downloadExcel({
			url: API.DOCTORS.DASHBOARD_EXPORT,
			fileName: 'doctors_onboarded_this_month.xlsx',
			payload: { exportType: 'onboarded_month' }
		});
	};

	// Export Pending Onboardings Excel
	const handleExportPendingOnboarding = async () => {
		await downloadExcel({
			url: API.DOCTORS.DASHBOARD_EXPORT,
			fileName: 'pending_onboarding_applications.xlsx',
			payload: { exportType: 'pending_onboarding' }
		});
	};

	// Export Specializations Breakdown Excel
	const handleExportSpecializations = async () => {
		await downloadExcel({
			url: API.DOCTORS.DASHBOARD_EXPORT,
			fileName: 'doctors_by_specialization.xlsx',
			payload: { exportType: 'specializations' }
		});
	};

	// Export Income Report Excel
	const handleExportIncomeAccess = async () => {
		await downloadExcel({
			url: API.DOCTORS.DASHBOARD_EXPORT,
			fileName: 'doctor_income_report.xlsx',
			payload: {
				exportType: 'income_report'
			}
		});
	};

	// Submodule Quick Links Config
	const submoduleLinks = [
		{ name: 'Doctors Directory', path: ROUTES.DOCTORS, desc: 'View, add, edit, or deactivate doctor profiles.', iconColor: 'text-brand' },
		{ name: 'Onboarding Applications', path: ROUTES.DOCTOR_ONBOARDING_LIST, desc: 'Review, approve, or reject onboarding wizards.', iconColor: 'text-brand-light' },
		{ name: 'Consultation Fees', path: ROUTES.DOCTOR_CONSULTATION_CHARGES, desc: 'Setup, modify, and audit doctor consultation fee list.', iconColor: 'text-success' },
		{ name: 'Commission Setup', path: ROUTES.DOCTOR_COMMISSIONS, desc: 'Configure commission shares and fixed payouts.', iconColor: 'text-warning' },
		{ name: 'Audit History', path: ROUTES.DOCTOR_AUDIT_TRAIL, desc: 'Track all edits and updates to doctor credentials.', iconColor: 'text-brand' },
		{ name: 'Expiry Reports', path: ROUTES.REGISTRATION_EXPIRY_REPORT, desc: 'Analyze doctor registration and license expiries.', iconColor: 'text-destructive' },
		{ name: 'Commission Reports', path: ROUTES.COMMISSION_REPORT, desc: 'View total doctor commissions by period.', iconColor: 'text-success' },
		{ name: 'Income Reports', path: ROUTES.INCOME_REPORT, desc: 'Overview of payments, earnings, and payout metrics.', iconColor: 'text-brand-light' }
	];

	// Expiry Alert matching helpers for Calendar cells
	const getExpiriesForDay = (day) => {
		if (!expiryData?.expiryAlerts) return [];
		return expiryData.expiryAlerts.filter(d => {
			if (!d.doc_Registration_Expiry_Date) return false;
			const dateStr = d.doc_Registration_Expiry_Date.split('T')[0];
			const [y, m, dNum] = dateStr.split('-').map(Number);
			return y === currentYear && (m - 1) === currentMonth && dNum === day;
		});
	};

	const filteredAlerts = useMemo(() => {
		if (!expiryData?.expiryAlerts) return [];
		if (selectedDay === null) return expiryData.expiryAlerts;
		return getExpiriesForDay(selectedDay);
	}, [expiryData?.expiryAlerts, selectedDay, currentYear, currentMonth]);

	// Calendar Cells structure
	const calendarCells = useMemo(() => {
		const cells = [];
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
		const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

		// padding
		for (let i = 0; i < firstDayIndex; i++) {
			cells.push(null);
		}
		// days
		for (let i = 1; i <= daysInMonth; i++) {
			cells.push(i);
		}
		return cells;
	}, [currentYear, currentMonth]);

	// Calculate active range to highlight on the calendar
	const activeRange = useMemo(() => {
		const today = new Date();
		const getStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		const start = getStr(today);

		if (expiryTab === '7days') {
			const endD = new Date(today);
			endD.setDate(today.getDate() + 7);
			return { start, end: getStr(endD) };
		}
		if (expiryTab === '1month') {
			const endD = new Date(today);
			endD.setDate(today.getDate() + 30);
			return { start, end: getStr(endD) };
		}
		if (expiryTab === '1yr') {
			const endD = new Date(today);
			endD.setDate(today.getDate() + 365);
			return { start, end: getStr(endD) };
		}
		if (expiryTab === 'custom') {
			return { start: customStartDate || '1970-01-01', end: customEndDate || '9999-12-31' };
		}
		// For 'calendar', the range is the visible month
		return { start: calendarDates.startDate, end: calendarDates.endDate };
	}, [expiryTab, customStartDate, customEndDate, calendarDates]);

	// Dynamic Pie/Donut Chart Segments calculation
	const pieSegments = useMemo(() => {
		if (!statsData?.specializationBreakdown) return [];
		const total = statsData.specializationBreakdown.reduce((acc, s) => acc + s.value, 0);
		if (total === 0) return [];

		const chartColors = [
			'var(--color-kpi-1-start)',
			'var(--color-kpi-2-start)',
			'var(--color-kpi-3-start)',
			'var(--color-kpi-4-start)',
			'var(--secondary-color)',
			'var(--primary-color)'
		];

		let runningSum = 0;
		return statsData.specializationBreakdown.map((spec, index) => {
			const offset = runningSum;
			runningSum += spec.value;
			return {
				name: spec.name,
				value: spec.value,
				percentage: (spec.value / total) * 100,
				offset,
				color: chartColors[index % chartColors.length]
			};
		});
	}, [statsData?.specializationBreakdown]);

	const totalSpecializationDocs = useMemo(() => {
		return pieSegments.reduce((acc, s) => acc + s.value, 0);
	}, [pieSegments]);

	const hasAppliedCustomExpiryRange = Boolean(appliedStartDate && appliedEndDate);

	const expiryAlertsHeading = useMemo(() => {
		if (selectedDay) {
			return `Registration expiry alerts for ${MONTH_NAMES[currentMonth]} ${selectedDay}, ${currentYear}`;
		}

		if (expiryTab === 'custom' && appliedStartDate && appliedEndDate) {
			return `Registration expiry alerts from ${appliedStartDate} to ${appliedEndDate}`;
		}

		if (expiryTab === '7days') {
			return 'Registration expiry alerts for the next 7 days';
		}

		if (expiryTab === '1month') {
			return 'Registration expiry alerts for the next 30 days';
		}

		if (expiryTab === '1yr') {
			return 'Registration expiry alerts for the next 12 months';
		}

		return `Registration expiry alerts for ${MONTH_NAMES[currentMonth]} ${currentYear}`;
	}, [selectedDay, expiryTab, appliedStartDate, appliedEndDate, currentMonth, currentYear]);

	const handlePrevMonth = () => {
		setSelectedDay(null);
		if (currentMonth === 0) {
			setCurrentMonth(11);
			setCurrentYear(y => y - 1);
		} else {
			setCurrentMonth(m => m - 1);
		}
	};

	const handleNextMonth = () => {
		setSelectedDay(null);
		if (currentMonth === 11) {
			setCurrentMonth(0);
			setCurrentYear(y => y + 1);
		} else {
			setCurrentMonth(m => m + 1);
		}
	};

	if (!canView) return <Unauthorized />;

	return (
		<div className="w-full flex flex-col gap-[20px]" style={scale} data-dashboard-scale={fontSize}>
			{/* Top Page Header */}
			<header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="font-bold leading-7 text-text-1" style={{ fontSize: 'var(--dash-page-title)' }}>
						Doctor Management Dashboard
					</h1>
					<p className="text-text-3 font-medium mt-1" style={{ fontSize: 'var(--dash-caption)' }}>
						Active doctors, onboarding statuses, and registration expiry alerts.
					</p>
				</div>
				{canExcel && (
					<Button
						variant="unstyled"
						onClick={handleExportDashboard}
						className="inline-flex h-[29px] items-center rounded-[6px] border border-[#1eafc0] bg-transparent px-[13px] py-[6px] font-semibold leading-none text-text-1 transition hover:brightness-95"
						style={{ fontSize: 'var(--entity-add-text)' }}
					>
						Download Excel
					</Button>
				)}
			</header>

			{/* 4 summary KPI cards */}
			<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
				<StatCard
					label="Total Active Doctors"
					value={statsLoading ? "..." : (statsData?.summary?.activeDoctors ?? 0)}
					suffix="Doctors"
					gradientVar="--background-image-gradient-kpi-1"
					onExport={canExcel ? handleExportActiveDoctors : null}
				/>
				<StatCard
					label="Doctors Onboarded This Month"
					value={statsLoading ? "..." : (statsData?.summary?.onboardedThisMonth ?? 0)}
					suffix="Approved"
					gradientVar="--background-image-gradient-kpi-2"
					onExport={canExcel ? handleExportOnboardedMonth : null}
				/>
				<StatCard
					label="Pending Onboarding Applications"
					value={statsLoading ? "..." : (statsData?.summary?.pendingOnboarding ?? 0)}
					suffix="Submitted"
					gradientVar="--background-image-gradient-kpi-3"
					onExport={canExcel ? handleExportPendingOnboarding : null}
				/>
				<StatCard
					label="Registration Expiry Alerts"
					value={statsLoading ? "..." : (statsData?.summary?.totalAlerts ?? 0)}
					suffix="Expiring"
					gradientVar="--background-image-gradient-kpi-4"
					isAlert={true}
					onExport={handleExportAlerts}
				/>
			</section>

			{/* Row 1: Unified Registration Expiry Calendar & Alerts (Full Width) */}
			<section className="grid grid-cols-1 gap-[20px]">
				<Card className="flex flex-col p-[20px]">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-divider pb-[16px] mb-[16px]">
						<div className="flex items-center gap-2">
							<SectionTitle>Registration Expiry Alerts</SectionTitle>
							<span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive/10 px-1.5 text-[11px] font-bold text-destructive animate-pulse">
								{expiryLoading ? '...' : (expiryData?.expiryAlerts?.length ?? 0)}
							</span>
						</div>

						{/* Filters tabs */}
						<div className="flex flex-wrap items-center gap-[6px]">
							{['calendar', '7days', '1month', '1yr', 'custom'].map((tab) => (
								<button
									key={tab}
									type="button"
									onClick={() => {
										setExpiryTab(tab);
										setSelectedDay(null);
										if (tab === 'calendar') {
											setCurrentYear(new Date().getFullYear());
											setCurrentMonth(new Date().getMonth());
										}
										if (tab !== 'custom') {
											setAppliedStartDate('');
											setAppliedEndDate('');
											setCustomStartDate('');
											setCustomEndDate('');
										}
									}}
									className={`h-6 rounded-full px-3 py-1 font-semibold leading-none transition ${expiryTab === tab
											? 'bg-brand text-white shadow-sm'
											: 'bg-field text-text-2 hover:bg-divider'
										}`}
									style={{ fontSize: 'var(--dash-pill)' }}
								>
									{tab === 'calendar' ? 'Calendar View' : tab === '7days' ? 'Next 7 Days' : tab === '1month' ? 'Next 30 Days' : tab === '1yr' ? 'Next Year' : 'Custom'}
								</button>
							))}
						</div>
					</div>

					{/* Custom Range Date Pickers */}
					{expiryTab === 'custom' && (
						<div className="flex flex-wrap items-center gap-4 bg-field/30 p-[12px] rounded-card border border-divider mb-[16px]">
							<div className="flex items-center gap-2">
								<span className="text-text-2 font-medium" style={{ fontSize: 'var(--dash-caption)' }}>Start Expiry Date:</span>
								<input
									type="date"
									value={customStartDate}
									onChange={(e) => {
										setCustomStartDate(e.target.value);
										setSelectedDay(null);
										if (e.target.value) {
											const d = new Date(e.target.value);
											setCurrentYear(d.getFullYear());
											setCurrentMonth(d.getMonth());
										}
									}}
									className="rounded-[6px] border border-divider bg-card px-2 py-1 text-text-1 focus:outline-none focus:border-brand-light"
									style={{ fontSize: 'var(--dash-caption)' }}
								/>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-text-2 font-medium" style={{ fontSize: 'var(--dash-caption)' }}>End Expiry Date:</span>
								<input
									type="date"
									value={customEndDate}
									onChange={(e) => {
										setCustomEndDate(e.target.value);
										setSelectedDay(null);
									}}
									className="rounded-[6px] border border-divider bg-card px-2 py-1 text-text-1 focus:outline-none focus:border-brand-light"
									style={{ fontSize: 'var(--dash-caption)' }}
								/>
							</div>
							<button
								onClick={() => {
									setAppliedStartDate(customStartDate);
									setAppliedEndDate(customEndDate);
								}}
								className="px-4 py-1 bg-brand-light rounded-[6px] text-white font-bold hover:brightness-95 transition-all text-xs"
							>
								Apply Range
							</button>
							{hasAppliedCustomExpiryRange && (
								<button
									type="button"
									onClick={() => {
										setExpiryTab('calendar');
										setCustomStartDate('');
										setCustomEndDate('');
										setAppliedStartDate('');
										setAppliedEndDate('');
										setSelectedDay(null);
										setCurrentYear(new Date().getFullYear());
										setCurrentMonth(new Date().getMonth());
									}}
									className="px-4 py-1 rounded-[6px] border border-divider bg-card text-text-2 font-bold hover:bg-field transition-all text-xs"
								>
									Clear
								</button>
							)}
						</div>
					)}

					{/* Side-by-Side Calendar and Alerts List */}
					<div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-1">
						{/* Calendar Column (4 cols) */}
						<div className="md:col-span-4 bg-field/20 p-4 rounded-card border border-divider flex flex-col justify-between gap-3 min-h-[300px]">
							{/* Calendar Header */}
							<div className="flex items-center justify-between">
								<span className="font-bold text-text-1 text-xs sm:text-sm">
									{MONTH_NAMES[currentMonth]} {currentYear}
								</span>
								<div className="flex items-center gap-1">
									<button
										type="button"
										onClick={handlePrevMonth}
										className="p-1 rounded-full hover:bg-field text-text-2 transition"
									>
										<ChevronLeftIcon className="h-4 w-4" />
									</button>
									<button
										type="button"
										onClick={handleNextMonth}
										className="p-1 rounded-full hover:bg-field text-text-2 transition"
									>
										<ChevronRightIcon className="h-4 w-4" />
									</button>
								</div>
							</div>

							{/* Day Labels */}
							<div className="grid grid-cols-7 text-center font-bold text-text-3 text-[10px] border-b border-divider pb-2">
								{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(w => (
									<div key={w}>{w}</div>
								))}
							</div>

							{/* Days Grid */}
							<div className="grid grid-cols-7 gap-1.5 flex-1 align-content-start">
								{calendarCells.map((day, idx) => {
									if (day === null) {
										return <div key={`empty-${idx}`} />;
									}

									const cellDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
									const dayAlerts = getExpiriesForDay(day);
									const hasAlerts = dayAlerts.length > 0;
									const isSelected = selectedDay === day;

									const severity = getDaySeverity(dayAlerts);
									const isDayInRange = activeRange ? (cellDateStr >= activeRange.start && cellDateStr <= activeRange.end) : false;

									let dayClass = '';
									if (isSelected) {
										dayClass = 'bg-brand text-white shadow-sm hover:brightness-110';
									} else if (hasAlerts) {
										const borderStyle = isDayInRange ? 'border-2 border-brand/50' : 'border border-divider';
										dayClass = `${severity.colorClass} ${borderStyle} hover:brightness-95`;
									} else if (isDayInRange) {
										dayClass = 'bg-brand/5 text-text-1 border border-dashed border-brand/20 dark:bg-brand/10 dark:border-brand/30 hover:bg-brand/10';
									} else {
										dayClass = 'text-text-3 opacity-40 hover:bg-field/30';
									}

									return (
										<button
											key={`day-${day}`}
											type="button"
											onClick={() => setSelectedDay(isSelected ? null : day)}
											className={`w-full min-h-[42px] sm:min-h-[46px] rounded-[8px] flex flex-col items-center justify-center py-1 px-0.5 transition-all relative font-semibold ${dayClass}`}
										>
											<span className="text-[12px]">{day}</span>
											{hasAlerts && (
												<span className="text-[9px] font-bold leading-none mt-0.5 flex items-center justify-center gap-0.5">
													{dayAlerts.length > 3 ? (
														<span className={isSelected ? 'text-white/80' : 'text-text-2 font-bold'}>+{dayAlerts.length}</span>
													) : (
														<>
															<span>{severity.text}</span>
															<span className={isSelected ? 'text-white' : 'text-text-1'}>{dayAlerts.length}</span>
														</>
													)}
												</span>
											)}
										</button>
									);
								})}
							</div>
						</div>

						{/* Expiry Alerts Details List (8 cols) */}
						<div className="md:col-span-8 flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<span className="font-semibold text-text-2 text-xs">
									{expiryAlertsHeading}
								</span>
								<div className="flex items-center gap-2">
									{selectedDay && (
										<button
											onClick={() => setSelectedDay(null)}
											className="text-[11px] text-brand hover:underline font-semibold"
										>
											Clear Day Filter
										</button>
									)}
									{canExcel && !expiryLoading && filteredAlerts.length > 0 && (
										<Button
											variant="unstyled"
											onClick={handleExportAlerts}
											className="inline-flex h-[29px] items-center rounded-[6px] border border-[#1eafc0] bg-transparent px-[13px] py-[6px] font-semibold leading-none text-text-1 transition hover:brightness-95"
											style={{ fontSize: 'var(--entity-add-text)' }}
										>
											Download Excel
										</Button>
									)}
								</div>
							</div>

							{/* Alert List Scrollable Container */}
							<div className="flex-1 flex flex-col">
								<CommonTable
									containerClassName="h-full"
									columns={expiryColumns}
									data={filteredAlerts}
									loading={expiryLoading}
								/>
							</div>
						</div>
					</div>
				</Card>
			</section>

			{/* Row 2: Specialization Breakdown & Income Access side-by-side */}
			<section className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] items-stretch">
				{/* Doctors by Specialization (MUI Donut Chart - 5 cols) */}
				<Card className="lg:col-span-5 flex flex-col p-[16px]">
					<div className="flex items-center justify-between mb-[14px]">
						<SectionTitle>Doctors by Specialization</SectionTitle>
						{/* {canExcel && (
							<Button
								variant="unstyled"
								onClick={handleExportSpecializations}
								className="inline-flex h-[29px] items-center rounded-[6px] border border-[#1eafc0] bg-transparent px-[13px] py-[6px] font-semibold leading-none text-text-1 transition hover:brightness-95"
								style={{ fontSize: 'var(--entity-add-text)' }}
							>
								Download Excel
							</Button>
						)} */}
					</div>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-[30px] sm:gap-[40px] flex-1">
						{statsLoading ? (
							<div className="flex justify-center items-center h-[200px] w-full text-text-3 font-medium">Loading Specializations...</div>
						) : pieSegments.length === 0 ? (
							<div className="flex justify-center items-center h-[200px] w-full text-text-3 font-medium">No specialization breakdown available</div>
						) : (
							<>
								{/* Donut Chart Container */}
								<div className="relative w-[220px] h-[220px] flex-shrink-0 flex items-center justify-center">
									<PieChart
										data={pieSegments.map(s => ({
											value: s.value,
											label: s.name,
											color: s.color,
										}))}
										width={220}
										height={220}
										innerRadius={70}
										outerRadius={95}
										paddingAngle={3}
										cornerRadius={4}
										showLegend={false}
									/>

									<div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
										<span className="text-text-3 font-semibold text-[10px] uppercase tracking-wider">
											Total
										</span>
										<span className="text-text-1 font-bold text-xl leading-none mt-0.5">
											{totalSpecializationDocs}
										</span>
										<span className="text-[10px] text-text-3 mt-0.5 font-medium">
											Docs
										</span>
									</div>
								</div>

								{/* Legends */}
								<div className="flex flex-col gap-1.5 max-w-[200px] w-full max-h-[180px] overflow-y-auto pr-1">
									{pieSegments.map((segment) => (
										<div
											key={segment.name}
											className="flex items-center justify-between text-xs font-semibold px-2 py-1 rounded-[6px] hover:bg-field/30 transition-colors"
										>
											<div className="flex items-center gap-2">
												<span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
												<span className="text-text-2 truncate max-w-[100px]" title={segment.name}>{segment.name}</span>
											</div>
											<div className="flex items-center gap-1.5 shrink-0 ml-4">
												<span className="text-text-1 font-bold">{segment.value}</span>
												<span className="text-text-3 text-[10px]">({segment.percentage.toFixed(0)}%)</span>
											</div>
										</div>
									))}
								</div>
							</>
						)}
					</div>
				</Card>

				{/* Doctor Earnings Summary (Actual Data - 7 cols) */}
				<Card className="lg:col-span-7 flex flex-col p-[16px] overflow-hidden">
					<div className="flex items-center justify-between mb-[16px]">
						<SectionTitle>Doctor Earnings Summary</SectionTitle>
						{canExcel && (
							<Button
								variant="unstyled"
								onClick={handleExportIncomeAccess}
								className="inline-flex h-[29px] items-center rounded-[6px] border border-[#1eafc0] bg-transparent px-[13px] py-[6px] font-semibold leading-none text-text-1 transition hover:brightness-95"
								style={{ fontSize: 'var(--entity-add-text)' }}
							>
								Download Excel
							</Button>
						)}
					</div>

					<div className="flex-1 flex flex-col">
						<CommonTable
							containerClassName="h-full"
							columns={earningsColumns}
							data={incomeReportList}
							loading={statsLoading}
						/>
					</div>
				</Card>
			</section>

			{/* Submodule Navigation Links */}
			<section className="flex flex-col gap-[12px]">
				<SectionTitle>Submodule Directory</SectionTitle>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
					{submoduleLinks.map((sub) => (
						<article
							key={sub.name}
							onClick={() => navigate(sub.path)}
							className="group cursor-pointer rounded-card border border-divider bg-card p-[16px] shadow-sm transition-all duration-300 hover:border-brand-light hover:shadow-md hover:-translate-y-0.5"
						>
							<div className="flex items-center justify-between mb-2">
								<h3 className="font-semibold text-text-1 group-hover:text-brand-light transition-colors text-[13.5px] leading-tight">
									{sub.name}
								</h3>
								<LinkIcon className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${sub.iconColor}`} />
							</div>
							<p className="text-text-3 font-normal line-clamp-2" style={{ fontSize: 'var(--dash-caption)' }}>
								{sub.desc}
							</p>
						</article>
					))}
				</div>
			</section>
		</div>
	);
};

export default DoctorDashboard;
