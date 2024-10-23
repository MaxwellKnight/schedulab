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
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
	isOpen,
	onClick,
	position
}) => (
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
	children
}) => (
	<Card className={cn(
		'relative col-span-12 transition-all duration-300',
		isOpen ? 'sm:col-span-2' : 'sm:col-span-1 h-12'
	)}>
		<SidebarToggleButton
			isOpen={isOpen}
			onClick={onToggle}
			position={position}
		/>
		<div className={cn(
			'p-3 border-b transition-all duration-300',
			!isOpen && 'px-2'
		)}>
			<div className={cn(
				'flex items-center text-md text-gray-600 font-normal',
				!isOpen && 'justify-center'
			)}>
				{React.cloneElement(icon as React.ReactElement, {
					className: cn('h-4 w-4', isOpen && 'mr-2')
				})}
				<span className={cn(
					'transition-all duration-300 origin-left',
					!isOpen && 'w-0 scale-0 opacity-0'
				)}>
					{title}
				</span>
			</div>
		</div>
		<CardContent className={cn(
			'p-2 transition-all duration-300',
			!isOpen && 'opacity-0 h-0 overflow-hidden'
		)}>
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

	const {
		data: shiftTypes,
		loading: shiftTypesLoading,
		error: shiftTypesError,
		fetchData: fetchShiftTypes
	} = useAuthenticatedFetch<ShiftType[]>(`/shifts/types/${user?.team_id}`);

	const handleTemplateSelect = (selected: TemplateScheduleData | null) => {
		setTemplate(selected);
		setIsDirty(false);
	};

	const handlePublish = () => {
		console.log('Publishing schedule:', template);
	};

	const handleSaveDraft = () => {
		console.log('Saving draft:', template);
		setIsDirty(false);
	};

	useEffect(() => {
		fetchShiftTypes();
	}, [fetchShiftTypes]);

	if (shiftTypesLoading) {
		return <div>Loading shift types...</div>;
	}

	if (shiftTypesError) {
		return <div>Error loading shift types. Please try again.</div>;
	}


	return (
		<div className="mx-auto p-4 space-y-4">
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
				<div className="flex-1 max-w-md">
					<h1 className="text-sm text-gray-500 mb-2">Template</h1>
					<Combobox
						onTemplateSelect={handleTemplateSelect}
						className="w-full"
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
				<div className="grid grid-cols-12 gap-4">
					<Sidebar
						isOpen={leftSidebarOpen}
						onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
						position="left"
						icon={<Users />}
						title="Members"
					>
						<div className="space-y-2">
							<div className="h-8 bg-gray-100 rounded animate-pulse" />
							<div className="h-8 bg-gray-100 rounded animate-pulse" />
							<div className="h-8 bg-gray-100 rounded animate-pulse" />
						</div>
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
							<ScheduleEditable template={template} shiftTypes={shiftTypes} />
						</CardContent>
					</Card>

					<Sidebar
						isOpen={rightSidebarOpen}
						onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
						position="right"
						icon={<Settings />}
						title="Settings"
					>
						<div className="space-y-2">
							<div className="h-8 bg-gray-100 rounded animate-pulse" />
							<div className="h-8 bg-gray-100 rounded animate-pulse" />
							<div className="h-8 bg-gray-100 rounded animate-pulse" />
						</div>
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
	);
};

export default Schedule;
