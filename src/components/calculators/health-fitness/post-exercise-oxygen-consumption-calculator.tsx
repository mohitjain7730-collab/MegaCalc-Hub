'use client'

import { useState } from 'react'
import { Activity, Wind } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PostExerciseOxygenConsumptionCalculator() {
	const [res, setRes] = useState<null | {
		epocKcal: number
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const exerciseKcal = Number(formData.get('exerciseKcal'))
		const intensity = String(formData.get('intensity') || '')
		if (!exerciseKcal) { setRes(null); return }

		let factor = 0.06
		if (intensity === 'high') factor = 0.12
		if (intensity === 'very_high') factor = 0.15
		const epoc = exerciseKcal * factor
		const opinion = `Estimated EPOC is ~${Math.round(epoc)} kcal (${Math.round(factor*100)}% of exercise calories). Intervals and heavy resistance sessions raise EPOC the most.`
		setRes({ epocKcal: epoc, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Wind className="h-8 w-8 text-primary" /><CardTitle>Post-Exercise Oxygen Consumption (EPOC) Calculator</CardTitle></div>
					<CardDescription>Estimate EPOC calories. Inputs are blank until you add your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="exerciseKcal">Exercise calories (kcal)</Label>
							<Input id="exerciseKcal" name="exerciseKcal" type="number" step="1" placeholder="e.g., 500" />
						</div>
						<div>
							<Label htmlFor="intensity">Intensity</Label>
							<select id="intensity" name="intensity" className="w-full border rounded-md h-10 px-3 bg-background">
								<option value="">Select intensity</option>
								<option value="moderate">Moderate steady</option>
								<option value="high">High</option>
								<option value="very_high">Very high (HIIT/heavy)</option>
							</select>
						</div>
						<div className="md:self-end"><Button type="submit" className="w-full md:w-auto">Estimate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>EPOC Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{Math.round(res.epocKcal)}</p><p className="text-sm text-muted-foreground">EPOC kcal</p></div>
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
					<li><a className="text-primary underline" href="/category/health-fitness/mets-calories-burned-calculator">METs to Calories</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/training-stress-score-calculator">Training Stress Score</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/recovery-heart-rate-calculator">Recovery Heart Rate</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function Guide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>What is EPOC?</CardTitle>
				<CardDescription>Why some workouts keep burning after you stop.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<p>EPOC reflects the elevated oxygen consumption after exercise to restore homeostasis: replenishing ATP-PC stores, clearing lactate, reoxygenating blood, and normalizing temperature and hormones. HIIT and heavy resistance training typically produce higher EPOC than moderate steady cardio.</p>
				<p>Keywords: EPOC calculator, afterburn effect, post-exercise oxygen consumption calories, HIIT afterburn.</p>
			</CardContent>
		</Card>
	)
}
