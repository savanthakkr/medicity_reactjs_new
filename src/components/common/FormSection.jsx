/* eslint-disable react/prop-types */
import React from 'react';
import SectionTab from './SectionTab';

const FormSection = ({ title, subtitle, children, className = '', tabClassName = '', contentClassName = '' }) => {
	return (
		<div className={`mb-2 ${className}`}>
			<SectionTab title={title} subtitle={subtitle} className={tabClassName} />
			<div
				className={`rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px] border border-divider bg-card p-[10px] shadow-sm ${contentClassName}`}
			>
				{children}
			</div>
		</div>
	);
};

export default FormSection;
