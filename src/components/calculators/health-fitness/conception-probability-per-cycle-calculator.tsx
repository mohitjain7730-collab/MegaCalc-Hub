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
import { Zap, HeartPulse, Calendar, Baby, Info, Activity, Clock } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(45).optional(),
  cycleRegularity: z.enum(['regular','irregular']).optional(),
  cycleLength: z.number().min(21).max(35).optional(),
  timingAccuracy: z.enum(['optimal','good','fair','poor']).optional(),
  previousPregnancies: z.number().min(0).max(10).optional(),
  tryingMonths: z.number().min(0).max(60).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConceptionProbabilityPerCycleCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, cycleRegularity: undefined, cycleLength: undefined, timingAccuracy: undefined, previousPregnancies: undefined, tryingMonths: undefined } });

  const interpret = (v: FormValues) => {
    const msgs: string[] = [];
    if (v.age != null) {
      if (v.age < 25) msgs.push('Peak fertility years; higher conception probability per cycle.');
      else if (v.age < 30) msgs.push('Good fertility; conception probability remains relatively high.');
      else if (v.age < 35) msgs.push('Fertility begins to decline gradually; still good chances of conception.');
      else if (v.age < 40) msgs.push('Fertility decline becomes more pronounced; conception may take longer.');
      else msgs.push('Significant fertility decline; consider consulting a fertility specialist.');
    }
    if (v.cycleRegularity === 'regular' && v.timingAccuracy === 'optimal') {
      msgs.push('Regular cycles with optimal timing increase conception probability.');
    } else if (v.cycleRegularity === 'irregular') {
      msgs.push('Irregular cycles may reduce conception probability; tracking ovulation can help.');
    }
    if (v.tryingMonths != null && v.tryingMonths >= 12) {
      msgs.push('After 12 months of trying, consider consulting a fertility specialist for evaluation.');
    }
    return msgs.join(' ') || 'Enter your information to estimate conception probability per cycle.';
  };

  const recommendations = (v: FormValues) => [
    'Track ovulation using basal body temperature, ovulation predictor kits, or cervical mucus changes',
    'Time intercourse during the fertile window, typically 5 days before ovulation through ovulation day',
    'Maintain a healthy lifestyle with balanced nutrition, regular exercise, and stress management',
  ];

  const warnings = (v: FormValues) => [
    'If under 35 and trying for 12+ months without success, consult a fertility specialist',
    'If 35 or older and trying for 6+ months, consider earlier fertility evaluation',
    'Irregular cycles, known fertility issues, or previous miscarriages warrant medical consultation',
  ];

  const plan = () => ([
    { week: 1, focus: 'Begin tracking menstrual cycle and ovulation signs' },
    { week: 2, focus: 'Identify fertile window and optimal timing for intercourse' },
    { week: 3, focus: 'Continue tracking and maintain healthy lifestyle habits' },
    { week: 4, focus: 'Monitor cycle patterns and adjust tracking methods as needed' },
    { week: 5, focus: 'Reassess timing accuracy and cycle regularity' },
    { week: 6, focus: 'Continue optimizing fertility through lifestyle and timing' },
    { week: 7, focus: 'Consider additional fertility support if needed' },
    { week: 8, focus: 'Evaluate progress and consider medical consultation if concerns arise' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Estimated', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Baby className="h-5 w-5" /> Conception Probability (per cycle)</CardTitle>
          <CardDescription>Estimate probability of conception per menstrual cycle based on age and factors</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="cycleRegularity" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4" /> Cycle Regularity</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select regularity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="cycleLength" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Cycle Length (days)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="timingAccuracy" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Timing Accuracy</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select accuracy" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optimal">Optimal</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="previousPregnancies" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Baby className="h-4 w-4" /> Previous Pregnancies</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tryingMonths" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Months Trying</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Estimate Conception Probability</Button>
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
                <CardTitle>Conception Probability Evaluation</CardTitle>
              </div>
              <CardDescription>Estimated probability of conception per menstrual cycle</CardDescription>
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
          <CardDescription>Pregnancy & fertility tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/ivf-success-probability-calculator" className="text-primary hover:underline">IVF Success Probability</Link></h4><p className="text-sm text-muted-foreground">Estimate IVF success rates.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/ovulation-calculator" className="text-primary hover:underline">Ovulation Calculator</Link></h4><p className="text-sm text-muted-foreground">Track ovulation cycles.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/pregnancy-weight-gain-calculator" className="text-primary hover:underline">Pregnancy Weight Gain</Link></h4><p className="text-sm text-muted-foreground">Track recommended weight gain.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/menstrual-cycle-phase-tracker-calculator" className="text-primary hover:underline">Menstrual Cycle Tracker</Link></h4><p className="text-sm text-muted-foreground">Monitor cycle phases.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Conception Probability</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Conception probability per menstrual cycle varies significantly based on multiple factors including age, cycle regularity, timing of intercourse, and overall reproductive health. Understanding these factors can help optimize your chances of conception and guide when to seek fertility support.</p>
          <p>For healthy couples under 35, the probability of conception per cycle is typically around 20-25% with optimal timing. This probability decreases with age, dropping to approximately 10-15% by age 35 and further declining after 40. Regular cycles and accurate timing of intercourse during the fertile window significantly improve conception probability.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What is the probability of conception per cycle?', 'For healthy couples under 35, conception probability per cycle is typically 20-25% with optimal timing. This probability decreases with age: approximately 15-20% at age 35, 10% at age 40, and 5% or less after age 42. Factors such as cycle regularity, timing accuracy, overall health, and previous pregnancy history also influence individual probabilities. Most couples conceive within 6-12 months of trying.'],
            ['How does age affect conception probability?', 'Age significantly impacts fertility and conception probability. Peak fertility occurs in the early to mid-20s, with probabilities around 25% per cycle. Fertility begins gradual decline around age 30, becomes more pronounced after 35, and declines significantly after 40. By age 45, natural conception becomes very rare. Age-related decline is due to decreased egg quantity and quality, as well as increased chromosomal abnormalities.'],
            ['What is the fertile window and when should I try to conceive?', 'The fertile window includes the 5 days before ovulation and the day of ovulation itself, totaling about 6 days per cycle. The highest probability of conception occurs with intercourse 1-2 days before ovulation. Sperm can survive up to 5 days in the female reproductive tract, while eggs are viable for about 12-24 hours after ovulation. Tracking ovulation using methods like basal body temperature, ovulation predictor kits, or cervical mucus changes helps identify this window.'],
            ['How do irregular cycles affect conception probability?', 'Irregular cycles can reduce conception probability by making it difficult to predict ovulation and time intercourse optimally. Cycles shorter than 21 days or longer than 35 days may indicate ovulatory dysfunction. However, many women with irregular cycles still ovulate and can conceive, though it may take longer. Tracking ovulation signs and working with a healthcare provider can help optimize timing despite irregular cycles.'],
            ['How long should we try before seeking fertility help?', 'Guidelines recommend consulting a fertility specialist after 12 months of trying if under 35, or after 6 months if 35 or older. However, seek evaluation earlier if you have known fertility issues, irregular cycles, previous miscarriages, endometriosis, PCOS, or other reproductive health concerns. Early evaluation can identify issues and improve outcomes.'],
            ['Can lifestyle factors affect conception probability?', 'Yes, lifestyle factors significantly impact fertility. Maintaining a healthy weight, eating a balanced diet, exercising regularly (but not excessively), managing stress, avoiding smoking and excessive alcohol, and getting adequate sleep all support fertility. Being underweight or overweight can reduce fertility, as can extreme exercise or high stress levels. Optimizing these factors can improve conception probability.'],
            ['Does timing of intercourse really matter?', 'Yes, timing is crucial for conception. The highest probability occurs with intercourse 1-2 days before ovulation. Having intercourse every 1-2 days during the fertile window maximizes chances. Daily intercourse doesn\'t significantly improve probability over every-other-day intercourse, and may reduce sperm count in some men. Focus on timing during the 6-day fertile window for best results.'],
            ['What if we\'ve been trying for months without success?', 'If you\'ve been trying for several months without success, first ensure you\'re timing intercourse optimally during the fertile window. Consider tracking ovulation more precisely, maintaining a healthy lifestyle, and reducing stress. If unsuccessful after 6-12 months (depending on age), consult a fertility specialist for evaluation. Many fertility issues are treatable, and early intervention improves outcomes.'],
            ['How does previous pregnancy history affect conception probability?', 'Previous successful pregnancies generally indicate good fertility potential and may slightly improve conception probability in future attempts. However, previous miscarriages, especially recurrent losses, may indicate underlying issues that warrant evaluation. Age at previous pregnancies also matters, as fertility declines with age regardless of prior pregnancy history.'],
            ['What are signs that we should see a fertility specialist?', 'Consider seeing a fertility specialist if: you\'ve been trying for 12+ months (under 35) or 6+ months (35+), you have irregular or absent periods, known fertility issues (PCOS, endometriosis, etc.), previous miscarriages (especially recurrent), age over 35 with concerns, or if you or your partner have known reproductive health issues. Early evaluation can identify and address issues, improving chances of successful conception.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
