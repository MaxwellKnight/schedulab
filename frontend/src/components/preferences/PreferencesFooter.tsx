import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "../ui/alert"
import { DrawerFooter } from "../ui/drawer"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { AnimatePresence, motion } from "framer-motion"

export interface PreferencesFooterProps {
	error: string | null
	isSubmitting: boolean
	isSuccess: boolean
	hasTimeRanges: boolean
	onSubmit: () => Promise<void>
}

export const PreferencesFooter: React.FC<PreferencesFooterProps> = ({
	error,
	isSubmitting,
	isSuccess,
	hasTimeRanges,
	onSubmit
}) => (
	<DrawerFooter className="w-full max-w-md mx-auto">
		{error && (
			<Alert variant="destructive" className="mb-4">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		)}
		<Button
			className={cn(
				"w-full mb-10 relative overflow-hidden",
				isSuccess
					? "bg-green-600 hover:bg-green-700"
					: "bg-blue-600 hover:bg-blue-700"
			)}
			onClick={onSubmit}
			disabled={isSubmitting || !hasTimeRanges}
		>
			<AnimatePresence mode="wait">
				{isSubmitting ? (
					<motion.div
						key="loading"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex items-center"
					>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Saving preferences...
					</motion.div>
				) : isSuccess ? (
					<motion.div
						key="success"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="flex items-center"
					>
						<Check className="mr-2 h-4 w-4" />
						Preferences saved!
					</motion.div>
				) : (
					<motion.div
						key="default"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						Save preferences
					</motion.div>
				)}
			</AnimatePresence>
		</Button>
	</DrawerFooter>
);
