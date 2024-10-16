import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlgorithmicConstraint } from '@/types';

interface ShiftConstraintsManagerProps {
	constraints: AlgorithmicConstraint[];
	onAddConstraint: (constraint: AlgorithmicConstraint) => void;
	onRemoveConstraint: (id: string) => void;
	onBack: () => void;
	onNext: () => void;
}

const ConstraintBuilder: React.FC<ShiftConstraintsManagerProps> = ({
	onAddConstraint,
	onBack,
	onNext
}) => {
	const [newConstraint, setNewConstraint] = useState<Partial<AlgorithmicConstraint>>({
		type: 'maxConsecutive',
		shiftTypes: [],
		value: 0
	});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const handleAddConstraint = () => {
		setErrorMessage(null);
		setSuccessMessage(null);

		if (!newConstraint.type) {
			setErrorMessage("Constraint type is required");
			return;
		}
		if (newConstraint.shiftTypes!.length === 0) {
			setErrorMessage("At least one shift type is required");
			return;
		}
		if (newConstraint.value === undefined || newConstraint.value < 0) {
			setErrorMessage("A valid value is required");
			return;
		}

		onAddConstraint({
			...newConstraint as AlgorithmicConstraint,
			id: Date.now().toString(),
		});
		setNewConstraint({
			type: 'maxConsecutive',
			shiftTypes: [],
			value: 0
		});
		setSuccessMessage("Constraint added successfully");
	};

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

	const removeShiftType = (index: number) => {
		setNewConstraint({
			...newConstraint,
			shiftTypes: newConstraint.shiftTypes?.filter((_, i) => i !== index)
		});
	};

	const removeAdditionalData = (index: number) => {
		setNewConstraint({
			...newConstraint,
			additionalData: newConstraint.additionalData?.filter((_, i) => i !== index)
		});
	};

	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	const renderConstraintFields = () => {
		switch (newConstraint.type) {
			case 'maxConsecutive':
			case 'maxPerDay':
			case 'maxPerWeek':
				return (
					<>
						{renderShiftTypesField()}
						{renderValueField("Maximum number")}
						{renderDaysOfWeekField()}
					</>
				);
			case 'minTimeBetween':
				return (
					<>
						{renderShiftTypesField()}
						{renderValueField("Minimum hours")}
					</>
				);
			case 'noSequence':
				return (
					<>
						{renderShiftTypesField()}
						{renderSequenceShiftTypesField()}
					</>
				);
			case 'custom':
				return (
					<>
						{renderShiftTypesField()}
						{renderCustomConditionField()}
					</>
				);
			default:
				return null;
		}
	};

	const renderShiftTypesField = () => (
		<div>
			<Label>Shift Types</Label>
			<div className="flex flex-wrap gap-2 mb-2">
				{newConstraint.shiftTypes?.map((type, index) => (
					<Badge key={index} variant="secondary" className="px-2 py-1">
						{shiftTypeNames[type]}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => removeShiftType(index)}
							className="ml-2 p-0 h-4 w-4"
						>
							<X className="h-3 w-3" />
						</Button>
					</Badge>
				))}
			</div>
			<Select
				onValueChange={(value) => setNewConstraint({
					...newConstraint,
					shiftTypes: [...(newConstraint.shiftTypes || []), parseInt(value)]
				})}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Add shift types" />
				</SelectTrigger>
				<SelectContent>
					{Object.entries(shiftTypeNames).map(([value, name]) => (
						<SelectItem key={value} value={value}>{name}</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);

	const renderValueField = (label: string) => (
		<div>
			<Label htmlFor="constraintValue">{label}</Label>
			<Input
				id="constraintValue"
				type="number"
				placeholder={label}
				value={newConstraint.value || ''}
				onChange={(e) => setNewConstraint({ ...newConstraint, value: parseInt(e.target.value) || 0 })}
				className="w-full"
			/>
		</div>
	);

	const renderDaysOfWeekField = () => (
		<div>
			<Label>Days of Week</Label>
			<div className="grid grid-cols-4 gap-2">
				{daysOfWeek.map((day, index) => (
					<div key={index} className="flex items-center space-x-2">
						<Checkbox
							id={`day-${index + 1}`}
							checked={(newConstraint.daysOfWeek || []).includes(index + 1)}
							onCheckedChange={(checked) => {
								const updatedDays = checked
									? [...(newConstraint.daysOfWeek || []), index + 1]
									: (newConstraint.daysOfWeek || []).filter(d => d !== index + 1);
								setNewConstraint({ ...newConstraint, daysOfWeek: updatedDays });
							}}
						/>
						<Label htmlFor={`day-${index + 1}`}>{day}</Label>
					</div>
				))}
			</div>
		</div>
	);

	const renderSequenceShiftTypesField = () => (
		<div>
			<Label>Sequence Shift Types</Label>
			<div className="flex flex-wrap gap-2 mb-2">
				{newConstraint.additionalData?.map((type, index) => (
					<Badge key={index} variant="secondary" className="px-2 py-1">
						{shiftTypeNames[type]}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => removeAdditionalData(index)}
							className="ml-2 p-0 h-4 w-4"
						>
							<X className="h-3 w-3" />
						</Button>
					</Badge>
				))}
			</div>
			<Select
				onValueChange={(value) => setNewConstraint({
					...newConstraint,
					additionalData: [...(newConstraint.additionalData || []), parseInt(value)]
				})}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Add sequence shift types" />
				</SelectTrigger>
				<SelectContent>
					{Object.entries(shiftTypeNames).map(([value, name]) => (
						<SelectItem key={value} value={value}>{name}</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);

	const renderCustomConditionField = () => (
		<div>
			<Label htmlFor="customCondition">Custom Condition</Label>
			<Input
				id="customCondition"
				type="text"
				placeholder="Enter custom condition"
				value={newConstraint.customCondition || ''}
				onChange={(e) => setNewConstraint({ ...newConstraint, customCondition: e.target.value })}
				className="w-full"
			/>
		</div>
	);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-6">
				<div className="space-y-6">
					{errorMessage && (
						<Alert variant="destructive">
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					)}

					{successMessage && (
						<Alert variant="default" className="bg-green-50 text-green-800 border-green-300">
							<AlertDescription>{successMessage}</AlertDescription>
						</Alert>
					)}

					<div>
						<Label htmlFor="constraintType">Constraint Type</Label>
						<Select
							onValueChange={(value) => setNewConstraint({ ...newConstraint, type: value as AlgorithmicConstraint['type'] })}
							value={newConstraint.type}
						>
							<SelectTrigger className="w-full" id="constraintType">
								<SelectValue placeholder="Select constraint type" />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(constraintDescriptions).map(([key, description]) => (
									<SelectItem key={key} value={key}>{description}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{renderConstraintFields()}

					<div>
						<Label htmlFor="constraintPriority">Constraint Priority</Label>
						<Input
							id="constraintPriority"
							type="number"
							placeholder="Constraint priority"
							value={newConstraint.priority || ''}
							onChange={(e) => setNewConstraint({ ...newConstraint, priority: parseInt(e.target.value) || 1 })}
							className="w-full"
						/>
					</div>

					<Button onClick={handleAddConstraint} className="w-full bg-sky-900 hover:bg-sky-800 text-white">
						<Plus className="mr-2 h-4 w-4" /> Add Constraint
					</Button>
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
