import dayjs from 'dayjs';
import PropTypes from 'prop-types';

const VISIBLE_ENVIRONMENTS = new Set(['development', 'dev', 'staging', 'production', 'prod']);

const getEnvironmentLabel = mode => {
	if (mode === 'staging') return 'STAGING';
	if (mode === 'development' || mode === 'dev') return 'DEV';
	if (mode === 'production' || mode === 'prod') return 'PRODUCTION';
	return '';
};

const formatBuildTime = value => {
	if (!value) return '';

	const parsedValue = dayjs(value);
	if (!parsedValue.isValid()) return '';

	return parsedValue.format('YYYYMMDD.HHmm');
};

const SidebarEnvironmentBadge = ({ isOpen }) => {
	const mode = (import.meta.env.VITE_BUILD_MODE || import.meta.env.MODE || import.meta.env.VITE_APP_ENV || '').toLowerCase();
	const environmentLabel = getEnvironmentLabel(mode);
	const buildTime =
		import.meta.env.VITE_BUILD_TIME ||
		import.meta.env.REACT_APP_BUILD_TIME ||
		import.meta.env.NEXT_PUBLIC_BUILD_TIME ||
		'';

	if (!isOpen || !VISIBLE_ENVIRONMENTS.has(mode) || !environmentLabel) {
		return null;
	}

	const formattedBuildTime = formatBuildTime(buildTime);
	const environmentText = mode === 'development' || mode === 'dev' ? 'DEV - DEBUG' : environmentLabel;

	return (
		<div aria-hidden="true" className="text-right text-[7px] leading-[1.05] text-text-3/55">
			<div className="font-medium tracking-[0.08px] text-text-3/65">{environmentText}</div>
			{formattedBuildTime ? <div className="mt-[1px] font-normal text-text-3/50">{formattedBuildTime}</div> : null}
		</div>
	);
};

SidebarEnvironmentBadge.propTypes = {
	isOpen: PropTypes.bool.isRequired
};

export default SidebarEnvironmentBadge;

