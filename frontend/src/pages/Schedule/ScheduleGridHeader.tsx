import React from 'react';
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { ShiftType } from "@/types/shifts.dto";
import { getShiftAbbreviation } from "@/utils/shitUtils";
import { cn } from "@/lib/utils";
import { ScheduleGridState } from './ScheduleGrid';


export interface ScheduleHeaderProps {
	state: ScheduleGridState;
	onStateUpdate: (updates: Partial<ScheduleGridState>) => void;
	shiftTypes: ShiftType[];
	shiftColors: Record<string, string>;
}

export const ScheduleGridHeader: React.FC<ScheduleHeaderProps> = ({
	state,
	onStateUpdate,
	shiftTypes,
	shiftColors
}) => {
	const handleZoom = (direction: 'in' | 'out') => {
		const step = 0.25;
		const newZoom = direction === 'in'
			? Math.min(state.zoomLevel + step, 2)
			: Math.max(state.zoomLevel - step, 0.5);
		onStateUpdate({ zoomLevel: newZoom });
	};

	const handleTimeRange = (direction: 'left' | 'right') => {
		const step = 4;
		if (direction === 'left') {
			onStateUpdate({
				visibleHoursStart: Math.max(state.visibleHoursStart - step, 0),
				visibleHoursEnd: Math.max(state.visibleHoursEnd - step, step)
			});
		} else {
			onStateUpdate({
				visibleHoursStart: Math.min(state.visibleHoursStart + step, 20),
				visibleHoursEnd: Math.min(state.visibleHoursEnd + step, 24)
			});
		}
	};

	return (
		<CardHeader className={cn(
			"bg-white border-b sticky top-0",
			state.isFullScreen ? ["z-[9999]", "px-6 py-4", "shadow-sm"] : "z-20"
		)}>
			<div className="flex justify-between items-center">
				<CardTitle className="text-lg font-medium">Playground</CardTitle>
				<Button
					variant="outline"
					size="icon"
					onClick={() => onStateUpdate({ isFullScreen: !state.isFullScreen })}
					className="hover:bg-gray-100"
				>
					{state.isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
				</Button>
			</div>
			<div className="flex justify-between items-center pt-2">
				<div className="flex flex-wrap gap-2">
					{shiftTypes.map(type => (
						<div
							key={type.id}
							className={cn(
								'px-3 py-1.5 rounded-full text-xs font-medium',
								shiftColors[type.id],
								'shadow-sm transition-all hover:shadow-md cursor-pointer flex items-center space-x-1'
							)}
						>
							<span className="font-mono">{getShiftAbbreviation(type.name)}</span>
							<span className="text-xs text-gray-500">|</span>
							<span className="text-xs">{type.name}</span>
						</div>
					))}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => handleTimeRange('left')}
						disabled={state.visibleHoursStart === 0}
						className="hover:bg-gray-100"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => handleZoom('out')}
						disabled={state.zoomLevel <= 0.5}
						className="hover:bg-gray-100"
					>
						<ZoomOut className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => handleZoom('in')}
						disabled={state.zoomLevel >= 2}
						className="hover:bg-gray-100"
					>
						<ZoomIn className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => handleTimeRange('right')}
						disabled={state.visibleHoursEnd === 24}
						className="hover:bg-gray-100"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</CardHeader>
	);
};
