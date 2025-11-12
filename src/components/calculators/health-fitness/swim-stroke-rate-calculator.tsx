'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Waves, Gauge, Activity, Calendar, TimerReset } from 'lucide-react';

const formSchema = z.object({
  stroke: z.enum(['freestyle', 'backstroke', 'breaststroke', 'butterfly']).optional(),
  distance: z.number().positive().optional(),
  time: z.number().positive().optional(),
  strokeCount: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  strokeRate: number;
  pacePer100: number;
  efficiency: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Record baseline stroke count, tempo, and pace for primary stroke over multiple repeats.' },
  { week: 2, focus: 'Introduce catch-up and fingertip-drag drills to refine entry and lengthen stroke.' },
  { week: 3, focus: 'Add tempo trainer work: 6 × 50m maintaining calculated stroke rate with :20 rest.' },
  { week: 4, focus: 'Complete aerobic endurance sets focusing on consistent stroke count across repeats.' },
  { week: 5, focus: 'Incorporate sculling and single-arm drills to improve feel for the water and catch efficiency.' },
  { week: 6, focus: 'Perform pace change sets (e.g., descend 4 × 100m) while maintaining optimal stroke rate.' },
  { week: 7, focus: 'Simulate race sets at goal pace with stroke rate monitoring every 25m.' },
  { week: 8, focus: 'Reassess stroke rate and pace, compare to week 1, and adjust training focus accordingly.' },
];

const faqs: [string, string][] = [
  ['What is stroke rate in swimming?', 'Stroke rate refers to the number of stroke cycles completed per minute. It represents arm turnover speed and influences propulsion and pacing.'],
  ['How do I count strokes accurately?', 'Count the number of strokes taken for a full pool length (each hand entry counts as one). Use consistent pool lengths and stroke definitions for reliable data.'],
  ['Why does stroke type matter?', 'Each stroke has different optimal stroke rates due to mechanics: freestyle/backstroke typically 40–55 spm, butterfly 35–45 spm, breaststroke 25–35 spm. The calculator adjusts efficiency accordingly.'],
  ['What is pace per 100m?', 'Pace per 100m indicates how long it takes to swim 100 meters based on your input distance and time. It helps monitor training intensity and race pacing.'],
  ['How can I improve stroke efficiency?', 'Focus on streamlined body position, balanced rotation, high-elbow catch, strong kick, and controlled breathing. Drills and feedback from a coach accelerate improvements.'],
  ['Does a higher stroke rate mean faster swimming?', 'Not always. Speed results from both stroke rate and stroke length. An overly high rate without effective distance per stroke leads to inefficiency and fatigue.'],
  ['Should I use a tempo trainer?', 'Tempo trainers help maintain consistent stroke rate during sets. They are useful for neuromuscular training and pacing, especially when targeting specific stroke tempos.'],
  ['How often should I reassess?', 'Reassess every 4–6 weeks or after a training block. Consistent monitoring ensures stroke rate adjustments align with improvements in technique and fitness.'],
  ['Can this calculator replace coach feedback?', 'No. Use it as a supplementary tool. A coach provides stroke-specific corrections, underwater analysis, and personalised training adjustments.'],
  ['Does pool length affect stroke rate?', 'Yes. Turns and push-offs in short course pools can temporarily reduce stroke rate. Compare stroke metrics within the same pool length (SCY, SCM, LCM) for accuracy.'],
];

const understandingInputs = [
  { label: 'Stroke Type', description: 'Select the stroke you swam: freestyle, backstroke, breaststroke, or butterfly. Efficiency ranges differ for each.' },
  { label: 'Distance (meters)', description: 'Swimming distance completed for the timing sample. Use a consistent pool length or open-water segment.' },
  { label: 'Time (seconds)', description: 'Elapsed time for the chosen distance. Include partial seconds (e.g., 62.5) for precision.' },
  { label: 'Total Stroke Count', description: 'Total number of strokes taken over the measured distance. Count each hand entry individually.' },
];

const calculateStrokeMetrics = (values: FormValues) => {
  if (!values.distance || !values.time || !values.strokeCount) return null;

  const strokeRate = (values.strokeCount / values.time) * 60;
  const pacePer100 = (values.time / values.distance) * 100;

  let efficiencyBase: number;
  switch (values.stroke) {
    case 'breaststroke':
      efficiencyBase = 32;
      break;
    case 'butterfly':
      efficiencyBase = 38;
      break;
    case 'backstroke':
      efficiencyBase = 44;
      break;
    default:
      efficiencyBase = 48; // freestyle
  }

  const efficiency = Math.max(0, Math.min(100, 100 - Math.abs(strokeRate - efficiencyBase) * 2));

  return { strokeRate, pacePer100, efficiency };
};

const interpret = (stroke: FormValues['stroke'], strokeRate: number, efficiency: number) => {
  if (efficiency >= 85) return 'Stroke rate and efficiency are well aligned with optimal ranges for this stroke. Maintain form under fatigue and continue fine-tuning pacing.';
  if (efficiency >= 70) return 'Stroke mechanics are solid, but there is room to refine catch, pull, or kick timing to boost efficiency further.';
  return 'Stroke rate deviates from typical ranges for this stroke. Focus on drills that enhance distance per stroke and maintain streamlined body position.';
};

const recommendations = (stroke: FormValues['stroke'], efficiency: number) => {
  const recs = [
    'Monitor stroke count every few lengths to ensure consistency as pace changes.',
    'Use video feedback (above and underwater) to analyse body alignment and pull path.',
    'Include strength and mobility work focused on shoulders, core, and hips to support efficient strokes.',
  ];

  if (efficiency < 75) {
    recs.push('Incorporate tempo trainer sessions to coordinate stroke rate with breathing and kick rhythm.');
  }

  if (stroke === 'breaststroke') {
    recs.push('Prioritise glide timing and kick propulsion to maximise distance per stroke.');
  } else if (stroke === 'butterfly') {
    recs.push('Focus on synchronising dolphin kick pairing with arm recovery for smoother rhythm.');
  }

  return recs;
};

const warningSigns = () => [
  'Large discrepancies between stroke rate and efficiency may indicate over-rotation, dropped elbows, or timing issues—seek technique feedback.',
  'Avoid drastic stroke rate changes without adequate conditioning to prevent shoulder overload.',
  'This tool provides estimates; rely on professional coaching for personalised stroke correction.',
];

export default function SwimStrokeRateCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stroke: 'freestyle',
      distance: undefined,
      time: undefined,
      strokeCount: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateStrokeMetrics(values);
    if (!calc) {
      setResult(null);
      return;
    }

    setResult({
      strokeRate: calc.strokeRate,
      pacePer100: calc.pacePer100,
      efficiency: calc.efficiency,
      interpretation: interpret(values.stroke ?? 'freestyle', calc.strokeRate, calc.efficiency),
      recommendations: recommendations(values.stroke ?? 'freestyle', calc.efficiency),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Waves className="h-5 w-5" /> Swim Stroke Rate Calculator</CardTitle>
          <CardDescription>Analyse stroke rate, efficiency, and pace across your primary stroke.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="stroke" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Stroke Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stroke" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="freestyle">Freestyle</SelectItem>
                        <SelectItem value="backstroke">Backstroke</SelectItem>
                        <SelectItem value="breaststroke">Breaststroke</SelectItem>
                        <SelectItem value="butterfly">Butterfly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="distance" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Distance (meters)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="time" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><TimerReset className="h-4 w-4" /> Time (seconds)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 65.5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="strokeCount" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Total Stroke Count</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 46" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Stroke Rate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Stroke Efficiency Summary</CardTitle></div>
              <CardDescription>Key metrics for your input swim</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Stroke Rate</h4>
                  <p className="text-2xl font-bold text-primary">{result.strokeRate.toFixed(1)} spm</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Pace (per 100m)</h4>
                  <p className="text-2xl font-bold text-primary">{result.pacePer100.toFixed(1)} s</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Efficiency Score</h4>
                  <p className="text-2xl font-bold text-primary">{result.efficiency.toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warningSigns.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Stroke Optimisation Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Week</th>
                      <th className="text-left p-2">Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.plan.map(({ week, focus }) => (
                      <tr key={week} className="border-b">
                        <td className="p-2">{week}</td>
                        <td className="p-2">{focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Consistency ensures meaningful comparisons over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {understandingInputs.map((item, index) => (
              <li key={index}>
                <span className="font-semibold text-foreground">{item.label}:</span>
                <span className="text-sm text-muted-foreground"> {item.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Additional tools to enhance swim performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/critical-swim-speed-calculator" className="text-primary hover:underline">Critical Swim Speed Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Determine aerobic threshold pace for distance swimming.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/oxygen-debt-epoc-calculator" className="text-primary hover:underline">Oxygen Debt (EPOC)</Link></h4>
              <p className="text-sm text-muted-foreground">Plan recovery after high-intensity swim sets.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/power-to-heart-rate-efficiency-calculator" className="text-primary hover:underline">Power-to-Heart Rate Efficiency</Link></h4>
              <p className="text-sm text-muted-foreground">Track aerobic efficiency trends across multisport training.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/anaerobic-capacity-calculator" className="text-primary hover:underline">Anaerobic Capacity Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Support sprint sets with anaerobic profiling.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Balancing Stroke Rate & Efficiency</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Stroke rate and stroke length combine to determine swim speed. Efficient swimmers maintain the right turnover for pacing demands while preserving distance per stroke. Use targeted drills, tempo tools, and consistent feedback to align technique with race goals. Monitoring stroke metrics across training phases helps identify fatigue, technical breakdowns, and opportunities for improvement.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO-oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map(([question, answer], index) => (
            <div key={index}>
              <h4 className="font-semibold mb-1">{question}</h4>
              <p className="text-sm text-muted-foreground">{answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}