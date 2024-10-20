import { useReducer } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScheduleData, ShiftData } from '@/types';
import { useForm } from 'react-hook-form';
import ScheduleForm from './ScheduleForm';
import ShiftForm from './ShiftForm';
import ShiftList from './ShiftList';
import ProgressSteps from './ProgressSteps';
import ConstraintBuilder from './ConstraintBuilder';
import { Constraints } from '@/types';
import ScheduleTable from './ScheduleTable';

export type ScheduleAction =
	| { type: 'SET_STEP'; payload: number }
	| { type: 'UPDATE_SCHEDULE'; payload: Partial<ScheduleData> }
	| { type: 'ADD_SHIFT'; payload: ShiftData }
	| { type: 'REMOVE_SHIFT'; payload: number }
	| { type: 'ADD_CONSTRAINT'; payload: Constraints }
	| { type: 'REMOVE_CONSTRAINT'; payload: string }
	| { type: 'ADD_SHIFT_TYPE'; payload: ShiftType };

export type ShiftType = { id: number, name: string };
export type Schedule = ScheduleData & { types: ShiftType[] } & { step: number, constraints: Constraints[] };

const scheduleReducer = (
	state: Schedule,
	action: ScheduleAction
): Schedule => {
	switch (action.type) {
		case 'SET_STEP':
			return { ...state, step: action.payload };
		case 'UPDATE_SCHEDULE':
			return { ...state, ...action.payload };
		case 'ADD_SHIFT':
			return { ...state, shifts: [...state.shifts, action.payload] };
		case 'REMOVE_SHIFT':
			return { ...state, shifts: state.shifts.filter((_, i) => i !== action.payload) };
		case 'ADD_CONSTRAINT':
			return { ...state, constraints: [...state.constraints, action.payload] };
		case 'REMOVE_CONSTRAINT':
			return { ...state, constraints: state.constraints.filter(c => c.id !== action.payload) };
		case 'ADD_SHIFT_TYPE':
			return { ...state, types: [...state.types, action.payload] };
		default:
			return state;
	}
};

export const ScheduleBuilder = () => {
	const initialState: Schedule = {
		start_date: new Date(),
		end_date: new Date(),
		shifts: [],
		remarks: [],
		likes: 0,
		notes: '',
		step: 1,
		types: [
			{ id: 1, name: 'Morning' },
			{ id: 2, name: 'Afternoon' },
			{ id: 3, name: 'Night' },
		],
		constraints: [],
	};

	const [state, dispatch] = useReducer(scheduleReducer, initialState);
	const form = useForm<Schedule>();

	const handleSubmit = (data: Schedule) => {
		const finalSchedule: Schedule = {
			...data,
			shifts: state.shifts.map((shift: ShiftData) => ({
				...shift,
				created_at: new Date(),
				schedule_id: 0,
			})),
		};
		console.log('Submitting schedule:', finalSchedule);
		console.log('Constraints:', state.constraints);
	};

	const removeShift = (index: number) => {
		dispatch({ type: 'REMOVE_SHIFT', payload: index });
	};

	const addConstraint = (constraint: Constraints) => {
		dispatch({ type: 'ADD_CONSTRAINT', payload: constraint });
	};

	const removeConstraint = (id: string) => {
		dispatch({ type: 'REMOVE_CONSTRAINT', payload: id });
	};

	const next = () => dispatch({ type: 'SET_STEP', payload: state.step + 1 });
	const previous = () => dispatch({ type: 'SET_STEP', payload: state.step - 1 });

	const steps = [
		{ label: "Schedule", sublabel: "Info" },
		{ label: "Shifts", sublabel: "Details" },
		{ label: "Constraints" },
		{ label: "Confirmation" },
	];

	return (
		<div className={`container mx-auto p-4 ${state.step === 1 ? 'max-w-md' : 'max-w-6xl'}`}>
			<div className="w-full mb-6">
				<ProgressSteps steps={steps} currentStep={state.step} isCompact={state.step === 1} />
			</div>
			<div className={`grid ${state.step === 2 ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl font-semibold text-center">
							{state.step === 1 ? "Schedule Builder" :
								state.step === 2 ? "Shift Builder" :
									state.step === 3 ? "Constraints Builder" : "Confirmation"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{state.step === 1 && (
							<ScheduleForm
								form={form}
								schedule={state}
								dispatch={dispatch}
								onNext={next}
							/>
						)}
						{state.step === 2 && (
							<ShiftForm
								form={form}
								schedule={state}
								dispatch={dispatch}
								onBack={previous}
								onNext={next}
								onSubmit={handleSubmit}
							/>
						)}
						{state.step === 3 && (
							<ConstraintBuilder
								schedule={state}
								onAddConstraint={addConstraint}
								onRemoveConstraint={removeConstraint}
								onBack={previous}
								onNext={next}
							/>
						)}
						{state.step === 4 && (
							<ScheduleTable
								schedule={state}
								onNext={next}
								onBack={previous}
							/>
						)}
					</CardContent>
				</Card>
				{state.step === 2 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl font-semibold text-center">Added Shifts</CardTitle>
						</CardHeader>
						<CardContent>
							<ShiftList shifts={state.shifts} onRemove={removeShift} />
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};
