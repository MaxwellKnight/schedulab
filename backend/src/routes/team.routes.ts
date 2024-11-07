import { Router } from "express";
import { makeSQL } from "../configs/db.config";
import { TeamService, UserService } from "../services";
import { TeamRepository, UserRepository } from "../repositories";
import { joinTeamSchema, teamSchema } from "../validations/team.validation";
import { AuthController, TeamController } from "../controllers";
import { makeValidator } from "../middlewares/middlewares";

const repository = new TeamRepository(makeSQL());
const user_repo = new UserRepository(makeSQL());
const service = new TeamService(repository);
const controller = new TeamController(service);
const authController = new AuthController(new UserService(user_repo));
const validator = makeValidator(teamSchema);

const router = Router();

// Base team routes
router.route("/")
	.get(
		authController.authenticate,
		controller.getMany
	)
	.post(
		authController.authenticate,
		validator,
		controller.create
	);


router.route("/join")
	.post(
		authController.authenticate,
		makeValidator(joinTeamSchema),
		controller.joinTeam
	);

// Team code lookup
router.route("/code/:code")
	.get(controller.getByCode);

// Team specific routes
router.route("/:id")
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

// Member management routes
router.route("/:id/members")
	.post(
		authController.authenticate,
		controller.addMember
	);

router.route("/:id/members/:userId")
	.delete(
		authController.authenticate,
		controller.removeMember
	);

// Role management routes
router.route("/:id/roles")
	.get(
		authController.authenticate,
		controller.getRoles
	)
	.post(
		authController.authenticate,
		controller.addRole
	);

router.route("/:id/roles/:roleId")
	.delete(
		authController.authenticate,
		controller.deleteRole
	);

// Member role management
router.route("/:id/members/:userId/role")
	.put(
		authController.authenticate,
		controller.setMemberRole
	);

export default router;
