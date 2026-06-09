import React from 'react';
import { useAtomValue } from 'jotai';
import { fontSizeAtom } from '../../data/states/appAtoms';
import { ENTITY_PAGE_SCALES } from '../../utils/constants/ui';
import AddIcon from '../../assets/icons/AddIcon';
import { useNavigate } from 'react-router-dom';

const TableLayout = ({ title, filterContent = null, addAction, extraAction, addLabel, children }) => {
	const fontSize = useAtomValue(fontSizeAtom) || 'medium';
	const scale = ENTITY_PAGE_SCALES[fontSize] ?? ENTITY_PAGE_SCALES.medium;
	const navigate = useNavigate();

	return (
		<section className="w-full pb-4" style={scale}>
			<div className="mb-[12px] flex min-h-[29px] items-center justify-between">
				<div className="flex items-center gap-[10px]">
					<h1 className="text-h3 font-medium tracking-[-0.02em] leading-none text-text-1">
						{title}
					</h1>
					{filterContent}
				</div>

				<div className="flex items-center gap-2">
					{extraAction}

					{addLabel && addAction && (
						<button
							type="button"
							className="inline-flex h-[29px] items-center gap-[3px] rounded-[6px] bg-brand-light px-[13px] py-[6px] font-semibold leading-none text-white transition hover:brightness-95"
							style={{ fontSize: 'var(--entity-add-text)' }}
							onClick={() => {
								if (typeof addAction === 'string') {
									navigate(addAction);
								} else {
									addAction();
								}
							}}
						>
							{addLabel}

							<AddIcon />
						</button>
					)}
				</div>
			</div>
			<div data-filter-container="" className="w-full empty:hidden" />
			{children}
		</section>
	);
};

export default TableLayout;
