'use client'

import { useState } from 'react'
import { Activity, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AnaerobicCapacityCalculator() {
	const [res, setRes] = useState<null | {
		anaerobicCapacity: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const weight = Number(formData.get('weight'))
		const power30s = Number(formData.get('power30s'))
		const power5min = Number(formData.get('power5min'))
		
		if (!weight || !power30s || !power5min || power30s <= power5min) { setRes(null); return }

		// Simplified anaerobic capacity calculation
		// Using power difference over 30s vs 5min as proxy
		const powerDifference = power30s - power5min
		const anaerobicCapacity = (powerDifference * 30) / (weight * 1000) // kJ/kg

		let category = 'Moderate anaerobic capacity'
		if (anaerobicCapacity < 0.5) category = 'Low - focus on power development'
		else if (anaerobicCapacity < 1.0) category = 'Developing - add sprint work'
		else if (anaerobicCapacity >= 2.0) category = 'High - excellent power output'

		const opinion = `Your anaerobic capacity is ${anaerobicCapacity.toFixed(2)} kJ/kg. This represents your ability to produce high power for short durations. Higher values indicate better sprint and power performance.`
		setRes({ anaerobicCapacity, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Flame className="h-8 w-8 text-primary" /><CardTitle>Anaerobic Capacity Calculator</CardTitle></div>
					<CardDescription>Estimate your anaerobic power capacity. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="weight">Weight (kg)</Label>
							<Input id="weight" name="weight" type="number" step="0.1" placeholder="e.g., 70" />
						</div>
						<div>
							<Label htmlFor="power30s">30s max power (W)</Label>
							<Input id="power30s" name="power30s" type="number" step="1" placeholder="e.g., 400" />
						</div>
						<div>
							<Label htmlFor="power5min">5min power (W)</Label>
							<Input id="power5min" name="power5min" type="number" step="1" placeholder="e.g., 250" />
						</div>
						<div className="md:col-span-3"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Anaerobic Capacity Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{res.anaerobicCapacity.toFixed(2)}</p><p className="text-sm text-muted-foreground">kJ/kg</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
								</div>
								<CardDescription className="text-center">{res.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<AnaerobicGuide />
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
					<li><a className="text-primary underline" href="/category/health-fitness/one-rep-max-strength-calculator">1-Rep Max</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/vo2-reserve-calculator">VO₂ Reserve</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function AnaerobicGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Anaerobic Capacity Training</CardTitle>
				<CardDescription>Understanding and improving your anaerobic power.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>What is anaerobic capacity?</h3>
				<p>Anaerobic capacity is your ability to produce high power output for short durations (10-60 seconds) using energy systems that don't require oxygen. It's crucial for sprinting, jumping, and explosive movements.</p>
				<h3>Training methods</h3>
				<ul>
					<li><strong>Short sprints:</strong> 10-30 second all-out efforts</li>
					<li><strong>Hill sprints:</strong> 15-45 second uphill sprints</li>
					<li><strong>Plyometrics:</strong> Jump training and explosive movements</li>
					<li><strong>Weight training:</strong> Heavy, explosive lifts</li>
					<li><strong>Interval training:</strong> Short, high-intensity intervals</li>
				</ul>
				<h3>Recovery</h3>
				<ul>
					<li>Allow 2-3 minutes between efforts</li>
					<li>Limit to 2-3 sessions per week</li>
					<li>Ensure adequate rest between sessions</li>
					<li>Monitor for overtraining signs</li>
				</ul>
				<p>Keywords: anaerobic capacity calculator, power training, sprint performance, explosive strength, high-intensity training.</p>
			</CardContent>
		</Card>
	)
}
