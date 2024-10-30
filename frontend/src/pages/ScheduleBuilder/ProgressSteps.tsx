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
			<ol className={`relative flex items-center text-sm font-medium text-center text-gray-500 dark:text-gray-400 ${isCompact ? 'space-x-4' : 'sm:text-base space-x-8'}`}>
				{steps.map((step, index) => (
					<li
						key={index}
						className={`flex items-center ${index < currentStep ? 'text-blue-600 dark:text-blue-500' : ''
							}`}
					>
						<span className="flex items-center relative z-10">
							<span className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-full ${index < currentStep - 1
								? 'bg-blue-600 dark:bg-blue-500 text-white'
								: index === currentStep - 1
									? 'border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-900'
									: 'bg-gray-200 dark:bg-gray-700'
								}`}>
								{index < currentStep - 1 ? (
									<CheckCircle2 className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} />
								) : (
									<span className={`${isCompact ? 'text-xs' : 'text-sm'}`}>{index + 1}</span>
								)}
							</span>
							<div className="flex flex-col items-start ml-2">
								<span className={isCompact ? 'text-xs' : 'text-sm'}>
									{step.label}
								</span>
								{!isCompact && step.sublabel && (
									<span className="text-xs text-gray-400 dark:text-gray-500">{step.sublabel}</span>
								)}
							</div>
						</span>
					</li>
				))}
			</ol>
		</div>
	);
};

export default ProgressSteps;
