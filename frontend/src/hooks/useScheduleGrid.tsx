import { useMemo, useCallback } from 'react';
import { TemplateScheduleData, TemplateShiftData } from '@/types/template.dto';
import { UserData } from '@/types';
import { MemberAssignment } from '@/pages/Schedule/Schedule';

export const useScheduleGrid = (
	template: TemplateScheduleData | null,
	assignments: MemberAssignment[],
	members: UserData[] | null
) => {
	const timeSlots = useMemo(() => {
		if (!template) return [];
		const uniqueHours = new Set<string>();
		template.shifts.forEach(shift => {
			shift.ranges.forEach(range => {
				const startHour = range.start_time.split(':')[0];
				uniqueHours.add(startHour.padStart(2, '0') + ':00');
			});
		});
		return Array.from(uniqueHours).sort();
	}, [template]);

	const dates = useMemo(() => {
		if (!template) return [];
		const dateArray: Date[] = [];
		const currentDate = new Date(template.start_date);
		const endDate = new Date(template.end_date);
		while (currentDate <= endDate) {
			dateArray.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return dateArray;
	}, [template]);

	const getAssignedSlots = useCallback((shift: TemplateShiftData, date: Date, timeSlot: string) => {
		return assignments
			.filter(a => {
				const normalizedAssignmentTimeSlot = a.timeSlot.split(':').slice(0, 2).join(':');
				const normalizedTimeSlot = timeSlot.split(':').slice(0, 2).join(':');

				return (
					a.shiftTypeId === shift.shift_type_id &&
					a.date === date.toISOString() &&
					normalizedAssignmentTimeSlot === normalizedTimeSlot
				);
			})
			.map(a => ({
				position: a.position,
				member: members?.find(m => m.id.toString() === a.memberId),
				assignment: a
			}))
			.filter((slot): slot is { position: number; member: UserData; assignment: MemberAssignment } =>
				slot.member != null
			)
			.sort((a, b) => a.position - b.position);
	}, [assignments, members]);

	return {
		timeSlots,
		dates,
		getAssignedSlots
	};
};
