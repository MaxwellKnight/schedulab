import Router from "express";
import { UserRepository } from "../repositories";
import { makeSQL } from "../configs/db.config";
import { UserService } from "../services";
import { AuthController } from "../controllers/auth.controller";
import { adaptMiddleware } from "../helpers/adapters";
import { makeValidator } from "../middlewares/middlewares";
import { userSchema } from "../validations/user.validation";

const router = Router();

const userRepository = new UserRepository(makeSQL());
const userService = new UserService(userRepository);
const controller = new AuthController(userService);

const validator = makeValidator(userSchema);

router.route("/login")
	.post(adaptMiddleware(controller.login));

router.route("/logout")
	.post(adaptMiddleware(controller.logout));

router.route("/register")
	.post(
		adaptMiddleware(validator),
		adaptMiddleware(controller.register)
	);

export default router;
