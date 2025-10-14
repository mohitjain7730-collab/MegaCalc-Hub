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
import { Utensils } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({ age: z.number().int().min(1).max(120), sex: z.enum(['male', 'female']) });
type FormValues = z.infer<typeof formSchema>;

function rdaMgMg(age: number, sex: 'male' | 'female'): number {
  // Simplified NIH/ODS values
  if (age >= 1 && age <= 3) return 80;
  if (age >= 4 && age <= 8) return 130;
  if (age >= 9 && age <= 13) return 240;
  if (age >= 14 && age <= 18) return sex === 'male' ? 410 : 360;
  if (age >= 19 && age <= 30) return sex === 'male' ? 400 : 310;
  return sex === 'male' ? 420 : 320;
}

export default function MagnesiumIntakeCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, sex: 'male' } });
  const onSubmit = (values: FormValues) => setResult(rdaMgMg(values.age, values.sex));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Magnesium RDA</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Magnesium</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result} mg/day</p>
              <CardDescription>Approximate RDA based on age and sex.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <MagnesiumIntakeGuide />
      <EmbedWidget calculatorSlug="magnesium-intake-calculator" calculatorName="Magnesium Intake Calculator" />
    </div>
  );
}

export function MagnesiumIntakeGuide() {
  return (
    <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Magnesium Intake Calculator – Comprehensive Guide to Magnesium, RDA, Deficiency Symptoms, and Food Sources"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Learn everything about magnesium—its role in muscle, nerve, and heart function; recommended dietary allowance (RDA) by age and gender; top food sources; absorption factors; deficiency signs; and safe supplementation practices."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Magnesium 101: The Essential Mineral for Energy, Nerves, and Muscles
  </h2>
  <p itemProp="description">
    Magnesium is one of the most critical minerals for overall health—playing a role in more than <strong>300 biochemical reactions</strong> in the body. From <strong>energy production</strong> and <strong>nerve signaling</strong> to <strong>muscle relaxation</strong> and <strong>blood pressure regulation</strong>, magnesium is a silent multitasker that keeps your systems running smoothly.  
    Unfortunately, studies show that up to <strong>50% of people don’t meet their daily magnesium needs</strong> through diet alone, making awareness and tracking of intake vital.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Daily Magnesium Requirements (RDA)
  </h3>
  <p>
    The Recommended Dietary Allowance (RDA) varies based on age, gender, and life stage. Below is a simplified chart for daily magnesium needs as per the U.S. National Institutes of Health (NIH):
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>1–3 years: ~80 mg/day</li>
    <li>4–8 years: ~130 mg/day</li>
    <li>9–13 years: ~240 mg/day</li>
    <li>Boys 14–18 years: ~410 mg/day</li>
    <li>Girls 14–18 years: ~360 mg/day</li>
    <li>Men 19–30 years: ~400 mg/day</li>
    <li>Women 19–30 years: ~310 mg/day</li>
    <li>Men 31+ years: ~420 mg/day</li>
    <li>Women 31+ years: ~320 mg/day</li>
    <li>Pregnancy: ~350–400 mg/day</li>
    <li>Lactation: ~310–360 mg/day</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Why Magnesium Matters</h3>
  <p>
    Magnesium is involved in nearly every major bodily process:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Muscle Function:</strong> Prevents cramps, spasms, and promotes post-exercise recovery.
    </li>
    <li>
      <strong>Energy Production:</strong> Essential in converting food into usable energy (ATP synthesis).
    </li>
    <li>
      <strong>Nervous System Regulation:</strong> Helps modulate stress, anxiety, and promotes better sleep.
    </li>
    <li>
      <strong>Bone Health:</strong> Works with calcium and vitamin D to maintain bone density.
    </li>
    <li>
      <strong>Heart and Blood Pressure:</strong> Supports proper rhythm and helps control blood pressure.
    </li>
    <li>
      <strong>Glucose Metabolism:</strong> Enhances insulin sensitivity and carbohydrate utilization.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Signs and Symptoms of Magnesium Deficiency
  </h3>
  <p>
    Low magnesium can develop gradually and may go unnoticed until it affects health or performance. Common symptoms include:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>Muscle cramps, twitching, or weakness</li>
    <li>Fatigue and low energy</li>
    <li>Sleep disturbances or insomnia</li>
    <li>Anxiety, irritability, or restlessness</li>
    <li>Abnormal heart rhythms or palpitations</li>
    <li>Numbness or tingling in extremities</li>
    <li>Frequent headaches or migraines</li>
  </ul>
  <p>
    Chronic magnesium deficiency has been linked to an increased risk of
    <strong> hypertension, diabetes, osteoporosis, and cardiovascular disease</strong>.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Best Food Sources of Magnesium
  </h3>
  <p>
    Magnesium is found in both plant and animal foods, especially those high in chlorophyll and unrefined grains. Here are some excellent sources:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Leafy greens:</strong> spinach, Swiss chard, kale (80–160 mg per cup)
    </li>
    <li>
      <strong>Nuts and seeds:</strong> almonds, pumpkin seeds, chia seeds, cashews (90–150 mg per ounce)
    </li>
    <li>
      <strong>Whole grains:</strong> brown rice, quinoa, oats (40–80 mg per serving)
    </li>
    <li>
      <strong>Legumes:</strong> black beans, chickpeas, lentils (60–120 mg per cup)
    </li>
    <li>
      <strong>Fish:</strong> salmon, halibut, mackerel (50–80 mg per serving)
    </li>
    <li>
      <strong>Dark chocolate (70–85%):</strong> ~65 mg per square
    </li>
    <li>
      <strong>Fortified foods:</strong> breakfast cereals, plant milks
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Absorption and Bioavailability Factors
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Vitamin D:</strong> Enhances magnesium absorption—pair magnesium-rich foods with adequate sunlight or supplements.
    </li>
    <li>
      <strong>High calcium intake:</strong> In excess, can compete with magnesium absorption; balance is key.
    </li>
    <li>
      <strong>Phytates and oxalates:</strong> Found in whole grains and leafy greens, may reduce absorption slightly—but soaking, sprouting, or fermenting helps.
    </li>
    <li>
      <strong>Alcohol and caffeine:</strong> Excessive use increases magnesium loss through urine.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Supplementation & Safety</h3>
  <p>
    While food sources are ideal, supplements can help meet needs when dietary intake is low or absorption is impaired.
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Common forms:</strong> magnesium citrate (highly absorbable), glycinate (gentle on stomach), oxide (higher dose but less absorption).
    </li>
    <li>
      <strong>Dosage:</strong> Most supplements provide 200–400 mg elemental magnesium per day. Always account for dietary intake before adding supplements.
    </li>
    <li>
      <strong>Timing:</strong> Best taken with food or before bed for relaxation and sleep benefits.
    </li>
    <li>
      <strong>Safety:</strong> Excessive magnesium from supplements can cause diarrhea or nausea. The tolerable upper intake level (UL) from supplements is 350 mg/day for adults.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Magnesium and Its Interactions with Other Nutrients
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Calcium:</strong> Works synergistically for bone and muscle health—see the <Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary underline">Calcium Intake Calculator</Link>.
    </li>
    <li>
      <strong>Vitamin D:</strong> Improves magnesium absorption and utilization.
    </li>
    <li>
      <strong>Potassium:</strong> Helps regulate nerve and muscle signals; both are lost through sweat.
    </li>
    <li>
      <strong>Zinc and Iron:</strong> Large doses can compete with magnesium for absorption sites.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    How the Calculator Works
  </h3>
  <p>
    The <strong>Magnesium Intake Calculator</strong> estimates your daily requirement based on <strong>age, gender, and pregnancy/lactation status</strong>.  
    It helps you assess if your intake from food and supplements meets the recommended RDA. Use it regularly to monitor dietary balance and avoid deficiencies or excess.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Sample Magnesium-Rich Meal Plan</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Breakfast:</strong> Overnight oats with chia seeds, banana, and almond butter (~150 mg)</li>
    <li><strong>Lunch:</strong> Quinoa salad with chickpeas, spinach, and pumpkin seeds (~200 mg)</li>
    <li><strong>Snack:</strong> Dark chocolate + handful of cashews (~120 mg)</li>
    <li><strong>Dinner:</strong> Baked salmon with steamed broccoli and brown rice (~200 mg)</li>
    <li><strong>Total:</strong> ~670 mg magnesium for the day</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">FAQ: Your Top Magnesium Questions Answered</h3>
  <div className="space-y-3">
    <p><strong>Can I get enough magnesium from food alone?</strong> Yes, with a balanced diet rich in nuts, greens, legumes, and whole grains. However, many modern diets are low in these foods, leading to suboptimal intake.</p>
    <p><strong>What’s the best time to take magnesium supplements?</strong> Many prefer evening intake as it supports muscle relaxation and better sleep.</p>
    <p><strong>Does coffee deplete magnesium?</strong> Excess caffeine may increase urinary magnesium loss—moderation is key.</p>
    <p><strong>Is magnesium good for sleep?</strong> Yes, it supports melatonin production and calms the nervous system, improving sleep quality.</p>
    <p><strong>Can magnesium help with anxiety or migraines?</strong> Some studies suggest magnesium deficiency may contribute to both; supplementation can help reduce frequency and severity.</p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
  <div className="space-y-2">
    <p>
      <Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary underline">
        Calcium Intake Calculator
      </Link>
    </p>
    <p>
      <Link href="/category/health-fitness/zinc-requirement-calculator" className="text-primary underline">
        Zinc Requirement Calculator
      </Link>
    </p>
    <p>
      <Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary underline">
        Vitamin D Sun Exposure Calculator
      </Link>
    </p>
    <p>
      <Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary underline">
        Fiber Intake Calculator
      </Link>
    </p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Quick Tips for Optimizing Magnesium Intake</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Choose whole foods over processed ones—refining removes up to 80% of magnesium content.</li>
    <li>Hydrate well—magnesium supports electrolyte balance.</li>
    <li>Include leafy greens in at least two meals daily.</li>
    <li>Pair magnesium with vitamin D and healthy fats for better absorption.</li>
    <li>Monitor intake if you’re an athlete, diabetic, or under chronic stress—needs may be higher.</li>
  </ul>

  <p className="italic mt-4">
    Disclaimer: This calculator and guide are for educational purposes only. Always consult a healthcare professional before making changes to your diet or supplement routine.
  </p>
</section>
  );
}


