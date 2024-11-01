import { UserData } from "./users.dto";

export interface AuthContextType {
	token: string | null;
	user: UserData | null;
	isAuthenticated: boolean;
	login: (userToken: string, user: UserData) => void;
	logout: () => void;
}
