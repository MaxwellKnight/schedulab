import { ShiftData } from "../interfaces/dto";
import { IRequest, IResponse } from "../interfaces/http.interface";
import { ShiftService } from "../services";


export class ShiftController {

	private service: ShiftService;
	constructor(service: ShiftService) {
		this.service = service;
	}

	public create = async (req: IRequest, res: IResponse): Promise<void> => {
		const shift = req.body;
		try {
			const id = await this.service.create(shift);
			res.json({ message: "Shift created", id });
		} catch (error) {
			res.status(400);
			res.json({ error: "Shift already exist" });
		}
	}

	public getOne = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const shift = await this.service.getOne(Number(id));
		if (shift) {
			res.json(shift);
		} else {
			res.status(404);
			res.json({ error: "Shift not found" });
		}

	}
	public getMany = async (req: IRequest, res: IResponse): Promise<void> => {
		const shifts = await this.service.getMany();
		if (shifts.length > 0) {
			res.json(shifts);
		} else {
			res.status(404);
			res.json({ error: "No shifts exist" });
		}
	}

	public getByDate = async (req: IRequest, res: IResponse): Promise<void> => {
		const date = req.params.date;
		const shifts = await this.service.getByDate(new Date(date));

		if (shifts.length > 0) {
			res.json(shifts);
		} else {
			res.status(404);
			res.json({ error: "Shift not found" });
		}
	}

	public getByName = async (req: IRequest, res: IResponse): Promise<void> => {
		const name = req.params.name;
		const shifts = await this.service.getByName(name);

		if (shifts.length > 0) {
			res.json(shifts);
		} else {
			res.status(404)
			res.json({ error: "Shift not found" });
		}
	}

	public getByUserId = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const shifts = await this.service.getByUserId(Number(id));

		if (shifts.length > 0) {
			res.json(shifts);
		} else {
			res.status(404);
			res.json({ error: "Shift not found" });
		}
	}

	public getByScheduleId = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const shifts = await this.service.getByScheduleId(Number(id));

		if (shifts.length > 0) {
			res.json(shifts);
		} else {
			res.status(404);
			res.json({ error: "Shift not found" });
		}
	}

	public getTypes = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const shift_types = await this.service.getTypes(Number(id));

		if (shift_types.length > 0) {
			res.json(shift_types);
		} else {
			res.status(404);
			res.json({ error: "Types not found" });
		}
	}


	public update = async (req: IRequest, res: IResponse): Promise<void> => {
		const { id, ...rest }: ShiftData = req.body;
		const shift = this.service.getOne(id);
		if (!shift) {
			res.status(404);
			res.json({ error: "Shift not found" });
			return;
		}

		const result = await this.service.update({ id, ...shift, ...rest });
		if (result === 0) {
			res.status(404);
			res.json({ error: "Could not update user" });
		}
		else
			res.json({ message: "shift updated", id });
	}

	public delete = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const result = await this.service.delete(Number(id));
		if (result !== 0) {
			res.json({ message: "Shift deleted", id: id });
		}
		else {
			res.status(404);
			res.json({ error: "Shift not found" });
		}
	}
}
