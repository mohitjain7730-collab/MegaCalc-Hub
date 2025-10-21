'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({ maxHr: z.number().positive().max(230), restingHr: z.number().positive().max(120) });
type FormValues = z.infer<typeof formSchema>;

function zoneRange(max: number, rest: number, lowPct: number, highPct: number) {
  const reserve = max - rest;
  const low = Math.round(rest + reserve * lowPct);
  const high = Math.round(rest + reserve * highPct);
  return `${low}–${high} bpm`;
}

export default function HeartRateZoneTrainingCalculator() {
  const [zones, setZones] = useState<string[] | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { maxHr: undefined, restingHr: undefined } });
  const onSubmit = (v: FormValues) => {
    const z = [
      zoneRange(v.maxHr, v.restingHr, 0.5, 0.6),
      zoneRange(v.maxHr, v.restingHr, 0.6, 0.7),
      zoneRange(v.maxHr, v.restingHr, 0.7, 0.8),
      zoneRange(v.maxHr, v.restingHr, 0.8, 0.9),
      `${Math.round(v.restingHr + (v.maxHr - v.restingHr) * 0.9)}–${v.maxHr} bpm`,
    ];
    setZones(z);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="maxHr" render={({ field }) => (<FormItem><FormLabel>Maximum Heart Rate (bpm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="restingHr" render={({ field }) => (<FormItem><FormLabel>Resting Heart Rate (bpm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate Zones</Button>
        </form>
      </Form>

      {zones && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Heart className="h-8 w-8 text-primary" /><CardTitle>Heart Rate Zones (Karvonen)</CardTitle></div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {['Zone 1 (Recovery)','Zone 2 (Endurance)','Zone 3 (Tempo)','Zone 4 (Threshold)','Zone 5 (VO₂)'].map((label, i) => (
                <div key={i} className="rounded border p-3 text-center">
                  <div className="text-sm text-muted-foreground">{label}</div>
                  <div className="text-lg font-semibold">{zones[i]}</div>
                </div>
              ))}
            </div>
            <CardDescription className="mt-2">Use easier zones for base work and recovery; visit higher zones sparingly to build fitness.</CardDescription>
          </CardContent>
        </Card>
      )}

      <HrGuide />
    </div>
  );
}

function HrGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CORRECTED VOID ELEMENTS) */}
    <meta itemProp="name" content="Heart Rate Zone Training Calculator" />
    <meta itemProp="description" content="Calculate your personalized 5 Heart Rate Training Zones (Polar/ACSM) for fat burning, endurance, and performance. Uses both the simple 220-Age and the accurate Karvonen Formula." />
    <meta itemProp="keywords" content="heart rate zone calculator, target heart rate calculator, fat burning zone calculator, cardio heart rate zones, karvonen formula calculator, maximum heart rate calculator" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/heart-rate-zone-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Heart Rate Zone Training Calculator: Find Your Personalized Cardio Zones</h1>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#formulas" className="hover:underline">Calculation Methods: MHR vs. Karvonen Formula</a></li>
        <li><a href="#five-zones" className="hover:underline">The 5 Heart Rate Training Zones Explained (ACSM)</a></li>
        <li><a href="#fat-burn" className="hover:underline">The Truth About the Fat Burning Zone (Zone 2)</a></li>
        <li><a href="#training" className="hover:underline">Programming: Using Zones for Endurance and HIIT</a></li>
        <li><a href="#faq" className="hover:underline">Heart Rate Zone Calculator FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: FORMULAS */}
    <h2 id="formulas" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Methods: MHR vs. Karvonen Formula</h2>
    <p>Your training zones are based on your **Maximum Heart Rate (MHR)**. However, the most accurate calculation method depends on whether you include your Resting Heart Rate (RHR).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Method 1: Age-Predicted Maximum Heart Rate (Basic)</h3>
    <p>This is the simplest and most common method (often cited by the AHA) but is less accurate as it ignores fitness level.</p>
    <pre className="bg-gray-200 p-3 rounded-md my-4"><code>MHR = 220 &minus; Age</code></pre>

    <h3 className="text-xl font-semibold text-foreground mt-6">Method 2: Karvonen Formula (Heart Rate Reserve - HRR)</h3>
    <p>The **Karvonen Formula** is generally considered more accurate because it accounts for your **Resting Heart Rate (RHR)**, reflecting your current cardiovascular fitness level. It uses your **Heart Rate Reserve (HRR)**.</p>
    <pre className="bg-gray-200 p-3 rounded-md my-4"><code>HRR = MHR &minus; RHR</code></pre>
    <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Target HR = (HRR &times; % Intensity) + RHR</code></pre>
    <p>If your calculator allows it, using the Karvonen method provides a more personalized and effective training range.</p>

<hr />
    {/* SECTION 2: THE 5 ZONES */}
    <h2 id="five-zones" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 5 Heart Rate Training Zones Explained (ACSM)</h2>
    <p>Each zone targets a different metabolic state and delivers a specific physiological benefit. Knowing your zone ensures you train smarter, not just harder.</p>

    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% MHR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Benefit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Source</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Zone 1 (Recovery)</td>
                    <td className="px-6 py-4 whitespace-nowrap">50% - 60%</td>
                    <td className="px-6 py-4 whitespace-nowrap">Warm-up, cool-down, active recovery, circulation.</td>
                    <td className="px-6 py-4 whitespace-nowrap">Mostly Fat</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Zone 2 (Fat Burn)</td>
                    <td className="px-6 py-4 whitespace-nowrap">60% - 70%</td>
                    <td className="px-6 py-4 whitespace-nowrap">Basic cardiovascular endurance (Aerobic Base).</td>
                    <td className="px-6 py-4 whitespace-nowrap">High % Fat</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Zone 3 (Aerobic)</td>
                    <td className="px-6 py-4 whitespace-nowrap">70% - 80%</td>
                    <td className="px-6 py-4 whitespace-nowrap">Improved speed endurance, high-volume steady state.</td>
                    <td className="px-6 py-4 whitespace-nowrap">Fat & Carbohydrates</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Zone 4 (Threshold)</td>
                    <td className="px-6 py-4 whitespace-nowrap">80% - 90%</td>
                    <td className="px-6 py-4 whitespace-nowrap">Increased Lactate Threshold and speed.</td>
                    <td className="px-6 py-4 whitespace-nowrap">Mostly Carbohydrates</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Zone 5 (Maximal)</td>
                    <td className="px-6 py-4 whitespace-nowrap">90% - 100%</td>
                    <td className="px-6 py-4 whitespace-nowrap">Max VO2, peak speed, short-burst Anaerobic capacity.</td>
                    <td className="px-6 py-4 whitespace-nowrap">Carbohydrates Only</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />
    {/* SECTION 3: FAT BURN MYTH */}
    <h2 id="fat-burn" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Truth About the Fat Burning Zone (Zone 2)</h2>
    <p>The **Fat Burning Zone (Zone 2)** is often misunderstood. While it's true that your body uses the highest **percentage** of fat as fuel in this lower intensity zone, this does not mean it's the fastest way to lose fat.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Fat Loss vs. Fat Oxidation</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**High Fat Oxidation:** Zone 2 training is highly effective for building **aerobic endurance** and teaching your body to efficiently burn fat as a fuel source over long periods (essential for marathon runners).</li>
        <li>**Total Calorie Burn:** Training in Zone 3 or Zone 4 burns a much higher **total number of calories** per minute. Since fat loss relies on a total calorie deficit, a 30-minute high-intensity workout (Zone 4) may contribute more to overall fat loss than a 30-minute Zone 2 workout, even though the Zone 4 session uses a lower percentage of fat as fuel.</li>
    </ul>
    <p>For sustainable weight loss, experts recommend the **80/20 Rule**: spend 80% of your time in low-intensity Zones 1-2 to build base fitness, and 20% in high-intensity Zones 4-5 for performance and peak calorie burn.</p>

<hr />
    {/* SECTION 4: TRAINING APPLICATION */}
    <h2 id="training" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Programming: Using Zones for Endurance and HIIT</h2>
    <p>Targeted Heart Rate Zone training allows you to structure your workouts precisely for their intended purpose, optimizing the stress placed on your body.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Endurance Training (Aerobic Base)</h3>
    <p>Successful endurance athletes (runners, cyclists) prioritize spending vast amounts of time in **Zone 2**. This low-impact intensity builds capillary density, increases mitochondria efficiency, and conditions the heart without causing excessive central nervous system (CNS) fatigue. This is where your fitness foundation is built.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">High-Intensity Interval Training (HIIT)</h3>
    <p>HIIT is defined by alternating periods in **Zone 4 or Zone 5** (Vigorous to Maximal effort) with periods of recovery in **Zone 1 or Zone 2**. The high intensity in Zone 4/5 maximizes speed, power, and overall calorie burn, while the Zone 1/2 recovery allows the heart rate to drop just enough to maintain performance for the next effort.</p>

<hr />
    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Heart Rate Zone Calculator FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Which MHR formula is the most accurate?</h3>
    <p>No single formula is universally perfect, but the **Karvonen Formula** is far more accurate than the simple 220-Age method because it incorporates your **Resting Heart Rate (RHR)**, which is a true reflection of your cardiac fitness level. For the absolute best results, perform a medically supervised maximum heart rate test.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why is my heart rate higher on the same run?</h3>
    <p>Many factors can cause your heart rate to drift higher (called **Cardiac Drift**) at the same pace:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Temperature/Humidity:** Training in the heat requires your heart to pump more blood to the skin for cooling.</li>
        <li>**Hydration:** Dehydration reduces blood volume, forcing the heart to beat faster to move the same amount of oxygen.</li>
        <li>**Fatigue/Stress:** Overall life stress and lack of sleep elevate your RHR, which raises the baseline for all your zones.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Can medications affect my heart rate zones?</h3>
    <p>Yes. Medications, especially **Beta-Blockers**, are designed to lower your heart rate. If you are taking heart-affecting medication, relying solely on heart rate zones can be misleading. You should use the **Rate of Perceived Exertion (RPE)** or the **Talk Test** (Zone 2 is where you can talk, but not sing) as your primary intensity guide, and consult your doctor for personalized targets.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculatong.com. Always consult a physician before beginning any new exercise regimen, especially if you have a pre-existing heart condition.</p>
    </div>
</section>
  );
}