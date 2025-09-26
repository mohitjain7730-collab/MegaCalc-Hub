
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  skill: z.number().min(1).max(5),
  severity: z.number().min(1).max(5),
  likelihood: z.number().min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

const getRiskLevel = (score: number) => {
    if (score < 5) return { name: 'Low Risk', color: 'text-green-500' };
    if (score < 10) return { name: 'Moderate Risk', color: 'text-yellow-500' };
    if (score < 15) return { name: 'High Risk', color: 'text-orange-500' };
    return { name: 'Extreme Risk', color: 'text-red-500' };
}

const descriptions = {
    skill: ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
    severity: ['Minor Injury (scrapes)', 'Moderate Injury (sprain)', 'Serious Injury (fracture)', 'Critical Injury', 'Fatality'],
    likelihood: ['Very Unlikely', 'Unlikely', 'Possible', 'Likely', 'Very Likely'],
}

export default function AdventureActivityRiskCalculator() {
  const [result, setResult] = useState<{ score: number; level: {name: string, color: string}} | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skill: 3,
      severity: 3,
      likelihood: 3,
    },
  });

  const onSubmit = (values: FormValues) => {
    // A simplified risk formula: (Severity * Likelihood) / Skill Level
    // Higher skill level mitigates the risk.
    const riskScore = (values.severity * values.likelihood * 5) / values.skill;
    setResult({ score: riskScore, level: getRiskLevel(riskScore) });
  };
  
  const skill = form.watch('skill');
  const severity = form.watch('severity');
  const likelihood = form.watch('likelihood');

  return (
    <div className="space-y-8">
      <CardDescription>This is a simplified, subjective tool to help you think about risk. It is not a substitute for professional guidance or training.</CardDescription>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="skill" render={({ field }) => (
                <FormItem>
                    <FormLabel>Your Skill Level: <span className="font-bold">{descriptions.skill[skill-1]}</span></FormLabel>
                    <FormControl><Slider defaultValue={[3]} min={1} max={5} step={1} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                </FormItem>
            )} />
            <FormField control={form.control} name="severity" render={({ field }) => (
                <FormItem>
                    <FormLabel>Potential Severity of Incident: <span className="font-bold">{descriptions.severity[severity-1]}</span></FormLabel>
                     <CardDescription>What's the worst that could reasonably happen?</CardDescription>
                    <FormControl><Slider defaultValue={[3]} min={1} max={5} step={1} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                </FormItem>
            )} />
            <FormField control={form.control} name="likelihood" render={({ field }) => (
                <FormItem>
                    <FormLabel>Likelihood of Incident: <span className="font-bold">{descriptions.likelihood[likelihood-1]}</span></FormLabel>
                    <CardDescription>How likely is an incident to occur, considering conditions and human factors?</CardDescription>
                    <FormControl><Slider defaultValue={[3]} min={1} max={5} step={1} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                </FormItem>
            )} />
          <Button type="submit">Assess Risk</Button>
        </form>
      </Form>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><ShieldAlert className="h-8 w-8 text-primary" /><CardTitle>Subjective Risk Assessment</CardTitle></div></CardHeader>
            <CardContent className="text-center">
                <p className={`text-3xl font-bold ${result.level.color}`}>{result.level.name}</p>
                <p className="text-muted-foreground mt-1">Calculated Score: {result.score.toFixed(1)}</p>
                <div className="w-full bg-muted rounded-full h-2.5 mt-4">
                    <div className={`${result.level.color.replace('text-', 'bg-')} h-2.5 rounded-full`} style={{ width: `${Math.min(100, (result.score / 25) * 100)}%` }}></div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Your Skill Level</h4>
                  <p>Your honest assessment of your own competence and experience in this specific activity. An expert can handle situations that would be extremely risky for a novice.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Potential Severity</h4>
                  <p>Consider the worst reasonable outcome if something goes wrong. For a hike on a flat trail, it might be a twisted ankle. For rock climbing, the potential severity is much higher.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Likelihood of Incident</h4>
                  <p>How probable is it that an incident will occur? This depends on factors like weather, equipment condition, and your own physical and mental state.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses a simplified risk assessment formula often used in safety management: `Risk = (Severity * Likelihood) / Mitigating Factor`.</p>
                 <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>The inherent risk of the activity is represented by `Severity * Likelihood`.</li>
                    <li>Your skill level acts as a "mitigating factor" that divides and reduces the overall risk score. A higher skill level significantly lowers the subjective risk you are exposed to, even if the inherent risk of the activity remains the same.</li>
                    <li>The final score is a subjective number used to categorize the risk into broad levels.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
