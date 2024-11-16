import Router from "express";
import { makeSQL } from "../configs/db.config";
import { makeValidator } from "../middlewares/middlewares";
import { PreferenceTemplateService, UserService } from "../services";
import { AuthController, PreferenceTemplateController } from "../controllers";
import { PreferenceTemplateRepository, UserRepository } from "../repositories";
import { preferenceTemplateSchema } from "../validations/preference.validation";

const repository = new PreferenceTemplateRepository(makeSQL());
const service = new PreferenceTemplateService(repository);
const controller = new PreferenceTemplateController(service);
const validator = makeValidator(preferenceTemplateSchema);
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

router.route("/team/:teamId")
	.get(
		authController.authenticate,
		controller.getByTeamId
	);

router.route("/:id")
	.get(
		authController.authenticate,
		controller.getOne
	)
	.put(
		authController.authenticate,
		validator,
		controller.update
	)
	.delete(
		authController.authenticate,
		controller.delete
	);

router.route("/:id/publish")
	.post(
		authController.authenticate,
		controller.publish
	);

router.route("/:id/close")
	.post(
		authController.authenticate,
		controller.close
	);

router.route("/dates/:start_date/:end_date")
	.get(
		authController.authenticate,
		controller.getByDates
	);

export default router;
