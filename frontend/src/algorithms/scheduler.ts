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

interface Assignment {
	memberId: string;
	shiftSlot: ShiftSlot;
	position: number;
}

class CSPSolver {
	private assignments: Assignment[] = [];
	private bestAssignments: Assignment[] = [];
	private bestScore: number = 0;
	private userAssignmentCounts: Map<string, number> = new Map();
	private dailyAssignments: Map<string, Map<string, number>> = new Map();
	private timeWindows: Map<string, TimeWindow> = new Map();

	constructor(
		private slots: ShiftSlot[],
		private users: UserData[],
		private options: {
			maxShiftsPerDay: number;
			minRestHoursBetweenShifts: number;
			maxHoursPerWeek: number;
			considerStudentStatus: boolean;
		}
	) {
		this.initializeMaps();
	}

	private initializeMaps() {
		this.users.forEach(user => {
			this.userAssignmentCounts.set(user.id.toString(), 0);
		});
	}

	private getTimeWindow(slot: ShiftSlot): TimeWindow {
		const key = `${slot.date.toISOString()}_${slot.timeSlot}`;
		if (!this.timeWindows.has(key)) {
			const baseDate = slot.date;
			const [startHour, startMinute] = slot.timeSlot.split(':').map(Number);
			const start = new Date(baseDate);
			start.setHours(startHour, startMinute, 0, 0);
			const end = new Date(start);
			end.setHours(start.getHours() + 8);
			this.timeWindows.set(key, { start, end });
		}
		return this.timeWindows.get(key)!;
	}

	private isTimeOverlapping(w1: TimeWindow, w2: TimeWindow): boolean {
		return w1.start < w2.end && w2.start < w1.end;
	}

	private getDayKey(date: Date): string {
		return date.toISOString().split('T')[0];
	}


	private validate(userId: string, slot: ShiftSlot): boolean {
		const dayKey = this.getDayKey(slot.date);

		const dailyShifts = this.dailyAssignments.get(dayKey)?.get(userId) || 0;
		if (dailyShifts >= this.options.maxShiftsPerDay) return false;

		const weeklyHours = ((this.userAssignmentCounts.get(userId) || 0) + 1) * 8;
		if (weeklyHours > this.options.maxHoursPerWeek) return false;

		// Check time overlaps and rest hours
		const newWindow = this.getTimeWindow(slot);
		for (const assignment of this.assignments) {
			if (assignment.memberId === userId) {
				const existingWindow = this.getTimeWindow(assignment.shiftSlot);

				if (this.isTimeOverlapping(newWindow, existingWindow)) return false;

				const hoursBetween = Math.abs(newWindow.start.getTime() - existingWindow.start.getTime()) / 3600000;
				if (hoursBetween < this.options.minRestHoursBetweenShifts) return false;
			}
		}

		return true;
	}

	private calculateScore(): number {
		// Calculate coverage and balance score
		const coverage = this.assignments.length;
		const balance = -Math.max(...Array.from(this.userAssignmentCounts.values()));
		return coverage * 1000 + balance;
	}

	private updateBestSolution() {
		const currentScore = this.calculateScore();
		if (currentScore > this.bestScore) {
			this.bestScore = currentScore;
			this.bestAssignments = [...this.assignments];
		}
	}

	private sortUsersByPreference(): UserData[] {
		return [...this.users].sort((a, b) => {
			const aCount = this.userAssignmentCounts.get(a.id.toString()) || 0;
			const bCount = this.userAssignmentCounts.get(b.id.toString()) || 0;

			// Prioritize users with fewer assignments
			if (aCount !== bCount) return aCount - bCount;

			// Deprioritize students if configured
			if (this.options.considerStudentStatus && a.student !== b.student) {
				return a.student ? 1 : -1;
			}

			return 0;
		});
	}

	private assignSlot(slot: ShiftSlot, position: number): boolean {
		const sortedUsers = this.sortUsersByPreference();

		for (const user of sortedUsers) {
			const userId = user.id.toString();

			if (this.validate(userId, slot)) {
				const assignment: Assignment = {
					memberId: userId,
					shiftSlot: slot,
					position
				};

				this.assignments.push(assignment);

				const dayKey = this.getDayKey(slot.date);
				if (!this.dailyAssignments.has(dayKey)) {
					this.dailyAssignments.set(dayKey, new Map());
				}
				const dailyMap = this.dailyAssignments.get(dayKey)!;
				dailyMap.set(userId, (dailyMap.get(userId) || 0) + 1);

				this.userAssignmentCounts.set(userId, (this.userAssignmentCounts.get(userId) || 0) + 1);

				return true;
			}
		}

		return false;
	}

	solve(): Assignment[] {
		const sortedSlots = [...this.slots].sort((a, b) => {
			const dateCompare = a.date.getTime() - b.date.getTime();
			return dateCompare || a.timeSlot.localeCompare(b.timeSlot);
		});

		for (const slot of sortedSlots) {
			const requiredCount = slot.shift.required_count;

			for (let position = 0; position < requiredCount; position++) {
				if (this.assignSlot(slot, position)) {
					this.updateBestSolution();
				}
			}
		}

		return this.bestAssignments;
	}
}

export interface SolverOptions {
	maxShiftsPerDay: number;
	minRestHoursBetweenShifts: number;
	maxHoursPerWeek: number;
	considerStudentStatus: boolean;
	useExistingAssignments: boolean;
}

export const defaultSolverOptions: SolverOptions = {
	maxShiftsPerDay: 1,
	minRestHoursBetweenShifts: 8,
	maxHoursPerWeek: 80,
	considerStudentStatus: true,
	useExistingAssignments: true
}

export class Solver {
	private allShiftSlots: ShiftSlot[] = [];
	private constraints: Map<number, Set<number>> = new Map();

	constructor(
		private template: TemplateScheduleData,
		private users: UserData[],
		private existingAssignments: MemberAssignment[] = [],
		private options: SolverOptions = defaultSolverOptions
	) {
		if (!template.shifts?.length || !template.start_date || !template.end_date) {
			throw new Error('Invalid template data');
		}
		this.buildConstraintsGraph();
		this.buildShiftSlots();
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
	}

	public solve(): MemberAssignment[] {
		const cspSolver = new CSPSolver(
			this.allShiftSlots,
			this.users,
			this.options
		);

		const csAssignments = cspSolver.solve();

		const newAssignments: MemberAssignment[] = csAssignments.map(assignment => ({
			memberId: assignment.memberId,
			shiftTypeId: assignment.shiftSlot.shift.shift_type_id,
			date: assignment.shiftSlot.date.toISOString(),
			timeSlot: assignment.shiftSlot.timeSlot,
			position: assignment.position
		}));

		return [...(this.options.useExistingAssignments ? this.existingAssignments : []), ...newAssignments];
	}
}

export const BuildSchedule = (
	template: TemplateScheduleData,
	users: UserData[],
	existingAssignments: MemberAssignment[] = [],
	defaultOptions?: SolverOptions
): MemberAssignment[] => {
	const solver = new Solver(template, users, existingAssignments, defaultOptions);
	return solver.solve();
};
