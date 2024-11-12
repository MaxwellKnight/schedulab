import { ShiftType } from '@/types/shifts.dto';

export const getShiftAbbreviation = (name: string): string => {
	const words = name.split(' ');
	if (words.length === 1) {
		return name.slice(0, 3);
	}
	return words.map(word => word[0]).join('');
};

export const getShiftColors = (shiftTypes: ShiftType[] | null) => {
	const colors = {
		morning: 'bg-blue-100 border-blue-300 text-blue-800',
		afternoon: 'bg-green-100 border-green-300 text-green-800',
		night: 'bg-purple-100 border-purple-300 text-purple-800',
		oncall: 'bg-yellow-100 border-yellow-300 text-yellow-800',
		backup: 'bg-pink-100 border-pink-300 text-pink-800',
		default: 'bg-red-100 border-red-300 text-red-800'
	};

	return shiftTypes?.reduce((acc, type, index) => {
		acc[type.id] = Object.values(colors)[index % Object.values(colors).length];
		return acc;
	}, {} as Record<number, string>) ?? {};
};
