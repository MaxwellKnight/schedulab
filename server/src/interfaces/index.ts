import { PreferenceData, DailyPreferenceData, ScheduleData, ShiftData, UserData, VacationData, RemarkData } from './dto';
import { IRequest, IResponse } from './http.interface';
import { IPreferenceController } from './controllers.interface';
import { IPreferenceService } from './services.interface';
import { IShiftController } from './controllers.interface';
import { IShiftService } from './services.interface';
import { IVacationController } from './controllers.interface';
import { IVacationService } from './services.interface';
import { IUserController } from './controllers.interface';
import { IUserService } from './services.interface';
import { IScheduleController } from './controllers.interface';
import { IScheduleService } from './services.interface';
import { IShiftRepository } from '../interfaces/repos.interface';
import { IScheduleRepository } from '../interfaces/repos.interface';
import { IPreferenceRepository } from '../interfaces/repos.interface';
import { IVacationRepository } from '../interfaces/repos.interface';
import { IUserRepository } from '../interfaces/repos.interface';
import { IDatabase } from './db.interface';
import { IAuthController } from './controllers.interface';
import { Remark } from '../models/schedule.model';

export interface IRemarkRepository {
	create(remark: Remark): Promise<number>;
	getOne(id: number): Promise<Remark | null>;
	getMany(): Promise<Remark[]>;
	getByScheduleId(scheduleId: number): Promise<Remark[]>;
	update(remark: Remark): Promise<number>;
	delete(id: number): Promise<number>;
	deleteByScheduleId(scheduleId: number): Promise<number>;
}

export {
	IRequest,
	IResponse,
	IPreferenceController,
	IPreferenceService,
	IShiftController,
	IShiftService,
	IVacationController,
	IVacationService,
	IUserController,
	IUserService,
	IScheduleController,
	IScheduleService,
	IShiftRepository,
	IScheduleRepository,
	IPreferenceRepository,
	IVacationRepository,
	IUserRepository,
	PreferenceData,
	DailyPreferenceData,
	ScheduleData,
	RemarkData,
	ShiftData,
	UserData,
	Remark,
	VacationData,
	IDatabase,
	IAuthController
}
