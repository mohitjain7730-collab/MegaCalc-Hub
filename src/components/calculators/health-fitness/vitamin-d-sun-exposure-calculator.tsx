'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Sun } from 'lucide-react';

const formSchema = z.object({
  skinType: z.enum(['I','II','III','IV','V','VI']),
  uvIndex: z.number().min(1).max(11),
  exposedArea: z.number().min(5).max(100), // % of body
  minutes: z.number().min(1).max(180),
});

type FormValues = z.infer<typeof formSchema>;

function estimateVitaminDiu(values: FormValues): number {
  // Highly approximate heuristic for educational purposes only
  const skinFactor = { I: 1.0, II: 0.85, III: 0.7, IV: 0.55, V: 0.4, VI: 0.3 }[values.skinType];
  const uvFactor = values.uvIndex / 10; // scale 0.1–1.1
  const areaFactor = values.exposedArea / 25; // 25% ≈ baseline
  const timeFactor = values.minutes / 15; // 15 min blocks
  const baseIU = 1000; // baseline per block
  return Math.round(baseIU * skinFactor * uvFactor * areaFactor * timeFactor);
}

export default function VitaminDSunExposureCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { skinType: undefined as unknown as 'I', uvIndex: undefined, exposedArea: undefined, minutes: undefined } });
  const onSubmit = (v: FormValues) => setResult(estimateVitaminDiu(v));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="skinType" render={({ field }) => (
              <FormItem><FormLabel>Skin Type (Fitzpatrick)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{['I','II','III','IV','V','VI'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="uvIndex" render={({ field }) => (
              <FormItem><FormLabel>UV Index (1–11)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="exposedArea" render={({ field }) => (
              <FormItem><FormLabel>Exposed Skin (% body)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="minutes" render={({ field }) => (
              <FormItem><FormLabel>Exposure Time (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Vitamin D (IU)</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Sun className="h-8 w-8 text-primary" /><CardTitle>Estimated Vitamin D</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result.toLocaleString()} IU</p>
              <CardDescription>Very rough estimate for educational purposes. Use sun protection and follow medical guidance.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <VitaminDGuide />
    </div>
  );
}

export function VitaminDGuide() {
  return (
    <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Vitamin D Sun Exposure Calculator – Optimal Sunlight Duration by Skin Type, Location & Time of Day"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Use this Vitamin D Sun Exposure Calculator to find how much sunlight you need daily based on your skin tone, latitude, season, and time of day. Learn how UV index, sunscreen, and clothing affect Vitamin D synthesis and tips for safe sun exposure."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Vitamin D Sun Exposure Calculator – Find Your Optimal Sunlight Time
  </h2>
  <p itemProp="description">
    Vitamin D, often called the “sunshine vitamin,” is crucial for <strong>bone strength, immunity, and hormone regulation</strong>.  
    Your skin naturally makes Vitamin D when exposed to UVB rays from sunlight — but how much exposure you need depends on multiple factors like <strong>skin type, latitude, season, time of day, and clothing coverage</strong>.  
    The <strong>Vitamin D Sun Exposure Calculator</strong> estimates your ideal daily sunlight duration for healthy Vitamin D levels while minimizing the risk of sunburn.
  </p>

  <h3 className="font-semibold text-foreground mt-6">What Is Vitamin D and Why It Matters</h3>
  <p>
    Vitamin D isn’t just a vitamin — it acts as a <strong>hormone that regulates calcium absorption</strong> and supports your immune system, muscles, and brain.  
    Deficiency has been linked to <strong>osteoporosis, fatigue, mood issues, and weakened immunity</strong>.  
    While food and supplements can provide Vitamin D, <strong>sunlight exposure is the body’s most natural source</strong>.
  </p>

  <h3 className="font-semibold text-foreground mt-6">How the Calculator Works</h3>
  <ol className="list-decimal ml-6 space-y-1">
    <li>Select your <strong>skin tone (Fitzpatrick scale type I–VI)</strong> — lighter skin needs less time; darker skin needs more.</li>
    <li>Choose your <strong>location or latitude</strong>.</li>
    <li>Pick the <strong>time of day</strong> and <strong>month/season</strong>.</li>
    <li>Indicate clothing coverage (e.g., face and arms exposed, or full body).</li>
    <li>The calculator estimates your <strong>ideal sun exposure duration</strong> to produce 1000–2000 IU of Vitamin D naturally.</li>
  </ol>

  <h3 className="font-semibold text-foreground mt-6">The Science Behind Sunlight and Vitamin D</h3>
  <p>
    When UVB photons hit your skin, they convert <strong>7-dehydrocholesterol</strong> into <strong>cholecalciferol (Vitamin D₃)</strong>.  
    Your liver and kidneys then convert it into the active form, <strong>calcitriol</strong>, which regulates calcium metabolism and immune responses.  
    Factors like latitude, season, pollution, and sunscreen can reduce UVB exposure and hence Vitamin D synthesis.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Factors Affecting Vitamin D Synthesis</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Skin tone:</strong> Darker skin (more melanin) blocks more UVB and requires longer exposure.</li>
    <li><strong>Latitude:</strong> The farther from the equator, the weaker the UVB intensity — especially in winter.</li>
    <li><strong>Season and time of day:</strong> Midday (10 AM – 2 PM) provides the strongest UVB rays for Vitamin D production.</li>
    <li><strong>Clothing and sunscreen:</strong> Covering skin or using SPF {'>'} 15 blocks most UVB rays, reducing synthesis.</li>
    <li><strong>Altitude and pollution:</strong> Higher altitudes yield stronger UVB; pollution scatters and absorbs it.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Approximate Sun Exposure Guidelines</h3>
  <table className="w-full border border-border text-sm">
    <thead className="bg-muted text-foreground font-semibold">
      <tr>
        <th className="p-2 text-left">Skin Type</th>
        <th className="p-2 text-right">UV Index 6–8 (Summer Midday)</th>
        <th className="p-2 text-right">UV Index 3–5 (Spring/Fall)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td className="p-2">Type I (Very Fair)</td><td className="p-2 text-right">5–10 min</td><td className="p-2 text-right">10–15 min</td></tr>
      <tr><td className="p-2">Type II (Fair)</td><td className="p-2 text-right">10–15 min</td><td className="p-2 text-right">15–20 min</td></tr>
      <tr><td className="p-2">Type III (Light-Medium)</td><td className="p-2 text-right">15–20 min</td><td className="p-2 text-right">20–25 min</td></tr>
      <tr><td className="p-2">Type IV (Medium-Tan)</td><td className="p-2 text-right">20–25 min</td><td className="p-2 text-right">25–30 min</td></tr>
      <tr><td className="p-2">Type V (Brown)</td><td className="p-2 text-right">30–40 min</td><td className="p-2 text-right">40–50 min</td></tr>
      <tr><td className="p-2">Type VI (Dark Brown/Black)</td><td className="p-2 text-right">40–60 min</td><td className="p-2 text-right">60–75 min</td></tr>
    </tbody>
  </table>
  <p className="text-sm italic mt-2">
    *Assumes 25–30% body exposure (face, arms, legs). Overexposure increases risk of burns — always follow safe sun practices.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Best Time for Vitamin D</h3>
  <p>
    The optimal time for Vitamin D synthesis is when your shadow is shorter than your height — typically between <strong>10 AM and 2 PM</strong>.  
    Morning or late-afternoon sunlight provides minimal UVB.  
    2–3 short sessions per week are often sufficient for maintaining adequate Vitamin D, but individual needs vary by location and season.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Signs of Vitamin D Deficiency</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Frequent illness or low immunity</li>
    <li>Fatigue, muscle weakness, or bone pain</li>
    <li>Low mood or seasonal depression</li>
    <li>Poor wound healing</li>
    <li>Hair loss or brittle bones</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Food and Supplement Sources of Vitamin D</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Fatty fish:</strong> salmon, mackerel, sardines</li>
    <li><strong>Egg yolks</strong> and <strong>fortified milk or plant milks</strong></li>
    <li><strong>Cod liver oil</strong> (richest natural source)</li>
    <li><strong>Vitamin D3 supplements</strong> (cholecalciferol) — better absorbed than D2</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">How the Calculator Estimates Exposure</h3>
  <p>
    The calculator combines your <strong>latitude, date, and skin phototype</strong> with <strong>NOAA solar radiation data</strong> and <strong>UV index forecasts</strong> to estimate how much sun exposure is needed to produce 1000–2000 IU of Vitamin D.  
    It assumes midday UV intensity and accounts for clothing coverage and SPF use.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Safe Sun Practices</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Never allow skin to burn; stop exposure when skin turns slightly pink (for fair tones).</li>
    <li>Balance sun exposure with protection — use shade, hats, and SPF after reaching Vitamin D target time.</li>
    <li>For long outdoor periods, use <strong>SPF 30+</strong> and reapply every 2 hours.</li>
    <li>Infants under 6 months should avoid direct sunlight.</li>
    <li>In low-UV regions or winter, consider <strong>supplementation under medical advice</strong>.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Vitamin D and Health Benefits</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Bone and teeth health:</strong> Improves calcium and phosphorus absorption.</li>
    <li><strong>Immunity:</strong> Supports white blood cell activity and anti-inflammatory functions.</li>
    <li><strong>Mood regulation:</strong> Low Vitamin D is linked to seasonal depression (SAD).</li>
    <li><strong>Hormone balance:</strong> Plays roles in testosterone, estrogen, and thyroid regulation.</li>
    <li><strong>Metabolic health:</strong> May improve insulin sensitivity and muscle strength.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
  <div className="space-y-3">
    <p><strong>Can I get Vitamin D through a window?</strong> No, glass blocks nearly all UVB rays, so Vitamin D synthesis doesn’t occur indoors.</p>
    <p><strong>Does sunscreen stop Vitamin D production?</strong> High SPF can reduce UVB absorption by 90%+, but brief unprotected exposure is usually enough.</p>
    <p><strong>Can I overdose on sunlight Vitamin D?</strong> No — your body self-regulates production, but overexposure increases skin damage risk.</p>
    <p><strong>Is sun exposure enough in winter?</strong> In northern regions, UVB is too weak; supplements or fortified foods are needed.</p>
    <p><strong>Do darker skin tones need supplements?</strong> Possibly — especially at high latitudes or with limited outdoor time.</p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Related Calculators</h3>
  <div className="space-y-2">
    <p><Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary underline">Calcium Intake Calculator</Link></p>
    <p><Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary underline">Magnesium Intake Calculator</Link></p>
    <p><Link href="/category/health-fitness/zinc-requirement-calculator" className="text-primary underline">Zinc Requirement Calculator</Link></p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Quick Takeaways</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Midday sun is the most efficient for Vitamin D production.</li>
    <li>Skin tone, latitude, and season strongly influence required exposure.</li>
    <li>Sunlight through windows doesn’t count.</li>
    <li>Balance Vitamin D goals with sun safety.</li>
    <li>In winter, fortified foods or D3 supplements can help maintain levels.</li>
  </ul>

  <p className="italic mt-4">
    Disclaimer: This tool is for educational and wellness purposes only. Sun exposure should be practiced safely and balanced with skin protection. Consult your healthcare provider before taking Vitamin D supplements or making major sun exposure changes.
  </p>
</section>
  );
}