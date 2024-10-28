import Router from "express";
import { makeSQL } from "../configs/db.config";
import { access, makeValidator } from "../middlewares/middlewares";
import { adaptMiddleware } from "../helpers/adapters";
import { PreferenceService, UserService } from "../services";
import { AuthController, PreferenceController } from "../controllers";
import { PreferenceRepository, UserRepository } from "../repositories";
import { preferenceSchema } from "../validations/preference.validation";

const repository = new PreferenceRepository(makeSQL());
const service = new PreferenceService(repository);
const controller = new PreferenceController(service);

const validator = makeValidator(preferenceSchema);

const userRepository = new UserRepository(makeSQL());
const userService		= new UserService(userRepository);
const authController	= new AuthController(userService);

const router = Router();

router.route("/")
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.SUPEVISOR_ACCESS),
		adaptMiddleware(controller.getMany)
	)
	.post(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(validator),
		adaptMiddleware(controller.create)
	);

router.route("/user/:id")
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getByUserId)
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

router.route("/dates/:start_date/:end_date")
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.SUPEVISOR_ACCESS),
		adaptMiddleware(controller.getByDates)
	);


export default router;
