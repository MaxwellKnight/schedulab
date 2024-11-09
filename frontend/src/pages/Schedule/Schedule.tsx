import React, { useEffect } from 'react';
import { Save, Users, Settings, Sheet } from 'lucide-react';
import Combobox from "@/components/combobox/Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TemplateScheduleData } from '@/types/template.dto';
import { cn } from '@/lib/utils';
import ScheduleEditable from './ScheduleEditable';
import { useAuthenticatedFetch } from '@/hooks/useAuthFetch';
import { ShiftType } from '@/types/shifts.dto';
import { useAuth } from '@/hooks/useAuth/useAuth';
import MembersList, { DraggableMemberOverlay } from './MembersList';
import { UserData } from '@/types';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useTeam } from '@/context/TeamContext';
import ScheduleSettings from './ScheduleSettings';
import { DragData, DropData } from './reducer';
import { useSchedule } from '@/context';
import { Sidebar } from './ScheduleSidebar';

export interface MemberAssignment {
	memberId: string;
	shiftTypeId: number;
	date: string;
	timeSlot: string;
	position: number;
}

export interface DraggedMember { member: UserData; isCurrentUser: boolean; }

const Schedule: React.FC = () => {
	const { state, handleTemplateSelect, handleSaveDraft, handlePublish, handleAutoAssign,
		handleClearAssignments, toggleLeftSidebar, toggleRightSidebar, handleDraggedMember,
		updateAutoAssignPreferences, handleAssignmentChanges } = useSchedule();
	const { selectedTeam } = useTeam();
	const { user } = useAuth();

	const {
		data: templates,
		loading: templatesLoading,
		error: templatesError,
		fetchData: fetchTemplates
	} = useAuthenticatedFetch<TemplateScheduleData[]>(`/templates/team/${selectedTeam?.id}`);
	const {
		data: shiftTypes,
		loading: shiftTypesLoading,
		error: shiftTypesError,
		fetchData: fetchShiftTypes
	} = useAuthenticatedFetch<ShiftType[]>(`/shifts/types/${selectedTeam?.id}`);

	const {
		data: members,
		loading: membersLoading,
		error: membersError,
		fetchData: fetchMembers
	} = useAuthenticatedFetch<UserData[]>(`/users/team/${selectedTeam?.id}`);

	useEffect(() => {
		if (selectedTeam?.id) {
			fetchTemplates();
		}
	}, [selectedTeam?.id, fetchTemplates]);

	useEffect(() => {
		fetchShiftTypes();
		fetchMembers();
	}, [fetchShiftTypes, fetchMembers]);


	if (shiftTypesLoading || membersLoading) {
		return <div>Loading data...</div>;
	}

	if (shiftTypesError || membersError) {
		return <div>Error loading. Please try again.</div>;
	}

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const data = active.data.current as DragData;
		if (data?.type === 'new-member' || data?.type === 'member') {
			handleDraggedMember({
				member: data.member,
				isCurrentUser: data.member.id === user?.id
			});
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		handleDraggedMember(null);

		if (!over) {
			const data = active.data.current as DragData;
			if (data?.type === 'member' && data.memberId && data.shiftTypeId && data.date && data.timeSlot && data.position) {
				handleAssignmentChanges.removeAssignment({
					memberId: data.memberId,
					shiftTypeId: data.shiftTypeId,
					date: data.date,
					timeSlot: data.timeSlot,
					position: data.position
				});
			}
			return;
		}

		const dropData = over.data.current as DropData;
		if (!dropData?.type || dropData.type !== 'slot') return;

		const isSlotOccupied = state.assignments.some(a =>
			a.shiftTypeId === dropData.shiftTypeId &&
			a.date === dropData.date.toISOString() &&
			a.timeSlot === dropData.timeSlot &&
			a.position === dropData.position
		);

		if (isSlotOccupied) return;

		const dragData = active.data.current as DragData;
		if (dragData?.type === 'new-member') {
			handleAssignmentChanges.addAssignment({
				memberId: dragData.member.id.toString(),
				shiftTypeId: dropData.shiftTypeId,
				date: dropData.date.toISOString(),
				timeSlot: dropData.timeSlot,
				position: dropData.position
			});
		} else if (dragData?.type === 'member' && dragData.memberId && dragData.shiftTypeId && dragData.date && dragData.timeSlot && dragData.position) {
			handleAssignmentChanges.updateAssignment(
				{
					memberId: dragData.memberId,
					shiftTypeId: dragData.shiftTypeId,
					date: dragData.date,
					timeSlot: dragData.timeSlot,
					position: dragData.position
				},
				{
					memberId: dragData.memberId,
					shiftTypeId: dropData.shiftTypeId,
					date: dropData.date.toISOString(),
					timeSlot: dropData.timeSlot,
					position: dropData.position
				}
			);
		}
	};

	const isTeamAdmin = selectedTeam?.creator_id === user?.id;

	return (
		<DndContext
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragCancel={() => handleDraggedMember(null)}
			modifiers={[restrictToWindowEdges]}
		>
			{isTeamAdmin ?
				<div className="mx-auto p-4 space-y-4">
					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
						<div className="flex-1 max-w-md">
							<h1 className="text-sm text-gray-500 mb-2">Template</h1>
							<Combobox
								onTemplateSelect={handleTemplateSelect}
								className="w-full"
								templates={templates || []}
								loading={templatesLoading}
								error={templatesError}
							/>
						</div>
						<div className="flex gap-2 w-full sm:w-auto">
							<Button
								variant="outline"
								onClick={handleSaveDraft}
								disabled={!state.template || !state.isDirty}
								className="flex-1 sm:flex-none"
							>
								<Save className="h-4 w-4 mr-2" />
								Save Draft
							</Button>
							<Button
								onClick={handlePublish}
								disabled={!state.template}
								className="flex-1 sm:flex-none"
							>
								Publish Schedule
							</Button>
						</div>
					</div>

					{state.template ? (
						<div className="xl:grid xl:grid-cols-12 gap-4 flex flex-col xl:flex-none">
							<Sidebar
								isOpen={state.leftSidebarOpen}
								onToggle={toggleLeftSidebar}
								position="left"
								icon={<Users />}
								title="Members"
								className='h-full'
							>
								<MembersList members={members} />
							</Sidebar>

							<Card className={cn(
								'col-span-12 transition-all duration-300',
								state.leftSidebarOpen && state.rightSidebarOpen ? 'sm:col-span-8' :
									(!state.leftSidebarOpen && !state.rightSidebarOpen) ? 'sm:col-span-10' :
										'sm:col-span-9'
							)}>
								<div className="p-3 border-b">
									<div className="flex items-center text-md text-gray-600 font-normal">
										<Sheet className="h-4 w-4 mr-2" />
										Schedule Grid
									</div>
								</div>
								<CardContent className="p-2">
									<ScheduleEditable
										template={state.template}
										shiftTypes={shiftTypes}
										members={members}
										assignments={state.assignments}
									/>
								</CardContent>
							</Card>

							<Sidebar
								isOpen={state.rightSidebarOpen}
								onToggle={toggleRightSidebar}
								position="right"
								icon={<Settings />}
								title="Settings"
							>
								<ScheduleSettings
									members={members || []}
									onAutoAssign={handleAutoAssign}
									isProcessing={state.isProcessingAutoAssign}
									hasAssignments={state.assignments.length > 0}
									onClearAssignments={handleClearAssignments}
									preferences={state.autoAssignPreferences}
									onPreferencesChange={updateAutoAssignPreferences}
								/>
							</Sidebar>
						</div>
					) : (
						<div className="grid grid-cols-12 gap-4">
							<div className="col-span-12 h-96 flex items-center justify-center text-gray-500">
								Select a template to start creating your schedule
							</div>
						</div>
					)}
				</div>
				: null}
			<DragOverlay>
				{state.draggedMember ? (
					<DraggableMemberOverlay
						member={state.draggedMember.member}
						isCurrentUser={state.draggedMember.isCurrentUser}
					/>
				) : null}
			</DragOverlay>
		</DndContext>
	);
};

export default Schedule;
