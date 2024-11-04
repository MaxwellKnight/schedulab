import Router from 'express';
import { makeSQL } from '../configs/db.config';
import { UserRepository } from '../repositories';
import { ScheduleService, TemplateService, UserService } from '../services';
import { makeValidator } from '../middlewares/middlewares';
import { AuthController, ScheduleController } from '../controllers';
import { scheduleSchema } from '../validations/schedule.validation';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { TemplateScheduleRepository } from '../repositories/template.repository';
import { TemplateController } from '../controllers/template.controller';


const DB = makeSQL();
const respository = new ScheduleRepository(DB);
const service = new ScheduleService(respository);
const controller = new ScheduleController(service);
const validator = makeValidator(scheduleSchema);

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
		validator,
		controller.getMany
	)
	.post(
		authController.authenticate,
		controller.create
	);

router.route('/:id')
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

router.route('/dates/:start_date/:end_date')
	.get(
		authController.authenticate,
		controller.getByDates
	);

router.route('/user/:id')
	.get(
		authController.authenticate,
		controller.getByUserId
	);

router.route('/templates')
	.get(
		authController.authenticate,
		templateController.getMany
	)
	.post(
		authController.authenticate,
		templateController.create
	);

router.route('/templates/:id')
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

router.route('/templates/team/:teamId')
	.get(
		authController.authenticate,
		templateController.getByTeamId
	);

export default router;
