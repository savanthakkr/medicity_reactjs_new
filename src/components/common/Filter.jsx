/* eslint-disable react/prop-types */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import AutoComplete from '../dropdown/AutoComplete.jsx';
import FilterIcon from '../../assets/icons/FilterIcon.jsx';
import CloseIcon from '../../assets/icons/CloseIcon.jsx';
import Checkbox from './Checkbox.jsx';
import DateInput from './DateInput.jsx';
import { setDataInBrowser, getDataInBrowser } from '../../utils/methods/DataInBrowser';

const ALL_VALUE = '__all';
const NONE_VALUE = '__none';

// Module-level tracking for Strict Mode double-mount guard
const restoredKeys = new Set();
const restorationTimers = new Map();

const LABEL_MAP = {
  active: "Status",
  inactive: "Status",
  paid: "Paid Status",
  unpaid: "Paid Status",
  Draft: "Status",
  Submitted: "Status",
  Approved: "Status",
  Rejected: "Status",
  "Sent Back": "Status",
  Personal: "Current Step",
  Qualification: "Current Step",
  Shift: "Current Step",
  Financial: "Current Step",
  Document: "Current Step",
  Review: "Current Step",
};

const OPTION_GROUPS = [
  {
    id: "status",
    label: "Status",
    ids: ["active", "inactive", "Draft", "Submitted", "Approved", "Rejected", "Sent Back"],
  },
  {
    id: "payType",
    label: "Paid Status",
    ids: ["paid", "unpaid"],
  },
  {
    id: "currentStep",
    label: "Current Step",
    ids: ["Personal", "Qualification", "Shift", "Financial", "Document", "Review"],
  },
];

const createGroups = options => {
	const groupsMap = new Map();

	// First, group options by their explicit 'group' property
	options.forEach(option => {
		if (option.group) {
			if (!groupsMap.has(option.group)) {
				groupsMap.set(option.group, {
					id: option.group.toLowerCase().replace(/\s+/g, '_'),
					label: option.group,
					options: []
				});
			}
			groupsMap.get(option.group).options.push(option);
		}
	});

	const groupedOptions = new Set(options.filter(o => o.group));

	// Legacy OPTION_GROUPS logic for ungrouped options
	const remainingOptions = options.filter(o => !groupedOptions.has(o));
	const optionsById = new Map(remainingOptions.map(option => [option.id, option]));
	const groupedIds = new Set();

	const knownGroups = OPTION_GROUPS.map(group => ({
		...group,
		options: group.ids.map(id => optionsById.get(id)).filter(Boolean)
	})).filter(group => group.options.length > 0);

	knownGroups.forEach(group => {
		group.options.forEach(option => groupedIds.add(option.id));
	});

	const remainingGroups = remainingOptions
		.filter(option => !groupedIds.has(option.id))
		.map(option => ({
			id: option.id,
			label: LABEL_MAP[option.id] || option.label,
			options: [option]
		}));

	return [...Array.from(groupsMap.values()), ...knownGroups, ...remainingGroups];
};

const getGroupValue = group => {
	const checkedOptions = group.options.filter(option => option.checked);

	if (checkedOptions.length === group.options.length) {
		return ALL_VALUE;
	}

	if (checkedOptions.length === 0) {
		return NONE_VALUE;
	}

	if (checkedOptions.length === 1) {
		return checkedOptions[0].id;
	}

	return checkedOptions.map(option => option.id).join(',');
};

const createDraft = groups =>
	groups.reduce((draft, group) => {
		draft[group.id] = getGroupValue(group);
		return draft;
	}, {});

const getDesiredIds = (group, value) => {
	if (value === ALL_VALUE) {
		return new Set(group.options.map(option => option.id));
	}

	if (value === NONE_VALUE || !value) {
		return new Set();
	}

	return new Set(String(value).split(','));
};

const Filter = ({ options = [], dateOptions = [], activeOnlyProps = null, onChange, onDateChange, onApply }) => {
	const location = useLocation();
	const storageKey = `filter_${location.pathname.replace(/\//g, '_')}`;

	const [panelMode, setPanelMode] = useState(() => {
		const savedData = getDataInBrowser(storageKey);
		if (savedData) {
			const draftHasApplied = Object.values(savedData.draft || {}).some(val => val !== ALL_VALUE);
			const dateHasApplied = savedData.dateDraft && Object.values(savedData.dateDraft).some(val => val !== '');
			if (draftHasApplied || dateHasApplied) return 'summary';
		}
		return 'hidden';
	});
	const containerRef = useRef(null);
	const [panelBounds, setPanelBounds] = useState(null);
	const [portalTarget, setPortalTarget] = useState(null);
	const groups = useMemo(() => createGroups(options), [options]);

	const [draft, setDraft] = useState(() => {
		const savedData = getDataInBrowser(storageKey);
		if (savedData && savedData.draft) {
			return savedData.draft;
		}
		return createDraft(groups);
	});
	const [dateDraft, setDateDraft] = useState(() => {
		const savedData = getDataInBrowser(storageKey);
		if (savedData && savedData.dateDraft) {
			return savedData.dateDraft;
		}
		return dateOptions?.reduce((acc, opt) => ({ ...acc, [opt.id]: opt.value || '' }), {}) || {};
	});

	useEffect(() => {
		if (restoredKeys.has(storageKey)) {
			if (restorationTimers.has(storageKey)) {
				clearTimeout(restorationTimers.get(storageKey));
				restorationTimers.delete(storageKey);
			}
			return;
		}

		const savedData = getDataInBrowser(storageKey);
		if (savedData) {
			restoredKeys.add(storageKey);
			if (savedData.draft) {
				setDraft(savedData.draft);
				// Sync with parent component using initial groups
				groups.forEach(group => {
					const desiredIds = getDesiredIds(group, savedData.draft[group.id]);
					group.options.forEach(option => {
						if (option.checked !== desiredIds.has(option.id)) {
							onChange(option.id);
						}
					});
				});
			}
			if (savedData.dateDraft && dateOptions?.length > 0) {
				setDateDraft(savedData.dateDraft);
				dateOptions.forEach(opt => {
					if (onDateChange && savedData.dateDraft[opt.id]) {
						if (opt.value !== savedData.dateDraft[opt.id]) {
							onDateChange(opt.id, savedData.dateDraft[opt.id]);
						}
					}
				});
			}
		}

		return () => {
			const timer = setTimeout(() => {
				restoredKeys.delete(storageKey);
				restorationTimers.delete(storageKey);
			}, 100);
			restorationTimers.set(storageKey, timer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storageKey]);

	const appliedGroups = useMemo(() => groups.filter(group => getGroupValue(group) !== ALL_VALUE), [groups]);

	const hasAppliedFilters = appliedGroups.length > 0;
	const shouldShowPanel = panelMode !== 'hidden';
	const shouldShowControls = panelMode === 'open';
	const panelHeight = shouldShowControls ? (hasAppliedFilters ? 'h-[290px]' : 'h-[138px]') : 'h-[76px]';

	useLayoutEffect(() => {
		if (containerRef.current) {
			const section = containerRef.current.closest('section');
			const target = section?.querySelector('[data-filter-container]');
			if (target) {
				setPortalTarget(target);
			}
		}
	}, []);

	useEffect(() => {
		if (panelMode !== 'open') {
			setDraft(createDraft(groups));
		}
	}, [groups, panelMode]);

	useEffect(() => {
		if (panelMode === 'summary' && !hasAppliedFilters) {
			const draftHasApplied = Object.values(draft || {}).some(val => val !== ALL_VALUE);
			const dateHasApplied = Object.values(dateDraft || {}).some(val => val !== '');
			if (!draftHasApplied && !dateHasApplied) {
				setPanelMode('hidden');
			}
		}
	}, [hasAppliedFilters, panelMode, draft, dateDraft]);

	useLayoutEffect(() => {
		if (!shouldShowPanel || !containerRef.current || portalTarget) {
			setPanelBounds(null);
			return undefined;
		}

		const updatePanelBounds = () => {
			const section = containerRef.current.closest('section');
			const sectionRect = section?.getBoundingClientRect();
			const triggerRect = containerRef.current.getBoundingClientRect();

			if (!sectionRect) return;

			setPanelBounds({
				left: sectionRect.left,
				top: triggerRect.bottom + 8,
				width: sectionRect.width
			});
		};

		updatePanelBounds();
		window.addEventListener('resize', updatePanelBounds);
		window.addEventListener('scroll', updatePanelBounds, true);

		return () => {
			window.removeEventListener('resize', updatePanelBounds);
			window.removeEventListener('scroll', updatePanelBounds, true);
		};
	}, [shouldShowPanel, portalTarget]);

	const handleButtonClick = () => {
		if (panelMode === 'hidden') {
			setDraft(createDraft(groups));
			setPanelMode('open');
			return;
		}

		if (panelMode === 'open') {
			setPanelMode(hasAppliedFilters ? 'summary' : 'hidden');
			return;
		}

		setDraft(createDraft(groups));
		setPanelMode('open');
	};

	const updateOptions = desiredValuesByGroup => {
		groups.forEach(group => {
			const desiredIds = getDesiredIds(group, desiredValuesByGroup[group.id]);

			group.options.forEach(option => {
				if (option.checked !== desiredIds.has(option.id)) {
					onChange(option.id);
				}
			});
		});
	};

	const handleApply = () => {
		updateOptions(draft);
		if (onDateChange && dateOptions?.length > 0) {
			dateOptions.forEach(opt => {
				if (dateDraft[opt.id] !== opt.value) {
					onDateChange(opt.id, dateDraft[opt.id]);
				}
			});
		}
		setDataInBrowser(storageKey, { draft, dateDraft });
		if (onApply) onApply();
		setPanelMode('open');
	};

	const handleClearAll = () => {
		const clearedDraft = groups.reduce((nextDraft, group) => {
			nextDraft[group.id] = ALL_VALUE;
			return nextDraft;
		}, {});

		const clearedDates = dateOptions?.reduce((acc, opt) => ({ ...acc, [opt.id]: '' }), {}) || {};

		setDraft(clearedDraft);
		setDateDraft(clearedDates);
		updateOptions(clearedDraft);
		if (onDateChange && dateOptions?.length > 0) {
			dateOptions.forEach(opt => onDateChange(opt.id, ''));
		}
		setDataInBrowser(storageKey, { draft: clearedDraft, dateDraft: clearedDates });
		setPanelMode('hidden');
	};

	const handleClearGroup = groupId => {
		const nextDraft = {
			...createDraft(groups),
			[groupId]: ALL_VALUE
		};

		setDraft(nextDraft);
		updateOptions(nextDraft);
		setDataInBrowser(storageKey, { draft: nextDraft, dateDraft });
		setPanelMode('summary');
	};

	const panelInnerContent = (
		<>
			{hasAppliedFilters && (
				<div className={shouldShowControls ? 'mb-[28px]' : ''}>
					<p className="mb-[22px] text-[length:var(--doctor-filter-text,12px)] font-bold leading-none text-text-1">
						{appliedGroups.length} {appliedGroups.length === 1 ? 'filter' : 'filters'} applied
					</p>

					<div className="flex flex-wrap items-center gap-[7px]">
						{appliedGroups.flatMap(group => {
							const checkedOptions = group.options.filter(option => option.checked);
							const chips = checkedOptions.length > 0 ? checkedOptions : [{ id: `${group.id}-none`, label: 'None' }];

							return chips.map(option => (
								<button
									key={`${group.id}-${option.id}`}
									type="button"
									onClick={() => handleClearGroup(group.id)}
									className="inline-flex h-[25px] items-center rounded-full border border-brand-light bg-transparent px-[8px] text-[length:var(--doctor-filter-label,11px)] font-medium leading-none text-brand-light"
								>
									{option.label}
									<CloseIcon className="ml-[4px] h-[length:calc(var(--doctor-filter-label,11px)+3px)] w-[length:calc(var(--doctor-filter-label,11px)+3px)]" />
								</button>
							));
						})}

						<button
							type="button"
							onClick={handleClearAll}
							className="inline-flex h-[25px] items-center rounded-full bg-brand-light px-[12px] text-[length:var(--doctor-filter-label,11px)] font-semibold leading-none text-white"
						>
							Clear All
						</button>
					</div>
				</div>
			)}

			{shouldShowControls && (
				<div
					className={`grid grid-cols-1 gap-x-[8px] gap-y-[14px] ${(dateOptions?.length > 0 && groups.length < 3) ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px]' : 'md:grid-cols-[repeat(3,minmax(0,1fr))_120px]'}`}
				>
					{groups.map(group => {
						const choices = ['All', ...group.options.map(option => option.label), 'None'];
						const valueMap = new Map([
							['All', ALL_VALUE],
							['None', NONE_VALUE],
							...group.options.map(option => [option.label, option.id])
						]);
						const selectedValue = choices.find(choice => valueMap.get(choice) === draft[group.id]) || 'All';

						return (
							<div key={group.id} className="min-w-0">
								<label className="mb-[7px] block text-[length:var(--doctor-filter-label,11px)] font-bold leading-none text-text-1">
									{group.label}
								</label>
								<AutoComplete
									options={choices}
									value={selectedValue}
									onChange={(_, value) => {
										setDraft(prev => ({
											...prev,
											[group.id]: valueMap.get(value || 'All')
										}));
									}}
									placeholder={`All ${group.label}`}
									width="100%"
								/>
							</div>
						);
					})}

					{dateOptions?.map((opt, index) => (
						<div key={opt.id} className={`min-w-0 ${index === 0 ? 'md:col-start-1' : ''}`}>
							<label className="mb-[7px] block text-[length:var(--doctor-filter-label,11px)] font-bold leading-none text-text-1">
								{opt.label}
							</label>
							<DateInput
								id={opt.id}
								value={dateDraft[opt.id] || ''}
								onChange={e => setDateDraft(prev => ({ ...prev, [opt.id]: e.target.value }))}
								placeholder="DD/MM/YYYY"
								wrapperClassName="!h-[34px]"
								className="!h-[34px] text-[length:var(--doctor-filter-text,12px)] bg-white border border-[#e5e7eb] rounded-[6px]"
							/>
						</div>
					))}

					<div className={`flex items-end ${(dateOptions?.length > 0 && groups.length < 3) ? 'md:col-start-3' : 'md:col-start-4'}`}>
						<button
							type="button"
							onClick={handleApply}
							className="h-[34px] w-full rounded-[8px] bg-brand-light px-[20px] text-[length:var(--doctor-filter-text,12px)] font-bold leading-none text-white transition hover:brightness-95"
						>
							Apply
						</button>
					</div>
				</div>
			)}
		</>
	);

	const renderPanel = () => {
		if (!shouldShowPanel) return null;

		if (portalTarget) {
			return createPortal(
				<div className="w-full rounded-[6px] border border-divider bg-card px-[16px] py-[14px] shadow-sm mb-3 mt-3">
					{panelInnerContent}
				</div>,
				portalTarget
			);
		}

		return (
			<div
				className={`fixed z-30 overflow-y-scroll rounded-[6px] border border-transparent bg-card px-[16px] py-[14px] shadow-sm ${panelHeight}
          [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#46535f] [&::-webkit-scrollbar-track]:bg-transparent`}
				style={{
					left: panelBounds ? `${panelBounds.left}px` : undefined,
					top: panelBounds ? `${panelBounds.top}px` : undefined,
					width: panelBounds ? `${panelBounds.width}px` : undefined,
					maxWidth: 'calc(100vw - 24px)'
				}}
			>
				{panelInnerContent}
			</div>
		);
	};

	const wrapperPaddingClass = !portalTarget && shouldShowPanel ? 'pb-[calc(var(--filter-panel-height)+8px)]' : '';
	const wrapperStyle =
		!portalTarget && shouldShowPanel
			? {
					'--filter-panel-height':
						shouldShowControls && hasAppliedFilters ? '290px' : shouldShowControls ? '138px' : '76px'
				}
			: {};

	return (
		<div className="flex items-center gap-[10px]">
			{activeOnlyProps && (
				<Checkbox
					id="activeOnly"
					label={activeOnlyProps.label || 'SEARCH ONLY ACTIVE'}
					checked={activeOnlyProps.checked}
					onChange={activeOnlyProps.onChange}
					className="mr-2"
					labelClassName="text-[length:var(--doctor-filter-text,12px)] text-text-1 font-semibold uppercase whitespace-nowrap"
				/>
			)}
			<div
				ref={containerRef}
				className={`relative inline-flex items-start ${wrapperPaddingClass}`}
				style={wrapperStyle}
			>
				<button
					type="button"
					onClick={handleButtonClick}
					className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[6px] border bg-card outline-none transition ${
						hasAppliedFilters || shouldShowPanel
							? 'border-brand-light text-brand-light hover:bg-brand-light/5 focus:border-brand-light focus:ring-brand-light/15'
							: 'border-divider text-text-2 hover:border-[#1eafc0] hover:bg-[#21c4d6]/5 focus:border-[#1eafc0] focus:ring-[#21c4d6]/15'
					} focus:ring-2`}
					aria-label="Filter options"
					aria-expanded={shouldShowPanel}
				>
					<FilterIcon className="h-[14px] w-[14px]" />
				</button>

				{renderPanel()}
			</div>
		</div>
	);
};

export default Filter;
