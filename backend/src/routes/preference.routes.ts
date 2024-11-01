import Router from "express";
import { makeSQL } from "../configs/db.config";
import { makeValidator } from "../middlewares/middlewares";
import { PreferenceService, UserService } from "../services";
import { AuthController, PreferenceController } from "../controllers";
import { PreferenceRepository, UserRepository } from "../repositories";
import { preferenceSchema } from "../validations/preference.validation";

const repository = new PreferenceRepository(makeSQL());
const service = new PreferenceService(repository);
const controller = new PreferenceController(service);

const validator = makeValidator(preferenceSchema);

const userRepository = new UserRepository(makeSQL());
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

const router = Router();

router.route("/")
	.get(
		authController.authenticate,
		controller.getMany
	)
	.post(
		authController.authenticate,
		validator,
		controller.create
	);

router.route("/user/:id")
	.get(
		authController.authenticate,
		controller.getByUserId
	);

router.route("/:id")
	.put(
		authController.authenticate,
		validator,
		controller.update
	)
	.delete(
		authController.authenticate,
		controller.delete
	)
	.get(
		authController.authenticate,
		controller.getOne
	);

router.route("/dates/:start_date/:end_date")
	.get(
		authController.authenticate,
		controller.getByDates
	);


export default router;
