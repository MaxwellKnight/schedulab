import { ScheduleData } from "../interfaces/dto";
import { IRequest, IResponse } from "../interfaces/http.interface";
import { ScheduleService } from "../services";

export class ScheduleController {

	private service: ScheduleService;
	constructor(service: ScheduleService) {
		this.service = service;
	}

	public create = async (req: IRequest, res: IResponse): Promise<void> => {
		const schedule: ScheduleData = req.body;
		try {
			const id = await this.service.create(schedule);
			res.json({ message: "schedule created", id });
		} catch (err) {
			res.status(400);
			res.json({ error: "schedule already exist" });
		}
	}

	public getOne = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const schedules = await this.service.getOne(Number(id));
		if (schedules) {
			res.json(schedules);
		} else {
			res.status(404);
			res.json({ errror: "schedule not found" });
		}
	}

	public getMany = async (req: IRequest, res: IResponse): Promise<void> => {
		const schedules = await this.service.getMany();
		if (schedules.length > 0) {
			res.json(schedules);
		} else {
			res.status(404);
			res.json({ errror: "No schedules exist" });
		}
	}

	public getByDates = async (req: IRequest, res: IResponse): Promise<void> => {
		const { start_date, end_date } = req.params;
		const schedules = await this.service.getByDates(new Date(start_date), new Date(end_date));

		if (schedules.length > 0) {
			res.json(schedules);
		} else {
			res.status(404);
			res.json({ errror: "schedule not found" });
		}
	}


	public getByUserId = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const schedules = await this.service.getByUserId(Number(id));

		if (schedules.length > 0) {
			res.json(schedules);
		} else {
			res.status(404);
			res.json({ errror: "schedule not found" });
		}
	}


	public update = async (req: IRequest, res: IResponse): Promise<void> => {
		const { id, ...rest }: ScheduleData = req.body;
		const schedule = await this.service.getOne(id);
		if (!schedule) {
			res.status(404);
			res.json({ errror: "schedule not found" });
			return;
		}

		const result = await this.service.update({ ...schedule, ...rest });
		if (!result) {
			res.status(400);
			res.json({ error: "could not update schedule" });
			return;
		}
		res.json({ message: "schedule updated", id });
	}

	public delete = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		await this.service.delete(Number(id));
		res.json({ message: "schedule deleted", id: id });
	}
}
