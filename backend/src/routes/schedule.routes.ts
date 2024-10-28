import Router from 'express';
import { makeSQL } from '../configs/db.config';
import { UserRepository } from '../repositories';
import { adaptMiddleware } from '../helpers/adapters';
import { ScheduleService, TemplateService, UserService } from '../services';
import { access, makeValidator } from '../middlewares/middlewares';
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
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(validator),
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.getMany)
	)
	.post(
		adaptMiddleware(access.CHIEF_ACCESS),
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(controller.create)
	);

router.route('/:id')
	.get(
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(controller.getOne)
	)
	.put(
		adaptMiddleware(access.SUPEVISOR_ACCESS),
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(validator),
		adaptMiddleware(controller.update)
	)
	.delete(
		adaptMiddleware(access.ADMIN_ACCESS),
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(controller.delete)
	);

router.route('/dates/:start_date/:end_date')
	.get(
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(controller.getByDates)
	);

router.route('/user/:id')
	.get(
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(authController.authenticate),
		adaptMiddleware(controller.getByUserId)
	);

router.route('/templates')
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

router.route('/templates/:id')
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
