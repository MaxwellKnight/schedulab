import axios from 'axios';
import ShiftForm from './ShiftForm';
import ShiftList from './ShiftList';
import ScheduleForm from './ScheduleForm';
import { useForm } from 'react-hook-form';
import ScheduleTable from './ScheduleTable';
import ProgressSteps from './ProgressSteps';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth/useAuth';
import ConstraintBuilder from './ConstraintBuilder';
import { useEffect, useReducer, useState } from 'react';
import { ScheduleData, ShiftData, Constraints } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TemplateScheduleData, TemplateShiftData, TemplateConstraintData } from '@/types/template.dto';

export type ShiftType = { id: number; name: string };
export type Schedule = ScheduleData & { types: ShiftType[] } & { step: number; constraints: Constraints[][] };

export type ScheduleAction =
	| { type: 'SET_STEP'; payload: number }
	| { type: 'UPDATE_SCHEDULE'; payload: Partial<Schedule> }
	| { type: 'ADD_SHIFT'; payload: ShiftData }
	| { type: 'REMOVE_SHIFT'; payload: number }
	| { type: 'ADD_SHIFT_TYPE'; payload: ShiftType };

const scheduleReducer = (state: Schedule, action: ScheduleAction): Schedule => {
	switch (action.type) {
		case 'SET_STEP':
			return { ...state, step: action.payload };
		case 'UPDATE_SCHEDULE':
			return { ...state, ...action.payload };
		case 'ADD_SHIFT':
			return { ...state, shifts: [...state.shifts, action.payload] };
		case 'REMOVE_SHIFT':
			return { ...state, shifts: state.shifts.filter((_, i) => i !== action.payload) };
		case 'ADD_SHIFT_TYPE':
			return { ...state, types: [...state.types, action.payload] };
		default:
			return state;
	}
};

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

const ScheduleBuilder: React.FC = () => {
	const [state, dispatch] = useReducer(scheduleReducer, initialState);
	const [error, setError] = useState<string | null>(null);
	const form = useForm<Schedule>();
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		axios.defaults.baseURL = 'http://localhost:5713';
		axios.defaults.withCredentials = true;
	}, []);

	const handleSubmit = async (data: Schedule) => {
		setError(null);
		try {
			const token = localStorage.getItem('authToken');
			if (!token) {
				throw new Error('Authentication token not found');
			}

			if (!user?.user_role) {
				throw new Error('User role not found');
			}

			const templateSchedule: Omit<TemplateScheduleData, 'id' | 'created_at'> = {
				team_id: 1,
				name: "Weekly Template",
				start_date: new Date(data.start_date),
				end_date: new Date(data.end_date),
				notes: data.notes || "",
				shifts: data.shifts.map((shift: ShiftData): Omit<TemplateShiftData, 'id' | 'created_at'> => ({
					template_schedule_id: 0,
					shift_type_id: shift.shift_type,
					shift_name: shift.shift_name,
					required_count: shift.required_count,
					day_of_week: new Date(shift.date).getDay(),
					ranges: shift.ranges.map(range => ({
						template_shift_id: 0,
						start_time: new Date(range.start_time).toTimeString().split(' ')[0],
						end_time: new Date(range.end_time).toTimeString().split(' ')[0]
					}))
				})),
				constraints: data.constraints.map(constraintPair =>
					constraintPair.map((constraint): Omit<TemplateConstraintData, 'id' | 'created_at'> => ({
						template_schedule_id: 0,
						shift_type_id: getShiftTypeId(constraint.shift_type, data.types),
						next_shift_type_id: constraintPair[1] ? getShiftTypeId(constraintPair[1].shift_type, data.types) : undefined
					}))
				)
			};

			// Include user role and other authorization params in the query parameters
			const response = await axios.post('/templates', templateSchedule, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				params: {
					user_role: user.user_role,
					user_id: user.id,
					team_id: user.team_id
				}
			});

			if (response.status === 201 || response.status === 200) {
				navigate('/schedule', { state: { success: 'Template schedule created successfully!' } });
			} else {
				throw new Error('Failed to create template schedule');
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					setError('Authentication failed. Please log in again.');
					navigate('/login');
				} else if (error.response?.status === 403) {
					setError('You do not have permission to perform this action.');
				} else {
					setError(error.response?.data?.message || 'Failed to create template schedule. Please try again.');
				}
			} else if (error instanceof Error) {
				setError(error.message);
			} else {
				setError('An unexpected error occurred. Please try again.');
			}
			console.error('Submit error:', error);
		}
	};

	const getShiftTypeId = (shiftTypeName: string, types: ShiftType[]): number => {
		const shiftType = types.find(type => type.name === shiftTypeName);
		if (!shiftType) {
			throw new Error(`Shift type not found: ${shiftTypeName}`);
		}
		return shiftType.id;
	};

	const removeShift = (index: number) => {
		dispatch({ type: 'REMOVE_SHIFT', payload: index });
	};

	const updateSchedule = (updatedSchedule: Partial<Schedule>) => {
		dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedSchedule });
	};

	const next = () => dispatch({ type: 'SET_STEP', payload: state.step + 1 });
	const previous = () => dispatch({ type: 'SET_STEP', payload: state.step - 1 });

	const steps = [
		{ label: "Schedule", sublabel: "Info" },
		{ label: "Shifts", sublabel: "Details" },
		{ label: "Constraints", sublabel: "Details" },
		{ label: "Confirmation", sublabel: "Details" },
	];

	return (
		<div className={`container mx-auto p-4 ${state.step === 1 ? 'max-w-md' : state.step === 4 ? 'max-w-full' : 'max-w-5xl'}`}>
			<div className="w-full mb-6">
				<ProgressSteps steps={steps} currentStep={state.step} isCompact={state.step === 1} />
			</div>
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
					<strong className="font-bold">Error:</strong>
					<span className="block sm:inline"> {error}</span>
				</div>
			)}
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
								onUpdateSchedule={updateSchedule}
								onBack={previous}
								onNext={next}
							/>
						)}
						{state.step === 4 && (
							<ScheduleTable
								schedule={state}
								onSubmit={handleSubmit}
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

export default ScheduleBuilder;
