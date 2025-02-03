import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus, Eye, ChevronRight, LucideIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export type SidebarOption = 'view' | 'create';
type NavigationItem = {
	id: SidebarOption;
	label: string;
	icon: LucideIcon;
	description: string;
};

interface PreferencesSidebarProps {
	onViewChange: Dispatch<SetStateAction<SidebarOption>>;
	currentView: SidebarOption;
}

const PreferencesSidebar: React.FC<PreferencesSidebarProps> = ({ onViewChange, currentView }) => {
	const navigationItems: NavigationItem[] = [
		{
			id: 'view',
			label: 'View Preferences',
			icon: Eye,
			description: 'View and manage existing preferences'
		},
		{
			id: 'create',
			label: 'Create New',
			icon: Plus,
			description: 'Create a new preference setting'
		}
	];

	return (
		<div className="w-80 border-l border-indigo-100 bg-white">
			<div className="p-6">
				<h3 className="text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-6">
					Navigation
				</h3>
				<div className="space-y-2.5">
					{navigationItems.map((item) => {
						const Icon = item.icon;
						const isActive = currentView === item.id;

						return (
							<button
								key={item.id}
								onClick={() => onViewChange(item.id)}
								className={cn(
									"w-full group relative p-3 rounded-lg transition-all duration-300 transform",
									"hover:bg-indigo-50/50 hover:scale-[1.02]",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20",
									isActive && "bg-indigo-50 shadow-sm"
								)}
							>
								<div className="flex items-start gap-4">
									<div className={cn(
										"p-2 rounded-lg transition-colors duration-300",
										isActive
											? "bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200"
											: "bg-gray-100 text-indigo-400",
										"group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:ring-1 group-hover:ring-indigo-200"
									)}>
										<Icon className="h-4 w-4" strokeWidth={2.5} />
									</div>
									<div className="flex-1 text-left min-w-0">
										<p className={cn(
											"font-medium text-sm transition-colors duration-300",
											isActive ? "text-indigo-900" : "text-indigo-700",
											"group-hover:text-indigo-900"
										)}>
											{item.label}
										</p>
										<p className={cn(
											"text-sm transition-colors duration-300",
											isActive ? "text-indigo-600" : "text-indigo-400",
											"group-hover:text-indigo-600"
										)}>
											{item.description}
										</p>
									</div>
									{isActive && (
										<motion.div
											initial={{ scale: 0.8, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											className="flex items-center self-center"
										>
											<ChevronRight className="h-4 w-4 text-indigo-600" strokeWidth={2.5} />
										</motion.div>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default PreferencesSidebar;
