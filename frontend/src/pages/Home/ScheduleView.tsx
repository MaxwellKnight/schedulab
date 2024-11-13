import React from 'react';
import { List, Grid, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const ScheduleView: React.FC = () => (
	<Card className="border shadow-sm">
		<Tabs defaultValue="current" className="w-full">
			<div className="flex items-center justify-between border-b bg-white px-4 py-3">
				<TabsList className="bg-gray-100/80">
					<TabsTrigger value="current">Current</TabsTrigger>
					<TabsTrigger value="past">Past</TabsTrigger>
				</TabsList>
				<div className="flex items-center gap-1">
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<List className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<Grid className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<TabsContent value="current" className="p-4">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">November 2024</h3>
						<div className="flex gap-1">
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
					<div className="rounded-lg border bg-gray-50/50 p-4 h-[32rem]">
						<div className="flex items-center justify-center h-full text-gray-400 text-sm">
							Schedule Content
						</div>
					</div>
				</motion.div>
			</TabsContent>

			<TabsContent value="past" className="p-4">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">Past Schedules</h3>
						<Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600">
							Download
						</Button>
					</div>
					<div className="rounded-lg border bg-gray-50/50 p-4 h-[32rem]">
						<div className="flex items-center justify-center h-full text-gray-400 text-sm">
							Past Schedules Content
						</div>
					</div>
				</motion.div>
			</TabsContent>
		</Tabs>
	</Card>
);
