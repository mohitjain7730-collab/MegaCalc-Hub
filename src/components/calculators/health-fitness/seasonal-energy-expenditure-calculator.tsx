'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Zap, Thermometer, Sun, CloudSnow, Calendar } from 'lucide-react';

const formSchema = z.object({
  winterTemp: z.number().min(-30).max(30).optional(),
  summerTemp: z.number().min(10).max(50).optional(),
  outdoorMinutes: z.number().min(0).max(300).optional(),
  clothingClo: z.number().min(0).max(4).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  winterKcal: number;
  summerKcal: number;
  seasonalDifference: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track outdoor exposure time, wardrobe, and perceived exertion during typical weeks' },
  { week: 2, focus: 'Adjust layering strategies to balance comfort with thermogenic demand' },
  { week: 3, focus: 'Coordinate calorie intake with seasonal training volume and appetite cues' },
  { week: 4, focus: 'Introduce weather-specific cross-training (e.g., indoor rowing in winter, hikes in summer)' },
  { week: 5, focus: 'Review sleep and stress—seasonal shifts can affect recovery and cravings' },
  { week: 6, focus: 'Reassess clothing clo values as temperatures change (heavier coats in deep winter, lighter gear in spring)' },
  { week: 7, focus: 'Evaluate weight and body composition trends; adjust calories if seasonal shifts create plateaus' },
  { week: 8, focus: 'Plan upcoming season’s routine—update outdoor minutes or layering to match new conditions' },
];

const faqs: [string, string][] = [
  ['Why does temperature affect energy expenditure?', 'Cold weather increases thermogenesis to maintain core temperature, while hot weather can elevate sweat and cardiovascular demand. Both alter daily calorie burn.'],
  ['What is a clo value in this context?', 'Clo quantifies clothing insulation. High clo values reduce heat loss, meaning less extra energy is required to stay warm.' ],
  ['Does summer heat increase calories burned?', 'High heat can raise heart rate and energy use for cooling, but many people reduce activity intensity. This calculator focuses mainly on cold-driven thermogenesis.' ],
  ['How should I adjust calories seasonally?', 'Monitor weight trends. If winter adds extra calories via thermogenesis, you may maintain or lose weight slightly faster. Summer may require closer attention to intake and hydration.' ],
  ['What if I spend little time outdoors?', 'Energy differences will be small. Indoor temperature control keeps metabolism near thermoneutral, so seasonal adjustments may be minimal.' ],
  ['Can this help endurance athletes?', 'Yes. Planning clothing, exposure, and fueling by season aids performance and body composition management.' ],
  ['How accurate is the estimate?', 'It uses heuristic formulas. Individual responses vary with body composition, acclimation, wind chill, and activity. Use it as a planning tool, not a lab measurement.' ],
  ['Should I change training because of thermogenesis?', 'Focus on recovery and performance. Seasonal thermogenesis is a bonus but should not drive training decisions alone.' ],
  ['Does humidity matter?', 'Humidity influences heat stress but is not included in this simple model. Monitor hydration and perceived exertion in humid summers.' ],
  ['How do I find my clothing’s clo value?', 'Use online tables—light summer clothes ~0.3 clo, business attire ~1.0 clo, heavy winter gear 2.0+ clo. Estimate based on layers and fabric thickness.' ],
];

const understandingInputs = [
  { label: 'Avg Winter Temperature (°C)', description: 'Typical outdoor temperature during the colder season when you spend time outside.' },
  { label: 'Avg Summer Temperature (°C)', description: 'Typical outdoor temperature in warmer months for comparison.' },
  { label: 'Outdoor Time (minutes/day)', description: 'Average daily minutes spent outside in the given temperatures.' },
  { label: 'Clothing (clo)', description: 'Estimated insulation level of clothing worn outdoors; higher values reduce heat loss.' },
];

const calculateThermogenesis = (temp: number, minutes: number, clo: number) => {
  const tempDelta = Math.max(0, 22 - temp);
  const cloFactor = Math.max(0.2, 1 - clo * 0.2);
  const kcalPerHour = tempDelta * 2.5 * cloFactor;
  return (kcalPerHour * minutes) / 60;
};

const interpret = (winter: number, summer: number) => {
  const difference = winter - summer;
  if (difference > 80) return 'Winter conditions substantially raise energy expenditure—review calorie targets and layering strategies.';
  if (difference > 30) return 'Expect a modest boost in winter thermogenesis; monitor weight trends as seasons change.';
  return 'Seasonal impact is minimal—standard calorie planning should suffice.';
};

const recommendations = (difference: number) => [
  difference > 30
    ? 'Plan slightly higher calorie intake or recovery foods in harsh winter weeks to support training'
    : 'Maintain consistent nutrition while adjusting for activity volume rather than ambient temperature',
  'Use layered clothing to fine-tune comfort without eliminating beneficial thermogenesis',
  'Stay hydrated and prioritize sleep—seasonal fatigue can influence appetite and energy use',
];

const warningSigns = () => [
  'Extremes of heat or cold can cause dizziness, frostbite, or heat exhaustion—prioritize safety over calorie burn',
  'Chronic fatigue or mood changes across seasons may signal insufficient calories or vitamin D—consult a professional',
  'Rapid weight changes outside planned targets warrant a review of nutrition and health markers',
];

export default function SeasonalEnergyExpenditureCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      winterTemp: undefined,
      summerTemp: undefined,
      outdoorMinutes: undefined,
      clothingClo: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { winterTemp, summerTemp, outdoorMinutes, clothingClo } = values;
    if (winterTemp == null || summerTemp == null || outdoorMinutes == null || clothingClo == null) {
      setResult(null);
      return;
    }

    const winterKcal = Math.round(calculateThermogenesis(winterTemp, outdoorMinutes, clothingClo));
    const summerKcal = Math.round(calculateThermogenesis(summerTemp, outdoorMinutes, clothingClo));
    const difference = winterKcal - summerKcal;

    setResult({
      status: 'Calculated',
      interpretation: interpret(winterKcal, summerKcal),
      recommendations: recommendations(difference),
      warningSigns: warningSigns(),
      plan: plan(),
      winterKcal,
      summerKcal,
      seasonalDifference: difference,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CloudSnow className="h-5 w-5" /> Seasonal Energy Expenditure</CardTitle>
          <CardDescription>Compare cold and warm weather calorie burn during daily outdoor time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="winterTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> Avg Winter Temp (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 5"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="summerTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Sun className="h-4 w-4" /> Avg Summer Temp (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 28"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="outdoorMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Outdoor Time (min/day)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 60"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clothingClo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> Clothing (clo)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1.0"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Seasonal Energy</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Seasonal Summary</CardTitle>
              </div>
              <CardDescription>Difference in estimated thermogenic calories per day outdoors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Winter Extra Calories</h4>
                  <p className="text-2xl font-bold text-primary">{result.winterKcal} kcal/day</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Summer Extra Calories</h4>
                  <p className="text-2xl font-bold text-primary">{result.summerKcal} kcal/day</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Seasonal Difference</h4>
                  <p className="text-2xl font-bold text-primary">{result.seasonalDifference} kcal/day</p>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Seasonal Planning Roadmap</CardTitle>
            </CardHeader>
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
                    {result.plan.map((step) => (
                      <tr key={step.week} className="border-b">
                        <td className="p-2">{step.week}</td>
                        <td className="p-2">{step.focus}</td>
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
          <CardDescription>Gather accurate seasonal data before estimating</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {understandingInputs.map((item) => (
              <li key={item.label}>
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
          <CardDescription>Coordinate seasonal planning with other tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/caloric-cost-of-cold-exposure-calculator" className="text-primary hover:underline">Cold Exposure Cost</Link></h4><p className="text-sm text-muted-foreground">Estimate individual sessions in colder months.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/adaptive-thermogenesis-calculator" className="text-primary hover:underline">Adaptive Thermogenesis</Link></h4><p className="text-sm text-muted-foreground">Track metabolic shifts during weight changes.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Set baseline targets before seasonal adjustments.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs</Link></h4><p className="text-sm text-muted-foreground">Heat and cold both influence fluid requirements.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Seasonal Energy Planning</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Ambient temperature, clothing choices, and daily habits shape energy expenditure across the year. Use seasonal data to adjust calories, training emphasis, and recovery practices. Stay flexible—weather swings and lifestyle changes can alter energy needs quickly.</p>
          <p>Combine this calculator with real-world tracking—weight trends, performance, sleep—to refine strategies every season. Safety, comfort, and consistency outrank chasing calorie differences.</p>
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


