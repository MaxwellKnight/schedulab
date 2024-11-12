import Combobox from "@/components/combobox/Combobox"
import { Button } from "@/components/ui/button"
import { useSchedule } from "@/context"
import { TemplateScheduleData } from "@/types/template.dto"
import { motion } from "framer-motion"
import { Save, Send } from "lucide-react"

interface ScheduleHeaderProps {
	templates: TemplateScheduleData[];
	templatesLoading: boolean;
	templatesError: string | null;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ templates, templatesError, templatesLoading }) => {
	const { state, handlePublish, handleSaveDraft, handleTemplateSelect } = useSchedule();
	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm"
		>
			<div className="flex-1 max-w-md">
				<h1 className="text-sm text-gray-500 mb-2">Template</h1>
				<Combobox
					onTemplateSelect={handleTemplateSelect}
					className="w-full"
					templates={templates}
					loading={templatesLoading}
					error={templatesError}
				/>
			</div>
			<div className="flex gap-2 self-end w-full sm:w-auto">
				<Button
					variant="outline"
					onClick={handleSaveDraft}
					disabled={!state.template || !state.isDirty}
					className="flex-1 sm:flex-none text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-700 transition-all"
				>
					<Save className="h-4 w-4 mr-2" />
					Save Draft
				</Button>
				<Button
					onClick={handlePublish}
					disabled={!state.template}
					className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 
  hover:to-indigo-500 shadow-lg hover:shadow-indigo-100/50 
  transition-all duration-300 ease-in-out relative group overflow-hidden"
				>
					<div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 
    group-hover:opacity-100 transition-opacity duration-300 ease-in-out" />
					<div className="relative flex gap-2 items-center justify-center">
						<motion.div
							initial={false}
							animate={{
								scale: 1,
								y: 0,
								x: 0,
							}}
							whileHover={{
								scale: 1.1,
								transition: {
									duration: 2,
									repeat: Infinity,
									ease: "linear"
								}
							}}
							className="relative"
						>
							<motion.div
								initial={false}
								animate={{
									rotate: 0
								}}
								whileHover={{
									rotate: 360,
									transition: {
										duration: 2,
										repeat: Infinity,
										ease: "linear"
									}
								}}
							>
								<Send className="h-4 w-4 mr-2" />
							</motion.div>
						</motion.div>
						<motion.span
							initial={false}
							whileHover={{
								transition: {
									duration: 0.3,
									ease: "easeOut"
								}
							}}
							className="font-medium uppercase text-md tracking-wider"
						>
							Publish
						</motion.span>
					</div>
				</Button>
			</div>
		</motion.div>
	);
};

export default ScheduleHeader;
