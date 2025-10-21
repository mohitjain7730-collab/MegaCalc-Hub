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
  bodyWeightKg: z.number().positive('Enter body weight').optional(),
  contactAreaCm2: z.number().min(5).max(500).optional(),
  weightDistributionPercent: z.number().min(10).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FoamRollingPressureEstimator() {
  const [result, setResult] = useState<{ pressureKpa: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { bodyWeightKg: undefined, contactAreaCm2: undefined, weightDistributionPercent: undefined } });

  const calculate = (v: FormValues) => {
    if (v.bodyWeightKg == null || v.contactAreaCm2 == null || v.weightDistributionPercent == null) return null;
    const forceN = v.bodyWeightKg * 9.80665 * (v.weightDistributionPercent / 100);
    const areaM2 = (v.contactAreaCm2 / 10000);
    const pressurePa = forceN / areaM2;
    const kpa = pressurePa / 1000;
    return Math.round(kpa * 10) / 10;
  };

  const interpret = (kpa: number) => {
    if (kpa > 50) return 'High pressure—limit duration and monitor discomfort.';
    if (kpa >= 20) return 'Moderate pressure—common for trigger point work.';
    return 'Light pressure—use for warm-up and gentle tissue prep.';
  };

  const opinion = (kpa: number) => {
    if (kpa > 50) return 'Reduce load or increase contact area to lower pressure.';
    if (kpa >= 20) return 'Spend 30–60s per spot; avoid pain over 6/10.';
    return 'Use sweeping passes 1–2 minutes per muscle group.';
  };

  const onSubmit = (values: FormValues) => {
    const kpa = calculate(values);
    if (kpa == null) { setResult(null); return; }
    setResult({ pressureKpa: kpa, interpretation: interpret(kpa), opinion: opinion(kpa) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="bodyWeightKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 70" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contactAreaCm2" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Area (cm²)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weightDistributionPercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight on Roller (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 40" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Pressure</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Foam Rolling Pressure</CardTitle>
              </div>
              <CardDescription>Approximate applied pressure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.pressureKpa} kPa</p>
              <p className="text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Our Opinion</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{result.opinion}</p></CardContent>
          </Card>
        </div>
      )}

<section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HowTo">
    {/* SEO & SCHEMA METADATA (E-E-A-T FOCUS) */}
    <meta itemProp="name" content="Foam Rolling Pressure Estimator & Pain Guide" />
    <meta itemProp="description" content="Calculate the optimal pressure for foam rolling (Self-Myofascial Release) using the 10-point pain scale. Find your 'comfortably uncomfortable' zone for glutes, IT band, and quads." />
    <meta itemProp="keywords" content="foam rolling pressure estimator, optimal foam rolling pressure, SMR pressure scale, comfortably uncomfortable foam rolling, self-myofascial release guide, how much pressure for foam roller" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/foam-rolling-pressure-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Foam Rolling Pressure Estimator: Find Your Optimal SMR Intensity</h1>
    
    <p className="text-lg italic text-primary">Stop guessing! Use this guide to ensure your **Self-Myofascial Release (SMR)** technique is effective for trigger point relief and muscle recovery, without causing tissue damage.</p>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#smr" className="hover:underline">What is SMR and Why Does Pressure Matter?</a></li>
        <li><a href="#scale" className="hover:underline">The 10-Point Foam Rolling Pain Scale</a></li>
        <li><a href="#optimal-zone" className="hover:underline">Finding the 'Comfortably Uncomfortable' Zone</a></li>
        <li><a href="#techniques" className="hover:underline">Pressure Adjustment Techniques for Each Muscle</a></li>
        <li><a href="#faq" className="hover:underline">Foam Rolling Pressure FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: DEFINITION */}
    <h2 id="smr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is SMR and Why Does Pressure Matter?</h2>
    <p>**Self-Myofascial Release (SMR)** is a self-massage technique, commonly done with a foam roller, designed to relieve muscle tightness and address **trigger points** (or "knots") in the fascia. The goal is to apply sustained, controlled pressure to encourage soft tissue relaxation and improve blood flow.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance of Controlled Pressure</h3>
    <p>Foam rolling pressure is a delicate balance. Too little pressure means you won't stimulate the Golgi tendon organs or reach the deeper fascial layers required for true release. Too much pressure can cause bruising, inflammation, and muscle guarding, where the muscle actually tightens further in self-defense, negating the entire effort.</p>

<hr />
    {/* SECTION 2: THE PAIN SCALE */}
    <h2 id="scale" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 10-Point Foam Rolling Pain Scale</h2>
    <p>Physical therapists often use a simplified pain scale to teach clients the right amount of pressure. When using the calculator, assess your pain level on this scale to find your working zone.</p>

    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scale Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pain Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action / Indication</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**0 - 3**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Mild Discomfort / Ticklish</td>
                    <td className="px-6 py-4 whitespace-nowrap">**Increase Pressure.** Not deep enough for tissue change.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**4 - 7**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Comfortably Uncomfortable / Deep Ache</td>
                    <td className="px-6 py-4 whitespace-nowrap">**Optimal Zone.** Sustained pressure encourages release.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**8 - 10**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Severe Pain / Sharp or Shooting</td>
                    <td className="px-6 py-4 whitespace-nowrap">**Reduce Pressure Immediately.** Risk of bruising and muscle guarding.</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />
    {/* SECTION 3: OPTIMAL ZONE */}
    <h2 id="optimal-zone" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Finding the 'Comfortably Uncomfortable' Zone (Score 4-7)</h2>
    <p>Your target intensity zone is the **4 to 7 range**. This is the sweet spot where the mechanical pressure is intense enough to create a therapeutic effect without triggering your pain receptors to make the muscle tense up defensively.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Tips for Staying in the Zone</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Use Breathing:** When you find a tender spot, hold the pressure for 20-30 seconds. Use slow, deep breaths (diaphragmatic breathing) to encourage the parasympathetic nervous system to take over and allow the muscle to release tension.</li>
        <li>**Control Speed:** Roll very slowly (about 1 inch per second). Fast rolling simply skims over the muscle and connective tissue, preventing the sustained compression needed for SMR.</li>
        <li>**Duration:** Spend a total of 1 to 2 minutes on each major muscle group. Prolonged rolling over 2 minutes can increase post-session soreness.</li>
    </ul>

<hr />
    {/* SECTION 4: ADJUSTMENT TECHNIQUES */}
    <h2 id="techniques" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pressure Adjustment Techniques for Each Muscle</h2>
    <p>You can adjust the pressure by manipulating how much of your body weight is supported by the floor or an unrolled limb, depending on the muscle being treated.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Muscle-Specific Pressure Control</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Glutes/Hips:** To reduce pressure, place both feet flat on the floor. To increase pressure for deeper relief, lift the non-rolling foot off the floor or cross the leg over the knee.</li>
        <li>**IT Band (Side of Thigh):** This is often highly sensitive. Start by placing the non-rolling leg on the floor in front of the roller for support (reducing the pressure by 50%). Gradually lift the foot as tolerated to increase intensity.</li>
        <li>**Calves/Hamstrings:** To reduce pressure, use your arms to support most of your body weight. To increase pressure, cross one leg over the other, doubling the weight applied to the targeted calf or hamstring.</li>
        <li>**Upper/Mid-Back (Thoracic Spine):** To reduce pressure, interlace your hands behind your head to support your neck and keep your glutes on the floor. To increase pressure, lift your hips off the floor. **Never roll the lower back (lumbar spine).**</li>
    </ul>

<hr />
    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Foam Rolling Pressure FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Should I use a smooth or textured foam roller?</h3>
    <p>If you are a **beginner** or have high pain sensitivity, start with a **smooth, soft-density roller** for even, generalized pressure. **Textured (knobby)** or **high-density rollers** provide more intense, pinpointed pressure, which is best reserved for experienced users targeting deeper, chronic trigger points.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Is sharp, shooting pain a good sign of a deep release?</h3>
    <p>**Absolutely not.** Sharp, shooting, or electric pain (Score 8-10) is a sign you are rolling directly over a **nerve or tendon/joint**. Stop immediately. This level of pain triggers muscle guarding and can cause serious bruising or trauma. Focus only on the soft, fleshy parts of the muscle belly.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How long should I hold sustained pressure on a knot?</h3>
    <p>Once you find a tender spot (a knot or trigger point in the 4-7 range), hold sustained pressure for **20 to 30 seconds**. Continue deep breathing until you feel the sensation decrease by about 1 to 2 points on the scale, signaling the tissue has begun to release. If the pain does not subside, move on and try again during your next session.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Consult a physical therapist before starting SMR if you have a recent injury or chronic pain condition.</p>
    </div>
</section>
    </div>
  );
}


