'use client'

import { useState } from 'react'
import { Activity, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Vo2ReserveCalculator() {
	const [res, setRes] = useState<null | {
		vo2Reserve: number
		trainingZones: { [key: string]: number }
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const vo2Max = Number(formData.get('vo2Max'))
		const vo2Rest = Number(formData.get('vo2Rest'))
		
		if (!vo2Max || !vo2Rest || vo2Max <= vo2Rest) { setRes(null); return }

		const vo2Reserve = vo2Max - vo2Rest
		
		// Calculate training zones as percentages of VO2 Reserve
		const trainingZones = {
			'Recovery': vo2Rest + (vo2Reserve * 0.5),
			'Aerobic Base': vo2Rest + (vo2Reserve * 0.65),
			'Tempo': vo2Rest + (vo2Reserve * 0.8),
			'Threshold': vo2Rest + (vo2Reserve * 0.9),
			'VO2 Max': vo2Max
		}

		let category = 'Moderate fitness'
		if (vo2Reserve < 20) category = 'Low fitness - build aerobic base'
		else if (vo2Reserve < 30) category = 'Developing fitness'
		else if (vo2Reserve >= 40) category = 'High fitness - elite level'

		const opinion = `Your VO₂ Reserve is ${vo2Reserve.toFixed(1)} ml/kg/min. Use these zones to structure training: recovery at ${trainingZones.Recovery.toFixed(1)}, tempo at ${trainingZones.Tempo.toFixed(1)}, and threshold at ${trainingZones.Threshold.toFixed(1)}.`
		setRes({ vo2Reserve, trainingZones, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>VO₂ Reserve Calculator</CardTitle></div>
					<CardDescription>Calculate your VO₂ Reserve and training zones. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="vo2Max">VO₂ Max (ml/kg/min)</Label>
							<Input id="vo2Max" name="vo2Max" type="number" step="0.1" placeholder="e.g., 45.2" />
						</div>
						<div>
							<Label htmlFor="vo2Rest">VO₂ Rest (ml/kg/min)</Label>
							<Input id="vo2Rest" name="vo2Rest" type="number" step="0.1" placeholder="e.g., 3.5" />
						</div>
						<div className="md:self-end"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>VO₂ Reserve Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{res.vo2Reserve.toFixed(1)}</p><p className="text-sm text-muted-foreground">VO₂ Reserve</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Fitness Level</p></div>
								</div>
								<div className="mt-4">
									<h4 className="font-semibold mb-2">Training Zones (ml/kg/min):</h4>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
										{Object.entries(res.trainingZones).map(([zone, value]) => (
											<div key={zone} className="flex justify-between">
												<span>{zone}:</span>
												<span className="font-mono">{value.toFixed(1)}</span>
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
						<Vo2ReserveGuide />
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
					<li><a className="text-primary underline" href="/category/health-fitness/vo2-max-calculator">VO₂ Max Calculator</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/heart-rate-zone-training-calculator">Heart Rate Zones</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/training-stress-score-calculator">Training Stress Score</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function Vo2ReserveGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>VO₂ Reserve Training Guide</CardTitle>
				<CardDescription>Using VO₂ Reserve for precise training zone prescription.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>What is VO₂ Reserve?</h3>
				<p>VO₂ Reserve is the difference between your maximum and resting oxygen consumption. It provides more accurate training zones than percentage of VO₂ Max, especially for older or less fit individuals.</p>
				<h3>Training zones</h3>
				<ul>
					<li><strong>Recovery (50%):</strong> Easy pace, active recovery</li>
					<li><strong>Aerobic Base (65%):</strong> Endurance building, fat burning</li>
					<li><strong>Tempo (80%):</strong> Lactate threshold training</li>
					<li><strong>Threshold (90%):</strong> High-intensity intervals</li>
					<li><strong>VO₂ Max (100%):</strong> Maximum effort intervals</li>
				</ul>
				<h3>Benefits over %VO₂ Max</h3>
				<ul>
					<li>More accurate for varying fitness levels</li>
					<li>Accounts for individual resting metabolism</li>
					<li>Better for older athletes</li>
					<li>More precise zone prescription</li>
				</ul>
				<p>Keywords: VO2 reserve calculator, training zones, aerobic capacity, endurance training, fitness zones.</p>
			</CardContent>
		</Card>
	)
}
