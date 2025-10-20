'use client'

import { useState } from 'react'
import { Activity, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function HeartRateVariabilityHrvScoreCalculator() {
	const [res, setRes] = useState<null | {
		rmssd: number
		score: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const age = Number(formData.get('age'))
		const rmssd = Number(formData.get('rmssd'))
		if (!age || !rmssd || age <= 0 || rmssd <= 0) { setRes(null); return }

		// Age-adjusted HRV score (simplified model)
		const expectedRmssd = 50 - (age * 0.5)
		const score = Math.max(0, Math.min(100, (rmssd / expectedRmssd) * 50))

		let category = 'Good'
		if (score < 30) category = 'Poor - focus on recovery'
		else if (score < 50) category = 'Fair - monitor stress'
		else if (score > 80) category = 'Excellent - well recovered'

		const opinion = `Your HRV score is ${Math.round(score)}/100. Higher scores indicate better autonomic nervous system balance and recovery. Track trends over time rather than single readings.`
		setRes({ rmssd, score, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Heart className="h-8 w-8 text-primary" /><CardTitle>Heart Rate Variability (HRV) Score Calculator</CardTitle></div>
					<CardDescription>Calculate your HRV score from RMSSD and age. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="age">Age (years)</Label>
							<Input id="age" name="age" type="number" step="1" placeholder="e.g., 30" />
						</div>
						<div>
							<Label htmlFor="rmssd">RMSSD (ms)</Label>
							<Input id="rmssd" name="rmssd" type="number" step="0.1" placeholder="e.g., 35.2" />
						</div>
						<div className="md:self-end"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>HRV Score Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{Math.round(res.score)}</p><p className="text-sm text-muted-foreground">HRV Score</p></div>
									<div><p className="text-2xl font-bold">{res.rmssd.toFixed(1)}</p><p className="text-sm text-muted-foreground">RMSSD (ms)</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
								</div>
								<CardDescription className="text-center">{res.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<HRVGuide />
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
					<li><a className="text-primary underline" href="/category/health-fitness/recovery-heart-rate-calculator">Recovery Heart Rate</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/stress-level-self-assessment-calculator">Stress Level Assessment</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/meditation-time-progress-tracker-calculator">Meditation Tracker</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function HRVGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Heart Rate Variability: Complete Guide</CardTitle>
				<CardDescription>Understanding HRV and how to improve it.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>What is HRV?</h3>
				<p>Heart Rate Variability measures the variation in time between heartbeats. Higher HRV generally indicates better autonomic nervous system balance, recovery, and stress resilience.</p>
				<h3>How to measure</h3>
				<ul>
					<li>Use a chest strap heart rate monitor or smartwatch with HRV capability</li>
					<li>Measure consistently (same time, same conditions)</li>
					<li>Take readings during rest or upon waking</li>
				</ul>
				<h3>Improving HRV</h3>
				<ul>
					<li>Prioritize quality sleep (7-9 hours)</li>
					<li>Manage stress through meditation, breathing exercises</li>
					<li>Regular aerobic exercise and strength training</li>
					<li>Limit alcohol and caffeine</li>
					<li>Maintain consistent sleep schedule</li>
				</ul>
				<h3>SEO notes</h3>
				<p>Keywords: HRV calculator, heart rate variability score, RMSSD, autonomic nervous system, recovery metrics, stress resilience.</p>
			</CardContent>
		</Card>
	)
}
