import { Router } from "express";
import passport from "passport";
import { UserRepository } from "../repositories";
import { makeSQL } from "../configs/db.config";
import { UserService } from "../services";
import { AuthController } from "../controllers/auth.controller";
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

// Basic auth routes
router.route("/register")
	.post(
		userValidator,
		controller.register
	);

router.route("/login")
	.post(
		loginValidator,
		controller.login
	);

router.route("/refresh")
	.post(
		refreshTokenValidator,
		controller.refresh
	);

router.route("/logout")
	.post(
		refreshTokenValidator,
		controller.logout
	);

// Google OAuth routes
router.get('/google',
	passport.authenticate('google', {
		scope: ['profile', 'email']
	})
);

router.get('/google/callback',
	passport.authenticate('google', {
		failureRedirect: '/login',
		session: false
	}),
	controller.callback
);

router.get('/google/user',
	controller.authenticate,
	async (req, res) => {
		try {
			if (!req.user?.email) {
				return res.status(401).json({
					message: 'Invalid token payload - no email found'
				});
			}

			const user = await userService.getByEmail(req.user.email);
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			// Remove password from response
			const { password, ...userData } = user;
			res.json({ user: userData });

		} catch (error) {
			console.error('Error fetching user data:', error);
			res.status(500).json({ message: 'Error fetching user data' });
		}
	}
);

export default router;
