import Router from "express";
import { UserRepository } from "../repositories";
import { makeSQL } from "../configs/db.config";
import { UserService } from "../services";
import { AuthController } from "../controllers/auth.controller";
import { adaptMiddleware } from "../helpers/adapters";
import { makeValidator } from "../middlewares/middlewares";
import { userSchema } from "../validations/user.validation";
import { loginSchema, refreshTokenSchema } from "../validations/auth.validation";

// Initialize dependencies
const router = Router();
const userRepository = new UserRepository(makeSQL());
const userService = new UserService(userRepository);
const controller = new AuthController(userService);

// Create validators
const userValidator = makeValidator(userSchema);
const refreshTokenValidator = makeValidator(refreshTokenSchema);
const loginValidator = makeValidator(loginSchema);

// Auth routes
router.route("/register")
	.post(
		adaptMiddleware(userValidator),
		adaptMiddleware(controller.register)
	);

router.route("/login")
	.post(
		adaptMiddleware(loginValidator),
		adaptMiddleware(controller.login)
	);

router.route("/refresh")
	.post(
		adaptMiddleware(refreshTokenValidator),
		adaptMiddleware(controller.refresh)
	);

router.route("/logout")
	.post(
		adaptMiddleware(refreshTokenValidator),
		adaptMiddleware(controller.logout)
	);

// Protected routes example
router.route("/protected")
	.get(
		adaptMiddleware(controller.authenticate),
		(req, res) => {
			res.json({ message: 'Access granted to protected route', user: req.body.user });
		}
	);

export default router;
