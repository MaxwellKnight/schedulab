import { TemplateScheduleData } from '@/types/template.dto';
import { DraggedMember, MemberAssignment } from './Schedule';
import { AutoAssignPreferences } from './ScheduleSettings';
import { UserData } from '@/types';

export interface DragData {
	type: 'new-member' | 'member';
	member: UserData;
	memberId?: string;
	shiftTypeId?: number;
	date?: string;
	timeSlot?: string;
	position?: number;
}

export interface DropData {
	type: 'slot';
	shiftTypeId: number;
	date: Date;
	timeSlot: string;
	position: number;
}

export interface ScheduleState {
	template: TemplateScheduleData | null;
	isDirty: boolean;
	leftSidebarOpen: boolean;
	rightSidebarOpen: boolean;
	assignments: MemberAssignment[];
	draggedMember: DraggedMember | null;
	isProcessingAutoAssign: boolean;
	autoAssignPreferences: AutoAssignPreferences;
}

export type ScheduleAction =
	| { type: 'SET_TEMPLATE'; payload: TemplateScheduleData | null }
	| { type: 'SET_IS_DIRTY'; payload: boolean }
	| { type: 'TOGGLE_LEFT_SIDEBAR' }
	| { type: 'TOGGLE_RIGHT_SIDEBAR' }
	| { type: 'SET_ASSIGNMENTS'; payload: MemberAssignment[] }
	| { type: 'ADD_ASSIGNMENT'; payload: MemberAssignment }
	| { type: 'REMOVE_ASSIGNMENT'; payload: MemberAssignment }
	| { type: 'UPDATE_ASSIGNMENT'; payload: { old: MemberAssignment; new: MemberAssignment } }
	| { type: 'CLEAR_ASSIGNMENTS' }
	| { type: 'SET_DRAGGED_MEMBER'; payload: DraggedMember | null }
	| { type: 'SET_PROCESSING_AUTO_ASSIGN'; payload: boolean }
	| { type: 'SET_AUTO_ASSIGN_PREFERENCES'; payload: AutoAssignPreferences };

export const initialState: ScheduleState = {
	template: null,
	isDirty: false,
	leftSidebarOpen: true,
	rightSidebarOpen: true,
	assignments: [],
	draggedMember: null,
	isProcessingAutoAssign: false,
	autoAssignPreferences: {
		respectExisting: true,
		balanceLoad: true,
		considerStudentStatus: true
	}
};

export function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
	switch (action.type) {
		case 'SET_TEMPLATE':
			return {
				...state,
				template: action.payload,
				isDirty: false,
				assignments: []
			};

		case 'SET_IS_DIRTY':
			return {
				...state,
				isDirty: action.payload
			};

		case 'TOGGLE_LEFT_SIDEBAR':
			return {
				...state,
				leftSidebarOpen: !state.leftSidebarOpen
			};

		case 'TOGGLE_RIGHT_SIDEBAR':
			return {
				...state,
				rightSidebarOpen: !state.rightSidebarOpen
			};

		case 'SET_ASSIGNMENTS':
			return {
				...state,
				assignments: action.payload,
				isDirty: true
			};

		case 'ADD_ASSIGNMENT':
			return {
				...state,
				assignments: [...state.assignments, action.payload],
				isDirty: true
			};

		case 'REMOVE_ASSIGNMENT':
			return {
				...state,
				assignments: state.assignments.filter(a =>
					!(a.memberId === action.payload.memberId &&
						a.shiftTypeId === action.payload.shiftTypeId &&
						a.date === action.payload.date &&
						a.timeSlot === action.payload.timeSlot &&
						a.position === action.payload.position)
				),
				isDirty: true
			};

		case 'UPDATE_ASSIGNMENT':
			return {
				...state,
				assignments: state.assignments.map(a =>
					(a.memberId === action.payload.old.memberId &&
						a.shiftTypeId === action.payload.old.shiftTypeId &&
						a.date === action.payload.old.date &&
						a.timeSlot === action.payload.old.timeSlot &&
						a.position === action.payload.old.position)
						? action.payload.new
						: a
				),
				isDirty: true
			};

		case 'CLEAR_ASSIGNMENTS':
			return {
				...state,
				assignments: [],
				isDirty: true
			};

		case 'SET_DRAGGED_MEMBER':
			return {
				...state,
				draggedMember: action.payload
			};

		case 'SET_PROCESSING_AUTO_ASSIGN':
			return {
				...state,
				isProcessingAutoAssign: action.payload
			};

		case 'SET_AUTO_ASSIGN_PREFERENCES':
			return {
				...state,
				autoAssignPreferences: action.payload
			};

		default:
			return state;
	}
}

