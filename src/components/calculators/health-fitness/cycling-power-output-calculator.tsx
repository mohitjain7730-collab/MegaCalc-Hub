
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  riderWeight: z.number().positive(),
  bikeWeight: z.number().positive(),
  speed: z.number().positive(),
  gradient: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CyclingPowerOutputCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riderWeight: undefined,
      bikeWeight: undefined,
      speed: undefined,
      gradient: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { riderWeight, bikeWeight, speed, gradient } = values;
    const speedMps = speed / 3.6;
    const totalWeight = riderWeight + bikeWeight;
    const crr = 0.005; // Coefficient of rolling resistance
    const cdA = 0.388; // Drag area
    const airDensity = 1.225;

    const pRoll = 9.81 * totalWeight * crr * speedMps;
    const pGrav = 9.81 * totalWeight * (gradient / 100) * speedMps;
    const pDrag = 0.5 * cdA * airDensity * Math.pow(speedMps, 3);
    
    const totalPower = pRoll + pGrav + pDrag;
    setResult(totalPower);
  };

  return (
    <div className="space-y-8">
      <Alert variant="destructive">
        <AlertTitle>For Estimation Only</AlertTitle>
        <AlertDescription>This is a rough estimation. Factors like wind, road surface, and riding position significantly affect real-world power. For accurate measurement, a power meter is required.</AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="riderWeight" render={({ field }) => (<FormItem><FormLabel>Rider Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bikeWeight" render={({ field }) => (<FormItem><FormLabel>Bike Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="speed" render={({ field }) => (<FormItem><FormLabel>Cycling Speed (km/h)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="gradient" render={({ field }) => (<FormItem><FormLabel>Road Gradient (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Estimate Power</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>Estimated Power Output</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-center">{result.toFixed(0)} Watts</p></CardContent>
        </Card>
      )}
      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Cycling Power Output Calculator Guide: Mastering FTP, W/kg, and Training Zones in Watts" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to calculating cycling power output (Watts), determining Functional Threshold Power (FTP), interpreting Power-to-Weight Ratio (W/kg) for climbing, and using power zones for structured training and race pacing." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Cycling Power Output (Watts) Calculator Guide: Mastering FTP and W/kg</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on exercise physiology and sports coaching protocols. Maximal power testing (like the 20-minute FTP test) is strenuous; consult a physician before undertaking any maximal effort assessment.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">Power Explained: Watts as the Objective Metric</a></li>
        <li><a href="#ftp">Functional Threshold Power (FTP): The Cornerstone of Training</a></li>
        <li><a href="#wkg">Power-to-Weight Ratio (W/kg): The Key to Climbing</a></li>
        <li><a href="#zones">Coggan's Power Zones: Structuring Your Training</a></li>
        <li><a href="#calculation">Calculator Methodology: Overcoming Real-World Resistances</a></li>
        <li><a href="#improvement">Actionable Strategies to Increase Your Cycling Power</a></li>
        <li><a href="#elite-norms">Elite Performance Norms and Categorization</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">Power Explained: Watts as the Objective Metric</h2>
    <p itemProp="description">In cycling, **power output**, measured in **Watts (W)**, is the objective rate at which you do work. Unlike metrics such as speed (affected by wind and hills) or heart rate (affected by fatigue and hydration), power is an absolute measure of force and effort. The **Cycling Power Output Calculator** is designed to quantify a rider's fitness, either by calculating their raw power in real-time or by estimating their **Functional Threshold Power (FTP)** from performance data.</p>

    <p>Training with power allows cyclists to precisely measure physiological stress, track fitness improvements, and execute scientifically tailored workouts—making it indispensable for amateur and professional athletes alike.</p>

    <h3 className="font-semibold text-foreground mt-6">Power vs. Speed and Heart Rate</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Power (Watts):** The instantaneous, objective measure of force on the pedals. It provides immediate, consistent feedback regardless of external conditions.</li>
        <li>**Speed:** Highly variable; affected by aerodynamics, incline (gravity), and wind resistance.</li>
        <li>**Heart Rate:** Lagging indicator; takes time to rise and is affected by caffeine, heat, and stress.</li>
    </ul>

    <h2 id="ftp" className="text-xl font-bold text-foreground mt-8">Functional Threshold Power (FTP): The Cornerstone of Training</h2>
    <p>**Functional Threshold Power (FTP)** is the single most important metric in power-based training. It is defined as the highest average power output you can sustain for approximately **one hour** in a quasi-steady state.</p>

    <h3 className="font-semibold text-foreground mt-6">Estimating FTP (The 20-Minute Test Protocol)</h3>
    <p>Since sustaining a maximal effort for a full hour is difficult in the field, FTP is most commonly estimated using a shorter maximal effort test. The calculator often bases its result on the 20-Minute Test protocol:</p>
    <pre><code>FTP = Average Power of a 20-Minute All-Out Effort &times; 0.95</code></pre>
    <p>This 95% scaling factor accounts for the difference between a maximal 20-minute effort and the maximal power sustainable for a full 60 minutes.</p>

    <h3 className="font-semibold text-foreground mt-6">FTP and Lactate Threshold</h3>
    <p>Physiologically, FTP closely correlates with your **Maximal Lactate Steady State (MLSS)**—the highest intensity at which the body can clear lactate from the bloodstream as fast as it produces it. Training *at* or *near* FTP is the most effective way to raise your aerobic power ceiling.</p>

    <h2 id="wkg" className="text-xl font-bold text-foreground mt-8">Power-to-Weight Ratio (W/kg): The Key to Climbing</h2>
    <p>**Power-to-Weight Ratio (W/kg)** is the metric that determines a cyclist's ability to overcome gravity, making it the most crucial figure for **climbing performance**. It is calculated by dividing your sustainable power (FTP) by your mass (rider weight + bike weight).</p>

    <h3 className="font-semibold text-foreground mt-6">The W/kg Formula</h3>
    <pre><code>W/kg = FTP (Watts) &divide; Rider Weight (kg)</code></pre>

    <h3 className="font-semibold text-foreground mt-6">W/kg vs. Absolute Power</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Climbing:** W/kg is king. A lighter rider with a lower absolute FTP may be significantly faster uphill than a heavier rider with a higher absolute FTP if the lighter rider's W/kg is superior.</li>
        <li>**Flat/Time Trials:** Absolute power (raw Watts) and **aerodynamics** become far more important. At high speeds, up to 90% of a cyclist's power is spent overcoming wind resistance (drag).</li>
    </ul>
    <p>Coaches generally advise athletes to prioritize **increasing FTP** first, followed by controlled efforts to optimize the W/kg ratio for specific competitive demands.</p>

    <h2 id="zones" className="text-xl font-bold text-foreground mt-8">Coggan's Power Zones: Structuring Your Training</h2>
    <p>Once your FTP is established, the calculator uses the well-known **Coggan Power Zones** to define seven distinct training intensities, ensuring every minute spent on the bike is intentional and targets a specific physiological outcome.</p>

    <h3 className="font-semibold text-foreground mt-6">Key Power Zones and Their Purpose (Relative to FTP)</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Zone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Intensity (% of FTP)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Physiological Goal</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Z2: Endurance</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">56% – 75%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Build aerobic base, fat oxidation, mitochondrial density.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Z3/Sweet Spot</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">88% – 94%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Optimal mix of endurance and threshold building (high benefit, lower fatigue).</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Z4: Threshold</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">95% – 105%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Directly raises the FTP ceiling (Maximal Lactate Steady State).</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Z5: V̇O₂ Max</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">106% – 120%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Increases maximum aerobic power (oxygen utilization).</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h2 id="calculation" className="text-xl font-bold text-foreground mt-8">Calculator Methodology: Overcoming Real-World Resistances</h2>
    <p>Advanced power calculators (especially those predicting speed on a virtual course) do not rely solely on W/kg. They incorporate physics-based formulas that account for the resistive forces a cyclist must overcome:</p>

    <h3 className="font-semibold text-foreground mt-6">The Three Resistive Forces</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Gravity (Grade Resistance):** The power required to move the mass (rider + bike) vertically. This is dominant on climbs and is where **W/kg** is paramount.</li>
        <li>**Aerodynamic Drag (Air Resistance):** The power required to push through the air. This increases exponentially with speed and is the dominant force on flat roads. Aerodynamics and body position are critical here.</li>
        <li>**Rolling Resistance:** The friction between the tires and the road surface. This is proportional to total system weight but is generally the smallest factor.</li>
    </ul>
    <p>A calculator may reverse-engineer a raw power output based on rider characteristics, course gradient, speed, and total system weight (rider + bike) to estimate the total Watts produced during a ride without a power meter.</p>

    <h2 id="improvement" className="text-xl font-bold text-foreground mt-8">Actionable Strategies to Increase Your Cycling Power</h2>
    <p>Improving your power output involves consistent, structured training that targets specific power zones, making the calculator the blueprint for your efforts.</p>

    <h3 className="font-semibold text-foreground mt-6">Training for Peak FTP and W/kg</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Sweet Spot/Threshold Work:** Dedicate 1-2 weekly sessions to Zone 3 and Zone 4 intervals. These **Threshold workouts** provide the greatest return on time investment for increasing FTP.</li>
        <li>**V̇O₂ Max Intervals:** Use **Zone 5 intervals** (3–8 minutes at 106–120% of FTP) to raise your V̇O₂ Max, increasing the ceiling of your aerobic power.</li>
        <li>**Off-Bike Strength Training:** Incorporate heavy, sport-specific strength training (squats, lunges, deadlifts) to improve muscular force production and cycling efficiency. This maximizes the **"Watts"** side of the W/kg ratio while preserving lean mass.</li>
        <li>**Fuel Properly:** Ensure high carbohydrate intake to maintain muscle **glycogen stores**, which are essential for fueling high-intensity Zone 4 and Zone 5 efforts.</li>
    </ul>

    <h2 id="elite-norms" className="text-xl font-bold text-foreground mt-8">Elite Performance Norms and Categorization</h2>
    <p>Comparing your W/kg score to established power profiles helps set realistic goals and identify your cycling category (often used in virtual racing platforms like Zwift or local amateur competitions).</p>

    <h3 className="font-semibold text-foreground mt-6">FTP Power-to-Weight Norms (W/kg)</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Rider Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Males (FTP W/kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Females (FTP W/kg)</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Novice / Beginner</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Below 2.5</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Below 2.1</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Intermediate / Cat 3</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">3.5 &ndash; 4.1</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">3.0 &ndash; 3.5</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Advanced / Cat 1/2</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">4.7 &ndash; 5.3</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">4.1 &ndash; 4.6</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Professional / World Class</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">5.8+</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">5.1+</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using principles from Dr. Andrew Coggan's Power Training Zones, the Functional Threshold Power (FTP) testing protocol, and established power profile norms in exercise physiology.</p>
    </div>
</section>
    </div>
  );
}
