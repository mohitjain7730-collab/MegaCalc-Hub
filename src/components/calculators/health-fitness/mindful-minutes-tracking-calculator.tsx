'use client'

import { useState } from 'react'
import { Activity, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function MindfulMinutesTrackingCalculator() {
	const [res, setRes] = useState<null | {
		totalMinutes: number
		weeklyAverage: number
		streak: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const monday = Number(formData.get('monday') || 0)
		const tuesday = Number(formData.get('tuesday') || 0)
		const wednesday = Number(formData.get('wednesday') || 0)
		const thursday = Number(formData.get('thursday') || 0)
		const friday = Number(formData.get('friday') || 0)
		const saturday = Number(formData.get('saturday') || 0)
		const sunday = Number(formData.get('sunday') || 0)
		
		const totalMinutes = monday + tuesday + wednesday + thursday + friday + saturday + sunday
		const weeklyAverage = totalMinutes / 7
		
		// Calculate streak (consecutive days with >0 minutes)
		const days = [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
		let streak = 0
		for (let i = days.length - 1; i >= 0; i--) {
			if (days[i] > 0) streak++
			else break
		}

		let category = 'Good consistency'
		if (weeklyAverage < 5) category = 'Building habit - increase frequency'
		else if (weeklyAverage < 15) category = 'Developing practice'
		else if (weeklyAverage >= 30) category = 'Excellent commitment'

		const opinion = `You practiced ${totalMinutes} minutes this week (${weeklyAverage.toFixed(1)} min/day average). ${streak}-day streak. Consistency matters more than duration.`
		setRes({ totalMinutes, weeklyAverage, streak, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><Clock className="h-8 w-8 text-primary" /><CardTitle>Mindful Minutes Tracking Calculator</CardTitle></div>
					<CardDescription>Track your weekly mindfulness practice. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-7 gap-4">
						<div>
							<Label htmlFor="monday">Monday (min)</Label>
							<Input id="monday" name="monday" type="number" step="1" min="0" placeholder="0" />
						</div>
						<div>
							<Label htmlFor="tuesday">Tuesday (min)</Label>
							<Input id="tuesday" name="tuesday" type="number" step="1" min="0" placeholder="0" />
						</div>
						<div>
							<Label htmlFor="wednesday">Wednesday (min)</Label>
							<Input id="wednesday" name="wednesday" type="number" step="1" min="0" placeholder="0" />
						</div>
						<div>
							<Label htmlFor="thursday">Thursday (min)</Label>
							<Input id="thursday" name="thursday" type="number" step="1" min="0" placeholder="0" />
						</div>
						<div>
							<Label htmlFor="friday">Friday (min)</Label>
							<Input id="friday" name="friday" type="number" step="1" min="0" placeholder="0" />
						</div>
						<div>
							<Label htmlFor="saturday">Saturday (min)</Label>
							<Input id="saturday" name="saturday" type="number" step="1" min="0" placeholder="0" />
						</div>
						<div>
							<Label htmlFor="sunday">Sunday (min)</Label>
							<Input id="sunday" name="sunday" type="number" step="1" min="0" placeholder="0" />
						</div>
						<div className="md:col-span-7"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Weekly Summary</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{res.totalMinutes}</p><p className="text-sm text-muted-foreground">Total min</p></div>
									<div><p className="text-2xl font-bold">{res.weeklyAverage.toFixed(1)}</p><p className="text-sm text-muted-foreground">Daily avg</p></div>
									<div><p className="text-2xl font-bold">{res.streak}</p><p className="text-sm text-muted-foreground">Day streak</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Status</p></div>
								</div>
								<CardDescription className="text-center">{res.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<MindfulnessGuide />
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
					<li><a className="text-primary underline" href="/category/health-fitness/meditation-time-progress-tracker-calculator">Meditation Progress Tracker</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/meditation-breathing-rate-calculator">Breathing Rate</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/habit-streak-tracker-calculator">Habit Streak Tracker</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function MindfulnessGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Mindfulness Practice Guide</CardTitle>
				<CardDescription>Building a sustainable mindfulness habit.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>Getting started</h3>
				<ul>
					<li>Start with 5-10 minutes daily</li>
					<li>Choose a consistent time and place</li>
					<li>Use guided meditations or apps initially</li>
					<li>Focus on consistency over duration</li>
				</ul>
				<h3>Types of practice</h3>
				<ul>
					<li><strong>Focused attention:</strong> Concentrate on breath or object</li>
					<li><strong>Body scan:</strong> Progressive relaxation through body</li>
					<li><strong>Loving-kindness:</strong> Cultivate compassion and gratitude</li>
					<li><strong>Walking meditation:</strong> Mindful movement practice</li>
				</ul>
				<h3>Benefits</h3>
				<ul>
					<li>Reduced stress and anxiety</li>
					<li>Improved focus and attention</li>
					<li>Better emotional regulation</li>
					<li>Enhanced self-awareness</li>
				</ul>
				<p>Keywords: mindfulness tracking, meditation minutes, daily practice, stress reduction, mental wellness.</p>
			</CardContent>
		</Card>
	)
}
