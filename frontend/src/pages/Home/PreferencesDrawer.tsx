import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer"
import AnimatedGradientButton from "@/components/AnimatedButton"
import { Settings } from "lucide-react"

export const PreferencesDrawer: React.FC = () => {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<AnimatedGradientButton
					onClick={() => console.log("preferences...")}
					disabled={false}
					icon={Settings}
					text="Preferences"
				/>
			</DrawerTrigger>
			<DrawerContent>
				<div className="mx-auto w-full max-w-sm">
					<DrawerHeader>
						<DrawerTitle>Preferences</DrawerTitle>
						<DrawerDescription>Manage your preferences simpler then ever.</DrawerDescription>
					</DrawerHeader>
					<div className="p-4 pb-0">
						<div className="mt-3 h-[120px]">
						</div>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
