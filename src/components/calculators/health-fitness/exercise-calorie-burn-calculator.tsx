'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import Link from 'next/link';

const metMap: Record<string, number> = {
  'Walking (5 km/h)': 3.3,
  'Jogging (8 km/h)': 7.0,
  'Running (10 km/h)': 10,
  'Cycling (moderate)': 7.5,
  'Rowing (vigorous)': 8.5,
  'Strength Training': 6.0,
};

const formSchema = z.object({ activity: z.string(), weightKg: z.number().positive(), minutes: z.number().positive() });
type FormValues = z.infer<typeof formSchema>;

export default function ExerciseCalorieBurnCalculator() {
  const [kcals, setKcals] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { activity: undefined as unknown as string, weightKg: undefined, minutes: undefined } });

  const onSubmit = (v: FormValues) => {
    const met = metMap[v.activity] ?? 6;
    const kcal = (met * 3.5 * v.weightKg * v.minutes) / 200; // standard MET formula
    setKcals(Math.round(kcal));
    setOpinion('Use nutrition and recovery to match training load; avoid relying solely on exercise calories for weight control.');
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="activity" render={({ field }) => (
              <FormItem><FormLabel>Activity</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.keys(metMap).map(k => (<SelectItem key={k} value={k}>{k}</SelectItem>))}</SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="weightKg" render={({ field }) => (
              <FormItem><FormLabel>Body Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="minutes" render={({ field }) => (
              <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Calories Burned</Button>
        </form>
      </Form>

      {kcals !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Flame className="h-8 w-8 text-primary" /><CardTitle>Estimated Calories Burned</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{kcals.toLocaleString()} kcal</p>
              <CardDescription>{opinion}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <KcalGuide />
    </div>
  );
}

function KcalGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CORRECTED VOID ELEMENTS) */}
    <meta itemProp="name" content="Exercise Calorie Burn Calculator by Activity (METs)" />
    <meta itemProp="description" content="Calculate exactly how many calories you burn during specific activities—from running and cycling to weightlifting and housework. Based on scientific METs (Metabolic Equivalents) data." />
    <meta itemProp="keywords" content="calories burned calculator, exercise calorie counter, METs calculator, metabolic equivalent of task, calories burned by activity type, running calorie burn, weightlifting calorie burn" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/exercise-calorie-burn-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Exercise Calorie Burn Calculator: The Scientific METs Tool</h1>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#mets-science" className="hover:underline">The Science of Calorie Burn: What are METs?</a></li>
        <li><a href="#formula-breakdown" className="hover:underline">The Calorie Burn Formula Explained</a></li>
        <li><a href="#activity-levels" className="hover:underline">METs by Activity Level (Light, Moderate, Vigorous)</a></li>
        <li><a href="#weight-management" className="hover:underline">Linking Calorie Burn to Weight Management</a></li>
        <li><a href="#faq" className="hover:underline">Calorie Burn Calculator FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: METS SCIENCE */}
    <h2 id="mets-science" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Science of Calorie Burn: What are METs?</h2>
    <p>Calorie expenditure is not just a guess—it's calculated using a physiological metric called **METs (Metabolic Equivalents)**. This calculator relies on the international standard set by the **Compendium of Physical Activities**, which assigns a precise MET value to nearly every activity imaginable, from running to raking leaves.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Defining the Metabolic Equivalent of Task (MET)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**1 MET** represents the energy your body expends while **sitting quietly at rest**.</li>
        <li>**4 METs** means an activity requires **four times** the energy expenditure of rest.</li>
    </ul>
    <p>Using MET values ensures the calculation is standardized and accounts for two critical variables: **your body weight** (more mass requires more energy) and the **intensity of the activity**.</p>

<hr />
    {/* SECTION 2: FORMULA BREAKDOWN */}
    <h2 id="formula-breakdown" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Calorie Burn Formula Explained</h2>
    <p>The calculation is based on the relationship between oxygen consumption and energy expenditure. While the calculator does the heavy lifting, understanding the formula demonstrates the precision behind the result:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calorie Burn Formula:</h3>
    <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Calories Burned (per minute) = [ (METs &times; 3.5 &times; Weight in kg) &divide; 200 ]</code></pre>

    <ul className="list-disc ml-6 space-y-2">
        <li>**METs:** The intensity rating of the chosen activity (e.g., Running at 6 mph is ~9.8 METs).</li>
        <li>**3.5:** A constant representing the milliliters of oxygen consumed per kilogram of body weight per minute at rest.</li>
        <li>**Weight in kg:** Your personal mass, which proportionally scales the energy cost.</li>
    </ul>
    <p>This formula then gives you the calorie burn per minute, which is multiplied by your total duration to yield your final estimate.</p>

<hr />
    {/* SECTION 3: ACTIVITY LEVELS */}
    <h2 id="activity-levels" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">METs by Activity Level (Light, Moderate, Vigorous)</h2>
    <p>Activities are scientifically grouped by their energy cost. This helps you balance your workout plan according to current fitness guidelines (ACSM):</p>

    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intensity Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MET Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examples</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Light</td>
                    <td className="px-6 py-4 whitespace-nowrap">1.6 - 2.9 METs</td>
                    <td className="px-6 py-4 whitespace-nowrap">Slow walking, light housework, hatha yoga.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Moderate</td>
                    <td className="px-6 py-4 whitespace-nowrap">3.0 - 5.9 METs</td>
                    <td className="px-6 py-4 whitespace-nowrap">Brisk walking (3.5 mph), recreational cycling, general weightlifting.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Vigorous</td>
                    <td className="px-6 py-4 whitespace-nowrap">6.0+ METs</td>
                    <td className="px-6 py-4 whitespace-nowrap">Running, competitive swimming, circuit training, singles tennis.</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p>Focusing on moderate and vigorous activities (3+ METs) is crucial for achieving significant cardiovascular and weight loss benefits.</p>

<hr />
    {/* SECTION 4: WEIGHT MANAGEMENT */}
    <h2 id="weight-management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Linking Calorie Burn to Weight Management</h2>
    <p>The Calorie Burn Calculator is your control panel for creating the energy deficit required for fat loss. To lose approximately **1 pound of body fat**, you must create a total deficit of about **3,500 calories**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Creating a Sustainable Calorie Deficit</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Combine Diet and Exercise:** The safest way to achieve the 3,500-calorie deficit is by combining a moderate reduction in caloric intake with a consistent increase in caloric expenditure via exercise.</li>
        <li>**Don't Overestimate:** Calculator results should be considered estimates. Do not use the figure to immediately justify eating back every calorie burned. Focus on tracking the net deficit over a full week for the most accurate measure of progress.</li>
        <li>**NEAT (Non-Exercise Activity Thermogenesis):** Remember that non-workout movement (standing, cleaning, fidgeting) contributes significantly to your total daily expenditure. Increasing low-level activity outside the gym is a highly effective way to increase your calorie burn.</li>
    </ul>

<hr />
    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calorie Burn Calculator FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why does the treadmill show a different number than this calculator?</h3>
    <p>Treadmills and other cardio machines often provide a generalized, less personalized estimate of calorie burn. They typically rely on a single, fixed weight (e.g., 150 lbs) and do not account for individual fitness level, muscle mass, or specific movement patterns. This calculator, based on **METs and your actual body weight**, provides a more personalized and usually more conservative figure.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Does weightlifting burn more calories than running?</h3>
    <p>In a direct comparison of time spent, high-intensity running (10+ METs) will generally burn more calories per minute than typical weight training (3-6 METs). However, weightlifting builds **muscle mass**, which raises your **Basal Metabolic Rate (BMR)**. Thus, weightlifting increases your calorie burn 24/7, even at rest, making it crucial for long-term weight management.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How accurate are the MET values?</h3>
    <p>MET values are highly reliable average scores derived from metabolic lab tests across large groups of people. While individual variations exist due to genetics and efficiency, they are the **gold standard** for non-laboratory estimates and provide an excellent basis for comparing the energy demands of various activities.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Use it to accurately track your energy expenditure and keep your fitness journey on target.</p>
    </div>
</section>
  );
}