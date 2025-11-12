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
import { Zap, Heart, Calendar, Scale, Ruler, Gauge, Droplet } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  unit: z.enum(['metric', 'imperial']).optional(),
  waistCircumference: z.number().positive().optional(),
  systolicBP: z.number().positive().optional(),
  diastolicBP: z.number().positive().optional(),
  totalCholesterol: z.number().positive().optional(),
  hdlCholesterol: z.number().positive().optional(),
  triglycerides: z.number().positive().optional(),
  fastingGlucose: z.number().positive().optional(),
  cholesterolUnit: z.enum(['mg/dL', 'mmol/L']).optional(),
  glucoseUnit: z.enum(['mg/dL', 'mmol/L']).optional(),
  smoking: z.boolean().optional(),
  diabetes: z.boolean().optional(),
  familyHistory: z.boolean().optional(),
  physicalActivity: z.enum(['sedentary', 'light', 'moderate', 'vigorous']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  metabolicAge: number;
  chronologicalAge: number;
  bmi: number;
  ageDifference: number;
  riskStatus: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current health metrics: blood pressure, cholesterol, glucose, and body composition' },
  { week: 2, focus: 'Begin regular aerobic exercise (150+ minutes/week) to improve cardiovascular health' },
  { week: 3, focus: 'Adopt heart-healthy diet: reduce processed foods, increase fruits, vegetables, and whole grains' },
  { week: 4, focus: 'Focus on stress management: meditation, adequate sleep (7–9 hours), and relaxation techniques' },
  { week: 5, focus: 'Add strength training 2–3 times per week to improve body composition' },
  { week: 6, focus: 'Monitor blood pressure and glucose levels; adjust lifestyle as needed' },
  { week: 7, focus: 'Reassess metabolic age and compare improvements' },
  { week: 8, focus: 'Maintain healthy habits and schedule follow-up health screenings' },
];

const faqs: [string, string][] = [
  ['What is cardiometabolic age?', 'Cardiometabolic age reflects how well your cardiovascular and metabolic systems function compared to your chronological age. A younger metabolic age indicates better health.'],
  ['How is cardiometabolic age calculated?', 'The calculator considers BMI, waist circumference, blood pressure, cholesterol, glucose, lifestyle factors (smoking, exercise), and family history to estimate metabolic age.'],
  ['What is a good cardiometabolic age?', 'A metabolic age younger than your chronological age is ideal. Being 5+ years younger indicates excellent cardiovascular health.'],
  ['Can I improve my cardiometabolic age?', 'Yes, through regular exercise, healthy diet, stress management, adequate sleep, and controlling risk factors like blood pressure and cholesterol.'],
  ['How often should I check my metabolic age?', 'Reassess every 3–6 months or after significant lifestyle changes. Regular monitoring helps track improvements.'],
  ['Does age affect the calculation?', 'Yes, the calculation uses your chronological age as a baseline and adjusts based on health factors. Older individuals may see larger age differences.'],
  ['What if my metabolic age is much older?', 'Focus on lifestyle modifications: increase physical activity, improve diet, manage stress, and consult healthcare providers for medical risk factors.'],
  ['Is this calculator a medical diagnosis?', 'No, this is an educational tool. Consult healthcare professionals for medical evaluation and treatment of cardiovascular risk factors.'],
  ['Can medications affect metabolic age?', 'Medications that control blood pressure, cholesterol, or diabetes may improve metabolic age, but the calculator focuses on lifestyle factors.'],
  ['What lifestyle changes have the biggest impact?', 'Regular exercise, healthy diet, smoking cessation, stress management, and adequate sleep have the most significant effects on metabolic age.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your chronological age in years (18–120).' },
  { label: 'Gender', description: 'Biological sex, as metabolic thresholds differ between males and females.' },
  { label: 'Weight & Height', description: 'Body measurements used to calculate BMI, a key metabolic health indicator.' },
  { label: 'Waist Circumference', description: 'Abdominal fat measurement; higher values indicate increased metabolic risk.' },
  { label: 'Blood Pressure', description: 'Systolic and diastolic readings; hypertension accelerates cardiovascular aging.' },
  { label: 'Cholesterol Levels', description: 'Total, HDL, and triglycerides; lipid profile affects cardiovascular health.' },
  { label: 'Fasting Glucose', description: 'Blood sugar level; elevated values indicate diabetes or prediabetes risk.' },
  { label: 'Lifestyle Factors', description: 'Smoking, physical activity, family history, and diabetes status impact metabolic age.' },
];

const calculateCardiometabolicAge = (values: FormValues) => {
  if (!values.age || !values.weight || !values.height || !values.unit) return null;
  
  let metabolicAge = values.age;
  
  // Calculate BMI
  let bmi;
  if (values.unit === 'metric') {
    bmi = values.weight / ((values.height / 100) ** 2);
  } else {
    bmi = (values.weight / (values.height ** 2)) * 703;
  }
  
  // BMI adjustments
  if (bmi >= 35) metabolicAge += 8;
  else if (bmi >= 30) metabolicAge += 5;
  else if (bmi >= 25) metabolicAge += 2;
  else if (bmi < 18.5) metabolicAge += 1;
  
  // Waist circumference
  if (values.waistCircumference) {
    const waistThreshold = values.gender === 'male' ? 
      (values.unit === 'metric' ? 102 : 40) : 
      (values.unit === 'metric' ? 88 : 35);
    if (values.waistCircumference >= waistThreshold) metabolicAge += 3;
  }
  
  // Blood pressure
  if (values.systolicBP && values.diastolicBP) {
    if (values.systolicBP >= 160 || values.diastolicBP >= 100) metabolicAge += 6;
    else if (values.systolicBP >= 140 || values.diastolicBP >= 90) metabolicAge += 4;
    else if (values.systolicBP >= 130 || values.diastolicBP >= 80) metabolicAge += 2;
  }
  
  // Cholesterol
  if (values.totalCholesterol && values.cholesterolUnit) {
    const cholThreshold = values.cholesterolUnit === 'mg/dL' ? 240 : 6.2;
    if (values.totalCholesterol > cholThreshold) metabolicAge += 2;
  }
  if (values.hdlCholesterol && values.cholesterolUnit) {
    const hdlThreshold = values.cholesterolUnit === 'mg/dL' ? 40 : 1.0;
    if (values.hdlCholesterol < hdlThreshold) metabolicAge += 2;
  }
  if (values.triglycerides && values.cholesterolUnit) {
    const trigThreshold = values.cholesterolUnit === 'mg/dL' ? 200 : 2.3;
    if (values.triglycerides > trigThreshold) metabolicAge += 1;
  }
  
  // Glucose
  if (values.fastingGlucose && values.glucoseUnit) {
    const glucoseThreshold = values.glucoseUnit === 'mg/dL' ? 126 : 7.0;
    if (values.fastingGlucose >= glucoseThreshold) metabolicAge += 5;
    else if (values.fastingGlucose >= (values.glucoseUnit === 'mg/dL' ? 100 : 5.6)) metabolicAge += 2;
  }
  
  // Lifestyle
  if (values.smoking) metabolicAge += 4;
  if (values.familyHistory) metabolicAge += 2;
  if (values.physicalActivity === 'sedentary') metabolicAge += 3;
  else if (values.physicalActivity === 'light') metabolicAge += 1;
  else if (values.physicalActivity === 'vigorous') metabolicAge -= 2;
  
  return { metabolicAge: Math.max(18, Math.round(metabolicAge)), bmi: Math.round(bmi * 10) / 10 };
};

const interpret = (difference: number) => {
  if (difference <= -5) return 'Excellent—your metabolic age is significantly younger than your chronological age, indicating excellent cardiovascular health.';
  if (difference <= -2) return 'Good—your metabolic age is younger than your chronological age, showing good cardiovascular health.';
  if (difference <= 2) return 'Average—your metabolic age is similar to your chronological age. There\'s room for improvement through lifestyle changes.';
  if (difference <= 5) return 'Concerning—your metabolic age is older than your chronological age. Focus on lifestyle modifications and consider medical evaluation.';
  return 'High Risk—your metabolic age is significantly older than your chronological age. Immediate lifestyle intervention and medical consultation are recommended.';
};

const recommendations = (difference: number) => {
  const base = [
    'Engage in regular aerobic exercise (150+ minutes/week) and strength training (2–3 times/week)',
    'Adopt a heart-healthy diet: Mediterranean-style eating with fruits, vegetables, whole grains, and lean proteins',
    'Prioritize 7–9 hours of quality sleep per night and manage stress through meditation or relaxation',
  ];
  if (difference > 5) {
    return [
      ...base,
      'Consult healthcare providers for medical evaluation and treatment of risk factors',
      'Consider smoking cessation programs if applicable',
      'Monitor blood pressure, cholesterol, and glucose regularly',
    ];
  }
  if (difference > 2) {
    return [
      ...base,
      'Focus on reducing processed foods, added sugars, and saturated fats',
      'Increase physical activity gradually if currently sedentary',
    ];
  }
  return [
    ...base,
    'Maintain current healthy habits and continue regular health monitoring',
  ];
};

const warningSigns = () => [
  'This calculator is educational and not a medical diagnosis. Consult healthcare professionals for medical evaluation.',
  'If you have symptoms like chest pain, shortness of breath, or dizziness, seek immediate medical attention.',
  'Uncontrolled blood pressure, cholesterol, or diabetes require medical management alongside lifestyle changes.',
];

export default function CardiometabolicAgeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      unit: 'metric',
      waistCircumference: undefined,
      systolicBP: undefined,
      diastolicBP: undefined,
      totalCholesterol: undefined,
      hdlCholesterol: undefined,
      triglycerides: undefined,
      fastingGlucose: undefined,
      cholesterolUnit: 'mg/dL',
      glucoseUnit: 'mg/dL',
      smoking: false,
      diabetes: false,
      familyHistory: false,
      physicalActivity: 'sedentary',
    },
  });

  const unit = form.watch('unit');

  const onSubmit = (values: FormValues) => {
    const calc = calculateCardiometabolicAge(values);
    if (!calc || !values.age) {
      setResult(null);
      return;
    }

    const difference = calc.metabolicAge - values.age;
    let riskStatus = 'Excellent';
    if (difference > 5) riskStatus = 'High Risk';
    else if (difference > 2) riskStatus = 'Concerning';
    else if (difference > -2) riskStatus = 'Average';
    else if (difference > -5) riskStatus = 'Good';

    setResult({
      status: 'Calculated',
      interpretation: interpret(difference),
      recommendations: recommendations(difference),
      warningSigns: warningSigns(),
      plan: plan(),
      metabolicAge: calc.metabolicAge,
      chronologicalAge: values.age,
      bmi: calc.bmi,
      ageDifference: difference,
      riskStatus,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" /> Cardiometabolic Age Calculator</CardTitle>
          <CardDescription>Estimate your metabolic age based on cardiovascular and metabolic risk factors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Blood Pressure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="systolicBP" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Systolic BP (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="diastolicBP" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diastolic BP (mmHg)</FormLabel>
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
                  <FormField control={form.control} name="totalCholesterol" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Droplet className="h-4 w-4" /> Total Cholesterol</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 200" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="hdlCholesterol" render={({ field }) => (
                    <FormItem>
                      <FormLabel>HDL Cholesterol</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="triglycerides" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Triglycerides</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 150" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lifestyle Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="smoking" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Current Smoking</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="diabetes" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Diabetes</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="familyHistory" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Family History of Heart Disease</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="physicalActivity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="light">Light Activity</SelectItem>
                          <SelectItem value="moderate">Moderate Activity</SelectItem>
                          <SelectItem value="vigorous">Vigorous Activity</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">Calculate Cardiometabolic Age</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Cardiometabolic Age Summary</CardTitle></div>
              <CardDescription>Metabolic age vs. chronological age comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Chronological Age</h4><p className="text-2xl font-bold text-primary">{result.chronologicalAge}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Metabolic Age</h4><p className="text-2xl font-bold text-primary">{result.metabolicAge}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Age Difference</h4><p className="text-2xl font-bold text-primary">{result.ageDifference > 0 ? '+' : ''}{result.ageDifference}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">BMI</h4><p className="text-2xl font-bold text-primary">{result.bmi}</p></div>
              </div>
              <div className="p-4 border rounded">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Risk Status</h4>
                <p className="text-lg font-bold text-primary">{result.riskStatus}</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Metabolic Health Plan</CardTitle></CardHeader>
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
          <CardDescription>Accurate inputs ensure reliable metabolic age estimation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for cardiovascular and metabolic health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary hover:underline">Cardiovascular Disease Risk</Link></h4><p className="text-sm text-muted-foreground">Assess overall cardiovascular risk factors.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/metabolic-syndrome-risk-calculator" className="text-primary hover:underline">Metabolic Syndrome Risk</Link></h4><p className="text-sm text-muted-foreground">Evaluate metabolic syndrome indicators.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/waist-to-bmi-ratio-risk-calculator" className="text-primary hover:underline">Waist-to-BMI Ratio</Link></h4><p className="text-sm text-muted-foreground">Assess body composition and metabolic risk.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/heart-rate-variability-hrv-score-calculator" className="text-primary hover:underline">HRV Score</Link></h4><p className="text-sm text-muted-foreground">Monitor autonomic nervous system health.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Cardiometabolic Age</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Cardiometabolic age reflects how well your cardiovascular and metabolic systems function compared to your chronological age. A younger metabolic age indicates better health and lower cardiovascular risk. Improve metabolic age through regular exercise, healthy diet, stress management, adequate sleep, and controlling risk factors like blood pressure, cholesterol, and glucose. Regular monitoring helps track improvements over time.</p>
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
