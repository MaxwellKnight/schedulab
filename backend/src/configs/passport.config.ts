import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserService } from "../services";
import { makeSQL } from "./db.config";
import { UserRepository } from "../repositories";

export const configurePassport = () => {
	passport.serializeUser((user: any, done) => {
		done(null, user);
	});

	passport.deserializeUser((user: any, done) => {
		done(null, user);
	});

	passport.use(
		'google',
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
				callbackURL: process.env.GOOGLE_CALLBACK_URL!,
			},
			async (_, __, profile, done) => {
				try {
					const service = new UserService(new UserRepository(makeSQL()));
					const email = profile.emails?.[0]?.value;
					let user = await service.getByEmail(email || "");

					if (!user) {
						if (email && profile.name?.givenName && profile.name?.familyName) {
							const newUser = {
								email,
								google_id: profile.id,
								display_name: profile.displayName,
								first_name: profile.name?.givenName,
								middle_name: profile.name.middleName,
								last_name: profile.name?.familyName,
								picture: profile.photos?.[0]?.value,
								user_role: "user",
								password: "google",
							};
							await service.create(newUser);
							user = await service.getByEmail(email);
						}
					}

					done(null, {
						email,
						google_id: profile.id,
						display_name: profile.displayName,
						first_name: profile.name?.givenName,
						last_name: profile.name?.familyName,
						picture: profile.photos?.[0].value
					});
				} catch (error) {
					done(error as Error);
				}
			}
		)
	);

	return passport;
};
