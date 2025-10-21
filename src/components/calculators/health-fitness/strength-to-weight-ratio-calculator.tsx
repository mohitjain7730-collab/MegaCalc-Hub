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
import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

const liftOptions = [
  { value: 'Back Squat', label: 'Back Squat', novice: 1.0, intermediate: 1.5, advanced: 2.0 },
  { value: 'Deadlift', label: 'Deadlift', novice: 1.25, intermediate: 1.75, advanced: 2.25 },
  { value: 'Bench Press', label: 'Bench Press', novice: 0.75, intermediate: 1.0, advanced: 1.5 },
  { value: 'Overhead Press', label: 'Overhead Press', novice: 0.5, intermediate: 0.75, advanced: 1.0 },
  { value: 'Front Squat', label: 'Front Squat', novice: 0.8, intermediate: 1.2, advanced: 1.8 },
  { value: 'Power Clean', label: 'Power Clean', novice: 0.6, intermediate: 0.9, advanced: 1.3 },
  { value: 'Pull-ups', label: 'Pull-ups (Bodyweight)', novice: 0.8, intermediate: 1.2, advanced: 1.6 },
  { value: 'Custom', label: 'Custom Lift', novice: 1.0, intermediate: 1.5, advanced: 2.0 }
];

const formSchema = z.object({ bodyWeight: z.number().positive(), liftWeight: z.number().positive(), liftName: z.string() });
type FormValues = z.infer<typeof formSchema>;

export default function StrengthToWeightRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const [selectedLift, setSelectedLift] = useState<any>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { bodyWeight: undefined, liftWeight: undefined, liftName: undefined } });

  const onSubmit = (v: FormValues) => {
    const ratio = v.liftWeight / v.bodyWeight;
    setResult(ratio);
    
    const lift = liftOptions.find(l => l.value === v.liftName);
    setSelectedLift(lift);
    
    let text = 'Solid starting point. Build progressively with good technique.';
    if (lift) {
      if (ratio < lift.novice) text = `Below novice level (${lift.novice}×). Focus on fundamentals and steady progression.`;
      else if (ratio >= lift.novice && ratio < lift.intermediate) text = `Novice level (${lift.novice}×). Good foundation - keep building strength.`;
      else if (ratio >= lift.intermediate && ratio < lift.advanced) text = `Intermediate level (${lift.intermediate}×). Strong progress - refine form and programming.`;
      else if (ratio >= lift.advanced) text = `Advanced level (${lift.advanced}×). Excellent relative strength - prioritize recovery.`;
    } else {
      if (ratio < 1) text = 'Below bodyweight. Focus on fundamentals and steady progression.';
      else if (ratio >= 1.5 && ratio < 2) text = 'Strong. Keep refining form and programming.';
      else if (ratio >= 2) text = 'Excellent relative strength. Prioritize recovery to sustain progress.';
    }
    setOpinion(text);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="liftName" render={({ field }) => (
              <FormItem>
                <FormLabel>Lift</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lift" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {liftOptions.map((lift) => (
                      <SelectItem key={lift.value} value={lift.value}>
                        {lift.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bodyWeight" render={({ field }) => (
              <FormItem><FormLabel>Body Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="liftWeight" render={({ field }) => (
              <FormItem><FormLabel>1RM for Lift (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Ratio</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Dumbbell className="h-8 w-8 text-primary" /><CardTitle>Strength-to-Weight Ratio</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-2xl font-semibold text-muted-foreground">{selectedLift?.label || 'Custom Lift'}</p>
                <p className="text-4xl font-bold">{result.toFixed(2)}× bodyweight</p>
              </div>
              <CardDescription>{opinion}</CardDescription>
              {selectedLift && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Benchmarks for {selectedLift.label}:</p>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="text-center">
                      <p className="font-medium">Novice</p>
                      <p>{selectedLift.novice}× BW</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Intermediate</p>
                      <p>{selectedLift.intermediate}× BW</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Advanced</p>
                      <p>{selectedLift.advanced}× BW</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <StwGuide />
    </div>
  );
}

export function StwGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CONFIRMED CORRECT FOR VOID ELEMENTS) */}
    <meta itemProp="name" content="Strength-to-Weight Ratio Calculator" />
    <meta itemProp="description" content="Calculate your true strength index by comparing your max lift to your body weight. Essential for powerlifting, bodybuilding, gymnastics, and climbing. Get your ratio instantly!" />
    <meta itemProp="keywords" content="strength to weight ratio calculator, relative strength calculator, bodyweight strength index, max lift to bodyweight ratio, strength level calculator, how strong am I for my weight" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/strength-to-weight-ratio-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Strength-to-Weight Ratio Calculator: Determine Your Relative Strength</h1>
    
        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">What is the Strength-to-Weight Ratio?</a></li>
        <li><a href="#how-it-works" className="hover:underline">How the Ratio Calculator Works (The Formula)</a></li>
        <li><a href="#standards" className="hover:underline">Strength-to-Weight Ratio Standards (Good vs. Elite)</a></li>
        <li><a href="#training" className="hover:underline">Programming: Using Your Ratio to Guide Training</a></li>
        <li><a href="#faq" className="hover:underline">Relative Strength Calculator FAQs</a></li>
    </ul>

    {/* SECTION 1: DEFINITION */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is the Strength-to-Weight Ratio and Why is it Critical?</h2>
    <p>The **Strength-to-Weight Ratio** (also called the Relative Strength Index) is a fitness metric that compares the maximum weight you can lift for a given exercise to your current **body weight**. It is calculated by taking your maximum lift (or your 1RM) and dividing it by your body weight.</p>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Absolute Strength vs. Relative Strength</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Absolute Strength:** The raw, maximum amount of force you can exert (e.g., squatting 400 lbs). This is what Powerlifters prioritize.</li>
        <li>**Relative Strength:** How strong you are *compared* to your body mass (e.g., squatting 2.5x your body weight). This is critical for athletes who fight gravity.</li>
    </ul>
    <p>If two people both squat 300 lbs, but one weighs 200 lbs and the other weighs 150 lbs, the lighter person has a superior Strength-to-Weight Ratio (2.0 vs. 1.5). This efficiency is vital in sports.</p>

    {/* SECTION 2: HOW THE CALCULATOR WORKS */}
    <h2 id="how-it-works" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How the Ratio Calculator Works (The Formula)</h2>
    <p>Our calculator simplifies the process by taking your max lift (or estimated 1RM) and your body weight to produce a single, comparable number. This allows you to track progress, compare yourself against strength standards, and determine if you should focus on **increasing lift weight** or **decreasing body weight**.</p>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">The Strength-to-Weight Formula</h3>
    <p>The standard formula used to calculate your simple strength index is:</p>
    <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Strength-to-Weight Ratio = Max Lift Weight / Body Weight</code></pre>
    <p>For example, a lifter weighing **180 lbs** who can bench press **270 lbs** has a ratio of **1.5** (270 / 180 = 1.5).</p>
    
    <p>The calculator often uses a more complex, adjusted formula (such as the **Wilks Score** or **DOTS Score** in powerlifting) which factors in gender and specific lift types for more accurate competition comparisons, but the core principle remains the same.</p>

    {/* SECTION 3: STANDARDS */}
    <h2 id="standards" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strength-to-Weight Ratio Standards (Good vs. Elite)</h2>
    <p>The desired ratio varies significantly by exercise. A 2.0 ratio on the squat is easier to achieve than a 2.0 ratio on the bench press. Here are general benchmarks for a healthy, trained male athlete:</p>

    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exercise</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intermediate Ratio (Good)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advanced Ratio (Excellent)</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Squat</td>
                    <td className="px-6 py-4 whitespace-nowrap">1.5 - 1.75 &times; BW</td>
                    <td className="px-6 py-4 whitespace-nowrap">2.0 - 2.5 &times; BW</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Bench Press</td>
                    <td className="px-6 py-4 whitespace-nowrap">1.0 - 1.25 &times; BW</td>
                    <td className="px-6 py-4 whitespace-nowrap">1.5 - 1.75 &times; BW</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Deadlift</td>
                    <td className="px-6 py-4 whitespace-nowrap">1.75 - 2.0 &times; BW</td>
                    <td className="px-6 py-4 whitespace-nowrap">2.5 - 3.0 &times; BW</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Overhead Press</td>
                    <td className="px-6 py-4 whitespace-nowrap">0.6 - 0.75 &times; BW</td>
                    <td className="px-6 py-4 whitespace-nowrap">0.9 - 1.0 &times; BW</td>
                </tr>
            </tbody>
        </table>
    </div>

    {/* SECTION 4: TRAINING */}
    <h2 id="training" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Programming: Using Your Ratio to Guide Training</h2>
    <p>Your ratio dictates your next training phase. If your goal is to be competitive in a weight-class sport (like wrestling or Olympic lifting) or a sport where movement against gravity is key (climbing, gymnastics), improving the ratio is more important than simply raising your max lift.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Two Pathways to a Better Ratio</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Pathway 1: Increase the Numerator (Max Lift):** Focus on pure strength training (85%+ of 1RM) while maintaining current body weight. This is the goal if you have room to gain muscle.</li>
        <li>**Pathway 2: Decrease the Denominator (Body Weight):** Focus on a mild calorie deficit to lose non-muscle mass, improving the ratio without losing max strength. This is the goal if you are moving into a lower weight class or need more relative endurance.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Specialized Applications for Relative Strength</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Bodybuilding:** The ratio is used to measure efficiency during a cutting phase—ensuring muscle mass (the strength) is preserved while fat mass (the weight) is reduced.</li>
        <li>**Gymnastics/Climbing:** This is the most crucial metric. A higher ratio directly correlates to better performance in bodyweight movements like the planche, pull-ups, and flag holds. Training focuses heavily on improving max strength without gaining unnecessary mass.</li>
    </ul>

    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Relative Strength Calculator FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Does gender affect the strength-to-weight ratio?</h3>
    <p>Yes. Due to differences in muscle mass distribution and body composition, male and female athletes typically have different strength standards and ratios. However, the calculation itself (Lift / Body Weight) remains the same. Competitive scoring systems like the Wilks or DOTS scores apply coefficients to normalize these differences.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Is a high strength-to-weight ratio always better?</h3>
    <p>Not always. While crucial for bodyweight sports, an extreme focus on a high ratio can be detrimental for athletes who benefit from absolute mass, like certain linemen in football or sumo wrestlers. It is a metric of **efficiency**, not absolute power.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How does this compare to the Wilks Score?</h3>
    <p>The Wilks Score (or DOTS Score) is an **advanced, normalized ratio** used to compare the strength of lifters of different body weights across a population (e.g., in a powerlifting meet). The simple Strength-to-Weight Ratio is a more straightforward, personal metric used to track individual progress and performance efficiency.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Always train safely and consult with a coach or medical professional before undertaking a new intense training regimen.</p>
    </div>
</section>
  );
}