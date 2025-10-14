'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  glucose: z.number().positive(),
  unit: z.enum(['mg/dL', 'mmol/L']),
  type: z.enum(['fasting', 'random', 'average'])
});
type FormValues = z.infer<typeof formSchema>;

export default function BloodSugarToHbA1cConverter() {
  const [conversion, setConversion] = useState<{ hba1c: number; category: string; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      glucose: undefined, 
      unit: 'mg/dL', 
      type: 'average' 
    } 
  });

  const onSubmit = (v: FormValues) => {
    let glucoseInMgDl = v.glucose;
    if (v.unit === 'mmol/L') {
      glucoseInMgDl = v.glucose * 18.018; // Convert mmol/L to mg/dL
    }
    
    // Convert to HbA1c using the formula: HbA1c = (glucose + 46.7) / 28.7
    // This is a simplified conversion and may not be accurate for all individuals
    const hba1c = (glucoseInMgDl + 46.7) / 28.7;
    
    let category = 'Normal';
    let interpretation = '';
    
    if (hba1c < 5.7) {
      category = 'Normal';
      interpretation = 'Normal glucose metabolism';
    } else if (hba1c < 6.5) {
      category = 'Prediabetes';
      interpretation = 'Increased risk of diabetes';
    } else {
      category = 'Diabetes';
      interpretation = 'Diabetes range';
    }
    
    let opinion = 'Your estimated HbA1c suggests normal glucose metabolism. Continue maintaining a healthy lifestyle.';
    if (category === 'Prediabetes') {
      opinion = 'Your estimated HbA1c indicates prediabetes. Focus on lifestyle modifications including diet and exercise to prevent progression to diabetes.';
    } else if (category === 'Diabetes') {
      opinion = 'Your estimated HbA1c suggests diabetes range. Please consult with a healthcare provider for proper evaluation and management.';
    }
    
    setConversion({ hba1c, category, interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="glucose" render={({ field }) => (
              <FormItem><FormLabel>Blood Glucose Level</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
              <FormItem><FormLabel>Unit</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mg/dL">mg/dL</SelectItem><SelectItem value="mmol/L">mmol/L</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem><FormLabel>Measurement Type</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fasting">Fasting</SelectItem><SelectItem value="random">Random</SelectItem><SelectItem value="average">Average</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Convert to HbA1c</Button>
        </form>
      </Form>

      {conversion && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Droplets className="h-8 w-8 text-primary" /><CardTitle>HbA1c Estimation</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div><p className="text-2xl font-bold">{conversion.hba1c.toFixed(1)}%</p><p className="text-sm text-muted-foreground">Estimated HbA1c</p></div>
              <div><p className="text-2xl font-bold">{conversion.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
            </div>
            <CardDescription className="text-center mb-2">{conversion.interpretation}</CardDescription>
            <CardDescription className="text-center">{conversion.opinion}</CardDescription>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-center">
                <strong>Note:</strong> This is an estimation based on a mathematical formula. 
                Actual HbA1c values may vary. Consult your healthcare provider for accurate diagnosis and management.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <RelatedCalculators />
        <BloodSugarGuide />
        <EmbedWidget calculatorSlug="blood-sugar-to-hba1c-converter" calculatorName="Blood Sugar to HbA1c Converter" />
      </div>
    </div>
  );
}

function RelatedCalculators() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Calculators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/category/health-fitness/diabetes-risk-type2-calculator" className="text-primary underline hover:text-primary/80">
            Diabetes Risk (Type 2) Calculator
          </Link>
          <Link href="/category/health-fitness/glycemic-load-calculator" className="text-primary underline hover:text-primary/80">
            Glycemic Load Calculator
          </Link>
          <Link href="/category/health-fitness/meal-glycemic-load-calculator" className="text-primary underline hover:text-primary/80">
            Meal Glycemic Load Calculator
          </Link>
          <Link href="/category/health-fitness/bmi-calculator" className="text-primary underline hover:text-primary/80">
            Body Mass Index (BMI) Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function BloodSugarGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Blood Sugar to HbA1c Converter – Understanding Long-term Glucose Control" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to convert blood glucose levels to estimated HbA1c values, understand diabetes categories, and interpret long-term blood sugar control." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Blood Sugar and HbA1c</h2>
      <p itemProp="description">Blood glucose levels fluctuate throughout the day, while HbA1c (hemoglobin A1c) provides a 2-3 month average of blood sugar control. This converter helps estimate HbA1c from glucose measurements, though actual lab testing is more accurate.</p>

      <h3 className="font-semibold text-foreground mt-6">Blood Glucose Measurements</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Fasting Glucose: Measured after 8+ hours without food</li>
        <li>Random Glucose: Measured at any time regardless of meals</li>
        <li>Postprandial: Measured 1-2 hours after eating</li>
        <li>Average Glucose: Estimated average over time</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">HbA1c Categories</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Normal: Less than 5.7% - Low diabetes risk</li>
        <li>Prediabetes: 5.7-6.4% - Increased diabetes risk, lifestyle intervention recommended</li>
        <li>Diabetes: 6.5% or higher - Diabetes diagnosis, medical management required</li>
        <li>Well-controlled diabetes: Less than 7% - Good management for most people</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Conversion Limitations</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Mathematical formulas provide estimates only</li>
        <li>Individual variations in hemoglobin glycation rates</li>
        <li>Factors like anemia, kidney disease, or recent blood loss affect accuracy</li>
        <li>Single glucose measurements don't reflect long-term patterns</li>
        <li>Actual HbA1c testing is more reliable for diagnosis</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Blood Sugar Management</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Balanced diet: Focus on complex carbohydrates and fiber</li>
        <li>Regular meals: Avoid skipping meals or large gaps</li>
        <li>Physical activity: Helps improve insulin sensitivity</li>
        <li>Weight management: Maintain healthy BMI</li>
        <li>Stress management: Chronic stress affects blood sugar</li>
        <li>Regular monitoring: Track patterns and trends</li>
        <li>Medication compliance: Take prescribed medications as directed</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">When to Seek Medical Advice</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Fasting glucose consistently above 126 mg/dL</li>
        <li>Random glucose above 200 mg/dL with symptoms</li>
        <li>HbA1c above 6.5% on lab testing</li>
        <li>Symptoms of diabetes: increased thirst, urination, fatigue</li>
        <li>Family history of diabetes</li>
        <li>Existing prediabetes or metabolic syndrome</li>
      </ul>
    </section>
  );
}
