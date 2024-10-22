const Schedule: React.FC = () => {
	return (
		<div>
			<div className="m-4 flex justify-center">
				<h1>Seach Bar</h1>
			</div>
			<div className="grid sm:grid-cols-12 gap-4">
				<section className="sm:grid sm:col-span-2 bg-teal-50 min-h-[100px]"></section>
				<section className="sm:grid sm:col-span-8 bg-orange-50 min-h-[100px]"></section>
				<section className="sm:grid sm:col-span-2 bg-red-50 min-h-[100px]"></section>
			</div>
		</div>
	);
}

export default Schedule;
