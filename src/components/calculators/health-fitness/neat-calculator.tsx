'use client'

import { useState } from 'react'
import { Activity, Footprints } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NeatCalculator() {
	const [res, setRes] = useState<null | {
		kcal: number
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const weight = Number(formData.get('weight'))
		const steps = Number(formData.get('steps'))
		const standingMin = Number(formData.get('standingMin'))
		const lightMin = Number(formData.get('lightMin'))
		if (!weight) { setRes(null); return }

		const kcalPerStep = 0.0005 * weight * 1.036 // approx kcal/step
		const stepsKcal = (steps || 0) * kcalPerStep
		const standingKcal = ((1.5 * 3.5 * weight) / 200) * (standingMin || 0)
		const lightKcal = ((2.5 * 3.5 * weight) / 200) * (lightMin || 0)
		const total = stepsKcal + standingKcal + lightKcal

		const opinion = `Estimated NEAT is about ${Math.round(total)} kcal/day from steps, standing, and light activity. Small increases add up significantly over weeks.`
		setRes({ kcal: total, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Footprints className="h-8 w-8 text-primary" /><CardTitle>Non-Exercise Activity Thermogenesis (NEAT) Calculator</CardTitle></div>
					<CardDescription>Estimate NEAT calories. Inputs are blank until you add your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="weight">Weight (kg)</Label>
							<Input id="weight" name="weight" type="number" step="0.1" placeholder="e.g., 70" />
						</div>
						<div>
							<Label htmlFor="steps">Steps (per day)</Label>
							<Input id="steps" name="steps" type="number" step="1" placeholder="e.g., 8000" />
						</div>
						<div>
							<Label htmlFor="standingMin">Standing time (min)</Label>
							<Input id="standingMin" name="standingMin" type="number" step="1" placeholder="e.g., 120" />
						</div>
						<div>
							<Label htmlFor="lightMin">Light activity (min)</Label>
							<Input id="lightMin" name="lightMin" type="number" step="1" placeholder="e.g., 45" />
						</div>
						<div className="md:col-span-4"><Button type="submit" className="w-full md:w-auto">Estimate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{Math.round(res.kcal)}</p><p className="text-sm text-muted-foreground">NEAT kcal/day</p></div>
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
					<li><a className="text-primary underline" href="/category/health-fitness/daily-calorie-needs-calculator">Daily Calorie Needs (TDEE)</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/standing-vs-sitting-calorie-burn-calculator">Standing vs Sitting</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/habit-streak-tracker-calculator">Habit Streak Tracker</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function Guide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>NEAT: Raise Daily Energy Burn</CardTitle>
				<CardDescription>Practical ways to increase NEAT safely.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<ul>
					<li>Walk after meals; take stairs; use a standing desk.</li>
					<li>Break up sitting every 30–60 min.</li>
					<li>Garden, clean, or perform light chores daily.</li>
				</ul>
				<p>Keywords: NEAT calculator, non-exercise activity thermogenesis calories, steps calories, standing calories.</p>
			</CardContent>
		</Card>
	)
}
