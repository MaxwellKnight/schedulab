import React, { useEffect, useState } from 'react';
import { Save, Users, Settings, Sheet, ChevronLeft, ChevronRight } from 'lucide-react';
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
import ScheduleSettings, { AutoAssignPreferences } from './ScheduleSettings';
import { createOptimalSchedule } from '@/algorithms/scheduler';

export interface MemberAssignment {
	memberId: string;
	shiftTypeId: number;
	date: string;
	timeSlot: string;
	position: number;
}

interface SidebarToggleButtonProps {
	isOpen: boolean;
	onClick: () => void;
	position: 'left' | 'right';
}

interface SidebarProps {
	isOpen: boolean;
	onToggle: () => void;
	position: 'left' | 'right';
	icon: React.ReactNode;
	title: string;
	children: React.ReactNode;
	className?: string;
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({ isOpen, onClick, position }) => (
	<Button
		variant="ghost"
		size="sm"
		className={cn(
			'absolute top-1/2 -translate-y-1/2 z-10',
			'h-6 w-6 p-0.5 rounded-full',
			'bg-white border shadow-sm hover:bg-gray-50',
			'transition-transform duration-300',
			position === 'left' ? '-right-3' : '-left-3',
			!isOpen && position === 'left' && 'rotate-180',
			!isOpen && position === 'right' && '-rotate-180'
		)}
		onClick={onClick}
		aria-label={`${isOpen ? 'Collapse' : 'Expand'} sidebar`}
	>
		{position === 'left' ?
			<ChevronLeft className="h-4 w-4" /> :
			<ChevronRight className="h-4 w-4" />
		}
	</Button>
);

const Sidebar: React.FC<SidebarProps> = ({
	isOpen,
	onToggle,
	position,
	icon,
	title,
	children,
	className
}) => (
	<Card
		className={cn(
			'relative transition-all duration-300',
			'col-span-12',
			isOpen ? (
				'sm:col-span-2 max-h-[800px]'
			) : (
				'sm:col-span-1 h-12'
			),
			'flex flex-col',
			className
		)}
	>
		<SidebarToggleButton
			isOpen={isOpen}
			onClick={onToggle}
			position={position}
		/>

		<div
			className={cn(
				'flex-shrink-0',
				'p-3 border-b',
				'transition-all duration-300',
				!isOpen && 'px-2'
			)}
		>
			<div
				className={cn(
					'flex items-center',
					'text-md text-gray-600 font-normal',
					!isOpen && 'justify-center'
				)}
			>
				{React.cloneElement(icon, {
					className: cn('h-4 w-4', isOpen && 'mr-2')
				})}
				<span
					className={cn(
						'transition-all duration-300',
						'origin-left',
						!isOpen && 'w-0 scale-0 opacity-0'
					)}
				>
					{title}
				</span>
			</div>
		</div>

		<CardContent
			className={cn(
				'p-2 transition-all duration-300',
				'flex-1 min-h-0',
				isOpen ? (
					'opacity-100 overflow-y-auto'
				) : (
					'opacity-0 h-0 overflow-hidden'
				)
			)}
		>
			{children}
		</CardContent>
	</Card>
);



const Schedule: React.FC = () => {
	const [template, setTemplate] = useState<TemplateScheduleData | null>(null);
	const [isDirty, setIsDirty] = useState(false);
	const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
	const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
	const { user } = useAuth();
	const [assignments, setAssignments] = useState<MemberAssignment[]>([]);
	const [draggedMember, setDraggedMember] = useState<{ member: UserData; isCurrentUser: boolean; } | null>(null);
	const [isProcessingAutoAssign, setIsProcessingAutoAssign] = useState(false);
	const [autoAssignPreferences, setAutoAssignPreferences] = useState<AutoAssignPreferences>({
		respectExisting: true,
		balanceLoad: true,
		considerStudentStatus: true
	});
	const { selectedTeam } = useTeam();

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
		if (active.data.current?.type === 'new-member') {
			const memberData = active.data.current.member;
			setDraggedMember({
				member: memberData,
				isCurrentUser: memberData.id === user?.id
			});
		} else if (active.data.current?.type === 'member') {
			const memberData = active.data.current.member;
			setDraggedMember({
				member: memberData,
				isCurrentUser: memberData.id === user?.id
			});
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setDraggedMember(null);

		if (!over) {
			// Handle dropping outside any droppable area
			if (active.data.current?.type === 'member') {
				const dragData = active.data.current;
				setAssignments(prev =>
					prev.filter(a =>
						!(a.memberId === dragData.memberId &&
							a.shiftTypeId === dragData.shiftTypeId &&
							a.date === dragData.date &&
							a.timeSlot === dragData.timeSlot &&
							a.position === dragData.position)
					)
				);
				setIsDirty(true);
			}
			return;
		}

		const dropData = over.data.current;
		if (!dropData?.type || dropData.type !== 'slot') return;

		setAssignments(prev => {
			// Check if slot is already occupied
			const isSlotOccupied = prev.some(a =>
				a.shiftTypeId === dropData.shiftTypeId &&
				a.date === dropData.date.toISOString() &&
				a.timeSlot === dropData.timeSlot &&
				a.position === dropData.position
			);

			if (isSlotOccupied) return prev;

			let newAssignments = [...prev];

			if (active.data.current?.type === 'new-member') {
				const memberData = active.data.current.member;
				newAssignments.push({
					memberId: memberData.id.toString(),
					shiftTypeId: dropData.shiftTypeId,
					date: dropData.date.toISOString(),
					timeSlot: dropData.timeSlot,
					position: dropData.position
				});
			} else if (active.data.current?.type === 'member') {
				const dragData = active.data.current;
				// Remove old assignment
				newAssignments = newAssignments.filter(a =>
					!(a.memberId === dragData.memberId &&
						a.shiftTypeId === dragData.shiftTypeId &&
						a.date === dragData.date &&
						a.timeSlot === dragData.timeSlot &&
						a.position === dragData.position)
				);

				// Add new assignment
				newAssignments.push({
					memberId: dragData.memberId,
					shiftTypeId: dropData.shiftTypeId,
					date: dropData.date.toISOString(),
					timeSlot: dropData.timeSlot,
					position: dropData.position
				});
			}

			return newAssignments;
		});

		setIsDirty(true);
	};

	const handleTemplateSelect = (selected: TemplateScheduleData | null) => {
		setTemplate(selected);
		setIsDirty(false);
		setAssignments([]);
	};

	const handleSaveDraft = () => {
		console.log('Saving draft:', template, assignments);
		setIsDirty(false);
	};

	const handlePublish = () => {
		console.log('Publishing schedule:', template, assignments);
	};

	const isTeamAdmin = selectedTeam?.creator_id === user?.id;

	const handleAutoAssign = async () => {
		if (!template || !members || isProcessingAutoAssign) return;
		setIsProcessingAutoAssign(true);
		try {
			let availableMembers = [...members];
			if (autoAssignPreferences.considerStudentStatus) {
				availableMembers = availableMembers.sort((a, b) =>
					(a.student === b.student) ? 0 : a.student ? 1 : -1
				);
			}

			const existingAssignmentsToKeep = autoAssignPreferences.respectExisting
				? assignments
				: [];

			const newAssignments = await createOptimalSchedule(
				template,
				availableMembers,
				existingAssignmentsToKeep
			);

			setAssignments([...newAssignments]);

			console.log('Auto-assignment completed');
			setIsDirty(true);
		} catch (error) {
			console.error('Failed to create schedule:', error);
		} finally {
			setIsProcessingAutoAssign(false);
		}
	};

	const handleClearAssignments = () => {
		if (window.confirm('Are you sure you want to clear all assignments?')) {
			setAssignments([]);
			setIsDirty(true);
		}
	};

	return (
		<DndContext
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragCancel={() => setDraggedMember(null)}
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
								disabled={!template || !isDirty}
								className="flex-1 sm:flex-none"
							>
								<Save className="h-4 w-4 mr-2" />
								Save Draft
							</Button>
							<Button
								onClick={handlePublish}
								disabled={!template}
								className="flex-1 sm:flex-none"
							>
								Publish Schedule
							</Button>
						</div>
					</div>

					{template ? (
						<div className="xl:grid xl:grid-cols-12 gap-4 flex flex-col xl:flex-none">
							<Sidebar
								isOpen={leftSidebarOpen}
								onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
								position="left"
								icon={<Users />}
								title="Members"
								className='h-full'
							>
								<MembersList members={members} />
							</Sidebar>

							<Card className={cn(
								'col-span-12 transition-all duration-300',
								leftSidebarOpen && rightSidebarOpen ? 'sm:col-span-8' :
									(!leftSidebarOpen && !rightSidebarOpen) ? 'sm:col-span-10' :
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
										template={template}
										shiftTypes={shiftTypes}
										members={members}
										assignments={assignments}
									/>
								</CardContent>
							</Card>

							<Sidebar
								isOpen={rightSidebarOpen}
								onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
								position="right"
								icon={<Settings />}
								title="Settings"
							>
								<ScheduleSettings
									onAutoAssign={handleAutoAssign}
									isProcessing={isProcessingAutoAssign}
									hasAssignments={assignments.length > 0}
									onClearAssignments={handleClearAssignments}
									preferences={autoAssignPreferences}
									onPreferencesChange={setAutoAssignPreferences}
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
				{draggedMember ? (
					<DraggableMemberOverlay
						member={draggedMember.member}
						isCurrentUser={draggedMember.isCurrentUser}
					/>
				) : null}
			</DragOverlay>
		</DndContext>
	);
};

export default Schedule;
