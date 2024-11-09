import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { ReactElement } from "react";

interface SidebarToggleButtonProps {
	isOpen: boolean;
	onClick: () => void;
	position: 'left' | 'right';
}

interface SidebarProps {
	isOpen: boolean;
	onToggle: () => void;
	position: 'left' | 'right';
	icon: ReactElement;
	title: string;
	children: React.ReactNode;
	className?: string;
}

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({ isOpen, onClick, position }) => (
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

export const Sidebar: React.FC<SidebarProps> = ({
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

