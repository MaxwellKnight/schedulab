import { useState } from 'react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Menu, X } from "lucide-react";
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
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const availableItems = preferencesNavigationConfig.items.filter(item =>
		item.enabled && (!item.requiresAdmin || isAdmin)
	);

	const NavigationContent = () => (
		<div className="space-y-2.5">
			{availableItems.map((item) => {
				const Icon = item.icon;
				const isActive = currentView === item.id;
				return (
					<button
						key={item.id}
						onClick={() => {
							onViewChange(item.id);
							setIsMobileMenuOpen(false);
						}}
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
	);

	return (
		<>
			{/* Mobile Toggle Button */}
			<button
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				className="xl:hidden fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-3 rounded-full shadow-lg"
			>
				{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</button>

			{/* Desktop Sidebar */}
			<div className="hidden xl:block w-80 border-l border-blue-100 bg-white">
				<div className="p-6">
					<h3 className="text-xs font-semibold tracking-wider text-blue-600 uppercase mb-6">
						Navigation
					</h3>
					<NavigationContent />
				</div>
			</div>

			{/* Mobile Sidebar */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-50 xl:hidden pointer-events-none"
					>
						<motion.div
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ type: 'tween', duration: 0.3 }}
							className="absolute top-0 right-0 bottom-0 w-80 bg-white 
                        shadow-[rgba(0,0,0,0.1)_-20px_0px_30px_-10px] 
                        pointer-events-auto"
						>
							<div className="p-6">
								<h3 className="text-xs font-semibold tracking-wider text-blue-600 uppercase mb-6">
									Navigation
								</h3>
								<NavigationContent />
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export default PreferencesSidebar;
