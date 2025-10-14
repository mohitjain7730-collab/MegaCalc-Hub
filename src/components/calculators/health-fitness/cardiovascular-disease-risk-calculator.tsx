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
  age: z.number().positive(),
  gender: z.enum(['male', 'female']),
  systolicBP: z.number().positive(),
  diastolicBP: z.number().positive(),
  totalCholesterol: z.number().positive(),
  hdlCholesterol: z.number().positive(),
  smoking: z.enum(['yes', 'no']),
  diabetes: z.enum(['yes', 'no'])
});
type FormValues = z.infer<typeof formSchema>;

export default function CardiovascularDiseaseRiskCalculator() {
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
      diabetes: 'no' 
    } 
  });

  const onSubmit = (v: FormValues) => {
    let score = 0;
    
    // Age scoring (different for men and women)
    if (v.gender === 'male') {
      if (v.age >= 70) score += 8;
      else if (v.age >= 65) score += 6;
      else if (v.age >= 60) score += 4;
      else if (v.age >= 55) score += 3;
      else if (v.age >= 50) score += 2;
      else if (v.age >= 45) score += 1;
    } else {
      if (v.age >= 70) score += 8;
      else if (v.age >= 65) score += 5;
      else if (v.age >= 60) score += 3;
      else if (v.age >= 55) score += 2;
      else if (v.age >= 50) score += 1;
    }
    
    // Blood pressure scoring
    if (v.systolicBP >= 160 || v.diastolicBP >= 100) score += 3;
    else if (v.systolicBP >= 140 || v.diastolicBP >= 90) score += 2;
    else if (v.systolicBP >= 130 || v.diastolicBP >= 80) score += 1;
    
    // Cholesterol scoring
    if (v.totalCholesterol >= 280) score += 3;
    else if (v.totalCholesterol >= 240) score += 2;
    else if (v.totalCholesterol >= 200) score += 1;
    
    // HDL scoring (reverse - higher HDL is better)
    if (v.hdlCholesterol < 35) score += 2;
    else if (v.hdlCholesterol < 45) score += 1;
    else if (v.hdlCholesterol >= 60) score -= 1;
    
    // Smoking
    if (v.smoking === 'yes') score += 2;
    
    // Diabetes
    if (v.diabetes === 'yes') score += 2;
    
    // Risk assessment
    let riskLevel = 'Low';
    let percentage = 2;
    
    if (score >= 12) {
      riskLevel = 'Very High';
      percentage = 25;
    } else if (score >= 9) {
      riskLevel = 'High';
      percentage = 15;
    } else if (score >= 6) {
      riskLevel = 'Moderate';
      percentage = 8;
    } else if (score >= 3) {
      riskLevel = 'Low-Moderate';
      percentage = 4;
    }
    
    const recommendations: string[] = [];
    if (v.systolicBP >= 130 || v.diastolicBP >= 80) {
      recommendations.push('Manage blood pressure through diet, exercise, and medication if needed');
    }
    if (v.totalCholesterol >= 200) {
      recommendations.push('Focus on heart-healthy diet and consider cholesterol management');
    }
    if (v.hdlCholesterol < 40) {
      recommendations.push('Increase HDL with regular exercise and moderate alcohol consumption');
    }
    if (v.smoking === 'yes') {
      recommendations.push('Quit smoking immediately - single most important change for heart health');
    }
    if (v.diabetes === 'yes') {
      recommendations.push('Work with healthcare team to optimize blood sugar control');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current healthy lifestyle');
      recommendations.push('Continue regular cardiovascular health monitoring');
    }
    
    let opinion = 'Your cardiovascular risk appears low. Continue maintaining a heart-healthy lifestyle.';
    if (riskLevel === 'Very High') {
      opinion = 'You have multiple cardiovascular risk factors. Please consult with a healthcare provider for comprehensive heart disease prevention and management.';
    } else if (riskLevel === 'High') {
      opinion = 'Your cardiovascular risk is elevated. Focus on addressing modifiable risk factors through lifestyle changes and medical management.';
    } else if (riskLevel === 'Moderate') {
      opinion = 'You have some cardiovascular risk factors. Address lifestyle factors to reduce your risk of heart disease.';
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
          </div>
          <Button type="submit">Assess CVD Risk</Button>
        </form>
      </Form>

      {risk && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Heart className="h-8 w-8 text-primary" /><CardTitle>10-Year CVD Risk Assessment</CardTitle></div>
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
        <CardiovascularDiseaseGuide />
        <EmbedWidget calculatorSlug="cardiovascular-disease-risk-calculator" calculatorName="Cardiovascular Disease Risk Calculator" />
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
          <Link href="/category/health-fitness/blood-pressure-risk-calculator" className="text-primary underline hover:text-primary/80">
            Blood Pressure Risk Calculator
          </Link>
          <Link href="/category/health-fitness/cholesterol-risk-calculator" className="text-primary underline hover:text-primary/80">
            Cholesterol Risk Calculator
          </Link>
          <Link href="/category/health-fitness/heart-attack-framingham-risk-calculator" className="text-primary underline hover:text-primary/80">
            Heart Attack (Framingham) Risk Calculator
          </Link>
          <Link href="/category/health-fitness/stroke-risk-calculator" className="text-primary underline hover:text-primary/80">
            Stroke Risk Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function CardiovascularDiseaseGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Cardiovascular Disease Risk Assessment – Understanding Heart Health and Prevention" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to assess cardiovascular disease risk using multiple factors, understand prevention strategies, and implement heart-healthy lifestyle changes." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Cardiovascular Disease Risk</h2>
      <p itemProp="description">Cardiovascular disease (CVD) is the leading cause of death globally, encompassing heart disease, stroke, and other circulatory conditions. Risk assessment helps identify individuals who may benefit from preventive interventions and lifestyle modifications.</p>

      <h3 className="font-semibold text-foreground mt-6">Major Risk Factors</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Age: Risk increases significantly after 45 for men, 55 for women</li>
        <li>Gender: Men have higher risk until women reach menopause</li>
        <li>Family history: Genetic predisposition to heart disease</li>
        <li>High blood pressure: Hypertension damages blood vessels</li>
        <li>High cholesterol: Elevated LDL and low HDL levels</li>
        <li>Smoking: Major modifiable risk factor</li>
        <li>Diabetes: Significantly increases cardiovascular risk</li>
        <li>Obesity: Excess weight strains the cardiovascular system</li>
        <li>Physical inactivity: Sedentary lifestyle reduces heart health</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Risk Categories</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Low Risk: Less than 10% 10-year CVD risk</li>
        <li>Moderate Risk: 10-20% 10-year CVD risk</li>
        <li>High Risk: Greater than 20% 10-year CVD risk</li>
        <li>Very High Risk: Multiple risk factors or existing CVD</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Prevention Strategies</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Heart-healthy diet: Mediterranean or DASH diet patterns</li>
        <li>Regular exercise: At least 150 minutes moderate activity weekly</li>
        <li>Weight management: Maintain healthy BMI (18.5-24.9)</li>
        <li>Blood pressure control: Less than 130/80 mmHg</li>
        <li>Cholesterol management: LDL less than 100 mg/dL</li>
        <li>Smoking cessation: Complete tobacco avoidance</li>
        <li>Diabetes management: Optimal blood sugar control</li>
        <li>Stress management: Regular relaxation and stress reduction</li>
        <li>Regular screening: Annual health checkups</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Warning Signs</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Chest pain or discomfort (angina)</li>
        <li>Shortness of breath during routine activities</li>
        <li>Fatigue and weakness</li>
        <li>Swelling in legs, ankles, or feet</li>
        <li>Irregular heartbeat or palpitations</li>
        <li>Dizziness or fainting spells</li>
        <li>Nausea or loss of appetite</li>
        <li>Cold sweats or clammy skin</li>
      </ul>
    </section>
  );
}
