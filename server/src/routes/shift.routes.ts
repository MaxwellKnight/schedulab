import Router from "express";
import { makeSQL } from "../configs/db.config";
import { shiftSchema } from "../validations/shift.validation";
import { adaptMiddleware } from "../helpers/adapters";
import { ShiftService, UserService } from "../services";
import { access, makeValidator } from "../middlewares/middlewares";
import { AuthController, ShiftController } from '../controllers';
import { ShiftRepository, UserRepository } from "../repositories";

const repository 	= new ShiftRepository(makeSQL());
const service 		= new ShiftService(repository);
const controller 	= new ShiftController(service);

const validator = makeValidator(shiftSchema);

const userRepository = new UserRepository(makeSQL());
const userService		= new UserService(userRepository);
const authController	= new AuthController(userService);

const router = Router();

router.route("/")
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getMany)
	)
	.post(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.CHIEF_ACCESS),
		adaptMiddleware(validator),
		adaptMiddleware(controller.create)
	);

router.route("/:id")
	.put(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.SUPEVISOR_ACCESS),
		adaptMiddleware(validator),
		adaptMiddleware(controller.update)
	)
	.delete(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.ADMIN_ACCESS),
		adaptMiddleware(controller.delete)
	)
	.get(
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getOne)
	);

router.route("/schedule/:id")
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getByScheduleId)
	);

router.route("/user/:id")
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getByUserId)
	);

router.route("/name/:name")
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getByName)
	);

router.route("/date/:date")
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getByDate)
	);

router.route("/dates/:start_date/:end_date")
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getByDates)
	);

export default router
