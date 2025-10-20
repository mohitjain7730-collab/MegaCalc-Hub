'use client'

import { useState } from 'react'
import { Activity, Ruler } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ArterialStiffnessIndexCalculator() {
	const [res, setRes] = useState<null | {
		si: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const heightCm = Number(formData.get('heightCm'))
		const transitMs = Number(formData.get('transitMs'))
		if (!heightCm || !transitMs || transitMs <= 0) { setRes(null); return }

		const heightM = heightCm / 100
		const transitSec = transitMs / 1000
		const si = heightM / transitSec

		let category = 'Typical'
		if (si < 5) category = 'Lower arterial stiffness'
		else if (si > 9) category = 'Higher arterial stiffness'

		const opinion = `Estimated stiffness index is ${si.toFixed(1)} m/s. Lifestyle (BP, activity, diet) and age influence arterial stiffness.`
		setRes({ si, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Ruler className="h-8 w-8 text-primary" /><CardTitle>Arterial Stiffness Index Calculator</CardTitle></div>
					<CardDescription>Estimate stiffness index from height and pulse transit time. Inputs are blank for your data.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="heightCm">Height (cm)</Label>
							<Input id="heightCm" name="heightCm" type="number" step="0.1" placeholder="e.g., 175" />
						</div>
						<div>
							<Label htmlFor="transitMs">Pulse transit time ΔT (ms)</Label>
							<Input id="transitMs" name="transitMs" type="number" step="1" placeholder="e.g., 80" />
						</div>
						<div className="md:self-end"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{res.si.toFixed(1)}</p><p className="text-sm text-muted-foreground">m/s</p></div>
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
					<li><a className="text-primary underline" href="/category/health-fitness/blood-pressure-risk-calculator">Blood Pressure Risk</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/cholesterol-risk-calculator">Cholesterol Risk</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/cardiovascular-disease-risk-calculator">CVD Risk</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function Guide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Arterial Stiffness: Guide</CardTitle>
				<CardDescription>What SI means and lifestyle factors to improve it.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<p>Stiffness index (SI) is a surrogate for arterial compliance derived from pulse transit timing. Higher SI generally indicates stiffer arteries and higher cardiovascular risk.</p>
				<ul>
					<li>Manage blood pressure, reduce sodium, and increase aerobic activity.</li>
					<li>Prioritize sleep, stress management, and a diet rich in plants.</li>
				</ul>
				<p>Keywords: arterial stiffness index calculator, pulse wave velocity, vascular health, m/s.</p>
			</CardContent>
		</Card>
	)
}
