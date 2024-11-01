import { Router } from "express";
import { makeSQL } from "../configs/db.config";
import { AuthController, TemplateController } from "../controllers";
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
		authController.authenticate,
		templateController.getMany
	)
	.post(
		authController.authenticate,
		templateController.create
	);

router.route('/:id')
	.get(
		authController.authenticate,
		templateController.getOne
	)
	.put(
		authController.authenticate,
		templateController.update
	)
	.delete(
		authController.authenticate,
		templateController.delete
	);

router.route('/team/:teamId')
	.get(
		authController.authenticate,
		templateController.getByTeamId
	);

export default router;
