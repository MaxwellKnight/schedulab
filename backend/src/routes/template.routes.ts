import { Router } from "express";
import { makeSQL } from "../configs/db.config";
import { AuthController, TemplateController } from "../controllers";
import { adaptMiddleware } from "../helpers/adapters";
import { access } from "../middlewares/middlewares";
import { TemplateScheduleRepository, UserRepository } from "../repositories";
import { TemplateService, UserService } from "../services";

const DB = makeSQL();

const templateRepository = new TemplateScheduleRepository(DB);
const templateService = new TemplateService(templateRepository);
const templateController = new TemplateController(templateService);

const userRepository = new UserRepository(DB);
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

const router = Router();

router.route('/')
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(templateController.getMany)
	)
	.post(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.ADMIN_ACCESS),
		adaptMiddleware(templateController.create)
	);

router.route('/:id')
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(templateController.getOne)
	)
	.put(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.ADMIN_ACCESS),
		adaptMiddleware(templateController.update)
	)
	.delete(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.ADMIN_ACCESS),
		adaptMiddleware(templateController.delete)
	);

router.route('/templates/team/:teamId')
	.get(
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(templateController.getByTeamId)
	);

export default router;
