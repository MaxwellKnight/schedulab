import { TokenPayload } from "./users.dto";

export interface AuthContextType {
	token: string | null;
	isAuthenticated: boolean;
	user: TokenPayload | null;
	error: string | null;
	login: (token: string, user: TokenPayload, refreshToken: string) => Promise<void>;
	logout: () => Promise<void>;
	refreshToken: (refreshToken: string) => Promise<string>;
}
