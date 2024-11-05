import { TeamData } from "../interfaces/dto";
import { TeamService } from "../services";
import { Request, Response } from "express";

export class TeamController {
	private service: TeamService;

	constructor(service: TeamService) {
		this.service = service;
	}

	public create = async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.user?.id) {
				res.status(400).json({ message: "User is missing from request" });
				return;
			}

			const teamData = {
				...req.body,
				creator_id: req.user.id
			};

			const id = await this.service.create(teamData);
			res.status(201).json({ message: "Team created", id });
		} catch (error) {
			console.error(error);
			res.status(400).json({ message: "Failed to create team" });
		}
	};

	public getOne = async (req: Request, res: Response): Promise<void> => {
		if (!req.user?.id) {
			res.status(400).json({ message: "User is missing from request" });
			return;
		}

		const id = req.params.id;
		const team = await this.service.getOne(Number(id), req.user.id);

		if (team) {
			res.json(team);
		} else {
			res.status(404).json({ error: "Team not found" });
		}
	}

	public getMany = async (req: Request, res: Response): Promise<void> => {
		if (!req.user?.id) {
			res.status(400).json({ message: "User is missing from request" });
			return;
		}

		const teams = await this.service.getMany(req.user.id);

		if (teams.length > 0) {
			res.json(teams);
		} else {
			res.status(404).json({ error: "No teams found" });
		}
	}

	public getByCode = async (req: Request, res: Response): Promise<void> => {
		const teamCode = req.params.code;
		const team = await this.service.getByTeamCode(teamCode);

		if (team) {
			res.json(team);
		} else {
			res.status(404).json({ error: "Team not found" });
		}
	}

	public update = async (req: Request, res: Response): Promise<void> => {
		if (!req.user?.id) {
			res.status(400).json({ message: "User is missing from request" });
			return;
		}

		const teamData: TeamData = req.body;
		const team = await this.service.getOne(teamData.id, req.user.id);

		if (!team) {
			res.status(404).json({ error: "Team not found" });
			return;
		}

		try {
			const result = await this.service.update(teamData, req.user.id);
			if (result === 0) {
				res.status(404).json({ error: "Could not update team" });
			} else {
				res.json({ message: "Team updated", id: team.id });
			}
		} catch (error) {
			res.status(400).json({ message: "Failed to update team" });
		}
	}

	public delete = async (req: Request, res: Response): Promise<void> => {
		if (!req.user?.id) {
			res.status(400).json({ message: "User is missing from request" });
			return;
		}

		const id = req.params.id;

		try {
			const result = await this.service.delete(Number(id), req.user.id);
			if (result === 0) {
				res.status(404).json({ error: "Team not found" });
			} else {
				res.json({ message: "Team deleted", id });
			}
		} catch (error) {
			res.status(403).json({ message: "Unauthorized to delete team" });
		}
	}

	public joinTeam = async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.user?.id) {
				res.status(400).json({ message: "User is missing from request" });
				return;
			}

			const { teamCode } = req.body;

			// First get the team by code
			const team = await this.service.getByTeamCode(teamCode);

			if (!team) {
				res.status(404).json({ error: "Invalid team code" });
				return;
			}

			// Try to add the user as a member
			const result = await this.service.addMember(team.id, req.user.id);

			if (result) {
				res.json({
					message: "Successfully joined team",
					team: {
						id: team.id,
						name: team.name
					}
				});
			} else {
				res.status(400).json({ message: "Failed to join team - you may already be a member" });
			}
		} catch (error) {
			console.error(error);
			// Only send response if one hasn't been sent yet
			if (!res.headersSent) {
				res.status(400).json({ message: "Failed to join team" });
			}
		}
	};

	// Modify addMember to require admin rights
	public addMember = async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.user?.id) {
				res.status(400).json({ message: "User is missing from request" });
				return;
			}

			const teamId = Number(req.params.id);
			const { userId } = req.body;

			// Check if user is admin
			const userRole = await this.service.getMemberRole(teamId, req.user.id);
			if (userRole !== 'admin') {
				res.status(403).json({ message: "Only team admins can add members directly" });
				return;
			}

			const result = await this.service.addMember(teamId, userId);
			if (result) {
				res.json({ message: "Member added successfully" });
			} else {
				res.status(400).json({ message: "Failed to add member" });
			}
		} catch (error) {
			// Only send response if one hasn't been sent yet
			if (!res.headersSent) {
				res.status(400).json({ message: "Failed to add member" });
			}
		}
	};

	public removeMember = async (req: Request, res: Response): Promise<void> => {
		if (!req.user?.id) {
			res.status(400).json({ message: "User is missing from request" });
			return;
		}

		const teamId = Number(req.params.id);
		const userId = Number(req.params.userId);

		try {
			const result = await this.service.removeMember(teamId, userId, req.user.id);
			if (result) {
				res.json({ message: "Member removed successfully" });
			} else {
				res.status(400).json({ message: "Failed to remove member" });
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes('Unauthorized')) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(400).json({ message: "Failed to remove member" });
			}
		}
	}

	public addRole = async (req: Request, res: Response): Promise<void> => {
		if (!req.user?.id) {
			res.status(400).json({ message: "User is missing from request" });
			return;
		}

		const teamId = Number(req.params.id);
		const { roleName } = req.body;

		try {
			const roleId = await this.service.addRole(teamId, roleName, req.user.id);
			if (roleId) {
				res.json({ message: "Role added successfully", id: roleId });
			} else {
				res.status(400).json({ message: "Failed to add role" });
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes('Unauthorized')) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(400).json({ message: "Failed to add role" });
			}
		}
	}

	public deleteRole = async (req: Request, res: Response): Promise<void> => {
		if (!req.user?.id) {
			res.status(400).json({ message: "User is missing from request" });
			return;
		}

		const teamId = Number(req.params.id);
		const roleId = Number(req.params.roleId);

		try {
			const result = await this.service.deleteRole(teamId, roleId, req.user.id);
			if (result) {
				res.json({ message: "Role deleted successfully" });
			} else {
				res.status(400).json({ message: "Failed to delete role" });
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes('Unauthorized')) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(400).json({ message: "Failed to delete role" });
			}
		}
	}

	public setMemberRole = async (req: Request, res: Response): Promise<void> => {
		if (!req.user?.id) {
			res.status(400).json({ message: "User is missing from request" });
			return;
		}

		const teamId = Number(req.params.id);
		const userId = Number(req.params.userId);
		const { roleName } = req.body;

		try {
			const result = await this.service.setMemberRole(teamId, userId, roleName, req.user.id);
			if (result) {
				res.json({ message: "Member role updated successfully" });
			} else {
				res.status(400).json({ message: "Failed to update member role" });
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes('Unauthorized')) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(400).json({ message: "Failed to update member role" });
			}
		}
	}

	public getRoles = async (req: Request, res: Response): Promise<void> => {
		const teamId = Number(req.params.id);

		try {
			const roles = await this.service.getRoles(teamId);
			if (roles.length > 0) {
				res.json(roles);
			} else {
				res.status(404).json({ error: "No roles found" });
			}
		} catch (error) {
			res.status(400).json({ message: "Failed to fetch roles" });
		}
	}
}
