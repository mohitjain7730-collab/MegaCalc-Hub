
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';

const formSchema = z.object({
  distance: z.number().positive().optional(),
  hours: z.number().nonnegative().optional(),
  minutes: z.number().nonnegative().optional(),
  seconds: z.number().nonnegative().optional(),
  paceMinutes: z.number().nonnegative().optional(),
  paceSeconds: z.number().nonnegative().optional(),
  solveFor: z.enum(['pace', 'time', 'distance']),
});

type FormValues = z.infer<typeof formSchema>;

export default function RunningPaceCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'pace',
    },
  });

  const onSubmit = (values: FormValues) => {
    const totalTimeSeconds = (values.hours || 0) * 3600 + (values.minutes || 0) * 60 + (values.seconds || 0);
    const paceSeconds = (values.paceMinutes || 0) * 60 + (values.paceSeconds || 0);

    if (values.solveFor === 'pace' && values.distance && totalTimeSeconds > 0) {
      const pacePerUnit = totalTimeSeconds / values.distance;
      const paceMins = Math.floor(pacePerUnit / 60);
      const paceSecs = Math.round(pacePerUnit % 60);
      setResult(`${paceMins}:${paceSecs.toString().padStart(2, '0')} per unit`);
    } else if (values.solveFor === 'time' && values.distance && paceSeconds > 0) {
      const totalSeconds = values.distance * paceSeconds;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.round(totalSeconds % 60);
      setResult(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else if (values.solveFor === 'distance' && totalTimeSeconds > 0 && paceSeconds > 0) {
      const distance = totalTimeSeconds / paceSeconds;
      setResult(`${distance.toFixed(2)} units`);
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
                  <option value="pace">Pace</option>
                  <option value="time">Time</option>
                  <option value="distance">Distance</option>
                </select>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>Distance</FormLabel><FormControl><Input type="number" {...field} disabled={solveFor === 'distance'} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
            <div>
              <FormLabel>Time</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name="hours" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="h" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="minutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="m" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="seconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="s" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
            <div>
              <FormLabel>Pace</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="paceMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'pace'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="paceSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="sec" {...field} disabled={solveFor === 'pace'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Timer className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div></CardHeader>
            <CardContent><p className="text-3xl font-bold text-center">{result}</p></CardContent>
        </Card>
      )}
      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Running Pace Calculator Guide: VDOT, Training Zones, and Race Strategy for 5K to Marathon" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to using a Running Pace Calculator to determine accurate training paces (Easy, Tempo, Interval), calculate VDOT score, and develop race-day pacing strategy for popular distances like 5K, 10K, Half Marathon, and Marathon." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Running Pace Calculator Guide: Mastering Race Strategy and Training Zones</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on exercise physiology and coaching principles. Always consult a healthcare professional before starting an intense new training regimen. Listen to your body and adjust paces based on fatigue and injury risk.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">Running Pace Explained: The Key to Efficiency</a></li>
        <li><a href="#pace-calc">The Core Calculations: Pace, Speed, and Time</a></li>
        <li><a href="#vdot">The VDOT System: Calculating Your Running Fitness Score</a></li>
        <li><a href="#training-zones">Setting Your Training Zones (Easy, Tempo, Interval, Repetition)</a></li>
        <li><a href="#race-strategy">Pacing for Race Day: Marathon, Half Marathon, and 5K Goals</a></li>
        <li><a href="#factors">Factors That Impact Real-World Race Pace</a></li>
        <li><a href="#improvement">Actionable Steps to Improve Your Running Pace</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">Running Pace Explained: The Key to Efficiency</h2>
    <p itemProp="description">In running, **pace** is your measure of time per unit of distance, typically expressed in **minutes per mile (min/mi)** or **minutes per kilometer (min/km)**. Unlike speed (which is distance per time, e.g., mph or kph), pace is the fundamental metric used by runners and coaches for planning, training, and competition. A **Running Pace Calculator** is the engine that converts your fitness level (usually determined by a recent race time) into precise paces tailored for every type of run you need to execute.</p>
    
    <p>Using a calculator ensures that your **easy runs** are slow enough for recovery and your **speed workouts** are fast enough to elicit physiological adaptation—a concept known as training with **intention**. This precision minimizes the risk of injury and maximizes fitness gains.</p>

    <h2 id="pace-calc" className="text-xl font-bold text-foreground mt-8">The Core Calculations: Pace, Speed, and Time</h2>
    <p>A pace calculator simplifies the inverse relationship between speed, time, and distance, allowing you to input any two variables to solve for the third.</p>

    <h3 className="font-semibold text-foreground mt-6">The Three Core Formulas</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**To Find Pace:** Pace = Total Time &divide; Distance Covered (e.g., 30 minutes for 5 km = 6:00 min/km pace)</li>
        <li>**To Find Time:** Time = Pace &times; Distance Covered (e.g., running 10 km at 5:30 min/km = 55 minutes total)</li>
        <li>**To Find Speed (Conversion):** Speed (kph) = 60 &divide; Pace (min/km) (e.g., 60 &divide; 6 min/km pace = 10 kph)</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Race Time Prediction</h3>
    <p>Advanced pace calculators can take a single recent race result (e.g., a fast 5K time) and predict a *physiologically equivalent* time for longer distances (like a Half Marathon or Marathon). This prediction is based on the assumption that you train appropriately for the longer event, accounting for the natural drop-off in sustained speed over distance.</p>

    <h2 id="vdot" className="text-xl font-bold text-foreground mt-8">The VDOT System: Calculating Your Running Fitness Score</h2>
    <p>Many reliable pace calculators base their output on the **VDOT system**, a scientifically validated concept developed by renowned coach and exercise scientist Dr. Jack Daniels. VDOT is a number (typically 30 to 85) that represents your current running fitness level—a blend of your **VO2 Max** (aerobic capacity) and your **running economy** (how efficiently you use oxygen).</p>

    <h3 className="font-semibold text-foreground mt-6">How Your VDOT Score is Determined</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Input:** The calculation relies on your **most recent, all-out race time** over a standard distance (e.g., 5K, 10K). The more recent and honest the effort, the more accurate the VDOT score will be.</li>
        <li>**Output:** The VDOT score itself is a measure of your *potential* performance. Once calculated, this single VDOT number is used to generate optimal training paces for *every* type of run, from a recovery jog to a fast interval.</li>
    </ul>

    <h2 id="training-zones" className="text-xl font-bold text-foreground mt-8">Setting Your Training Zones (Easy, Tempo, Interval, Repetition)</h2>
    <p>Effective training requires running at various intensities to elicit specific physiological adaptations. The pace calculator automatically assigns target paces (or pace ranges) for each zone based on your individual VDOT score.</p>

    <h3 className="font-semibold text-foreground mt-6">The Five VDOT Training Zones</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Zone Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Intensity / Feel</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>E (Easy) / Long</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Build aerobic base, strengthen heart, recovery.</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Conversational, sustainable (59-74% of VO2max).</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>T (Threshold) / Tempo</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Increase lactate threshold (sustained speed).</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">"Comfortably hard," sustainable for ~60 min (83-88% of VO2max).</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>I (Interval)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Boost V̇O₂max (aerobic power).</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Very hard; similar to 5K race pace (97-100% of V̇O₂max).</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>R (Repetition) / Speed</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Improve running economy and pure speed.</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Near maximal effort, short bursts with long recovery (95-100% of HRmax).</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h2 id="race-strategy" className="text-xl font-bold text-foreground mt-8">Pacing for Race Day: Marathon, Half Marathon, and 5K Goals</h2>
    <p>The primary use of the calculator for many runners is setting a realistic **race day pace**. A proper race strategy, centered on maintaining a consistent pace, prevents the common mistake of starting too fast and "bonking" later.</p>

    <h3 className="font-semibold text-foreground mt-6">The Golden Rule of Pacing</h3>
    <p>For races longer than 5K, the most successful strategy is often to run an **even split** or a slight **negative split** (running the second half slightly faster than the first). The calculator determines the constant pace required to hit your goal time:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Marathon:** Target pace should feel comfortable until mile 20. Running at approximately **80-85% of your VDOT pace**.</li>
        <li>**Half Marathon:** Target pace should feel challenging but sustainable. Running at approximately **85-90% of your VDOT pace**.</li>
        <li>**5K/10K:** Target pace is closer to your maximum sustainable effort, requiring a controlled start to ensure the final kilometers are not significantly slower than the first.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">The Quarter Method (Advanced Strategy)</h3>
    <p>This method breaks the race into four sections for optimal performance:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**1st Quarter:** **DO NOT** exceed your target average pace. Everyone feels great here, but over-pacing leads to early fatigue.</li>
        <li>**2nd Quarter:** Settle into the target average pace or slightly accelerate if feeling strong.</li>
        <li>**3rd Quarter:** Maintain pace, using mental fortitude to push through discomfort.</li>
        <li>**4th Quarter:** Focus on holding the pace until the final mile, where maximum effort is deployed.</li>
    </ul>

    <h2 id="factors" className="text-xl font-bold text-foreground mt-8">Factors That Impact Real-World Race Pace</h2>
    <p>A calculated pace is a perfect mathematical prediction for ideal conditions. In reality, several external factors require you to adjust your effort and pacing strategy:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Weather and Temperature:** Running in **heat and high humidity** requires slowing down by 10-30 seconds per mile to manage body temperature and heart rate, as the heart works harder to cool the body.</li>
        <li>**Elevation and Terrain:** Hilly courses or uneven terrain will require a slower average pace than flat roads. For hills, focus on **maintaining effort/heart rate** instead of maintaining pace.</li>
        <li>**Altitude:** Training or racing at high altitude reduces the oxygen available, necessitating a slower pace to maintain the same effort level.</li>
        <li>**Fatigue and Recovery:** If you are running on tired legs (high training fatigue), your body will be unable to hit your target pace. Adjusting the pace of easy runs is a form of active recovery.</li>
    </ul>

    <h2 id="improvement" className="text-xl font-bold text-foreground mt-8">Actionable Steps to Improve Your Running Pace</h2>
    <p>Consistent training at the precise paces generated by your calculator is the most direct path to improving your running fitness (and thus, your VDOT score).</p>

    <h3 className="font-semibold text-foreground mt-6">Key Training Principles</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Prioritize Volume:** **Long, easy runs** (Zone E) should make up the majority (60-80%) of your weekly mileage. This builds the aerobic engine and strengthens the musculoskeletal system to prevent injury.</li>
        <li>**Target Threshold:** Consistently execute **Tempo Runs** (Zone T) to elevate your lactate threshold—the speed you can sustain before fatigue sets in quickly.</li>
        <li>**Inject Intensity:** Incorporate **Interval Runs** (Zone I) once per week to directly challenge and improve your V̇O₂max.</li>
        <li>**Strength Training:** Complement running with strength work (especially for the core and glutes) to improve running economy, form stability, and reduce the risk of common overuse injuries.</li>
    </ul>
    
    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using principles from Dr. Jack Daniels' VDOT training system and extensive exercise physiology research on endurance running performance.</p>
    </div>
</section>
    </div>
  );
}
