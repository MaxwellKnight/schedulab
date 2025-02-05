import Router from "express";
import { makeSQL } from "../configs/db.config";
import { makeValidator } from "../middlewares/middlewares";
import {
	PreferenceService,
	PreferenceSubmissionService,
	TeamService,
	UserService
} from "../services";
import {
	AuthController,
	PreferenceSubmissionController
} from "../controllers";
import {
	PreferenceRepository,
	PreferenceSubmissionRepository,
	TeamRepository,
	UserRepository
} from "../repositories";
import {
	memberPreferenceSchema,
	memberPreferenceSelectionSchema
} from "../validations/preference.validation";

// Initialize repositories
const preferenceRepository = new PreferenceRepository(makeSQL());
const preferenceSubmissionRepository = new PreferenceSubmissionRepository(makeSQL());
const userRepository = new UserRepository(makeSQL());
const teamRepository = new TeamRepository(makeSQL());

// Initialize services
const preferenceSubmissionService = new PreferenceSubmissionService(
	preferenceSubmissionRepository,
	preferenceRepository
);
const userService = new UserService(userRepository);
const teamService = new TeamService(teamRepository);

// Initialize controllers
const authController = new AuthController(userService);
const preferenceSubmissionController = new PreferenceSubmissionController(preferenceSubmissionService, teamService);

// Initialize validators
const memberPreferenceValidator = makeValidator(memberPreferenceSchema);
const memberPreferenceSelectionValidator = makeValidator(memberPreferenceSelectionSchema);

const router = Router();

// Preference Submission routes
router.route("/")
	.get(
		authController.authenticate,
		preferenceSubmissionController.getByTemplate
	)
	.post(
		authController.authenticate,
		memberPreferenceValidator,
		preferenceSubmissionController.create
	);

router.route("/my-submission")
	.get(
		authController.authenticate,
		preferenceSubmissionController.getUserSubmissionForTemplate
	);

router.route("/:id")
	.get(
		authController.authenticate,
		preferenceSubmissionController.getOne
	)
	.put(
		authController.authenticate,
		memberPreferenceValidator,
		preferenceSubmissionController.update
	)
	.delete(
		authController.authenticate,
		preferenceSubmissionController.delete
	);

// Bulk selection routes
router.route("/:id/selections")
	.post(
		authController.authenticate,
		memberPreferenceSelectionValidator,
		preferenceSubmissionController.update
	);

router.route("/team/:teamId")
	.get(
		authController.authenticate,
		preferenceSubmissionController.getByTeam
	);

export default router;
