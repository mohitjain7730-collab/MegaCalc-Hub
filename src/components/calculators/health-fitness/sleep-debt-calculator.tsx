'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({ targetPerNight: z.number().min(4).max(10), mon: z.number().min(0).max(24), tue: z.number().min(0).max(24), wed: z.number().min(0).max(24), thu: z.number().min(0).max(24), fri: z.number().min(0).max(24), sat: z.number().min(0).max(24), sun: z.number().min(0).max(24) });
type FormValues = z.infer<typeof formSchema>;

export default function SleepDebtCalculator() {
  const [debt, setDebt] = useState<number | null>(null);
  const [advice, setAdvice] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { targetPerNight: undefined, mon: undefined, tue: undefined, wed: undefined, thu: undefined, fri: undefined, sat: undefined, sun: undefined } });

  const onSubmit = (v: FormValues) => {
    const totalSlept = v.mon+v.tue+v.wed+v.thu+v.fri+v.sat+v.sun;
    const target = v.targetPerNight * 7;
    const diff = target - totalSlept;
    setDebt(diff);
    setAdvice(diff > 0 ? 'You are in sleep debt. Add 30–60 min earlier bedtime and anchor wake time.' : 'No weekly debt—maintain consistent schedule and daytime light exposure.');
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
            <FormField control={form.control} name="targetPerNight" render={({ field }) => (<FormItem><FormLabel>Target per Night (h)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            {(['mon','tue','wed','thu','fri','sat','sun'] as const).map((d) => (
              <FormField key={d} control={form.control} name={d} render={({ field }) => (<FormItem><FormLabel className="capitalize">{d}</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            ))}
          </div>
          <Button type="submit">Calculate Sleep Debt</Button>
        </form>
      </Form>

      {debt !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Moon className="h-8 w-8 text-primary" /><CardTitle>Weekly Sleep Debt</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{debt > 0 ? `${debt.toFixed(1)} hours owed` : `${Math.abs(debt).toFixed(1)} hours surplus`}</p>
              <CardDescription>{advice}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <SleepDebtGuide />
    </div>
  );
}

function SleepDebtGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CORRECTED VOID ELEMENTS) */}
    <meta itemProp="name" content="Sleep Debt Calculator & Recovery Tool" />
    <meta itemProp="description" content="Calculate your cumulative sleep debt (deficit) over the last week. Learn the health consequences of chronic sleep deprivation and get strategies to repay your sleep debt." />
    <meta itemProp="keywords" content="sleep debt calculator, sleep deficit calculator, how to calculate sleep debt, chronic sleep deprivation, sleep recovery tool, hours of sleep debt" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/sleep-debt-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Sleep Debt Calculator: Assess Your Sleep Deficit and Plan Recovery</h1>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-debt" className="hover:underline">What Exactly is Sleep Debt (Sleep Deficit)?</a></li>
        <li><a href="#calculate" className="hover:underline">How to Use the Calculator to Quantify Debt</a></li>
        <li><a href="#consequences" className="hover:underline">Health Consequences of Chronic Sleep Debt</a></li>
        <li><a href="#recovery-plan" className="hover:underline">Repaying Sleep Debt: The Best Recovery Strategies</a></li>
        <li><a href="#faq" className="hover:underline">Sleep Debt Calculator FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: DEFINITION */}
    <h2 id="what-is-debt" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Exactly is Sleep Debt (Sleep Deficit)?</h2>
    <p>**Sleep Debt**, or **Sleep Deficit**, is the running difference between the amount of sleep your body **needs** and the amount of sleep you **actually get**. For most healthy adults, the requirement is **7 to 9 hours** of sleep per night. If you only sleep 6 hours, you accrue 1 to 3 hours of sleep debt for that single night.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Cumulative Effect</h3>
    <p>Sleep debt is cumulative. That 1 to 3-hour deficit doesn't disappear; it stacks up day after day, week after week. Even if you adapt cognitively and don't "feel" tired, the negative effects on your health and performance are still compounding behind the scenes.</p>

<hr />
    {/* SECTION 2: HOW TO CALCULATE */}
    <h2 id="calculate" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Use the Calculator to Quantify Debt</h2>
    <p>The calculation relies on comparing your required baseline sleep against your actual sleep data over a defined period (typically 7 days).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Sleep Debt Formula</h3>
    <p>The calculator applies the simple formula for a weekly total:</p>
    <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Weekly Sleep Debt = (Required Hours per Night &minus; Actual Hours per Night) &times; 7 Days</code></pre>
    
    <p>For example, if you need 8 hours but only average 6.5 hours on weekdays and 8 hours on weekends (an average of 6.8 hours daily), your total weekly debt would be (8 hours &minus; 6.8 hours) &times; 7 days = **8.4 hours of sleep debt**.</p>
    
    <p>To use the tool effectively, input your best estimate for the sleep you received each night this past week to get a precise, actionable number.</p>

<hr />
    {/* SECTION 3: CONSEQUENCES */}
    <h2 id="consequences" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Health Consequences of Chronic Sleep Debt</h2>
    <p>Carrying a significant sleep debt is a major risk factor, affecting everything from mood to metabolic function. This is why addressing the debt is crucial for overall well-being.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Major Impacts of Insufficient Sleep</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Cognitive Impairment:** Reduced memory retention, slower reaction times (equating to driving under the influence in severe cases), and difficulty with complex problem-solving.</li>
        <li>**Metabolic Dysfunction:** Increased risk of **weight gain**, obesity, and Type 2 diabetes due to disruption of appetite-regulating hormones (ghrelin and leptin).</li>
        <li>**Cardiovascular Risk:** Chronic sleep deprivation is linked to **hypertension** (high blood pressure) and increased risk of heart disease and stroke.</li>
        <li>**Weakened Immunity:** Decreased production of T-cells and immune-fighting proteins, making you more susceptible to viruses and infections.</li>
    </ul>

<hr />
    {/* SECTION 4: RECOVERY PLAN */}
    <h2 id="recovery-plan" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Repaying Sleep Debt: The Best Recovery Strategies</h2>
    <p>You cannot fully repay a massive debt in one night (and trying to sleep 14 hours straight can disrupt your circadian rhythm). Recovery takes time, consistency, and a multi-day approach.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Actionable Steps to Eliminate Your Deficit</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Incremental Increases:** The healthiest way to pay down the debt is to extend your sleep time by **15 to 30 minutes** each night until you reach your ideal duration.</li>
        <li>**Strategic Napping:** Use short **power naps (10-20 minutes)** in the early afternoon to boost alertness and offset daytime fatigue. Avoid long naps or napping too close to bedtime, as this can sabotage nighttime sleep.</li>
        <li>**Weekend Adjustment (In Moderation):** Sleeping in on the weekend can help ease symptoms, but limit the "catch-up" sleep to **no more than 9-10 hours total**. Excessive fluctuation confuses your body clock.</li>
        <li>**Strict Sleep Hygiene:** Maintain a **consistent bedtime and wake time**, even after recovery. Ensure your bedroom is **dark, cool, and quiet** to maximize sleep quality.</li>
    </ul>

<hr />
    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sleep Debt Calculator FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">How long does it take to fully recover from sleep debt?</h3>
    <p>Recovery is slow. Research suggests it can take **four full days** to recover from just **one hour** of lost sleep and up to **nine days or more** to completely eliminate a significant chronic debt.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Can I function normally with chronic sleep debt?</h3>
    <p>Many people believe they can, which is a key danger of chronic sleep deprivation. The brain adapts to a lower baseline, making you unaware of your reduced cognitive function and slower reaction times. Objective testing shows that performance is still significantly impaired, even if you don't feel sleepy.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Should I see a doctor if my sleep debt is consistently high?</h3>
    <p>Yes. If you consistently budget 7-9 hours of sleep but are still unable to fall or stay asleep, or if you feel severe fatigue during the day, it is critical to **consult a physician or a sleep specialist**. High sleep debt may be a symptom of an underlying sleep disorder, such as **insomnia** or **sleep apnea**.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Prioritize sleep—it is the foundation of all other health and fitness goals.</p>
    </div>
</section>
  );
}