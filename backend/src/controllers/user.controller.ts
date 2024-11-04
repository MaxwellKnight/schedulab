import { UserData } from "../interfaces/dto";
import { UserService } from "../services";
import { Request, Response } from "express";

export class UserController {

	private service: UserService;
	constructor(service: UserService) {
		this.service = service;
	}

	public create = async (req: Request, res: Response): Promise<void> => {
		const user = req.body.user;
		try {
			const id = await this.service.create(user);
			res.json({ message: "User created", id });
		} catch (error) {
			console.log(error);
			res.status(400);
			res.json({ message: "User already exist" });
		}
	}

	public getOne = async (req: Request, res: Response): Promise<void> => {
		const id = req.params.id;
		const { password, ...user }: any = await this.service.getOne(Number(id));
		if (user && user.id !== null) {
			res.json(user);
		} else {
			res.status(404)
				.json({ error: "User not found" });
		}
	}

	public getMany = async (req: Request, res: Response): Promise<void> => {
		const users = await this.service.getMany();
		if (users.length > 0) {
			res.json(users);
		} else {
			res.status(404);
			res.json({ error: "No users exist" });
		}
	}

	public getTeams = async (req: Request, res: Response): Promise<void> => {
		if (!req.user?.id) {
			res.status(400).json({ message: "user is missing from request" });
			return;
		}

		const teams = await this.service.getTeams(req.user!.id);
		if (teams.length > 0) {
			res.json(teams);
		} else {
			res.status(404);
			res.json({ error: "No teams exist" });
		}
	}

	public getByShiftId = async (req: Request, res: Response): Promise<void> => {
		const id = req.params.id;
		const users = await this.service.getByShiftId(Number(id));
		if (users.length > 0) {
			res.json(users);
		} else {
			res.status(404);
			res.json({ error: "User not found" });
		}
	}

	public getByTeamId = async (req: Request, res: Response): Promise<void> => {
		const team_id = req.params.team_id;
		const users = await this.service.getByTeamId(Number(team_id));
		if (users.length > 0) {
			res.json(users);
		} else {
			res.status(404);
			res.json({ error: "User not found" });
		}
	}

	public update = async (req: Request, res: Response): Promise<void> => {
		const userData: UserData = req.body;
		const user = await this.service.getOne(userData.id);
		if (!user) {
			res.status(404);
			res.json({ error: "User not found" });
			return;
		}

		const result = await this.service.update({ ...user, ...userData });
		if (result === 0) {
			res.status(404);
			res.json({ error: "Could not update user" });
		}
		else res.json({ message: "User updated", id: user.id });
	}

	public delete = async (req: Request, res: Response): Promise<void> => {
		const id = req.params.id;
		const result = await this.service.delete(Number(id));
		if (result === 0) {
			res.status(404);
			res.json({ error: "User not found" });
		} else
			res.json({ message: "User deleted", id: id });
	}
}
