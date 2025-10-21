'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeartPulse } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({ peakHr: z.number().positive().max(230), hrAfter1Min: z.number().positive().max(230) });
type FormValues = z.infer<typeof formSchema>;

export default function RecoveryHeartRateCalculator() {
  const [drop, setDrop] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { peakHr: undefined, hrAfter1Min: undefined } });

  const onSubmit = (v: FormValues) => {
    const d = v.peakHr - v.hrAfter1Min;
    setDrop(d);
    let text = 'Normal recovery.';
    if (d >= 30) text = 'Excellent recovery – strong parasympathetic rebound.';
    else if (d < 12) text = 'Slower recovery – consider more aerobic base and rest.';
    setOpinion(text);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="peakHr" render={({ field }) => (<FormItem><FormLabel>Peak HR (end of effort)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="hrAfter1Min" render={({ field }) => (<FormItem><FormLabel>HR After 1 Minute</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Assess Recovery</Button>
        </form>
      </Form>

      {drop !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><HeartPulse className="h-8 w-8 text-primary" /><CardTitle>Recovery Heart Rate</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">Drop: {drop} bpm</p>
              <CardDescription>{opinion}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <RhrGuide />
    </div>
  );
}

function RhrGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CORRECTED VOID ELEMENTS) */}
    <meta itemProp="name" content="Recovery Heart Rate (HRR) Calculator" />
    <meta itemProp="description" content="Calculate your Heart Rate Recovery (HRR) 1 minute after peak exercise. Use this vital metric to assess your cardiorespiratory fitness, vagal tone, and overall cardiovascular health." />
    <meta itemProp="keywords" content="recovery heart rate calculator, HRR calculator, cardio recovery rate, good heart rate recovery time, vagal tone fitness, heart health predictor" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/recovery-heart-rate-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Recovery Heart Rate Calculator: Measure Your Cardiorespiratory Fitness</h1>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">What is Heart Rate Recovery (HRR)?</a></li>
        <li><a href="#how-to-measure" className="hover:underline">How to Accurately Measure Your HRR</a></li>
        <li><a href="#standards" className="hover:underline">What is a Good Recovery Heart Rate? (Standards)</a></li>
        <li><a href="#why-it-matters" className="hover:underline">HRR as a Marker of Cardiovascular Health</a></li>
        <li><a href="#improve" className="hover:underline">Actionable Steps to Improve Your HRR</a></li>
        <li><a href="#faq" className="hover:underline">Recovery Heart Rate FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: DEFINITION */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Heart Rate Recovery (HRR)?</h2>
    <p>**Heart Rate Recovery (HRR)** is the drop in your heart rate measured immediately following the cessation of intense exercise. It is calculated as the difference between your peak heart rate at the end of the workout and your heart rate measured 1 minute later.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Nervous System Switch</h3>
    <p>HRR is a powerful, non-invasive measure of the efficiency of your **Autonomic Nervous System (ANS)**, specifically the rapid transition from the sympathetic ("fight or flight") state, which elevates your heart rate, back to the parasympathetic ("rest and digest") state, which slows it down. A fast recovery indicates a highly efficient and balanced system.</p>

<hr />
    {/* SECTION 2: HOW TO MEASURE */}
    <h2 id="how-to-measure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Accurately Measure Your HRR</h2>
    <p>For the calculator to provide a valid result, the measurement must follow a specific, short, high-intensity protocol to ensure a true peak heart rate is reached.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The HRR Measurement Protocol</h3>
    <ol className="list-decimal ml-6 space-y-3">
        <li className="font-semibold text-foreground">
            Achieve Peak Heart Rate:
            <p className="font-normal text-muted-foreground ml-4">Engage in **vigorous cardiovascular exercise** (e.g., hard sprinting, fast cycling, or burpees) for at least 2-3 minutes to reach 85% to 90% of your estimated maximum heart rate.</p>
        </li>
        <li className="font-semibold text-foreground">
            Record Peak HR (T0):
            <p className="font-normal text-muted-foreground ml-4">Immediately stop the exercise. Check and record your heart rate within the first 5 seconds (using a monitor, watch, or manual pulse count).</p>
        </li>
        <li className="font-semibold text-foreground">
            Record Recovery HR (T1):
            <p className="font-normal text-muted-foreground ml-4">Stand or walk slowly for exactly **60 seconds**, then immediately check and record your heart rate again.</p>
        </li>
        <li className="font-semibold text-foreground">
            Calculate the Difference:
            <p className="font-normal text-muted-foreground ml-4">Input both numbers into the calculator, or use the simple formula: **Peak HR &minus; HR at 1 Minute = HRR**.</p>
        </li>
    </ol>

<hr />
    {/* SECTION 3: STANDARDS */}
    <h2 id="standards" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a Good Recovery Heart Rate? (Standards)</h2>
    <p>A higher HRR is better, as it indicates your heart is more efficient at slowing down. While standards can vary by age and study population, here are the most commonly cited benchmarks for 1-minute HRR:</p>

    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate Drop (1 Minute HRR)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interpretation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Recommended</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**25 bpm or Higher**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Excellent/Athlete-level Fitness</td>
                    <td className="px-6 py-4 whitespace-nowrap">Maintain consistency; focus on periodization.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**18 - 24 bpm**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Good Cardiorespiratory Fitness</td>
                    <td className="px-6 py-4 whitespace-nowrap">Continue aerobic training to improve.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**13 - 17 bpm**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Average/Borderline Fitness</td>
                    <td className="px-6 py-4 whitespace-nowrap">Increase intensity/frequency of cardio workouts.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**12 bpm or Lower**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Poor Recovery / Potential Risk Factor</td>
                    <td className="px-6 py-4 whitespace-nowrap">**Consult a physician** for a full cardiovascular assessment.</td>
                </tr>
            </tbody>
        </table>
    </div>
    
<hr />
    {/* SECTION 4: WHY IT MATTERS */}
    <h2 id="why-it-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">HRR as a Marker of Cardiovascular Health and Vagal Tone</h2>
    <p>HRR is more than just a fitness score—it's a critical **prognostic factor** used in clinical settings. Studies, including those published by the American Heart Association, have consistently shown that poor HRR is associated with increased risk of cardiovascular disease (CAD) and all-cause mortality.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Vagus Nerve Connection</h3>
    <p>A high HRR is a sign of strong **vagal tone**. The Vagus Nerve is the primary conductor of the parasympathetic nervous system, responsible for calming the body after stress. A rapid drop in heart rate means the Vagus Nerve is quickly initiating the "rest and digest" signal, demonstrating a heart that is healthy and responsive to stress.</p>

<hr />
    {/* SECTION 5: IMPROVE */}
    <h2 id="improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Actionable Steps to Improve Your HRR</h2>
    <p>The best way to improve your HRR is by improving your overall cardiorespiratory fitness. This primarily involves consistent, structured aerobic training.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Training and Lifestyle Interventions</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Consistent Aerobic Exercise:** Aim for at least 150 minutes of moderate-intensity (Zone 2/3) aerobic activity per week. Consistency is more important than random, massive workouts.</li>
        <li>**Interval Training (HIIT):** The most effective way to improve HRR is to practice the very mechanism you are measuring. Alternating high-intensity bursts with periods of active rest forces the ANS to switch gears quickly.</li>
        <li>**Focus on Recovery:** Prioritize **7-9 hours of quality sleep** nightly, as this is when the parasympathetic system is fully dominant and builds its resilience.</li>
        <li>**Breathwork/Meditation:** Practices that stimulate the Vagus Nerve (like slow, deep, diaphragmatic breathing) can directly improve vagal tone and, over time, aid in recovery speed.</li>
    </ul>

<hr />
    {/* SECTION 6: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Recovery Heart Rate FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Can my HRR change from day to day?</h3>
    <p>Yes. HRR can fluctuate based on your internal state. Factors like **dehydration, poor sleep, illness, or high emotional stress** can all temporarily decrease your HRR, even if your underlying fitness is good. This is why tracking it regularly provides a valuable signal about your overall readiness.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why do athletes have a high HRR?</h3>
    <p>Elite athletes not only have stronger hearts but also highly conditioned nervous systems. Their bodies are trained to manage high-intensity stress, allowing the parasympathetic system to rapidly restore homeostasis immediately after exertion, resulting in a very high HRR.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Can I calculate HRR using my smart watch data?</h3>
    <p>Many modern smartwatches automatically measure and display a 1-minute HRR. While convenient, the accuracy can vary. For the most reliable diagnostic assessment, you should follow the manual protocol: **stop moving entirely at the peak and at the 1-minute mark** for the most precise measurement.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Remember that this calculation is a fitness indicator, not a substitute for medical advice.</p>
    </div>
</section>
  );
}