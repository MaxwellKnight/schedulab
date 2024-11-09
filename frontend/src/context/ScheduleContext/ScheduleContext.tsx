import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { initialState, scheduleReducer, ScheduleState } from './reducer';
import { TemplateScheduleData } from '@/types/template.dto';
import { UserData } from '@/types';
import { DraggedMember, MemberAssignment } from '@/pages/Schedule/Schedule';
import { AutoAssignPreferences } from '@/pages/Schedule/ScheduleSettings';
import { createOptimalSchedule } from '@/algorithms/scheduler';

interface ScheduleContextType {
	state: ScheduleState;
	handleTemplateSelect: (template: TemplateScheduleData | null) => void;
	handleSaveDraft: () => void;
	handlePublish: () => void;
	handleAutoAssign: (members: UserData[]) => Promise<void>;
	handleClearAssignments: () => void;
	toggleLeftSidebar: () => void;
	toggleRightSidebar: () => void;
	handleDraggedMember: (member: DraggedMember | null) => void;
	updateAutoAssignPreferences: (prefs: AutoAssignPreferences) => void;
	handleAssignmentChanges: {
		addAssignment: (assignment: MemberAssignment) => void;
		removeAssignment: (assignment: MemberAssignment) => void;
		updateAssignment: (oldAssignment: MemberAssignment, newAssignment: MemberAssignment) => void;
		setAssignments: (assignments: MemberAssignment[]) => void;
	};
}

export const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

interface ScheduleProviderProps {
	children: ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(scheduleReducer, initialState);

	const handleTemplateSelect = (template: TemplateScheduleData | null) => {
		dispatch({ type: 'SET_TEMPLATE', payload: template });
	};

	const handleSaveDraft = () => {
		console.log('Saving draft:', state.template, state.assignments);
		dispatch({ type: 'SET_IS_DIRTY', payload: false });
	};

	const handlePublish = () => {
		console.log('Publishing schedule:', state.template, state.assignments);
	};

	const handleAutoAssign = async (members: UserData[]) => {
		if (!state.template || !members || state.isProcessingAutoAssign) return;
		dispatch({ type: 'SET_PROCESSING_AUTO_ASSIGN', payload: true });

		try {
			let availableMembers = [...members];
			if (state.autoAssignPreferences.considerStudentStatus) {
				availableMembers = availableMembers.sort((a, b) =>
					(a.student === b.student) ? 0 : a.student ? 1 : -1
				);
			}

			const existingAssignmentsToKeep = state.autoAssignPreferences.respectExisting
				? state.assignments
				: [];

			const newAssignments = createOptimalSchedule(
				state.template,
				availableMembers,
				existingAssignmentsToKeep
			);

			dispatch({ type: 'SET_ASSIGNMENTS', payload: newAssignments });
		} catch (error) {
			console.error('Failed to create schedule:', error);
		} finally {
			dispatch({ type: 'SET_PROCESSING_AUTO_ASSIGN', payload: false });
		}
	};

	const handleClearAssignments = () => {
		if (window.confirm('Are you sure you want to clear all assignments?')) {
			dispatch({ type: 'CLEAR_ASSIGNMENTS' });
		}
	};

	const toggleLeftSidebar = () => dispatch({ type: 'TOGGLE_LEFT_SIDEBAR' });
	const toggleRightSidebar = () => dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR' });

	const handleDraggedMember = (member: DraggedMember | null) => {
		dispatch({ type: 'SET_DRAGGED_MEMBER', payload: member });
	};

	const updateAutoAssignPreferences = (prefs: AutoAssignPreferences) => {
		dispatch({ type: 'SET_AUTO_ASSIGN_PREFERENCES', payload: prefs });
	};

	const handleAssignmentChanges = {
		addAssignment: (assignment: MemberAssignment) => {
			dispatch({ type: 'ADD_ASSIGNMENT', payload: assignment });
		},
		removeAssignment: (assignment: MemberAssignment) => {
			dispatch({ type: 'REMOVE_ASSIGNMENT', payload: assignment });
		},
		updateAssignment: (oldAssignment: MemberAssignment, newAssignment: MemberAssignment) => {
			dispatch({
				type: 'UPDATE_ASSIGNMENT',
				payload: { old: oldAssignment, new: newAssignment }
			});
		},
		setAssignments: (assignments: MemberAssignment[]) => {
			dispatch({ type: 'SET_ASSIGNMENTS', payload: assignments });
		}
	};

	const value: ScheduleContextType = {
		state,
		handleTemplateSelect,
		handleSaveDraft,
		handlePublish,
		handleAutoAssign,
		handleClearAssignments,
		toggleLeftSidebar,
		toggleRightSidebar,
		handleDraggedMember,
		updateAutoAssignPreferences,
		handleAssignmentChanges
	};

	return (
		<ScheduleContext.Provider value={value}>
			{children}
		</ScheduleContext.Provider>
	);
};

export const useSchedule = () => {
	const context = useContext(ScheduleContext);
	if (context === undefined) {
		throw new Error('useSchedule must be used within a ScheduleProvider');
	}
	return context;
};
