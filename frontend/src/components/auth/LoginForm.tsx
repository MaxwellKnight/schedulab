import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface LoginFormProps {
	handleLogin: (e: React.FormEvent) => void;
	setEmail: React.Dispatch<React.SetStateAction<string>>;
	setPassword: React.Dispatch<React.SetStateAction<string>>;
	email: string;
	password: string;
	loading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
	handleLogin,
	setEmail,
	setPassword,
	email,
	password,
	loading
}) => {
	return (
		<form onSubmit={handleLogin} className="space-y-4">
			<motion.div
				initial={{ opacity: 0, height: 0 }}
				animate={{ opacity: 1, height: "auto" }}
				transition={{
					type: "spring",
					stiffness: 200,
					damping: 20,
					mass: 0.8
				}}
				className="space-y-4"
			>
				<motion.div
					className="space-y-2"
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 300,
						damping: 20,
						delay: 0.1
					}}
				>
					<Label htmlFor="email">Email</Label>
					<motion.div
						className="relative"
						whileFocus={{ scale: 1.02 }}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
					>
						<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
							className="pl-10"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={loading}
						/>
					</motion.div>
				</motion.div>

				<motion.div
					className="space-y-2"
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 300,
						damping: 20,
						delay: 0.2
					}}
				>
					<Label htmlFor="password">Password</Label>
					<motion.div
						className="relative"
						whileFocus={{ scale: 1.02 }}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
					>
						<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
						<Input
							id="password"
							type="password"
							placeholder="Enter your password"
							className="pl-10"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={loading}
						/>
					</motion.div>
				</motion.div>

				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					<motion.div
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Button
							className="w-full bg-indigo-600 hover:bg-indigo-700 relative overflow-hidden group"
							type="submit"
							disabled={loading}
						>
							<motion.div
								className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-20"
								initial={false}
								animate={loading ? { x: ["0%", "100%"] } : { x: "0%" }}
								transition={{
									duration: 1,
									repeat: loading ? Infinity : 0,
									ease: "linear"
								}}
							/>
							{loading ? (
								<motion.div
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									className="flex items-center justify-center"
								>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									<span>Logging in...</span>
								</motion.div>
							) : (
								<motion.span
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.4 }}
								>
									Login
								</motion.span>
							)}
						</Button>
					</motion.div>
				</motion.div>
			</motion.div>
		</form>
	);
}

export default LoginForm;