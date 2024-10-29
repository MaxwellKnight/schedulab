import { UserData } from "./users.dto";

export interface AuthContextType {
	token: string | null;
	user: UserData | null;
	isAuthenticated: boolean;
	login: (userToken: string, user: { id: string; email: string; username: string; }) => void;
	logout: () => void;
}
