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
import { Bike, Gauge, Activity, Calendar, Zap } from 'lucide-react';

const formSchema = z.object({
  power: z.number().positive().optional(),
  currentCadence: z.number().positive().optional(),
  riderType: z.enum(['endurance', 'sprinter', 'climber']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  optimalCadence: number;
  efficiency: number;
  powerCategory: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline cadence distribution using power meter analytics or smart trainer data.' },
  { week: 2, focus: 'Introduce isolated leg drills (5 × 1 min per leg) to smooth pedal stroke and engagement.' },
  { week: 3, focus: 'Add high-cadence spins (3 × 3 min at 110–120 rpm) with full recovery to improve neuromuscular control.' },
  { week: 4, focus: 'Practice cadence targets during endurance rides, alternating 10 min at optimal cadence with 5 min at ±5 rpm.' },
  { week: 5, focus: 'Integrate gear selection drills on varied terrain to maintain cadence within optimal range.' },
  { week: 6, focus: 'Perform structured intervals at race power maintaining optimal cadence (4 × 8 min with 4 min recovery).' },
  { week: 7, focus: 'Simulate event conditions (climbs, sprints, or time trial efforts) focusing on cadence discipline.' },
  { week: 8, focus: 'Reassess cadence efficiency metrics and adjust training zones based on updated results.' },
];

const faqs: [string, string][] = [
  ['What is an optimal cycling cadence?', 'Optimal cadence is the pedalling rate (rpm) at which your muscular and cardiovascular systems work together most efficiently for a given power output and riding style.'],
  ['Why does rider type matter?', 'Endurance riders favour smooth, sustainable cadences, climbers balance torque and cadence on gradients, while sprinters leverage higher cadences to maximise peak power. Rider type guides personalised recommendations.'],
  ['How accurate is this cadence calculation?', 'The calculator uses common power-cadence relationships derived from coaching literature. It provides a practical starting point. Fine-tune through field testing and personal feedback.'],
  ['Should I always ride at the calculated cadence?', 'No. Use the optimal cadence as a target for key workouts. Vary cadence across sessions to build versatility and accommodate terrain or tactical demands.'],
  ['Does cadence affect power output?', 'Yes. Too low a cadence increases muscular strain, while too high a cadence raises cardiovascular demand. Matching cadence to power output improves efficiency and performance.'],
  ['How do I measure current cadence?', 'Use a crank, pedal, or wheel-based cadence sensor connected to your bike computer or smart trainer. Many modern power meters also report cadence automatically.'],
  ['Can optimal cadence change over time?', 'Yes. Fitness gains, changes in muscle fibre recruitment, new bike fit, or training focus can shift cadence preferences. Reassess every 6–8 weeks.'],
  ['What if I ride multiple disciplines?', 'Select the rider type that reflects your primary goal (e.g., time trials vs. criteriums). You can run the calculator multiple times to compare cadence targets for different disciplines.'],
  ['Does bike fit influence cadence?', 'Absolutely. Saddle height, crank length, and cleat positioning affect pedal mechanics. Ensure professional bike fit to support efficient cadence.'],
  ['Are there risks to training at higher cadence?', 'Rapid cadence changes without conditioning can lead to neuromuscular fatigue. Progress gradually, maintain smooth pedal strokes, and monitor for hip or knee discomfort.'],
];

const understandingInputs = [
  { label: 'Power Output (watts)', description: 'Current average power for the effort or interval you wish to optimise. Use recent ride data for accuracy.' },
  { label: 'Current Cadence (rpm)', description: 'Optional. Your present cadence for the selected power. Helps estimate efficiency gap to the calculated optimal cadence.' },
  { label: 'Rider Type', description: 'Primary cycling focus: endurance (steady state), sprinter (peak power bursts), or climber (sustained torque on gradients).' },
];

const calculateCadence = (values: FormValues) => {
  if (!values.power) return null;

  let baseCadence: number;
  switch (values.riderType) {
    case 'sprinter':
      baseCadence = 95;
      break;
    case 'climber':
      baseCadence = 90;
      break;
    default:
      baseCadence = 92;
  }

  const powerAdjustment = values.riderType === 'sprinter' ? values.power / 9 : values.riderType === 'climber' ? values.power / 14 : values.power / 12;
  let optimalCadence = baseCadence + powerAdjustment;
  optimalCadence = Math.max(70, Math.min(120, optimalCadence));

  let efficiency = 92;
  if (values.currentCadence) {
    const cadenceDiff = Math.abs(values.currentCadence - optimalCadence);
    efficiency = Math.max(0, 100 - cadenceDiff * 2);
  }

  let powerCategory: string;
  if (values.power < 200) powerCategory = 'Endurance Power';
  else if (values.power < 300) powerCategory = 'Tempo Power';
  else if (values.power < 400) powerCategory = 'Threshold Power';
  else powerCategory = 'High-Intensity Power';

  return { optimalCadence, efficiency, powerCategory };
};

const interpret = (optimalCadence: number, efficiency: number) => {
  if (efficiency >= 90) return 'Your current cadence closely aligns with the calculated optimal range—maintain consistency and refine pedal smoothness.';
  if (efficiency >= 75) return 'Cadence is slightly off optimal. Small adjustments and cadence drills will improve efficiency and reduce fatigue.';
  return 'Cadence differs significantly from optimal. Focus on cadence-focused workouts and gear selection to improve alignment and reduce muscular strain.';
};

const recommendations = (optimalCadence: number, efficiency: number) => {
  const recs = [
    `Target ${optimalCadence.toFixed(0)} rpm during steady-state efforts at similar power.`,
    'Include cadence pyramids (80 → 90 → 100 rpm) to build versatility across ranges.',
    'Monitor torque effectiveness and pedal smoothness metrics if available on your head unit.',
  ];

  if (efficiency < 80) {
    recs.push('Perform weekly high-cadence spins (1–2 sessions) to retrain neuromuscular coordination.');
  }

  if (optimalCadence < 85) {
    recs.push('Focus on strength endurance (low cadence, high torque intervals) sparingly to avoid overloading knees.');
  } else if (optimalCadence > 100) {
    recs.push('Strengthen core and hip stabilisers to support higher rpm without bouncing in the saddle.');
  }

  return recs;
};

const warningSigns = () => [
  'Cadence targets assume a properly fitted bike; address discomfort or pain with a professional bike fit.',
  'Avoid abrupt cadence changes in big gears—gradually adapt to higher rpm to protect joints.',
  'This tool complements, but does not replace, structured coaching advice tailored to your physiology.',
];

export default function CyclingCadenceOptimizerCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: undefined,
      currentCadence: undefined,
      riderType: 'endurance',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateCadence(values);
    if (!calc) {
      setResult(null);
      return;
    }

    setResult({
      optimalCadence: calc.optimalCadence,
      efficiency: calc.efficiency,
      powerCategory: calc.powerCategory,
      interpretation: interpret(calc.optimalCadence, calc.efficiency),
      recommendations: recommendations(calc.optimalCadence, calc.efficiency),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bike className="h-5 w-5" /> Cycling Cadence Optimizer</CardTitle>
          <CardDescription>Identify cadence targets for your power output and riding discipline to enhance efficiency.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="power" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Power Output (watts)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 260" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentCadence" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Current Cadence (rpm, optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="riderType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Zap className="h-4 w-4" /> Rider Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rider type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="endurance">Endurance</SelectItem>
                        <SelectItem value="sprinter">Sprinter</SelectItem>
                        <SelectItem value="climber">Climber</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Optimal Cadence</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Cadence Efficiency Summary</CardTitle></div>
              <CardDescription>Recommended cadence targeting for your input power</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Optimal Cadence</h4>
                  <p className="text-2xl font-bold text-primary">{result.optimalCadence.toFixed(0)} rpm</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Efficiency Rating</h4>
                  <p className="text-2xl font-bold text-primary">{result.efficiency.toFixed(1)}%</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Power Category</h4>
                  <p className="text-lg font-bold text-primary">{result.powerCategory}</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Cadence Optimisation Plan</CardTitle></CardHeader>
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
          <CardDescription>Gather accurate ride data for precise cadence guidance</CardDescription>
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
          <CardDescription>Expand your cycling performance toolkit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/critical-power-calculator" className="text-primary hover:underline">Critical Power Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Determine sustainable power to pair with cadence targets.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/power-to-heart-rate-efficiency-calculator" className="text-primary hover:underline">Power-to-Heart Rate Efficiency</Link></h4>
              <p className="text-sm text-muted-foreground">Monitor aerobic efficiency and decoupling on long rides.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/oxygen-debt-epoc-calculator" className="text-primary hover:underline">Oxygen Debt (EPOC)</Link></h4>
              <p className="text-sm text-muted-foreground">Assess recovery needs after high-intensity cadence work.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/anaerobic-capacity-calculator" className="text-primary hover:underline">Anaerobic Capacity Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Evaluate sprint reserves to complement cadence strategy.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Mastering Cycling Cadence</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Cadence influences how force and cardiovascular effort are balanced on the bike. By aligning cadence with power output, riders reduce muscular fatigue, improve endurance, and respond more effectively during climbs or sprints. Combine cadence drills, strength work, and consistent testing to refine your optimal rpm. Track cadence trends with power data, adjust for terrain, and maintain smooth pedalling mechanics to translate improvements into race-day performance.</p>
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