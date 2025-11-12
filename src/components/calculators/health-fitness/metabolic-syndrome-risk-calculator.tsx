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
import { Heart, Calendar, Zap, Droplet } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  waistCircumference: z.number().positive().optional(),
  unit: z.enum(['metric', 'imperial']).optional(),
  systolicBP: z.number().positive().optional(),
  diastolicBP: z.number().positive().optional(),
  fastingGlucose: z.number().positive().optional(),
  hdlCholesterol: z.number().positive().optional(),
  triglycerides: z.number().positive().optional(),
  glucoseUnit: z.enum(['mg/dL', 'mmol/L']).optional(),
  cholesterolUnit: z.enum(['mg/dL', 'mmol/L']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  criteria: number;
  results: string[];
  riskLevel: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current metabolic health: measure waist circumference, blood pressure, and review lab results' },
  { week: 2, focus: 'Begin weight loss if overweight: aim for 5-10% weight loss to improve all metabolic parameters' },
  { week: 3, focus: 'Adopt heart-healthy diet: focus on whole foods, limit processed foods, reduce added sugars and refined carbs' },
  { week: 4, focus: 'Increase physical activity: aim for 150+ minutes/week moderate exercise, include both cardio and strength training' },
  { week: 5, focus: 'Reduce sodium intake: limit to <2300mg/day to help lower blood pressure' },
  { week: 6, focus: 'Improve sleep quality: aim for 7-9 hours nightly, as poor sleep affects metabolism and insulin sensitivity' },
  { week: 7, focus: 'Manage stress: practice stress-reduction techniques as chronic stress affects metabolic health' },
  { week: 8, focus: 'Reassess metabolic parameters and continue healthy lifestyle habits with regular medical monitoring' },
];

const faqs: [string, string][] = [
  ['What is metabolic syndrome?', 'Metabolic syndrome is a cluster of conditions that occur together, increasing your risk of heart disease, stroke, and type 2 diabetes. It includes abdominal obesity, elevated blood pressure, high blood sugar, low HDL cholesterol, and high triglycerides.'],
  ['What are the five criteria for metabolic syndrome?', 'The five criteria (ATP III) are: 1) Abdominal obesity (waist circumference ≥102cm men, ≥88cm women), 2) Elevated blood pressure (≥130/85 mmHg), 3) Elevated fasting glucose (≥100 mg/dL), 4) Low HDL cholesterol (<40 mg/dL men, <50 mg/dL women), 5) Elevated triglycerides (≥150 mg/dL). You need 3 of 5 to have metabolic syndrome.'],
  ['Who is at risk for metabolic syndrome?', 'Risk factors include being overweight or obese, sedentary lifestyle, age over 50, family history of diabetes or heart disease, polycystic ovary syndrome (PCOS), and certain ethnic backgrounds. Risk increases with age and weight gain.'],
  ['How is metabolic syndrome diagnosed?', 'Metabolic syndrome is diagnosed when you have at least 3 of the 5 criteria. Diagnosis requires measurements of waist circumference, blood pressure, fasting glucose, HDL cholesterol, and triglycerides. Healthcare providers use standardized criteria (ATP III or IDF).'],
  ['Can metabolic syndrome be reversed?', 'Yes, metabolic syndrome can often be reversed or significantly improved through lifestyle changes including weight loss (5-10% of body weight), regular exercise, healthy diet, and in some cases, medication. Early intervention is most effective.'],
  ['What are the health risks of metabolic syndrome?', 'Metabolic syndrome significantly increases risk of cardiovascular disease (2-3x higher), type 2 diabetes (5x higher), stroke, fatty liver disease, sleep apnea, and certain cancers. It\'s a serious condition requiring attention.'],
  ['How does weight loss help metabolic syndrome?', 'Weight loss of just 5-10% can dramatically improve all metabolic parameters: reduce waist circumference, lower blood pressure, improve blood sugar control, increase HDL cholesterol, and lower triglycerides. It\'s the most effective intervention.'],
  ['Is this calculator a medical diagnosis?', 'No, this is an educational screening tool based on ATP III criteria. Metabolic syndrome requires professional medical evaluation with accurate measurements and laboratory tests for proper diagnosis and treatment.'],
  ['What lifestyle changes are most important?', 'Most important changes are: 1) Weight loss if overweight, 2) Regular exercise (150+ min/week), 3) Heart-healthy diet (whole foods, limit processed), 4) Quit smoking, 5) Limit alcohol, 6) Manage stress, 7) Adequate sleep.'],
  ['When do I need medication for metabolic syndrome?', 'Medication may be needed if lifestyle changes alone don\'t improve parameters, or if you have very high blood pressure, blood sugar, or cholesterol. Decisions should be made with healthcare providers based on individual risk and response to lifestyle changes.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years. Metabolic syndrome risk increases with age, especially after 50, as metabolism slows and risk factors accumulate.' },
  { label: 'Gender', description: 'Biological sex. Waist circumference and HDL cholesterol thresholds differ by gender. Men and postmenopausal women have higher metabolic syndrome risk.' },
  { label: 'Waist Circumference', description: 'Measure at the narrowest point between ribs and hips. Men: ≥102cm (40"), Women: ≥88cm (35") indicates abdominal obesity, a key metabolic syndrome criterion.' },
  { label: 'Blood Pressure', description: 'Systolic ≥130 mmHg or Diastolic ≥85 mmHg indicates elevated blood pressure. Both numbers are important for metabolic syndrome assessment.' },
  { label: 'Fasting Glucose', description: 'Blood sugar after 8+ hours fasting. ≥100 mg/dL (5.6 mmol/L) indicates elevated fasting glucose, suggesting insulin resistance or prediabetes.' },
  { label: 'HDL Cholesterol', description: 'The "good" cholesterol. Men: <40 mg/dL (1.0 mmol/L), Women: <50 mg/dL (1.3 mmol/L) indicates low HDL, a metabolic syndrome criterion.' },
  { label: 'Triglycerides', description: 'A type of fat in blood. ≥150 mg/dL (1.7 mmol/L) indicates elevated triglycerides, often associated with insulin resistance and metabolic syndrome.' },
];

const calculateMetabolicSyndromeRisk = (values: FormValues) => {
  if (!values.waistCircumference || !values.systolicBP || !values.diastolicBP || !values.fastingGlucose || !values.hdlCholesterol || !values.triglycerides) return null;
  
  let criteria = 0;
  const results = [];
  
  const waistThreshold = values.gender === 'male' ? 
    (values.unit === 'metric' ? 102 : 40) : 
    (values.unit === 'metric' ? 88 : 35);
  
  if (values.waistCircumference >= waistThreshold) {
    criteria++;
    results.push('Abdominal obesity');
  }
  
  if (values.systolicBP >= 130 || values.diastolicBP >= 85) {
    criteria++;
    results.push('Elevated blood pressure');
  }
  
  const glucoseThreshold = values.glucoseUnit === 'mg/dL' ? 100 : 5.6;
  if (values.fastingGlucose >= glucoseThreshold) {
    criteria++;
    results.push('Elevated fasting glucose');
  }
  
  const hdlThreshold = values.gender === 'male' ? 
    (values.cholesterolUnit === 'mg/dL' ? 40 : 1.0) : 
    (values.cholesterolUnit === 'mg/dL' ? 50 : 1.3);
  
  if (values.hdlCholesterol < hdlThreshold) {
    criteria++;
    results.push('Low HDL cholesterol');
  }
  
  const trigThreshold = values.cholesterolUnit === 'mg/dL' ? 150 : 1.7;
  if (values.triglycerides >= trigThreshold) {
    criteria++;
    results.push('Elevated triglycerides');
  }
  
  let riskLevel;
  if (criteria < 3) riskLevel = 'No Metabolic Syndrome';
  else if (criteria === 3) riskLevel = 'Metabolic Syndrome';
  else if (criteria === 4) riskLevel = 'Severe Metabolic Syndrome';
  else riskLevel = 'Very Severe Metabolic Syndrome';
  
  return { criteria, results, riskLevel };
};

const interpret = (riskLevel: string, criteria: number) => {
  if (riskLevel === 'No Metabolic Syndrome') return 'You do not meet the criteria for metabolic syndrome. Continue maintaining a healthy lifestyle to prevent development of metabolic risk factors.';
  if (riskLevel === 'Metabolic Syndrome') return 'You meet the criteria for metabolic syndrome. Lifestyle modifications are essential to reduce cardiovascular and diabetes risk.';
  if (riskLevel === 'Severe Metabolic Syndrome') return 'You have multiple metabolic risk factors. Comprehensive lifestyle intervention and medical evaluation are recommended.';
  return 'You have very severe metabolic syndrome with most criteria present. Urgent medical evaluation and aggressive intervention are needed to reduce serious health risks.';
};

const recommendations = (riskLevel: string, criteria: number) => {
  const base = [
    'Focus on weight loss if overweight: aim for 5-10% weight loss',
    'Increase physical activity: 150+ minutes/week moderate exercise',
    'Adopt heart-healthy diet: whole foods, limit processed foods and added sugars',
  ];
  
  if (riskLevel === 'Very Severe Metabolic Syndrome' || riskLevel === 'Severe Metabolic Syndrome') {
    return [
      ...base,
      'Seek medical evaluation promptly for comprehensive assessment',
      'Consider medication evaluation for blood pressure, glucose, or cholesterol if needed',
      'Regular monitoring of all metabolic parameters',
      'Implement aggressive lifestyle changes with medical supervision',
    ];
  }
  
  if (riskLevel === 'Metabolic Syndrome') {
    return [
      ...base,
      'Discuss with healthcare provider for monitoring and potential treatment',
      'Focus on improving all abnormal parameters',
      'Regular follow-up to track improvements',
    ];
  }
  
  return [
    ...base,
    'Continue maintaining healthy lifestyle habits',
    'Regular health monitoring to prevent development of metabolic syndrome',
    'Stay active and maintain healthy weight',
  ];
};

const warningSigns = () => [
  'This calculator is for educational purposes and not a medical diagnosis. Metabolic syndrome requires professional medical evaluation with accurate measurements and laboratory tests.',
  'If you have metabolic syndrome or multiple risk factors, consult healthcare providers for proper evaluation, monitoring, and treatment to reduce cardiovascular and diabetes risk.',
  'Untreated metabolic syndrome significantly increases risk of heart disease, stroke, type 2 diabetes, and other serious complications. Early intervention through lifestyle changes and medical care is crucial.',
];

export default function MetabolicSyndromeRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      waistCircumference: undefined,
      unit: 'metric',
      systolicBP: undefined,
      diastolicBP: undefined,
      fastingGlucose: undefined,
      hdlCholesterol: undefined,
      triglycerides: undefined,
      glucoseUnit: 'mg/dL',
      cholesterolUnit: 'mg/dL',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateMetabolicSyndromeRisk(values);
    if (!calc) {
      setResult(null);
      return;
    }

    setResult({
      criteria: calc.criteria,
      results: calc.results,
      riskLevel: calc.riskLevel,
      interpretation: interpret(calc.riskLevel, calc.criteria),
      recommendations: recommendations(calc.riskLevel, calc.criteria),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" /> Metabolic Syndrome Risk Calculator</CardTitle>
          <CardDescription>Assess your risk for metabolic syndrome using ATP III criteria based on waist circumference, blood pressure, glucose, and cholesterol levels.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
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
                <h3 className="text-lg font-semibold">Anthropometric Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="metric">Metric (cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (inches)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="waistCircumference" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waist Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 95" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Blood Pressure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="systolicBP" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Heart className="h-4 w-4" /> Systolic BP (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="diastolicBP" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Heart className="h-4 w-4" /> Diastolic BP (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Laboratory Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="glucoseUnit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Glucose Units</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mg/dL">mg/dL</SelectItem>
                          <SelectItem value="mmol/L">mmol/L</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fastingGlucose" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fasting Glucose</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 95" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cholesterolUnit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cholesterol Units</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mg/dL">mg/dL</SelectItem>
                          <SelectItem value="mmol/L">mmol/L</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="hdlCholesterol" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Droplet className="h-4 w-4" /> HDL Cholesterol</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="triglycerides" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Droplet className="h-4 w-4" /> Triglycerides</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 140" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">Calculate Metabolic Syndrome Risk</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Your Metabolic Syndrome Assessment</CardTitle></div>
              <CardDescription>Based on ATP III criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Criteria Met</h4><p className="text-2xl font-bold text-primary">{result.criteria}/5</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Level</h4><p className="text-2xl font-bold text-primary">{result.riskLevel}</p></div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Abnormal Criteria:</h4>
                {result.results.length > 0 ? (
                  <ul className="list-disc ml-6 space-y-1">
                    {result.results.map((criterion, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{criterion}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-700">✅ All criteria within normal limits</p>
                )}
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Metabolic Syndrome Management Plan</CardTitle></CardHeader>
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
          <CardDescription>Key factors affecting metabolic syndrome assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for metabolic health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary hover:underline">Cardiovascular Disease Risk</Link></h4><p className="text-sm text-muted-foreground">Assess overall cardiovascular risk factors.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/diabetes-risk-type2-calculator" className="text-primary hover:underline">Type 2 Diabetes Risk</Link></h4><p className="text-sm text-muted-foreground">Evaluate diabetes risk factors.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/waist-to-hip-ratio-calculator" className="text-primary hover:underline">Waist-to-Hip Ratio</Link></h4><p className="text-sm text-muted-foreground">Assess body fat distribution and metabolic risk.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hypertension-stage-calculator" className="text-primary hover:underline">Hypertension Stage</Link></h4><p className="text-sm text-muted-foreground">Evaluate blood pressure status and cardiovascular risk.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Metabolic Syndrome</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Metabolic syndrome is a cluster of conditions that occur together, increasing your risk of heart disease, stroke, and type 2 diabetes. The five criteria include abdominal obesity, elevated blood pressure, high blood sugar, low HDL cholesterol, and high triglycerides. You need 3 of 5 criteria to be diagnosed. Metabolic syndrome significantly increases cardiovascular and diabetes risk. Prevention and management focus on weight loss, regular exercise, heart-healthy diet, and in some cases, medication. Early identification and intervention can significantly reduce these serious health risks.</p>
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
