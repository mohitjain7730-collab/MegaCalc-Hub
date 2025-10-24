'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Zap } from 'lucide-react';

const formSchema = z.object({
  sessionIntensity1to10: z.number().min(1).max(10).optional(),
  eccentricFocusPercent: z.number().min(0).max(100).optional(),
  setsPerMuscle: z.number().min(1).max(40).optional(),
  trainingStatus: z.enum(['novice','intermediate','advanced']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DOMSRecoveryTimeCalculator() {
  const [result, setResult] = useState<{ recoveryHours: number; interpretation: string; opinion: string } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { sessionIntensity1to10: undefined, eccentricFocusPercent: undefined, setsPerMuscle: undefined, trainingStatus: undefined } });

  const calculate = (v: FormValues) => {
    if (v.sessionIntensity1to10 == null || v.eccentricFocusPercent == null || v.setsPerMuscle == null || v.trainingStatus == null) return null;
    let base = 24 + (v.sessionIntensity1to10 - 5) * 6 + (v.setsPerMuscle - 10) * 1.5 + (v.eccentricFocusPercent/100) * 24;
    const statusFactor = v.trainingStatus === 'novice' ? 1.2 : v.trainingStatus === 'advanced' ? 0.85 : 1.0;
    const hours = Math.max(12, base * statusFactor);
    return Math.round(hours);
  };

  const interpret = (h: number) => {
    if (h > 72) return 'High recovery need—DOMS likely to persist for several days.';
    if (h >= 36) return 'Moderate recovery need—expect DOMS for 1–2 days.';
    return 'Light recovery need—minor soreness expected.';
  };

  const opinion = (h: number) => {
    if (h > 72) return 'Use deloads, massage, sleep 8–9h, and nutrition to aid recovery.';
    if (h >= 36) return 'Active recovery, gentle mobility, and protein + carbs will help.';
    return 'You can resume training sooner; still prioritize hydration and sleep.';
  };

  const onSubmit = (values: FormValues) => {
    const hours = calculate(values);
    if (hours == null) { setResult(null); return; }
    setResult({ recoveryHours: hours, interpretation: interpret(hours), opinion: opinion(hours) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="sessionIntensity1to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Intensity (1–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="eccentricFocusPercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Eccentric Focus (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 40" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="setsPerMuscle" render={({ field }) => (
              <FormItem>
                <FormLabel>Sets per Muscle</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 14" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="trainingStatus" render={({ field }) => (
              <FormItem>
                <FormLabel>Training Status</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as any)}>
                    <option value="">Select status</option>
                    <option value="novice">Novice</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Recovery Time</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>DOMS Recovery Estimate</CardTitle>
              </div>
              <CardDescription>Time until soreness meaningfully subsides</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.recoveryHours} hours</p>
              <p className="text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Our Opinion</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{result.opinion}</p></CardContent>
          </Card>
        </div>
      )}

<section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (HEALTH FOCUS) */}
    <meta itemProp="name" content="DOMS Recovery Time Calculator | Delayed Onset Muscle Soreness Predictor" />
    <meta itemProp="description" content="Calculate your personalized DOMS recovery time based on workout intensity, muscle group, and lifestyle factors. Predict peak soreness (24-72 hours) and find effective recovery strategies." />
    <meta itemProp="keywords" content="DOMS recovery time calculator, delayed onset muscle soreness duration, how long does DOMS last, eccentric exercise recovery, active recovery for DOMS, muscle soreness predictor" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/doms-recovery-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">DOMS Recovery Time Calculator: Predict & Conquer Muscle Soreness</h1>
    
    <p className="text-lg italic text-primary">Pinpoint exactly when your muscles will be ready for the next hard session. Our calculator uses training variables and lifestyle factors to estimate your full recovery window.</p>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-doms" className="hover:underline">What is DOMS? Peak Soreness Timeframe (12-72 Hours)</a></li>
        <li><a href="#factors" className="hover:underline">Training & Lifestyle Factors that Control Recovery Time</a></li>
        <li><a href="#recovery-strategies" className="hover:underline">The 5 Scientifically Proven DOMS Recovery Strategies</a></li>
        <li><a href="#when-to-worry" className="hover:underline">When to Worry: Differentiating DOMS from Injury</a></li>
        <li><a href="#faq" className="hover:underline">DOMS Recovery Calculator FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: WHAT IS DOMS */}
    <h2 id="what-is-doms" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is DOMS? Peak Soreness Timeframe (12-72 Hours)</h2>
    <p>**DOMS (Delayed Onset Muscle Soreness)** is the pain, stiffness, and tenderness you feel in your muscles after unaccustomed or intense exercise. This feeling is not due to lactic acid (a common myth), but rather the body's inflammatory response to **micro-trauma** in the muscle fibers caused by mechanical stress.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The DOMS Timeline</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Onset:** Soreness typically begins 12 to 24 hours post-exercise.</li>
        <li>**Peak:** Pain usually **peaks between 24 and 72 hours** (1 to 3 days).</li>
        <li>**Resolution:** For a healthy individual, DOMS symptoms should completely resolve within **4 to 6 days**.</li>
    </ul>
    <p>The calculator refines this 48-hour peak based on the factors you input to give you a personalized estimate.</p>

<hr />
    {/* SECTION 2: FACTORS */}
    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Training & Lifestyle Factors that Control Recovery Time</h2>
    <p>Your recovery time is highly personalized. The calculator adjusts the baseline 48-hour recovery window based on how much damage you created and how well your body can repair it:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Exercise-Induced Factors (Damage)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Eccentric Focus:** Exercises where the muscle lengthens under load (e.g., Romanian deadlifts, running downhill, slow negatives) cause significantly more damage and extend recovery time.</li>
        <li>**Unaccustomed Activity:** Any new exercise, sudden increase in volume, or high intensity (training to failure) will drastically increase DOMS severity and duration.</li>
        <li>**Muscle Group Size:** Large muscle groups (quads, back, chest) require more resources and time to repair than smaller groups (biceps, triceps).</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Physiological Factors (Repair)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Sleep Quality:** **The single most critical factor.** Lack of sleep blunts the release of Growth Hormone and impairs cellular repair, drastically prolonging DOMS.</li>
        <li>**Protein Intake:** Insufficient protein consumption slows the muscle protein synthesis (MPS) process required to rebuild damaged fibers.</li>
        <li>**Age:** Physiological aging naturally slows the efficiency of repair mechanisms, often adding hours to the recovery needed for the same training stress.</li>
    </ul>

<hr />
    {/* SECTION 3: RECOVERY STRATEGIES */}
    <h2 id="recovery-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 5 Scientifically Proven DOMS Recovery Strategies</h2>
    <p>While only time heals the micro-tears, you can actively reduce pain and accelerate the repair process.</p>

    <ol className="list-decimal ml-6 space-y-3">
        <li className="font-semibold text-foreground">
            Active Recovery:
            <p className="font-normal text-muted-foreground ml-4">Engage in **very light, low-impact activity** (walking, gentle cycling, swimming). This increases blood flow to the sore muscles, which helps flush metabolic waste and deliver oxygen and nutrients for repair.</p>
        </li>
        <li className="font-semibold text-foreground">
            Massage/SMR:
            <p className="font-normal text-muted-foreground ml-4">Manual massage or **Foam Rolling** (Self-Myofascial Release) can reduce pain perception and stiffness by improving blood flow and stimulating local mechanoreceptors. Perform gently, avoiding sharp pain.</p>
        </li>
        <li className="font-semibold text-foreground">
            Nutrient Timing:
            <p className="font-normal text-muted-foreground ml-4">Consume a post-workout meal with adequate **Protein** (20-40g) and **Carbohydrates** to initiate muscle repair (MPS) and replenish glycogen stores.</p>
        </li>
        <li className="font-semibold text-foreground">
            {/* THIS LINE IS THE SAFEST TEXT-ONLY FIX */}
            Cold Water Immersion (CWI):
            <p className="font-normal text-muted-foreground ml-4">An **Ice Bath** (for 5-10 minutes at 10°C–15°C or 50°F–59°F) can acutely reduce inflammation and pain perception. *Use with caution, as it may interfere with long-term muscle adaptation.*</p>
        </li>
        <li className="font-semibold text-foreground">
            Heat Therapy:
            <p className="font-normal text-muted-foreground ml-4">Applying local **heat packs** or taking a warm bath can help reduce stiffness by increasing tissue flexibility and enhancing localized blood circulation.</p>
        </li>
    </ol>

<hr />
    {/* SECTION 4: WHEN TO WORRY */}
    <h2 id="when-to-worry" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">When to Worry: Differentiating DOMS from Injury</h2>
    <p>While DOMS is a sign of successful muscle adaptation, certain symptoms should prompt you to consult a physician or physical therapist:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Signs it's NOT Just DOMS</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Sharp Pain:** DOMS is a dull ache, not a sharp or stabbing pain that occurs during movement.</li>
        <li>**Pain Persistence:** If the pain lasts **longer than 6 days** and shows no sign of improvement, it suggests a more serious injury or severe overtraining.</li>
        <li>**Extreme Swelling:** Significant, localized swelling that is hot to the touch.</li>
        <li>**Dark Urine:** This is a rare but critical sign of **Rhabdomyolysis** (severe muscle breakdown) and requires immediate medical attention.</li>
    </ul>

<hr />
    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">DOMS Recovery Calculator FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Can I work out a muscle group if it has DOMS?</h3>
    <p>Yes, but **lightly**. Performing a low-intensity, active recovery workout (like light cardio or low-weight, high-rep isolation exercises) is beneficial. However, you should **avoid intense training** of the affected muscle group until the peak soreness (24-72 hour mark) has passed to prevent further tissue damage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Does stretching help prevent DOMS?</h3>
    <p>No conclusive scientific evidence shows that static stretching before or after a workout prevents DOMS. **Dynamic stretching** during the warm-up is effective for preparing muscles, but the only true way to reduce DOMS severity is **gradual, progressive training** to let the body adapt over weeks.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Is feeling sore necessary for muscle growth?</h3>
    <p>No. Soreness indicates **muscle damage**, which is *one* pathway to hypertrophy, but it is not required. As you become adapted to a routine, you may stop feeling sore but still be making excellent gains. The key indicator of muscle growth is **Progressive Overload**, not pain.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Use it to recover smarter and maintain training consistency.</p>
    </div>
</section>
    </div>
  );
}


