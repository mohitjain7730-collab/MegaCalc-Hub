'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Timer } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({ goal: z.enum(['strength','hypertrophy','endurance']), lastSetRpe: z.number().min(1).max(10) });
type FormValues = z.infer<typeof formSchema>;

export default function RestTimeBetweenSetsCalculator() {
  const [restSec, setRestSec] = useState<number | null>(null);
  const [advice, setAdvice] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { goal: undefined as unknown as 'strength', lastSetRpe: undefined } });

  const onSubmit = (v: FormValues) => {
    let base = v.goal === 'strength' ? 180 : v.goal === 'hypertrophy' ? 90 : 45; // seconds
    base += (v.lastSetRpe - 7) * 15; // more effort -> more rest
    const final = Math.max(30, Math.min(300, base));
    setRestSec(Math.round(final));
    setAdvice(v.goal === 'strength' ? 'Prioritize full recovery for neural performance.' : v.goal === 'hypertrophy' ? 'Aim for a pump while keeping quality reps.' : 'Keep it moving; focus on pace and breathing.');
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="goal" render={({ field }) => (
              <FormItem><FormLabel>Primary Goal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="strength">Strength</SelectItem><SelectItem value="hypertrophy">Hypertrophy</SelectItem><SelectItem value="endurance">Muscular Endurance</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="lastSetRpe" render={({ field }) => (
              <FormItem><FormLabel>Last Set RPE (1–10)</FormLabel><FormControl><Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Recommend Rest</Button>
        </form>
      </Form>

      {restSec !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Timer className="h-8 w-8 text-primary" /><CardTitle>Suggested Rest Interval</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{Math.round(restSec)} sec</p>
              <CardDescription>{advice}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <RestGuide />
    </div>
  );
}

function RestGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CORRECTED VOID ELEMENTS) */}
    <meta itemProp="name" content="Optimal Rest Time Calculator Between Sets" />
    <meta itemProp="description" content="Calculate the optimal rest interval between sets for your specific goal: Strength (2-5 min), Hypertrophy (60-90 sec), or Endurance (30-60 sec). Based on ACSM guidelines." />
    <meta itemProp="keywords" content="rest time calculator between sets, optimal rest period, how long to rest for hypertrophy, rest interval for strength training, rest period calculator muscle growth" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/rest-time-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Optimal Rest Time Calculator: Maximize Gains by Timing Your Recovery</h1>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#science" className="hover:underline">The Science of Rest: Why Timing Matters</a></li>
        <li><a href="#goals" className="hover:underline">Optimal Rest Intervals Based on Training Goals</a></li>
        <li><a href="#nuance" className="hover:underline">Nuance: Compound vs. Isolation Exercises</a></li>
        <li><a href="#recovery" className="hover:underline">Gauging Recovery: Beyond the Stopwatch</a></li>
        <li><a href="#faq" className="hover:underline">Rest Time Calculator FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: THE SCIENCE */}
    <h2 id="science" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Science of Rest: Why Timing Your Recovery Matters</h2>
    <p>The time you spend resting between sets is just as critical as the weight you lift. Rest periods determine how well your body's energy systems recover, which directly dictates your performance in the next set and the long-term training adaptation you achieve.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Energy Systems and Recovery</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Phosphagen System (ATP-PCr):** Used for maximal, short bursts of energy (1-5 heavy reps). Full recovery of these stores requires approximately **3 to 5 minutes** of rest. Longer rest maximizes strength performance.</li>
        <li>**Glycolytic System (Lactate):** Used for moderate, sustained effort (6-15 reps). Shorter rest periods maintain metabolic stress and lactate levels, which is crucial for maximizing **Hypertrophy** (muscle growth) and the release of growth hormones.</li>
    </ul>
    <p>Using a calculator ensures you align your rest with the system you are trying to train, eliminating the common mistake of "guessing" when you're ready.</p>

<hr />
    {/* SECTION 2: GOAL-BASED REST INTERVALS */}
    <h2 id="goals" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimal Rest Intervals Based on Training Goals (ACSM Guidelines)</h2>
    <p>The American College of Sports Medicine (ACSM) and general sports science provide clear, evidence-based recommendations for rest intervals depending on your primary objective:</p>

    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Goal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Optimal Rest Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Physiological Reason</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Maximal Strength & Power</td>
                    <td className="px-6 py-4 whitespace-nowrap">2 - 5 minutes</td>
                    <td className="px-6 py-4 whitespace-nowrap">Full CNS and Phosphagen (ATP-PCr) recovery for maximum force production.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Muscle Hypertrophy (Growth)</td>
                    <td className="px-6 py-4 whitespace-nowrap">60 - 120 seconds</td>
                    <td className="px-6 py-4 whitespace-nowrap">Balances adequate strength maintenance with high metabolic stress (lactate build-up).</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Muscular Endurance</td>
                    <td className="px-6 py-4 whitespace-nowrap">30 - 60 seconds</td>
                    <td className="px-6 py-4 whitespace-nowrap">Trains the body to recover under fatigue; maximizes cardiovascular demand.</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />
    {/* SECTION 3: NUANCE */}
    <h2 id="nuance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Nuance: Compound vs. Isolation Exercises</h2>
    <p>The type of exercise significantly influences the recovery demands, even within the same workout goal. Your calculator's result should be seen as a guideline, adjustable based on the size of the muscle groups involved.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Compound Lifts Require Longer Rest</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Examples:** Squat, Deadlift, Bench Press, Overhead Press.</li>
        <li>**Reasoning:** These lifts engage massive amounts of muscle mass and are taxing on the Central Nervous System (CNS). Even when training for hypertrophy, a compound movement performed heavy at a 7-8 RIR may require **2 to 3 minutes** of rest to maintain performance across sets.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Isolation Lifts Allow Shorter Rest</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Examples:** Bicep Curls, Tricep Extensions, Leg Extensions, Lateral Raises.</li>
        <li>**Reasoning:** These movements use far less muscle mass and place minimal stress on the CNS. Even when training to failure, rest periods of **60 to 90 seconds** are often sufficient and can be highly effective for local hypertrophy stimulus.</li>
    </ul>

<hr />
    {/* SECTION 4: GAUGING RECOVERY */}
    <h2 id="recovery" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Gauging Recovery: Beyond the Stopwatch</h2>
    <p>While timing is essential, seasoned lifters also learn to use objective physical metrics to ensure they are ready for the next set, especially when deviating from the calculator's recommendation due to fatigue or time constraints.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Three Signs of Inadequate Recovery</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li>**Excessive Drop-off in Reps:** If you hit 10 reps on Set 1, but only 7 reps on Set 2 with the same weight, your rest interval was too short.</li>
        <li>**Heavy Breathing/Elevated Heart Rate:** If your breathing is still deep and rapid (Zone 4/5 intensity), your cardiovascular system is not ready to support the next set's demand.</li>
        <li>**Form Breakdown:** You find yourself relying on momentum or "cheating" to complete the final reps. This is the body compensating for unrecovered muscles.</li>
    </ol>

<hr />
    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rest Time Calculator FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Is it possible to rest for too long between sets?</h3>
    <p>Yes. While resting 5 minutes is optimal for maximal strength, resting excessively (e.g., 10 minutes or more) during a hypertrophy workout can allow the muscle to cool down and the metabolic stress to dissipate completely. This can reduce the growth stimulus you are trying to achieve, making your workout less efficient overall.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Does a shorter rest period burn more fat?</h3>
    <p>Shorter rest periods (30-60 seconds) keep your heart rate elevated, leading to a higher acute **caloric expenditure** during the workout. This increased metabolic stress is a powerful tool for conditioning and fat loss, but it comes at the expense of potential strength and muscle growth gains. The primary goal determines the rest period.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Should beginners use longer rest intervals?</h3>
    <p>Beginners should lean toward the **longer end of the recommended range** (e.g., 90 seconds for hypertrophy rather than 30 seconds). Since a beginner's body and CNS are adapting to a high degree, more rest is required to maintain good form and prevent excessive fatigue that could lead to injury or premature termination of the workout.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Use it to ensure every second of your workout, including the rest, is programmed for success.</p>
    </div>
</section>
  );
}