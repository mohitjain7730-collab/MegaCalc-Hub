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

const formSchema = z.object({
  totalCholesterol: z.number().positive(),
  hdl: z.number().positive(),
  ldl: z.number().positive(),
  triglycerides: z.number().positive(),
  age: z.number().positive(),
  gender: z.enum(['male', 'female']),
  smoking: z.enum(['yes', 'no'])
});
type FormValues = z.infer<typeof formSchema>;

export default function CholesterolRiskCalculator() {
  const [risk, setRisk] = useState<{ hdlLdlRatio: number; totalHdlRatio: number; category: string; recommendations: string[]; opinion: string } | null>(null);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      totalCholesterol: undefined, 
      hdl: undefined, 
      ldl: undefined, 
      triglycerides: undefined, 
      age: undefined, 
      gender: 'male', 
      smoking: 'no' 
    } 
  });

  const onSubmit = (v: FormValues) => {
    const hdlLdlRatio = v.hdl / v.ldl;
    const totalHdlRatio = v.totalCholesterol / v.hdl;
    
    let category = 'Low Risk';
    let recommendations: string[] = [];
    
    // HDL/LDL ratio assessment
    if (hdlLdlRatio >= 0.4) {
      category = 'Low Risk';
    } else if (hdlLdlRatio >= 0.3) {
      category = 'Moderate Risk';
    } else {
      category = 'High Risk';
    }
    
    // Total/HDL ratio assessment
    if (totalHdlRatio <= 3.5) {
      category = 'Low Risk';
    } else if (totalHdlRatio <= 5.0) {
      category = 'Moderate Risk';
    } else {
      category = 'High Risk';
    }
    
    // Generate recommendations based on individual values
    if (v.totalCholesterol > 200) {
      recommendations.push('Consider reducing saturated fat intake');
    }
    if (v.hdl < 40) {
      recommendations.push('Increase HDL with regular exercise and moderate alcohol');
    }
    if (v.ldl > 100) {
      recommendations.push('Focus on soluble fiber and plant sterols');
    }
    if (v.triglycerides > 150) {
      recommendations.push('Reduce refined carbs and sugars');
    }
    if (v.smoking === 'yes') {
      recommendations.push('Quit smoking to improve HDL levels');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current healthy lifestyle');
      recommendations.push('Continue regular cholesterol monitoring');
    }
    
    let opinion = 'Your cholesterol ratios indicate good cardiovascular health. Keep up the healthy lifestyle!';
    if (category === 'High Risk') {
      opinion = 'Your cholesterol levels suggest increased cardiovascular risk. Consider consulting with a healthcare provider for personalized management strategies.';
    } else if (category === 'Moderate Risk') {
      opinion = 'Your cholesterol ratios show moderate risk. Focus on lifestyle improvements to optimize your cardiovascular health.';
    }
    
    setRisk({ hdlLdlRatio, totalHdlRatio, category, recommendations, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="totalCholesterol" render={({ field }) => (
              <FormItem><FormLabel>Total Cholesterol (mg/dL)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="hdl" render={({ field }) => (
              <FormItem><FormLabel>HDL (mg/dL)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="ldl" render={({ field }) => (
              <FormItem><FormLabel>LDL (mg/dL)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="triglycerides" render={({ field }) => (
              <FormItem><FormLabel>Triglycerides (mg/dL)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
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
          </div>
          <Button type="submit">Assess Risk</Button>
        </form>
      </Form>

      {risk && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Cholesterol Risk Assessment</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
              <div><p className="text-2xl font-bold">{risk.hdlLdlRatio.toFixed(2)}</p><p className="text-sm text-muted-foreground">HDL/LDL Ratio</p></div>
              <div><p className="text-2xl font-bold">{risk.totalHdlRatio.toFixed(1)}</p><p className="text-sm text-muted-foreground">Total/HDL Ratio</p></div>
              <div><p className="text-2xl font-bold">{risk.category}</p><p className="text-sm text-muted-foreground">Risk Level</p></div>
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
        <CholesterolGuide />
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
          <Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline hover:text-primary/80">
            Cardiovascular Disease Risk Calculator
          </Link>
          <Link href="/category/health-fitness/heart-attack-framingham-risk-calculator" className="text-primary underline hover:text-primary/80">
            Heart Attack (Framingham) Risk Calculator
          </Link>
          <Link href="/category/health-fitness/diabetes-risk-type2-calculator" className="text-primary underline hover:text-primary/80">
            Diabetes Risk (Type 2) Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function CholesterolGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Cholesterol Risk Assessment – Understanding Heart Health Through Lipid Analysis" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to interpret cholesterol levels, understand HDL/LDL ratios, assess cardiovascular risk, and implement lifestyle changes for better heart health." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Cholesterol</h2>
      <p itemProp="description">Cholesterol is a waxy substance found in your blood that your body needs to build healthy cells. However, high cholesterol levels can increase your risk of heart disease. Understanding your cholesterol profile helps assess cardiovascular risk and guides lifestyle interventions.</p>

      <h3 className="font-semibold text-foreground mt-6">Cholesterol Components</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Total Cholesterol: Overall cholesterol level in blood</li>
        <li>HDL (Good Cholesterol): High-density lipoprotein that removes cholesterol from arteries</li>
        <li>LDL (Bad Cholesterol): Low-density lipoprotein that can build up in artery walls</li>
        <li>Triglycerides: Type of fat that provides energy but can contribute to heart disease when elevated</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Optimal Cholesterol Levels</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Total Cholesterol: Less than 200 mg/dL (desirable)</li>
        <li>HDL: 60 mg/dL or higher (protective), less than 40 mg/dL (low risk factor)</li>
        <li>LDL: Less than 100 mg/dL (optimal), 100-129 mg/dL (near optimal)</li>
        <li>Triglycerides: Less than 150 mg/dL (normal)</li>
        <li>HDL/LDL Ratio: 0.4 or higher (better cardiovascular protection)</li>
        <li>Total/HDL Ratio: 3.5 or lower (optimal heart health)</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Lifestyle Interventions</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Heart-healthy diet: Emphasize fruits, vegetables, whole grains, lean proteins</li>
        <li>Reduce saturated fats: Limit red meat, full-fat dairy, and processed foods</li>
        <li>Increase soluble fiber: Oats, beans, apples, and citrus fruits</li>
        <li>Regular exercise: At least 150 minutes of moderate activity weekly</li>
        <li>Maintain healthy weight: BMI between 18.5-24.9</li>
        <li>Quit smoking: Improves HDL levels and overall cardiovascular health</li>
        <li>Limit alcohol: Moderate consumption may raise HDL</li>
        <li>Manage stress: Chronic stress can impact cholesterol levels</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">When to Seek Medical Advice</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Total cholesterol above 240 mg/dL</li>
        <li>LDL above 160 mg/dL</li>
        <li>HDL below 40 mg/dL</li>
        <li>Triglycerides above 200 mg/dL</li>
        <li>Family history of heart disease or high cholesterol</li>
        <li>Existing cardiovascular conditions or diabetes</li>
      </ul>
    </section>
  );
}
