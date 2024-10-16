import { PreferenceData, DailyPreferenceData } from "./preferences.dto";
import { ShiftData, TimeRange } from "./shifts.dto";
import { ScheduleData, RemarkData } from "./schedules.dto";
import { UserData } from "./users.dto";
import { VacationData } from "./vacations.dto";

interface AlgorithmicConstraint {
	id: string;
	type: 'maxConsecutive' | 'minTimeBetween' | 'maxPerDay' | 'maxPerWeek' | 'noSequence' | 'custom';
	shiftTypes: number[];
	value?: number;
	additionalData?: number[];
	priority?: number;
	groupId?: string;
	startTime?: string;
	endTime?: string;
	daysOfWeek?: number[];
	customCondition?: string;
}

export { AlgorithmicConstraint, PreferenceData, ShiftData, TimeRange, ScheduleData, UserData, VacationData, DailyPreferenceData, RemarkData };
