'use client'

import { useState } from 'react'
import { Activity, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CortisolStressResponseEstimator() {
	const [res, setRes] = useState<null | {
		score: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const sleepHours = Number(formData.get('sleepHours'))
		const stressLevel = Number(formData.get('stressLevel'))
		const exerciseDays = Number(formData.get('exerciseDays'))
		const meditationMinutes = Number(formData.get('meditationMinutes'))
		
		if (!sleepHours || !stressLevel || exerciseDays === undefined || meditationMinutes === undefined) { 
			setRes(null); return 
		}

		// Simplified cortisol stress response scoring
		let score = 50 // baseline
		
		// Sleep impact (0-10 scale)
		if (sleepHours >= 8) score += 15
		else if (sleepHours >= 7) score += 10
		else if (sleepHours >= 6) score += 5
		else score -= 10
		
		// Stress level impact (1-10 scale)
		score -= (stressLevel - 5) * 8
		
		// Exercise impact
		if (exerciseDays >= 5) score += 10
		else if (exerciseDays >= 3) score += 5
		else if (exerciseDays === 0) score -= 5
		
		// Meditation impact
		if (meditationMinutes >= 20) score += 10
		else if (meditationMinutes >= 10) score += 5
		else if (meditationMinutes === 0) score -= 5
		
		score = Math.max(0, Math.min(100, score))

		let category = 'Moderate stress response'
		if (score < 30) category = 'High stress response - focus on recovery'
		else if (score < 50) category = 'Elevated stress response'
		else if (score > 80) category = 'Low stress response - well managed'

		const opinion = `Your estimated cortisol stress response score is ${Math.round(score)}/100. Lower scores suggest higher stress hormone activity. Focus on sleep, stress management, and regular exercise.`
		setRes({ score, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><AlertTriangle className="h-8 w-8 text-primary" /><CardTitle>Cortisol Stress Response Estimator</CardTitle></div>
					<CardDescription>Estimate your stress hormone response based on lifestyle factors. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="sleepHours">Sleep hours (per night)</Label>
							<Input id="sleepHours" name="sleepHours" type="number" step="0.5" placeholder="e.g., 7.5" />
						</div>
						<div>
							<Label htmlFor="stressLevel">Stress level (1-10)</Label>
							<Input id="stressLevel" name="stressLevel" type="number" step="1" min="1" max="10" placeholder="e.g., 6" />
						</div>
						<div>
							<Label htmlFor="exerciseDays">Exercise days/week</Label>
							<Input id="exerciseDays" name="exerciseDays" type="number" step="1" min="0" max="7" placeholder="e.g., 4" />
						</div>
						<div>
							<Label htmlFor="meditationMinutes">Meditation (min/day)</Label>
							<Input id="meditationMinutes" name="meditationMinutes" type="number" step="1" min="0" placeholder="e.g., 15" />
						</div>
						<div className="md:col-span-4"><Button type="submit" className="w-full md:w-auto">Estimate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Stress Response Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{Math.round(res.score)}</p><p className="text-sm text-muted-foreground">Stress Score</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
								</div>
								<CardDescription className="text-center">{res.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<CortisolGuide />
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
					<li><a className="text-primary underline" href="/category/health-fitness/heart-rate-variability-hrv-score-calculator">HRV Score</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/sleep-debt-calculator-hf">Sleep Debt</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/meditation-time-progress-tracker-calculator">Meditation Tracker</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function CortisolGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Cortisol and Stress Management</CardTitle>
				<CardDescription>Understanding stress hormones and how to manage them.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>What is cortisol?</h3>
				<p>Cortisol is a stress hormone that helps regulate metabolism, immune function, and stress response. Chronic elevation can lead to health issues.</p>
				<h3>Signs of high cortisol</h3>
				<ul>
					<li>Difficulty sleeping or staying asleep</li>
					<li>Weight gain, especially around the abdomen</li>
					<li>Mood swings and irritability</li>
					<li>Frequent infections</li>
					<li>High blood pressure</li>
				</ul>
				<h3>Managing cortisol</h3>
				<ul>
					<li>Prioritize 7-9 hours of quality sleep</li>
					<li>Practice stress management (meditation, deep breathing)</li>
					<li>Regular exercise (but not excessive)</li>
					<li>Limit caffeine and alcohol</li>
					<li>Maintain consistent daily routines</li>
				</ul>
				<p>Keywords: cortisol calculator, stress hormone, stress management, sleep quality, meditation benefits.</p>
			</CardContent>
		</Card>
	)
}
