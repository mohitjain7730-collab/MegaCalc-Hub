'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MoonStar } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({ timeInBedHours: z.number().positive(), totalSleepHours: z.number().nonnegative() });
type FormValues = z.infer<typeof formSchema>;

export default function SleepEfficiencyCalculator() {
  const [eff, setEff] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { timeInBedHours: undefined, totalSleepHours: undefined } });

  const onSubmit = (v: FormValues) => {
    const pct = v.timeInBedHours > 0 ? (v.totalSleepHours / v.timeInBedHours) * 100 : 0;
    setEff(pct);
    let text = 'Good efficiency.';
    if (pct < 85) text = 'Low efficiency. Try a consistent schedule and reduce time-in-bed without sleep.';
    else if (pct >= 90) text = 'Excellent efficiency—keep habits consistent.';
    setOpinion(text);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="timeInBedHours" render={({ field }) => (<FormItem><FormLabel>Time in Bed (hours)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="totalSleepHours" render={({ field }) => (<FormItem><FormLabel>Total Sleep (hours)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate Efficiency</Button>
        </form>
      </Form>

      {eff !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><MoonStar className="h-8 w-8 text-primary" /><CardTitle>Sleep Efficiency</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{eff.toFixed(0)}%</p>
              <CardDescription>{opinion}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <SeGuide />
    </div>
  );
}

function SeGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CORRECTED VOID ELEMENTS) */}
    <meta itemProp="name" content="Sleep Efficiency (SE) Calculator | TST / TIB" />
    <meta itemProp="description" content="Calculate your Sleep Efficiency percentage (Time Asleep vs. Time in Bed). This key clinical metric is used in CBT-I to diagnose sleep quality and determine optimal bedtime schedules." />
    <meta itemProp="keywords" content="sleep efficiency calculator, calculate sleep efficiency, TST TIB formula, good sleep efficiency percentage, insomnia diagnosis tool, sleep quality metric" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/sleep-efficiency-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Sleep Efficiency Calculator: Measure Your Sleep Quality (TST/TIB)</h1>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-se" className="hover:underline">What is Sleep Efficiency and the TST/TIB Formula?</a></li>
        <li><a href="#formula-breakdown" className="hover:underline">Key Components: TST, TIB, SOL, WASO</a></li>
        <li><a href="#threshold" className="hover:underline">The 85% Threshold: Diagnosing Insomnia</a></li>
        <li><a href="#cbti" className="hover:underline">How Sleep Restriction Therapy Uses Your SE</a></li>
        <li><a href="#improve" className="hover:underline">Actionable Steps to Increase Your Sleep Efficiency</a></li>
        <li><a href="#faq" className="hover:underline">Sleep Efficiency Calculator FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: DEFINITION AND FORMULA */}
    <h2 id="what-is-se" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Sleep Efficiency and the TST/TIB Formula?</h2>
    <p>**Sleep Efficiency (SE)** is a critical metric that measures how effectively you use your time spent in bed for actual sleep. It is the gold standard for quantifying sleep quality, especially in the diagnosis and treatment of insomnia.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Sleep Efficiency Formula</h3>
    <p>SE is calculated as a percentage using the ratio of **Total Sleep Time (TST)** to **Time in Bed (TIB)**:</p>
    <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Sleep Efficiency (%) = [ Total Sleep Time (TST) &divide; Total Time in Bed (TIB) ] &times; 100</code></pre>
    
    <p>A score near 100% means that almost all the time you dedicate to sleep is spent asleep, indicating excellent sleep quality.</p>

<hr />
    {/* SECTION 2: COMPONENTS */}
    <h2 id="formula-breakdown" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Components: TST, TIB, SOL, and WASO</h2>
    <p>To accurately use the calculator, you must precisely track four core metrics that comprise the TST and TIB values:</p>

    <ul className="list-disc ml-6 space-y-3">
        <li className="font-semibold text-foreground">
            Total Time in Bed (TIB): 
            <p className="font-normal text-muted-foreground ml-4">The total duration from the time you **first attempt to fall asleep** until the time you **finally get out of bed** for the day. TIB includes all time awake spent in bed.</p>
        </li>
        <li className="font-semibold text-foreground">
            Sleep Onset Latency (SOL): 
            <p className="font-normal text-muted-foreground ml-4">The amount of time it takes to **fall asleep** after getting into bed. For good sleep efficiency, SOL should ideally be under 20 minutes.</p>
        </li>
        <li className="font-semibold text-foreground">
            Wake After Sleep Onset (WASO): 
            <p className="font-normal text-muted-foreground ml-4">The cumulative time spent **awake during the night** after initially falling asleep, but before the final morning awakening.</p>
        </li>
        <li className="font-semibold text-foreground">
            Total Sleep Time (TST): 
            <p className="font-normal text-muted-foreground ml-4">The total minutes actually spent asleep. Calculated as: TST = TIB &minus; (Time to Fall Asleep + Total WASO).</p>
        </li>
    </ul>

<hr />
    {/* SECTION 3: THRESHOLD */}
    <h2 id="threshold" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 85% Threshold: Diagnosing Insomnia</h2>
    <p>In clinical settings, a person's average Sleep Efficiency is used to determine the severity of sleep issues, particularly Chronic Insomnia Disorder.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Efficiency Standards</h3>
    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SE Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interpretation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinical Context</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**90% & Higher**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Optimal Sleep Quality</td>
                    <td className="px-6 py-4 whitespace-nowrap">Excellent sleep hygiene and drive.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**85% & Higher**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Normal/Healthy Sleep Efficiency</td>
                    <td className="px-6 py-4 whitespace-nowrap">The standard minimum for healthy adults (ACSM/AASM).</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**Below 85%**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Impaired Sleep Quality</td>
                    <td className="px-6 py-4 whitespace-nowrap">May indicate underlying insomnia or sleep restriction is needed.</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />
    {/* SECTION 4: CBTI APPLICATION */}
    <h2 id="cbti" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Sleep Restriction Therapy Uses Your SE</h2>
    <p>For those with low sleep efficiency (below 85%), a technique called **Sleep Restriction Therapy (SRT)**—a key component of Cognitive Behavioral Therapy for Insomnia (CBT-I)—is often prescribed. The goal is counter-intuitive: to spend *less* time in bed to increase your sleep drive.</p>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">The Mechanism: Building Sleep Drive</h3>
    <p>By restricting the TIB (Time in Bed) to be closer to your actual TST (Total Sleep Time), you increase the pressure to sleep. This forces your body to use the time in bed much more efficiently, eventually pushing your SE back toward the ideal 85% or higher range. The Sleep Efficiency Calculator is used weekly to monitor progress and adjust your prescribed TIB.</p>

<hr />
    {/* SECTION 5: IMPROVEMENT */}
    <h2 id="improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Actionable Steps to Increase Your Sleep Efficiency</h2>
    <p>If your SE score is below 85%, focus on habits that condition your brain to associate the bed with immediate sleep, not wakefulness.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Essential Sleep Hygiene Tips for High SE</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**The 20-Minute Rule:** If you cannot fall asleep within **20 minutes**, get out of bed. Go to another room and do a relaxing activity (e.g., read a book by dim light) until you feel sleepy, then return to bed. This breaks the association between the bed and wakeful frustration.</li>
        <li>**Use the Bed for Sleep Only:** Avoid reading, working, watching TV, or using electronic devices in bed. The bed should be a strong trigger for sleep and sex only.</li>
        <li>**Maintain Consistency:** Stick to a consistent **wake-up time** every day (even weekends) to solidify your circadian rhythm.</li>
    </ul>

<hr />
    {/* SECTION 6: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sleep Efficiency Calculator FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Is it possible to have a Sleep Efficiency over 95%?</h3>
    <p>Yes, but a score consistently above 95% can be a sign that you are **not spending enough time in bed**. Your sleep drive is so high that you fall asleep instantly and wake up without spending any time awake. While this sounds efficient, it often indicates you have a significant **Sleep Debt** and need to go to bed earlier to meet your full 7-9 hour requirement.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How long should my TST (Total Sleep Time) be?</h3>
    <p>While the SE measures *quality*, the TST measures *quantity*. For healthy adults, the goal for TST should be **7 to 9 hours**. You should use the SE calculator to confirm that the 7-9 hours you budget is time spent sleeping, not time spent lying awake.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">I have low SE because I wake up too much. What is WASO?</h3>
    <p>**WASO** stands for **Wake After Sleep Onset** (the time spent awake during the night). High WASO dramatically lowers your SE. Common causes include noise, light, needing the restroom, and stress. If WASO is consistently high, it is a key target for improvement via better sleep hygiene or clinical intervention.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. If your SE remains below 85% despite practicing good sleep hygiene, please consult a sleep specialist.</p>
    </div>
</section>
  );
}