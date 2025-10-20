'use client'

import { useState } from 'react'
import { Activity, Droplets } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function StrokeVolumeCalculator() {
	const [res, setRes] = useState<null | {
		svMl: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const co = Number(formData.get('co'))
		const hr = Number(formData.get('hr'))
		const edv = Number(formData.get('edv'))
		const esv = Number(formData.get('esv'))

		let sv: number | null = null
		if (co && hr) sv = (co * 1000) / hr
		else if (edv && esv && edv > esv) sv = edv - esv

		if (!sv || sv <= 0) { setRes(null); return }

		let category = 'Typical resting range'
		if (sv < 55) category = 'Low – consider aerobic development'
		else if (sv > 100) category = 'High – endurance adapted'

		const opinion = `Estimated stroke volume is ${sv.toFixed(0)} mL/beat. Endurance training and larger heart size tend to increase stroke volume.`
		setRes({ svMl: sv, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Droplets className="h-8 w-8 text-primary" /><CardTitle>Stroke Volume Calculator</CardTitle></div>
					<CardDescription>Compute stroke volume from cardiac output and HR, or EDV−ESV. Inputs are blank.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="co">Cardiac output (L/min)</Label>
							<Input id="co" name="co" type="number" step="0.1" placeholder="e.g., 5.5" />
						</div>
						<div>
							<Label htmlFor="hr">Heart rate (bpm)</Label>
							<Input id="hr" name="hr" type="number" step="1" placeholder="e.g., 60" />
						</div>
						<div>
							<Label htmlFor="edv">EDV (mL)</Label>
							<Input id="edv" name="edv" type="number" step="1" placeholder="e.g., 120" />
						</div>
						<div>
							<Label htmlFor="esv">ESV (mL)</Label>
							<Input id="esv" name="esv" type="number" step="1" placeholder="e.g., 50" />
						</div>
						<div className="md:col-span-4"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{res.svMl.toFixed(0)}</p><p className="text-sm text-muted-foreground">mL/beat</p></div>
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
					<li><a className="text-primary underline" href="/category/health-fitness/cardiac-output-calculator">Cardiac Output</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/heart-rate-zone-training-calculator">Heart Rate Zones</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/vo2-max-calculator">VO₂ Max</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function Guide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Stroke Volume Explained</CardTitle>
				<CardDescription>Determinants, normal values, and training effects.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<p>Stroke volume (SV) is blood ejected per beat. It rises with aerobic training due to increased ventricular filling and contractility. Typical resting SV ranges ~55–100 mL/beat, higher in endurance-trained athletes.</p>
				<p>Keywords: stroke volume calculator, EDV ESV, mL/beat, endurance adaptations, heart function.</p>
			</CardContent>
		</Card>
	)
}
