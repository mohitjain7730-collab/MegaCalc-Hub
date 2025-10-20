'use client'

import { useState } from 'react'
import { Activity, Wind } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OxygenDebtEpocCalculator() {
	const [res, setRes] = useState<null | {
		epocKcal: number
		epocDuration: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const exerciseKcal = Number(formData.get('exerciseKcal'))
		const intensity = String(formData.get('intensity') || '')
		const durationMin = Number(formData.get('durationMin'))
		
		if (!exerciseKcal || !intensity || !durationMin) { setRes(null); return }

		// EPOC calculation based on intensity and duration
		let epocFactor = 0.06 // base 6% of exercise calories
		let durationFactor = 1.0

		if (intensity === 'moderate') {
			epocFactor = 0.05
			durationFactor = 0.8
		} else if (intensity === 'high') {
			epocFactor = 0.12
			durationFactor = 1.2
		} else if (intensity === 'very_high') {
			epocFactor = 0.18
			durationFactor = 1.5
		}

		// Adjust for duration (longer sessions have higher EPOC)
		const durationAdjustment = Math.min(1.5, 1 + (durationMin - 30) / 60)
		epocFactor *= durationAdjustment

		const epocKcal = exerciseKcal * epocFactor
		const epocDuration = Math.min(24, Math.max(1, durationMin * 0.1 + 15)) // hours

		let category = 'Moderate EPOC'
		if (epocKcal < 20) category = 'Low EPOC - increase intensity'
		else if (epocKcal < 50) category = 'Moderate EPOC - good workout'
		else if (epocKcal >= 100) category = 'High EPOC - excellent metabolic stimulus'

		const opinion = `Estimated EPOC is ${Math.round(epocKcal)} kcal over ${Math.round(epocDuration)} hours. This represents the additional calories burned during recovery due to elevated metabolism.`
		setRes({ epocKcal, epocDuration, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Wind className="h-8 w-8 text-primary" /><CardTitle>Oxygen Debt (EPOC) Calculator</CardTitle></div>
					<CardDescription>Estimate excess post-exercise oxygen consumption. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="exerciseKcal">Exercise calories (kcal)</Label>
							<Input id="exerciseKcal" name="exerciseKcal" type="number" step="1" placeholder="e.g., 400" />
						</div>
						<div>
							<Label htmlFor="intensity">Intensity level</Label>
							<select id="intensity" name="intensity" className="w-full border rounded-md h-10 px-3 bg-background">
								<option value="">Select intensity</option>
								<option value="moderate">Moderate (60-70% max)</option>
								<option value="high">High (70-85% max)</option>
								<option value="very_high">Very High (85%+ max)</option>
							</select>
						</div>
						<div>
							<Label htmlFor="durationMin">Duration (min)</Label>
							<Input id="durationMin" name="durationMin" type="number" step="1" placeholder="e.g., 45" />
						</div>
						<div className="md:self-end"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>EPOC Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{Math.round(res.epocKcal)}</p><p className="text-sm text-muted-foreground">EPOC kcal</p></div>
									<div><p className="text-2xl font-bold">{Math.round(res.epocDuration)}h</p><p className="text-sm text-muted-foreground">Duration</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
								</div>
								<CardDescription className="text-center">{res.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<EpocGuide />
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
					<li><a className="text-primary underline" href="/category/health-fitness/post-exercise-oxygen-consumption-calculator">Post-Exercise Oxygen Consumption</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/anaerobic-capacity-calculator">Anaerobic Capacity</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/training-stress-score-calculator">Training Stress Score</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function EpocGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Understanding EPOC (Oxygen Debt)</CardTitle>
				<CardDescription>How your body continues burning calories after exercise.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>What is EPOC?</h3>
				<p>Excess Post-Exercise Oxygen Consumption (EPOC) is the elevated oxygen consumption and calorie burn that occurs after exercise as your body works to restore homeostasis.</p>
				<h3>What causes EPOC?</h3>
				<ul>
					<li>Replenishing ATP and creatine phosphate stores</li>
					<li>Removing lactate from blood and muscles</li>
					<li>Restoring oxygen levels in blood and tissues</li>
					<li>Normalizing body temperature and heart rate</li>
					<li>Repairing muscle tissue damage</li>
				</ul>
				<h3>Factors affecting EPOC</h3>
				<ul>
					<li><strong>Exercise intensity:</strong> Higher intensity = greater EPOC</li>
					<li><strong>Exercise duration:</strong> Longer sessions increase EPOC</li>
					<li><strong>Exercise type:</strong> Resistance training often has higher EPOC</li>
					<li><strong>Fitness level:</strong> Fitter individuals may have lower EPOC</li>
				</ul>
				<h3>Maximizing EPOC</h3>
				<ul>
					<li>Include high-intensity interval training (HIIT)</li>
					<li>Add resistance training to your routine</li>
					<li>Vary your workout intensities</li>
					<li>Allow adequate recovery between intense sessions</li>
				</ul>
				<p>Keywords: EPOC calculator, oxygen debt, afterburn effect, post-exercise calories, metabolic rate.</p>
			</CardContent>
		</Card>
	)
}
