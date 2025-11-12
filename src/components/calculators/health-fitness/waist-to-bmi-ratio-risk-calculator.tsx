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
import Link from 'next/link';
import { Zap, AlertTriangle, Calendar, Scale, Ruler } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  waistCircumference: z.number().positive().optional(),
  unit: z.enum(['metric', 'imperial']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  ratio: number;
  bmi: number;
  waist: number;
  riskLevel: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current body composition: measure waist circumference and calculate BMI' },
  { week: 2, focus: 'Begin targeted exercise: core strengthening and cardiovascular training' },
  { week: 3, focus: 'Adopt healthy diet: reduce processed foods, added sugars, and saturated fats' },
  { week: 4, focus: 'Focus on stress management: chronic stress increases abdominal fat accumulation' },
  { week: 5, focus: 'Prioritize quality sleep: 7–9 hours per night to support metabolism' },
  { week: 6, focus: 'Increase physical activity: 150+ minutes/week moderate exercise' },
  { week: 7, focus: 'Reassess waist-to-BMI ratio and compare improvements' },
  { week: 8, focus: 'Maintain healthy habits and continue monitoring body composition' },
];

const faqs: [string, string][] = [
  ['What is waist-to-BMI ratio?', 'Waist-to-BMI ratio is a measure that accounts for body fat distribution. It provides a more nuanced assessment than BMI alone by considering where fat is stored (central vs. peripheral).'],
  ['How is waist-to-BMI ratio calculated?', 'The ratio is calculated as Waist Circumference (cm) ÷ BMI. This helps identify individuals with normal BMI but high abdominal fat, or high BMI but relatively low abdominal fat.'],
  ['What is a good waist-to-BMI ratio?', 'Lower ratios indicate better body fat distribution. Thresholds vary by age and gender, but generally ratios below 0.45–0.50 (males) or 0.42–0.47 (females) indicate lower risk.'],
  ['Why is this ratio better than BMI alone?', 'BMI doesn\'t account for where fat is stored. Central obesity (abdominal fat) is more metabolically active and increases disease risk more than peripheral fat.'],
  ['Does age affect the ratio?', 'Yes, risk thresholds increase slightly with age. The calculator adjusts for age to provide accurate risk assessment across age groups.'],
  ['Can I improve my waist-to-BMI ratio?', 'Yes, through targeted exercise (core strengthening, cardio), healthy diet, stress management, adequate sleep, and overall weight management.'],
  ['What if my BMI is normal but ratio is high?', 'This indicates central obesity despite normal BMI. Focus on reducing abdominal fat through exercise and diet, as this pattern increases metabolic risk.'],
  ['How often should I measure waist circumference?', 'Measure monthly to track changes. Use consistent technique: measure at the narrowest point between ribs and hips, or at the navel level.'],
  ['Is this calculator a medical diagnosis?', 'No, this is an educational tool. Consult healthcare professionals for medical evaluation and treatment of metabolic risk factors.'],
  ['What lifestyle changes have the biggest impact?', 'Regular exercise (especially core and cardio), healthy diet (reduce processed foods), stress management, and adequate sleep have the most significant effects on central obesity.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years (18–120). Risk thresholds are adjusted for age, as central obesity risk increases with age.' },
  { label: 'Gender', description: 'Biological sex, as risk thresholds differ between males and females.' },
  { label: 'Weight & Height', description: 'Body measurements used to calculate BMI, which provides context for waist circumference.' },
  { label: 'Waist Circumference', description: 'Measure at the narrowest point between ribs and hips, or at navel level. Indicates abdominal fat accumulation.' },
  { label: 'Units', description: 'Metric (kg, cm) or Imperial (lbs, inches). The calculator converts as needed for ratio calculation.' },
];

const calculateWaistBMIRatio = (values: FormValues) => {
  if (!values.weight || !values.height || !values.waistCircumference || !values.unit) return null;
  
  let bmi, waist;
  
  if (values.unit === 'metric') {
    bmi = values.weight / ((values.height / 100) ** 2);
    waist = values.waistCircumference;
  } else {
    bmi = (values.weight / (values.height ** 2)) * 703;
    waist = values.waistCircumference * 2.54;
  }
  
  const ratio = waist / bmi;
  return { ratio, bmi, waist };
};

const getRiskLevel = (ratio: number, gender: string, age: number) => {
  const ageFactor = age >= 65 ? 0.1 : age >= 45 ? 0.05 : 0;
  
  let thresholds;
  if (gender === 'male') {
    thresholds = {
      low: 0.45 + ageFactor,
      moderate: 0.50 + ageFactor,
      high: 0.55 + ageFactor,
    };
  } else {
    thresholds = {
      low: 0.42 + ageFactor,
      moderate: 0.47 + ageFactor,
      high: 0.52 + ageFactor,
    };
  }
  
  if (ratio <= thresholds.low) return 'Low Risk';
  if (ratio <= thresholds.moderate) return 'Moderate Risk';
  if (ratio <= thresholds.high) return 'High Risk';
  return 'Very High Risk';
};

const interpret = (ratio: number, riskLevel: string) => {
  if (riskLevel === 'Low Risk') return 'Low central obesity risk. Good body fat distribution with lower metabolic risk.';
  if (riskLevel === 'Moderate Risk') return 'Moderate central obesity risk. Some abdominal fat accumulation present. Focus on reducing waist circumference.';
  if (riskLevel === 'High Risk') return 'High central obesity risk. Significant abdominal fat increases metabolic and cardiovascular risk.';
  return 'Very high central obesity risk. Extensive abdominal fat significantly increases disease risk. Urgent lifestyle intervention needed.';
};

const recommendations = (riskLevel: string) => {
  const base = [
    'Engage in regular exercise: core strengthening and cardiovascular training (150+ minutes/week)',
    'Adopt healthy diet: reduce processed foods, added sugars, and saturated fats',
    'Focus on stress management: chronic stress increases abdominal fat accumulation',
  ];
  if (riskLevel === 'Very High Risk' || riskLevel === 'High Risk') {
    return [
      ...base,
      'Prioritize targeted abdominal fat reduction through exercise and diet',
      'Consider medical evaluation for metabolic syndrome and cardiovascular risk',
      'Implement comprehensive lifestyle intervention',
    ];
  }
  if (riskLevel === 'Moderate Risk') {
    return [
      ...base,
      'Monitor abdominal fat accumulation and work on reducing waist circumference',
      'Focus on core strengthening exercises',
    ];
  }
  return [
    ...base,
    'Maintain current healthy habits and continue monitoring body composition',
  ];
};

const warningSigns = () => [
  'This calculator is educational and not a medical diagnosis. Consult healthcare professionals for medical evaluation.',
  'Central obesity increases risk of metabolic syndrome, type 2 diabetes, and cardiovascular disease. Early intervention is important.',
  'If you have symptoms like persistent fatigue, difficulty breathing, or other health concerns, seek medical attention.',
];

export default function WaistToBMIRatioRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      waistCircumference: undefined,
      unit: 'metric',
    },
  });

  const unit = form.watch('unit');

  const onSubmit = (values: FormValues) => {
    const calc = calculateWaistBMIRatio(values);
    if (!calc || !values.age || !values.gender) {
      setResult(null);
      return;
    }

    const riskLevel = getRiskLevel(calc.ratio, values.gender, values.age);

    setResult({
      status: 'Calculated',
      interpretation: interpret(calc.ratio, riskLevel),
      recommendations: recommendations(riskLevel),
      warningSigns: warningSigns(),
      plan: plan(),
      ratio: Math.round(calc.ratio * 100) / 100,
      bmi: Math.round(calc.bmi * 10) / 10,
      waist: Math.round(calc.waist * 10) / 10,
      riskLevel,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Waist-to-BMI Ratio Risk Calculator</CardTitle>
          <CardDescription>Assess central obesity and metabolic risk using waist-to-BMI ratio.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Body Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Ruler className="h-4 w-4" /> Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 175" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="waistCircumference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waist Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 85" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full md:w-auto">Calculate Waist-to-BMI Ratio Risk</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Waist-to-BMI Ratio Assessment</CardTitle></div>
              <CardDescription>Central obesity and metabolic risk evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Ratio</h4><p className="text-2xl font-bold text-primary">{result.ratio}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">BMI</h4><p className="text-2xl font-bold text-primary">{result.bmi}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Waist (cm)</h4><p className="text-2xl font-bold text-primary">{result.waist}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Level</h4><p className="text-2xl font-bold text-primary">{result.riskLevel}</p></div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.warningSigns.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Central Obesity Reduction Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead>
                  <tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Accurate measurements ensure reliable risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for body composition and metabolic health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/waist-to-hip-ratio-calculator" className="text-primary hover:underline">Waist-to-Hip Ratio</Link></h4><p className="text-sm text-muted-foreground">Assess body fat distribution using waist and hip measurements.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/waist-to-height-ratio-calculator" className="text-primary hover:underline">Waist-to-Height Ratio</Link></h4><p className="text-sm text-muted-foreground">Evaluate central obesity using waist and height measurements.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/metabolic-syndrome-risk-calculator" className="text-primary hover:underline">Metabolic Syndrome Risk</Link></h4><p className="text-sm text-muted-foreground">Assess metabolic syndrome indicators linked to central obesity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiometabolic-age-calculator" className="text-primary hover:underline">Cardiometabolic Age</Link></h4><p className="text-sm text-muted-foreground">Evaluate overall metabolic health status.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Waist-to-BMI Ratio</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>The waist-to-BMI ratio accounts for body fat distribution, providing a more nuanced assessment than BMI alone. Central obesity (abdominal fat) is more metabolically active and increases disease risk more than peripheral fat. Improve the ratio through targeted exercise (core strengthening, cardio), healthy diet, stress management, and adequate sleep. Regular monitoring helps track improvements in body composition over time.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO-oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{faqs.map(([q,a],i)=>(<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}
