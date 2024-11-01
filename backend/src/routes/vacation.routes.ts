import Router from 'express';
import { makeSQL } from '../configs/db.config';
import { vacationSchema } from '../validations/vacation.validation';
import { makeValidator } from '../middlewares/middlewares';
import { UserService, VacationService } from '../services';
import { AuthController, VacationController } from '../controllers';
import { UserRepository, VacationRepository } from '../repositories';

const repository = new VacationRepository(makeSQL());
const service = new VacationService(repository);
const controller = new VacationController(service);
const validator = makeValidator(vacationSchema);

const userRepository = new UserRepository(makeSQL());
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

const router = Router();

router.route('/')
	.get(
		authController.authenticate,
		controller.getMany
	)
	.post(
		authController.authenticate,
		validator,
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

router.route('/date/:date')
	.get(
		authController.authenticate,
		controller.getByDate
	);

router.route('/user/:id')
	.get(
		authController.authenticate,
		controller.getByUserId
	);

export default router
