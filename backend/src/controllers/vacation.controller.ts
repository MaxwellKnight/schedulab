import { Vacation } from "../models";
import { IRequest, IResponse } from "../interfaces/http.interface";
import { VacationService } from "../services";

export class VacationController {

	private service: VacationService;
	constructor(service: VacationService) {
		this.service = service;
	}

	public create = async (req: IRequest, res: IResponse): Promise<void> => {
		const vacation = req.body;
		try {
			const result = await this.service.create(vacation);
			res.json({ message: "vacation created", id: result });
		} catch (error) {
			res.status(400);
			res.json({ error: "vacation already exist" });
		}
	}

	public getOne = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const vacations = await this.service.getOne(Number(id));
		if (vacations) {
			res.json(vacations);
		} else {
			res.status(404);
			res.json({ error: "vacation not found" });
		}
	}

	public getMany = async (_: IRequest, res: IResponse): Promise<void> => {
		const vacations = await this.service.getMany();
		if (vacations.length > 0) {
			res.json(vacations);
		} else {
			res.status(404);
			res.json({ error: "vacation not found" });
		}
	}

	public getByDates = async (req: IRequest, res: IResponse): Promise<void> => {
		const { start_date, end_date } = req.params;
		const vacations = await this.service.getByDates(new Date(start_date), new Date(end_date));
		if (vacations.length > 0) {
			res.json(vacations);
		} else {
			res.status(404);
			res.json({ error: "vacation not found" });
		}
		res.json(vacations);
	}

	public getByDate = async (req: IRequest, res: IResponse): Promise<void> => {
		const date = req.params.date;
		const vacations = await this.service.getByDate(new Date(date));
		if (vacations.length > 0) {
			res.json(vacations);
		} else {
			res.status(404);
			res.json({ error: "vacation not found" });
		}
	}

	public getByUserId = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const vacations = await this.service.getByUserId(Number(id));
		if (vacations.length > 0) {
			res.json(vacations);
		} else {
			res.status(404);
			res.json({ error: "vacation not found" });
		}
	}


	public update = async (req: IRequest, res: IResponse): Promise<void> => {
		const vacation: Vacation = req.body;
		const vac = await this.service.getOne(vacation.id);
		if (!vac) {
			res.status(404);
			res.json({ error: "vacation not found" });
			return;
		}
		const result = await this.service.update({ ...vac, ...vacation });
		if (result === 0) {
			res.status(404);
			res.json({ error: "vacation not found" });
		}
		else res.json({ message: "vacation updated", id: result });
	}

	public delete = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const result = await this.service.delete(Number(id));
		if (result === 0) {
			res.status(404);
			res.json({ error: "vacation not found" });
		}
		else res.json({ message: "vacation deleted", id: id });
	}
}
