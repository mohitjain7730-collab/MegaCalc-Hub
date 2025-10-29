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
import { Ruler, Info, Target, BarChart3, HelpCircle, Users } from 'lucide-react';
import Link from 'next/link';

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
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Body Fat Percentage
          </CardTitle>
          <CardDescription>
            Use body measurements to estimate your body fat percentage using the U.S. Navy method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="sex" render={({ field }) => (
                    <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cm">Centimeters (cm)</SelectItem><SelectItem value="in">Inches (in)</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="neck" render={({ field }) => (<FormItem><FormLabel>Neck ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                {sex === 'female' && <FormField control={form.control} name="hip" render={({ field }) => (<FormItem><FormLabel>Hip ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />}
              </div>
              <Button type="submit">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Ruler className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Estimated Body Fat Percentage</CardTitle>
                  <CardDescription>Based on U.S. Navy body fat formula</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.bfp.toFixed(1)}%</p>
                    <p className={`text-2xl font-semibold`}>{result.category.name}</p>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">This is an estimate based on body measurements. For clinical accuracy, consult with a healthcare provider or use more precise methods like DEXA scanning.</p>
                    </div>
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
              <h4 className="font-semibold text-foreground mb-2">Sex</h4>
              <p className="text-muted-foreground">
                The U.S. Navy body fat formula uses different equations for men and women because body composition and fat distribution patterns differ between sexes. Women naturally have higher essential body fat percentages and different fat distribution patterns, which the formula accounts for.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Height</h4>
              <p className="text-muted-foreground">
                Your height provides a reference point for the formula. Taller individuals need larger measurements for the same body fat percentage, so height normalizes the calculations. Measure standing straight, without shoes, against a wall.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Waist Measurement</h4>
              <p className="text-muted-foreground">
                Measure at the narrowest point of your waist (usually just above the belly button) while standing relaxed. For men, this is typically at the navel level. This measurement is crucial because abdominal fat is a key indicator of body composition and health risk.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Neck Measurement</h4>
              <p className="text-muted-foreground">
                Measure just below the larynx (Adam's apple) with the tape measure perpendicular to the long axis of the neck. The neck measurement serves as a reference point that's relatively lean, helping the formula estimate overall body fat based on the difference from waist measurements.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Hip Measurement (Females Only)</h4>
              <p className="text-muted-foreground">
                Women need to measure their hips at the widest part of the buttocks, with feet together. This is included because women tend to store more fat in the hip/thigh area, and this measurement helps the formula provide a more accurate estimate of overall body fat distribution.
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
              Explore other body composition and health calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                    BMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your Body Mass Index as a complement to body fat percentage.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your total daily energy expenditure to support body composition goals.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine your optimal protein intake to support muscle maintenance and fat loss.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Balance your macronutrients to optimize body composition changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Complete Guide to Body Fat Percentage
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">Body Fat Percentage Calculator: Discover What Your Numbers Really Mean</h2>
            <p>Your <strong>body fat percentage</strong> is one of the best indicators of overall health and fitness. Unlike
              weight alone, it tells you how much of your body is made up of fat versus lean mass — giving a more accurate picture
              of your progress and well-being. This guide explains how body fat is calculated, what the ideal percentages are, and
              how to use this information to optimize your health.</p>

            <h3 className="font-semibold text-foreground mt-6">💡 What Is Body Fat Percentage?</h3>
            <p>Body fat percentage measures the proportion of fat in your body relative to everything else — muscle, bone, water,
              and organs. It's expressed as a percentage of total body weight.<br />
              Example: If you weigh 70 kg and have 14 kg of fat, your body fat percentage is 20%.</p>

            <h3 className="font-semibold text-foreground mt-6">⚙️ How Body Fat Percentage Is Calculated</h3>
            <p>The calculator typically uses formulas developed from large-scale research studies. Two popular ones are:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>U.S. Navy Formula:</strong> Based on measurements of waist, neck, and height for men; waist, neck, and hip for women.</li>
              <li><strong>BMI-based Estimate:</strong> Uses your Body Mass Index and adjusts for gender and age.</li>
            </ul>
            <p>These formulas estimate fat distribution by correlating circumferences and body proportions with known density values.</p>

            <h3 className="font-semibold text-foreground mt-6">📊 Healthy Body Fat Percentage Ranges</h3>
            <p>The optimal percentage varies by age and gender:</p>
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
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
            <p>These ranges are general guidelines. Ideal targets depend on lifestyle, fitness goals, and body type.</p>

            <h3 className="font-semibold text-foreground mt-6">🎯 Why Body Fat Percentage Matters More Than Weight</h3>
            <p>Traditional scales only show your total weight — they don't distinguish between fat and lean mass. Two people can
              weigh the same but have vastly different health profiles. Tracking body fat gives a true measure of progress and
              health risk.</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>High body fat is linked to heart disease, diabetes, and metabolic issues.</li>
              <li>Low lean mass can affect metabolism, posture, and strength.</li>
              <li>Optimal balance supports hormonal function, energy, and longevity.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">🧠 Factors Affecting Body Fat Percentage</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Diet:</strong> Caloric intake, protein consumption, and macronutrient balance have direct effects on fat storage and metabolism.</li>
              <li><strong>Exercise:</strong> Resistance training builds muscle mass and raises basal metabolic rate.</li>
              <li><strong>Hormones:</strong> Thyroid, cortisol, insulin, and sex hormones influence how fat is stored.</li>
              <li><strong>Sleep & Stress:</strong> Poor rest and chronic stress can increase fat retention, especially around the abdomen.</li>
              <li><strong>Age & Genetics:</strong> Natural metabolic slowdown and inherited fat distribution play roles too.</li>
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
              <li><strong>Calipers (Skinfold):</strong> Affordable and portable. Accuracy depends on operator skill.</li>
              <li><strong>Bioelectrical Impedance (BIA):</strong> Uses electrical signals. Found in many smart scales.</li>
              <li><strong>DEXA Scan:</strong> The gold standard for clinical precision but expensive.</li>
              <li><strong>Hydrostatic Weighing:</strong> Measures body density via water displacement. Highly accurate.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">🧩 Using Your Results</h3>
            <p>Once you know your current body fat percentage, set a realistic target based on your goals:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>General Health:</strong> Men 15–20%, Women 22–28%</li>
              <li><strong>Fitness Goals:</strong> Men 10–15%, Women 18–22%</li>
              <li><strong>Performance / Aesthetic:</strong> Men 8–12%, Women 15–18%</li>
            </ul>
            <p>Aim for gradual improvements. A 1–2% reduction per month is considered safe and sustainable.</p>

            <h3 className="font-semibold text-foreground mt-6">🧘 Maintaining a Healthy Body Composition</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Balance strength, cardio, and flexibility in your routine.</li>
              <li>Follow a nutrient-dense, minimally processed diet.</li>
              <li>Stay hydrated — dehydration can distort body fat readings.</li>
              <li>Track metrics over time rather than fixating on daily fluctuations.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">⚠️ When to Consult a Professional</h3>
            <p>If you're planning significant weight changes or experience fatigue, hormonal issues, or irregular periods (for
              women), consult a certified nutritionist or healthcare professional.<br />
              Sudden or extreme fat reduction can harm metabolism and organ function.</p>
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
              Common questions about body fat percentage and body composition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a good body fat percentage for men and women?</h4>
              <p className="text-muted-foreground">
                For men, 10–20% is generally healthy; for women, 18–28% is ideal depending on age and activity level. Essential fat is lower (2-5% for men, 10-13% for women) but necessary for basic health. Athletes typically have 6-13% (men) or 14-20% (women), while fitness enthusiasts maintain 14-17% (men) or 21-24% (women). These ranges balance health, performance, and sustainability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How accurate are online body fat calculators?</h4>
              <p className="text-muted-foreground">
                They offer good estimates based on proven formulas. The U.S. Navy formula used here is generally accurate within 3-5% for most people, though accuracy can vary based on measurement technique and individual body composition patterns. For medical accuracy or precise tracking, use DEXA, hydrostatic weighing, or other clinical methods. However, for most fitness purposes, these estimates are quite useful.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I measure my body fat?</h4>
              <p className="text-muted-foreground">
                Every 3–4 weeks is ideal. Measuring too frequently can lead to stress over natural fluctuations. Body fat percentage changes slowly, so daily or weekly measurements aren't necessary and can be discouraging due to normal variation. Monthly measurements provide meaningful trends without unnecessary anxiety. Measure at the same time of day and under similar conditions for consistency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can you be skinny but have high body fat?</h4>
              <p className="text-muted-foreground">
                Yes — this is known as "skinny fat" or "normal weight obesity." It means low muscle mass but high fat percentage, often due to lack of strength training. Someone can have a "normal" BMI but still have 25%+ body fat if they have little muscle. This is why body fat percentage provides better health insight than weight or BMI alone—it reveals body composition.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's more important: BMI or body fat percentage?</h4>
              <p className="text-muted-foreground">
                Body fat percentage is more accurate since BMI can't distinguish between muscle and fat. However, they're complementary—BMI is useful for population screening, while body fat percentage gives individual insight. For personal health tracking, body fat percentage, waist circumference, and fitness markers together provide the best picture of health and progress.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why does the formula require different measurements for men and women?</h4>
              <p className="text-muted-foreground">
                Women naturally store more fat in the hip/thigh area, while men tend to store more in the abdomen. The formula accounts for these different fat distribution patterns by including hip measurements for women. Additionally, women have higher essential fat requirements due to reproductive and hormonal functions, which the formula factors into its calculations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I measure accurately for best results?</h4>
              <p className="text-muted-foreground">
                Use a flexible measuring tape (not a metal ruler). Measure in the morning before eating or drinking, while standing naturally (don't suck in your stomach or pull the tape tight). For waist: measure at the narrowest point (usually at the navel). For neck: just below the larynx, perpendicular to the neck. For hips (women): at the widest point of the buttocks. Consistency in measurement technique is key.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can body fat percentage change daily?</h4>
              <p className="text-muted-foreground">
                Measured values can fluctuate daily due to hydration, time of day, recent meals, and measurement technique, but actual body fat changes very slowly. Day-to-day variations of 1-2% are normal and mostly due to water weight or measurement inconsistency. Focus on trends over weeks and months rather than daily changes. The actual fat tissue doesn't change that rapidly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is it possible to have too low body fat?</h4>
              <p className="text-muted-foreground">
                Yes. Essential fat is necessary for basic health—dropping below essential fat levels can impair hormonal function, immune system, and organ function. For men, staying above 5-8% for extended periods is important; for women, staying above 12-15% is crucial for menstrual function and overall health. Very low body fat (common in competitive bodybuilding) should be temporary, not a long-term state.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does age affect body fat percentage?</h4>
              <p className="text-muted-foreground">
                As you age, maintaining the same body fat percentage typically requires more effort due to natural muscle loss (sarcopenia) and metabolic slowdown. However, the healthy ranges themselves don't change dramatically with age. Older adults may want to prioritize maintaining or increasing muscle mass through strength training, which helps keep body fat percentage in a healthy range even as total weight may change.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
