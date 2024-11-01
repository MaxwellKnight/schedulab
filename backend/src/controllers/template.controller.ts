import { TemplateScheduleData } from "../interfaces/dto";
import { Response, Request } from "express";
import { TemplateService } from "../services";

export class TemplateController {
	private service: TemplateService;

	constructor(service: TemplateService) {
		this.service = service;
	}

	public create = async (req: Request, res: Response): Promise<void> => {
		const template: Omit<TemplateScheduleData, "id" | "created_at"> = req.body;
		try {
			const id = await this.service.create(template);
			res.json({ message: "Template schedule created", id });
		} catch (err) {
			res.status(400);
			res.json({ error: "Failed to create template schedule" });
			console.log(err);
		}
	}

	public getOne = async (req: Request, res: Response): Promise<void> => {
		const id = req.params.id;
		const template = await this.service.getOne(Number(id));
		if (template) {
			res.json(template);
		} else {
			res.status(404);
			res.json({ error: "Template schedule not found" });
		}
	}

	public getMany = async (req: Request, res: Response): Promise<void> => {
		const templates = await this.service.getMany();
		if (templates.length > 0) {
			res.json(templates);
		} else {
			res.status(404);
			res.json({ error: "No template schedules exist" });
		}
	}

	public getByTeamId = async (req: Request, res: Response): Promise<void> => {
		const teamId = req.params.teamId;
		const templates = await this.service.getByTeamId(Number(teamId));
		if (templates.length > 0) {
			res.json(templates);
		} else {
			res.status(404);
			res.json({ error: "No template schedules found for this team" });
		}
	}

	public update = async (req: Request, res: Response): Promise<void> => {
		const { id, ...rest }: TemplateScheduleData = req.body;
		const template = await this.service.getOne(id!);
		if (!template) {
			res.status(404);
			res.json({ error: "Template schedule not found" });
			return;
		}
		const result = await this.service.update({ ...template, ...rest });
		if (!result) {
			res.status(400);
			res.json({ error: "Could not update template schedule" });
			return;
		}
		res.json({ message: "Template schedule updated", id });
	}

	public delete = async (req: Request, res: Response): Promise<void> => {
		const id = req.params.id;
		await this.service.delete(Number(id));
		res.json({ message: "Template schedule deleted", id: id });
	}

	public createScheduleFromTemplate = async (req: Request, res: Response): Promise<void> => {
		const templateId = Number(req.params.id);
		const { startDate } = req.body;
		try {
			const scheduleId = await this.service.createScheduleFromTemplate(templateId, new Date(startDate));
			res.json({ message: "Schedule created from template", scheduleId });
		} catch (err) {
			res.status(400);
			res.json({ error: "Failed to create schedule from template" });
		}
	}
}
