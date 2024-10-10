import { Preference, Schedule, Shift, User } from "../models";
import { PreferenceData, ScheduleData, ShiftData, UserData, VacationData } from "./dto";

export interface Service<T> {
	create: (data: T) => Promise<number>;
	getOne: (id: number) => Promise<T | null>;
	getMany: () => Promise<T[]>;
	update: (data: any) => Promise<number>;
	delete: (id: number) => Promise<number>;
}

export interface IUserService extends Service<UserData> {
	transform: (data: User) => UserData;
	getByShiftId: (id: number) => Promise<UserData[]>;
	getByEmail: (email: string) => Promise<UserData | null>;
}

export interface IVacationService extends Service<VacationData> {
	getByDates: (start_date: Date, end_date: Date) => Promise<VacationData[]>;
	getByDate: (date: Date) => Promise<VacationData[]>;
	getByUserId: (id: number) => Promise<VacationData[]>;
}

export interface IPreferenceService extends Service<PreferenceData> {
	transform: (data: Preference) => Promise<PreferenceData>;
	getByDates: (start_date: Date, end_date: Date) => Promise<unknown[]>;
	getByUserId: (id: number) => Promise<unknown[]>;
}
	
export interface IShiftService extends Service<ShiftData> {
	transform: (data: Shift) => Promise<ShiftData> | Promise<ShiftData[]>;
	getByDate: (date: Date) => Promise<unknown[]>;
	getByDates: (start_date: Date, end_date: Date) => Promise<ShiftData[]>;
	getByName: (name: string) => Promise<ShiftData[]>;
	getByUserId: (id: number) => Promise<ShiftData[]>;
	getByScheduleId: (id: number) => Promise<ShiftData[]>;
}

export interface IScheduleService extends Service<ScheduleData> {
	transform: (data: Schedule) => Promise<ScheduleData>;
	getByDates: (start_date: Date, end_date: Date) => Promise<ScheduleData[]>;
	getByUserId: (id: number) => Promise<ScheduleData[]>;
}