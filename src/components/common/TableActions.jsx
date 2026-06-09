import React from 'react';
import EditIcon from '../../assets/icons/EditIcon.jsx';
import DeleteIcon from '../../assets/icons/DeleteIcon.jsx';
import EyeIcon from '../../assets/icons/EyeIcon.jsx';
import Tooltip from '../dropdown/Tooltip.jsx';

const TableActions = ({ onView, onEdit, onDelete }) => {
	return (
		<div className="flex gap-2">
			{onView && (
				<Tooltip title="View Details">
					<button type="button" onClick={onView}>
						<EyeIcon />
					</button>
				</Tooltip>
			)}
			{onEdit && (
				<Tooltip title="Edit">
					<button type="button" onClick={onEdit}>
						<EditIcon />
					</button>
				</Tooltip>
			)}
			{onDelete && (
				<Tooltip title="Delete">
					<button
						type="button"
						className="inline-flex h-[15px] w-[15px] items-center justify-center text-red-500 transition hover:text-red-700"
						onClick={onDelete}
					>
						<DeleteIcon className="h-[15px] w-[15px]" />
					</button>
				</Tooltip>
			)}
		</div>
	);
};

export default TableActions;
