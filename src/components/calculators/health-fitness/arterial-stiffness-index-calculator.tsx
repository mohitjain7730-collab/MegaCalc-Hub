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
import { Zap, Ruler, Activity, Gauge, Calendar } from 'lucide-react';

const formSchema = z.object({
  heightCm: z.number().min(120).max(220).optional(),
  transitTimeMs: z.number().min(20).max(300).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  stiffnessIndex: number;
  category: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track blood pressure, resting heart rate, and lifestyle factors for a baseline week' },
  { week: 2, focus: 'Add three 30-minute moderate aerobic sessions (brisk walking, cycling)' },
  { week: 3, focus: 'Introduce two resistance-training sessions focusing on major muscle groups' },
  { week: 4, focus: 'Prioritize sodium moderation and increase potassium-rich foods (leafy greens, legumes)' },
  { week: 5, focus: 'Integrate stress-management habits such as breathing drills or meditation' },
  { week: 6, focus: 'Schedule sleep for 7–9 hours nightly and limit late caffeine or alcohol' },
  { week: 7, focus: 'Review follow-up blood pressure readings and evaluate progress with your clinician' },
  { week: 8, focus: 'Adjust training and nutrition for long-term vascular health maintenance' },
];

const faqs: [string, string][] = [
  ['What is the arterial stiffness index?', 'The arterial stiffness index (SI) is an estimate of arterial compliance calculated from pulse transit time divided into body height. Higher values may indicate stiffer arteries and higher cardiovascular risk.'],
  ['How do I measure pulse transit time?', 'Pulse transit time is often captured by specialized blood pressure monitors, photoplethysmography devices, or research-grade wearables. It represents the delay between the pulse reaching peripheral sites.'],
  ['What SI value is considered normal?', 'Values between roughly 5–9 m/s are common in healthy adults, but ranges vary by age, blood pressure, and measurement technique. Use this calculator for educational insights only.'],
  ['Can I reduce arterial stiffness?', 'Yes. Lifestyle factors such as aerobic exercise, resistance training, blood pressure management, balanced nutrition, and stress reduction can improve vascular compliance over time.'],
  ['Does age affect the stiffness index?', 'Arterial stiffness tends to increase with age due to structural changes in vessel walls. Tracking trends and managing risk factors becomes more important as you age.'],
  ['How does blood pressure influence stiffness?', 'Chronic high blood pressure accelerates arterial stiffening by stressing vessel walls. Controlling blood pressure through diet, exercise, and medication reduces this effect.'],
  ['What role does sodium play?', 'High sodium intake can elevate blood pressure and indirectly raise arterial stiffness. Moderating sodium while increasing potassium-rich foods supports vascular health.'],
  ['Should I test SI at home?', 'Home measurements are only valid if you have calibrated equipment. Medical-grade assessments performed by healthcare professionals remain the gold standard.'],
  ['How often should I reassess?', 'Re-check every few months or as recommended by your clinician, especially when adjusting treatment plans or lifestyle interventions.'],
  ['Is SI a diagnostic tool?', 'No. SI is a screening metric. Elevated readings should prompt consultation with healthcare providers for comprehensive cardiovascular evaluation.'],
];

const understandingInputs = [
  { label: 'Height (cm)', description: 'Standing height is used with pulse transit time to estimate pulse wave velocity.' },
  { label: 'Pulse transit time ΔT (ms)', description: 'Delay between heart contraction and peripheral pulse arrival, measured in milliseconds.' },
];

const classify = (si: number) => {
  if (si < 5) return 'Lower stiffness';
  if (si <= 9) return 'Typical range';
  return 'Higher stiffness';
};

const interpret = (si: number) => {
  if (si < 5) return 'Your estimated stiffness index is below typical reference values. Maintain heart-healthy habits to preserve vascular compliance.';
  if (si <= 9) return 'Estimated stiffness aligns with common reference ranges. Continue monitoring blood pressure, exercise, and nutrition.';
  return 'Estimated stiffness is elevated. Discuss cardiovascular risk management with your healthcare professional and focus on lifestyle improvements.';
};

const recommendations = (si: number) => [
  'Accumulate 150–300 minutes of moderate aerobic activity plus 2 resistance sessions weekly',
  'Emphasize vegetables, fruits, omega-3 fats, and limit ultra-processed foods',
  si > 9
    ? 'Monitor blood pressure at home and coordinate with a clinician for individualized targets'
    : 'Maintain regular checkups to ensure blood pressure and lipid levels remain optimal',
];

const warningSigns = () => [
  'Chest pain, shortness of breath, or dizziness require immediate medical attention',
  'Do not adjust medications without consulting your healthcare provider',
  'Underlying conditions (diabetes, kidney disease) may accelerate arterial stiffening—seek professional guidance',
];

export default function ArterialStiffnessIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heightCm: undefined,
      transitTimeMs: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { heightCm, transitTimeMs } = values;
    if (heightCm == null || transitTimeMs == null) {
      setResult(null);
      return;
    }

    const heightM = heightCm / 100;
    const transitSeconds = transitTimeMs / 1000;
    const stiffnessIndex = heightM / transitSeconds;
    const category = classify(stiffnessIndex);

    setResult({
      status: 'Calculated',
      interpretation: interpret(stiffnessIndex),
      recommendations: recommendations(stiffnessIndex),
      warningSigns: warningSigns(),
      plan: plan(),
      stiffnessIndex: Math.round(stiffnessIndex * 10) / 10,
      category,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5" /> Arterial Stiffness Index</CardTitle>
          <CardDescription>Estimate pulse wave velocity surrogates using height and pulse transit time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="transitTimeMs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Pulse Transit Time ΔT (ms)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 80"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Stiffness Index</Button>
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
                <CardTitle>Stiffness Summary</CardTitle>
              </div>
              <CardDescription>Interpreting the calculated arterial stiffness index</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Stiffness Index</h4>
                  <p className="text-2xl font-bold text-primary">{result.stiffnessIndex} m/s</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Category</h4>
                  <p className="text-2xl font-bold text-primary">{result.category}</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Vascular Health Plan</CardTitle>
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
          <CardDescription>Review the measurements needed for this estimate</CardDescription>
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
          <CardDescription>Expand your cardiovascular health toolkit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/blood-pressure-risk-calculator" className="text-primary hover:underline">Blood Pressure Risk</Link></h4><p className="text-sm text-muted-foreground">Assess systolic/diastolic trends and relative risk.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cholesterol-risk-calculator" className="text-primary hover:underline">Cholesterol Risk</Link></h4><p className="text-sm text-muted-foreground">Track lipid panel indicators.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary hover:underline">Cardiovascular Disease Risk</Link></h4><p className="text-sm text-muted-foreground">Combine lifestyle and biometric markers.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs</Link></h4><p className="text-sm text-muted-foreground">Support vascular health with adequate fluids.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Arterial Stiffness</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Arterial stiffness reflects how compliant your vessels are when blood is pumped from the heart. Higher stiffness increases workload on the heart and relates to long-term cardiovascular risk. Manage blood pressure, improve cardiorespiratory fitness, reduce smoking and alcohol, and maintain a nutrient-rich diet to support healthier arteries.</p>
          <p>Always confirm findings with medical professionals—this calculator is educational and should complement, not replace, clinical assessments.</p>
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
