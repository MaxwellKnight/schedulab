import React from 'react';
import { Button } from "@/components/ui/button";
import { AlgorithmicConstraint } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShiftConstraintsManagerProps {
	constraints: AlgorithmicConstraint[];
	onAddConstraint: (constraint: AlgorithmicConstraint) => void;
	onRemoveConstraint: (id: string) => void;
	onBack: () => void;
	onNext: () => void;
}

const ConstraintBuilder: React.FC<ShiftConstraintsManagerProps> = ({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	constraints,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onAddConstraint,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onRemoveConstraint,
	onBack,
	onNext
}) => {
	return (
		<div className="space-y-6">
			<div className="flex space-x-4">
				{/* Wide column on the left (empty for now) */}
				<div className="flex-grow border-2 rounded-sm">
					{/* This space is intentionally left empty */}
				</div>

				{/* Small column on the right with the list of shift types */}
				<div className="w-1/6 min-w-[200px]">
					<h3 className="text-lg font-semibold mb-2">Shift Types</h3>
				</div>
			</div>

			<div className="flex justify-between mt-6">
				<Button onClick={onBack} type="button" variant="outline">
					<ChevronLeft className="mr-2 h-4 w-4" /> Back
				</Button>
				<Button onClick={onNext} type="button" className="bg-sky-700 hover:bg-sky-600">
					Next <ChevronRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};

export default ConstraintBuilder;
