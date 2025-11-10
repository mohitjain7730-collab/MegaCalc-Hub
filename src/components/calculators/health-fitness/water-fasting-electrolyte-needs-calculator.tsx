'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Zap, Droplets, Scale, Calendar, Pill, Activity, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  weightKg: z.number().min(40).max(200).optional(),
  fastingDays: z.number().min(1).max(30).optional(),
  activityLevel: z.enum(['sedentary','light','moderate','active']).optional(),
  sweatRate: z.enum(['low','moderate','high']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaterFastingElectrolyteNeedsCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { weightKg: undefined, fastingDays: undefined, activityLevel: undefined, sweatRate: undefined } });

  const interpret = (v: FormValues) => {
    const msgs: string[] = [];
    if (v.weightKg != null && v.fastingDays != null) {
      if (v.fastingDays <= 3) msgs.push('Short-term fast; electrolyte needs are moderate.');
      else if (v.fastingDays <= 7) msgs.push('Medium-term fast; increased electrolyte supplementation recommended.');
      else msgs.push('Extended fast; careful electrolyte management is essential to prevent imbalances.');
    }
    if (v.activityLevel === 'active' || v.sweatRate === 'high') {
      msgs.push('Higher activity or sweat rate increases electrolyte losses; adjust supplementation accordingly.');
    }
    return msgs.join(' ') || 'Enter your information to estimate electrolyte needs during water fasting.';
  };

  const recommendations = (v: FormValues) => [
    'Supplement with sodium (2-5g daily), potassium (1-3g daily), and magnesium (300-600mg daily) during extended fasts',
    'Monitor for symptoms of electrolyte imbalance including dizziness, fatigue, muscle cramps, or heart palpitations',
    'Consult with a healthcare provider before beginning extended water fasts, especially if you have medical conditions',
  ];

  const warnings = (v: FormValues) => [
    'Water fasting can cause serious electrolyte imbalances; never attempt extended fasts without medical supervision',
    'Stop fasting immediately if you experience severe dizziness, irregular heartbeat, or other concerning symptoms',
    'Electrolyte supplementation is not a substitute for proper medical monitoring during extended fasts',
  ];

  const plan = () => ([
    { week: 1, focus: 'Consult healthcare provider before beginning any extended fast' },
    { week: 2, focus: 'Begin with short fasts (24-48 hours) to assess tolerance' },
    { week: 3, focus: 'Establish electrolyte supplementation routine based on individual needs' },
    { week: 4, focus: 'Monitor symptoms and adjust electrolyte intake as needed' },
    { week: 5, focus: 'Continue careful monitoring during fasting periods' },
    { week: 6, focus: 'Reassess tolerance and adjust fasting duration if appropriate' },
    { week: 7, focus: 'Maintain electrolyte balance throughout fasting periods' },
    { week: 8, focus: 'Plan refeeding protocol with healthcare provider for extended fasts' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Estimated', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" /> Water Fasting Electrolyte Needs</CardTitle>
          <CardDescription>Estimate electrolyte supplementation needs during water fasting</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="weightKg" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="fastingDays" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Fasting Duration (days)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="activityLevel" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Activity Level</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sweatRate" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Sweat Rate</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select sweat rate" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate Electrolyte Needs</Button>
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
                <CardTitle>Electrolyte Needs Evaluation</CardTitle>
              </div>
              <CardDescription>Estimated electrolyte supplementation needs during water fasting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{result.interpretation}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Status</p><p className="text-xl font-semibold">{result.status}</p></div>
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Note</p><p className="text-sm">Always follow clinician guidance</p></div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{result.warningSigns.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{result.plan.map(p=> (<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Health & nutrition tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs</Link></h4><p className="text-sm text-muted-foreground">Calculate daily hydration requirements.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/electrolyte-replacement-calculator" className="text-primary hover:underline">Electrolyte Replacement</Link></h4><p className="text-sm text-muted-foreground">Estimate electrolyte replacement needs.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary hover:underline">Intermittent Fasting</Link></h4><p className="text-sm text-muted-foreground">Plan intermittent fasting schedules.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Calculate daily calorie requirements.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Water Fasting Electrolyte Needs</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Water fasting requires careful electrolyte management to prevent imbalances that can lead to serious health complications. During fasting, the body loses electrolytes through urine, sweat, and other processes, and without food intake, these must be supplemented to maintain proper bodily functions.</p>
          <p>Key electrolytes include sodium, potassium, and magnesium. Sodium helps maintain fluid balance and nerve function, potassium supports muscle and heart function, and magnesium is essential for numerous biochemical reactions. The required amounts vary based on fasting duration, body weight, activity level, and individual factors.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['Why are electrolytes important during water fasting?', 'Electrolytes are essential minerals that maintain fluid balance, nerve function, muscle contractions, and heart rhythm. During water fasting, the body continues to lose electrolytes through urine and sweat, but without food intake, these aren\'t replaced. Insufficient electrolytes can cause dizziness, fatigue, muscle cramps, irregular heartbeat, and in severe cases, life-threatening complications. Proper electrolyte supplementation is crucial for safe fasting.'],
            ['How much sodium do I need during water fasting?', 'Sodium needs during water fasting typically range from 2-5 grams daily, though individual requirements vary. Sodium helps maintain blood pressure and fluid balance. Signs of low sodium include dizziness, fatigue, headache, and nausea. You can supplement with sea salt or electrolyte solutions. However, individual needs vary based on activity level, sweat rate, and medical conditions. Consult with a healthcare provider for personalized recommendations.'],
            ['What about potassium and magnesium during fasting?', 'Potassium requirements during water fasting are typically 1-3 grams daily, while magnesium needs range from 300-600mg daily. Potassium supports muscle and heart function, while magnesium is involved in over 300 biochemical reactions. Low levels can cause muscle cramps, weakness, and heart palpitations. Supplementation should be done carefully, as excessive intake can also be dangerous. Medical supervision is recommended for extended fasts.'],
            ['Can I get electrolytes from water alone?', 'No, plain water does not contain significant amounts of electrolytes. While trace minerals may be present in some water sources, they\'re insufficient to meet fasting electrolyte needs. During extended water fasts, you must supplement electrolytes through salt, electrolyte powders, or tablets. Relying solely on water can lead to dangerous electrolyte imbalances.'],
            ['What are the signs of electrolyte imbalance during fasting?', 'Signs of electrolyte imbalance include dizziness, lightheadedness, fatigue, muscle cramps or weakness, heart palpitations, irregular heartbeat, headache, nausea, confusion, and in severe cases, seizures or cardiac arrhythmias. If you experience any of these symptoms during fasting, stop immediately and seek medical attention. Never ignore these warning signs.'],
            ['How do I supplement electrolytes during water fasting?', 'Electrolyte supplementation can be done through: adding sea salt or Himalayan salt to water (for sodium), using electrolyte powders or tablets that contain balanced amounts of sodium, potassium, and magnesium, or consuming electrolyte-rich solutions. Start with lower amounts and adjust based on symptoms and tolerance. Always follow product instructions and consult with a healthcare provider for personalized guidance.'],
            ['Is it safe to water fast without electrolyte supplementation?', 'Short fasts (24-48 hours) may be tolerable without supplementation for healthy individuals, though some may still benefit from electrolytes. Extended fasts (3+ days) without electrolyte supplementation are dangerous and can lead to serious complications. Even during shorter fasts, electrolyte supplementation can improve symptoms and safety. Medical supervision is recommended for any extended fast.'],
            ['How does activity level affect electrolyte needs during fasting?', 'Higher activity levels increase electrolyte losses through sweat and increased metabolism. Active individuals or those exercising during fasts need more electrolytes than sedentary individuals. Sweat contains significant amounts of sodium, and physical activity increases potassium and magnesium losses. Adjust electrolyte intake based on activity level, and consider reducing exercise intensity during extended fasts.'],
            ['What should I do if I experience electrolyte imbalance symptoms?', 'If you experience symptoms of electrolyte imbalance, stop fasting immediately and: consume electrolyte-rich fluids or supplements, rest and avoid physical activity, monitor symptoms closely, and seek medical attention if symptoms are severe or persist. Do not resume fasting until symptoms resolve and you\'ve consulted with a healthcare provider. Your safety is paramount.'],
            ['Can I take too many electrolytes during fasting?', 'Yes, excessive electrolyte intake can be dangerous. Hypernatremia (too much sodium) can cause high blood pressure and fluid retention. Hyperkalemia (too much potassium) can cause irregular heartbeat and muscle weakness. Hypermagnesemia (too much magnesium) can cause diarrhea and cardiac issues. Follow recommended dosages, monitor symptoms, and consult with a healthcare provider to avoid over-supplementation. Balance is key to safe fasting.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
