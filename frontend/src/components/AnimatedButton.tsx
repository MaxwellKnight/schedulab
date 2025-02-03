import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type ButtonSize = 'sm' | 'default' | 'lg';

interface AnimatedGradientButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
	onClick?: () => void;
	disabled?: boolean;
	icon?: LucideIcon;
	text: string;
	className?: string;
	iconAnimationDuration?: number;
	size?: ButtonSize;
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
	...props
}, ref) => {
	return (
		<Button
			ref={ref}
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"flex-1 sm:flex-none relative group",
				"bg-gradient-to-r from-indigo-600 to-indigo-500",
				"hover:from-indigo-500 hover:to-indigo-400",
				"shadow-sm hover:shadow-md",
				"shadow-indigo-200/50",
				"transition-all duration-300 ease-in-out",
				"overflow-hidden",
				"border border-indigo-400/20",
				"text-white",
				"hover:scale-[1.02]",
				"active:scale-[0.98]",
				"disabled:opacity-50 disabled:pointer-events-none",
				sizeClasses[size],
				className
			)}
			{...props}
		>
			<div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-white/10 to-indigo-500/0 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                    group-hover:translate-x-full transform-gpu">
			</div>
			<div className="relative flex gap-2 items-center justify-center">
				{Icon && (
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
					{text}
				</motion.span>
			</div>
		</Button>
	);
});

AnimatedGradientButton.displayName = 'AnimatedGradientButton';

export default AnimatedGradientButton;
