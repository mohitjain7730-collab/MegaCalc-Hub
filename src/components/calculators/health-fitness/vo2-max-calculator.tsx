
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  age: z.number().int().positive(),
  restingHR: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Vo2MaxCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      restingHR: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, restingHR } = values;
    const mhr = 220 - age;
    const vo2max = 15.3 * (mhr / restingHR);
    setResult(vo2max);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <CardDescription>Estimate your VO₂ max based on your age and resting heart rate. This is a non-exercise based estimation.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="restingHR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resting Heart Rate (bpm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Estimate VO₂ Max</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>Estimated VO₂ Max</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(2)}</p>
                    <CardDescription>ml/kg/min</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="VO2 Max Calculator Guide: The Gold Standard for Aerobic Fitness and Training Zones" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to VO2 Max, explaining the formula (ml/kg/min), how it predicts endurance and longevity, methods to estimate your score (1.5-mile run, Rockport Walk Test), and the science of High-Intensity Interval Training (HIIT) to improve aerobic capacity." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate VO2 Max Calculator Guide: Your Engine Size for Fitness and Longevity</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on exercise physiology and sports science. VO2 Max testing involves maximum exertion; consult a physician before attempting any maximal effort test, especially if you have a pre-existing heart condition.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">What is VO2 Max? The Gold Standard Metric</a></li>
        <li><a href="#science">The Science Behind the Score: Oxygen's Journey</a></li>
        <li><a href="#measurement">Calculating Your VO2 Max: Formulas and Field Tests</a></li>
        <li><a href="#norms">Interpreting Your Score: VO2 Max Norms by Age and Sex</a></li>
        <li><a href="#longevity">VO2 Max and Longevity: A Powerful Health Predictor</a></li>
        <li><a href="#improvement">Strategies to Boost Your VO2 Max (HIIT and Intervals)</a></li>
        <li><a href="#conclusion">Keys to Maximizing Your Aerobic Capacity</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">What is VO2 Max? The Gold Standard Metric</h2>
    <p itemProp="description">**VO2 Max**, or maximal oxygen uptake, is the single best physiological measure of **cardiorespiratory fitness** and **aerobic endurance capacity**. The term represents the **maximum volume (V) of oxygen (O₂) your body can utilize per minute** during intense, maximal exercise. It is always expressed relative to body weight: **milliliters of oxygen per kilogram of body weight per minute (ml/kg/min)**.</p>

    <p>Think of your VO2 Max as the **"engine size"** of your body. A higher score means your cardiovascular system can push oxygenated blood to working muscles more efficiently, allowing you to sustain a higher intensity of effort for a longer period. While essential for elite endurance athletes (runners, cyclists, cross-country skiers), a healthy VO2 Max is also one of the most reliable predictors of general health and longevity for the entire population.</p>

    <h2 id="science" className="text-xl font-bold text-foreground mt-8">The Science Behind the Score: Oxygen's Journey</h2>
    <p>VO2 Max is not just about strong legs; it measures the efficiency of the entire oxygen transport chain, from the air you breathe to the energy produced in your cells.</p>

    <h3 className="font-semibold text-foreground mt-6">The Three Limiting Components</h3>
    <ol className="list-decimal ml-6 space-y-1">
        <li>**Pulmonary Diffusion:** The ability of the lungs to take in oxygen and diffuse it into the bloodstream.</li>
        <li>**Cardiac Output:** The heart's maximum capacity to pump oxygenated blood (**Stroke Volume x Heart Rate**). This is often the primary limiting factor for most people.</li>
        <li>**Peripheral Oxygen Extraction:** The muscle cells' ability to extract and use the oxygen from the blood via tiny cellular powerhouses called **mitochondria**.</li>
    </ol>
    <p>Training to increase your VO2 Max targets improvements in all three areas, forcing your body to become more efficient at generating the energy molecule, **ATP (Adenosine Triphosphate)**, used for muscle contraction.</p>

    <h2 id="measurement" className="text-xl font-bold text-foreground mt-8">Calculating Your VO2 Max: Formulas and Field Tests</h2>
    <p>While the definitive "gold standard" is a costly, maximal effort test in a laboratory setting (using a metabolic cart to analyze inhaled and exhaled gases), calculators rely on reliable estimation methods using standardized performance tests or heart rate data.</p>

    <h3 className="font-semibold text-foreground mt-6">Calculator-Based Estimation Methods</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**The 1.5-Mile Run/Walk Test (Cooper Test):** This involves covering 1.5 miles as fast as possible. The calculated VO2 Max is derived from the time taken and your heart rate/age, providing a highly reliable estimate of cardiovascular capacity.</li>
        <li>**The Rockport Walk Test:** Ideal for less fit or elderly individuals. It measures the time taken to walk 1 mile and the heart rate immediately afterward, factoring in age and weight.</li>
        <li>**Heart Rate Ratio (Simple Estimate):** Some calculators use non-exercise formulas based on the ratio of **Maximum Heart Rate (HRmax) to Resting Heart Rate (HRrest)**, along with factors like age, weight, and smoking status (like the algorithms developed by the Norwegian Institute of Science and Technology, NTNU).</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">The Role of Wearable Tech</h3>
    <p>Smartwatches and fitness trackers use proprietary algorithms (often based on GPS, heart rate, and running pace) to estimate VO2 Max. While convenient, these scores are approximations and should be used mainly for **tracking trends** rather than definitive measurement.</p>

    <h2 id="norms" className="text-xl font-bold text-foreground mt-8">Interpreting Your Score: VO2 Max Norms by Age and Sex</h2>
    <p>A VO2 Max score is relative. A value of 40 ml/kg/min is excellent for a 60-year-old woman but only average for a 20-year-old man. The tables below, based on national databases, provide context for the general population:</p>

    <h3 className="font-semibold text-foreground mt-6">VO2 Max Fitness Classification (ml/kg/min)</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Fitness Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Males (Ages 30&ndash;39)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Females (Ages 30&ndash;39)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Elite Endurance Athletes</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">**Excellent/Superior**</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Above 48.3</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Above 40.0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">70 &ndash; 90+</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">**Good**</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">44.0 &ndash; 48.2</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">37.0 &ndash; 40.0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">N/A</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">**Poor**</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Below 35.0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Below 30.0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">N/A</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h2 id="longevity" className="text-xl font-bold text-foreground mt-8">VO2 Max and Longevity: A Powerful Health Predictor</h2>
    <p>VO2 Max is not just a measure of athletic potential; it is a critical indicator of overall health and lifespan, often considered a stronger predictor of mortality than traditional risk factors like blood pressure or cholesterol alone.</p>

    <h3 className="font-semibold text-foreground mt-6">VO2 Max as a Clinical Marker</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**All-Cause Mortality:** Studies consistently show that the risk of dying from all causes is significantly reduced with each incremental increase in VO2 Max (often measured in METs, where 1 MET = 3.5 ml/kg/min).</li>
        <li>**Cardiovascular Disease (CVD):** A high VO2 Max reflects a healthy, efficient heart that requires fewer beats to circulate blood. It is strongly associated with a lower risk of stroke, heart attack, and heart failure.</li>
        <li>**Cognitive Health:** Better oxygen utilization and blood flow to the brain, facilitated by a high VO2 Max, are linked to improved mental clarity and reduced risk of age-related cognitive decline.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Weight Loss and Relative VO2 Max</h3>
    <p>Since the score is calculated *relative to body weight* (ml per **kilogram**), losing body fat will inherently increase your VO2 Max, even if your absolute oxygen capacity remains the same. This reinforces the principle that improving body composition is a direct path to better aerobic fitness.</p>

    <h2 id="improvement" className="text-xl font-bold text-foreground mt-8">Strategies to Boost Your VO2 Max (HIIT and Intervals)</h2>
    <p>The cardiovascular system adapts rapidly to intense stimuli. The most effective way to increase your VO2 Max involves training near or at your current maximal aerobic capacity.</p>

    <h3 className="font-semibold text-foreground mt-6">High-Intensity Interval Training (HIIT)</h3>
    <p>HIIT is the most time-efficient method for stimulating the physiological adaptations necessary for increasing VO2 Max:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**The Protocol:** Alternate between short bursts of maximal effort (90–100% of maximum heart rate) and recovery periods.</li>
        <li>**The 4x4 Minute Method:** A highly effective protocol involves four 4-minute intervals at 90–95% of HRmax, separated by 3 minutes of active recovery (70% of HRmax).</li>
        <li>**Adaptation:** This high-intensity stimulus forces the heart to increase its stroke volume (the amount of blood pumped per beat), enhancing the crucial **cardiac output** component of your VO2 Max.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Other Essential Training Methods</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Long Slow Distance (LSD):** Runs or rides at a conversational pace build the foundational **aerobic base** and mitochondrial density, allowing your muscles to use oxygen more efficiently.</li>
        <li>**Tempo/Threshold Runs:** Training at the edge of your sustainable limit (roughly 85% of VO2 Max) improves your ability to sustain a high pace, further supporting your overall aerobic capacity.</li>
        <li>**Consistency:** Regular training (3–4 cardio sessions per week) is more important than the single intensity of any one session. VO2 Max improves gradually over several months.</li>
    </ul>

    <h2 id="conclusion" className="text-xl font-bold text-foreground mt-8">Keys to Maximizing Your Aerobic Capacity</h2>
    <p>The **VO2 Max Calculator** offers a clear, objective assessment of your cardiorespiratory health. By understanding your score and targeting training efforts with high-intensity interval work, you can not only unlock peak athletic performance but also invest directly in the functional capacity of your heart and lungs, significantly reducing your long-term health risk and improving overall longevity. Use your score as a baseline, and track your progress as your engine grows stronger.</p>
    
    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using established principles of exercise physiology, referencing guidelines from the American College of Sports Medicine (ACSM), the Friendship Study (FRIEND), and extensive research on cardiorespiratory fitness and mortality risk.</p>
    </div>
</section>
    </div>
  );
}
