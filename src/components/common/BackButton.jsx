import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackIcon from '../../assets/icons/BackIcon.jsx';
import Button from './Button.jsx';

const BackButton = ({ title, to, className = '' }) => {
	const navigate = useNavigate();

	if (to === null) return null;

	return (
		<Button
			variant="unstyled"
			onClick={() => (to ? navigate(to) : navigate(-1))}
			className={`mb-[13px] inline-flex items-center gap-1 text-h3 font-medium tracking-[-0.02em] text-text-1 transition hover:text-text-2 ${className}`}
		>
			<BackIcon className="h-5 w-5" />
			<span>{title}</span>
		</Button>
	);
};

export default BackButton;
