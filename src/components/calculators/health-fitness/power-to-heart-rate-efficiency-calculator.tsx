'use client'

import { useState } from 'react'
import { Activity, Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PowerToHeartRateEfficiencyCalculator() {
	const [res, setRes] = useState<null | {
		index: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const power = Number(formData.get('power'))
		const hr = Number(formData.get('hr'))

		if (!power || !hr || hr <= 0) { setRes(null); return }

		const index = power / hr
		let category = 'Moderate aerobic efficiency'
		if (index < 1.2) category = 'Low efficiency – build aerobic base'
		else if (index > 1.8) category = 'High aerobic efficiency'

		const opinion = `Your power-to-HR index is ${index.toFixed(2)} W/bpm. Track this metric for the same session type and conditions to monitor aerobic efficiency and decoupling over time.`
		setRes({ index, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Gauge className="h-8 w-8 text-primary" /><CardTitle>Power-to-Heart Rate Efficiency Calculator</CardTitle></div>
					<CardDescription>Relate mechanical power to heart rate for aerobic efficiency. Fields are blank for your data.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="power">Average power (W)</Label>
							<Input id="power" name="power" type="number" step="1" placeholder="e.g., 200" />
						</div>
						<div>
							<Label htmlFor="hr">Average heart rate (bpm)</Label>
							<Input id="hr" name="hr" type="number" step="1" placeholder="e.g., 150" />
						</div>
						<div className="md:self-end"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Efficiency Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{res.index.toFixed(2)}</p><p className="text-sm text-muted-foreground">W per bpm</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
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
					<li><a className="text-primary underline" href="/category/health-fitness/cycling-power-output-calculator">Cycling Power Output</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/heart-rate-zone-training-calculator">Heart Rate Zones</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/training-stress-score-calculator">Training Stress Score</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function Guide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Power-to-HR Efficiency: Detailed Guide</CardTitle>
				<CardDescription>What the metric means and how to use it.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>What is it?</h3>
				<p>The power-to-heart rate index divides mechanical power by heart rate, giving a simple snapshot of aerobic cost. Higher numbers at the same RPE and conditions suggest improved aerobic efficiency.</p>
				<h3>How to compare</h3>
				<ul>
					<li>Compare like-for-like sessions (same terrain, temperature, hydration).</li>
					<li>Track seasonal trends; expect improvements with base training.</li>
					<li>Watch for decoupling: if HR drifts up for the same power, efficiency falls.</li>
				</ul>
				<h3>SEO notes</h3>
				<p>Keywords: aerobic efficiency calculator, power to HR ratio, cycling running efficiency, cardiac drift, decoupling.</p>
			</CardContent>
		</Card>
	)
}
