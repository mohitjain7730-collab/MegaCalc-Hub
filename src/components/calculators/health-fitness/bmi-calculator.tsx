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
import { Scale, ArrowUp, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const getBmiCategory = (bmi: number) => {
  if (bmi < 18.5) return { name: 'Underweight', color: 'bg-yellow-400' };
  if (bmi < 25) return { name: 'Normal weight', color: 'bg-green-500' };
  if (bmi < 30) return { name: 'Overweight', color: 'bg-orange-500' };
  return { name: 'Obese', color: 'bg-red-500' };
};

const BmiChart = ({ bmiValue }: { bmiValue: number }) => {
    const categories = [
        { name: 'Underweight', range: '< 18.5', min: 10, max: 18.5, color: 'bg-yellow-400' },
        { name: 'Normal', range: '18.5 - 24.9', min: 18.5, max: 25, color: 'bg-green-500' },
        { name: 'Overweight', range: '25 - 29.9', min: 25, max: 30, color: 'bg-orange-500' },
        { name: 'Obese', range: '30+', min: 30, max: 40, color: 'bg-red-500' },
    ];
    
    const totalRange = 30; // from 10 to 40
    const position = Math.max(0, Math.min(100, ((bmiValue - 10) / totalRange) * 100));

    return (
        <div className="w-full mt-6">
            <div className="relative h-8 w-full flex rounded-full overflow-hidden">
                {categories.map((cat, index) => (
                    <div key={index} className={`${cat.color} h-full`} style={{ width: `${((cat.max - cat.min) / totalRange) * 100}%` }}></div>
                ))}
            </div>
             <div className="relative h-4 w-full" style={{ left: `${position}%` }}>
                <ArrowUp className="h-6 w-6 -ml-3 text-foreground" />
                <span className="absolute -ml-4 mt-1 text-xs font-bold">{bmiValue.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-4">
                 {categories.map((cat, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                        <span className='font-bold'>{cat.name}</span>
                        <span>{cat.range}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function BmiCalculator() {
  const [result, setResult] = useState<{ bmi: number; category: { name: string; color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      weight: undefined,
      height: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { weight, height, unit } = values;
    let bmi;
    if (unit === 'metric') {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
    } else {
      bmi = (weight / (height * height)) * 703;
    }
    setResult({ bmi, category: getBmiCategory(bmi) });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your BMI
          </CardTitle>
          <CardDescription>
            Enter your height and weight to determine your Body Mass Index
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="metric">Metric (kg, cm)</SelectItem><SelectItem value="imperial">Imperial (lbs, in)</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem><FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit">Calculate BMI</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Scale className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your BMI Result</CardTitle>
                  <CardDescription>Body Mass Index assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2 mb-6">
                    <p className="text-4xl font-bold">{result.bmi.toFixed(1)}</p>
                    <p className={`text-2xl font-semibold`}>{result.category.name}</p>
                </div>
                 <BmiChart bmiValue={result.bmi} />
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
              <h4 className="font-semibold text-foreground mb-2">Units</h4>
              <p className="text-muted-foreground">
                Choose between Metric (kilograms and centimeters) or Imperial (pounds and inches) systems for your measurements. The calculator will convert appropriately—just make sure you're consistent: if you use pounds for weight, use inches for height.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Weight</h4>
              <p className="text-muted-foreground">
                Your current body weight in either kilograms or pounds. For best accuracy, weigh yourself at the same time of day (preferably morning, after using the bathroom and before eating). Weight can fluctuate daily, so a recent average is often more useful than a single measurement.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Height</h4>
              <p className="text-muted-foreground">
                Your current height in either centimeters or inches. Height should be measured standing straight with your back against a wall, looking straight ahead. For adults, height doesn't change significantly after full growth, but ensure you're using an accurate measurement.
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
                  <a href="/category/health-fitness/bmr-calculator" className="text-primary hover:underline">
                    BMR Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your Basal Metabolic Rate to understand your calorie needs at rest.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                    Body Fat Percentage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Get a more accurate assessment of body composition beyond BMI.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your total daily energy expenditure for weight management.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine your optimal protein intake to support body composition goals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Complete Guide to BMI
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">Understanding BMI</h2>
            <p>BMI is a simple height‑to‑weight index used at a population level to screen for weight categories. It does <strong>not</strong> measure body fat or health directly.</p>

            <h3 className="font-semibold text-foreground mt-6">Strengths</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Fast, inexpensive, and consistent across large groups.</li>
              <li>Correlates with disease risk at a population level.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Limitations</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Cannot distinguish muscle from fat; athletes may read "overweight."</li>
              <li>Does not reflect fat distribution; abdominal fat is more strongly linked to risk.</li>
              <li>Cutoffs may vary across ethnic groups; discuss results with a healthcare professional.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Better Context: Combine With Other Measures</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Waist circumference</strong> and <strong>waist‑to‑height ratio</strong> (target ≤0.5) for central adiposity.</li>
              <li><strong>Body composition</strong> estimates (DEXA, BIA, skinfolds) when available.</li>
              <li>Fitness, labs, sleep, and lifestyle patterns.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Next Steps</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Define a realistic goal (performance, health, aesthetics).</li>
              <li>Set nutrition and training targets that match the goal—see related tools below.</li>
              <li>Follow up with your clinician for individualized guidance.</li>
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
              Common questions about BMI and body composition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a healthy BMI range?</h4>
              <p className="text-muted-foreground">
                For adults, a BMI between 18.5 and 24.9 is generally considered normal weight. Below 18.5 is underweight, 25-29.9 is overweight, and 30 or above is obese. However, these are general guidelines and don't account for muscle mass, body composition, or individual health factors. Some people with a BMI in the "normal" range may have health issues, while others with a BMI in the "overweight" range may be healthy.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why might BMI be inaccurate for athletes?</h4>
              <p className="text-muted-foreground">
                BMI doesn't distinguish between muscle and fat. Athletes and very active people often have high muscle mass, which weighs more than fat. This can push their BMI into the "overweight" or even "obese" category even though they have low body fat and excellent health. Bodybuilders are a classic example—many would be classified as "obese" by BMI despite having very low body fat percentages.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is BMI different for men and women?</h4>
              <p className="text-muted-foreground">
                The BMI formula and categories are the same for men and women. However, women naturally tend to have higher body fat percentages than men at the same BMI, due to different body composition and hormonal profiles. This is why BMI is often used alongside other measurements like waist circumference or body fat percentage for a more complete picture.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can BMI be used for children and teenagers?</h4>
              <p className="text-muted-foreground">
                BMI calculations for children and teenagers (ages 2-20) are interpreted differently than for adults. They use percentile charts that account for age and sex, since children's body composition changes as they grow. This calculator is designed for adults. For children, consult pediatric BMI percentile charts or speak with a healthcare provider.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's more important: BMI or body fat percentage?</h4>
              <p className="text-muted-foreground">
                Body fat percentage generally provides a more accurate picture of health and fitness than BMI because it distinguishes between fat and muscle. However, BMI is useful for population-level screening and is more accessible (doesn't require special equipment). For individual health assessment, a combination of BMI, body fat percentage, waist circumference, and other health markers provides the most complete picture.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I have a normal BMI but still be unhealthy?</h4>
              <p className="text-muted-foreground">
                Yes. This is called "normal weight obesity" or being "skinny fat"—having a normal BMI but high body fat percentage and low muscle mass. These individuals may have metabolic health issues despite normal weight. This is why focusing solely on weight or BMI isn't sufficient—body composition, fitness level, and health markers matter more than the BMI number alone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I check my BMI?</h4>
              <p className="text-muted-foreground">
                For adults whose height has stabilized, BMI only changes when weight changes. Checking monthly is sufficient for tracking progress. More frequent measurements aren't necessary since daily weight fluctuations are normal and mostly due to water weight, not actual body composition changes. Focus on trends over weeks and months rather than daily fluctuations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does BMI account for age?</h4>
              <p className="text-muted-foreground">
                The standard BMI formula doesn't include age, and the same categories apply to all adults. However, research suggests that slightly higher BMIs (25-27) may be associated with better survival in older adults (65+), possibly because some extra weight can be protective during illness. This doesn't mean BMI thresholds should change for individuals, but context matters—discuss results with your healthcare provider.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can BMI predict health risks?</h4>
              <p className="text-muted-foreground">
                BMI correlates with health risks at a population level—higher BMI is associated with increased risk of heart disease, diabetes, and other conditions. However, for individuals, BMI is just one risk factor among many. Family history, fitness level, body fat distribution, blood pressure, cholesterol, and lifestyle factors all contribute to health risk. Don't use BMI alone to assess your health risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I try to change my BMI?</h4>
              <p className="text-muted-foreground">
                It depends on your individual situation. If your BMI falls outside the normal range and you have related health concerns, improving it through sustainable lifestyle changes (balanced nutrition, regular exercise) can be beneficial. However, if you're an athlete or very active person with a high BMI due to muscle mass, there's no need to change it. Focus on overall health, body composition, and how you feel rather than chasing a specific BMI number.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
