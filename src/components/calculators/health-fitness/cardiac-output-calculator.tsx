'use client'

import { useState } from 'react'
import { Activity, HeartPulse } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CardiacOutputCalculator() {
	const [res, setRes] = useState<null | {
		coLMin: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const hr = Number(formData.get('hr'))
		const svMl = Number(formData.get('svMl'))

		if (!hr || !svMl || hr <= 0 || svMl <= 0) { setRes(null); return }
		const co = (hr * svMl) / 1000

		let category = 'Normal resting range'
		if (co < 4) category = 'Below typical resting output'
		else if (co > 8) category = 'Above typical resting output'

		const opinion = `Estimated cardiac output is ${co.toFixed(1)} L/min. Typical resting range is ~4–8 L/min; training and body size shift this range.`
		setRes({ coLMin: co, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><HeartPulse className="h-8 w-8 text-primary" /><CardTitle>Cardiac Output Calculator</CardTitle></div>
					<CardDescription>Enter heart rate and stroke volume to estimate cardiac output. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="hr">Heart rate (bpm)</Label>
							<Input id="hr" name="hr" type="number" step="1" placeholder="e.g., 60" />
						</div>
						<div>
							<Label htmlFor="svMl">Stroke volume (mL/beat)</Label>
							<Input id="svMl" name="svMl" type="number" step="1" placeholder="e.g., 70" />
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
									<div><p className="text-2xl font-bold">{res.coLMin.toFixed(1)}</p><p className="text-sm text-muted-foreground">L/min</p></div>
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
					<li><a className="text-primary underline" href="/category/health-fitness/stroke-volume-calculator">Stroke Volume</a></li>
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
				<CardTitle>Understanding Cardiac Output</CardTitle>
				<CardDescription>Formula, normal ranges, and training implications.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<p>Cardiac output (CO) is the volume of blood the heart pumps per minute: CO = HR × SV. At rest, typical values are 4–8 L/min, rising to 15–25+ L/min in trained athletes during maximal exercise.</p>
				<ul>
					<li>Improve CO via endurance training that raises stroke volume.</li>
					<li>Monitor hydration, temperature, and altitude effects on HR and SV.</li>
				</ul>
				<p>Keywords: cardiac output calculator, L/min, heart rate, stroke volume, endurance training.</p>
			</CardContent>
		</Card>
	)
}
