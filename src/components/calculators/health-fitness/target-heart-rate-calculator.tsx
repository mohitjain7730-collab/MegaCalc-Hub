'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, Info, Target, BarChart3, HelpCircle, Activity } from 'lucide-react';
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
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Target Heart Rate
          </CardTitle>
          <CardDescription>
            Determine your optimal heart rate zones for effective and safe exercise
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <HeartPulse className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Target Heart Rate Zones</CardTitle>
                  <CardDescription>Based on the {result.method} method. Max heart rate is {result.maxHR} bpm.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card className="bg-muted">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Activity className="h-5 w-5 text-green-600" />
                              Moderate Intensity
                            </CardTitle>
                            <CardDescription>50-70% of max HR</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{result.moderateZone.min} - {result.moderateZone.max} bpm</p>
                            <p className="text-sm text-muted-foreground mt-2">Best for fat burning and aerobic fitness</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-muted">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Activity className="h-5 w-5 text-red-600" />
                              Vigorous Intensity
                            </CardTitle>
                            <CardDescription>70-85% of max HR</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{result.vigorousZone.min} - {result.vigorousZone.max} bpm</p>
                            <p className="text-sm text-muted-foreground mt-2">Best for improving cardiovascular fitness</p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Understanding the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Age</h4>
              <p className="text-muted-foreground">
                Age is the primary factor in calculating maximum heart rate. The formula used is 220 - age, which is the standard method for estimating maximum heart rate. As you age, your maximum heart rate decreases—this is a normal part of aging and doesn't necessarily indicate declining fitness. Your target zones are calculated as percentages of this maximum.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Resting Heart Rate (Optional)</h4>
              <p className="text-muted-foreground">
                Your resting heart rate is your pulse when completely at rest (best measured first thing in the morning before getting out of bed). Providing this value enables the Karvonen Method, which is more personalized and often more accurate. It accounts for your current fitness level—people with lower resting heart rates (more fit) can train at higher percentages. If you don't provide it, the calculator uses the simpler percentage-of-max method.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Calculation Methods</h4>
              <p className="text-muted-foreground">
                The Basic Method uses simple percentages of maximum heart rate (50-70% for moderate, 70-85% for vigorous). The Karvonen Method (when resting HR is provided) uses Heart Rate Reserve (max HR - resting HR) to calculate zones, which is generally more accurate because it accounts for individual fitness levels. Both methods work well—choose based on whether you know your resting HR.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other fitness and health calculators to optimize your training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmr-calculator" className="text-primary hover:underline">
                    BMR Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your basal metabolic rate to understand your body's energy needs at rest.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your total daily energy expenditure to fuel your workouts effectively.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                    Body Fat Percentage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Track your body composition alongside your cardiovascular fitness goals.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                    BMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand your body mass index in relation to your fitness goals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5" />
              Complete Guide to Target Heart Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">Target Heart Rate Calculator: Train Smarter, Not Harder</h2>
            <p>Your <strong>target heart rate (THR)</strong> is the secret to training efficiently. It shows how hard your heart
              should work during exercise to achieve your fitness goals — whether that's burning fat, building endurance, or
              improving cardiovascular strength. This guide helps you understand your target zones, how to calculate them, and how
              to use them effectively in your workouts.</p>

            <h3 className="font-semibold text-foreground mt-6">💡 What Is Target Heart Rate?</h3>
            <p>The <strong>target heart rate</strong> represents the ideal range of beats per minute (bpm) your heart should reach
              during exercise for optimal results. Training within these zones ensures that your cardiovascular system and muscles
              are challenged enough to improve but not so much that they become overstressed. Each heart rate zone corresponds to
              a different intensity level and energy system in the body.</p>

            <h3 className="font-semibold text-foreground mt-6">⚙️ The Target Heart Rate Formula</h3>
            <p>The most common way to calculate your maximum heart rate (MHR) is using the formula:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Maximum Heart Rate (MHR) = 220 − age</strong></li>
              <li>Your <strong>Target Heart Rate</strong> is a percentage of this MHR, depending on your goal and workout intensity.</li>
            </ul>
            <p>For example, a 30-year-old has an MHR of 190 bpm. Their 70–80% training zone would be between 133 and 152 bpm.</p>

            <h3 className="font-semibold text-foreground mt-6">🧠 Understanding Heart Rate Zones</h3>
            <p>The concept of heart rate zones helps you structure your workouts by intensity. Each zone affects your body
              differently — from recovery and fat burning to speed and endurance.</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Zone 1 (50–60% MHR):</strong> Low-intensity, suitable for warm-ups, recovery, and beginners starting their fitness journey.</li>
              <li><strong>Zone 2 (60–70% MHR):</strong> Often called the <em>fat-burning zone</em>. Your body primarily uses stored fat for energy while improving basic aerobic capacity.</li>
              <li><strong>Zone 3 (70–80% MHR):</strong> The aerobic zone — builds endurance and cardiovascular efficiency. Ideal for steady-state cardio and long-distance training.</li>
              <li><strong>Zone 4 (80–90% MHR):</strong> Anaerobic zone — enhances performance, power, and lactate threshold. Used in high-intensity interval training (HIIT).</li>
              <li><strong>Zone 5 (90–100% MHR):</strong> Maximum effort — short bursts of all-out performance, improving VO₂ max and peak conditioning.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">🎯 Why Knowing Your Target Heart Rate Matters</h3>
            <p>Training with heart rate awareness helps you make workouts safer and more effective. Without it, you may undertrain
              and see limited results — or overtrain and risk injury or fatigue. Understanding your target zones helps you:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Burn fat more efficiently by maintaining optimal cardio intensity.</li>
              <li>Improve cardiovascular endurance with consistent aerobic training.</li>
              <li>Track progress using measurable data instead of "perceived effort."</li>
              <li>Recover faster by balancing effort and rest based on heart rate feedback.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">🩺 How to Measure Your Heart Rate</h3>
            <p>There are several ways to monitor your heart rate accurately during workouts:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Fitness trackers and smartwatches:</strong> Devices like Apple Watch, Fitbit, and Garmin provide real-time heart rate monitoring.</li>
              <li><strong>Chest straps:</strong> Offer the most precise readings for athletes and HIIT sessions.</li>
              <li><strong>Manual check:</strong> Find your pulse on your wrist or neck, count beats for 15 seconds, and multiply by 4 to estimate bpm.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">💪 Training Examples by Goal</h3>
            <p>Use these examples to plan workouts based on your specific goal:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Fat Loss:</strong> 60–70% MHR (Zone 2) for 40–60 minutes. Ideal for walking, cycling, or light jogging.</li>
              <li><strong>Endurance:</strong> 70–80% MHR (Zone 3) for 30–90 minutes. Great for long runs or moderate-intensity cardio.</li>
              <li><strong>Performance & Speed:</strong> 80–90% MHR (Zone 4). Best for HIIT, sprints, or competitive training.</li>
              <li><strong>Recovery:</strong> 50–60% MHR (Zone 1). Gentle movement such as walking, stretching, or yoga.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">📈 Integrating Heart Rate with Other Metrics</h3>
            <p>For complete fitness tracking, combine heart rate data with other metrics such as calories burned, perceived
              exertion, and recovery status. Over time, you'll notice your resting heart rate decreasing — a sign of improved
              cardiovascular health.</p>

            <h3 className="font-semibold text-foreground mt-6">🧩 Tips to Improve Heart Rate Efficiency</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Warm up for 5–10 minutes to gradually raise your heart rate before intense exercise.</li>
              <li>Incorporate interval training to boost endurance and fat oxidation.</li>
              <li>Stay hydrated and maintain electrolyte balance for stable heart rhythm.</li>
              <li>Get adequate sleep and rest days for heart recovery and adaptation.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">🧘 Recovery and Resting Heart Rate</h3>
            <p>Monitoring your <strong>resting heart rate (RHR)</strong> can provide insight into your overall fitness level and
              recovery status. A lower RHR (usually between 50–70 bpm) indicates good cardiovascular efficiency. If your RHR
              suddenly increases for a few days, it could signal fatigue, stress, or overtraining — time to take a lighter day or
              rest.</p>

            <h3 className="font-semibold text-foreground mt-6">⚠️ Safety and Medical Considerations</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Consult your doctor before starting a new exercise program, especially if you have heart or metabolic issues.</li>
              <li>Stop exercising immediately if you feel dizziness, chest pain, or irregular heartbeat.</li>
              <li>Remember that medications like beta-blockers can alter your heart rate response during exercise.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">🔢 Example Heart Rate Zone Chart (for a 30-Year-Old)</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Zone 1 (50–60%)</strong> → 95–114 bpm</li>
              <li><strong>Zone 2 (60–70%)</strong> → 114–133 bpm</li>
              <li><strong>Zone 3 (70–80%)</strong> → 133–152 bpm</li>
              <li><strong>Zone 4 (80–90%)</strong> → 152–171 bpm</li>
              <li><strong>Zone 5 (90–100%)</strong> → 171–190 bpm</li>
            </ul>
            <p>You can adjust your training intensity to stay within a specific range depending on whether your goal is fat
              burning, performance, or recovery.</p>

            <h3 className="font-semibold text-foreground mt-6">🏁 Key Takeaways</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Your target heart rate ensures optimal exercise intensity for your goal.</li>
              <li>Use wearables or chest straps to monitor heart rate accurately during workouts.</li>
              <li>Train in the fat-burning zone for steady results and aerobic improvement.</li>
              <li>Incorporate higher-intensity intervals occasionally to enhance performance and VO₂ max.</li>
              <li>Track progress weekly to see improvements in endurance and recovery.</li>
            </ul>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about target heart rate and heart rate training
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is the best target heart rate for fat burning?</h4>
              <p className="text-muted-foreground">
                The fat-burning zone is typically 60–70% of your maximum heart rate. At this intensity, your body uses stored fat
                as the primary energy source. However, while you burn a higher percentage of fat at this intensity, you may burn more total calories (and more total fat) at higher intensities. For sustainable fat loss, a mix of moderate-intensity steady-state and higher-intensity intervals often works best.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How can I lower my resting heart rate?</h4>
              <p className="text-muted-foreground">
                Regular aerobic training, deep sleep, stress management, and consistent hydration can lower your resting heart
                rate over time. As your cardiovascular system becomes more efficient, your heart doesn't need to beat as frequently at rest. You may see improvements in as little as 4-6 weeks of consistent training. A lower resting heart rate generally indicates better cardiovascular fitness.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I worry if my heart rate exceeds 100% of my target?</h4>
              <p className="text-muted-foreground">
                Brief spikes during intense exercise are normal for healthy individuals but should not be sustained. If it happens
                often or you feel unwell, consult your doctor. The 220-age formula is an estimate—some people have naturally higher or lower max heart rates. However, consistently exceeding calculated max HR or feeling unwell when it happens warrants medical evaluation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do age and fitness level affect heart rate zones?</h4>
              <p className="text-muted-foreground">
                Yes. Your maximum heart rate decreases slightly with age, and fitter individuals may have lower resting rates and
                faster recovery. Very fit people can maintain higher heart rates for longer periods and recover faster between intervals. The zones themselves (percentages) remain the same, but the actual heart rate numbers change with age, and your ability to work in higher zones improves with fitness.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I use this calculator for HIIT workouts?</h4>
              <p className="text-muted-foreground">
                Absolutely. Heart rate tracking is essential for HIIT to ensure proper work and recovery intervals. During work intervals, you may reach 85-95% of max HR, while recovery should bring you down to 50-60% before the next interval. Monitoring heart rate helps you ensure you're working hard enough during intervals and recovering adequately between them.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between the Basic and Karvonen methods?</h4>
              <p className="text-muted-foreground">
                The Basic Method calculates zones as simple percentages of maximum heart rate (e.g., 70% of 190 = 133 bpm). The Karvonen Method uses Heart Rate Reserve (max HR - resting HR) for more personalized zones, accounting for fitness level. For example, someone with a lower resting HR can train at a higher percentage. Karvonen is generally more accurate if you know your resting HR.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I find my resting heart rate?</h4>
              <p className="text-muted-foreground">
                Measure it first thing in the morning, before getting out of bed, after a good night's sleep. Find your pulse (wrist or neck), count the beats for 30 seconds, and multiply by 2. Do this for several days and average the results for the most accurate reading. A typical resting heart rate is 60-100 bpm, with athletes often having 40-60 bpm.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can medications affect my heart rate zones?</h4>
              <p className="text-muted-foreground">
                Yes. Beta-blockers lower heart rate, while some medications can increase it. If you're on heart-rate-affecting medications, your actual zones may differ from calculated values. Work with your healthcare provider to adjust zones appropriately, or rely more on perceived exertion if medications significantly alter your heart rate response.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is the "220 - age" formula accurate for everyone?</h4>
              <p className="text-muted-foreground">
                It's a reasonable estimate for most people, but individual variation exists. Some people naturally have higher or lower max heart rates than predicted. The formula works well for population averages but may be off by 10-15 bpm for individuals. If you consistently exceed or never reach your calculated max HR during maximum effort, you may have a different natural max HR.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I stay in one zone for an entire workout?</h4>
              <p className="text-muted-foreground">
                Not necessarily. While steady-state workouts in Zone 2-3 are excellent for building aerobic base, mixing zones provides variety and comprehensive benefits. Many effective programs include: warm-up in Zone 1, main work in Zone 2-4 depending on goal, and cool-down in Zone 1. Interval training naturally involves multiple zones. Variety prevents boredom and plateaus.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
