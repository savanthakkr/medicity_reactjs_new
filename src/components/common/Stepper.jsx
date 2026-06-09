import React from 'react';

const CheckSvg = ({ className = 'h-4 w-4' }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="3.5"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<polyline points="20 6 9 17 4 12" />
	</svg>
);

const Stepper = ({ steps = [], activeStep = 1, onStepClick }) => {
	const stepCount = steps.length;
	const halfStepPct = 100 / (2 * stepCount);

	return (
		<div className="w-full py-6 select-none">
			{/* Steps Progress Row */}
			<div className="flex items-center justify-between relative">
				{/* Track Line Container (starts at center of first step, ends at center of last step) */}
				<div
					className="absolute top-[18px] h-[3px] bg-divider -translate-y-1/2 z-0 rounded-full"
					style={{
						left: `${halfStepPct}%`,
						right: `${halfStepPct}%`
					}}
				>
					{/* Active progress track overlay */}
					<div
						className="h-full bg-brand-light transition-all duration-500 ease-in-out rounded-full"
						style={{
							width: `${stepCount > 1 ? ((Math.max(1, activeStep) - 1) / (stepCount - 1)) * 100 : 0}%`
						}}
					/>
				</div>

				{steps.map((step, index) => {
					const stepNumber = index + 1;
					const isCompleted = stepNumber < activeStep;
					const isActive = stepNumber === activeStep;
					const isPending = stepNumber > activeStep;

					return (
						<div key={step} className="flex flex-col items-center z-10 flex-1 relative group">
							{/* Step Circle — solid bg wrapper ensures the connector line doesn't bleed through */}
							<div className="rounded-full bg-card p-[2px] shrink-0">
								<button
									type="button"
									disabled={!onStepClick || isPending}
									onClick={() => onStepClick && onStepClick(stepNumber)}
									className={`
                    flex h-9 w-9 items-center justify-center rounded-full border-2 font-semibold text-xs
                    transition-all duration-300 transform active:scale-95 shadow-sm
                    ${
											isCompleted
												? 'bg-[#13ba97] border-[#13ba97] text-white hover:brightness-95'
												: isActive
													? 'bg-card border-primary text-primary scale-110 shadow-md ring-4 ring-primary/15'
													: 'bg-card border-divider text-text-3 hover:border-text-2'
										}
                    ${onStepClick && !isPending ? 'cursor-pointer' : 'cursor-default'}
                  `}
								>
									{isCompleted ? (
										<CheckSvg className="h-4 w-4 stroke-white" />
									) : isActive ? (
										<div className="flex items-center justify-center relative w-full h-full">
											<span className="absolute text-primary text-[11px] font-bold">{stepNumber}</span>
											<div className="w-2 h-2 rounded-full bg-primary opacity-0 animate-ping absolute" />
										</div>
									) : (
										<span>{stepNumber}</span>
									)}
								</button>
							</div>

							{/* Step Title Label */}
							<span
								className={`
                  mt-3 text-[11px] font-medium tracking-wide text-center max-w-[80px] md:max-w-[120px] transition-colors duration-300
                  ${
										isActive
											? 'text-primary font-bold'
											: isCompleted
												? 'text-text-2 font-semibold'
												: 'text-text-3 font-normal'
									}
                `}
							>
								{step}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Stepper;
