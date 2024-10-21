import { IRequest, IResponse } from "./http.interface";

type ControllerFunction = (req: IRequest, res: IResponse) => Promise<void>;

export interface Controller {
	constructor: Function;
}

export interface IAuthController extends Controller {
	login: ControllerFunction;
	logout: ControllerFunction;
	authenticate: ControllerFunction;
}

export interface EntityController extends Controller {
	create: ControllerFunction;
	getOne: ControllerFunction;
	getMany: ControllerFunction;
	update: ControllerFunction;
	delete: ControllerFunction;
}

export interface IUserController extends EntityController {
	getByShiftId: ControllerFunction;
}

export interface IVacationController extends EntityController {
	getByDates: ControllerFunction;
	getByDate: ControllerFunction;
	getByUserId: ControllerFunction;
}

export interface IPreferenceController extends EntityController {
	getByDates: ControllerFunction;
	getByUserId: ControllerFunction;
}

export interface IShiftController extends EntityController {
	getByDate: ControllerFunction;
	getByName: ControllerFunction;
	getByUserId: ControllerFunction;
	getByScheduleId: ControllerFunction;
}

export interface IScheduleController extends EntityController {
	getByDates: ControllerFunction;
	getByUserId: ControllerFunction;
}

export interface ITemplateController extends EntityController {
	getByTeamId: ControllerFunction;
	createScheduleFromTemplate: ControllerFunction;
}
