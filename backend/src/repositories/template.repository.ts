import { Database } from "../configs/db.config";
import { TemplateSchedule, TemplateShift, TemplateConstraint, TemplateTimeRange } from "../models";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface MySQLError extends Error {
	code?: string;
	errno?: number;
	sqlMessage?: string;
	sqlState?: string;
}

interface TemplateScheduleRow extends RowDataPacket, Omit<TemplateSchedule, 'start_date' | 'end_date' | 'created_at' | 'shifts' | 'constraints'> {
	start_date: string;
	end_date: string;
	created_at: string;
}

interface TemplateShiftRow extends RowDataPacket, Omit<TemplateShift, 'ranges'> {
	time_ranges: string | null;
}

interface TemplateConstraintRow extends RowDataPacket, TemplateConstraint { }

export class TemplateScheduleRepository {
	private readonly db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	private isMySQLError(error: unknown): error is MySQLError {
		return (
			typeof error === 'object' &&
			error !== null &&
			'code' in error &&
			typeof (error as MySQLError).code === 'string'
		);
	}

	private formatDate(date: Date | string): string {
		return new Date(date).toISOString().split('T')[0];
	}

	async create(templateSchedule: Omit<TemplateSchedule, "id" | "created_at">): Promise<number> {
		const shiftTypeMap = new Map<number, number>();

		for (const shift of templateSchedule.shifts) {
			if (!shiftTypeMap.has(shift.shift_type_id)) {
				try {
					const result = await this.db.execute<ResultSetHeader>(
						"INSERT INTO shift_types (id, name, team_id) VALUES (?, ?, ?)",
						[shift.shift_type_id, shift.shift_name, templateSchedule.team_id]
					);
					shiftTypeMap.set(shift.shift_type_id, result[0].insertId);
				} catch (error: unknown) {
					if (this.isMySQLError(error) && error.code === 'ER_DUP_ENTRY') {
						const [rows] = await this.db.execute<RowDataPacket[]>(
							"SELECT id FROM shift_types WHERE name = ? AND team_id = ?",
							[shift.shift_name, templateSchedule.team_id]
						);
						const existingShiftType = rows[0];
						if (existingShiftType) {
							shiftTypeMap.set(shift.shift_type_id, existingShiftType.id);
						} else {
							throw new Error(`Unexpected state: Duplicate entry error but shift type not found for ${shift.shift_name}`);
						}
					} else {
						throw error;
					}
				}
			}
		}

		const result = await this.db.execute<ResultSetHeader>(
			"INSERT INTO template_schedules (team_id, name, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?)",
			[
				templateSchedule.team_id,
				templateSchedule.name,
				this.formatDate(templateSchedule.start_date),
				this.formatDate(templateSchedule.end_date),
				templateSchedule.notes
			]
		);
		const templateScheduleId = result[0].insertId;

		for (const shift of templateSchedule.shifts) {
			const shiftTypeId = shiftTypeMap.get(shift.shift_type_id);
			if (!shiftTypeId) {
				throw new Error(`Shift type not found: ${shift.shift_type_id}`);
			}
			const shiftResult = await this.db.execute<ResultSetHeader>(
				"INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week) VALUES (?, ?, ?, ?, ?)",
				[templateScheduleId, shiftTypeId, shift.shift_name, shift.required_count, shift.day_of_week]
			);
			const templateShiftId = shiftResult[0].insertId;

			for (const range of shift.ranges) {
				await this.db.execute<ResultSetHeader>(
					"INSERT INTO template_time_ranges (template_shift_id, start_time, end_time) VALUES (?, ?, ?)",
					[templateShiftId, range.start_time, range.end_time]
				);
			}
		}

		for (const constraintPair of templateSchedule.constraints) {
			const firstShiftTypeId = shiftTypeMap.get(constraintPair[0].shift_type_id);
			const secondShiftTypeId = constraintPair[1] ? shiftTypeMap.get(constraintPair[1].shift_type_id) : null;

			if (!firstShiftTypeId) {
				throw new Error(`Shift type not found for constraint: ${constraintPair[0].shift_type_id}`);
			}
			if (constraintPair[1] && !secondShiftTypeId) {
				throw new Error(`Shift type not found for constraint: ${constraintPair[1].shift_type_id}`);
			}

			await this.db.execute<ResultSetHeader>(
				"INSERT INTO template_constraints (template_schedule_id, shift_type_id, next_shift_type_id) VALUES (?, ?, ?)",
				[templateScheduleId, firstShiftTypeId, secondShiftTypeId]
			);
		}

		return templateScheduleId;
	}

	async getOne(id: number): Promise<TemplateSchedule | null> {
		const [rows] = await this.db.execute<TemplateScheduleRow[]>(
			"SELECT * FROM template_schedules WHERE id = ?",
			[id]
		);

		if (rows.length === 0) {
			return null;
		}

		const templateSchedule = rows[0];
		const shifts = await this.getTemplateShifts(id);
		const constraints = await this.getTemplateConstraints(id);

		return this.mapToTemplateSchedule(templateSchedule, shifts, constraints);
	}

	private async getTemplateShifts(templateScheduleId: number): Promise<TemplateShift[]> {
		const [rows] = await this.db.execute<TemplateShiftRow[]>(
			`SELECT ts.*, 
                GROUP_CONCAT(
                    CONCAT(ttr.id, ':', ttr.start_time, '-', ttr.end_time) 
                    SEPARATOR ','
                ) as time_ranges
            FROM template_shifts ts
            LEFT JOIN template_time_ranges ttr ON ts.id = ttr.template_shift_id
            WHERE ts.template_schedule_id = ?
            GROUP BY ts.id`,
			[templateScheduleId]
		);

		return rows.map(shift => this.mapToTemplateShift(shift));
	}

	private async getTemplateConstraints(templateScheduleId: number): Promise<TemplateConstraint[][]> {
		const [rows] = await this.db.execute<TemplateConstraintRow[]>(
			"SELECT * FROM template_constraints WHERE template_schedule_id = ? ORDER BY id",
			[templateScheduleId]
		);

		const constraintPairs: TemplateConstraint[][] = [];
		for (let i = 0; i < rows.length; i += 2) {
			constraintPairs.push([rows[i], rows[i + 1] || null]);
		}

		return constraintPairs;
	}

	private mapToTemplateSchedule(
		row: TemplateScheduleRow,
		shifts: TemplateShift[],
		constraints: TemplateConstraint[][]
	): TemplateSchedule {
		return {
			...row,
			start_date: new Date(row.start_date),
			end_date: new Date(row.end_date),
			created_at: new Date(row.created_at),
			shifts,
			constraints
		};
	}

	private mapToTemplateShift(row: TemplateShiftRow): TemplateShift {
		return {
			...row,
			ranges: row.time_ranges
				? row.time_ranges.split(',').map(range => {
					const [idAndStart, end] = range.split('-');
					const [id, ...startParts] = idAndStart.split(':');
					const startTime = startParts.join(':');
					return {
						id: parseInt(id),
						template_shift_id: row.id,
						start_time: startTime,
						end_time: end
					} as TemplateTimeRange;
				})
				: []
		};
	}

	async getMany(): Promise<TemplateSchedule[]> {
		const [rows] = await this.db.execute<TemplateScheduleRow[]>(
			"SELECT * FROM template_schedules"
		);

		const schedules = await Promise.all(
			rows.map(async (ts) => {
				const schedule = await this.getOne(ts.id!);
				if (!schedule) {
					throw new Error(`Template schedule ${ts.id} not found during getMany()`);
				}
				return schedule;
			})
		);

		return schedules;
	}

	async getByTeamId(teamId: number): Promise<TemplateSchedule[]> {
		const [rows] = await this.db.execute<TemplateScheduleRow[]>(
			"SELECT * FROM template_schedules WHERE team_id = ?",
			[teamId]
		);

		const schedules = await Promise.all(
			rows.map(async (ts) => {
				const schedule = await this.getOne(ts.id!);
				if (!schedule) {
					throw new Error(`Template schedule ${ts.id} not found during getByTeamId()`);
				}
				return schedule;
			})
		);

		return schedules;
	}

	async update(templateSchedule: Omit<TemplateSchedule, "created_at">): Promise<number> {
		await this.db.execute<ResultSetHeader>(
			"UPDATE template_schedules SET name = ?, start_date = ?, end_date = ?, notes = ? WHERE id = ?",
			[
				templateSchedule.name,
				this.formatDate(templateSchedule.start_date),
				this.formatDate(templateSchedule.end_date),
				templateSchedule.notes,
				templateSchedule.id
			]
		);

		// Delete existing related records
		await this.db.execute<ResultSetHeader>(
			"DELETE FROM template_time_ranges WHERE template_shift_id IN (SELECT id FROM template_shifts WHERE template_schedule_id = ?)",
			[templateSchedule.id]
		);
		await this.db.execute<ResultSetHeader>(
			"DELETE FROM template_shifts WHERE template_schedule_id = ?",
			[templateSchedule.id]
		);
		await this.db.execute<ResultSetHeader>(
			"DELETE FROM template_constraints WHERE template_schedule_id = ?",
			[templateSchedule.id]
		);

		// Insert new shifts and their time ranges
		for (const shift of templateSchedule.shifts) {
			const shiftResult = await this.db.execute<ResultSetHeader>(
				"INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week) VALUES (?, ?, ?, ?, ?)",
				[
					templateSchedule.id,
					shift.shift_type_id,
					shift.shift_name,
					shift.required_count,
					shift.day_of_week
				]
			);
			const templateShiftId = shiftResult[0].insertId;

			for (const range of shift.ranges) {
				await this.db.execute<ResultSetHeader>(
					"INSERT INTO template_time_ranges (template_shift_id, start_time, end_time) VALUES (?, ?, ?)",
					[templateShiftId, range.start_time, range.end_time]
				);
			}
		}

		// Insert new constraints
		for (const constraintPair of templateSchedule.constraints) {
			await this.db.execute<ResultSetHeader>(
				"INSERT INTO template_constraints (template_schedule_id, shift_type_id, next_shift_type_id) VALUES (?, ?, ?)",
				[
					templateSchedule.id,
					constraintPair[0].shift_type_id,
					constraintPair[1]?.shift_type_id
				]
			);
		}

		return templateSchedule.id!;
	}

	async delete(id: number): Promise<number> {
		// Delete related records in reverse order of dependencies
		await this.db.execute<ResultSetHeader>(
			"DELETE FROM template_time_ranges WHERE template_shift_id IN (SELECT id FROM template_shifts WHERE template_schedule_id = ?)",
			[id]
		);
		await this.db.execute<ResultSetHeader>(
			"DELETE FROM template_shifts WHERE template_schedule_id = ?",
			[id]
		);
		await this.db.execute<ResultSetHeader>(
			"DELETE FROM template_constraints WHERE template_schedule_id = ?",
			[id]
		);

		const result = await this.db.execute<ResultSetHeader>(
			"DELETE FROM template_schedules WHERE id = ?",
			[id]
		);
		return result[0].affectedRows;
	}

	async createScheduleFromTemplate(templateId: number, startDate: Date): Promise<number> {
		const templateSchedule = await this.getOne(templateId);
		if (!templateSchedule) {
			throw new Error("Template schedule not found");
		}

		const daysDiff = (templateSchedule.end_date.getTime() - templateSchedule.start_date.getTime()) / (1000 * 3600 * 24);
		const endDate = new Date(startDate.getTime() + daysDiff * 24 * 60 * 60 * 1000);

		const [scheduleResult] = await this.db.execute<ResultSetHeader>(
			"INSERT INTO schedules (team_id, start_date, end_date, published, notes) VALUES (?, ?, ?, FALSE, ?)",
			[
				templateSchedule.team_id,
				this.formatDate(startDate),
				this.formatDate(endDate),
				templateSchedule.notes
			]
		);
		const scheduleId = scheduleResult.insertId;

		for (const templateShift of templateSchedule.shifts) {
			const shiftDate = new Date(startDate.getTime() + templateShift.day_of_week * 24 * 60 * 60 * 1000);
			const [shiftResult] = await this.db.execute<ResultSetHeader>(
				"INSERT INTO shifts (schedule_id, shift_type_id, shift_name, required_count, actual_count, date) VALUES (?, ?, ?, ?, 0, ?)",
				[
					scheduleId,
					templateShift.shift_type_id,
					templateShift.shift_name,
					templateShift.required_count,
					this.formatDate(shiftDate)
				]
			);
			const shiftId = shiftResult.insertId;

			for (const range of templateShift.ranges) {
				await this.db.execute<ResultSetHeader>(
					"INSERT INTO time_ranges (shift_id, start_time, end_time) VALUES (?, ?, ?)",
					[shiftId, range.start_time, range.end_time]
				);
			}
		}

		for (const constraintPair of templateSchedule.constraints) {
			await this.db.execute<ResultSetHeader>(
				"INSERT INTO constraints (schedule_id, shift_type_id, next_shift_type_id) VALUES (?, ?, ?)",
				[
					scheduleId,
					constraintPair[0].shift_type_id,
					constraintPair[1]?.shift_type_id
				]
			);
		}

		return scheduleId;
	}
}
