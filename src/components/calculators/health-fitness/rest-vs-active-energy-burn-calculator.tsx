'use client'

import { useState } from 'react'
import { Activity, Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RestVsActiveEnergyBurnCalculator() {
	const [res, setRes] = useState<null | {
		restKcal: number
		activeKcal: number
		delta: number
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const rmr = Number(formData.get('rmr'))
		const weight = Number(formData.get('weight'))
		const met = Number(formData.get('met'))
		const durationMin = Number(formData.get('durationMin'))
		if (!rmr || !weight || !met || !durationMin) { setRes(null); return }

		const restPerMin = rmr / (24 * 60)
		const restKcal = restPerMin * durationMin
		const activeKcal = (met * 3.5 * weight / 200) * durationMin
		const delta = activeKcal - restKcal

		const opinion = `During this activity you burn about ${Math.round(activeKcal)} kcal, which is ${Math.round(delta)} kcal more than resting for the same time.`
		setRes({ restKcal, activeKcal, delta, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Timer className="h-8 w-8 text-primary" /><CardTitle>Rest vs Active Energy Burn Calculator</CardTitle></div>
					<CardDescription>Compare resting energy use vs activity. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="rmr">RMR (kcal/day)</Label>
							<Input id="rmr" name="rmr" type="number" step="1" placeholder="e.g., 1600" />
						</div>
						<div>
							<Label htmlFor="weight">Weight (kg)</Label>
							<Input id="weight" name="weight" type="number" step="0.1" placeholder="e.g., 70" />
						</div>
						<div>
							<Label htmlFor="met">Activity MET</Label>
							<Input id="met" name="met" type="number" step="0.1" placeholder="e.g., 8 (running)" />
						</div>
						<div>
							<Label htmlFor="durationMin">Duration (min)</Label>
							<Input id="durationMin" name="durationMin" type="number" step="1" placeholder="e.g., 45" />
						</div>
						<div className="md:col-span-4"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{Math.round(res.restKcal)}</p><p className="text-sm text-muted-foreground">Rest kcal</p></div>
									<div><p className="text-2xl font-bold">{Math.round(res.activeKcal)}</p><p className="text-sm text-muted-foreground">Active kcal</p></div>
									<div><p className="text-2xl font-bold">{Math.round(res.delta)}</p><p className="text-sm text-muted-foreground">Extra vs rest</p></div>
								</div>
								<CardDescription className="text-center">{res.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<Guide />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function RelatedCalculators() {
	return (
		<Card>
			<CardHeader><CardTitle>Related calculators</CardTitle></CardHeader>
			<CardContent>
				<ul className="list-disc ml-6 space-y-1 text-sm">
					<li><a className="text-primary underline" href="/category/health-fitness/resting-metabolic-rate-calculator">Resting Metabolic Rate</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/mets-calories-burned-calculator">METs to Calories</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/standing-vs-sitting-calorie-burn-calculator">Standing vs Sitting</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function Guide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Rest vs Active Burn: Guide</CardTitle>
				<CardDescription>Use METs to estimate active energy cost.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<p>Active calorie burn can be estimated from METs: kcal/min ≈ MET × 3.5 × body mass (kg) / 200. Compare this to resting burn over the same period (RMR/1440) to see incremental energy cost.</p>
				<p>Keywords: energy expenditure calculator, MET formula, resting vs active calories, exercise calories.</p>
			</CardContent>
		</Card>
	)
}
