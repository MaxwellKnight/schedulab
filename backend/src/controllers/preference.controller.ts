import { Response, Request } from "express";
import { PreferenceService } from "../services";

export class PreferenceController {
	private service: PreferenceService;

	constructor(service: PreferenceService) {
		this.service = service;
	}

	private handleError(res: Response, error: Error | unknown) {
		if (error instanceof Error) {
			const errorMessage = error.message;

			switch (errorMessage) {
				// Access and permission errors - 403
				case 'User does not have access to this team':
				case 'User does not have access to this template':
				case 'Cannot create preferences for other users':
				case 'Cannot update preferences of other users':
				case 'Cannot delete preferences of other users':
					res.status(403).json({ error: errorMessage });
					break;

				// Not found errors - 404
				case 'Template not found':
				case 'Template not found or access denied':
				case 'Time slot not found':
				case 'Time range not found':
				case 'Preference not found':
					res.status(404).json({ error: errorMessage });
					break;

				// Validation/Business logic errors - 400
				case 'Only draft templates can be published':
				case 'Only published templates can be closed':
				case 'Template must have at least one time slot before publishing':
				case 'Invalid date range':
				case 'End date must be after start date':
				case 'Time range must be valid':
					res.status(400).json({ error: errorMessage });
					break;

				// All other errors - 500
				default:
					console.error('Unhandled error:', error);
					res.status(500).json({ error: "Internal server error" });
					break;
			}
		} else {
			console.error('Unknown error:', error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	public create = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = await this.service.createTemplate(req.body, req.user!.id);
			res.status(201).json({ message: "Template created successfully", id });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public getOne = async (req: Request, res: Response): Promise<void> => {
		try {
			const template = await this.service.getTemplate(Number(req.params.id), req.user!.id);
			if (!template) {
				res.status(404).json({ error: "Template not found" });
				return;
			}
			res.json(template);
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public getMany = async (req: Request, res: Response): Promise<void> => {
		try {
			const templates = await this.service.getTemplates(req.user!.id);
			res.json(templates);
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public getTimeRangesByTeam = async (req: Request, res: Response): Promise<void> => {
		try {
			const ranges = await this.service.getTimeRangesByTeam(
				Number(req.params.teamId),
				req.user!.id
			);
			res.json(ranges);
		} catch (error) {
			this.handleError(res, error);
		}
	};

	public getByDates = async (req: Request, res: Response): Promise<void> => {
		try {
			const startDate = req.query.start_date as string;
			const endDate = req.query.end_date as string;

			if (!startDate || !endDate) {
				res.status(400).json({ error: "Start and end dates are required" });
				return;
			}

			const templates = await this.service.getTemplatesByDateRange(
				new Date(startDate),
				new Date(endDate),
				req.user!.id
			);
			res.json(templates);
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public getByTeamId = async (req: Request, res: Response): Promise<void> => {
		try {
			const templates = await this.service.getTemplatesByTeam(
				Number(req.params.teamId),
				req.user!.id
			);
			res.json(templates);
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public update = async (req: Request, res: Response): Promise<void> => {
		try {
			const templateId = Number(req.params.id);
			await this.service.updateTemplate({
				id: templateId,
				...req.body
			}, req.user!.id);
			res.json({ message: "Template updated successfully" });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public delete = async (req: Request, res: Response): Promise<void> => {
		try {
			await this.service.deleteTemplate(Number(req.params.id), req.user!.id);
			res.json({ message: "Template deleted successfully" });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public createTimeRange = async (req: Request, res: Response): Promise<void> => {
		try {
			const templateId = Number(req.params.templateId);
			const id = await this.service.createTimeRange({
				...req.body,
				preference_id: templateId
			}, req.user!.id);
			res.status(201).json({ message: "Time range created successfully", id, range: req.body });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public updateTimeRange = async (req: Request, res: Response): Promise<void> => {
		try {
			const rangeId = Number(req.params.rangeId);
			await this.service.updateTimeRange({
				id: rangeId,
				...req.body
			}, req.user!.id);
			res.json({ message: "Time range updated successfully" });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public deleteTimeRange = async (req: Request, res: Response): Promise<void> => {
		try {
			const rangeId = Number(req.params.rangeId);
			await this.service.deleteTimeRange(rangeId, req.user!.id);
			res.json({ message: "Time range deleted successfully" });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public createTimeSlot = async (req: Request, res: Response): Promise<void> => {
		try {
			const templateId = Number(req.params.templateId);
			const id = await this.service.createTimeSlot({
				...req.body,
				template_id: templateId
			}, req.user!.id);
			res.status(201).json({ message: "Time slot created successfully", id });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public createBulkTimeSlots = async (req: Request, res: Response): Promise<void> => {
		try {
			const templateId = Number(req.params.templateId);
			const slots = req.body.slots.map((slot: Record<string, unknown>) => ({
				...slot,
				template_id: templateId
			}));

			await this.service.createBulkTimeSlots(slots, req.user!.id);
			res.status(201).json({ message: "Time slots created successfully" });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public updateTimeSlot = async (req: Request, res: Response): Promise<void> => {
		try {
			const slotId = Number(req.params.slotId);
			await this.service.updateTimeSlot({
				id: slotId,
				...req.body
			}, req.user!.id);
			res.json({ message: "Time slot updated successfully" });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public deleteTimeSlot = async (req: Request, res: Response): Promise<void> => {
		try {
			const slotId = Number(req.params.slotId);
			await this.service.deleteTimeSlot(slotId, req.user!.id);
			res.json({ message: "Time slot deleted successfully" });
		} catch (error) {
			this.handleError(res, error);
		}
	}
}
