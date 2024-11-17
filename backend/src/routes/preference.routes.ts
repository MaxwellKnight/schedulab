import Router from "express";
import { makeSQL } from "../configs/db.config";
import { makeValidator } from "../middlewares/middlewares";
import { PreferenceService, UserService } from "../services";
import { AuthController, PreferenceController } from "../controllers";
import { PreferenceRepository, UserRepository } from "../repositories";
import {
	preferenceTemplateSchema,
	timeRangeSchema,
	timeSlotSchema,
	bulkTimeSlotSchema
} from "../validations/preference.validation";

const repository = new PreferenceRepository(makeSQL());
const service = new PreferenceService(repository);
const controller = new PreferenceController(service);
const userRepository = new UserRepository(makeSQL());
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

const templateValidator = makeValidator(preferenceTemplateSchema);
const timeRangeValidator = makeValidator(timeRangeSchema);
const timeSlotValidator = makeValidator(timeSlotSchema);
const bulkTimeSlotValidator = makeValidator(bulkTimeSlotSchema);

const router = Router();

// Template routes
router.route("/")
	.get(
		authController.authenticate,
		controller.getMany
	)
	.post(
		authController.authenticate,
		templateValidator,
		controller.create
	);

router.route("/team/:teamId")
	.get(
		authController.authenticate,
		controller.getByTeamId
	);

router.route("/dates")
	.get(
		authController.authenticate,
		controller.getByDates
	);

router.route("/:id")
	.get(
		authController.authenticate,
		controller.getOne
	)
	.put(
		authController.authenticate,
		templateValidator,
		controller.update
	)
	.delete(
		authController.authenticate,
		controller.delete
	);

// Template status management
//router.route("/:id/publish")
//	.post(
//		authController.authenticate,
//		controller.publish
//	);
//
//router.route("/:id/close")
//	.post(
//		authController.authenticate,
//		controller.close
//	);

// Time range routes
router.route("/:templateId/time-ranges")
	.post(
		authController.authenticate,
		timeRangeValidator,
		controller.createTimeRange
	);

router.route("/:templateId/time-ranges/:rangeId")
	.put(
		authController.authenticate,
		timeRangeValidator,
		controller.updateTimeRange
	)
	.delete(
		authController.authenticate,
		controller.deleteTimeRange
	);

// Time slot routes
router.route("/:templateId/time-slots")
	.post(
		authController.authenticate,
		timeSlotValidator,
		controller.createTimeSlot
	);

router.route("/:templateId/time-slots/bulk")
	.post(
		authController.authenticate,
		bulkTimeSlotValidator,
		controller.createBulkTimeSlots
	);

router.route("/:templateId/time-slots/:slotId")
	.put(
		authController.authenticate,
		timeSlotValidator,
		controller.updateTimeSlot
	)
	.delete(
		authController.authenticate,
		controller.deleteTimeSlot
	);

export default router;
