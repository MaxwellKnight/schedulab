import { useReducer } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScheduleData, ShiftData } from '@/types';
import { useForm } from 'react-hook-form';
import ScheduleForm from './ScheduleForm';
import ShiftForm from './ShiftForm';
import ShiftList from './ShiftList';
import ProgressSteps from './ProgressSteps';

export type ScheduleAction =
	| { type: 'SET_STEP'; payload: number }
	| { type: 'UPDATE_SCHEDULE'; payload: Partial<ScheduleData> }
	| { type: 'ADD_SHIFT'; payload: ShiftData }
	| { type: 'REMOVE_SHIFT'; payload: number };

const scheduleReducer = (state: ScheduleData & { step: number }, action: ScheduleAction): ScheduleData & { step: number } => {
	switch (action.type) {
		case 'SET_STEP':
			return { ...state, step: action.payload };
		case 'UPDATE_SCHEDULE':
			return { ...state, ...action.payload };
		case 'ADD_SHIFT':
			return { ...state, shifts: [...state.shifts, action.payload] };
		case 'REMOVE_SHIFT':
			return { ...state, shifts: state.shifts.filter((_, i) => i !== action.payload) };
		default:
			return state;
	}
};

export const ScheduleBuilder = () => {
	const initialState: ScheduleData & { step: number } = {
		start_date: new Date(),
		end_date: new Date(),
		shifts: [],
		remarks: [],
		likes: 0,
		notes: '',
		step: 1,
	};

	const [state, dispatch] = useReducer(scheduleReducer, initialState);
	const form = useForm<ScheduleData>();

	const handleSubmit = (data: ScheduleData) => {
		const finalSchedule: ScheduleData = {
			...data,
			shifts: state.shifts.map((shift: ShiftData) => ({
				...shift,
				created_at: new Date(),
				schedule_id: 0,
			})),
		};
		console.log('Submitting schedule:', finalSchedule);
	};

	const removeShift = (index: number) => {
		dispatch({ type: 'REMOVE_SHIFT', payload: index });
	};

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
							{state.step === 1 ? "Schedule Builder" : "Shift Builder"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{state.step === 1 ? (
							<ScheduleForm
								form={form}
								schedule={state}
								dispatch={dispatch}
								onNext={() => dispatch({ type: 'SET_STEP', payload: state.step + 1 })}
							/>
						) : state.step === 2 ? (
							<ShiftForm
								form={form}
								schedule={state}
								dispatch={dispatch}
								onBack={() => dispatch({ type: 'SET_STEP', payload: state.step - 1 })}
								onNext={() => dispatch({ type: 'SET_STEP', payload: state.step + 1 })}
								onSubmit={handleSubmit}
							/>
						) : (
							<div className="max-w-md">Step-3</div>
						)}
					</CardContent>
				</Card>
				{state.step === 2 ? (
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl font-semibold text-center">Added Shifts</CardTitle>
						</CardHeader>
						<CardContent>
							<ShiftList shifts={state.shifts} onRemove={removeShift} />
						</CardContent>
					</Card>
				) : null}
			</div>
		</div>
	);
};
