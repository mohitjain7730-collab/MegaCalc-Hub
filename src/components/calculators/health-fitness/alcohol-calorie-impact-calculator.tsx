'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wine, Target, Info, Flame } from 'lucide-react';

const formSchema = z.object({
	beer12oz: z.number().min(0).optional(),
	wine5oz: z.number().min(0).optional(),
	spirits1_5oz: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AlcoholCalorieImpactCalculator() {
	const [result, setResult] = useState<{ calories: number; weekly: number; monthly: number } | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { beer12oz: undefined, wine5oz: undefined, spirits1_5oz: undefined },
	});

	const onSubmit = (values: FormValues) => {
		const beerCal = (values.beer12oz ?? 0) * 150; // avg 150 kcal / 12oz beer
		const wineCal = (values.wine5oz ?? 0) * 120; // avg 120 kcal / 5oz wine
		const spiritCal = (values.spirits1_5oz ?? 0) * 100; // avg 100 kcal / 1.5oz spirit (neat)
		const calories = beerCal + wineCal + spiritCal;
		setResult({ calories, weekly: calories * 7, monthly: calories * 30 });
	};

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Alcohol Calorie Impact
					</CardTitle>
					<CardDescription>Estimate calories from typical servings per day</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<FormField control={form.control} name="beer12oz" render={({ field }) => (
								<FormItem>
									<FormLabel>Beers (12 oz)</FormLabel>
									<FormControl>
										<Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
									</FormControl>
									<p className="text-xs text-muted-foreground">~150 kcal per 12 oz standard beer</p>
									<FormMessage />
								</FormItem>
							)} />
								<FormField control={form.control} name="wine5oz" render={({ field }) => (
								<FormItem>
									<FormLabel>Wine (5 oz)</FormLabel>
									<FormControl>
										<Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
									</FormControl>
									<p className="text-xs text-muted-foreground">~120 kcal per 5 oz glass</p>
									<FormMessage />
								</FormItem>
							)} />
								<FormField control={form.control} name="spirits1_5oz" render={({ field }) => (
								<FormItem>
									<FormLabel>Spirits (1.5 oz)</FormLabel>
									<FormControl>
										<Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
									</FormControl>
									<p className="text-xs text-muted-foreground">~100 kcal per 1.5 oz (neat)</p>
									<FormMessage />
								</FormItem>
							)} />
							</div>

							<Button type="submit">Calculate</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

					{result && (
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-center gap-4">
								<Flame className="h-8 w-8 text-primary" />
								<div>
									<CardTitle>Daily Alcohol Calories</CardTitle>
									<CardDescription>Short and long‑term impact</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center p-6 bg-primary/5 rounded-lg">
									<p className="text-sm text-muted-foreground mb-1">Today</p>
									<p className="text-3xl font-bold text-primary">{Math.round(result.calories)} kcal</p>
								</div>
								<div className="text-center p-6 bg-muted/50 rounded-lg">
									<p className="text-sm text-muted-foreground mb-1">Per Week</p>
									<p className="text-2xl font-bold">{Math.round(result.weekly)} kcal</p>
								</div>
								<div className="text-center p-6 bg-muted/50 rounded-lg">
									<p className="text-sm text-muted-foreground mb-1">Per Month</p>
									<p className="text-2xl font-bold">{Math.round(result.monthly)} kcal</p>
								</div>
							</div>
						</CardContent>
					</Card>

							{/* Interpretation */}
							<Card>
								<CardHeader>
									<CardTitle>Interpretation</CardTitle>
									<CardDescription>Category, takeaway, and recommendations</CardDescription>
								</CardHeader>
								<CardContent>
									{(() => {
										const dailyPct = (result.calories / 2300) * 100;
										let category = 'Low impact';
										if (dailyPct >= 20 && dailyPct < 40) category = 'Moderate impact';
										if (dailyPct >= 40) category = 'High impact';
										const opinion = dailyPct >= 40 ? 'Alcohol calories are likely displacing nutrient intake and hindering fat loss.' : dailyPct >= 20 ? 'Be mindful—alcohol calories add up quickly across the week.' : 'Caloric impact is relatively low today; still consider mixers and frequency.';
										const recs = [
											'Choose lower-ABV or light options to reduce calories per serving.',
											'Alternate every drink with water to slow intake and improve hydration.',
											'Watch mixers—prefer diet/zero mixers or neat/soda water.'
										];
										return (
											<div className="space-y-2">
												<p><span className="font-semibold">Category:</span> {category} ({dailyPct.toFixed(0)}% of a 2,300 kcal day)</p>
												<p><span className="font-semibold">Takeaway:</span> {opinion}</p>
												<ul className="list-disc ml-5 text-sm text-muted-foreground">
													{recs.map((r, i) => <li key={i}>{r}</li>)}
												</ul>
											</div>
										);
									})()}
								</CardContent>
							</Card>
				</div>
			)}

			{/* Related Calculators */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Wine className="h-5 w-5" />
						Related Calculators
					</CardTitle>
					<CardDescription>Explore nutrition and health tools</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-4 border rounded-lg">
							<h4 className="font-semibold mb-1"><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</a></h4>
							<p className="text-sm text-muted-foreground">Estimate your TDEE to plan intake.</p>
						</div>
						<div className="p-4 border rounded-lg">
							<h4 className="font-semibold mb-1"><a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">Protein Intake</a></h4>
							<p className="text-sm text-muted-foreground">Set protein for recovery goals.</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Guide Section (minimal, editable) */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						Complete Guide to Alcohol Calories
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Use this space for your comprehensive guide on alcohol calories and metabolism.</p>
					<p>I added placeholders; you can replace them with detailed content later.</p>
				</CardContent>
			</Card>

			{/* FAQ Section (8-10 items, expanded) */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						Frequently Asked Questions
					</CardTitle>
					<CardDescription>Alcohol and calories basics</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{[
						['Which drink has the most calories?', 'Sweet cocktails and craft beers often have the most due to sugar and higher ABV.'],
						['Do spirits have zero carbs?', 'Neat spirits have minimal carbs; mixers add sugar and calories quickly.'],
						['How does alcohol affect fat loss?', 'Alcohol is metabolized first, temporarily suppressing fat oxidation.'],
						['Are light beers better?', 'They reduce calories per serving, but total intake still governs weight change.'],
						['Does wine offer health benefits?', 'Evidence is mixed; any benefits are small. Moderation is essential.'],
						['What is a standard drink?', 'About 14g alcohol: 12oz beer, 5oz wine, or 1.5oz spirits.'],
						['Can I offset alcohol calories with exercise?', 'You can burn calories, but recovery and appetite effects can negate progress.'],
						['Do zero‑sugar mixers help?', 'Yes, they lower total calories versus regular soda or juice mixers.'],
						['How to track alcohol in macros?', 'Alcohol is ~7 kcal/g. Many track it separately from carbs/fats.'],
						['Best strategy to reduce calories?', 'Limit rounds, choose lower‑ABV drinks, and alternate with water.'],
					].map(([q,a],i) => (
						<div key={i}>
							<h4 className="font-semibold mb-1">{q}</h4>
							<p className="text-sm text-muted-foreground">{a}</p>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
