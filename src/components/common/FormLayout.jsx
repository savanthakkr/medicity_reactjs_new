import React from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom, fontSizeAtom } from '../../data/states/appAtoms';
import { FORM_SCALES } from '../../utils/constants/ui';
import BackButton from './BackButton';
import SectionTab from './SectionTab';
import Button from './Button';

const FormLayout = ({
	title,
	tabTitle = undefined,
	backTo,
	subtitle,
	onSubmit,
	formId,
	loading = false,
	isEdit = false,
	submitLabel,
	children,
	maxWidth = 'w-full',
	footer = undefined // custom footer node, or null to hide footer completely
}) => {
	const themeMode = useAtomValue(themeAtom) || 'light';
	const fontSize = useAtomValue(fontSizeAtom) || 'medium';
	const isLightMode = themeMode === 'light';

	const scale = FORM_SCALES[fontSize] ?? FORM_SCALES.medium;

	const formSurfaceClass = isLightMode
		? 'px-[10px] pb-[10px] pt-[10px] shadow-[0_30px_41px_rgba(209,222,234,0.4)]'
		: 'px-[6px] pb-3 pt-3 shadow-sm';

	return (
		<section className={`mx-auto pb-4 pt-[4px] ${maxWidth}`} style={scale}>
			<BackButton title={title} to={backTo} />

			<div className="relative z-[1]">
				<SectionTab title={tabTitle || title} subtitle={subtitle} />
			</div>

			<form
				id={formId}
				onSubmit={onSubmit}
				noValidate
				className={`-mt-px rounded-[0_10px_10px_10px] border border-divider bg-card ${formSurfaceClass}`}
			>
				{children}
			</form>

			{footer !== null &&
				(footer !== undefined ? (
					<div className="mt-[8px]">{footer}</div>
				) : (
					<div className="mt-[8px] flex justify-end gap-[10px]">
						<Button type="submit" form={formId} loading={loading} style={{ fontSize: 'var(--form-btn)' }}>
							{submitLabel || (loading ? 'Saving...' : isEdit ? 'Update' : 'Save')}
						</Button>
					</div>
				))}
		</section>
	);
};

export default FormLayout;
