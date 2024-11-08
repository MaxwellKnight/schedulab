import { MemberAssignment } from "@/pages/Schedule/Schedule";
import { UserData } from "@/types";
import { TemplateScheduleData, TemplateShiftData } from "@/types/template.dto";

interface TimeWindow {
	start: Date;
	end: Date;
}

class AssignmentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AssignmentError';
	}
}

export class ShiftAssignmentSolver {
	private assignments: MemberAssignment[] = [];
	private constraints: Map<number, Set<number>> = new Map();
	private userAssignmentCounts: Map<string, number> = new Map();

	constructor(
		private template: TemplateScheduleData,
		private users: UserData[],
		private existingAssignments: MemberAssignment[] = [],
		private options = {
			maxShiftsPerDay: 1,
			minRestHoursBetweenShifts: 8,
			maxHoursPerWeek: 40,
			considerStudentStatus: true
		}
	) {
		this.validateTemplate();
		this.buildConstraintsGraph();
		this.assignments = [...existingAssignments];
		this.initializeAssignmentCounts();
	}

	private validateTemplate() {
		if (!this.template.shifts || !Array.isArray(this.template.shifts)) {
			throw new AssignmentError('Template must contain shifts array');
		}
		if (!this.template.start_date || !this.template.end_date) {
			throw new AssignmentError('Template must have start and end dates');
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

	private buildConstraintsGraph() {
		if (!this.template.constraints) return;

		for (const constraintGroup of this.template.constraints) {
			for (let i = 0; i < constraintGroup.length - 1; i++) {
				const currentShift = constraintGroup[i].shift_type_id;
				const nextShift = constraintGroup[i + 1].shift_type_id;

				if (!this.constraints.has(currentShift)) {
					this.constraints.set(currentShift, new Set());
				}
				this.constraints.get(currentShift)?.add(nextShift);
			}
		}
	}


	private getTimeWindow(date: string | Date, timeSlot: string): TimeWindow {
		const baseDate = new Date(date);
		const [startHour, startMinute] = timeSlot.split(':').map(Number);

		const start = new Date(baseDate);
		start.setHours(startHour, startMinute, 0, 0);

		// Assuming each shift is 8 hours by default
		const end = new Date(start);
		end.setHours(start.getHours() + 8);

		return { start, end };
	}

	private isTimeOverlapping(window1: TimeWindow, window2: TimeWindow): boolean {
		return window1.start < window2.end && window2.start < window1.end;
	}

	private getWeeklyHours(userId: string, newAssignment: MemberAssignment): number {
		const newWindow = this.getTimeWindow(newAssignment.date, newAssignment.timeSlot);
		const weekStart = new Date(newWindow.start);
		weekStart.setDate(weekStart.getDate() - weekStart.getDay());
		weekStart.setHours(0, 0, 0, 0);

		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 7);

		const weeklyAssignments = this.assignments.filter(a => {
			if (a.memberId !== userId) return false;
			const window = this.getTimeWindow(a.date, a.timeSlot);
			return window.start >= weekStart && window.start < weekEnd;
		});

		// Assume 8 hours per shift for this calculation
		return (weeklyAssignments.length + 1) * 8;
	}

	private async validateAssignment(assignment: MemberAssignment): Promise<boolean> {
		const userId = assignment.memberId;
		const newWindow = this.getTimeWindow(assignment.date, assignment.timeSlot);

		// Check if position is already taken for this shift
		const positionTaken = this.assignments.some(a =>
			a.shiftTypeId === assignment.shiftTypeId &&
			a.date === assignment.date &&
			a.timeSlot === assignment.timeSlot &&
			a.position === assignment.position
		);
		if (positionTaken) return false;

		// Check daily shift limit
		const dayAssignments = this.assignments.filter(a => {
			if (a.memberId !== userId) return false;
			const assignmentDate = new Date(a.date);
			const newDate = new Date(assignment.date);
			return assignmentDate.toDateString() === newDate.toDateString();
		});
		if (dayAssignments.length >= this.options.maxShiftsPerDay) return false;

		// Check weekly hours limit
		const weeklyHours = this.getWeeklyHours(userId, assignment);
		if (weeklyHours > this.options.maxHoursPerWeek) return false;

		// Check minimum rest period and constraints
		for (const existing of this.assignments) {
			if (existing.memberId !== userId) continue;

			const existingWindow = this.getTimeWindow(existing.date, existing.timeSlot);

			// Check for direct overlap
			if (this.isTimeOverlapping(newWindow, existingWindow)) {
				return false;
			}

			// Check minimum rest period
			const timeBetween = Math.abs(newWindow.start.getTime() - existingWindow.end.getTime());
			const hoursBetween = timeBetween / (1000 * 60 * 60);
			if (hoursBetween < this.options.minRestHoursBetweenShifts) {
				return false;
			}

			// Check shift sequence constraints
			if (hoursBetween <= 24) {
				const constrainedShifts = this.constraints.get(existing.shiftTypeId);
				if (constrainedShifts?.has(assignment.shiftTypeId)) {
					return false;
				}
			}
		}

		return true;
	}

	private getUserScore(user: UserData): number {
		let score = 0;

		// Prefer users with fewer assignments
		const assignmentCount = this.userAssignmentCounts.get(user.id.toString()) || 0;
		score -= assignmentCount;

		// Consider student status if enabled
		if (this.options.considerStudentStatus && user.student) {
			score -= 5; // Lower priority for students
		}

		return score;
	}

	private async backtrack(
		date: Date,
		shift: TemplateShiftData,
		timeSlot: string,
		position: number
	): Promise<boolean> {
		if (position >= shift.required_count) {
			return true;
		}

		// Sort users by score for better assignment distribution
		const sortedUsers = [...this.users].sort((a, b) =>
			this.getUserScore(b) - this.getUserScore(a)
		);

		for (const user of sortedUsers) {
			const assignment: MemberAssignment = {
				memberId: user.id.toString(),
				shiftTypeId: shift.shift_type_id,
				date: date.toISOString(),
				timeSlot,
				position
			};

			if (await this.validateAssignment(assignment)) {
				// Make the assignment
				this.assignments.push(assignment);
				const currentCount = this.userAssignmentCounts.get(user.id.toString()) || 0;
				this.userAssignmentCounts.set(user.id.toString(), currentCount + 1);

				// Try to assign the next position
				const success = await this.backtrack(date, shift, timeSlot, position + 1);
				if (success) {
					return true;
				}

				// If unsuccessful, backtrack
				this.assignments.pop();
				this.userAssignmentCounts.set(user.id.toString(), currentCount);
			}
		}

		return false;
	}

	public async solve(): Promise<MemberAssignment[]> {
		try {
			const startDate = new Date(this.template.start_date);
			const endDate = new Date(this.template.end_date);

			for (
				let currentDate = new Date(startDate);
				currentDate <= endDate;
				currentDate.setDate(currentDate.getDate() + 1)
			) {
				const dayOfWeek = currentDate.getDay();
				const shifts = this.template.shifts.filter(s => s.day_of_week === dayOfWeek);

				for (const shift of shifts) {
					for (const range of shift.ranges) {
						const success = await this.backtrack(
							new Date(currentDate),
							shift,
							range.start_time,
							0
						);

						if (!success) {
							throw new AssignmentError(
								`Unable to find valid assignment for shift ${shift.shift_name} on ${currentDate.toDateString()}`
							);
						}
					}
				}
			}

			return this.assignments;
		} catch (error) {
			if (error instanceof AssignmentError) {
				throw error;
			}
			throw new AssignmentError('An unexpected error occurred while creating the schedule');
		}
	}
}

export const createOptimalSchedule = async (
	template: TemplateScheduleData,
	users: UserData[],
	existingAssignments: MemberAssignment[] = []
): Promise<MemberAssignment[]> => {
	try {
		const solver = new ShiftAssignmentSolver(template, users, existingAssignments);
		return await solver.solve();
	} catch (error) {
		console.error('Failed to create schedule:', error);
		throw error;
	}
};
