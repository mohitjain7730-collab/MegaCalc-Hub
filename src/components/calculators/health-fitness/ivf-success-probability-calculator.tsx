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
import { Zap, HeartPulse, Calendar, Baby, Info, Activity, Beaker } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(25).max(45).optional(),
  previousIVFCycles: z.number().min(0).max(10).optional(),
  previousPregnancies: z.number().min(0).max(10).optional(),
  eggQuality: z.enum(['excellent','good','fair','poor']).optional(),
  embryoQuality: z.enum(['excellent','good','fair','poor']).optional(),
  uterineFactors: z.enum(['normal','mild','moderate','severe']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IvfSuccessProbabilityCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, previousIVFCycles: undefined, previousPregnancies: undefined, eggQuality: undefined, embryoQuality: undefined, uterineFactors: undefined } });

  const interpret = (v: FormValues) => {
    const msgs: string[] = [];
    if (v.age != null) {
      if (v.age < 30) msgs.push('Younger age is associated with higher IVF success rates, typically 40-50% per cycle.');
      else if (v.age < 35) msgs.push('Good age range for IVF; success rates typically 35-45% per cycle.');
      else if (v.age < 38) msgs.push('Moderate success rates, typically 25-35% per cycle; age-related factors become more significant.');
      else if (v.age < 40) msgs.push('Success rates decline, typically 15-25% per cycle; consider multiple cycles.');
      else msgs.push('Lower success rates, typically 5-15% per cycle; may require multiple cycles or donor eggs.');
    }
    if (v.previousPregnancies != null && v.previousPregnancies > 0) {
      msgs.push('Previous pregnancies may indicate better IVF success potential.');
    }
    if (v.eggQuality === 'excellent' || v.embryoQuality === 'excellent') {
      msgs.push('Excellent egg or embryo quality significantly improves success rates.');
    } else if (v.eggQuality === 'poor' || v.embryoQuality === 'poor') {
      msgs.push('Poor egg or embryo quality may reduce success rates; consider additional interventions.');
    }
    if (v.uterineFactors === 'severe') {
      msgs.push('Severe uterine factors may require treatment before IVF; consult with your fertility specialist.');
    }
    return msgs.join(' ') || 'Enter your information to estimate IVF success probability.';
  };

  const recommendations = (v: FormValues) => [
    'Work closely with your fertility specialist to optimize treatment protocols and timing',
    'Maintain a healthy lifestyle with balanced nutrition, moderate exercise, and stress management',
    'Consider preimplantation genetic testing (PGT) if recommended for your situation',
  ];

  const warnings = (v: FormValues) => [
    'IVF success rates vary widely based on individual factors; consult with your fertility specialist for personalized estimates',
    'Multiple cycles may be needed; success rates are cumulative over multiple attempts',
    'Age is the most significant factor affecting IVF success; consider timing carefully',
  ];

  const plan = () => ([
    { week: 1, focus: 'Initial consultation and fertility evaluation with specialist' },
    { week: 2, focus: 'Complete diagnostic testing and develop treatment plan' },
    { week: 3, focus: 'Begin ovarian stimulation protocol if proceeding with IVF' },
    { week: 4, focus: 'Monitor response to stimulation and adjust protocol as needed' },
    { week: 5, focus: 'Egg retrieval and fertilization process' },
    { week: 6, focus: 'Embryo development and quality assessment' },
    { week: 7, focus: 'Embryo transfer and post-transfer care' },
    { week: 8, focus: 'Pregnancy testing and early pregnancy monitoring if successful' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Estimated', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Beaker className="h-5 w-5" /> IVF Success Probability</CardTitle>
          <CardDescription>Estimate probability of IVF success based on age and key factors</CardDescription>
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
            <FormField control={form.control} name="previousIVFCycles" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Beaker className="h-4 w-4" /> Previous IVF Cycles</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
            <FormField control={form.control} name="eggQuality" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Egg Quality</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select quality" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="embryoQuality" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Baby className="h-4 w-4" /> Embryo Quality</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select quality" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="uterineFactors" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Uterine Factors</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select factors" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Estimate IVF Success Probability</Button>
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
                <CardTitle>IVF Success Probability Evaluation</CardTitle>
              </div>
              <CardDescription>Estimated probability of IVF success based on key factors</CardDescription>
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
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/conception-probability-per-cycle-calculator" className="text-primary hover:underline">Conception Probability</Link></h4><p className="text-sm text-muted-foreground">Estimate natural conception rates.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/fertility-ovulation-calculator" className="text-primary hover:underline">Fertility Ovulation Calculator</Link></h4><p className="text-sm text-muted-foreground">Track ovulation cycles.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/pregnancy-weight-gain-calculator" className="text-primary hover:underline">Pregnancy Weight Gain</Link></h4><p className="text-sm text-muted-foreground">Track recommended weight gain.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/gestational-diabetes-risk-calculator" className="text-primary hover:underline">Gestational Diabetes Risk</Link></h4><p className="text-sm text-muted-foreground">Assess diabetes risk during pregnancy.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: IVF Success Probability</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>In vitro fertilization (IVF) success rates vary significantly based on multiple factors, with age being the most critical determinant. Understanding these factors helps set realistic expectations and guides treatment decisions. Success rates are typically reported as live birth rates per cycle, which provide the most meaningful outcome measure.</p>
          <p>For women under 35, IVF success rates per cycle are typically 40-50%. These rates decline with age: 35-37 years (35-45%), 38-40 years (25-35%), 41-42 years (15-25%), and over 42 years (5-15% or less). However, cumulative success rates over multiple cycles are higher, and individual factors such as egg quality, embryo quality, and uterine factors significantly influence outcomes.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What are typical IVF success rates?', 'IVF success rates vary significantly by age. For women under 35, live birth rates per cycle are typically 40-50%. Rates decline with age: 35-37 years (35-45%), 38-40 years (25-35%), 41-42 years (15-25%), and over 42 years (5-15% or less). However, these are averages; individual factors including egg quality, embryo quality, uterine factors, and overall health significantly influence outcomes. Success rates are cumulative over multiple cycles, meaning chances improve with additional attempts.'],
            ['How does age affect IVF success rates?', 'Age is the most significant factor affecting IVF success. Younger women have higher success rates due to better egg quality and quantity. Success rates decline gradually until age 35, then more rapidly after 35, with significant declines after 40. This decline is due to decreased egg quantity, increased chromosomal abnormalities, and reduced embryo quality. Women over 42 may have success rates of 5% or less per cycle, making donor eggs a consideration.'],
            ['What factors influence IVF success besides age?', 'Key factors include egg quality and quantity (assessed by AMH, FSH, and antral follicle count), embryo quality (grading systems evaluate development and cell characteristics), uterine factors (endometrial thickness, polyps, fibroids, or other abnormalities), previous pregnancy history, lifestyle factors (weight, nutrition, stress, smoking, alcohol), and treatment protocols (medication types, dosages, timing). Individual assessment helps predict success more accurately than age alone.'],
            ['How many IVF cycles are typically needed?', 'The number of cycles needed varies widely. Many couples achieve success in 1-3 cycles, while others may need more. Cumulative success rates increase with multiple cycles: after 3 cycles, cumulative success rates can reach 60-80% for younger women. However, success rates per cycle decrease with each unsuccessful attempt in some cases. Your fertility specialist can help determine optimal cycle number based on your specific situation and response to treatment.'],
            ['Does previous IVF failure reduce future success rates?', 'Previous IVF failures don\'t necessarily predict future outcomes, though they may indicate underlying issues. Some couples achieve success after multiple cycles. Failed cycles provide valuable information about response to medications, egg quality, and embryo development, which can guide protocol adjustments. However, if multiple cycles fail without producing good-quality embryos, it may indicate more significant challenges that require different approaches, such as donor eggs.'],
            ['How does egg quality affect IVF success?', 'Egg quality is crucial for IVF success, as it directly impacts embryo development and viability. High-quality eggs more likely produce high-quality embryos with normal chromosomes, leading to better implantation and pregnancy rates. Egg quality declines with age but also varies among individuals of the same age. Preimplantation genetic testing (PGT) can help identify chromosomally normal embryos, improving success rates, especially for older women.'],
            ['What is the role of embryo quality in IVF success?', 'Embryo quality significantly impacts IVF success. Embryos are graded based on cell number, cell size uniformity, and degree of fragmentation. Higher-grade embryos have better implantation and pregnancy rates. Many clinics transfer the highest-quality embryos, and some offer preimplantation genetic testing (PGT) to identify chromosomally normal embryos, which can improve success rates by 10-30% in certain situations, particularly for older women or those with previous failures.'],
            ['Can lifestyle changes improve IVF success rates?', 'Yes, lifestyle factors can influence IVF success. Maintaining a healthy weight (both underweight and overweight can reduce success), eating a balanced diet rich in antioxidants, engaging in moderate exercise, managing stress, avoiding smoking and excessive alcohol, and getting adequate sleep all support fertility. Some studies suggest supplements like CoQ10, vitamin D, and folic acid may help, but consult your doctor before starting supplements. Optimizing these factors before and during treatment may improve outcomes.'],
            ['What should I expect during an IVF cycle?', 'An IVF cycle typically involves: initial consultation and testing, ovarian stimulation with medications (8-14 days), monitoring via ultrasounds and blood tests, trigger shot to mature eggs, egg retrieval (minor procedure under sedation), fertilization in the lab, embryo development (3-6 days), embryo transfer (simple procedure), and pregnancy testing (10-14 days after transfer). The entire process takes about 4-6 weeks. Your fertility clinic will provide detailed timelines and instructions specific to your protocol.'],
            ['When should I consider donor eggs or other options?', 'Consider donor eggs if: you\'re over 42 with low success rates, you have poor egg quality despite multiple cycles, you have premature ovarian failure, or you have genetic conditions you want to avoid passing on. Donor egg IVF has success rates of 50-60% per cycle, similar to rates for younger women using their own eggs. Other options include donor embryos, gestational surrogacy, or adoption. Discuss all options with your fertility specialist to determine the best path for your situation and goals.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
