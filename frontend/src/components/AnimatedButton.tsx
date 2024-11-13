import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

type ButtonSize = 'sm' | 'default' | 'lg';

interface AnimatedGradientButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
	/** Click handler function */
	onClick?: () => void;
	/** Disable state of the button */
	disabled?: boolean;
	/** Lucide icon component */
	icon?: LucideIcon;
	/** Button text content */
	text: string;
	/** Additional CSS classes */
	className?: string;
	/** Starting gradient color (Tailwind class) */
	gradientFrom?: string;
	/** Ending gradient color (Tailwind class) */
	gradientTo?: string;
	/** Starting hover gradient color (Tailwind class) */
	gradientHoverFrom?: string;
	/** Ending hover gradient color (Tailwind class) */
	gradientHoverTo?: string;
	/** Shadow color on hover (Tailwind class) */
	shadowColor?: string;
	/** Duration of icon animation in seconds */
	iconAnimationDuration?: number;
	/** Size variant of the button */
	size?: ButtonSize;
}

const sizeClasses: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	default: "px-4 py-2",
	lg: "px-6 py-3 text-lg"
};

const AnimatedGradientButton: React.FC<AnimatedGradientButtonProps> = ({
	onClick,
	disabled = false,
	icon: Icon,
	text,
	className,
	gradientFrom = "from-blue-600",
	gradientTo = "to-indigo-600",
	gradientHoverFrom = "from-blue-500",
	gradientHoverTo = "to-indigo-500",
	shadowColor = "shadow-indigo-100/50",
	iconAnimationDuration = 2,
	size = "default",
	...props
}) => {
	return (
		<Button
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"flex-1 sm:flex-none",
				`bg-gradient-to-r ${gradientFrom} ${gradientTo}`,
				`hover:${gradientHoverFrom} hover:${gradientHoverTo}`,
				"shadow-lg",
				`hover:${shadowColor}`,
				"transition-all duration-300 ease-in-out",
				"relative group overflow-hidden",
				sizeClasses[size],
				className
			)}
			{...props}
		>
			<div
				className={cn(
					"absolute inset-0 bg-gradient-to-r",
					gradientFrom,
					gradientTo.replace('to-', 'to-'),
					"opacity-0 group-hover:opacity-100",
					"transition-opacity duration-300 ease-in-out"
				)}
			/>
			<div className="relative flex gap-2 items-center justify-center">
				{Icon && (
					<motion.div
						initial={false}
						animate={{
							scale: 1,
							y: 0,
							x: 0,
						}}
						whileHover={{
							scale: 1.1,
							transition: {
								duration: iconAnimationDuration,
								repeat: Infinity,
								ease: "linear"
							}
						}}
						className="relative"
					>
						<motion.div
							initial={false}
							animate={{
								rotate: 0
							}}
							whileHover={{
								rotate: 360,
								transition: {
									duration: iconAnimationDuration,
									repeat: Infinity,
									ease: "linear"
								}
							}}
						>
							<Icon className={cn(
								"mr-2",
								size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
							)} />
						</motion.div>
					</motion.div>
				)}
				<motion.span
					initial={false}
					whileHover={{
						transition: {
							duration: 0.3,
							ease: "easeOut"
						}
					}}
					className="font-medium uppercase tracking-wider"
				>
					{text}
				</motion.span>
			</div>
		</Button>
	);
};

export default AnimatedGradientButton;
