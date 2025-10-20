'use client'

import { useState } from 'react'
import { Activity, Snowflake } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function BrownFatActivationEstimator() {
	const [res, setRes] = useState<null | {
		incrementKcal: number
		totalKcal: number
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const ambient = Number(formData.get('ambient'))
		const durationMin = Number(formData.get('durationMin'))
		const rmr = Number(formData.get('rmr'))
		if (!ambient || !durationMin || !rmr) { setRes(null); return }

		const thermoneutral = 24
		const deltaC = Math.max(0, thermoneutral - ambient)
		const increasePct = Math.min(0.5, deltaC * 0.02) // cap at +50%

		const restPerMin = rmr / 1440
		const baseline = restPerMin * durationMin
		const increment = baseline * increasePct

		const opinion = `Estimated extra burn is ${Math.round(increment)} kcal (${Math.round(increasePct*100)}%) due to mild cold exposure. Individual responses vary widely.`
		setRes({ incrementKcal: increment, totalKcal: baseline + increment, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Snowflake className="h-8 w-8 text-primary" /><CardTitle>Brown Fat Activation Estimator</CardTitle></div>
					<CardDescription>Estimate extra calories from cold exposure and brown fat activation. Inputs remain blank until you add values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="ambient">Ambient temperature (°C)</Label>
							<Input id="ambient" name="ambient" type="number" step="0.1" placeholder="e.g., 18" />
						</div>
						<div>
							<Label htmlFor="durationMin">Exposure duration (min)</Label>
							<Input id="durationMin" name="durationMin" type="number" step="1" placeholder="e.g., 60" />
						</div>
						<div>
							<Label htmlFor="rmr">RMR (kcal/day)</Label>
							<Input id="rmr" name="rmr" type="number" step="1" placeholder="e.g., 1600" />
						</div>
						<div className="md:col-span-3"><Button type="submit" className="w-full md:w-auto">Estimate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{Math.round(res.incrementKcal)}</p><p className="text-sm text-muted-foreground">Extra kcal</p></div>
									<div><p className="text-2xl font-bold">{Math.round(res.totalKcal)}</p><p className="text-sm text-muted-foreground">Total kcal (period)</p></div>
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
					<li><a className="text-primary underline" href="/category/health-fitness/caloric-cost-of-cold-exposure-calculator">Caloric Cost of Cold Exposure</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/resting-metabolic-rate-calculator">Resting Metabolic Rate</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/adaptive-thermogenesis-calculator">Adaptive Thermogenesis</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function Guide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Brown Adipose Tissue and Cold Exposure</CardTitle>
				<CardDescription>How mild cold can increase calorie burn.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<p>Mild cold exposure below thermoneutral (~24°C) can activate brown adipose tissue (BAT), increasing energy expenditure. Responses vary by individual, acclimation, and clothing. Start gradually and prioritize comfort and safety.</p>
				<p>Keywords: brown fat activation calculator, cold exposure calories, BAT thermogenesis, non-shivering thermogenesis.</p>
			</CardContent>
		</Card>
	)
}
