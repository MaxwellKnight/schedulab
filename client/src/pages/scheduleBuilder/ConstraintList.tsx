import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from 'lucide-react';
import { AlgorithmicConstraint } from '@/types';

interface ConstraintListProps {
	constraints: AlgorithmicConstraint[];
	onRemoveConstraint: (id: string) => void;
}

const ConstraintList: React.FC<ConstraintListProps> = ({ constraints, onRemoveConstraint }) => {
	const constraintDescriptions = {
		maxConsecutive: "Maximum consecutive shifts",
		minTimeBetween: "Minimum hours between shifts",
		maxPerDay: "Maximum shifts per day",
		maxPerWeek: "Maximum shifts per week",
		noSequence: "Disallow specific shift sequence",
		custom: "Custom constraint logic"
	};

	const shiftTypeNames: Record<number, string> = {
		1: "Morning",
		2: "Afternoon",
		3: "Night"
	};

	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	return (
		<div className="space-y-4">
			{constraints.length === 0 ? (
				<p className="text-center text-gray-500">No constraints added yet.</p>
			) : (
				constraints.map((constraint) => (
					<Card key={constraint.id} className="bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
						<CardContent className="p-4">
							<div className="flex justify-between items-start">
								<div>
									<p className="font-semibold text-lg">{constraintDescriptions[constraint.type]}</p>
									<p className="text-sm text-gray-600 mt-2">
										Shift Types: {constraint.shiftTypes.map((type) => shiftTypeNames[type]).join(', ')}
										{constraint.value !== undefined && (
											<>
												<br />Value: {constraint.value}
											</>
										)}
										{constraint.priority && (
											<>
												<br />Priority: {constraint.priority}
											</>
										)}
										{constraint.daysOfWeek && constraint.daysOfWeek.length > 0 && (
											<>
												<br />Days of Week: {constraint.daysOfWeek.map((day) => daysOfWeek[day - 1]).join(', ')}
											</>
										)}
										{constraint.additionalData && constraint.additionalData.length > 0 && (
											<>
												<br />Sequence: {constraint.additionalData.map((type) => shiftTypeNames[type]).join(' → ')}
											</>
										)}
										{constraint.customCondition && (
											<>
												<br />Custom Condition: {constraint.customCondition}
											</>
										)}
									</p>
								</div>
								<Button
									onClick={() => onRemoveConstraint(constraint.id)}
									variant="ghost"
									size="sm"
									className="text-red-500 hover:text-red-700"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))
			)}
		</div>
	);
};

export default ConstraintList;
