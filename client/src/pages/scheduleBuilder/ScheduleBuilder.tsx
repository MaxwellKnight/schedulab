import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScheduleData } from '@/types';
import { useForm } from 'react-hook-form';
import ScheduleForm from './ScheduleForm';
import ShiftForm from './ShiftForm';
import ShiftList from './ShiftList';
import ProgressSteps from './ProgressSteps';
import { useState } from "react";

export const ScheduleBuilder = () => {
	const form = useForm<ScheduleData>();
	const [step, setStep] = useState(1);
	const [schedule, setSchedule] = useState<ScheduleData>({
		start_date: new Date(),
		end_date: new Date(),
		shifts: [],
		remarks: [],
		likes: 0,
		notes: '',
	});

	const handleSubmit = (data: ScheduleData) => {
		const finalSchedule: ScheduleData = {
			...data,
			shifts: schedule.shifts.map(shift => ({
				...shift,
				created_at: new Date(),
				//need to overwrite this after schedule created in the database
				schedule_id: 0,
			})),
		};
		console.log('Submitting schedule:', finalSchedule);
	};

	const removeShift = (index: number) => {
		setSchedule(prev => ({
			...prev,
			shifts: prev.shifts.filter((_, i) => i !== index)
		}));
	};

	const steps = [
		{ label: "Schedule", sublabel: "Info" },
		{ label: "Shifts", sublabel: "Details" },
		{ label: "Confirmation" },
	];

	return (
		<div className={`container mx-auto p-4 ${step === 1 ? 'max-w-md' : 'max-w-6xl'}`}>
			<div className="w-full mb-6">
				<ProgressSteps steps={steps} currentStep={step} isCompact={step === 1} />
			</div>
			<div className={`grid ${step === 2 ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl font-semibold text-center">
							{step === 1 ? "Schedule Builder" : "Shift Builder"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{step === 1 ? (
							<ScheduleForm
								form={form}
								schedule={schedule}
								setSchedule={setSchedule}
								onNext={() => setStep(2)}
							/>
						) : (
							<ShiftForm
								form={form}
								schedule={schedule}
								setSchedule={setSchedule}
								onBack={() => setStep(1)}
								onSubmit={handleSubmit}
							/>
						)}
					</CardContent>
				</Card>
				{step === 2 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl font-semibold text-center">Added Shifts</CardTitle>
						</CardHeader>
						<CardContent>
							<ShiftList shifts={schedule.shifts} onRemove={removeShift} />
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};
