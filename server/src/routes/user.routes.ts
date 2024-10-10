import { Router } from "express";
import { makeSQL } from "../configs/db.config";
import { UserService } from "../services";
import { UserRepository } from "../repositories";
import { adaptMiddleware } from "../helpers/adapters";
import { userSchema } from "../validations/user.validation";
import { AuthController, UserController } from "../controllers";
import { access, makeValidator } from "../middlewares/middlewares";

const repository 		= new UserRepository(makeSQL());
const service 			= new UserService(repository);
const controller 		= new UserController(service);
const authController = new AuthController(service);
const validator 		= makeValidator(userSchema);

const router = Router();

router.route("/")
	.get(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.SUPEVISOR_ACCESS),
		adaptMiddleware(controller.getMany)
	)
	.post(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.ADMIN_ACCESS),
		adaptMiddleware(validator),
		adaptMiddleware(controller.create)
	);

router.route("/:id")
	.put(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(validator),
		adaptMiddleware(controller.update)
	)
	.delete(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.delete)
	)
	.get(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getOne)
	);

router.route("/shift/:id")
	.get(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getByShiftId)
	);

export default router;
