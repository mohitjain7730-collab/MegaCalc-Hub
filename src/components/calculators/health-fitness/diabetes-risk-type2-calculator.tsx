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
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  age: z.number().positive(),
  bmi: z.number().positive(),
  familyHistory: z.enum(['yes', 'no']),
  physicalActivity: z.enum(['low', 'moderate', 'high']),
  bloodPressure: z.enum(['normal', 'elevated', 'high']),
  waistCircumference: z.number().positive(),
  gender: z.enum(['male', 'female'])
});
type FormValues = z.infer<typeof formSchema>;

export default function DiabetesRiskType2Calculator() {
  const [risk, setRisk] = useState<{ score: number; riskLevel: string; percentage: number; recommendations: string[]; opinion: string } | null>(null);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      age: undefined, 
      bmi: undefined, 
      familyHistory: 'no', 
      physicalActivity: 'moderate', 
      bloodPressure: 'normal', 
      waistCircumference: undefined, 
      gender: 'male' 
    } 
  });

  const onSubmit = (v: FormValues) => {
    let score = 0;
    
    // Age scoring
    if (v.age >= 65) score += 3;
    else if (v.age >= 55) score += 2;
    else if (v.age >= 45) score += 1;
    
    // BMI scoring
    if (v.bmi >= 35) score += 3;
    else if (v.bmi >= 30) score += 2;
    else if (v.bmi >= 25) score += 1;
    
    // Family history
    if (v.familyHistory === 'yes') score += 1;
    
    // Physical activity
    if (v.physicalActivity === 'low') score += 2;
    else if (v.physicalActivity === 'moderate') score += 1;
    
    // Blood pressure
    if (v.bloodPressure === 'high') score += 2;
    else if (v.bloodPressure === 'elevated') score += 1;
    
    // Waist circumference (different thresholds for gender)
    const waistThreshold = v.gender === 'male' ? 40 : 35; // inches
    if (v.waistCircumference > waistThreshold) score += 1;
    
    // Risk assessment
    let riskLevel = 'Low';
    let percentage = 5;
    
    if (score >= 9) {
      riskLevel = 'Very High';
      percentage = 50;
    } else if (score >= 7) {
      riskLevel = 'High';
      percentage = 30;
    } else if (score >= 5) {
      riskLevel = 'Moderate';
      percentage = 15;
    } else if (score >= 3) {
      riskLevel = 'Low-Moderate';
      percentage = 8;
    }
    
    const recommendations: string[] = [];
    if (v.bmi >= 25) {
      recommendations.push('Lose 5-10% of body weight to reduce diabetes risk');
    }
    if (v.physicalActivity === 'low') {
      recommendations.push('Increase physical activity to at least 150 minutes weekly');
    }
    if (v.bloodPressure !== 'normal') {
      recommendations.push('Manage blood pressure through diet and exercise');
    }
    if (v.waistCircumference > (v.gender === 'male' ? 40 : 35)) {
      recommendations.push('Reduce waist circumference through targeted exercise');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current healthy lifestyle');
      recommendations.push('Continue regular health screenings');
    }
    
    let opinion = 'Your diabetes risk appears low. Continue maintaining a healthy lifestyle.';
    if (riskLevel === 'Very High') {
      opinion = 'You have multiple risk factors for type 2 diabetes. Consider consulting with a healthcare provider for comprehensive diabetes prevention strategies.';
    } else if (riskLevel === 'High') {
      opinion = 'Your risk factors suggest increased diabetes risk. Focus on lifestyle modifications including weight management and regular exercise.';
    } else if (riskLevel === 'Moderate') {
      opinion = 'You have some diabetes risk factors. Address modifiable factors like diet and exercise to reduce your risk.';
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
            <FormField control={form.control} name="bmi" render={({ field }) => (
              <FormItem><FormLabel>BMI (kg/m²)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem><FormLabel>Gender</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="familyHistory" render={({ field }) => (
              <FormItem><FormLabel>Family History of Diabetes</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="physicalActivity" render={({ field }) => (
              <FormItem><FormLabel>Physical Activity Level</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low (sedentary)</SelectItem><SelectItem value="moderate">Moderate (some exercise)</SelectItem><SelectItem value="high">High (regular exercise)</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bloodPressure" render={({ field }) => (
              <FormItem><FormLabel>Blood Pressure Status</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="elevated">Elevated</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="waistCircumference" render={({ field }) => (
              <FormItem><FormLabel>Waist Circumference (inches)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Assess Risk</Button>
        </form>
      </Form>

      {risk && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>Type 2 Diabetes Risk Assessment</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
              <div><p className="text-2xl font-bold">{risk.score}</p><p className="text-sm text-muted-foreground">Risk Score</p></div>
              <div><p className="text-2xl font-bold">{risk.riskLevel}</p><p className="text-sm text-muted-foreground">Risk Level</p></div>
              <div><p className="text-2xl font-bold">{risk.percentage}%</p><p className="text-sm text-muted-foreground">Estimated Risk</p></div>
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
        <DiabetesRiskGuide />
        <EmbedWidget calculatorSlug="diabetes-risk-type2-calculator" calculatorName="Diabetes Risk (Type 2) Calculator" />
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
          <Link href="/category/health-fitness/blood-sugar-to-hba1c-converter" className="text-primary underline hover:text-primary/80">
            Blood Sugar to HbA1c Converter
          </Link>
          <Link href="/category/health-fitness/bmi-calculator" className="text-primary underline hover:text-primary/80">
            Body Mass Index (BMI) Calculator
          </Link>
          <Link href="/category/health-fitness/glycemic-load-calculator" className="text-primary underline hover:text-primary/80">
            Glycemic Load Calculator
          </Link>
          <Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline hover:text-primary/80">
            Cardiovascular Disease Risk Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function DiabetesRiskGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Type 2 Diabetes Risk Assessment – Understanding Prevention and Early Detection" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to assess type 2 diabetes risk factors, understand prevention strategies, and implement lifestyle changes to reduce diabetes development." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Type 2 Diabetes Risk</h2>
      <p itemProp="description">Type 2 diabetes is a chronic condition affecting how your body processes glucose. Early identification of risk factors allows for preventive interventions through lifestyle modifications, potentially delaying or preventing diabetes development.</p>

      <h3 className="font-semibold text-foreground mt-6">Major Risk Factors</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Age: Risk increases significantly after 45, especially after 65</li>
        <li>Weight: Obesity (BMI ≥30) and overweight (BMI 25-29.9) increase risk</li>
        <li>Family history: Having a parent or sibling with diabetes</li>
        <li>Physical inactivity: Sedentary lifestyle reduces insulin sensitivity</li>
        <li>High blood pressure: Hypertension is often associated with diabetes</li>
        <li>Waist circumference: Excess abdominal fat indicates metabolic risk</li>
        <li>Prediabetes: Blood sugar levels higher than normal but not diabetic</li>
        <li>Gestational diabetes: History during pregnancy increases future risk</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Prevention Strategies</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Weight management: Lose 5-10% of body weight if overweight</li>
        <li>Regular exercise: At least 150 minutes of moderate activity weekly</li>
        <li>Healthy diet: Focus on whole grains, fruits, vegetables, lean proteins</li>
        <li>Limit processed foods: Reduce sugar, refined carbs, and saturated fats</li>
        <li>Portion control: Manage meal sizes and eating frequency</li>
        <li>Stress management: Chronic stress affects blood sugar regulation</li>
        <li>Quality sleep: Aim for 7-9 hours nightly</li>
        <li>Regular monitoring: Annual health checkups and blood sugar testing</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Early Warning Signs</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Increased thirst and frequent urination</li>
        <li>Unexplained weight loss or weight gain</li>
        <li>Fatigue and low energy levels</li>
        <li>Blurred vision or eye problems</li>
        <li>Slow-healing wounds or frequent infections</li>
        <li>Tingling or numbness in hands or feet</li>
        <li>Darkened skin patches (acanthosis nigricans)</li>
        <li>Increased hunger despite eating</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Screening Recommendations</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Adults 45 and older: Test every 3 years</li>
        <li>High-risk individuals: Test annually or more frequently</li>
        <li>Prediabetes: Test every 1-2 years</li>
        <li>Pregnancy: Screen for gestational diabetes at 24-28 weeks</li>
        <li>Children and adolescents: Screen if overweight with risk factors</li>
      </ul>
    </section>
  );
}
