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
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  systolic: z.number().positive(),
  diastolic: z.number().positive(),
  age: z.number().positive(),
  gender: z.enum(['male', 'female']),
  smoking: z.enum(['yes', 'no']),
  diabetes: z.enum(['yes', 'no'])
});
type FormValues = z.infer<typeof formSchema>;

export default function BloodPressureRiskCalculator() {
  const [risk, setRisk] = useState<{ category: string; riskLevel: string; recommendations: string[]; opinion: string } | null>(null);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      systolic: undefined, 
      diastolic: undefined, 
      age: undefined, 
      gender: 'male', 
      smoking: 'no', 
      diabetes: 'no' 
    } 
  });

  const onSubmit = (v: FormValues) => {
    let category = 'Normal';
    let riskLevel = 'Low';
    let recommendations: string[] = [];
    
    // Blood pressure categories
    if (v.systolic < 120 && v.diastolic < 80) {
      category = 'Normal';
      riskLevel = 'Low';
    } else if (v.systolic < 130 && v.diastolic < 80) {
      category = 'Elevated';
      riskLevel = 'Low-Moderate';
    } else if ((v.systolic >= 130 && v.systolic < 140) || (v.diastolic >= 80 && v.diastolic < 90)) {
      category = 'Stage 1 Hypertension';
      riskLevel = 'Moderate';
    } else if (v.systolic >= 140 || v.diastolic >= 90) {
      category = 'Stage 2 Hypertension';
      riskLevel = 'High';
    }
    
    // Additional risk factors
    let riskScore = 0;
    if (v.age > 65) riskScore += 1;
    if (v.gender === 'male') riskScore += 1;
    if (v.smoking === 'yes') riskScore += 2;
    if (v.diabetes === 'yes') riskScore += 2;
    
    if (riskScore >= 4) riskLevel = 'Very High';
    else if (riskScore >= 2) riskLevel = 'High';
    else if (riskScore >= 1) riskLevel = 'Moderate';
    
    // Generate recommendations
    if (category.includes('Hypertension')) {
      recommendations.push('Consult with a healthcare provider for blood pressure management');
      recommendations.push('Consider lifestyle modifications including diet and exercise');
      recommendations.push('Monitor blood pressure regularly at home');
    }
    if (v.smoking === 'yes') {
      recommendations.push('Quit smoking to reduce cardiovascular risk');
    }
    if (v.diabetes === 'yes') {
      recommendations.push('Work with healthcare team to manage blood sugar levels');
    }
    if (v.age > 65) {
      recommendations.push('Consider regular cardiovascular health screenings');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current healthy lifestyle habits');
      recommendations.push('Continue regular health checkups');
    }
    
    let opinion = 'Your blood pressure appears to be in a healthy range. Continue maintaining a healthy lifestyle.';
    if (category.includes('Hypertension')) {
      opinion = 'Your blood pressure readings indicate hypertension. Please consult with a healthcare provider for proper evaluation and treatment.';
    } else if (category === 'Elevated') {
      opinion = 'Your blood pressure is slightly elevated. Focus on lifestyle modifications to prevent progression to hypertension.';
    }
    
    setRisk({ category, riskLevel, recommendations, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="systolic" render={({ field }) => (
              <FormItem><FormLabel>Systolic BP (mmHg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="diastolic" render={({ field }) => (
              <FormItem><FormLabel>Diastolic BP (mmHg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem><FormLabel>Gender</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="smoking" render={({ field }) => (
              <FormItem><FormLabel>Current Smoker</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="diabetes" render={({ field }) => (
              <FormItem><FormLabel>Diabetes</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Assess Risk</Button>
        </form>
      </Form>

      {risk && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Heart className="h-8 w-8 text-primary" /><CardTitle>Blood Pressure Risk Assessment</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div><p className="text-2xl font-bold">{risk.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
              <div><p className="text-2xl font-bold">{risk.riskLevel}</p><p className="text-sm text-muted-foreground">Risk Level</p></div>
            </div>
            <CardDescription className="text-center mb-4">{risk.opinion}</CardDescription>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">Recommendations:</p>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                {risk.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <RelatedCalculators />
        <BloodPressureGuide />
        <EmbedWidget calculatorSlug="blood-pressure-risk-calculator" calculatorName="Blood Pressure Risk Calculator" />
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
          <Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline hover:text-primary/80">
            Cardiovascular Disease Risk Calculator
          </Link>
          <Link href="/category/health-fitness/heart-attack-framingham-risk-calculator" className="text-primary underline hover:text-primary/80">
            Heart Attack (Framingham) Risk Calculator
          </Link>
          <Link href="/category/health-fitness/stroke-risk-calculator" className="text-primary underline hover:text-primary/80">
            Stroke Risk Calculator
          </Link>
          <Link href="/category/health-fitness/cholesterol-risk-calculator" className="text-primary underline hover:text-primary/80">
            Cholesterol Risk Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function BloodPressureGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Blood Pressure Risk Assessment – Understanding Cardiovascular Health" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to interpret blood pressure readings, assess cardiovascular risk factors, and understand hypertension management strategies." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Blood Pressure</h2>
      <p itemProp="description">Blood pressure measures the force of blood against artery walls. It consists of two numbers: systolic (pressure when heart beats) and diastolic (pressure when heart rests). Understanding your blood pressure helps assess cardiovascular health risks.</p>

      <h3 className="font-semibold text-foreground mt-6">Blood Pressure Categories</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Normal: Less than 120/80 mmHg - Optimal cardiovascular health</li>
        <li>Elevated: 120-129/less than 80 mmHg - Increased risk, lifestyle changes recommended</li>
        <li>Stage 1 Hypertension: 130-139/80-89 mmHg - Moderate risk, lifestyle changes and possibly medication</li>
        <li>Stage 2 Hypertension: 140/90 mmHg or higher - High risk, medication typically required</li>
        <li>Hypertensive Crisis: Above 180/120 mmHg - Medical emergency</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Risk Factors for High Blood Pressure</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Age: Risk increases with age (especially after 65)</li>
        <li>Family history of hypertension</li>
        <li>Obesity or being overweight</li>
        <li>Physical inactivity and sedentary lifestyle</li>
        <li>High sodium diet and excessive alcohol consumption</li>
        <li>Smoking and tobacco use</li>
        <li>Chronic stress and poor sleep</li>
        <li>Diabetes and kidney disease</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Management Strategies</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>DASH diet: Emphasize fruits, vegetables, whole grains, and low-fat dairy</li>
        <li>Reduce sodium intake to less than 2,300mg daily</li>
        <li>Regular aerobic exercise (150 minutes weekly)</li>
        <li>Maintain healthy weight (BMI 18.5-24.9)</li>
        <li>Limit alcohol to 1-2 drinks daily</li>
        <li>Manage stress through relaxation techniques</li>
        <li>Take prescribed medications as directed</li>
        <li>Regular blood pressure monitoring</li>
      </ul>
    </section>
  );
}
