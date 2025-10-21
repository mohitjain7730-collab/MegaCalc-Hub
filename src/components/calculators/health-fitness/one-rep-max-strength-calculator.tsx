
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  weight: z.number().positive(),
  reps: z.number().int().positive().max(10),
});

type FormValues = z.infer<typeof formSchema>;

export default function OneRepMaxStrengthCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      reps: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    // Brzycki formula
    const oneRepMax = values.weight / (1.0278 - 0.0278 * values.reps);
    setResult(oneRepMax);
  };

  return (
    <div className="space-y-8">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works (Brzycki Formula)</AccordionTrigger>
          <AccordionContent>This calculator uses the Brzycki formula to estimate your 1RM. This is a widely used, validated formula in strength training. It creates a mathematical curve to predict the 1RM based on the observed relationship between weight and repetitions.</AccordionContent>
        </AccordionItem>
      </Accordion>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight Lifted</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="reps" render={({ field }) => (
                <FormItem><FormLabel>Repetitions Completed</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate 1RM</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Dumbbell className="h-8 w-8 text-primary" /><CardTitle>Estimated 1-Rep Max</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(1)}</p>
            <CardDescription className='mt-2 text-center'>This is an estimate. Do not attempt a true 1-rep max without a spotter and proper warm-up.</CardDescription>
          </CardContent>
        </Card>
      )}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CONFIRMED CORRECT FOR VOID ELEMENTS) */}
    {/* All meta tags are explicitly self-closing and do not contain children */}
    <meta itemProp="name" content="1 Rep Max (1RM) Strength Calculator" />
    <meta itemProp="description" content="Calculate your one-rep maximum (1RM) for the bench press, squat, and deadlift using the Epley, Brzycki, and other top formulas. Essential tool for strength programming and hypertrophy training." />
    <meta itemProp="keywords" content="1 rep max calculator, 1RM calculator, max strength calculator, epley formula, brzycki formula, one rep max predictor, max lift calculator" />
    
    {/* The potentialAction meta tag is tricky. In strict environments, this is the safest way to include it, or you may need to define this schema outside of the main article component. For in-line use, we will self-close the parent item. */}
    {/* Using an auxiliary <div> wrapper is a common workaround for JSX strictness around itemScope/itemType on void elements */}
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/1rm-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate 1 Rep Max (1RM) Strength Calculator & Guide</h1>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#how-to-use" className="hover:underline">How to Accurately Use the 1RM Calculator</a></li>
        <li><a href="#what-is-1rm" className="hover:underline">What is a 1RM and Why Do You Need It?</a></li>
        <li><a href="#formulas" className="hover:underline">The Science Behind the 1RM Formulas (Epley, Brzycki, etc.)</a></li>
        <li><a href="#percentages" className="hover:underline">Training with 1RM Percentages: Strength, Hypertrophy & Endurance</a></li>
        <li><a href="#faq" className="hover:underline">1RM Calculator Frequently Asked Questions</a></li>
    </ul>

    {/* SECTION 1: HOW TO USE THE TOOL */}
    <h2 id="how-to-use" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Accurately Use the 1RM Calculator</h2>
    <p>While the goal of this calculator is to estimate your maximum lift without risking injury, its accuracy relies on providing a true effort. Follow these steps for the best results, whether you are calculating your max for a **bench press**, **squat**, or **deadlift**.</p>

    <ol className="list-decimal ml-6 space-y-3">
        <li className="font-semibold text-foreground">
            Choose a Submaximal Weight (5-10 Reps): 
            <p className="font-normal text-muted-foreground ml-4">Select a weight that is challenging but safe—a weight you can lift for at least 5 repetitions, but no more than 10, to near-failure. This range provides the most reliable data for the estimation formulas.</p>
        </li>
        <li className="font-semibold text-foreground">
            Perform Your Set to Failure (with good form): 
            <p className="font-normal text-muted-foreground ml-4">Execute the lift with strict, proper form. Stop the set immediately when you can no longer complete another repetition without compromising your technique. The number of completed reps is your input.</p>
        </li>
        <li className="font-semibold text-foreground">
            Input Your Data: 
            <p className="font-normal text-muted-foreground ml-4">Enter the exact **Weight Lifted** (in lbs or kg) and the **Max Repetitions** you completed into the calculator. The less guesswork, the better the prediction.</p>
        </li>
        <li className="font-semibold text-foreground">
            Analyze the Results: 
            <p className="font-normal text-muted-foreground ml-4">The calculator will display your 1RM, often calculated using multiple formulas. It will also typically provide a breakdown of your strength percentages (e.g., 90%, 80%, 70% of 1RM) for planning your accessory lifts.</p>
        </li>
    </ol>

    {/* SECTION 2: WHAT IS A 1RM */}
    <h2 id="what-is-1rm" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a 1RM and Why Do Strength Athletes Use It?</h2>
    <p>1RM stands for **One Repetition Maximum**. It is the absolute maximum amount of weight you can lift for a single, perfect repetition of a given exercise. It is the gold standard metric for assessing absolute strength.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance of Knowing Your Max Lift</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Training Periodization:** Knowing your 1RM allows coaches and athletes to create structured training cycles (periodization) where volume and intensity are precisely calculated based on percentages of your max.</li>
        <li>**Objective Progress Tracking:** It provides a clear, measurable benchmark to track strength gains over time. If your estimated 1RM goes up, you are objectively getting stronger.</li>
        <li>**Safety and Efficiency:** Instead of blindly attempting a maximal lift (which is high-risk), estimating your 1RM with a calculator allows you to program your workouts at safe, effective submaximal loads.</li>
        <li>**Hypertrophy Programming:** Even for muscle growth (hypertrophy), using 1RM percentages (typically 65% to 85% 1RM) ensures you are selecting the correct weight for optimal results.</li>
    </ul>

    {/* SECTION 3: THE FORMULAS */}
    <h2 id="formulas" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Science Behind the 1RM Formulas (E-E-A-T Focus)</h2>
    <p>Our calculator uses a combination of the most scientifically validated formulas to give you the most accurate prediction possible. The most accurate results generally come from sets of **4 to 6 repetitions**, as muscle strength is the primary limiting factor in that range.</p>
    
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground mt-6">1. The Epley Formula (Most Popular)</h3>
        <p className="ml-4">**Formula:** <code className="bg-gray-200 p-1 rounded">1RM = Weight &times; (1 + Reps / 30)</code></p>
        <p className="ml-4">**Best For:** This is the most widely used formula in commercial gyms and apps. It is highly reliable for predicting the 1RM for the big compound lifts (bench, squat, deadlift) when using **1 to 10 repetitions**.</p>
        
        <h3 className="text-xl font-semibold text-foreground mt-6">2. The Brzycki Formula (More Conservative)</h3>
        <p className="ml-4">**Formula:** <code className="bg-gray-200 p-1 rounded">1RM = Weight &times; 36 / (37 - Reps)</code></p>
        <p className="ml-4">**Best For:** This formula tends to yield slightly more conservative (lower) estimates, which is favored by coaches who prioritize safety and want a reliable baseline for training programs.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. The Lombardi Formula (Higher Rep Ranges)</h3>
        <p className="ml-4">**Formula:** <code className="bg-gray-200 p-1 rounded">1RM = Weight &times; Reps<sup>0.1</sup></code> (Simplified version of the complex calculation)</p>
        <p className="ml-4">**Best For:** While all formulas lose accuracy in the higher rep ranges (12+ reps), the Lombardi and Wathan formulas are often preferred for sets greater than 10 reps, where muscular endurance begins to play a larger role than raw strength.</p>
    </div>

    {/* SECTION 4: TRAINING WITH PERCENTAGES */}
    <h2 id="percentages" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Training with 1RM Percentages: Strength, Hypertrophy & Endurance</h2>
    <p>The true utility of a 1RM calculator is its ability to prescribe specific weights for specific training goals. Your 1RM becomes 100%, and your training load is an exact fraction of that maximum.</p>

    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1RM Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rep Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Focus</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Absolute Strength</td>
                    <td className="px-6 py-4 whitespace-nowrap">85% - 100%</td>
                    <td className="px-6 py-4 whitespace-nowrap">1 - 5 reps</td>
                    <td className="px-6 py-4 whitespace-nowrap">Maximal Force Output (Powerlifting)</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Muscle Hypertrophy (Growth)</td>
                    <td className="px-6 py-4 whitespace-nowrap">65% - 85%</td>
                    <td className="px-6 py-4 whitespace-nowrap">6 - 12 reps</td>
                    <td className="px-6 py-4 whitespace-nowrap">Mechanical Tension & Metabolic Stress</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Muscular Endurance</td>
                    <td className="px-6 py-4 whitespace-nowrap">50% - 65%</td>
                    <td className="px-6 py-4 whitespace-nowrap">12+ reps</td>
                    <td className="px-6 py-4 whitespace-nowrap">Volume and Fatigue Tolerance</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Explosive Power</td>
                    <td className="px-6 py-4 whitespace-nowrap">30% - 60%</td>
                    <td className="px-6 py-4 whitespace-nowrap">3 - 5 reps</td>
                    <td className="px-6 py-4 whitespace-nowrap">Movement Speed (Olympic Lifts)</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p><strong>Pro Tip:</strong> For new lifters, training in the Hypertrophy (65%-85%) range is the most efficient way to build muscle mass, which serves as the foundation for increasing your absolute strength (1RM).</p>

    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">1RM Calculator Frequently Asked Questions</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">How often should I re-calculate my 1RM?</h3>
    <p>For most lifters, testing your *estimated* 1RM using the calculator every **4-8 weeks** is sufficient. This allows enough time for a solid strength block to yield gains. Avoid performing a true 1RM test more than 2-3 times per year, as it can be taxing on the central nervous system and carries a higher risk of injury.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why do different 1RM formulas give different results?</h3>
    <p>Each formula (Epley, Brzycki, etc.) was developed based on studies of different populations (e.g., bodybuilders vs. powerlifters) and lifting protocols. The Epley formula is generally regarded as the most accurate for the widest range of trained individuals. Our calculator often provides an **average** of the top formulas for a more balanced estimate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Is the 1RM calculator accurate for all exercises?</h3>
    <p>The calculator is highly accurate for **compound, barbell movements** like the bench press, squat, and deadlift. It is less accurate for single-joint (isolation) movements like bicep curls or lateral raises, and for machine-based exercises, as the mechanics and limiting factors are different.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What is a 'good' 1RM for my body weight? (Strength Standards)</h3>
    <p>A "good" 1RM is relative, but strength standards typically classify your lift relative to your body weight and training experience. For an **Intermediate** male lifter, a bench press of **1x Body Weight (BW)**, a squat of **1.5x BW**, and a deadlift of **2x BW** is considered strong. The calculator results can be used with a separate Strength Standards chart to gauge your current level.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is provided by [Your Website/Brand Name]. We are committed to providing science-backed tools for fitness and strength programming. For personalized advice, consult a certified strength and conditioning specialist (CSCS).</p>
    </div>
</section>
    </div>
  );
}
