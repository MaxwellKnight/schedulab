import { MemberAssignment } from "@/pages/Schedule/Schedule";
import { UserData } from "@/types";
import { TemplateScheduleData, TemplateShiftData } from "@/types/template.dto";

interface TimeWindow {
	start: Date;
	end: Date;
}

interface ShiftSlot {
	date: Date;
	shift: TemplateShiftData;
	timeSlot: string;
}

export class Solver {
	private assignments: MemberAssignment[] = [];
	private bestAssignments: MemberAssignment[] = [];
	private bestCoverage: number = 0;
	private totalRequiredPositions: number = 0;
	private constraints: Map<number, Set<number>> = new Map();
	private userAssignmentCounts: Map<string, number> = new Map();
	private allShiftSlots: ShiftSlot[] = [];
	private remainingPositionsPerSlot: Map<string, number> = new Map();

	constructor(
		private template: TemplateScheduleData,
		private users: UserData[],
		private existingAssignments: MemberAssignment[] = [],
		private options = {
			maxShiftsPerDay: 2,
			minRestHoursBetweenShifts: 0,
			maxHoursPerWeek: 80,
			considerStudentStatus: true,
			useExistingAssignments: true
		}
	) {
		if (!template.shifts?.length || !template.start_date || !template.end_date) {
			throw new Error('Invalid template data');
		}
		this.buildConstraintsGraph();

		if (this.options.useExistingAssignments) {
			this.assignments = [...existingAssignments];
		}

		this.initializeAssignmentCounts();
		this.buildShiftSlots();
		this.initializeRemainingPositions();
	}

	// New method to initialize remaining positions
	private initializeRemainingPositions() {
		this.remainingPositionsPerSlot.clear();

		// First, set initial required counts
		for (const slot of this.allShiftSlots) {
			const key = this.getSlotKey(slot);
			this.remainingPositionsPerSlot.set(key, slot.shift.required_count);
		}

		// Then subtract existing assignments
		if (this.options.useExistingAssignments) {
			for (const assignment of this.existingAssignments) {
				const key = `${assignment.date}_${assignment.timeSlot}_${assignment.shiftTypeId}`;
				const current = this.remainingPositionsPerSlot.get(key) || 0;
				if (current > 0) {
					this.remainingPositionsPerSlot.set(key, current - 1);
				}
			}
		}

		// Calculate total required positions based on remaining positions
		this.totalRequiredPositions = Array.from(this.remainingPositionsPerSlot.values())
			.reduce((sum, count) => sum + count, 0);
	}

	private getSlotKey(slot: ShiftSlot): string {
		return `${slot.date.toISOString()}_${slot.timeSlot}_${slot.shift.shift_type_id}`;
	}

	private buildConstraintsGraph() {
		if (!this.template.constraints) return;
		for (const group of this.template.constraints) {
			for (let i = 0; i < group.length - 1; i++) {
				const current = group[i].shift_type_id;
				const next = group[i + 1].shift_type_id;
				if (!this.constraints.has(current)) {
					this.constraints.set(current, new Set());
				}
				this.constraints.get(current)?.add(next);
			}
		}
	}

	private initializeAssignmentCounts() {
		this.users.forEach(user => {
			this.userAssignmentCounts.set(user.id.toString(), 0);
		});

		this.existingAssignments.forEach(assignment => {
			const count = this.userAssignmentCounts.get(assignment.memberId) || 0;
			this.userAssignmentCounts.set(assignment.memberId, count + 1);
		});
	}

	private buildShiftSlots() {
		const startDate = new Date(this.template.start_date);
		const endDate = new Date(this.template.end_date);

		for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
			const shifts = this.template.shifts.filter(s => s.day_of_week === date.getDay());
			for (const shift of shifts) {
				for (const range of shift.ranges) {
					this.allShiftSlots.push({
						date: new Date(date),
						shift,
						timeSlot: range.start_time.slice(0, 5)
					});
				}
			}
		}

		this.allShiftSlots.sort((a, b) => {
			const dateCompare = a.date.getTime() - b.date.getTime();
			return dateCompare || a.timeSlot.localeCompare(b.timeSlot);
		});
	}

	private getTimeWindow(date: string | Date, timeSlot: string): TimeWindow {
		const baseDate = new Date(date);
		const [startHour, startMinute] = timeSlot.split(':').map(Number);

		const start = new Date(baseDate);
		start.setHours(startHour, startMinute, 0, 0);

		const end = new Date(start);
		end.setHours(start.getHours() + 8);

		return { start, end };
	}

	private isTimeOverlapping(w1: TimeWindow, w2: TimeWindow): boolean {
		return w1.start < w2.end && w2.start < w1.end;
	}

	private getWeeklyHours(userId: string, newAssignment: MemberAssignment): number {
		const window = this.getTimeWindow(newAssignment.date, newAssignment.timeSlot);
		const weekStart = new Date(window.start);
		weekStart.setDate(weekStart.getDate() - weekStart.getDay());
		weekStart.setHours(0, 0, 0, 0);

		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 7);

		const weeklyCount = this.assignments.filter(a => {
			if (a.memberId !== userId) return false;
			const w = this.getTimeWindow(a.date, a.timeSlot);
			return w.start >= weekStart && w.start < weekEnd;
		}).length;

		return (weeklyCount + 1) * 8;
	}

	private validateAssignment(assignment: MemberAssignment): boolean {
		const userId = assignment.memberId;
		const newWindow = this.getTimeWindow(assignment.date, assignment.timeSlot);

		// Check if the slot has remaining positions
		const slotKey = `${assignment.date}_${assignment.timeSlot}_${assignment.shiftTypeId}`;
		const remainingPositions = this.remainingPositionsPerSlot.get(slotKey) || 0;
		if (remainingPositions <= 0) return false;

		const positionTaken = this.assignments.some(a =>
			a.shiftTypeId === assignment.shiftTypeId &&
			a.date === assignment.date &&
			a.timeSlot === assignment.timeSlot &&
			a.position === assignment.position
		);
		if (positionTaken) return false;

		const dayCount = this.assignments.filter(a => {
			if (a.memberId !== userId) return false;
			const aDate = new Date(a.date);
			const newDate = new Date(assignment.date);
			return aDate.toDateString() === newDate.toDateString();
		}).length;
		if (dayCount >= this.options.maxShiftsPerDay) return false;

		if (this.getWeeklyHours(userId, assignment) > this.options.maxHoursPerWeek) return false;

		for (const existing of this.assignments) {
			if (existing.memberId !== userId) continue;
			const existingWindow = this.getTimeWindow(existing.date, existing.timeSlot);
			if (this.isTimeOverlapping(newWindow, existingWindow)) return false;

			const hoursBetween = Math.abs(newWindow.start.getTime() - existingWindow.start.getTime()) / (1000 * 60 * 60);
			if (hoursBetween < this.options.minRestHoursBetweenShifts) return false;

			if (hoursBetween <= 24) {
				const constrainedShifts = this.constraints.get(existing.shiftTypeId);
				if (constrainedShifts?.has(assignment.shiftTypeId)) return false;
			}
		}

		return true;
	}

	private getUserScore(user: UserData): number {
		let score = -(this.userAssignmentCounts.get(user.id.toString()) || 0);
		if (this.options.considerStudentStatus && user.student) score -= 5;
		return score;
	}

	private updateBestSolution() {
		const coverage = (this.assignments.length / this.totalRequiredPositions) * 100;
		if (coverage > this.bestCoverage) {
			this.bestCoverage = coverage;
			this.bestAssignments = [...this.assignments];
		}
	}

	private backtrack(shiftIndex: number = 0): boolean {
		this.updateBestSolution();
		if (shiftIndex >= this.allShiftSlots.length) return true;

		const slot = this.allShiftSlots[shiftIndex];
		const slotKey = this.getSlotKey(slot);
		const remainingPositions = this.remainingPositionsPerSlot.get(slotKey) || 0;

		if (remainingPositions <= 0) {
			return this.backtrack(shiftIndex + 1);
		}

		const sortedUsers = [...this.users].sort((a, b) => this.getUserScore(b) - this.getUserScore(a));

		for (const user of sortedUsers) {
			const assignment: MemberAssignment = {
				memberId: user.id.toString(),
				shiftTypeId: slot.shift.shift_type_id,
				date: slot.date.toISOString(),
				timeSlot: slot.timeSlot,
				position: slot.shift.required_count - remainingPositions
			};

			if (this.validateAssignment(assignment)) {
				this.assignments.push(assignment);
				const currentCount = this.userAssignmentCounts.get(user.id.toString()) || 0;
				this.userAssignmentCounts.set(user.id.toString(), currentCount + 1);
				this.remainingPositionsPerSlot.set(slotKey, remainingPositions - 1);

				if (this.backtrack(remainingPositions - 1 <= 0 ? shiftIndex + 1 : shiftIndex)) {
					return true;
				}

				this.assignments.pop();
				this.userAssignmentCounts.set(user.id.toString(), currentCount);
				this.remainingPositionsPerSlot.set(slotKey, remainingPositions);
			}
		}

		return false;
	}

	public solve(): MemberAssignment[] {
		this.backtrack();
		return this.bestAssignments.length > 0 ? this.bestAssignments : this.assignments;
	}
}

export const BuildSchedule = (
	template: TemplateScheduleData,
	users: UserData[],
	existingAssignments: MemberAssignment[] = []
): MemberAssignment[] => {
	const solver = new Solver(template, users, existingAssignments);
	return solver.solve();
};
