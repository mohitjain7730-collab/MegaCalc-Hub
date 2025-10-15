
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().int(),
  restingHR: z.number().positive().int().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
    maxHR: number;
    moderateZone: { min: number, max: number };
    vigorousZone: { min: number, max: number };
    method: 'Basic' | 'Karvonen';
}

export default function TargetHeartRateCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      restingHR: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, restingHR } = values;
    const maxHR = 220 - age;
    
    if (restingHR) {
        // Karvonen Method
        const hrr = maxHR - restingHR;
        setResult({
            maxHR,
            moderateZone: {
                min: Math.round(hrr * 0.50) + restingHR,
                max: Math.round(hrr * 0.70) + restingHR,
            },
            vigorousZone: {
                min: Math.round(hrr * 0.70) + restingHR,
                max: Math.round(hrr * 0.85) + restingHR,
            },
            method: 'Karvonen',
        });
    } else {
        // Basic Method
        setResult({
            maxHR,
            moderateZone: {
                min: Math.round(maxHR * 0.50),
                max: Math.round(maxHR * 0.70),
            },
            vigorousZone: {
                min: Math.round(maxHR * 0.70),
                max: Math.round(maxHR * 0.85),
            },
            method: 'Basic',
        });
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="restingHR" render={({ field }) => (
                <FormItem><FormLabel>Resting Heart Rate (optional)</FormLabel><FormControl><Input type="number" placeholder='e.g., 65' {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Zones</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><HeartPulse className="h-8 w-8 text-primary" /><CardTitle>Your Target Heart Rate Zones</CardTitle></div>
            <CardDescription className='px-6'>Based on the {result.method} method. Max heart rate is {result.maxHR} bpm.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-muted">
                        <CardHeader>
                            <CardTitle>Moderate Intensity</CardTitle>
                            <CardDescription>50-70% of max HR</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{result.moderateZone.min} - {result.moderateZone.max} bpm</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-muted">
                        <CardHeader>
                            <CardTitle>Vigorous Intensity</CardTitle>
                            <CardDescription>70-85% of max HR</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{result.vigorousZone.min} - {result.vigorousZone.max} bpm</p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
      )}
      <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Target Heart Rate Calculator – Find Your Ideal Heart Rate Zones for Fat Burning, Endurance, and Performance"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Calculate your personalized target heart rate zones to optimize workouts, improve endurance, maximize fat burn, and prevent overtraining. Learn the science behind heart rate training, recovery, and safe exercise intensity."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Target Heart Rate Calculator: Train Smarter, Not Harder
  </h2>
  <p itemProp="description">
    Your <strong>target heart rate (THR)</strong> is the secret to training efficiently. It shows how hard your heart
    should work during exercise to achieve your fitness goals — whether that’s burning fat, building endurance, or
    improving cardiovascular strength. This guide helps you understand your target zones, how to calculate them, and how
    to use them effectively in your workouts.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    💡 What Is Target Heart Rate?
  </h3>
  <p>
    The <strong>target heart rate</strong> represents the ideal range of beats per minute (bpm) your heart should reach
    during exercise for optimal results. Training within these zones ensures that your cardiovascular system and muscles
    are challenged enough to improve but not so much that they become overstressed. Each heart rate zone corresponds to
    a different intensity level and energy system in the body.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    ⚙️ The Target Heart Rate Formula
  </h3>
  <p>
    The most common way to calculate your maximum heart rate (MHR) is using the formula:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Maximum Heart Rate (MHR) = 220 − age</strong></li>
    <li>Your <strong>Target Heart Rate</strong> is a percentage of this MHR, depending on your goal and workout intensity.</li>
  </ul>
  <p>
    For example, a 30-year-old has an MHR of 190 bpm. Their 70–80% training zone would be between 133 and 152 bpm.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    🧠 Understanding Heart Rate Zones
  </h3>
  <p>
    The concept of heart rate zones helps you structure your workouts by intensity. Each zone affects your body
    differently — from recovery and fat burning to speed and endurance.
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Zone 1 (50–60% MHR):</strong> Low-intensity, suitable for warm-ups, recovery, and beginners starting their
      fitness journey.
    </li>
    <li>
      <strong>Zone 2 (60–70% MHR):</strong> Often called the <em>fat-burning zone</em>. Your body primarily uses stored
      fat for energy while improving basic aerobic capacity.
    </li>
    <li>
      <strong>Zone 3 (70–80% MHR):</strong> The aerobic zone — builds endurance and cardiovascular efficiency. Ideal for
      steady-state cardio and long-distance training.
    </li>
    <li>
      <strong>Zone 4 (80–90% MHR):</strong> Anaerobic zone — enhances performance, power, and lactate threshold. Used in
      high-intensity interval training (HIIT).
    </li>
    <li>
      <strong>Zone 5 (90–100% MHR):</strong> Maximum effort — short bursts of all-out performance, improving VO₂ max and
      peak conditioning.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    🎯 Why Knowing Your Target Heart Rate Matters
  </h3>
  <p>
    Training with heart rate awareness helps you make workouts safer and more effective. Without it, you may undertrain
    and see limited results — or overtrain and risk injury or fatigue. Understanding your target zones helps you:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>Burn fat more efficiently by maintaining optimal cardio intensity.</li>
    <li>Improve cardiovascular endurance with consistent aerobic training.</li>
    <li>Track progress using measurable data instead of “perceived effort.”</li>
    <li>Recover faster by balancing effort and rest based on heart rate feedback.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    🩺 How to Measure Your Heart Rate
  </h3>
  <p>There are several ways to monitor your heart rate accurately during workouts:</p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Fitness trackers and smartwatches:</strong> Devices like Apple Watch, Fitbit, and Garmin provide real-time
      heart rate monitoring.
    </li>
    <li>
      <strong>Chest straps:</strong> Offer the most precise readings for athletes and HIIT sessions.
    </li>
    <li>
      <strong>Manual check:</strong> Find your pulse on your wrist or neck, count beats for 15 seconds, and multiply by
      4 to estimate bpm.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    💪 Training Examples by Goal
  </h3>
  <p>Use these examples to plan workouts based on your specific goal:</p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Fat Loss:</strong> 60–70% MHR (Zone 2) for 40–60 minutes. Ideal for walking, cycling, or light jogging.
    </li>
    <li>
      <strong>Endurance:</strong> 70–80% MHR (Zone 3) for 30–90 minutes. Great for long runs or moderate-intensity
      cardio.
    </li>
    <li>
      <strong>Performance & Speed:</strong> 80–90% MHR (Zone 4). Best for HIIT, sprints, or competitive training.
    </li>
    <li>
      <strong>Recovery:</strong> 50–60% MHR (Zone 1). Gentle movement such as walking, stretching, or yoga.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    📈 Integrating Heart Rate with Other Metrics
  </h3>
  <p>
    For complete fitness tracking, combine heart rate data with other metrics such as calories burned, perceived
    exertion, and recovery status. Over time, you’ll notice your resting heart rate decreasing — a sign of improved
    cardiovascular health.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    🧩 Tips to Improve Heart Rate Efficiency
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Warm up for 5–10 minutes to gradually raise your heart rate before intense exercise.</li>
    <li>Incorporate interval training to boost endurance and fat oxidation.</li>
    <li>Stay hydrated and maintain electrolyte balance for stable heart rhythm.</li>
    <li>Get adequate sleep and rest days for heart recovery and adaptation.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    🧘 Recovery and Resting Heart Rate
  </h3>
  <p>
    Monitoring your <strong>resting heart rate (RHR)</strong> can provide insight into your overall fitness level and
    recovery status. A lower RHR (usually between 50–70 bpm) indicates good cardiovascular efficiency. If your RHR
    suddenly increases for a few days, it could signal fatigue, stress, or overtraining — time to take a lighter day or
    rest.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    ⚠️ Safety and Medical Considerations
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Consult your doctor before starting a new exercise program, especially if you have heart or metabolic issues.</li>
    <li>
      Stop exercising immediately if you feel dizziness, chest pain, or irregular heartbeat.
    </li>
    <li>
      Remember that medications like beta-blockers can alter your heart rate response during exercise.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    🔢 Example Heart Rate Zone Chart (for a 30-Year-Old)
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Zone 1 (50–60%)</strong> → 95–114 bpm</li>
    <li><strong>Zone 2 (60–70%)</strong> → 114–133 bpm</li>
    <li><strong>Zone 3 (70–80%)</strong> → 133–152 bpm</li>
    <li><strong>Zone 4 (80–90%)</strong> → 152–171 bpm</li>
    <li><strong>Zone 5 (90–100%)</strong> → 171–190 bpm</li>
  </ul>
  <p>
    You can adjust your training intensity to stay within a specific range depending on whether your goal is fat
    burning, performance, or recovery.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    🏁 Key Takeaways
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Your target heart rate ensures optimal exercise intensity for your goal.</li>
    <li>Use wearables or chest straps to monitor heart rate accurately during workouts.</li>
    <li>Train in the fat-burning zone for steady results and aerobic improvement.</li>
    <li>Incorporate higher-intensity intervals occasionally to enhance performance and VO₂ max.</li>
    <li>Track progress weekly to see improvements in endurance and recovery.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">📚 FAQs</h3>
  <div className="space-y-3">
    <p>
      <strong>What is the best target heart rate for fat burning?</strong>  
      The fat-burning zone is typically 60–70% of your maximum heart rate. At this intensity, your body uses stored fat
      as the primary energy source.
    </p>
    <p>
      <strong>How can I lower my resting heart rate?</strong>  
      Regular aerobic training, deep sleep, stress management, and consistent hydration can lower your resting heart
      rate over time.
    </p>
    <p>
      <strong>Should I worry if my heart rate exceeds 100% of my target?</strong>  
      Brief spikes during intense exercise are normal for healthy individuals but should not be sustained. If it happens
      often or you feel unwell, consult your doctor.
    </p>
    <p>
      <strong>Do age and fitness level affect heart rate zones?</strong>  
      Yes. Your maximum heart rate decreases slightly with age, and fitter individuals may have lower resting rates and
      faster recovery.
    </p>
    <p>
      <strong>Can I use this calculator for HIIT workouts?</strong>  
      Absolutely. Heart rate tracking is essential for HIIT to ensure proper work and recovery intervals.
    </p>
  </div>

  <p className="italic">
    Disclaimer: This tool is for educational and fitness guidance only. It does not replace professional medical
    consultation. Always seek advice from a certified healthcare or fitness professional before making significant
    exercise changes.
  </p>
</section>
    </div>
  );
}
