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
import { Zap, Activity, Gauge, Thermometer, Calendar } from 'lucide-react';

const formSchema = z.object({
  sex: z.enum(['male', 'female']).optional(),
  weightKg: z.number().min(30).max(200).optional(),
  heightCm: z.number().min(120).max(220).optional(),
  age: z.number().min(14).max(90).optional(),
  tsh: z.number().min(0.01).max(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  baseBmr: number;
  adjustedBmr: number;
  adjustmentPercent: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Collect 7 days of calorie intake, weight, energy, and step counts' },
  { week: 2, focus: 'Review thyroid labs with a clinician—TSH plus Free T4/T3 and antibodies when indicated' },
  { week: 3, focus: 'Align calories with goals (deficit, maintenance, or surplus) using the adjusted BMR' },
  { week: 4, focus: 'Prioritize protein (1.6–2.2 g/kg) and micronutrients that support thyroid health' },
  { week: 5, focus: 'Assess sleep, stress, and training volume—overtraining can skew thyroid markers' },
  { week: 6, focus: 'Schedule follow-up labs if symptoms persist or treatment begins' },
  { week: 7, focus: 'Adjust meal timing and carbohydrate distribution to support energy and adherence' },
  { week: 8, focus: 'Compare trends in weight, energy, and labs; recalibrate calorie targets as needed' },
];

const faqs: [string, string][] = [
  ['What is TSH?', 'Thyroid-stimulating hormone (TSH) is produced by the pituitary gland and signals the thyroid to release thyroid hormones (T3/T4). Elevated TSH can indicate hypothyroidism; low TSH may suggest hyperthyroidism.'],
  ['How accurate is the adjusted BMR?', 'The calculator uses the Mifflin-St Jeor equation plus a simple TSH-based modifier. It provides an estimate, not a diagnosis. Always monitor real-world weight trends and consult medical professionals.'],
  ['What is basal metabolic rate (BMR)?', 'BMR is the calories your body needs at rest for basic functions such as breathing, circulation, and cell repair. Activity, stress, and digestion add to daily energy needs.'],
  ['Does thyroid function affect weight loss?', 'Thyroid hormones regulate metabolism. Hypothyroidism can slightly reduce energy expenditure and slow weight loss; hyperthyroidism can increase it. Proper diagnosis and treatment help normalize metabolism.'],
  ['Should I change calories when TSH is high?', 'A high TSH suggests reduced metabolism; consider a smaller deficit until labs improve. Work with your doctor on treatment and adjust calories based on weight trends.'],
  ['What lifestyle factors support thyroid health?', 'Adequate sleep, stress management, balanced macro intake, micronutrients (iodine, selenium, zinc), and avoiding severe calorie restriction support thyroid function.'],
  ['Can overshooting calories harm thyroid function?', 'Chronic excessive deficits or overtraining may downregulate thyroid hormones. Periodic refeeds or maintenance phases help maintain hormonal balance.'],
  ['How often should I retest thyroid labs?', 'Generally every 6–12 weeks when adjusting medication or if symptoms change. Follow your healthcare provider’s guidance.'],
  ['Is this calculator for people on medication?', 'Yes, but medication dosage strongly influences results. Use the calculator to track trends, not to replace medical advice.'],
  ['What if my TSH is outside the reference range?', 'Consult your physician for a comprehensive thyroid panel. The calculator’s adjustment is heuristic and does not replace professional diagnosis or treatment.'],
];

const understandingInputs = [
  { label: 'Sex', description: 'Biological sex used in the Mifflin-St Jeor equation to estimate baseline BMR.' },
  { label: 'Weight (kg)', description: 'Current body weight in kilograms. Use recent measurements for accuracy.' },
  { label: 'Height (cm)', description: 'Current body height in centimeters.' },
  { label: 'Age (years)', description: 'Age influences the BMR estimate because metabolism slows over time.' },
  { label: 'TSH (mIU/L)', description: 'Thyroid-stimulating hormone from a lab test. The calculator uses this to apply a small upward or downward adjustment.' },
];

const mifflin = (sex: 'male' | 'female', weight: number, height: number, age: number) =>
  sex === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

const thyroidFactor = (tsh: number) => {
  if (tsh < 0.3) return 1.05;
  if (tsh <= 4.5) return 1.0;
  if (tsh <= 10) return 0.95;
  return 0.9;
};

const interpret = (factor: number) => {
  if (factor > 1.02) return 'Estimated metabolic rate is slightly elevated—discuss with your provider if other hyperthyroid symptoms are present.';
  if (factor < 0.98) return 'Estimated metabolic rate is reduced, which may align with hypothyroid patterns. Monitor symptoms and consult a clinician.';
  return 'Basal energy aligns with expected values for your profile.';
};

const recommendations = (factor: number) => [
  'Track calorie intake and weight trends for several weeks to validate the estimate',
  factor < 0.98
    ? 'Consider smaller calorie deficits and prioritize strength training until thyroid markers normalize'
    : 'Maintain adequate carbohydrate intake and recovery to support thyroid hormone conversion',
  'Discuss thyroid labs with a healthcare provider for accurate diagnosis and treatment',
];

const warningSigns = () => [
  'Unexplained weight change, fatigue, or temperature intolerance warrants medical evaluation',
  'Do not self-adjust thyroid medication based on calculator output',
  'Severe calorie restriction can further downregulate thyroid hormones—aim for moderate deficits',
];

export default function ThyroidFunctionBasalEnergyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: undefined,
      weightKg: undefined,
      heightCm: undefined,
      age: undefined,
      tsh: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { sex, weightKg, heightCm, age, tsh } = values;
    if (sex == null || weightKg == null || heightCm == null || age == null || tsh == null) {
      setResult(null);
      return;
    }

    const baseBmr = mifflin(sex, weightKg, heightCm, age);
    const factor = thyroidFactor(tsh);
    const adjustedBmr = baseBmr * factor;

    setResult({
      status: 'Calculated',
      interpretation: interpret(factor),
      recommendations: recommendations(factor),
      warningSigns: warningSigns(),
      plan: plan(),
      baseBmr: Math.round(baseBmr),
      adjustedBmr: Math.round(adjustedBmr),
      adjustmentPercent: Math.round((factor - 1) * 1000) / 10,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Thermometer className="h-5 w-5" /> Thyroid Function Basal Energy Estimate</CardTitle>
          <CardDescription>Use TSH to apply a small adjustment to your baseline BMR.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Sex</FormLabel>
                      <FormControl>
                        <select
                          className="border rounded-md h-10 px-3 w-full bg-background"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : (e.target.value as 'male' | 'female'))}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 70"
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
                  name="heightCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 175"
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
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 35"
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
                  name="tsh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> TSH (mIU/L)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 2.1"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Basal Energy</Button>
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
                <CardTitle>BMR Summary</CardTitle>
              </div>
              <CardDescription>Mifflin-St Jeor estimate with a thyroid-informed adjustment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Baseline BMR</h4>
                  <p className="text-2xl font-bold text-primary">{result.baseBmr} kcal/day</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Adjusted BMR</h4>
                  <p className="text-2xl font-bold text-primary">{result.adjustedBmr} kcal/day</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Adjustment</h4>
                  <p className="text-2xl font-bold text-primary">{result.adjustmentPercent}%</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Thyroid & Energy Plan</CardTitle>
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
          <CardDescription>Clarify what each value represents before estimating</CardDescription>
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
          <CardDescription>Support metabolic planning with additional tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/resting-metabolic-rate-calculator" className="text-primary hover:underline">Resting Metabolic Rate</Link></h4><p className="text-sm text-muted-foreground">Compare BMR formulas to cross-check estimates.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Translate BMR into total daily energy requirements.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs</Link></h4><p className="text-sm text-muted-foreground">Hydration supports hormone production and recovery.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/adaptive-thermogenesis-calculator" className="text-primary hover:underline">Adaptive Thermogenesis</Link></h4><p className="text-sm text-muted-foreground">Assess metabolic adaptations during dieting phases.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Thyroid & Basal Energy</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Thyroid hormones influence basal metabolic rate by regulating cellular energy production. Combine lab data, calorie tracking, and body composition trends to fine-tune nutrition. This calculator offers a starting point—calibrate with real-world results and professional medical guidance.</p>
          <p>Support metabolic health through adequate sleep, stress management, progressive strength training, and nutrient-dense meals. Reassess regularly as labs, goals, or body composition change.</p>
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


