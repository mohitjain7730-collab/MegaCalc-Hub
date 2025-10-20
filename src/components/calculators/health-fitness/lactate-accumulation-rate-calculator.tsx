'use client'

import { useState } from 'react'
import { Activity, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LactateAccumulationRateCalculator() {
	const [res, setRes] = useState<null | {
		accumulationRate: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const lactateStart = Number(formData.get('lactateStart'))
		const lactateEnd = Number(formData.get('lactateEnd'))
		const durationMin = Number(formData.get('durationMin'))
		const intensity = Number(formData.get('intensity'))
		
		if (!lactateStart || !lactateEnd || !durationMin || !intensity || lactateEnd <= lactateStart) { 
			setRes(null); return 
		}

		const lactateIncrease = lactateEnd - lactateStart
		const accumulationRate = lactateIncrease / durationMin // mmol/L/min

		let category = 'Moderate accumulation'
		if (accumulationRate < 0.5) category = 'Low - well below threshold'
		else if (accumulationRate < 1.0) category = 'Moderate - near threshold'
		else if (accumulationRate < 2.0) category = 'High - above threshold'
		else category = 'Very high - unsustainable intensity'

		const opinion = `Lactate accumulation rate is ${accumulationRate.toFixed(2)} mmol/L/min. ${accumulationRate < 1.0 ? 'This intensity is sustainable for longer durations.' : 'Consider reducing intensity or duration to maintain performance.'}`
		setRes({ accumulationRate, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><TrendingUp className="h-8 w-8 text-primary" /><CardTitle>Lactate Accumulation Rate Calculator</CardTitle></div>
					<CardDescription>Calculate lactate buildup rate during exercise. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="lactateStart">Starting lactate (mmol/L)</Label>
							<Input id="lactateStart" name="lactateStart" type="number" step="0.1" placeholder="e.g., 1.2" />
						</div>
						<div>
							<Label htmlFor="lactateEnd">Ending lactate (mmol/L)</Label>
							<Input id="lactateEnd" name="lactateEnd" type="number" step="0.1" placeholder="e.g., 4.5" />
						</div>
						<div>
							<Label htmlFor="durationMin">Duration (min)</Label>
							<Input id="durationMin" name="durationMin" type="number" step="1" placeholder="e.g., 20" />
						</div>
						<div>
							<Label htmlFor="intensity">Intensity (% max)</Label>
							<Input id="intensity" name="intensity" type="number" step="1" placeholder="e.g., 85" />
						</div>
						<div className="md:col-span-4"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Lactate Accumulation Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{res.accumulationRate.toFixed(2)}</p><p className="text-sm text-muted-foreground">mmol/L/min</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
								</div>
								<CardDescription className="text-center">{res.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<LactateGuide />
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
					<li><a className="text-primary underline" href="/category/health-fitness/anaerobic-threshold-calculator">Anaerobic Threshold</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/vo2-reserve-calculator">VO₂ Reserve</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/training-stress-score-calculator">Training Stress Score</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function LactateGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Understanding Lactate Accumulation</CardTitle>
				<CardDescription>How lactate affects performance and training zones.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>What is lactate?</h3>
				<p>Lactate is produced during anaerobic glycolysis when energy demand exceeds oxygen supply. It's not the cause of fatigue but rather an indicator of metabolic stress.</p>
				<h3>Lactate threshold zones</h3>
				<ul>
					<li><strong>Aerobic threshold (1-2 mmol/L):</strong> Comfortable endurance pace</li>
					<li><strong>Lactate threshold (2-4 mmol/L):</strong> Sustainable high intensity</li>
					<li><strong>Onset of blood lactate accumulation (4+ mmol/L):</strong> Unsustainable intensity</li>
				</ul>
				<h3>Training implications</h3>
				<ul>
					<li>Stay below 2 mmol/L for long endurance sessions</li>
					<li>Train at 2-4 mmol/L for threshold work</li>
					<li>Use 4+ mmol/L for short, high-intensity intervals</li>
					<li>Monitor recovery between sessions</li>
				</ul>
				<h3>Improving lactate handling</h3>
				<ul>
					<li>Base training to improve aerobic capacity</li>
					<li>Threshold training to raise lactate threshold</li>
					<li>High-intensity intervals to improve clearance</li>
					<li>Proper recovery and nutrition</li>
				</ul>
				<p>Keywords: lactate accumulation calculator, lactate threshold, anaerobic glycolysis, training zones, metabolic stress.</p>
			</CardContent>
		</Card>
	)
}
