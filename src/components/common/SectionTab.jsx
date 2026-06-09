/* eslint-disable react/prop-types */
import React from 'react';

const SectionTab = ({ title, subtitle, className = '' }) => {
	return (
		<div className={`section-tab ${className}`}>
			<span className="section-tab-title">{title}</span>
			{subtitle && (
				<>
					<span className="w-[6px] h-[6px] rounded-full bg-[#1EAFC0] inline-block shrink-0" aria-hidden="true"></span>
					<span className="section-tab-sub">{subtitle}</span>
				</>
			)}
		</div>
	);
};

export default SectionTab;
