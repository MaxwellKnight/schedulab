import { Router } from "express";
import { makeSQL } from "../configs/db.config";
import { UserService } from "../services";
import { UserRepository } from "../repositories";
import { userSchema } from "../validations/user.validation";
import { AuthController, UserController } from "../controllers";
import { makeValidator } from "../middlewares/middlewares";

const repository = new UserRepository(makeSQL());
const service = new UserService(repository);
const controller = new UserController(service);
const authController = new AuthController(service);
const validator = makeValidator(userSchema);

const router = Router();

router.route("/")
	.get(
		authController.authenticate,
		controller.getMany
	)

router.route("/team/:team_id")
	.get(
		authController.authenticate,
		controller.getByTeamId
	)

router.route("/teams")
	.get(
		authController.authenticate,
		controller.getTeams
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

router.route("/shift/:id")
	.get(
		authController.authenticate,
		controller.getByShiftId
	);

export default router;
