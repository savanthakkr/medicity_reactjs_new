import React, { useMemo } from 'react';
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart';

const DEFAULT_THEME_COLORS = [
	'var(--color-kpi-1-start)',
	'var(--color-kpi-2-start)',
	'var(--color-kpi-3-start)',
	'var(--color-kpi-4-start)',
	'var(--color-brand-light)',
	'var(--color-brand)'
];

/**
 * Reusable Pie/Donut Chart component using MUI x-charts.
 * Adheres strictly to the project's CSS design system tokens.
 *
 * @param {Array<{ id: string|number, value: number, label: string, color?: string }>} data - Chart data points
 * @param {number} width - Total SVG width
 * @param {number} height - Total SVG height
 * @param {number} innerRadius - Inner radius for donut charts (set to 0 for solid pie)
 * @param {number} outerRadius - Outer segment radius
 * @param {number} paddingAngle - Angle gap between segments
 * @param {number} cornerRadius - Rounded corner radius for segments
 * @param {boolean} showLegend - Whether to display MUI's default legend
 * @param {string} cx - Center X coordinate (e.g. '50%')
 * @param {string} cy - Center Y coordinate (e.g. '50%')
 * @param {Object} slotProps - Optional slotProps overrides for MUI components
 */
const PieChart = ({
	data = [],
	width = 160,
	height = 160,
	innerRadius = 50,
	outerRadius = 70,
	paddingAngle = 3,
	cornerRadius = 4,
	showLegend = false,
	cx = '50%',
	cy = '50%',
	slotProps = {}
}) => {
	// Map colors dynamically if not provided in the data item
	const mappedData = useMemo(() => {
		return data.map((item, index) => ({
			id: item.id !== undefined ? item.id : index,
			value: item.value,
			label: item.label,
			color: item.color || DEFAULT_THEME_COLORS[index % DEFAULT_THEME_COLORS.length]
		}));
	}, [data]);

	if (!data || data.length === 0) {
		return (
			<div className="flex items-center justify-center text-text-3 font-semibold text-xs" style={{ width, height }}>
				No data available
			</div>
		);
	}

	return (
		<MuiPieChart
			series={[
				{
					data: mappedData,
					innerRadius,
					outerRadius,
					paddingAngle,
					cornerRadius,
					cx,
					cy
				}
			]}
			width={width}
			height={height}
			slotProps={{
				legend: {
					hidden: !showLegend,
					position: { vertical: 'bottom', horizontal: 'center' },
					labelStyle: {
						fill: 'var(--text-2)',
						fontSize: 11,
						fontWeight: 600
					},
					...slotProps.legend
				},
				...slotProps
			}}
		/>
	);
};

export default PieChart;
