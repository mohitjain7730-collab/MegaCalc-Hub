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

const formSchema = z.object({
  age: z.number().positive(),
  gender: z.enum(['male', 'female']),
  systolicBP: z.number().positive(),
  diastolicBP: z.number().positive(),
  totalCholesterol: z.number().positive(),
  hdlCholesterol: z.number().positive(),
  smoking: z.enum(['yes', 'no']),
  diabetes: z.enum(['yes', 'no']),
  bmi: z.number().positive()
});
type FormValues = z.infer<typeof formSchema>;

export default function HeartAttackFraminghamRiskCalculator() {
  const [risk, setRisk] = useState<{ score: number; riskLevel: string; percentage: number; recommendations: string[]; opinion: string } | null>(null);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      age: undefined, 
      gender: 'male', 
      systolicBP: undefined, 
      diastolicBP: undefined, 
      totalCholesterol: undefined, 
      hdlCholesterol: undefined, 
      smoking: 'no', 
      diabetes: 'no', 
      bmi: undefined 
    } 
  });

  const onSubmit = (v: FormValues) => {
    let score = 0;
    
    // Age scoring (Framingham specific)
    if (v.gender === 'male') {
      if (v.age >= 70) score += 11;
      else if (v.age >= 65) score += 8;
      else if (v.age >= 60) score += 6;
      else if (v.age >= 55) score += 4;
      else if (v.age >= 50) score += 3;
      else if (v.age >= 45) score += 2;
      else if (v.age >= 40) score += 1;
    } else {
      if (v.age >= 70) score += 12;
      else if (v.age >= 65) score += 9;
      else if (v.age >= 60) score += 7;
      else if (v.age >= 55) score += 5;
      else if (v.age >= 50) score += 3;
      else if (v.age >= 45) score += 2;
      else if (v.age >= 40) score += 1;
    }
    
    // Blood pressure scoring
    if (v.systolicBP >= 160 || v.diastolicBP >= 100) score += 4;
    else if (v.systolicBP >= 140 || v.diastolicBP >= 90) score += 3;
    else if (v.systolicBP >= 130 || v.diastolicBP >= 85) score += 2;
    else if (v.systolicBP >= 120 || v.diastolicBP >= 80) score += 1;
    
    // Total cholesterol scoring
    if (v.totalCholesterol >= 280) score += 3;
    else if (v.totalCholesterol >= 240) score += 2;
    else if (v.totalCholesterol >= 200) score += 1;
    
    // HDL cholesterol scoring (reverse)
    if (v.hdlCholesterol < 35) score += 2;
    else if (v.hdlCholesterol < 45) score += 1;
    else if (v.hdlCholesterol >= 60) score -= 1;
    
    // Smoking
    if (v.smoking === 'yes') score += 3;
    
    // Diabetes
    if (v.diabetes === 'yes') score += 3;
    
    // BMI (additional factor)
    if (v.bmi >= 30) score += 1;
    
    // Framingham Risk Assessment
    let riskLevel = 'Low';
    let percentage = 1;
    
    if (score >= 15) {
      riskLevel = 'Very High';
      percentage = 30;
    } else if (score >= 12) {
      riskLevel = 'High';
      percentage = 20;
    } else if (score >= 9) {
      riskLevel = 'Moderate-High';
      percentage = 12;
    } else if (score >= 6) {
      riskLevel = 'Moderate';
      percentage = 6;
    } else if (score >= 3) {
      riskLevel = 'Low-Moderate';
      percentage = 3;
    }
    
    const recommendations: string[] = [];
    if (v.systolicBP >= 130 || v.diastolicBP >= 80) {
      recommendations.push('Implement DASH diet and consider blood pressure medication');
    }
    if (v.totalCholesterol >= 200) {
      recommendations.push('Adopt heart-healthy diet and consider statin therapy');
    }
    if (v.hdlCholesterol < 40) {
      recommendations.push('Increase HDL through regular exercise and moderate alcohol');
    }
    if (v.smoking === 'yes') {
      recommendations.push('Immediate smoking cessation is critical for heart health');
    }
    if (v.diabetes === 'yes') {
      recommendations.push('Optimize diabetes control with HbA1c target <7%');
    }
    if (v.bmi >= 30) {
      recommendations.push('Weight loss of 5-10% can significantly reduce heart attack risk');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain excellent cardiovascular health practices');
      recommendations.push('Continue regular heart health monitoring');
    }
    
    let opinion = 'Your Framingham risk score indicates low heart attack risk. Continue your heart-healthy lifestyle.';
    if (riskLevel === 'Very High') {
      opinion = 'Your Framingham score indicates very high heart attack risk. Immediate medical consultation and aggressive risk factor modification are essential.';
    } else if (riskLevel === 'High') {
      opinion = 'Your Framingham score shows high heart attack risk. Comprehensive cardiovascular risk management is recommended.';
    } else if (riskLevel === 'Moderate-High') {
      opinion = 'Your Framingham score indicates elevated heart attack risk. Focus on addressing modifiable risk factors.';
    } else if (riskLevel === 'Moderate') {
      opinion = 'Your Framingham score shows moderate heart attack risk. Lifestyle modifications can help reduce your risk.';
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
            <FormField control={form.control} name="totalCholesterol" render={({ field }) => (
              <FormItem><FormLabel>Total Cholesterol (mg/dL)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="hdlCholesterol" render={({ field }) => (
              <FormItem><FormLabel>HDL Cholesterol (mg/dL)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="smoking" render={({ field }) => (
              <FormItem><FormLabel>Current Smoker</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="diabetes" render={({ field }) => (
              <FormItem><FormLabel>Diabetes</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bmi" render={({ field }) => (
              <FormItem><FormLabel>BMI (kg/m²)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Framingham Risk</Button>
        </form>
      </Form>

      {risk && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Heart className="h-8 w-8 text-primary" /><CardTitle>Framingham Heart Attack Risk</CardTitle></div>
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
        <FraminghamRiskGuide />
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
          <Link href="/category/health-fitness/blood-pressure-risk-calculator" className="text-primary underline hover:text-primary/80">
            Blood Pressure Risk Calculator
          </Link>
          <Link href="/category/health-fitness/cholesterol-risk-calculator" className="text-primary underline hover:text-primary/80">
            Cholesterol Risk Calculator
          </Link>
          <Link href="/category/health-fitness/stroke-risk-calculator" className="text-primary underline hover:text-primary/80">
            Stroke Risk Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function FraminghamRiskGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Framingham Heart Attack Risk Calculator – Understanding Coronary Heart Disease Prevention" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to use the Framingham Risk Score to assess 10-year coronary heart disease risk, understand risk factors, and implement prevention strategies." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding the Framingham Risk Score</h2>
      <p itemProp="description">The Framingham Risk Score is a widely-used tool developed from the Framingham Heart Study to predict 10-year risk of coronary heart disease (heart attack). It helps healthcare providers and individuals assess cardiovascular risk and guide treatment decisions.</p>

      <h3 className="font-semibold text-foreground mt-6">Framingham Study Background</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Started in 1948 in Framingham, Massachusetts</li>
        <li>Longest-running cardiovascular disease study</li>
        <li>Identified major risk factors for heart disease</li>
        <li>Basis for modern cardiovascular risk assessment</li>
        <li>Updated regularly with new research findings</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Risk Factors in Framingham Score</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Age: Strongest predictor of heart disease risk</li>
        <li>Gender: Men have higher risk until women reach menopause</li>
        <li>Blood pressure: Both systolic and diastolic matter</li>
        <li>Total cholesterol: Higher levels increase risk</li>
        <li>HDL cholesterol: Higher levels are protective</li>
        <li>Smoking: Major modifiable risk factor</li>
        <li>Diabetes: Significantly increases coronary risk</li>
        <li>Body mass index: Obesity contributes to risk</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Risk Categories</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Low Risk: Less than 10% 10-year risk</li>
        <li>Moderate Risk: 10-20% 10-year risk</li>
        <li>High Risk: Greater than 20% 10-year risk</li>
        <li>Very High Risk: Multiple risk factors present</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Clinical Applications</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Guideline statin therapy decisions</li>
        <li>Blood pressure management targets</li>
        <li>Lifestyle intervention recommendations</li>
        <li>Frequency of cardiovascular screening</li>
        <li>Preventive medication considerations</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Limitations</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>May underestimate risk in certain populations</li>
        <li>Doesn't account for family history of premature CVD</li>
        <li>May not reflect current risk factor trends</li>
        <li>Limited applicability to very young or very old adults</li>
        <li>Doesn't include newer risk markers</li>
      </ul>
    </section>
  );
}
