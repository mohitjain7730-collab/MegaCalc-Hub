'use client'

import { useState } from 'react'
import { Activity, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ThermicEffectOfFoodCalculator() {
	const [res, setRes] = useState<null | {
		cals: number
		range: [number, number]
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const proteinG = Number(formData.get('proteinG'))
		const carbsG = Number(formData.get('carbsG'))
		const fatG = Number(formData.get('fatG'))
		if ((!proteinG && !carbsG && !fatG) || proteinG < 0 || carbsG < 0 || fatG < 0) { setRes(null); return }

		const proteinCal = proteinG * 4
		const carbsCal = carbsG * 4
		const fatCal = fatG * 9
		const total = proteinCal + carbsCal + fatCal

		const tefMin = proteinCal * 0.2 + carbsCal * 0.05 + fatCal * 0
		const tefMax = proteinCal * 0.3 + carbsCal * 0.1 + fatCal * 0.03

		const opinion = `Estimated TEF is ${Math.round(tefMin)}–${Math.round(tefMax)} kcal (${Math.round((tefMin/total)*100)||0}–${Math.round((tefMax/total)*100)||0}% of the meal), depending on food type and individual variability.`
		setRes({ cals: total, range: [tefMin, tefMax], opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Flame className="h-8 w-8 text-primary" /><CardTitle>Thermic Effect of Food (TEF) Calculator</CardTitle></div>
					<CardDescription>Estimate calories burned digesting your meal. Inputs left blank until you enter values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="proteinG">Protein (g)</Label>
							<Input id="proteinG" name="proteinG" type="number" step="1" placeholder="e.g., 30" />
						</div>
						<div>
							<Label htmlFor="carbsG">Carbs (g)</Label>
							<Input id="carbsG" name="carbsG" type="number" step="1" placeholder="e.g., 60" />
						</div>
						<div>
							<Label htmlFor="fatG">Fat (g)</Label>
							<Input id="fatG" name="fatG" type="number" step="1" placeholder="e.g., 20" />
						</div>
						<div className="md:self-end"><Button type="submit" className="w-full md:w-auto">Estimate TEF</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>TEF Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{Math.round(res.range[0])}–{Math.round(res.range[1])}</p><p className="text-sm text-muted-foreground">kcal digested</p></div>
									<div><p className="text-2xl font-bold">{Math.round(res.cals)}</p><p className="text-sm text-muted-foreground">Meal kcal</p></div>
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
					<li><a className="text-primary underline" href="/category/health-fitness/daily-calorie-needs-calculator">Daily Calorie Needs (TDEE)</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/macro-ratio-calculator">Macro Ratio</a></li>
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
				<CardTitle>Thermic Effect of Food (TEF): Full Guide</CardTitle>
				<CardDescription>How macros alter digestion energy cost.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<p>TEF is the energy required to digest, absorb, and metabolize food. Protein has the highest TEF (20–30%), carbohydrates moderate (5–10%), and fat the lowest (0–3%). Whole minimally processed foods usually raise TEF versus ultra-processed equivalents.</p>
				<p>Keywords: thermic effect of food calculator, TEF calories, high protein diet, digestion energy.</p>
			</CardContent>
		</Card>
	)
}
