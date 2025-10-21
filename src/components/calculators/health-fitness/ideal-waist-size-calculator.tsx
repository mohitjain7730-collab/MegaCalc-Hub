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
import { Ruler, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  gender: z.enum(['male', 'female']),
  height: z.number().positive(),
  weight: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  currentWaist: z.number().positive(),
  age: z.number().min(18).max(100),
  ethnicity: z.enum(['caucasian', 'asian', 'african', 'hispanic', 'other']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
});

type FormValues = z.infer<typeof formSchema>;

const calculateIdealWaist = (values: FormValues) => {
  // Convert to metric if needed
  let heightCm = values.height;
  let weightKg = values.weight;
  
  if (values.unit === 'imperial') {
    heightCm = values.height * 2.54;
    weightKg = values.weight * 0.453592;
  }

  // Calculate BMI
  const bmi = weightKg / ((heightCm / 100) ** 2);
  
  // Ideal waist circumference based on gender and ethnicity
  let idealWaistCm;
  let maxWaistCm;
  
  if (values.gender === 'male') {
    if (values.ethnicity === 'asian') {
      idealWaistCm = heightCm * 0.42; // 42% of height for Asian men
      maxWaistCm = heightCm * 0.50; // 50% of height for Asian men
    } else {
      idealWaistCm = heightCm * 0.45; // 45% of height for other men
      maxWaistCm = heightCm * 0.53; // 53% of height for other men
    }
  } else {
    if (values.ethnicity === 'asian') {
      idealWaistCm = heightCm * 0.40; // 40% of height for Asian women
      maxWaistCm = heightCm * 0.48; // 48% of height for Asian women
    } else {
      idealWaistCm = heightCm * 0.43; // 43% of height for other women
      maxWaistCm = heightCm * 0.51; // 51% of height for other women
    }
  }

  // Convert back to user's preferred unit
  let idealWaist = idealWaistCm;
  let maxWaist = maxWaistCm;
  let currentWaistCm = values.currentWaist;
  
  if (values.unit === 'imperial') {
    idealWaist = idealWaistCm / 2.54;
    maxWaist = maxWaistCm / 2.54;
    currentWaistCm = values.currentWaist * 2.54;
  }

  // Determine status
  let status = 'optimal';
  let statusColor = 'text-green-600';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let icon = CheckCircle;
  
  if (currentWaistCm > maxWaistCm) {
    status = 'high_risk';
    statusColor = 'text-red-600';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    icon = AlertTriangle;
  } else if (currentWaistCm > idealWaistCm * 1.1) {
    status = 'elevated';
    statusColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    icon = AlertTriangle;
  }

  // Calculate difference
  const difference = values.currentWaist - idealWaist;
  const differencePercent = ((values.currentWaist - idealWaist) / idealWaist) * 100;

  return {
    idealWaist,
    maxWaist,
    currentWaist: values.currentWaist,
    difference,
    differencePercent,
    status,
    statusColor,
    bgColor,
    borderColor,
    icon,
    bmi,
    heightCm,
    weightKg
  };
};

const getRecommendations = (result: ReturnType<typeof calculateIdealWaist>, values: FormValues) => {
  const recommendations = [];
  
  if (result.status === 'high_risk') {
    recommendations.push('Immediate lifestyle changes recommended');
    recommendations.push('Consult with healthcare provider for personalized plan');
    recommendations.push('Focus on reducing abdominal fat through diet and exercise');
  } else if (result.status === 'elevated') {
    recommendations.push('Moderate lifestyle modifications suggested');
    recommendations.push('Increase physical activity, especially core exercises');
    recommendations.push('Monitor waist circumference monthly');
  } else {
    recommendations.push('Maintain current healthy lifestyle');
    recommendations.push('Continue regular exercise and balanced diet');
    recommendations.push('Monitor waist size to prevent future increases');
  }

  if (result.difference > 0) {
    recommendations.push(`Aim to reduce waist circumference by ${Math.abs(result.difference).toFixed(1)} ${values.unit === 'imperial' ? 'inches' : 'cm'}`);
  }

  if (values.activityLevel === 'sedentary') {
    recommendations.push('Increase daily physical activity');
  }

  return recommendations;
};

export default function IdealWaistSizeCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateIdealWaist> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: undefined,
      height: undefined,
      weight: undefined,
      unit: 'metric',
      currentWaist: undefined,
      age: undefined,
      ethnicity: undefined,
      activityLevel: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateIdealWaist(values);
    setResult(calculation);
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="unit" render={({ field }) => (
            <FormItem>
              <FormLabel>Unit System</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit system" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                  <SelectItem value="imperial">Imperial (inches, lbs)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="height" render={({ field }) => (
              <FormItem>
                <FormLabel>Height ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="weight" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="currentWaist" render={({ field }) => (
            <FormItem>
              <FormLabel>Current Waist Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="ethnicity" render={({ field }) => (
              <FormItem>
                <FormLabel>Ethnicity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ethnicity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="caucasian">Caucasian</SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="african">African</SelectItem>
                    <SelectItem value="hispanic">Hispanic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="activityLevel" render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Light Activity</SelectItem>
                    <SelectItem value="moderate">Moderate Activity</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="very_active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <Button type="submit" className="w-full">
            <Ruler className="mr-2 h-4 w-4" />
            Calculate Ideal Waist Size
          </Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <result.icon className={`h-5 w-5 ${result.statusColor}`} />
              Waist Size Analysis
            </CardTitle>
            <CardDescription>
              Your waist circumference analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-4 rounded-lg border ${result.bgColor} ${result.borderColor}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Current Waist</p>
                  <p className="text-2xl font-bold">{result.currentWaist.toFixed(1)} {unit === 'metric' ? 'cm' : 'in'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ideal Waist</p>
                  <p className="text-2xl font-bold text-green-600">{result.idealWaist.toFixed(1)} {unit === 'metric' ? 'cm' : 'in'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Maximum Safe</p>
                  <p className="text-2xl font-bold text-orange-600">{result.maxWaist.toFixed(1)} {unit === 'metric' ? 'cm' : 'in'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Status Assessment</h3>
              <div className={`p-4 rounded-lg border ${result.bgColor} ${result.borderColor}`}>
                <p className={`font-semibold ${result.statusColor}`}>
                  {result.status === 'optimal' && 'Optimal Waist Size'}
                  {result.status === 'elevated' && 'Elevated Risk'}
                  {result.status === 'high_risk' && 'High Risk'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.status === 'optimal' && 'Your waist circumference is within the healthy range for your height and gender.'}
                  {result.status === 'elevated' && 'Your waist circumference is above the ideal range and may increase health risks.'}
                  {result.status === 'high_risk' && 'Your waist circumference indicates high risk for metabolic and cardiovascular diseases.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Recommendations</h3>
              <ul className="space-y-2">
                {getRecommendations(result, form.getValues()).map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Gender</h4>
                <p>Men and women have different ideal waist-to-height ratios due to body composition differences.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Height</h4>
                <p>Ideal waist size is calculated as a percentage of your height, making it proportional to your body frame.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Current Waist</h4>
                <p>Measure at the narrowest point between your ribs and hips, or at the navel if no narrow point exists.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Ethnicity</h4>
                <p>Different ethnic groups have varying body compositions and metabolic risk factors.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="how-it-works">
          <AccordionTrigger>How the Calculation Works</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p>The ideal waist size is calculated as a percentage of your height:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Men (Non-Asian):</strong> 45% of height (ideal), 53% (maximum)</li>
                <li><strong>Men (Asian):</strong> 42% of height (ideal), 50% (maximum)</li>
                <li><strong>Women (Non-Asian):</strong> 43% of height (ideal), 51% (maximum)</li>
                <li><strong>Women (Asian):</strong> 40% of height (ideal), 48% (maximum)</li>
              </ul>
              <p>These ratios are based on research showing optimal health outcomes and reduced disease risk.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="health-risks">
          <AccordionTrigger>Health Risks of Large Waist Size</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p>Excess abdominal fat is associated with increased risk of:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Type 2 Diabetes:</strong> Abdominal fat affects insulin sensitivity</li>
                <li><strong>Heart Disease:</strong> Increased cardiovascular risk factors</li>
                <li><strong>High Blood Pressure:</strong> Metabolic syndrome components</li>
                <li><strong>Stroke:</strong> Vascular complications</li>
                <li><strong>Certain Cancers:</strong> Hormonal and inflammatory factors</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p><a href="https://www.heart.org/en/healthy-living/healthy-eating/lose-weight/waist-to-height-ratio" className="text-primary underline" target="_blank" rel="noopener noreferrer">American Heart Association - Waist-to-Height Ratio</a></p>
              <p><a href="https://www.nhs.uk/live-well/healthy-weight/why-waist-size-matters/" className="text-primary underline" target="_blank" rel="noopener noreferrer">NHS - Why Waist Size Matters</a></p>
              <p><a href="https://www.cdc.gov/healthyweight/assessing/bmi/adult_bmi/index.html" className="text-primary underline" target="_blank" rel="noopener noreferrer">CDC - Adult BMI Calculator</a></p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section itemScope itemType="https://schema.org/Article">
        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Ideal Waist Size</h2>
        <p itemProp="description">Your waist circumference is a crucial indicator of health, often more important than BMI alone. It directly measures abdominal fat, which is linked to metabolic and cardiovascular risks.</p>

        <h3 className="font-semibold text-foreground mt-6">Why Waist Size Matters</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Metabolic Health:</strong> Abdominal fat affects insulin sensitivity and glucose metabolism</li>
          <li><strong>Cardiovascular Risk:</strong> Central obesity increases heart disease and stroke risk</li>
          <li><strong>Inflammation:</strong> Visceral fat produces inflammatory markers</li>
          <li><strong>Hormonal Impact:</strong> Affects hormone production and regulation</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Measurement Guidelines</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Measure at the narrowest point between ribs and hips</li>
          <li>If no narrow point, measure at the navel level</li>
          <li>Stand straight, breathe normally, and measure after exhaling</li>
          <li>Use a flexible, non-stretchy measuring tape</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/waist-to-hip-ratio-calculator" className="text-primary underline">Waist-to-Hip Ratio Calculator</Link></p>
          <p><Link href="/category/health-fitness/waist-to-height-ratio-calculator" className="text-primary underline">Waist-to-Height Ratio Calculator</Link></p>
          <p><Link href="/category/health-fitness/bmi-calculator" className="text-primary underline">BMI Calculator</Link></p>
          <p><Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="ideal-waist-size-calculator" calculatorName="Ideal Waist Size Calculator" />
    </div>
  );
}
