'use client'

import { useState } from 'react'
import { Activity, Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function MaximalAerobicSpeedMasCalculator() {
	const [res, setRes] = useState<null | {
		mas: number
		trainingPaces: { [key: string]: string }
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const distance = Number(formData.get('distance'))
		const timeMin = Number(formData.get('timeMin'))
		const timeSec = Number(formData.get('timeSec'))
		
		if (!distance || !timeMin || timeSec === undefined) { setRes(null); return }

		const totalTimeMin = timeMin + (timeSec / 60)
		const mas = distance / totalTimeMin // km/h

		// Calculate training paces as percentages of MAS
		const trainingPaces = {
			'Recovery': `${(mas * 0.65).toFixed(1)} km/h`,
			'Aerobic Base': `${(mas * 0.75).toFixed(1)} km/h`,
			'Tempo': `${(mas * 0.85).toFixed(1)} km/h`,
			'Threshold': `${(mas * 0.95).toFixed(1)} km/h`,
			'VO2 Max': `${mas.toFixed(1)} km/h`,
			'Anaerobic': `${(mas * 1.05).toFixed(1)} km/h`
		}

		let category = 'Moderate aerobic fitness'
		if (mas < 12) category = 'Developing - focus on base building'
		else if (mas < 15) category = 'Good aerobic fitness'
		else if (mas < 18) category = 'High aerobic fitness'
		else category = 'Elite aerobic fitness'

		const opinion = `Your MAS is ${mas.toFixed(1)} km/h. Use these training paces: recovery at ${trainingPaces.Recovery}, tempo at ${trainingPaces.Tempo}, and threshold at ${trainingPaces.Threshold}.`
		setRes({ mas, trainingPaces, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Gauge className="h-8 w-8 text-primary" /><CardTitle>Maximal Aerobic Speed (MAS) Calculator</CardTitle></div>
					<CardDescription>Calculate your MAS from a time trial. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="distance">Distance (km)</Label>
							<Input id="distance" name="distance" type="number" step="0.1" placeholder="e.g., 1.5" />
						</div>
						<div>
							<Label htmlFor="timeMin">Minutes</Label>
							<Input id="timeMin" name="timeMin" type="number" step="1" placeholder="e.g., 6" />
						</div>
						<div>
							<Label htmlFor="timeSec">Seconds</Label>
							<Input id="timeSec" name="timeSec" type="number" step="1" placeholder="e.g., 30" />
						</div>
						<div className="md:self-end"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>MAS Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{res.mas.toFixed(1)}</p><p className="text-sm text-muted-foreground">km/h</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Fitness Level</p></div>
								</div>
								<div className="mt-4">
									<h4 className="font-semibold mb-2">Training Paces:</h4>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
										{Object.entries(res.trainingPaces).map(([zone, pace]) => (
											<div key={zone} className="flex justify-between">
												<span>{zone}:</span>
												<span className="font-mono">{pace}</span>
											</div>
										))}
									</div>
								</div>
								<CardDescription className="text-center mt-4">{res.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<MasGuide />
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
					<li><a className="text-primary underline" href="/category/health-fitness/running-pace-calculator">Running Pace Calculator</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/vo2-max-calculator">VO₂ Max Calculator</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/critical-swim-speed-calculator">Critical Swim Speed</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function MasGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Maximal Aerobic Speed (MAS) Training</CardTitle>
				<CardDescription>Using MAS to structure your running training.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>What is MAS?</h3>
				<p>Maximal Aerobic Speed is the minimum speed at which VO₂ Max is reached. It's a key metric for structuring running training and is typically measured via a 6-minute time trial or similar test.</p>
				<h3>Training zones based on MAS</h3>
				<ul>
					<li><strong>Recovery (65% MAS):</strong> Easy runs, active recovery</li>
					<li><strong>Aerobic Base (75% MAS):</strong> Long, steady runs</li>
					<li><strong>Tempo (85% MAS):</strong> Lactate threshold training</li>
					<li><strong>Threshold (95% MAS):</strong> High-intensity intervals</li>
					<li><strong>VO₂ Max (100% MAS):</strong> Maximum aerobic intervals</li>
					<li><strong>Anaerobic (105% MAS):</strong> Speed work, short intervals</li>
				</ul>
				<h3>Sample workouts</h3>
				<ul>
					<li><strong>Recovery:</strong> 30-60 min at 65% MAS</li>
					<li><strong>Tempo:</strong> 3×8 min at 85% MAS with 2 min recovery</li>
					<li><strong>VO₂ Max:</strong> 5×3 min at 100% MAS with 3 min recovery</li>
					<li><strong>Anaerobic:</strong> 8×400m at 105% MAS with 90s recovery</li>
				</ul>
				<h3>Testing MAS</h3>
				<ul>
					<li>Warm up thoroughly (15-20 minutes)</li>
					<li>Run 6 minutes at maximum sustainable pace</li>
					<li>Record distance covered accurately</li>
					<li>Test every 4-6 weeks to track progress</li>
				</ul>
				<p>Keywords: MAS calculator, maximal aerobic speed, running training zones, VO2 max training, running pace.</p>
			</CardContent>
		</Card>
	)
}
