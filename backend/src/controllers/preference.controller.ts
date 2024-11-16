import { Response, Request } from "express";
import { PreferenceTemplateService } from "../services";
import { PreferenceTemplateData } from "../interfaces/dto/preferences.dto";

export class PreferenceTemplateController {
	private service: PreferenceTemplateService;

	constructor(service: PreferenceTemplateService) {
		this.service = service;
	}

	public create = async (req: Request, res: Response): Promise<void> => {
		try {
			const template: Omit<PreferenceTemplateData, 'id' | 'created_at' | 'updated_at' | 'time_slots'> = req.body;
			const result = await this.service.create(template, req.user!.id);
			res.json({ message: "Preference template created", id: result });
		} catch (error: any) {
			if (error.message === 'User does not have access to this team') {
				res.status(403).json({ error: "User does not have access to this team" });
			} else {
				res.status(400).json({ error: "Failed to create preference template" });
			}
		}
	}

	public getOne = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = Number(req.params.id);
			const template = await this.service.getOne(id, req.user!.id);

			if (template) {
				res.json(template);
			} else {
				res.status(404).json({ error: "Preference template not found" });
			}
		} catch (error) {
			res.status(500).json({ error: "Failed to retrieve preference template" });
		}
	}

	public getMany = async (req: Request, res: Response): Promise<void> => {
		try {
			const templates = await this.service.getMany(req.user!.id);
			if (templates.length > 0) {
				res.json(templates);
			} else {
				res.status(404).json({ error: "No preference templates exist" });
			}
		} catch (error) {
			res.status(500).json({ error: "Failed to retrieve preference templates" });
		}
	}

	public getByDates = async (req: Request, res: Response): Promise<void> => {
		try {
			const { start_date, end_date } = req.params;
			const templates = await this.service.getByDates(
				new Date(start_date),
				new Date(end_date),
				req.user!.id
			);

			if (templates.length > 0) {
				res.json(templates);
			} else {
				res.status(404).json({ error: "No preference templates found for given dates" });
			}
		} catch (error) {
			res.status(500).json({ error: "Failed to retrieve preference templates" });
		}
	}

	public getByTeamId = async (req: Request, res: Response): Promise<void> => {
		try {
			const teamId = Number(req.params.teamId);
			const templates = await this.service.getByTeamId(teamId, req.user!.id);

			if (templates.length > 0) {
				res.json(templates);
			} else {
				res.status(404).json({ error: "No preference templates found for team" });
			}
		} catch (error: any) {
			if (error.message === 'User does not have access to this team') {
				res.status(403).json({ error: "User does not have access to this team" });
			} else {
				res.status(500).json({ error: "Failed to retrieve team preference templates" });
			}
		}
	}

	public update = async (req: Request, res: Response): Promise<void> => {
		try {
			const { id, ...rest }: Partial<PreferenceTemplateData> & { id: number } = req.body;
			const template = await this.service.getOne(id, req.user!.id);

			if (!template) {
				res.status(404).json({ error: "Preference template not found" });
				return;
			}

			const result = await this.service.update({ id, ...rest }, req.user!.id);
			if (result === 0) {
				res.status(400).json({ error: "Failed to update preference template" });
			} else {
				res.json({ message: "Preference template updated", id });
			}
		} catch (error) {
			res.status(500).json({ error: "Failed to update preference template" });
		}
	}

	public delete = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = Number(req.params.id);
			const result = await this.service.delete(id, req.user!.id);

			if (result !== 0) {
				res.json({ message: "Preference template deleted", id });
			} else {
				res.status(404).json({ error: "Preference template not found" });
			}
		} catch (error) {
			res.status(500).json({ error: "Failed to delete preference template" });
		}
	}

	public publish = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = Number(req.params.id);
			await this.service.publish(id, req.user!.id);

			res.json({ message: "Preference template published", id });
		} catch (error: any) {
			if (error.message === 'Template not found or access denied') {
				res.status(404).json({ error: "Template not found or access denied" });
			} else if (error.message === 'Only draft templates can be published') {
				res.status(400).json({ error: "Only draft templates can be published" });
			} else {
				res.status(500).json({ error: "Failed to publish template" });
			}
		}
	}

	public close = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = Number(req.params.id);
			await this.service.close(id, req.user!.id);

			res.json({ message: "Preference template closed", id });
		} catch (error: any) {
			if (error.message === 'Template not found or access denied') {
				res.status(404).json({ error: "Template not found or access denied" });
			} else if (error.message === 'Only published templates can be closed') {
				res.status(400).json({ error: "Only published templates can be closed" });
			} else {
				res.status(500).json({ error: "Failed to close template" });
			}
		}
	}
}
