export function toOptions(list = [], { valueKey = 'id', labelKey = 'name', labelFormatter, valueFormatter } = {}) {
	return (Array.isArray(list) ? list : []).map(item => ({
		value: valueFormatter ? valueFormatter(item) : item?.[valueKey],
		label: labelFormatter ? labelFormatter(item) : item?.[labelKey]
	}));
}
