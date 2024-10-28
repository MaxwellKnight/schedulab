interface RangeShifts {
	[date: string]: Shift[];
}

interface EmployeePreferences {
	[date: string]: [boolean, boolean, boolean];
}

export class Employee {
	private readonly _name: string;
	private readonly _id: number;
	private readonly _preferences: EmployeePreferences;

	constructor(name: string, id: number, preferences: EmployeePreferences) {
		this._name = name;
		this._id = id;
		this._preferences = preferences;
	}

	public get name(): string {
		return this._name;
	}

	public get id(): number {
		return this._id;
	}

	public get preferences() {
		return this._preferences;
	}
}

export class Shift {
	constructor(
		public readonly shiftName: string,
		public readonly requiredPeople: number,
		public readonly users: Employee[]
	) { }

	public isValid(peopleCount: number): boolean {
		return this.users.length >= peopleCount;
	}

	public isFull(): boolean {
		return this.users.length >= this.requiredPeople;
	}

	public addUser(user: Employee): void {
		this.users.push(user);
	}

	public removeUser(user: Employee): void {
		const index = this.users.indexOf(user);
		if (index > -1) {
			this.users.splice(index, 1);
		}
	}

	public toString(): string {
		return this.shiftName;
	}
}

export class Schedule {
	private readonly _days: number;
	private readonly _shifts: RangeShifts;

	constructor(days: number, shifts: RangeShifts) {
		this._days = days;
		this._shifts = { ...shifts };
	}

	public get days(): number {
		return this._days;
	}

	public get shifts(): RangeShifts {
		return this._shifts;
	}

	public addShift(date: string, shift: Shift): void {
		this._shifts[date] = this._shifts[date] || [];
		this._shifts[date].push(shift);
	}

	public removeShift(date: string, shift: Shift): void {
		const index = this._shifts[date].indexOf(shift);
		if (index > -1) {
			this._shifts[date].splice(index, 1);
		}
	}

	public toString(): string {
		return JSON.stringify(this._shifts);
	}
}
