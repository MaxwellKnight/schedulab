import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon, Check } from 'lucide-react';

type ButtonSize = 'sm' | 'default' | 'lg';

interface AnimatedGradientButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
	onClick?: () => Promise<void>;
	disabled?: boolean;
	icon?: LucideIcon;
	text?: string;
	className?: string;
	iconAnimationDuration?: number;
	size?: ButtonSize;
	isSubmitting?: boolean;
	error?: string | null;
	onSuccess?: boolean;
	children?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	default: "px-4 py-2",
	lg: "px-6 py-3 text-lg"
};

const shimmerVariants = {
	initial: { x: '-100%', opacity: 0 },
	hover: {
		x: '100%',
		opacity: 1,
		transition: {
			duration: 1.5,
			delay: 0.2,
			ease: "easeInOut"
		}
	}
};

const contentVariants = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
			delay: 0.1
		}
	},
	exit: {
		opacity: 0,
		y: -10,
		transition: {
			duration: 0.3
		}
	}
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
	onSuccess = false,
	children,
	...props
}, ref) => {
	const buttonText = children || text;
	const isDisabled = disabled || isSubmitting;

	const handleClick = async () => {
		if (onClick) {
			try {
				await onClick();
			} catch (error) {
				console.error('Button click error:', error);
			}
		}
	};

	return (
		<div className="flex flex-col items-center gap-2">
			<Button
				ref={ref}
				onClick={handleClick}
				disabled={isDisabled}
				className={cn(
					"relative group",
					"bg-gradient-to-r",
					onSuccess
						? "from-green-500 to-green-400"
						: "from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400",
					error ? "!bg-red-600 hover:!bg-red-700" : "",
					"shadow-[0_2px_8px_-1px_rgba(37,99,235,0.3)]",
					"hover:shadow-[0_4px_20px_-2px_rgba(37,99,235,0.4)]",
					"border border-blue-400/30",
					"text-white font-medium",
					"transform transition-all duration-500",
					"hover:scale-[1.02] active:scale-[0.98]",
					"disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none",
					"overflow-hidden",
					sizeClasses[size],
					className
				)}
				{...props}
			>
				{/* Shimmer effect */}
				<motion.div
					initial="initial"
					whileHover="hover"
					animate="initial"
					variants={shimmerVariants}
					className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
            blur-sm pointer-events-none transform-gpu"
				/>

				{/* Content wrapper */}
				<AnimatePresence mode="wait">
					<motion.div
						key={onSuccess ? 'success' : isSubmitting ? 'submitting' : 'default'}
						initial="hidden"
						animate="visible"
						exit="exit"
						variants={contentVariants}
						className="relative flex gap-2 items-center justify-center min-w-[100px]"
					>
						{onSuccess ? (
							<>
								<Check className="w-5 h-5 stroke-[3px]" />
								<span>Success!</span>
							</>
						) : isSubmitting ? (
							<>
								<svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
										fill="none"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								<span>Saving...</span>
							</>
						) : (
							<>
								{Icon && (
									<Icon className={cn(
										"mr-1",
										size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4",
										"stroke-[2.5px]"
									)} />
								)}
								<span>{buttonText}</span>
							</>
						)}
					</motion.div>
				</AnimatePresence>
			</Button>

			{/* Error message */}
			<AnimatePresence mode="wait">
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{
							opacity: 1,
							y: 0,
							transition: {
								duration: 0.4,
								delay: 0.2
							}
						}}
						exit={{
							opacity: 0,
							y: -10,
							transition: {
								duration: 0.3
							}
						}}
						className="text-red-500 text-sm text-center font-medium"
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
