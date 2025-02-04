import { Response, Request } from "express";
import { PreferenceSubmissionService } from "../services";

export class PreferenceSubmissionController {
	private service: PreferenceSubmissionService;

	constructor(service: PreferenceSubmissionService) {
		this.service = service;
	}

	private handleError(res: Response, error: Error | unknown) {
		if (error instanceof Error) {
			const errorMessage = error.message;

			switch (errorMessage) {
				// Access and permission errors - 403
				case 'User does not have access to this template':
				case 'User does not have access to this team':
				case 'Cannot create submissions for other users':
				case 'Cannot update submissions of other users':
				case 'Cannot delete submissions of other users':
					res.status(403).json({ error: errorMessage });
					break;

				// Not found errors - 404
				case 'Submission not found':
				case 'Submission not found or unauthorized':
				case 'Template not found':
					res.status(404).json({ error: errorMessage });
					break;

				// Validation/Business logic errors - 400
				case 'Submissions are only allowed for published templates':
				case 'Updates are only allowed for published templates':
				case 'Deletions are only allowed for published templates':
				case 'Invalid preference level':
				case 'Preference slots must be from the same template':
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

	// Create a new preference submission
	public create = async (req: Request, res: Response): Promise<void> => {
		try {
			const templateId = Number(req.params.templateId);
			const id = await this.service.createSubmission(
				{
					...req.body,
					template_id: templateId
				},
				req.body.slots,
				req.user!.id
			);
			res.status(201).json({
				message: "Preference submission created successfully",
				id
			});
		} catch (error) {
			this.handleError(res, error);
		}
	}

	// Update an existing preference submission
	public update = async (req: Request, res: Response): Promise<void> => {
		try {
			const submissionId = Number(req.params.id);
			await this.service.updateSubmission(
				{
					id: submissionId,
					...req.body
				},
				req.body.slots,
				req.user!.id
			);
			res.json({ message: "Preference submission updated successfully" });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	// Delete a preference submission
	public delete = async (req: Request, res: Response): Promise<void> => {
		try {
			const submissionId = Number(req.params.id);
			await this.service.deleteSubmission(submissionId, req.user!.id);
			res.json({ message: "Preference submission deleted successfully" });
		} catch (error) {
			this.handleError(res, error);
		}
	}

	// Get a single submission by ID
	public getOne = async (req: Request, res: Response): Promise<void> => {
		try {
			const submissionId = Number(req.params.id);
			const submission = await this.service.getSubmissionDetails(submissionId, req.user!.id);

			if (!submission) {
				res.status(404).json({ error: "Submission not found" });
				return;
			}

			res.json(submission);
		} catch (error) {
			this.handleError(res, error);
		}
	}

	// Get submissions for a specific template
	public getByTemplate = async (req: Request, res: Response): Promise<void> => {
		try {
			const templateId = Number(req.body.templateId);
			const submissions = await this.service.getSubmissionsByTemplate(templateId, req.user!.id);
			res.json(submissions);
		} catch (error) {
			this.handleError(res, error);
		}
	}

	// Get user's submission for a specific template
	public getUserSubmissionForTemplate = async (req: Request, res: Response): Promise<void> => {
		try {
			const templateId = Number(req.body.templateId);
			const submission = await this.service.getUserSubmissionForTemplate(templateId, req.user!.id);

			if (!submission) {
				res.status(404).json({ error: "No submission found for this template" });
				return;
			}

			res.json(submission);
		} catch (error) {
			this.handleError(res, error);
		}
	}

	public getByTeam = async (req: Request, res: Response): Promise<void> => {
		try {
			const teamId = Number(req.params.teamId);
			const submissions = await this.service.getSubmissionsByTeam(teamId, req.user!.id);
			console.log(submissions);
			res.json(submissions);
		} catch (error) {
			this.handleError(res, error);
		}
	}
}

export default PreferenceSubmissionController;
