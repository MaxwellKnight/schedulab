import { PreferenceData, DailyPreferenceData } from "./preferences.dto";
import { ShiftData, TimeRange } from "./shifts.dto";
import { ScheduleData, RemarkData } from "./schedules.dto";
import { UserData } from "./users.dto";
import { VacationData } from "./vacations.dto";

interface Constraints {
	id: string;
	name: string;
	ranges?: TimeRange[];
}

export type { Constraints, PreferenceData, ShiftData, TimeRange, ScheduleData, UserData, VacationData, DailyPreferenceData, RemarkData };
