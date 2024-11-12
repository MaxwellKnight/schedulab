import React, { useEffect } from 'react';
import { Users, Settings, Sheet, } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { TemplateScheduleData } from '@/types/template.dto';
import { cn } from '@/lib/utils';
import ScheduleGrid from './ScheduleGrid';
import { useAuthenticatedFetch } from '@/hooks/useAuthFetch';
import { ShiftType } from '@/types/shifts.dto';
import { useAuth } from '@/hooks/useAuth/useAuth';
import MembersList from './MembersList';
import { UserData } from '@/types';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useTeam } from '@/context/TeamContext';
import ScheduleSettings from './ScheduleSettings';
import { DragData, DropData } from './reducer';
import { useSchedule } from '@/context';
import { Sidebar } from './ScheduleSidebar';
import ScheduleLoadingSkeleton from './ScheduleLoadingSkeleton';
import { AnimatePresence, motion } from 'framer-motion';
import ScheduleHeader from './ScheduleHeader';

export interface MemberAssignment {
	memberId: string;
	shiftTypeId: number;
	date: string;
	timeSlot: string;
	position: number;
}

export interface DraggedMember { member: UserData; isCurrentUser: boolean; }

const Schedule: React.FC = () => {
	const { selectedTeam } = useTeam();
	const { user } = useAuth();
	const {
		state,
		toggleLeftSidebar,
		toggleRightSidebar,
		handleDraggedMember,
		handleAssignmentChanges
	} = useSchedule();

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

	if (selectedTeam?.creator_id !== user?.id) return null;

	if (shiftTypesLoading || membersLoading) {
		return <ScheduleLoadingSkeleton />;
	}

	if (shiftTypesError || membersError) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex items-center justify-center h-96 text-red-500"
			>
				Error loading. Please try again.
			</motion.div>
		);
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


	return (
		<DndContext
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragCancel={() => handleDraggedMember(null)}
			modifiers={[restrictToWindowEdges]}
		>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="mx-auto p-4 space-y-4"
			>
				<ScheduleHeader
					templates={templates || []}
					templatesLoading={templatesLoading}
					templatesError={templatesError}
				/>
				<AnimatePresence mode="wait">
					{state.template ? (
						<motion.div
							key="template-content"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="xl:grid xl:grid-cols-12 gap-4 flex flex-col xl:flex-none"
						>
							<Sidebar
								isOpen={state.leftSidebarOpen}
								onToggle={toggleLeftSidebar}
								position="left"
								icon={<Users />}
								title="Members"
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
									<ScheduleGrid
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
								<ScheduleSettings members={members || []} />
							</Sidebar>
						</motion.div>
					) : (
						<motion.div
							key="empty-state"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="grid grid-cols-12 gap-4"
						>
							<div className="col-span-12 h-96 flex items-center justify-center text-gray-500">
								Select a template to start creating your schedule
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</DndContext>
	);
};

export default Schedule;
