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

const formSchema = z.object({
  age: z.number().int().min(1).max(120),
  sex: z.enum(['male', 'female']),
});

type FormValues = z.infer<typeof formSchema>;

function rdaCalciumMg(age: number, sex: 'male' | 'female'): number {
  // Simplified NIH/ODS values
  if (age >= 1 && age <= 3) return 700;
  if (age >= 4 && age <= 8) return 1000;
  if (age >= 9 && age <= 18) return 1300;
  if (age >= 19 && age <= 50) return 1000;
  if (age >= 51 && sex === 'female') return 1200;
  if (age >= 71) return 1200;
  return 1000;
}

export default function CalciumIntakeCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, sex: 'female' } });
  const onSubmit = (values: FormValues) => setResult(rdaCalciumMg(values.age, values.sex));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Calcium RDA</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Calcium</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result} mg/day</p>
              <CardDescription>Approximate Dietary Reference Intake. Individual needs vary.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <CalciumIntakeGuide />
    </div>
  );
}

export function CalciumIntakeGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Calcium Intake Calculator – Comprehensive Guide to Calcium, RDA, Bone Health, and Food Sources" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="What calcium does, daily requirements by age/sex, absorption and vitamin D, oxalates/phytates, dairy vs plant sources, supplementation, safety, and meal planning." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Calcium 101: Structure, Signaling, and Health</h2>
      <p itemProp="description">Calcium is the most abundant mineral in the body. About 99% resides in bones and teeth, while 1% supports muscle contraction, nerve transmission, blood clotting, and intracellular signaling. Adequate intake is essential across the lifespan—during growth, pregnancy, peak bone accrual, and aging.</p>

      <h3 className="font-semibold text-foreground mt-6">Daily Requirements (Simplified)</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>1–3 years: ~700 mg/day</li>
        <li>4–8 years: ~1,000 mg/day</li>
        <li>9–18 years: ~1,300 mg/day (peak accrual)</li>
        <li>19–50 years: ~1,000 mg/day</li>
        <li>51+ years: ~1,200 mg/day (women 51+, men 71+)</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Absorption: Vitamin D, Meal Context, and Bioavailability</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li><strong>Vitamin D</strong> increases intestinal calcium absorption. See the <Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary underline">Vitamin D Sun Exposure Calculator</Link>.</li>
        <li><strong>Oxalates/phytates</strong> in spinach, beet greens, and some grains bind calcium, reducing absorption. Pair with lower‑oxalate veggies.</li>
        <li><strong>Calcium carbonate</strong> supplements absorb best with meals; <strong>calcium citrate</strong> can be taken with or without food.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Food Sources</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li><strong>Dairy:</strong> milk, yogurt, cheese (~300 mg per cup of milk/yogurt).</li>
        <li><strong>Fortified:</strong> plant milks (soy/almond/oat), calcium‑set tofu, fortified juices/cereals.</li>
        <li><strong>Fish with bones:</strong> canned salmon/sardines.</li>
        <li><strong>Vegetables & legumes:</strong> kale, bok choy, white beans; note oxalate content.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Sample Menus to Hit Targets</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Breakfast: fortified soy milk latte + fortified cereal + fruit (≈400–500 mg)</li>
        <li>Lunch: tofu stir‑fry with bok choy; sesame dressing (≈300–400 mg)</li>
        <li>Dinner: salmon with edible bones + kale salad (≈400 mg)</li>
        <li>Snack: yogurt or skyr (≈200–300 mg)</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Supplementation & Safety</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Prefer food first; if supplementing, divide doses (≤500 mg per serving) for better absorption.</li>
        <li>Discuss total calcium (diet + supplements) with your clinician if you have kidney stones or vascular calcification risk.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">How the Calculator Works</h3>
      <p>The calculator maps your age and sex to simplified RDAs. These are population guidelines; individual needs vary with vitamin D status, absorption, training, and medical history.</p>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2">
        <p><Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary underline">Vitamin D Sun Exposure Calculator</Link></p>
        <p><Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary underline">Magnesium Intake Calculator</Link></p>
        <p><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary underline">Fiber Intake Calculator</Link></p>
      </div>
      <p className="italic">Educational use only; consult your healthcare professional for individualized recommendations.</p>
    </section>
  );
}


