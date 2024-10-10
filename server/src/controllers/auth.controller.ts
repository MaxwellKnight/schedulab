import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { IAuthController, IRequest, IResponse, IUserService } from "../interfaces";

dotenv.config();

export class AuthController implements IAuthController {
	private readonly service: IUserService;
	private readonly salt: number;

	constructor(service: IUserService) {
		this.service = service;
		this.salt = 12;
	}

	public login = async (req: IRequest, res: IResponse) => {
		const { email, password } = req.body;
		if (!email || !password)
			return res.status(400).json({ message: 'Email and password are required' });

		const user = await this.service.getByEmail(email);
		if (!user)
			return res.status(401).json({ message: 'Incorrect email or password' });

		const result = await new Promise<boolean>((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, result) => {
				if (err) reject(err);
				resolve(result);
			});
		})

		if (!result) return res.status(401).json({ message: 'Incorrect email or password' });

		const { password: removed, ...rest } = user;
		const token = jwt.sign(rest, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1d' });
		res.json({ user: rest, token });
	}

	public authenticate = async (req: IRequest, res: IResponse) => {
		const { authorization } = req.headers;
		const token = authorization && authorization.split(' ')[1];

		if (token === null) return res.status(401).json({ message: 'Unauthorized access' });

		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any, user: any) => {
			if (err)
				return res.status(403).json({ message: 'Invalid token' });
			req.user = user;
		});
	}

	public register = async (req: IRequest, res: IResponse) => {
		const { email, password, ...rest } = req.body;
		const user = await this.service.getByEmail(email);
		// 409 -> conflict
		if (user) return res.status(409).json({ message: 'User already exists' });

		const hashed = await new Promise<string>((resolve, reject) => {
			bcrypt.hash(password, this.salt, (err, hash) => {
				if (err) reject(err);
				resolve(hash);
				console.log(hash);
			});
		});


		const newId = await this.service.create({ email, password: hashed, ...rest });
		if (!newId)
			return res.status(500).json({ message: 'Error creating user' });
		res.json({ message: 'Registered successfully.', id: newId });
	}

	public logout = async (req: IRequest, res: IResponse) => { }

}
