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
import { Activity } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  age: z.number().positive(),
  gender: z.enum(['male', 'female']),
  systolicBP: z.number().positive(),
  diastolicBP: z.number().positive(),
  smoking: z.enum(['yes', 'no']),
  diabetes: z.enum(['yes', 'no']),
  atrialFibrillation: z.enum(['yes', 'no']),
  heartDisease: z.enum(['yes', 'no']),
  previousStroke: z.enum(['yes', 'no'])
});
type FormValues = z.infer<typeof formSchema>;

export default function StrokeRiskCalculator() {
  const [risk, setRisk] = useState<{ score: number; riskLevel: string; percentage: number; recommendations: string[]; opinion: string } | null>(null);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      age: undefined, 
      gender: 'male', 
      systolicBP: undefined, 
      diastolicBP: undefined, 
      smoking: 'no', 
      diabetes: 'no', 
      atrialFibrillation: 'no', 
      heartDisease: 'no', 
      previousStroke: 'no' 
    } 
  });

  const onSubmit = (v: FormValues) => {
    let score = 0;
    
    // Age scoring
    if (v.age >= 80) score += 8;
    else if (v.age >= 75) score += 6;
    else if (v.age >= 70) score += 4;
    else if (v.age >= 65) score += 3;
    else if (v.age >= 60) score += 2;
    else if (v.age >= 55) score += 1;
    
    // Gender (men have slightly higher stroke risk)
    if (v.gender === 'male') score += 1;
    
    // Blood pressure scoring
    if (v.systolicBP >= 160 || v.diastolicBP >= 100) score += 4;
    else if (v.systolicBP >= 140 || v.diastolicBP >= 90) score += 3;
    else if (v.systolicBP >= 130 || v.diastolicBP >= 80) score += 2;
    else if (v.systolicBP >= 120 || v.diastolicBP >= 80) score += 1;
    
    // Risk factors
    if (v.smoking === 'yes') score += 2;
    if (v.diabetes === 'yes') score += 2;
    if (v.atrialFibrillation === 'yes') score += 3;
    if (v.heartDisease === 'yes') score += 2;
    if (v.previousStroke === 'yes') score += 4;
    
    // Risk assessment
    let riskLevel = 'Low';
    let percentage = 1;
    
    if (score >= 12) {
      riskLevel = 'Very High';
      percentage = 25;
    } else if (score >= 9) {
      riskLevel = 'High';
      percentage = 15;
    } else if (score >= 6) {
      riskLevel = 'Moderate-High';
      percentage = 8;
    } else if (score >= 4) {
      riskLevel = 'Moderate';
      percentage = 4;
    } else if (score >= 2) {
      riskLevel = 'Low-Moderate';
      percentage = 2;
    }
    
    const recommendations: string[] = [];
    if (v.systolicBP >= 130 || v.diastolicBP >= 80) {
      recommendations.push('Control blood pressure through lifestyle changes and medication');
    }
    if (v.smoking === 'yes') {
      recommendations.push('Quit smoking immediately - major stroke risk factor');
    }
    if (v.diabetes === 'yes') {
      recommendations.push('Maintain optimal blood sugar control');
    }
    if (v.atrialFibrillation === 'yes') {
      recommendations.push('Manage atrial fibrillation with anticoagulation therapy');
    }
    if (v.heartDisease === 'yes') {
      recommendations.push('Optimize heart disease management');
    }
    if (v.previousStroke === 'yes') {
      recommendations.push('Follow secondary stroke prevention protocols');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current healthy lifestyle');
      recommendations.push('Continue regular stroke risk monitoring');
    }
    
    let opinion = 'Your stroke risk appears low. Continue maintaining a healthy lifestyle.';
    if (riskLevel === 'Very High') {
      opinion = 'Your stroke risk is very high. Immediate medical consultation and aggressive risk factor management are essential.';
    } else if (riskLevel === 'High') {
      opinion = 'Your stroke risk is elevated. Comprehensive stroke prevention strategies are recommended.';
    } else if (riskLevel === 'Moderate-High') {
      opinion = 'Your stroke risk is moderately elevated. Focus on addressing modifiable risk factors.';
    } else if (riskLevel === 'Moderate') {
      opinion = 'You have some stroke risk factors. Lifestyle modifications can help reduce your risk.';
    }
    
    setRisk({ score, riskLevel, percentage, recommendations, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem><FormLabel>Gender</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="systolicBP" render={({ field }) => (
              <FormItem><FormLabel>Systolic BP (mmHg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="diastolicBP" render={({ field }) => (
              <FormItem><FormLabel>Diastolic BP (mmHg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="smoking" render={({ field }) => (
              <FormItem><FormLabel>Current Smoker</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="diabetes" render={({ field }) => (
              <FormItem><FormLabel>Diabetes</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="atrialFibrillation" render={({ field }) => (
              <FormItem><FormLabel>Atrial Fibrillation</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="heartDisease" render={({ field }) => (
              <FormItem><FormLabel>Heart Disease</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="previousStroke" render={({ field }) => (
              <FormItem><FormLabel>Previous Stroke/TIA</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Assess Stroke Risk</Button>
        </form>
      </Form>

      {risk && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>10-Year Stroke Risk Assessment</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
              <div><p className="text-2xl font-bold">{risk.score}</p><p className="text-sm text-muted-foreground">Risk Score</p></div>
              <div><p className="text-2xl font-bold">{risk.riskLevel}</p><p className="text-sm text-muted-foreground">Risk Level</p></div>
              <div><p className="text-2xl font-bold">{risk.percentage}%</p><p className="text-sm text-muted-foreground">10-Year Risk</p></div>
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
        <StrokeRiskGuide />
        <EmbedWidget calculatorSlug="stroke-risk-calculator" calculatorName="Stroke Risk Calculator" />
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
          <Link href="/category/health-fitness/blood-pressure-risk-calculator" className="text-primary underline hover:text-primary/80">
            Blood Pressure Risk Calculator
          </Link>
          <Link href="/category/health-fitness/diabetes-risk-type2-calculator" className="text-primary underline hover:text-primary/80">
            Diabetes Risk (Type 2) Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function StrokeRiskGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Stroke Risk Assessment – Understanding and Preventing Cerebrovascular Disease" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to assess stroke risk using multiple factors, understand types of stroke, recognize warning signs, and implement prevention strategies." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Stroke Risk</h2>
      <p itemProp="description">Stroke is a leading cause of death and disability worldwide. It occurs when blood flow to the brain is interrupted, either by a clot (ischemic stroke) or bleeding (hemorrhagic stroke). Understanding and managing risk factors can significantly reduce stroke risk.</p>

      <h3 className="font-semibold text-foreground mt-6">Types of Stroke</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Ischemic Stroke: Blocked blood vessel (87% of strokes)</li>
        <li>Hemorrhagic Stroke: Ruptured blood vessel (13% of strokes)</li>
        <li>Transient Ischemic Attack (TIA): Temporary blockage, warning sign</li>
        <li>Silent Stroke: No obvious symptoms but brain damage occurs</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Major Risk Factors</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Age: Risk doubles every decade after age 55</li>
        <li>Gender: Men have higher risk, but women have higher mortality</li>
        <li>High blood pressure: Most important modifiable risk factor</li>
        <li>Smoking: Damages blood vessels and increases clot formation</li>
        <li>Diabetes: Affects blood vessels throughout the body</li>
        <li>Atrial fibrillation: Irregular heartbeat increases clot risk</li>
        <li>Heart disease: Coronary artery disease increases stroke risk</li>
        <li>Previous stroke/TIA: History increases future risk</li>
        <li>High cholesterol: Contributes to artery narrowing</li>
        <li>Obesity: Increases multiple stroke risk factors</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Stroke Warning Signs (FAST)</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Face: Sudden drooping or numbness on one side</li>
        <li>Arms: Weakness or numbness in one arm</li>
        <li>Speech: Slurred speech or difficulty speaking</li>
        <li>Time: Call emergency services immediately</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Additional Warning Signs</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Sudden severe headache</li>
        <li>Sudden vision changes</li>
        <li>Sudden dizziness or loss of balance</li>
        <li>Sudden confusion or trouble understanding</li>
        <li>Sudden numbness or weakness on one side</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Prevention Strategies</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Blood pressure control: Target less than 130/80 mmHg</li>
        <li>Smoking cessation: Complete tobacco avoidance</li>
        <li>Diabetes management: Optimal blood sugar control</li>
        <li>Atrial fibrillation treatment: Anticoagulation when appropriate</li>
        <li>Heart-healthy diet: DASH or Mediterranean diet</li>
        <li>Regular exercise: At least 150 minutes weekly</li>
        <li>Weight management: Maintain healthy BMI</li>
        <li>Cholesterol control: Statin therapy when indicated</li>
        <li>Limit alcohol: Moderate consumption only</li>
        <li>Stress management: Regular relaxation techniques</li>
      </ul>
    </section>
  );
}
