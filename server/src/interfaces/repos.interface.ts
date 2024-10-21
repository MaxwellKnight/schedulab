import { User, Vacation, Preference, Shift, Schedule, DailyPreference, TemplateSchedule } from "../models";

export interface Repository<T> {
	create(data: Omit<T, "id">): Promise<number>;
	getOne(id: number): Promise<T[]>;
	getMany(): Promise<T[]>;
	update(data: Omit<T, "password">): Promise<number>;
	delete(id: number): Promise<number>;
}

export interface IUserRepository extends Repository<User> {
	getByShiftId(id: number): Promise<User[]>;
	getByEmail(email: string): Promise<User | null>;
	getByTeamId(teamId: number): Promise<User[]>;
}

export interface IVacationRepository extends Repository<Vacation> {
	getByDates(start_date: Date, end_date: Date): Promise<Vacation[]>;
	getByDate(date: Date): Promise<Vacation[]>;
	getByUserId(id: number): Promise<Vacation[]>;
	deleteByUserId(id: number): Promise<number>;
}

export interface IPreferenceRepository extends Repository<Preference> {
	getByDates(start_date: Date, end_date: Date): Promise<Preference[]>;
	getByUserId(id: number): Promise<Preference[]>;
	getDailyByPreferenceId(id: number): Promise<DailyPreference[]>;
	deleteByUserId(id: number): Promise<number>;
}

export interface IShiftRepository extends Repository<Shift> {
	getByDate(date: Date): Promise<Shift[]>;
	getByDates(start_date: Date, end_date: Date): Promise<Shift[]>;
	getByName(name: string): Promise<Shift[]>;
	getByUserId(id: number): Promise<Shift[]>;
	getByScheduleId(id: number): Promise<Shift[]>;
	getByShiftTypeId(shiftTypeId: number): Promise<Shift[]>;
	deleteByScheduleId(id: number): Promise<number>;
	removeUser(id: number): Promise<number>;
	addTimeRange(shiftId: number, startTime: Date, endTime: Date): Promise<number>;
	removeTimeRange(timeRangeId: number): Promise<number>;
}

export interface IScheduleRepository extends Repository<Schedule> {
	getByDates(start_date: Date, end_date: Date): Promise<Schedule[]>;
	getByUserId(id: number): Promise<Schedule[]>;
	getByTeamId(teamId: number): Promise<Schedule[]>;
	publish(id: number): Promise<number>;
	unpublish(id: number): Promise<number>;
}

export interface ITemplateScheduleRepository extends Repository<TemplateSchedule> {
	getByTeamId(teamId: number): Promise<TemplateSchedule[]>;
	createScheduleFromTemplate(templateId: number, startDate: Date): Promise<number>;
}
