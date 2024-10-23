import { TemplateScheduleData } from "@/types/template.dto";

interface ScheduleEditableProps {
	template: TemplateScheduleData;
}

const ScheduleEditable = (_: ScheduleEditableProps) => {
	return (
		<div className="h-96 bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-center">
			Schedule Grid Area
		</div>
	);
};

export default ScheduleEditable;
