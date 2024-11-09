import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const ScheduleLoadingSkeleton: React.FC = () => (
	<motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		className="mx-auto p-4 space-y-4"
	>
		<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
			<div className="flex-1 max-w-md">
				<Skeleton className="h-5 w-20 mb-2" />
				<Skeleton className="h-10 w-full" />
			</div>
			<div className="flex gap-2 w-full sm:w-auto">
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-10 w-32" />
			</div>
		</div>
		<div className="grid grid-cols-12 gap-4">
			<Card className="col-span-12 sm:col-span-9">
				<div className="p-3 border-b">
					<Skeleton className="h-6 w-32" />
				</div>
				<CardContent className="p-4">
					<div className="space-y-4">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-96 w-full" />
					</div>
				</CardContent>
			</Card>
		</div>
	</motion.div>
);

export default ScheduleLoadingSkeleton;
