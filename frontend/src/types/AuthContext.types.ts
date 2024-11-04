import { TokenPayload } from "./users.dto";

export interface AuthContextType {
	token: string | null;
	user: TokenPayload | null;
	isAuthenticated: boolean;
	login: (userToken: string, user: TokenPayload) => void;
	logout: () => void;
}
