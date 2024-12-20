import { ShiftData, TimeRange } from "./shifts.dto";
import { ScheduleData, RemarkData } from "./schedules.dto";
import { UserData } from "./users.dto";
import { VacationData } from "./vacations.dto";
import { TimeRangePreferences, TimeSlot, DaySchedule, SchedulePreferences } from "./preferences.dto";
interface Constraints {
	id: string;
	shift_type: string;
	ranges?: TimeRange[];
}

export type {
	Constraints,
	ShiftData,
	TimeRange,
	UserData,
	VacationData,
	RemarkData,
	TimeRangePreferences,
	TimeSlot,
	DaySchedule,
	SchedulePreferences
};



