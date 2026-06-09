import MuiTooltip from '@mui/material/Tooltip';

const Tooltip = ({
	children,
	title,
	placement = 'top',
	arrow = true,
	describeChild = false,
	open,
	onOpen,
	onClose,
	disableHoverListener = false
}) => {
	return (
		<MuiTooltip
			title={title}
			placement={placement}
			arrow={arrow}
			describeChild={describeChild}
			open={open}
			onOpen={onOpen}
			onClose={onClose}
			disableHoverListener={disableHoverListener}
			slotProps={{
				tooltip: {
					sx: {
						// backgroundColor: "#ffff",
						bgcolor: 'var(--card-color)',
						color: 'var(--text-1)',
						fontSize: '12px',
						fontWeight: 500,
						borderRadius: '8px',
						padding: '6px 10px',
						boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
					}
				},
				arrow: {
					sx: {
						color: 'var(--card-color)'
					}
				}
			}}
		>
			{children}
		</MuiTooltip>
	);
};

export default Tooltip;
