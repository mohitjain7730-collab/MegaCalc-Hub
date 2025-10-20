'use client'

import { useState } from 'react'
import { Activity, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function BurnoutRiskScoreCalculator() {
	const [res, setRes] = useState<null | {
		score: number
		category: string
		opinion: string
	}>(null)

	function handleCalculate(formData: FormData) {
		const workHours = Number(formData.get('workHours'))
		const stressLevel = Number(formData.get('stressLevel'))
		const sleepHours = Number(formData.get('sleepHours'))
		const vacationDays = Number(formData.get('vacationDays'))
		const supportLevel = Number(formData.get('supportLevel'))
		
		if (!workHours || !stressLevel || !sleepHours || vacationDays === undefined || !supportLevel) { 
			setRes(null); return 
		}

		let score = 0
		
		// Work hours impact (0-25 points)
		if (workHours <= 40) score += 0
		else if (workHours <= 50) score += 10
		else if (workHours <= 60) score += 20
		else score += 25
		
		// Stress level impact (0-25 points, 1-10 scale)
		score += (stressLevel - 1) * 2.8
		
		// Sleep impact (0-20 points)
		if (sleepHours >= 8) score += 0
		else if (sleepHours >= 7) score += 5
		else if (sleepHours >= 6) score += 10
		else score += 20
		
		// Vacation impact (0-15 points)
		if (vacationDays >= 20) score += 0
		else if (vacationDays >= 15) score += 5
		else if (vacationDays >= 10) score += 10
		else score += 15
		
		// Support level impact (0-15 points, 1-10 scale)
		score += (10 - supportLevel) * 1.5

		score = Math.max(0, Math.min(100, score))

		let category = 'Moderate risk'
		if (score < 30) category = 'Low risk - well managed'
		else if (score < 50) category = 'Moderate risk - monitor stress'
		else if (score < 70) category = 'High risk - take action'
		else category = 'Very high risk - seek support'

		const opinion = `Your burnout risk score is ${Math.round(score)}/100. ${score >= 50 ? 'Consider reducing work hours, improving sleep, and seeking support.' : 'Maintain current practices and continue monitoring.'}`
		setRes({ score, category, opinion })
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<div className='flex items-center gap-4'><AlertCircle className="h-8 w-8 text-primary" /><CardTitle>Burnout Risk Score Calculator</CardTitle></div>
					<CardDescription>Assess your risk of workplace burnout. Inputs are blank for your values.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={data => handleCalculate(data)} className="grid grid-cols-1 md:grid-cols-5 gap-4">
						<div>
							<Label htmlFor="workHours">Work hours/week</Label>
							<Input id="workHours" name="workHours" type="number" step="1" placeholder="e.g., 45" />
						</div>
						<div>
							<Label htmlFor="stressLevel">Stress level (1-10)</Label>
							<Input id="stressLevel" name="stressLevel" type="number" step="1" min="1" max="10" placeholder="e.g., 7" />
						</div>
						<div>
							<Label htmlFor="sleepHours">Sleep hours/night</Label>
							<Input id="sleepHours" name="sleepHours" type="number" step="0.5" placeholder="e.g., 6.5" />
						</div>
						<div>
							<Label htmlFor="vacationDays">Vacation days/year</Label>
							<Input id="vacationDays" name="vacationDays" type="number" step="1" min="0" placeholder="e.g., 15" />
						</div>
						<div>
							<Label htmlFor="supportLevel">Support level (1-10)</Label>
							<Input id="supportLevel" name="supportLevel" type="number" step="1" min="1" max="10" placeholder="e.g., 6" />
						</div>
						<div className="md:col-span-5"><Button type="submit" className="w-full md:w-auto">Calculate Risk</Button></div>
					</form>

					{res && (
						<Card className="mt-8">
							<CardHeader>
								<div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Burnout Risk Result</CardTitle></div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
									<div><p className="text-2xl font-bold">{Math.round(res.score)}</p><p className="text-sm text-muted-foreground">Risk Score</p></div>
									<div><p className="text-2xl font-bold">{res.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
								</div>
								<CardDescription className="text-center">{res.opinion}</CardDescription>
							</CardContent>
						</Card>
					)}

					<div className="space-y-6 mt-8">
						<RelatedCalculators />
						<BurnoutGuide />
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
					<li><a className="text-primary underline" href="/category/health-fitness/stress-level-self-assessment-calculator">Stress Assessment</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/work-life-balance-time-allocation-calculator">Work-Life Balance</a></li>
					<li><a className="text-primary underline" href="/category/health-fitness/sleep-debt-calculator-hf">Sleep Debt</a></li>
				</ul>
			</CardContent>
		</Card>
	)
}

function BurnoutGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Preventing Burnout</CardTitle>
				<CardDescription>Recognize signs and take action to prevent workplace burnout.</CardDescription>
			</CardHeader>
			<CardContent className="prose prose-sm max-w-none">
				<h3>Warning signs</h3>
				<ul>
					<li>Chronic fatigue and exhaustion</li>
					<li>Decreased performance and productivity</li>
					<li>Increased cynicism and negativity</li>
					<li>Physical symptoms (headaches, insomnia)</li>
					<li>Emotional detachment from work</li>
				</ul>
				<h3>Prevention strategies</h3>
				<ul>
					<li>Set clear work boundaries</li>
					<li>Take regular breaks and vacations</li>
					<li>Prioritize sleep and self-care</li>
					<li>Build a support network</li>
					<li>Practice stress management techniques</li>
				</ul>
				<h3>Recovery steps</h3>
				<ul>
					<li>Reduce work hours if possible</li>
					<li>Seek professional help if needed</li>
					<li>Focus on activities that bring joy</li>
					<li>Reconnect with hobbies and relationships</li>
				</ul>
				<p>Keywords: burnout calculator, workplace stress, work-life balance, stress management, mental health.</p>
			</CardContent>
		</Card>
	)
}
