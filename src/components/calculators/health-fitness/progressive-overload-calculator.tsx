'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

const formSchema = z.object({ currentLoad: z.number().positive(), weeklyIncreasePct: z.number().min(0).max(20), weeks: z.number().int().min(1).max(52) });
type FormValues = z.infer<typeof formSchema>;

export default function ProgressiveOverloadCalculator() {
  const [plan, setPlan] = useState<number[] | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { currentLoad: undefined, weeklyIncreasePct: undefined, weeks: undefined } });

  const onSubmit = (v: FormValues) => {
    const pct = v.weeklyIncreasePct / 100;
    const values = Array.from({ length: v.weeks }, (_, i) => Math.round(v.currentLoad * Math.pow(1 + pct, i + 1)));
    setPlan(values);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="currentLoad" render={({ field }) => (<FormItem><FormLabel>Current Working Load (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="weeklyIncreasePct" render={({ field }) => (<FormItem><FormLabel>Weekly Increase (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="weeks" render={({ field }) => (<FormItem><FormLabel>Number of Weeks</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Generate Plan</Button>
        </form>
      </Form>

      {plan && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><TrendingUp className="h-8 w-8 text-primary" /><CardTitle>Progressive Overload Plan</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-muted-foreground">Planned working load each week:</p>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {plan.map((val, i) => (
                  <div key={i} className="rounded border p-2 text-center text-sm">Week {i+1}: {val} kg</div>
                ))}
              </div>
              <CardDescription>Aim for small, sustainable increases. Deload every 4–8 weeks or if performance drops.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <PoGuide />
    </div>
  );
}

function PoGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CORRECTED VOID ELEMENTS) */}
    <meta itemProp="name" content="Progressive Overload Calculator & Tracker" />
    <meta itemProp="description" content="Calculate and track the incremental load needed to achieve progressive overload. Use this tool to plan your next strength, rep, or volume increase for continuous gains." />
    <meta itemProp="keywords" content="progressive overload calculator, progressive overload tracker, how to progressive overload, progressive overload methods, next workout weight calculator, progressive overload routine" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/progressive-overload-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Progressive Overload Calculator: Plan Your Next Workout Increase</h1>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-it" className="hover:underline">The Principle of Progressive Overload Explained</a></li>
        <li><a href="#methods" className="hover:underline">7 Key Methods of Progressive Overload</a></li>
        <li><a href="#tracking" className="hover:underline">Why Tracking is Non-Negotiable for Overload</a></li>
        <li><a href="#planning" className="hover:underline">How to Use the Calculator to Plan Your Progress</a></li>
        <li><a href="#faq" className="hover:underline">Progressive Overload FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: THE PRINCIPLE */}
    <h2 id="what-is-it" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Principle of Progressive Overload Explained</h2>
    <p>Progressive Overload is the single most important concept in strength and hypertrophy training. It dictates that for your muscles to grow stronger or bigger, you must continually increase the demands placed upon them. If you repeatedly perform the same workout with the same weight, reps, and sets, your body will stop adapting, leading to a frustrating **plateau**.</p>
    
    <p>This calculator helps eliminate the guesswork by providing a structured way to quantify your past performance and plan a measurable increase for your next session, ensuring you are always one step ahead of your body's adaptation curve.</p>

<hr />
    {/* SECTION 2: METHODS */}
    <h2 id="methods" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">7 Key Methods of Progressive Overload</h2>
    <p>Most lifters think Progressive Overload only means adding weight. In reality, there are many ways to increase the stimulus, making it possible to keep progressing even when you can't add more weight to the bar.</p>

    <ol className="list-decimal ml-6 space-y-3">
        <li className="font-semibold text-foreground">
            Increasing the **Load (Weight)**: 
            <p className="font-normal text-muted-foreground ml-4">The most direct method. Aim to add a small amount (e.g., 2.5 lbs or 1 kg) to the bar while maintaining the same reps and sets. </p>
        </li>
        <li className="font-semibold text-foreground">
            Increasing the **Repetitions**: 
            <p className="font-normal text-muted-foreground ml-4">Perform more reps with the same weight and sets (e.g., moving from 3 sets of 8 to 3 sets of 9). This increases your total **Training Volume**.</p>
        </li>
        <li className="font-semibold text-foreground">
            Increasing the **Sets**: 
            <p className="font-normal text-muted-foreground ml-4">Adding one extra working set to an exercise while keeping load and reps constant. This is highly effective for increasing muscle-specific volume.</p>
        </li>
        <li className="font-semibold text-foreground">
            Increasing **Frequency**: 
            <p className="font-normal text-muted-foreground ml-4">Training a muscle group or lift more often per week (e.g., squatting 3 times instead of 2). This boosts weekly total tonnage.</p>
        </li>
        <li className="font-semibold text-foreground">
            Decreasing **Rest Time**: 
            <p className="font-normal text-muted-foreground ml-4">Performing the same total work in less time (e.g., completing 3 sets in 6 minutes instead of 8 minutes). This increases **Training Density**.</p>
        </li>
        <li className="font-semibold text-foreground">
            Increasing **Time Under Tension (TUT) / Tempo**: 
            <p className="font-normal text-muted-foreground ml-4">Slowing down the eccentric (lowering) phase of the lift (e.g., using a 4-second negative). This increases muscle fiber damage and growth stimulus.</p>
        </li>
        <li className="font-semibold text-foreground">
            Improving **Form/Range of Motion (ROM)**: 
            <p className="font-normal text-muted-foreground ml-4">Lifting the same weight but improving your technique (e.g., squatting deeper or using a pause at the bottom). This increases the muscle's leverage demand.</p>
        </li>
    </ol>

<hr />
    {/* SECTION 3: TRACKING */}
    <h2 id="tracking" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Tracking is Non-Negotiable for Progressive Overload</h2>
    <p>The biggest mistake lifters make is relying on **"feel."** If you don't log your performance from the previous workout, you are training blind. Objective tracking is the only way to apply the principle effectively.</p>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Metrics Your Tracker Must Include</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Weight and Reps:** The foundational data for calculating **Tonnage** and determining the next load increase.</li>
        <li>**RIR/RPE (Reps in Reserve / Rate of Perceived Exertion):** An indicator of **Intensity**. If you lift 225 lbs for 5 reps at an RPE 7 this week, you might aim for 225 lbs at RPE 8 next week (getting closer to failure).</li>
        <li>**Rest Interval:** Critical for managing **Training Density**. If you rest 120 seconds for a set this week, aim for 100 seconds next week.</li>
        <li>**Notes:** Record variables like **Tempo** ("4-second negative") or **Form** ("No shoulder flare"), which are subjective forms of overload.</li>
    </ul>

<hr />
    {/* SECTION 4: PLANNING WITH THE CALCULATOR */}
    <h2 id="planning" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Use the Calculator to Plan Your Progress</h2>
    <p>This Progressive Overload Calculator acts as a prediction tool. You input your last successful working set, and the tool helps you decide the most effective way to beat it, preventing plateaus and ensuring long-term linear progression.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example: Planning a Bench Press Increase</h3>
    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Workout Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Workout Goal (Overload)</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Initial Input</td>
                    <td className="px-6 py-4 whitespace-nowrap">200 lbs for 3 sets of 8 reps</td>
                    <td className="px-6 py-4 whitespace-nowrap">**Method 1 (Reps):** 200 lbs for 3 sets of **9 reps**</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Tonnage</td>
                    <td className="px-6 py-4 whitespace-nowrap">4,800 lbs</td>
                    <td className="px-6 py-4 whitespace-nowrap">**Method 2 (Weight):** **205 lbs** for 3 sets of 8 reps</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Rest Interval</td>
                    <td className="px-6 py-4 whitespace-nowrap">90 seconds</td>
                    <td className="px-6 py-4 whitespace-nowrap">**Method 3 (Density):** 200 lbs for 3x8 with **75 seconds** rest</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />
    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Progressive Overload FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">How much should I increase the weight by each week?</h3>
    <p>A safe and sustainable increase is typically **2.5 to 5 lbs (1 to 2.5 kg)** per week on large compound lifts (squat, bench, deadlift). For smaller muscle groups (like arms or shoulders), an increase of 1 to 2 lbs is often sufficient. Consistency over large jumps is key.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What is "linear progression" and how does it relate to this calculator?</h3>
    <p>Linear progression is a simple form of progressive overload where you try to increase the weight or reps **every single session**. This calculator helps facilitate a linear progression model by giving you a clear, quantitative goal to hit each time you enter the gym.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Can I progressively overload bodyweight exercises?</h3>
    <p>Absolutely. For exercises like push-ups or pull-ups, you must use non-weight methods: increasing **reps per set**, increasing **sets**, increasing **frequency**, or changing the **leverage** (e.g., elevated feet for push-ups or using a resistance band for pull-ups).</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Use it to ensure every workout pushes you closer to your strength and hypertrophy goals.</p>
    </div>
</section>
  );
}