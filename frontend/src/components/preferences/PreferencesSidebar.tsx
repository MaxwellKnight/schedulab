import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { NavigationItemId } from './types';
import { preferencesNavigationConfig } from './navigationConfig';

interface PreferencesSidebarProps {
	onViewChange: (view: NavigationItemId) => void;
	currentView: NavigationItemId;
	isAdmin?: boolean;
}

const PreferencesSidebar: React.FC<PreferencesSidebarProps> = ({
	onViewChange,
	currentView,
	isAdmin = false
}) => {
	const availableItems = preferencesNavigationConfig.items.filter(item =>
		item.enabled && (!item.requiresAdmin || isAdmin)
	);

	return (
		<div className="w-80 border-l border-blue-100 bg-white">
			<div className="p-6">
				<h3 className="text-xs font-semibold tracking-wider text-blue-600 uppercase mb-6">
					Navigation
				</h3>
				<div className="space-y-2.5">
					{availableItems.map((item) => {
						const Icon = item.icon;
						const isActive = currentView === item.id;

						return (
							<button
								key={item.id}
								onClick={() => onViewChange(item.id)}
								className={cn(
									"w-full group relative p-3 rounded-lg transition-all duration-300 transform",
									"hover:bg-blue-50/50 hover:scale-[1.02]",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20",
									isActive && "bg-blue-50 shadow-sm"
								)}
							>
								<div className="flex items-start gap-4">
									<div className={cn(
										"p-2 rounded-lg transition-colors duration-300",
										isActive
											? "bg-blue-100 text-blue-600 ring-1 ring-blue-200"
											: "bg-gray-100 text-blue-400",
										"group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:ring-1 group-hover:ring-blue-200"
									)}>
										<Icon className="h-4 w-4" strokeWidth={2.5} />
									</div>
									<div className="flex-1 text-left min-w-0">
										<p className={cn(
											"font-medium text-sm transition-colors duration-300",
											isActive ? "text-blue-900" : "text-blue-700",
											"group-hover:text-blue-900"
										)}>
											{item.label}
										</p>
										<p className={cn(
											"text-sm transition-colors duration-300",
											isActive ? "text-blue-600" : "text-blue-400",
											"group-hover:text-blue-600"
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
											<ChevronRight className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
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
