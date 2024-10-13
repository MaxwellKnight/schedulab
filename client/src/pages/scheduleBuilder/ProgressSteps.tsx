import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Step {
	label: string;
	sublabel?: string;
}

interface ProgressStepsProps {
	steps: Step[];
	currentStep: number;
	isCompact?: boolean;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep, isCompact = false }) => {
	return (
		<div className="flex justify-center w-full">
			<ol className={`flex items-center text-sm font-medium text-center text-gray-500 dark:text-gray-400 ${isCompact ? 'space-x-2' : 'sm:text-base space-x-4'}`}>
				{steps.map((step, index) => (
					<li
						key={index}
						className={`flex items-center ${index < currentStep
							? 'text-blue-600 dark:text-blue-500'
							: ''
							} ${index < steps.length - 1 && !isCompact
								? 'sm:after:content-[\'\'] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700'
								: ''
							}`}
					>
						<span className="flex items-center">
							{index < currentStep ? (
								<CheckCircle2 className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} me-2`} />
							) : (
								<span className={`${isCompact ? 'text-xs' : 'text-sm'} me-2`}>{index + 1}</span>
							)}
							<div className="flex flex-col items-center">
								<span className={isCompact ? 'text-xs' : 'text-sm'}>
									{step.label}
									<br />
									{!isCompact && <span>{step.sublabel}</span>}
								</span>
							</div>
						</span>
					</li>
				))}
			</ol>
		</div>
	);
};

export default ProgressSteps;
