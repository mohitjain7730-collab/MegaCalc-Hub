'use client';

import { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

const setSchema = z.object({ exercise: z.string().min(1), sets: z.number().nonnegative(), reps: z.number().nonnegative(), weight: z.number().nonnegative() });
const formSchema = z.object({ items: z.array(setSchema).min(1) });
type FormValues = z.infer<typeof formSchema>;

export default function TrainingVolumeCalculator() {
  const [totalVolume, setTotalVolume] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { items: [{ exercise: '', sets: undefined as unknown as number, reps: undefined as unknown as number, weight: undefined as unknown as number }] } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const onSubmit = (v: FormValues) => {
    const vol = v.items.reduce((sum, it) => sum + (it.sets || 0) * (it.reps || 0) * (it.weight || 0), 0);
    setTotalVolume(vol);
  };

  const itemsWatch = form.watch('items');
  const previewVolume = useMemo(() => (itemsWatch || []).reduce((s, it) => s + ((it.sets||0)*(it.reps||0)*(it.weight||0)),0), [itemsWatch]);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FormField control={form.control} name={`items.${idx}.exercise`} render={({ field }) => (<FormItem><FormLabel>Exercise</FormLabel><FormControl><Input placeholder="e.g., Back Squat" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`items.${idx}.sets`} render={({ field }) => (<FormItem><FormLabel>Sets</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`items.${idx}.reps`} render={({ field }) => (<FormItem><FormLabel>Reps</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`items.${idx}.weight`} render={({ field }) => (<FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <div className="flex items-end"><Button type="button" variant="secondary" onClick={() => remove(idx)}>Remove</Button></div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ exercise: '', sets: undefined as unknown as number, reps: undefined as unknown as number, weight: undefined as unknown as number })}>Add Exercise</Button>
          </div>
          <Button type="submit">Calculate Volume</Button>
          <p className="text-sm text-muted-foreground">Live preview: {previewVolume.toLocaleString()} kg·reps</p>
        </form>
      </Form>

      {totalVolume !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Dumbbell className="h-8 w-8 text-primary" /><CardTitle>Total Training Volume</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{totalVolume.toLocaleString()} kg·reps</p>
              <CardDescription>Volume is a proxy for workload. Adjust weekly to manage fatigue and drive progress.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <TvlGuide />
    </div>
  );
}

function TvlGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CORRECTED VOID ELEMENTS) */}
    <meta itemProp="name" content="Training Volume Calculator (Sets x Reps x Weight)" />
    <meta itemProp="description" content="Calculate the total training tonnage (volume) for your workout or muscle group instantly. Use this essential metric to apply progressive overload for muscle growth (hypertrophy)." />
    <meta itemProp="keywords" content="training volume calculator, workout volume calculator, sets x reps x weight, total tonnage calculator, progressive overload tool, optimal volume for hypertrophy" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/training-volume-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Training Volume Calculator: Track Tonnage for Hypertrophy & Strength</h1>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#formula" className="hover:underline">The Training Volume Formula Explained</a></li>
        <li><a href="#hypertrophy" className="hover:underline">Optimal Volume Ranges for Muscle Growth</a></li>
        <li><a href="#overload" className="hover:underline">How to Apply Progressive Overload Using Volume</a></li>
        <li><a href="#landmarks" className="hover:underline">Volume Landmarks (MV, MEV, MRV)</a></li>
        <li><a href="#faq" className="hover:underline">Workout Volume Calculator FAQs</a></li>
    </ul>

    {/* SECTION 1: FORMULA EXPLANATION */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Training Volume Formula Explained (Sets &times; Reps &times; Weight)</h2>
    <p>Training Volume, or **Total Tonnage**, is the most common metric used by bodybuilders and strength coaches to measure the total amount of work performed in a session, a week, or an entire training block. It is the best proxy for measuring the **training stimulus** applied to a muscle group.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Basic Tonnage Calculation</h3>
    <p>The standard formula used for volume calculation is simple, yet powerful:</p>
    <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Training Volume (Tonnage) = Sets &times; Repetitions &times; Weight Lifted</code></pre>
    <p>For example, if you perform **3 sets** of **10 reps** on the bench press with **150 lbs**, your volume for that exercise is: $3 \times 10 \times 150 = 4,500$ lbs.</p>
    
    <p>Tracking this number allows you to make precise, objective adjustments to your routine, ensuring you are doing *more work* than the previous week—the core principle of long-term progress.</p>

    {/* SECTION 2: OPTIMAL VOLUME RANGES (HYPERTROPHY FOCUS) */}
    <h2 id="hypertrophy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimal Volume Ranges for Muscle Growth (Hypertrophy)</h2>
    <p>Research consistently shows a **dose-response relationship** between volume and muscle growth: within a recoverable limit, more volume leads to more hypertrophy. The key is finding your **Maximum Adaptive Volume (MAV)**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Weekly Sets per Muscle Group</h3>
    <p>While the calculator gives you tonnage, most modern programs track volume in terms of **hard sets per muscle group per week** to simplify programming. Use this table as a general guideline:</p>

    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifter Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Optimal Weekly Sets</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Example Muscle Group</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Beginner</td>
                    <td className="px-6 py-4 whitespace-nowrap">10 - 12 sets/week</td>
                    <td className="px-6 py-4 whitespace-nowrap">Chest, Back, Legs</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Intermediate</td>
                    <td className="px-6 py-4 whitespace-nowrap">14 - 20 sets/week</td>
                    <td className="px-6 py-4 whitespace-nowrap">Quads, Hamstrings</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Advanced</td>
                    <td className="px-6 py-4 whitespace-nowrap">18 - 25+ sets/week</td>
                    <td className="px-6 py-4 whitespace-nowrap">Shoulders, Arms</td>
                </tr>
            </tbody>
        </table>
    </div>

    {/* SECTION 3: PROGRESSIVE OVERLOAD */}
    <h2 id="overload" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Apply Progressive Overload Using Volume</h2>
    <p>Progressive overload is the fundamental driver of all muscle and strength gains. Tracking your tonnage with this calculator gives you three objective ways to increase the total work done compared to your last session:</p>
    
    <ol className="list-decimal ml-6 space-y-3">
        <li className="font-semibold text-foreground">
            Increase the **Weight** (Intensity): 
            <p className="font-normal text-muted-foreground ml-4">The simplest method. Keep sets/reps the same, but use a heavier weight. **Volume goes up.**</p>
        </li>
        <li className="font-semibold text-foreground">
            Increase the **Reps** or **Sets** (Volume): 
            <p className="font-normal text-muted-foreground ml-4">Keep the weight the same, but add one or two repetitions per set, or add a whole extra working set. **Volume goes up.**</p>
        </li>
        <li className="font-semibold text-foreground">
            Increase the **Frequency**: 
            <p className="font-normal text-muted-foreground ml-4">Train the muscle group more often (e.g., training chest 3x per week instead of 2x). This immediately increases your **Weekly Volume**.</p>
        </li>
    </ol>
    <p>**Caution:** Do not increase all three variables at once. Small, incremental increases in weight or reps are key to sustainable growth.</p>


    {/* SECTION 4: VOLUME LANDMARKS */}
    <h2 id="landmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Volume Landmarks (MV, MEV, MRV)</h2>
    <p>Advanced programming requires an understanding of how volume relates to recovery. These terms, popularized by coaches like Dr. Mike Israetel, define the boundaries of your effective training volume:</p>
    
    <ul className="list-disc ml-6 space-y-2">
        <li>**MV (Maintenance Volume):** The absolute **minimum volume** required to maintain your current muscle mass. If you stop here, you won't grow, but you won't shrink.</li>
        <li>**MEV (Minimum Effective Volume):** The **minimum volume** required to actually stimulate **new muscle growth**. Training below this threshold is often "junk volume."</li>
        <li>**MAV (Maximum Adaptive Volume):** The range of volume where your body is generating the **most optimal gains** (your training sweet spot). Your goal is to train within this range.</li>
        <li>**MRV (Maximum Recoverable Volume):** The **maximum volume** your body can recover from before entering overtraining territory, leading to plateaus, injury, and fatigue. You should approach this limit toward the end of a training block before a deload.</li>
    </ul>

    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Workout Volume Calculator FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Should I count warm-up sets in my training volume calculation?</h3>
    <p>No. You should **only count working sets** (often defined as those sets taken close to muscular failure, usually within 1-3 Reps in Reserve/RIR). Warm-up sets use a lighter weight and do not contribute meaningfully to the total growth stimulus, so including them only inflates your tonnage number.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Is more volume always better for hypertrophy?</h3>
    <p>No. While volume is the main driver of muscle growth, there are **diminishing returns**. Once you exceed your **MRV (Maximum Recoverable Volume)**, adding more volume leads to excessive fatigue, joint stress, and *less* muscle gain due to poor recovery. Quality of volume (intensity, proximity to failure) is more important than sheer quantity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How do I calculate volume for bodyweight exercises (like push-ups)?</h3>
    <p>For bodyweight exercises, replace the **Weight Lifted** component in the formula with your current **Body Weight** (BW). The formula becomes: **Volume = Sets &times; Repetitions &times; Body Weight**. This provides a reliable tonnage metric for tracking progress over time.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Use this calculator consistently to track your progress and ensure you are maximizing your results in the gym.</p>
    </div>
</section>
  );
}