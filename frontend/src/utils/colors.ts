import { Schedule } from "@/pages/ScheduleBuilder/ScheduleBuilder";

const colorPalette: string[] = [
	'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
	'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

export const getColorForShiftType = (shiftTypeId: string, schedule: Schedule): string => {
	const index = schedule.types.findIndex(type => type.id === Number(shiftTypeId));
	return colorPalette[index % colorPalette.length];
};

