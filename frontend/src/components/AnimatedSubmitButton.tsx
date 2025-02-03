import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type ButtonSize = 'sm' | 'default' | 'lg';

interface AnimatedGradientButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
	onClick?: () => void;
	disabled?: boolean;
	icon?: LucideIcon;
	text?: string;
	className?: string;
	iconAnimationDuration?: number;
	size?: ButtonSize;
	isSubmitting?: boolean;
	error?: string | null;
	children?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	default: "px-4 py-2",
	lg: "px-6 py-3 text-lg"
};

const AnimatedGradientButton = forwardRef<HTMLButtonElement, AnimatedGradientButtonProps>(({
	onClick,
	disabled = false,
	icon: Icon,
	text,
	className,
	iconAnimationDuration = 2,
	size = "default",
	isSubmitting = false,
	error = null,
	children,
	...props
}, ref) => {
	const buttonText = children || text;
	const isDisabled = disabled || isSubmitting;

	return (
		<div className="flex flex-col items-center gap-2">
			<Button
				ref={ref}
				onClick={onClick}
				disabled={isDisabled}
				className={cn(
					"relative group",
					"[background:linear-gradient(to_right,rgb(37,99,235),rgb(59,130,246))]",
					"[&:hover]:bg-none [&:hover]:[background:linear-gradient(to_right,rgb(59,130,246),rgb(96,165,250))]",
					error ? "!bg-red-600 hover:!bg-red-700" : "",
					"shadow-sm hover:shadow-md",
					"border border-blue-400/20",
					"text-white",
					"transform transition-all duration-300",
					"hover:scale-[1.02] active:scale-[0.98]",
					"disabled:opacity-50 disabled:pointer-events-none",
					"overflow-hidden",
					sizeClasses[size],
					className
				)}
				{...props}
			>
				<div
					className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 
          translate-x-[-100%] group-hover:translate-x-[100%] transform-gpu"
				/>
				<div className="relative flex gap-2 items-center justify-center">
					{Icon && !isSubmitting && (
						<motion.div
							initial={false}
							animate={{ scale: 1, y: 0, x: 0 }}
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
								animate={{ rotate: 0 }}
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
									"mr-1",
									size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4",
									"stroke-[2.5px]"
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
						className="font-medium tracking-wide text-sm"
					>
						{isSubmitting ? 'Saving...' : buttonText}
					</motion.span>
				</div>
			</Button>

			<AnimatePresence mode="wait">
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="text-red-500 text-sm text-center"
					>
						{error}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
});

AnimatedGradientButton.displayName = 'AnimatedGradientButton';

export default AnimatedGradientButton;
