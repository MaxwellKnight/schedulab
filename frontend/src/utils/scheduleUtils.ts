export interface RenderConfig {
	baseHeight: number;
	spacing: number;
	zoomLevel: number;
}

export const getRenderConfig = (zoomLevel: number): RenderConfig => ({
	baseHeight: 24 * zoomLevel,
	spacing: 6 * zoomLevel,
	zoomLevel
});

export const calculateShiftGroupHeight = (requiredCount: number, config: RenderConfig) => {
	const { baseHeight, spacing } = config;
	return (baseHeight * requiredCount) + (spacing * (requiredCount - 1));
};

export const filterTimeSlots = (timeSlots: string[], start: number, end: number) =>
	timeSlots.filter(slot => {
		const hour = parseInt(slot.split(':')[0]);
		return hour >= start && hour < end;
	});
