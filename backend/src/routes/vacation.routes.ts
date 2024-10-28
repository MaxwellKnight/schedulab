import Router from 'express';
import { makeSQL } from '../configs/db.config';
import { vacationSchema } from '../validations/vacation.validation';
import { adaptMiddleware } from '../helpers/adapters';
import { makeValidator, access } from '../middlewares/middlewares';
import { UserService, VacationService } from '../services';
import { AuthController, VacationController } from '../controllers';
import { UserRepository, VacationRepository } from '../repositories';

const repository = new VacationRepository(makeSQL());
const service = new VacationService(repository);
const controller = new VacationController(service);
const validator = makeValidator(vacationSchema);

const userRepository = new UserRepository(makeSQL());
const userService		= new UserService(userRepository);
const authController	= new AuthController(userService);

const router = Router();

router.route('/')
	.get(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.SUPEVISOR_ACCESS),
		adaptMiddleware(controller.getMany)
	)
	.post(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(validator),
		adaptMiddleware(controller.create)
	);

router.route('/:id')
	.get(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.SUPEVISOR_ACCESS),
		adaptMiddleware(controller.getOne)
	)
	.put(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(validator),
		adaptMiddleware(controller.update)
	)
	.delete(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.USER_ACCESS),
		adaptMiddleware(controller.delete)
	);

router.route('/dates/:start_date/:end_date')
	.get(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.SUPEVISOR_ACCESS),
		adaptMiddleware(controller.getByDates)
	);

router.route('/date/:date')
	.get(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.SUPEVISOR_ACCESS),
		adaptMiddleware(controller.getByDate)
	);

router.route('/user/:id')
	.get(
		adaptMiddleware(authController.authenticate), 
		adaptMiddleware(access.SUPEVISOR_ACCESS),
		adaptMiddleware(controller.getByUserId)
	);
	
export default router
