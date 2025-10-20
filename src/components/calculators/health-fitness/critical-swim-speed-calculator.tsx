'use client'

import { useState } from 'react'
import { Activity, Waves } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CriticalSwimSpeedCalculator() {
	const [css, setCss] = useState<null | {
		cssMetersPerSecond: number
		cssPer100mSeconds: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const d1 = Number(formData.get('distance1'))
		const t1 = Number(formData.get('time1'))
		const d2 = Number(formData.get('distance2'))
		const t2 = Number(formData.get('time2'))

		if (!d1 || !t1 || !d2 || !t2 || t2 <= t1 || d2 <= d1) {
			setCss(null)
			return
		}

		const cssMps = (d2 - d1) / (t2 - t1)
		const per100mSec = 100 / cssMps

		let category = 'Balanced endurance'
		if (cssMps < 1.1) category = 'Develop aerobic base'
		else if (cssMps > 1.4) category = 'High performance'

		const mm = Math.floor(per100mSec / 60)
		const ss = Math.round(per100mSec % 60)
		const paceStr = `${mm}:${ss.toString().padStart(2, '0')} /100m`

		const opinion = `Your CSS is ${cssMps.toFixed(2)} m/s (${paceStr}). Use this to set threshold sets around CSS, aerobic sets slightly slower (CSS + 2–4s/100m), and VO2 sets faster (CSS - 2–6s/100m).`

		setCss({ cssMetersPerSecond: cssMps, cssPer100mSeconds: per100mSec, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Waves className="h-8 w-8 text-primary" /><CardTitle>Critical Swim Speed (CSS) Calculator</CardTitle></div>
					<CardDescription>Enter two swim time trials to estimate CSS. Keep inputs empty until you provide your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="distance1">Shorter trial distance (m)</Label>
							<Input id="distance1" name="distance1" type="number" step="1" placeholder="e.g., 200" />
						</div>
						<div>
							<Label htmlFor="time1">Shorter trial time (s)</Label>
							<Input id="time1" name="time1" type="number" step="0.1" placeholder="e.g., 150" />
						</div>
						<div>
							<Label htmlFor="distance2">Longer trial distance (m)</Label>
							<Input id="distance2" name="distance2" type="number" step="1" placeholder="e.g., 400" />
						</div>
						<div>
							<Label htmlFor="time2">Longer trial time (s)</Label>
							<Input id="time2" name="time2" type="number" step="0.1" placeholder="e.g., 320" />
						</div>
						<div className="md:col-span-2"><Button type="submit" className="w-full md:w-auto">Calculate CSS</Button></div>
					</form>

					{css && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Your CSS Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{css.cssMetersPerSecond.toFixed(2)}</p><p className="text-sm text-muted-foreground">m/s</p></div>
									<div><p className="text-2xl font-bold">{Math.floor(css.cssPer100mSeconds/60)}:{Math.round(css.cssPer100mSeconds%60).toString().padStart(2,'0')}</p><p className="text-sm text-muted-foreground">per 100 m</p></div>
									<div><p className="text-2xl font-bold">{css.category}</p><p className="text-sm text-muted-foreground">Training outlook</p></div>
								</div>
								<CardDescription className="text-center">{css.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<CSSGuide />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function RelatedCalculators() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Related calculators</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="list-disc ml-6 space-y-1 text-sm">
					<li><a className="text-primary underline" href="/category/health-fitness/swim-stroke-rate-calculator">Swim Stroke Rate Calculator</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/swimming-swolf-score-calculator">SWOLF Score Calculator</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/hydration-needs-calculator">Hydration Needs Calculator</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function CSSGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Critical Swim Speed (CSS): Complete Guide</CardTitle>
				<CardDescription>How to measure, interpret, and use CSS for faster swim training.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>What is CSS?</h3>
				<p>Critical Swim Speed is a proxy for your lactate threshold pace in the pool. It is typically derived from two time trials of different distances (e.g., 200 m and 400 m) and represents the fastest pace you can sustain aerobically for extended sets.</p>
				<h3>How to test</h3>
				<ul>
					<li>Warm up thoroughly (10–15 minutes with drills).</li>
					<li>Swim a maximal effort for a shorter distance (e.g., 200 m). Record time.</li>
					<li>Recover 5–10 minutes easy.</li>
					<li>Swim a maximal effort for a longer distance (e.g., 400 m). Record time.</li>
				</ul>
				<h3>Using CSS in training</h3>
				<ul>
					<li>Threshold sets: 6×200 m at CSS with short rests.</li>
					<li>Aerobic endurance: CSS + 2–4 s/100 m.</li>
					<li>VO₂ work: CSS − 2–6 s/100 m in short repeats.</li>
				</ul>
				<h3>SEO notes</h3>
				<p>Keywords: critical swim speed calculator, CSS pace per 100m, swim threshold pace, triathlon swim training, 200/400 test.</p>
			</CardContent>
		</Card>
	)
}
