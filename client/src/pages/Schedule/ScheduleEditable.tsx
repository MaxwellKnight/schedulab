import { ShiftType } from "@/types/shifts.dto";
import { TemplateScheduleData } from "@/types/template.dto";

interface ScheduleEditableProps {
	template: TemplateScheduleData | null;
	shiftTypes: ShiftType[] | null;
}

const ScheduleEditable: React.FC<ScheduleEditableProps> = ({ template, shiftTypes }) => {

	return (
		<div className="h-96 bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-center">
			Schedule Grid Area
		</div>
	);
};

export default ScheduleEditable;
