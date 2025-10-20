'use client'

import { useState } from 'react'
import { Activity, Wind } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function MeditationBreathingRateCalculator() {
	const [res, setRes] = useState<null | {
		breathsPerMin: number
		intervalSeconds: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const age = Number(formData.get('age'))
		const experience = String(formData.get('experience') || '')
		const goal = String(formData.get('goal') || '')
		
		if (!age || !experience || !goal) { setRes(null); return }

		// Base breathing rate by age and experience
		let baseRate = 12 // breaths per minute
		if (age < 30) baseRate = 14
		else if (age > 60) baseRate = 10

		// Adjust for experience
		if (experience === 'beginner') baseRate += 2
		else if (experience === 'advanced') baseRate -= 2

		// Adjust for goal
		if (goal === 'relaxation') baseRate -= 2
		else if (goal === 'focus') baseRate -= 1
		else if (goal === 'energy') baseRate += 1

		baseRate = Math.max(4, Math.min(20, baseRate))
		const intervalSeconds = 60 / baseRate

		let category = 'Balanced breathing'
		if (baseRate <= 6) category = 'Very slow - deep relaxation'
		else if (baseRate <= 8) category = 'Slow - calm state'
		else if (baseRate >= 16) category = 'Fast - energizing'

		const opinion = `Target ${baseRate} breaths per minute (${intervalSeconds.toFixed(1)}s intervals). This rate helps achieve your ${goal} goal while matching your experience level.`
		setRes({ breathsPerMin: baseRate, intervalSeconds, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Wind className="h-8 w-8 text-primary" /><CardTitle>Meditation Breathing Rate Calculator</CardTitle></div>
					<CardDescription>Find your optimal breathing rate for meditation. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="age">Age (years)</Label>
							<Input id="age" name="age" type="number" step="1" placeholder="e.g., 35" />
						</div>
						<div>
							<Label htmlFor="experience">Experience level</Label>
							<select id="experience" name="experience" className="w-full border rounded-md h-10 px-3 bg-background">
								<option value="">Select level</option>
								<option value="beginner">Beginner</option>
								<option value="intermediate">Intermediate</option>
								<option value="advanced">Advanced</option>
							</select>
						</div>
						<div>
							<Label htmlFor="goal">Meditation goal</Label>
							<select id="goal" name="goal" className="w-full border rounded-md h-10 px-3 bg-background">
								<option value="">Select goal</option>
								<option value="relaxation">Relaxation</option>
								<option value="focus">Focus</option>
								<option value="energy">Energy</option>
								<option value="balance">Balance</option>
							</select>
						</div>
						<div className="md:self-end"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Breathing Rate Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{res.breathsPerMin}</p><p className="text-sm text-muted-foreground">Breaths/min</p></div>
									<div><p className="text-2xl font-bold">{res.intervalSeconds.toFixed(1)}s</p><p className="text-sm text-muted-foreground">Interval</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
								</div>
								<CardDescription className="text-center">{res.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<BreathingGuide />
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
					<li><a className="text-primary underline" href="/category/health-fitness/meditation-time-progress-tracker-calculator">Meditation Tracker</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/heart-rate-variability-hrv-score-calculator">HRV Score</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/stress-level-self-assessment-calculator">Stress Assessment</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function BreathingGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Meditation Breathing Techniques</CardTitle>
				<CardDescription>Master different breathing patterns for various meditation goals.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>Basic techniques</h3>
				<ul>
					<li><strong>Box breathing:</strong> 4s inhale, 4s hold, 4s exhale, 4s hold</li>
					<li><strong>4-7-8 breathing:</strong> 4s inhale, 7s hold, 8s exhale</li>
					<li><strong>Equal breathing:</strong> Equal inhale and exhale duration</li>
				</ul>
				<h3>Benefits by rate</h3>
				<ul>
					<li><strong>4-6 breaths/min:</strong> Deep relaxation, parasympathetic activation</li>
					<li><strong>6-8 breaths/min:</strong> Calm focus, stress reduction</li>
					<li><strong>8-12 breaths/min:</strong> Balanced awareness, daily practice</li>
					<li><strong>12+ breaths/min:</strong> Energizing, alertness</li>
				</ul>
				<h3>Practice tips</h3>
				<ul>
					<li>Start with 5-10 minutes daily</li>
					<li>Use a timer or counting app</li>
					<li>Focus on smooth, natural breathing</li>
					<li>Practice in a quiet, comfortable space</li>
				</ul>
				<p>Keywords: meditation breathing rate, breathing exercises, mindfulness breathing, relaxation techniques, stress relief.</p>
			</CardContent>
		</Card>
	)
}
