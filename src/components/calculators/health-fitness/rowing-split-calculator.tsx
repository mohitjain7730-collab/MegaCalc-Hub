
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship } from 'lucide-react';

const formSchema = z.object({
  distance: z.number().positive().optional(),
  totalHours: z.number().nonnegative().optional(),
  totalMinutes: z.number().nonnegative().optional(),
  totalSeconds: z.number().nonnegative().optional(),
  splitMinutes: z.number().nonnegative().optional(),
  splitSeconds: z.number().nonnegative().optional(),
  solveFor: z.enum(['split', 'time', 'distance']),
});

type FormValues = z.infer<typeof formSchema>;

export default function RowingSplitCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'split',
    },
  });

  const onSubmit = (values: FormValues) => {
    const totalTimeSeconds = (values.totalHours || 0) * 3600 + (values.totalMinutes || 0) * 60 + (values.totalSeconds || 0);
    const splitTimeSeconds = (values.splitMinutes || 0) * 60 + (values.splitSeconds || 0);

    if (values.solveFor === 'split' && values.distance && totalTimeSeconds > 0) {
      const avgSplit = (totalTimeSeconds / values.distance) * 500;
      const mins = Math.floor(avgSplit / 60);
      const secs = (avgSplit % 60).toFixed(1);
      setResult(`${mins}:${secs.padStart(4, '0')}`);
    } else if (values.solveFor === 'time' && values.distance && splitTimeSeconds > 0) {
      const totalSeconds = (splitTimeSeconds / 500) * values.distance;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.round(totalSeconds % 60);
      setResult(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else if (values.solveFor === 'distance' && totalTimeSeconds > 0 && splitTimeSeconds > 0) {
      const distance = (totalTimeSeconds * 500) / splitTimeSeconds;
      setResult(`${distance.toFixed(0)} meters`);
    } else {
      setResult("Please provide the required inputs.");
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
                  <option value="split">Average 500m Split</option>
                  <option value="time">Total Time</option>
                  <option value="distance">Total Distance</option>
                </select>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>Distance (meters)</FormLabel><FormControl><Input type="number" {...field} disabled={solveFor === 'distance'} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl></FormItem>)} />
            <div>
              <FormLabel>Total Time</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name="totalHours" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="h" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="totalMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="m" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="totalSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="s" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
            <div>
              <FormLabel>Average 500m Split</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="splitMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'split'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="splitSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.1" placeholder="sec" {...field} disabled={solveFor === 'split'} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Ship className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div></CardHeader>
            <CardContent><p className="text-3xl font-bold text-center">{result}</p></CardContent>
        </Card>
      )}
      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Rowing Split Calculator Guide: Converting Split Time to Watts, Training Zones, and 2K Performance" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to the Rowing Split Calculator, explaining the split-to-watts formula, how to use 500m split time to set training zones (Steady State, Threshold, Max Power), and predicting your 2K race performance on an ergometer." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Rowing Split Calculator Guide: Mastering Your Pace and Power (Watts)</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on established rowing training protocols (Concept2). Consult a coach or physician for personalized training plans or if you are training for competitive events.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">The Rowing Split: Your Digital Speedometer (/500m)</a></li>
        <li><a href="#conversion">The Core Conversion: Split Time to Power (Watts)</a></li>
        <li><a href="#2k-test">The Gold Standard: Using the 2K Test to Set Training Zones</a></li>
        <li><a href="#zones">Rowing Training Zones: Split, Watts, and Stroke Rate (SPM)</a></li>
        <li><a href="#technique">Beyond the Numbers: Technique, Drag Factor, and Efficiency</a></li>
        <li><a href="#prediction">Predicting On-Water Performance and Cross-Distance Times</a></li>
        <li><a href="#improvement">Actionable Strategies to Reduce Your Split Time</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">The Rowing Split: Your Digital Speedometer (/500m)</h2>
    <p itemProp="description">In indoor rowing (ergometer training), the **Split Time** is the definitive metric for speed. It represents the estimated time it would take to cover **500 meters** at your current effort level, displayed as `mm:ss / 500m`. The **Rowing Split Calculator** is the fundamental tool that allows you to calculate your split based on a distance and total time, or—more importantly—to instantly convert your split time into your **power output in Watts**.</p>

    <p>Understanding and controlling your split is crucial because, unlike simply running faster, lowering your split time requires a disproportionate increase in power. A calculator demystifies this non-linear relationship, enabling you to train efficiently and consistently.</p>

    <h3 className="font-semibold text-foreground mt-6">Split Time vs. Total Time</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Total Time:** The cumulative duration of your workout (e.g., 7:00 for a 2,000-meter test).</li>
        <li>**Split Time:** The pace required to achieve that total time (e.g., 1:45 / 500m for a 7:00 2K).</li>
        <li>**Goal:** **A lower split time indicates a faster pace.** Coaches use split time to prescribe and monitor the intensity of every workout piece.</li>
    </ul>

    <h2 id="conversion" className="text-xl font-bold text-foreground mt-8">The Core Conversion: Split Time to Power (Watts)</h2>
    <p>The most important function of the split calculator is the conversion between split time and **Watts (W)**, which is the objective measure of the power you are generating with each stroke. This conversion uses a specific cube-root formula standardized by Concept2, the leading manufacturer of indoor rowers.</p>

    <h3 className="font-semibold text-foreground mt-6">The Concept2 Conversion Formula</h3>
    <p>This non-linear relationship reveals that every second shaved off your split requires exponentially more power:</p>
    <pre><code>Watts = 2.80 &divide; (Split Time in Seconds &divide; 500)³</code></pre>
    <p>***The key takeaway is that Watts scale linearly, while Splits scale non-linearly.*** When tracking improvement, a 20-watt increase is always a 20-watt increase, regardless of the split time, making Watts the more honest metric for coaches.</p>

    <h3 className="font-semibold text-foreground mt-6">Split-to-Watt Examples</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**2:30 Split:** $\approx$ 137 Watts (Easy Conversation Pace)</li>
        <li>**2:00 Split:** $\approx$ 203 Watts (Steady State / Aerobic Base)</li>
        <li>**1:45 Split:** $\approx$ 302 Watts (High Intensity / 2K Race Pace)</li>
        <li>**1:30 Split:** $\approx$ 442 Watts (Maximal Anaerobic Effort)</li>
    </ul>

    <h2 id="2k-test" className="text-xl font-bold text-foreground mt-8">The Gold Standard: Using the 2K Test to Set Training Zones</h2>
    <p>The **2,000-meter (2K) time trial** is the standard measure of aerobic and anaerobic capacity in rowing. Your average split time (or wattage) during this all-out, maximal effort test is used as the anchor for setting all subsequent training zones.</p>

    <h3 className="font-semibold text-foreground mt-6">The 2K Power Profile (Jensen's Model)</h3>
    <p>World-class rowing coach Kurt Jensen found specific numerical relationships between an athlete's 2K power and their potential at other distances. The calculator uses these ratios to predict performance across the training spectrum:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**6,000m Pace:** Should be maintainable at $\approx$ **85%** of 2K average Watts.</li>
        <li>**60-Minute Pace (Hour of Power):** Should be maintainable at $\approx$ **76%** of 2K average Watts.</li>
        <li>**60-Second Sprint:** Should generate $\approx$ **153%** of 2K average Watts.</li>
    </ul>

    <h2 id="zones" className="text-xl font-bold text-foreground mt-8">Rowing Training Zones: Split, Watts, and Stroke Rate (SPM)</h2>
    <p>Effective rowing training requires working at specific intensities, guided by the Split Calculator. Pacing is controlled by two key variables: **Power (Watts)** and **Stroke Rate (SPM)**.</p>

    <h3 className="font-semibold text-foreground mt-6">Key Training Zones</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Zone Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Target % of 2K Watts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Target SPM</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Physiological Goal</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Recovery (Z1)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Below 55%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">18 &ndash; 22</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Active recovery, technique work.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Steady State (Z2/Aerobic)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">60% &ndash; 75%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">20 &ndash; 24</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Build aerobic capacity, improve endurance.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Threshold (Z3)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">85% &ndash; 95%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">26 &ndash; 30</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Increase lactate tolerance, sustained speed.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Interval/Max (Z4/Z5)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">96% &ndash; 120%+</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">30 &ndash; 36+</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Peak speed, V̇O₂max, and anaerobic capacity.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h2 id="technique" className="text-xl font-bold text-foreground mt-8">Beyond the Numbers: Technique, Drag Factor, and Efficiency</h2>
    <p>No calculator can fix bad technique. In rowing, split time is a function of power, and power is maximized by proper form and equipment settings.</p>

    <h3 className="font-semibold text-foreground mt-6">Maximizing Power Output Through Form</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**The Drive Sequence:** The stroke must follow the sequence: **Legs $\rightarrow$ Body $\rightarrow$ Arms**. The legs account for up to 60% of the total power. Any breakdown (e.g., body swinging back before the legs push) limits power and increases the split time.</li>
        <li>**The Ratio:** Focus on a 1:2 ratio (Drive Time : Recovery Time). A powerful, fast drive should be followed by a controlled, slower recovery back to the catch.</li>
        <li>**Stroke Rate (SPM):** Don't use SPM to control split. Instead, focus on maximizing **force** (watts) at a controlled SPM (usually 20-24 for steady state). Only increase SPM for intervals or racing.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Drag Factor and Consistency</h3>
    <p>**Drag Factor** (often incorrectly called the "resistance setting") is crucial. It measures the resistance the flywheel provides as it slows down. Competitive rowing calls for a drag factor of roughly 110–130. Setting the damper too high (e.g., 8-10) fatigues the muscles prematurely, leading to slower overall split times. The calculator results are most accurate when training with a consistent, moderate drag factor.</p>

    <h2 id="prediction" className="text-xl font-bold text-foreground mt-8">Predicting On-Water Performance and Cross-Distance Times</h2>
    <p>Coaches use the calculator not only to set training targets but also to accurately predict an athlete's potential on the water or over different distances.</p>

    <h3 className="font-semibold text-foreground mt-6">Erg vs. On-Water Prediction</h3>
    <p>An on-water time (e.g., a 2K race in a single scull) will always be slightly slower than the erg prediction due to water drag, wind, and balancing the boat. The difference (typically 5–10 seconds added to the predicted 2K time) varies by the rower's skill and the boat type.</p>

    <h3 className="font-semibold text-foreground mt-6">Power-to-Weight Ratio (The Boat Mover)</h3>
    <p>For crew selection in lightweight boats, coaches rely on a combination of raw power and the **Power-to-Weight Ratio**. While the calculator provides raw wattage, the final determinant of boat speed is the power-to-weight ratio of the entire crew, as this dictates how much mass the collective power is moving through the water.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Prediction Insight:** Calculators allow coaches to input the erg scores and weights of multiple athletes to predict which combination moves the boat fastest.</li>
    </ul>

    <h2 id="improvement" className="text-xl font-bold text-foreground mt-8">Actionable Strategies to Reduce Your Split Time</h2>
    <p>To consistently lower your 500m split time, focus on the power generated during the drive phase of the stroke, using your training zones effectively.</p>

    <h3 className="font-semibold text-foreground mt-6">Split Reduction Tactics</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Steady State Volume:** Dedicate 60–80% of your weekly volume to **Zone 2 (Steady State)** pieces at a low SPM (20-22). This builds the aerobic base necessary to sustain fast splits without premature fatigue.</li>
        <li>**Threshold Intervals:** Incorporate **Threshold workouts** (Zone 3, at 26–30 SPM) to train your body's lactate clearing system, allowing you to sustain a faster split time for longer periods.</li>
        <li>**Power Training:** Perform short, high-force intervals (10-30 seconds all-out) to increase peak power output (Watts).</li>
        <li>**Technical Focus:** Slow down your recovery (the time sliding up the rail) to ensure you are fully compressed and ready for an explosive **leg drive** at the catch. The focus should be on a **powerful drive**, not a fast stroke rate.</li>
    </ul>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using formulas and training principles established by Concept2, the gold standard in indoor rowing, and competitive coaching models based on Watts, Split Time, and Stroke Rate.</p>
    </div>
</section>
    </div>
  );
}
