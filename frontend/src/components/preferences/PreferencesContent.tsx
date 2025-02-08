import { motion } from "framer-motion";
import { DateRangePicker } from "../DateRangePicker";
import PreferencesApply from "./PreferencesApply";
import { usePreferencesState } from "@/hooks";

export interface PreferencesContentProps { }

export const PreferencesContent: React.FC<PreferencesContentProps> = () => {
	const { range, setRange } = usePreferencesState();

	return (
		<motion.div
			className="grid place-items-center p-4 w-full min-h-[500px]"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.3 }}
		>
			<DateRangePicker
				className="mb-4"
				range={range}
				setRange={setRange}
			/>
			<PreferencesApply />
		</motion.div>
	)
};
