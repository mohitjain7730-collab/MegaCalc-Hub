
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ruler } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  sex: z.enum(['male', 'female']),
  height: z.number().positive(),
  waist: z.number().positive(),
  neck: z.number().positive(),
  hip: z.number().positive().optional(),
  unit: z.enum(['cm', 'in']),
}).refine(data => data.sex === 'female' ? data.hip !== undefined && data.hip > 0 : true, {
    message: "Hip measurement is required for females.",
    path: ["hip"],
});

type FormValues = z.infer<typeof formSchema>;

const getBfpCategory = (bfp: number, sex: 'male' | 'female') => {
  const categories = sex === 'female' ? 
    { essential: 10, athletes: 14, fitness: 21, average: 25, obese: 32 } :
    { essential: 2, athletes: 6, fitness: 14, average: 18, obese: 25 };

  if (bfp < categories.essential) return { name: 'Below Essential Fat', color: 'bg-red-500' };
  if (bfp < categories.athletes) return { name: 'Essential Fat', color: 'bg-yellow-400' };
  if (bfp < categories.fitness) return { name: 'Athletes', color: 'bg-green-500' };
  if (bfp < categories.average) return { name: 'Fitness', color: 'bg-green-500' };
  if (bfp < categories.obese) return { name: 'Average', color: 'bg-yellow-400' };
  return { name: 'Obese', color: 'bg-red-500' };
};

export default function BodyFatPercentageCalculator() {
  const [result, setResult] = useState<{ bfp: number; category: { name: string; color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: 'male',
      unit: 'cm',
      height: undefined,
      waist: undefined,
      neck: undefined,
      hip: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { sex, unit } = values;
    let { height, waist, neck, hip } = values;
    let bfp;

    if (sex === 'male') {
        if (unit === 'cm') {
            bfp = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
        } else { // inches
            bfp = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
        }
    } else { // female
        if (unit === 'cm') {
            bfp = 495 / (1.29579 - 0.35004 * Math.log10(waist + (hip || 0) - neck) + 0.22100 * Math.log10(height)) - 450;
        } else { // inches
            bfp = 163.205 * Math.log10(waist + (hip || 0) - neck) - 97.684 * Math.log10(height) - 78.387;
        }
    }

    setResult({ bfp, category: getBfpCategory(bfp, sex) });
  };
  
  const sex = form.watch('sex');
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sex" render={({ field }) => (
                <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cm">cm</SelectItem><SelectItem value="in">inches</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="neck" render={({ field }) => (<FormItem><FormLabel>Neck ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            {sex === 'female' && <FormField control={form.control} name="hip" render={({ field }) => (<FormItem><FormLabel>Hip ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />}
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Ruler className="h-8 w-8 text-primary" /><CardTitle>Estimated Body Fat</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.bfp.toFixed(1)}%</p>
                    <p className={`text-2xl font-semibold`}>{result.category.name}</p>
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
    content="Body Fat Percentage Calculator – Find Your Ideal Body Composition"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Calculate your body fat percentage using scientifically validated formulas. Understand your ideal body composition, healthy fat ranges by age and gender, and how to improve your ratio safely through diet and exercise."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Body Fat Percentage Calculator: Discover What Your Numbers Really Mean
  </h2>
  <p itemProp="description">
    Your <strong>body fat percentage</strong> is one of the best indicators of overall health and fitness. Unlike
    weight alone, it tells you how much of your body is made up of fat versus lean mass — giving a more accurate picture
    of your progress and well-being. This guide explains how body fat is calculated, what the ideal percentages are, and
    how to use this information to optimize your health.
  </p>

  <h3 className="font-semibold text-foreground mt-6">💡 What Is Body Fat Percentage?</h3>
  <p>
    Body fat percentage measures the proportion of fat in your body relative to everything else — muscle, bone, water,
    and organs. It’s expressed as a percentage of total body weight.  
    <br />
    Example: If you weigh 70 kg and have 14 kg of fat, your body fat percentage is 20%.
  </p>

  <h3 className="font-semibold text-foreground mt-6">⚙️ How Body Fat Percentage Is Calculated</h3>
  <p>
    The calculator typically uses formulas developed from large-scale research studies. Two popular ones are:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>U.S. Navy Formula:</strong> Based on measurements of waist, neck, and height for men; waist, neck, and hip
      for women.
    </li>
    <li>
      <strong>BMI-based Estimate:</strong> Uses your Body Mass Index and adjusts for gender and age.
    </li>
  </ul>
  <p>
    These formulas estimate fat distribution by correlating circumferences and body proportions with known density
    values.
  </p>

  <h3 className="font-semibold text-foreground mt-6">📊 Healthy Body Fat Percentage Ranges</h3>
  <p>The optimal percentage varies by age and gender:</p>
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse border border-gray-200 text-sm">
      <thead>
        <tr className="bg-muted text-left">
          <th className="border p-2">Category</th>
          <th className="border p-2">Women (%)</th>
          <th className="border p-2">Men (%)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border p-2">Essential Fat</td>
          <td className="border p-2">10–13</td>
          <td className="border p-2">2–5</td>
        </tr>
        <tr>
          <td className="border p-2">Athletes</td>
          <td className="border p-2">14–20</td>
          <td className="border p-2">6–13</td>
        </tr>
        <tr>
          <td className="border p-2">Fitness</td>
          <td className="border p-2">21–24</td>
          <td className="border p-2">14–17</td>
        </tr>
        <tr>
          <td className="border p-2">Average</td>
          <td className="border p-2">25–31</td>
          <td className="border p-2">18–24</td>
        </tr>
        <tr>
          <td className="border p-2">Obese</td>
          <td className="border p-2">32+</td>
          <td className="border p-2">25+</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p>
    These ranges are general guidelines. Ideal targets depend on lifestyle, fitness goals, and body type.
  </p>

  <h3 className="font-semibold text-foreground mt-6">🎯 Why Body Fat Percentage Matters More Than Weight</h3>
  <p>
    Traditional scales only show your total weight — they don’t distinguish between fat and lean mass. Two people can
    weigh the same but have vastly different health profiles. Tracking body fat gives a true measure of progress and
    health risk.
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>High body fat is linked to heart disease, diabetes, and metabolic issues.</li>
    <li>Low lean mass can affect metabolism, posture, and strength.</li>
    <li>Optimal balance supports hormonal function, energy, and longevity.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">🧠 Factors Affecting Body Fat Percentage</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Diet:</strong> Caloric intake, protein consumption, and macronutrient balance have direct effects on fat
      storage and metabolism.
    </li>
    <li>
      <strong>Exercise:</strong> Resistance training builds muscle mass and raises basal metabolic rate.
    </li>
    <li>
      <strong>Hormones:</strong> Thyroid, cortisol, insulin, and sex hormones influence how fat is stored.
    </li>
    <li>
      <strong>Sleep & Stress:</strong> Poor rest and chronic stress can increase fat retention, especially around the
      abdomen.
    </li>
    <li>
      <strong>Age & Genetics:</strong> Natural metabolic slowdown and inherited fat distribution play roles too.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">📉 How to Reduce Body Fat Safely</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Create a small calorie deficit (300–500 cal/day) — slow, steady fat loss is sustainable.</li>
    <li>Prioritize strength training to preserve muscle while losing fat.</li>
    <li>Eat high-protein, fiber-rich foods to improve satiety and metabolism.</li>
    <li>Get 7–8 hours of quality sleep to balance hunger and recovery hormones.</li>
    <li>Track progress every 2–4 weeks — not daily — for realistic trends.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">💪 How to Increase Muscle Mass Without Adding Fat</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Eat in a slight calorie surplus (~200–300 cal/day) focused on lean proteins and complex carbs.</li>
    <li>Train progressively — gradually increase resistance and intensity.</li>
    <li>Include recovery days and stretch to reduce cortisol buildup.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">📏 Body Fat Measurement Methods (Compared)</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Calipers (Skinfold):</strong> Affordable and portable. Accuracy depends on operator skill.
    </li>
    <li>
      <strong>Bioelectrical Impedance (BIA):</strong> Uses electrical signals. Found in many smart scales.
    </li>
    <li>
      <strong>DEXA Scan:</strong> The gold standard for clinical precision but expensive.
    </li>
    <li>
      <strong>Hydrostatic Weighing:</strong> Measures body density via water displacement. Highly accurate.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">🧩 Using Your Results</h3>
  <p>
    Once you know your current body fat percentage, set a realistic target based on your goals:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>General Health:</strong> Men 15–20%, Women 22–28%</li>
    <li><strong>Fitness Goals:</strong> Men 10–15%, Women 18–22%</li>
    <li><strong>Performance / Aesthetic:</strong> Men 8–12%, Women 15–18%</li>
  </ul>
  <p>
    Aim for gradual improvements. A 1–2% reduction per month is considered safe and sustainable.
  </p>

  <h3 className="font-semibold text-foreground mt-6">🧘 Maintaining a Healthy Body Composition</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Balance strength, cardio, and flexibility in your routine.</li>
    <li>Follow a nutrient-dense, minimally processed diet.</li>
    <li>Stay hydrated — dehydration can distort body fat readings.</li>
    <li>Track metrics over time rather than fixating on daily fluctuations.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">⚠️ When to Consult a Professional</h3>
  <p>
    If you’re planning significant weight changes or experience fatigue, hormonal issues, or irregular periods (for
    women), consult a certified nutritionist or healthcare professional.  
    Sudden or extreme fat reduction can harm metabolism and organ function.
  </p>

  <h3 className="font-semibold text-foreground mt-6">📚 FAQs</h3>
  <div className="space-y-3">
    <p>
      <strong>What is a good body fat percentage for men and women?</strong>  
      For men, 10–20% is generally healthy; for women, 18–28% is ideal depending on age and activity level.
    </p>
    <p>
      <strong>How accurate are online body fat calculators?</strong>  
      They offer good estimates based on proven formulas. For medical accuracy, use DEXA or hydrostatic testing.
    </p>
    <p>
      <strong>How often should I measure my body fat?</strong>  
      Every 3–4 weeks is ideal. Measuring too frequently can lead to stress over natural fluctuations.
    </p>
    <p>
      <strong>Can you be skinny but have high body fat?</strong>  
      Yes — this is known as “skinny fat.” It means low muscle mass but high fat percentage, often due to lack of
      strength training.
    </p>
    <p>
      <strong>What’s more important: BMI or body fat percentage?</strong>  
      Body fat percentage is more accurate since BMI can’t distinguish between muscle and fat.
    </p>
  </div>

  <p className="italic">
    Disclaimer: This calculator and information are for general fitness and educational purposes only. Always consult
    your healthcare provider before making major changes to your diet or exercise routine.
  </p>
</section>
    </div>
  );
}
