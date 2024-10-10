import { UserData } from "../interfaces/dto";
import { IUserService } from "../interfaces/services.interface";
import { IUserController } from "../interfaces/controllers.interface";
import { IResponse, IRequest } from "../interfaces/http.interface";

export class UserController implements IUserController{

	private service: IUserService;
	constructor(service: IUserService) {
		this.service = service;
	}

	public create = async (req: IRequest, res: IResponse): Promise<void> => {
		const user = req.body.data;
		try{
			const id = await this.service.create(user);
			res.json({ message: "User created", id });
		}catch(error) {
			res.status(400);
			res.json({ message: "User already exist" });
		}
	}

	public getOne = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const users: any = await this.service.getOne(Number(id));
		if(users && users.id !== null) {
			res.json(users);
		} else {
			res.status(404)
				.json({ error: "User not found" });
		}
	}

	public getMany = async (req: IRequest, res: IResponse): Promise<void> => {
		const users = await this.service.getMany();
		if(users.length > 0) {
			res.json(users);
		} else {
			res.status(404);
			res.json({ error: "No users exist" });
		}
	}

	public getByShiftId = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const users = await this.service.getByShiftId(Number(id));
		if(users.length > 0) {
			res.json(users);
		} else {
			res.status(404);
			res.json({ error: "User not found" });
		}
	}

	public update = async (req: IRequest, res: IResponse): Promise<void> => {
		const userData: UserData = req.body;
		const user = await this.service.getOne(userData.id);
		if(!user) {
			res.status(404);
			res.json({ error: "User not found" });
			return;
		}

		const result = await this.service.update({ ...user, ...userData});
		if(result === 0) {
			res.status(404);
			res.json({ error: "Could not update user" });
		}
		else res.json({ message: "User updated", id: user.id });
	}

	public delete = async (req: IRequest, res: IResponse): Promise<void> => {
		const id = req.params.id;
		const result = await this.service.delete(Number(id));
		if(result === 0) {
			res.status(404);
			res.json({ error: "User not found" });
		}else 
			res.json({ message: "User deleted", id: id });
	}
}