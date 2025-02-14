import React from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';

interface ConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	cancelVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	confirmClassName?: string;
	cancelClassName?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	confirmVariant = 'destructive',
	cancelVariant = 'outline',
	confirmClassName = 'w-full sm:w-auto',
	cancelClassName = 'w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50'
}) => (
	<Dialog open={isOpen} onOpenChange={onClose}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>
			<DialogFooter className="flex-col sm:flex-row gap-2">
				<Button
					variant={cancelVariant}
					onClick={onClose}
					className={cancelClassName}
				>
					{cancelText}
				</Button>
				<Button
					variant={confirmVariant}
					onClick={onConfirm}
					className={confirmClassName}
				>
					{confirmText}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);

export default ConfirmationDialog;
