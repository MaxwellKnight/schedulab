import Router from "express";
import { makeSQL } from "../configs/db.config";
import { shiftSchema } from "../validations/shift.validation";
import { ShiftService, UserService } from "../services";
import { makeValidator } from "../middlewares/middlewares";
import { AuthController, ShiftController } from '../controllers';
import { ShiftRepository, UserRepository } from "../repositories";

const repository = new ShiftRepository(makeSQL());
const service = new ShiftService(repository);
const controller = new ShiftController(service);

const validator = makeValidator(shiftSchema);

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

router.route("/types/:id")
	.get(controller.getTypes);

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
		controller.getOne
	);

router.route("/schedule/:id")
	.get(
		authController.authenticate,
		controller.getByScheduleId
	);

router.route("/user/:id")
	.get(
		authController.authenticate,
		controller.getByUserId
	);

router.route("/name/:name")
	.get(
		authController.authenticate,
		controller.getByName
	);

router.route("/date/:date")
	.get(
		authController.authenticate,
		controller.getByDate
	);

export default router
