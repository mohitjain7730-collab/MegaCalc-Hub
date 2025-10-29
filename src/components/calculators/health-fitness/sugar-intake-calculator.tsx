'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Candy, Info, Target } from 'lucide-react';

const formSchema = z.object({
	gramsPerDay: z.number().min(0),
	limit: z.number().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function SugarIntakeCalculator() {
	const [result, setResult] = useState<{ pct: number; status: string } | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { gramsPerDay: undefined as unknown as number, limit: undefined as unknown as number },
	});

	const onSubmit = (values: FormValues) => {
		const pct = (values.gramsPerDay / values.limit) * 100;
		const status = pct <= 100 ? 'Within recommended limit' : 'Above recommended limit';
		setResult({ pct, status });
	};

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Sugar Intake Assessment
					</CardTitle>
					<CardDescription>Compare your daily added sugar to a recommended limit</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField control={form.control} name="gramsPerDay" render={({ field }) => (
									<FormItem>
										<FormLabel>Added Sugar (grams/day)</FormLabel>
										<FormControl>
											<Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
										</FormControl>
										<p className="text-xs text-muted-foreground">Label value on Nutrition Facts (1 tsp ≈ 4 g)</p>
										<FormMessage />
									</FormItem>
								)} />
								<FormField control={form.control} name="limit" render={({ field }) => (
									<FormItem>
										<FormLabel>Recommended Limit (grams/day)</FormLabel>
										<FormControl>
											<Input type="number" placeholder="50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
										</FormControl>
										<p className="text-xs text-muted-foreground">AHA: 25g (women), 36g (men) | FDA DV: 50g</p>
										<FormMessage />
									</FormItem>
								)} />
							</div>
							<Button type="submit">Check</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

				{result && (
				<Card>
					<CardHeader>
						<CardTitle>Your Daily Sugar Intake</CardTitle>
						<CardDescription>Relative to your chosen limit</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="text-center p-6 bg-primary/5 rounded-lg">
								<p className="text-sm text-muted-foreground mb-1">Percent of Limit</p>
								<p className="text-3xl font-bold text-primary">{result.pct.toFixed(0)}%</p>
							</div>
							<div className="text-center p-6 bg-muted/50 rounded-lg">
								<p className="text-sm text-muted-foreground mb-1">Status</p>
								<p className="text-xl font-semibold">{result.status}</p>
							</div>
							<div className="text-center p-6 bg-muted/50 rounded-lg">
								<p className="text-sm text-muted-foreground mb-1">Tip</p>
								<p className="text-sm">Choose unsweetened drinks and limit sweets.</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

				{/* Interpretation */}
				{result && (
					<Card>
						<CardHeader>
							<CardTitle>Interpretation</CardTitle>
							<CardDescription>Category, takeaway, and recommendations</CardDescription>
						</CardHeader>
						<CardContent>
							{(() => {
								const pct = result.pct;
								let category = 'Within limit';
								if (pct > 100 && pct <= 150) category = 'Above limit';
								if (pct > 150) category = 'Well above limit';
								const opinion = pct <= 100 ? 'Your added sugar is within your chosen daily limit.' : pct <= 150 ? 'You are exceeding the recommended daily limit. Consider easy swaps to reduce intake.' : 'Your intake is substantially above recommended limits—prioritize reductions for metabolic health.';
								const recs = [
									'Switch sugary beverages for water, soda water, or unsweetened tea.',
									'Pick plain yogurt/oatmeal and add fruit instead of pre-sweetened versions.',
									'Check “Added Sugars” on labels; aim for ≤5g per serving when possible.'
								];
								return (
									<div className="space-y-2">
										<p><span className="font-semibold">Category:</span> {category} ({pct.toFixed(0)}% of limit)</p>
										<p><span className="font-semibold">Takeaway:</span> {opinion}</p>
										<ul className="list-disc ml-5 text-sm text-muted-foreground">{recs.map((r,i)=><li key={i}>{r}</li>)}</ul>
									</div>
								);
							})()}
						</CardContent>
					</Card>
				)}

			{/* Related Calculators */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Candy className="h-5 w-5" />
						Related Calculators
					</CardTitle>
					<CardDescription>Nutrition and health tools</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/glycemic-load-calculator" className="text-primary hover:underline">Glycemic Load Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate glycemic load of foods.</p></div>
						<div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</a></h4><p className="text-sm text-muted-foreground">Plan total energy intake.</p></div>
					</div>
				</CardContent>
			</Card>

			{/* Guide (minimal, editable) */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						Complete Guide to Added Sugar
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Use this space for your comprehensive guide on added sugar limits and labels.</p>
					<p>I added placeholders; you can replace them with detailed content later.</p>
				</CardContent>
			</Card>

			{/* FAQ (8-10 items, expanded) */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						Frequently Asked Questions
					</CardTitle>
					<CardDescription>About sugar guidelines</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{[
						['What counts as added sugar?', 'Sugars added during processing or at the table, not intrinsic sugars in whole fruit or milk.'],
						['Is honey better than table sugar?', 'Similar calories; still counted as added sugar.'],
						['Do fruit juices count?', 'Yes—free sugars in juice count toward added sugar.'],
						['Are artificial sweeteners a solution?', 'They can help reduce sugar but use judiciously.'],
						['How do I read labels?', 'Check the Added Sugars line in grams and %DV.'],
						['What is a practical daily target?', 'AHA suggests 25g (women) and 36g (men).'],
						['Does exercise offset sugar?', 'Exercise helps, but metabolic effects of excess sugar persist.'],
						['Are low‑sugar desserts okay?', 'Yes—mind portion sizes and ingredients.'],
						['Is all sugar bad?', 'No—whole fruit sugars come with fiber and nutrients.'],
						['Best swaps to cut sugar?', 'Unsweetened drinks, plain yogurt, and home cooking.'],
					].map(([q,a],i) => (
						<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
