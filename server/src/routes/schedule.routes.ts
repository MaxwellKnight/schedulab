import Router from 'express';
import { makeSQL } from '../configs/db.config';
import { UserRepository } from '../repositories';
import { adaptMiddleware } from '../helpers/adapters';
import { ScheduleService, UserService } from '../services';
import { access, makeValidator } from '../middlewares/middlewares';
import { AuthController, ScheduleController } from '../controllers';
import { scheduleSchema } from '../validations/schedule.validation';
import { ScheduleRepository } from '../repositories/schedule.repository';


const DB 			= makeSQL();
const respository = new ScheduleRepository(DB);
const service		= new ScheduleService(respository);
const controller 	= new ScheduleController(service);
const validator 	= makeValidator(scheduleSchema);

const userRepository = new UserRepository(DB);
const userService		= new UserService(userRepository);
const authController	= new AuthController(userService);

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

	
export default router;
