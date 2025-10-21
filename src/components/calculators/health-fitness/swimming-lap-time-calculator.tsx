
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves } from 'lucide-react';

const formSchema = z.object({
  totalMinutes: z.number().nonnegative().optional(),
  totalSeconds: z.number().nonnegative().optional(),
  laps: z.number().int().positive().optional(),
  avgLapMinutes: z.number().nonnegative().optional(),
  avgLapSeconds: z.number().nonnegative().optional(),
  solveFor: z.enum(['avg_lap_time', 'total_time', 'laps']),
});

type FormValues = z.infer<typeof formSchema>;

export default function SwimmingLapTimeCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'avg_lap_time',
    },
  });

  const onSubmit = (values: FormValues) => {
    const totalTimeSeconds = (values.totalMinutes || 0) * 60 + (values.totalSeconds || 0);
    const avgLapTimeSeconds = (values.avgLapMinutes || 0) * 60 + (values.avgLapSeconds || 0);

    if (values.solveFor === 'avg_lap_time' && values.laps && totalTimeSeconds > 0) {
      const pacePerLap = totalTimeSeconds / values.laps;
      const paceMins = Math.floor(pacePerLap / 60);
      const paceSecs = Math.round(pacePerLap % 60);
      setResult(`${paceMins}:${paceSecs.toString().padStart(2, '0')} per lap`);
    } else if (values.solveFor === 'total_time' && values.laps && avgLapTimeSeconds > 0) {
      const totalSeconds = values.laps * avgLapTimeSeconds;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.round(totalSeconds % 60);
      setResult(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else if (values.solveFor === 'laps' && totalTimeSeconds > 0 && avgLapTimeSeconds > 0) {
      const laps = totalTimeSeconds / avgLapTimeSeconds;
      setResult(`${laps.toFixed(0)} laps`);
    } else {
      setResult("Please provide the required inputs to calculate.");
    }
  };

  const solveFor = form.watch('solveFor');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="solveFor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What do you want to calculate?</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="avg_lap_time">Average Lap Time</option>
                  <option value="total_time">Total Time</option>
                  <option value="laps">Number of Laps</option>
                </select>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel>Total Swim Time</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="totalMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'total_time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="totalSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="sec" {...field} disabled={solveFor === 'total_time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
            <FormField control={form.control} name="laps" render={({ field }) => (<FormItem><FormLabel>Number of Laps</FormLabel><FormControl><Input type="number" {...field} disabled={solveFor === 'laps'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl></FormItem>)} />
            <div>
              <FormLabel>Average Lap Time</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="avgLapMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'avg_lap_time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="avgLapSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="sec" {...field} disabled={solveFor === 'avg_lap_time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Waves className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div></CardHeader>
            <CardContent><p className="text-3xl font-bold text-center">{result}</p></CardContent>
        </Card>
      )}
      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Swimming Lap Time Calculator Guide: Calculating Critical Swim Speed (CSS) for Training Zones" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to using a Swimming Lap Time Calculator to determine Critical Swim Speed (CSS), the pace per 100 meters/yards, and how to structure training zones (Endurance, Threshold, V02 Max) for triathletes and distance swimmers." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Swimming Lap Time Calculator Guide: Mastering Your Critical Swim Speed (CSS)</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on established sports training protocols and exercise physiology. Consult a coach or physician before starting an intense new training plan, especially if you have a pre-existing health condition.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">Lap Time vs. Pace: Why the Pace Per 100 Matters</a></li>
        <li><a href="#lap-definition">The Confusion: Defining a Lap, Length, and Distance</a></li>
        <li><a href="#css">Critical Swim Speed (CSS): The Endurance Benchmark</a></li>
        <li><a href="#css-test">The 400/200 Protocol: How to Calculate Your CSS</a></li>
        <li><a href="#training-zones">Structuring Your Workouts with CSS Training Zones</a></li>
        <li><a href="#efficiency">Beyond Pace: Tracking Stroke Rate and SWOLF Score</a></li>
        <li><a href="#improvement">Actionable Strategies to Improve Your CSS and Efficiency</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">Lap Time vs. Pace: Why the Pace Per 100 Matters</h2>
    <p itemProp="description">For structured training, simply counting laps is insufficient. The **Swimming Lap Time Calculator** is a tool that converts your total swim time and distance into the crucial metric used by coaches worldwide: **Pace per 100 meters (or yards)**. This standardized measurement allows you to compare your efforts from one workout to the next, regardless of total distance.</p>

    <p>The goal is to move from swimming based on feel to swimming with precision. This pace forms the basis of your **Critical Swim Speed (CSS)**, which is the cornerstone for endurance training, improving your aerobic capacity, and building race-specific speed for events like the 1500m swim or the swim leg of a triathlon.</p>

    <h3 className="font-semibold text-foreground mt-6">The Core Pace Formula</h3>
    <p>The calculator uses the basic ratio and normalizes it to 100 units:</p>
    <pre><code>Pace per 100 = (Total Time in Seconds &divide; Total Distance) &times; 100</code></pre>

    <h2 id="lap-definition" className="text-xl font-bold text-foreground mt-8">The Confusion: Defining a Lap, Length, and Distance</h2>
    <p>Before entering data into any calculator, clear terminology is necessary, as the word "lap" is often misinterpreted in the swimming community.</p>

    <h3 className="font-semibold text-foreground mt-6">Pool Terminology (The Coach's Standard)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Length:** One single traversal of the pool (e.g., the 25m/yd distance from one wall to the opposite wall).</li>
        <li>**Lap:** Often used informally to mean "down and back" (two lengths), particularly by recreational swimmers. However, in competition, a lap is often defined as a single length.</li>
        <li>**Distance Unit:** The standard competitive unit of measurement for pace is the **100** (meters or yards), allowing for easy comparison across different race distances.</li>
        <li>**Common Pool Sizes:** 25-yard (short course yards/SCY), 25-meter (short course meters/SCM), and 50-meter (long course/LCM - Olympic size).</li>
    </ul>
    <p>***For consistency, always count your workout in terms of total distance (meters or yards) and calculate your pace per 100.***</p>

    <h2 id="css" className="text-xl font-bold text-foreground mt-8">Critical Swim Speed (CSS): The Endurance Benchmark</h2>
    <p>**Critical Swim Speed (CSS)** is the swimming equivalent of Functional Threshold Power (FTP) in cycling or Lactate Threshold (LT) in running. It represents the fastest pace you can sustain aerobically—the point where your body is producing the maximum amount of lactate that it can simultaneously clear. This speed is typically your projected race pace for a 1500m swim.</p>

    <h3 className="font-semibold text-foreground mt-6">Benefits of Training at CSS</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Aerobic Capacity:** CSS training pushes your aerobic engine without causing excessive fatigue that requires days of recovery.</li>
        <li>**Pace Awareness:** Training by a specific CSS time improves your internal perception of speed, helping you execute a race strategy without relying on a clock.</li>
        <li>**Race Specificity:** For events of 400m and longer, CSS is the most relevant and powerful training intensity.</li>
    </ul>

    <h2 id="css-test" className="text-xl font-bold text-foreground mt-8">The 400/200 Protocol: How to Calculate Your CSS</h2>
    <p>CSS is calculated by comparing the average pace of a short, maximal effort swim (200m/yd) against a slightly longer maximal effort swim (400m/yd). The time difference reveals the rate at which you fatigue.</p>

    <h3 className="font-semibold text-foreground mt-6">CSS Calculation Formula (All Times in Seconds)</h3>
    <p>First, convert your 400m time and 200m time into total seconds. Then apply the formula:</p>
    <pre><code>CSS Pace (sec/100) = (T400 &minus; T200) &divide; 2</code></pre>

    <h3 className="font-semibold text-foreground mt-6">Testing Protocol</h3>
    <ol className="list-decimal ml-6 space-y-1">
        <li>**Warm-Up:** 10–15 minutes easy swimming, including short efforts to prime the muscles.</li>
        <li>**Time Trial 1:** Swim 400 meters/yards all-out at a fast, sustainable pace. Record the time (T400).</li>
        <li>**Active Recovery:** 5–10 minutes easy swimming to recover.</li>
        <li>**Time Trial 2:** Swim 200 meters/yards all-out. Record the time (T200).</li>
        <li>**Calculate:** Input T400 and T200 into the calculator to get your CSS pace per 100.</li>
    </ol>
    <p>***The CSS test is difficult and requires maximal effort for accuracy. Retest every 4–8 weeks to track improvement.***</p>

    <h2 id="training-zones" className="text-xl font-bold text-foreground mt-8">Structuring Your Workouts with CSS Training Zones</h2>
    <p>Once calculated, your CSS pace becomes the 100% anchor for setting personalized training zones, ensuring your workouts achieve their intended physiological purpose (aerobic base, endurance, or speed).</p>

    <h3 className="font-semibold text-foreground mt-6">The CSS Swim Training Zones</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Zone Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Target Pace (% of CSS)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Physiological Goal</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Endurance (Z2)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">87% &ndash; 94% CSS</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Long, steady swims; build mitochondrial density.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Threshold (Z3)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">95% &ndash; 98% CSS</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Pace practice; training the body to clear lactate efficiently.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>V02 Max (Z4)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">99% &ndash; 104% CSS</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">High-intensity intervals; directly boost aerobic power.</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <p className="citation">***Example Workout: 10 x 100m at 97% CSS (Threshold pace) with 15 seconds rest between each repetition.***</p>

    <h2 id="efficiency" className="text-xl font-bold text-foreground mt-8">Beyond Pace: Tracking Stroke Rate and SWOLF Score</h2>
    <p>Unlike running, swimming pace is heavily influenced by technique. True improvement in lap time comes from increasing efficiency, not just effort. The calculator's data should be used to improve two key metrics:</p>

    <h3 className="font-semibold text-foreground mt-6">1. SWOLF Score (Swim Golf)</h3>
    <p>SWOLF is the sum of your **Stroke Count** plus your **Time (in seconds)** for one pool length. It is a combined measure of efficiency and speed.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Goal:** The lower the SWOLF score, the more efficient your stroke.</li>
        <li>**Application:** If your pace is slow but your SWOLF is high, you are taking too many strokes and need to work on **Distance Per Stroke (DPS)**.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">2. Distance Per Stroke (DPS)</h3>
    <p>DPS measures how far you travel with each arm stroke. Maintaining a high DPS for a given pace minimizes energy expenditure and fatigue, making longer distances sustainable.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Application:** Use technique drills (e.g., single-arm, finger-tip drag) to maximize the amount of water you catch and push backward with every stroke.</li>
        <li>**Balance:** Efficient swimming is a balance between DPS and a sustainable **Stroke Rate (Cadence)**.</li>
    </ul>

    <h2 id="improvement" className="text-xl font-bold text-foreground mt-8">Actionable Strategies to Improve Your CSS and Efficiency</h2>
    <p>To consistently reduce your lap times, focus your training on sessions that target specific physiological adaptations determined by your CSS calculation.</p>

    <h3 className="font-semibold text-foreground mt-6">Key Training Workouts for CSS Improvement</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**CSS Interval Sets:** Regularly swim sets of 100m, 200m, or 400m at your calculated CSS pace, taking very short rest intervals (e.g., 10–20 seconds). This teaches your body to manage lactate at race-relevant speeds.</li>
        <li>**Long, Easy Endurance Swims:** Dedicate time to Zone 2 (Endurance) swimming at a truly comfortable pace. This builds your aerobic base and improves the endurance capabilities of your muscles and respiratory system.</li>
        <li>**Technique Drills:** Incorporate dedicated time for technique work (e.g., flutter kick, sculling, catch-up drill). Improving technique often has a greater and faster impact on pace than simply swimming harder.</li>
        <li>**Strength Training:** Off-deck strength work focused on the core, shoulders, and lats (latissimus dorsi) improves force generation in the water and helps maintain a high, efficient body position (less drag).</li>
    </ul>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using principles from Critical Swim Speed (CSS) testing, the established training zone methodologies of FINA/USA Swimming, and core swimming biomechanics research.</p>
    </div>
</section>
    </div>
  );
}
