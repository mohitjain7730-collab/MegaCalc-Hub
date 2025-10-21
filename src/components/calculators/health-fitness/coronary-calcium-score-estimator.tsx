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
import { Heart, AlertTriangle, Shield } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  age: z.number().min(40).max(80),
  gender: z.enum(['male', 'female']),
  race: z.enum(['white', 'black', 'hispanic', 'asian', 'other']),
  smoking: z.boolean(),
  diabetes: z.boolean(),
  hypertension: z.boolean(),
  familyHistory: z.boolean(),
  cholesterol: z.number().positive().optional(),
  hdlCholesterol: z.number().positive().optional(),
  cholesterolUnit: z.enum(['mg/dL', 'mmol/L']),
  systolicBP: z.number().positive().optional(),
  diastolicBP: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const calculateCalciumScore = (values: FormValues) => {
  let score = 0;
  const riskFactors = [];
  
  // Age factor (most significant)
  if (values.age >= 70) score += 8;
  else if (values.age >= 60) score += 6;
  else if (values.age >= 50) score += 4;
  else if (values.age >= 45) score += 2;
  
  // Gender factor
  if (values.gender === 'male') score += 2;
  
  // Race factor
  if (values.race === 'black') score += 1;
  else if (values.race === 'hispanic') score += 1;
  
  // Risk factors
  if (values.smoking) {
    score += 3;
    riskFactors.push('Smoking');
  }
  if (values.diabetes) {
    score += 3;
    riskFactors.push('Diabetes');
  }
  if (values.hypertension) {
    score += 2;
    riskFactors.push('Hypertension');
  }
  if (values.familyHistory) {
    score += 2;
    riskFactors.push('Family history of heart disease');
  }
  
  // Cholesterol factors
  if (values.cholesterol) {
    const cholThreshold = values.cholesterolUnit === 'mg/dL' ? 200 : 5.2;
    if (values.cholesterol > cholThreshold) {
      score += 1;
      riskFactors.push('High total cholesterol');
    }
  }
  
  if (values.hdlCholesterol) {
    const hdlThreshold = values.cholesterolUnit === 'mg/dL' ? 40 : 1.0;
    if (values.hdlCholesterol < hdlThreshold) {
      score += 1;
      riskFactors.push('Low HDL cholesterol');
    }
  }
  
  // Blood pressure factors
  if (values.systolicBP && values.systolicBP >= 140) {
    score += 1;
    riskFactors.push('High systolic blood pressure');
  }
  if (values.diastolicBP && values.diastolicBP >= 90) {
    score += 1;
    riskFactors.push('High diastolic blood pressure');
  }
  
  return { score, riskFactors };
};

const getCalciumScoreCategory = (score: number) => {
  if (score <= 3) return { 
    category: 'Low Risk', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    description: 'Minimal coronary calcium expected',
    percentile: '< 25th percentile'
  };
  if (score <= 6) return { 
    category: 'Moderate Risk', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    description: 'Some coronary calcium likely',
    percentile: '25th-50th percentile'
  };
  if (score <= 9) return { 
    category: 'High Risk', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    description: 'Significant coronary calcium expected',
    percentile: '50th-75th percentile'
  };
  return { 
    category: 'Very High Risk', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    description: 'Extensive coronary calcium likely',
    percentile: '> 75th percentile'
  };
};

export default function CoronaryCalciumScoreEstimator() {
  const [result, setResult] = useState<{ 
    score: number; 
    riskFactors: string[];
    category: { 
      category: string; 
      color: string; 
      bgColor: string; 
      borderColor: string;
      description: string;
      percentile: string;
    } 
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      race: undefined,
      smoking: false,
      diabetes: false,
      hypertension: false,
      familyHistory: false,
      cholesterol: undefined,
      hdlCholesterol: undefined,
      cholesterolUnit: 'mg/dL',
      systolicBP: undefined,
      diastolicBP: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { score, riskFactors } = calculateCalciumScore(values);
    const category = getCalciumScoreCategory(score);
    setResult({ score, riskFactors, category });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="race" render={({ field }) => (
              <FormItem>
                <FormLabel>Race/Ethnicity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select race/ethnicity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="white">White/Caucasian</SelectItem>
                    <SelectItem value="black">Black/African American</SelectItem>
                    <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cardiovascular Risk Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="smoking" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Current Smoking</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="diabetes" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Diabetes</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="hypertension" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Hypertension</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="familyHistory" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Family History of Heart Disease</FormLabel>
                </FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Laboratory Values (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="cholesterol" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Cholesterol</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="hdlCholesterol" render={({ field }) => (
                <FormItem>
                  <FormLabel>HDL Cholesterol</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="cholesterolUnit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cholesterol Units</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
            <h3 className="text-lg font-semibold">Blood Pressure (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="systolicBP" render={({ field }) => (
                <FormItem>
                  <FormLabel>Systolic BP (mmHg)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="diastolicBP" render={({ field }) => (
                <FormItem>
                  <FormLabel>Diastolic BP (mmHg)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <Button type="submit" className="w-full">Estimate Coronary Calcium Score</Button>
        </form>
      </Form>

      {result && (
        <Card className={`mt-8 ${result.category.bgColor} ${result.category.borderColor} border-2`}>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Your Coronary Calcium Score Estimate</CardTitle>
                <CardDescription>Predicted coronary artery calcium burden</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-4xl font-bold">{result.score}</p>
                <p className="text-lg">Risk Score</p>
              </div>
              <div className={`text-2xl font-semibold ${result.category.color}`}>
                {result.category.category}
              </div>
              <div className="text-sm text-muted-foreground">
                {result.category.description}
              </div>
              <div className="text-sm text-muted-foreground">
                Expected percentile: {result.category.percentile}
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              {result.riskFactors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">Identified Risk Factors:</h4>
                  <ul className="list-disc ml-6 space-y-1">
                    {result.riskFactors.map((factor, index) => (
                      <li key={index} className="text-sm">{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3">Risk Interpretation:</h4>
                {result.category.category === 'Low Risk' && (
                  <div className="space-y-2">
                    <p className="text-green-700">✅ <strong>Low Risk:</strong> Minimal coronary calcium expected.</p>
                    <ul className="list-disc ml-6 text-sm text-green-700">
                      <li>Continue maintaining healthy lifestyle</li>
                      <li>Regular cardiovascular risk assessment</li>
                      <li>Focus on prevention strategies</li>
                    </ul>
                  </div>
                )}
                {result.category.category === 'Moderate Risk' && (
                  <div className="space-y-2">
                    <p className="text-yellow-700">⚠️ <strong>Moderate Risk:</strong> Some coronary calcium likely.</p>
                    <ul className="list-disc ml-6 text-sm text-yellow-700">
                      <li>Consider coronary calcium scan</li>
                      <li>Focus on risk factor modification</li>
                      <li>Regular cardiovascular monitoring</li>
                      <li>Discuss with healthcare provider</li>
                    </ul>
                  </div>
                )}
                {result.category.category === 'High Risk' && (
                  <div className="space-y-2">
                    <p className="text-orange-700">🔶 <strong>High Risk:</strong> Significant coronary calcium expected.</p>
                    <ul className="list-disc ml-6 text-sm text-orange-700">
                      <li>Coronary calcium scan recommended</li>
                      <li>Aggressive risk factor modification</li>
                      <li>Consider preventive medications</li>
                      <li>Regular cardiovascular follow-up</li>
                    </ul>
                  </div>
                )}
                {result.category.category === 'Very High Risk' && (
                  <div className="space-y-2">
                    <p className="text-red-700">🚨 <strong>Very High Risk:</strong> Extensive coronary calcium likely.</p>
                    <ul className="list-disc ml-6 text-sm text-red-700">
                      <li>Immediate coronary calcium scan</li>
                      <li>Comprehensive cardiovascular evaluation</li>
                      <li>Aggressive preventive treatment</li>
                      <li>Consider specialist referral</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Demographics</h4>
              <p>Age, gender, and race significantly influence coronary calcium risk and progression.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Risk Factors</h4>
              <p>Smoking, diabetes, hypertension, and family history are major contributors to coronary calcium development.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Laboratory Values</h4>
              <p>Cholesterol levels help assess overall cardiovascular risk profile.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Blood Pressure</h4>
              <p>Hypertension accelerates coronary artery disease and calcium deposition.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This calculator estimates your risk of having significant coronary artery calcium based on established risk factors. Coronary calcium is a marker of atherosclerosis and predicts future cardiovascular events.</p>
            <p className="mt-2">The actual coronary calcium score is measured by CT scan, but this tool helps identify who might benefit from such testing based on risk factors.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on coronary calcium scoring and cardiovascular risk assessment, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.acc.org/latest-in-cardiology/articles/2017/09/07/11/47/mon-5pm-br-1" target="_blank" rel="noopener noreferrer" className="text-primary underline">American College of Cardiology - Coronary Calcium Scoring</a></li>
              <li><a href="https://www.heart.org/en/health-topics/heart-attack/diagnosing-a-heart-attack/cardiac-computed-tomography-ct" target="_blank" rel="noopener noreferrer" className="text-primary underline">American Heart Association - Cardiac CT</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Coronary Calcium Score Estimator – Assess Your Risk for Coronary Artery Disease" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Comprehensive coronary calcium risk assessment based on cardiovascular risk factors to predict coronary artery disease burden." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Coronary Calcium</h2>
        <p itemProp="description">Coronary artery calcium is a marker of atherosclerosis and is one of the strongest predictors of future cardiovascular events. The coronary calcium score helps assess your risk of heart disease.</p>

        <h3 className="font-semibold text-foreground mt-6">What is Coronary Calcium?</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Atherosclerosis marker:</strong> Calcium deposits in coronary arteries indicate plaque buildup</li>
          <li><strong>Risk predictor:</strong> Higher scores predict increased cardiovascular risk</li>
          <li><strong>Preventive tool:</strong> Helps guide treatment decisions and lifestyle modifications</li>
          <li><strong>Non-invasive:</strong> Measured by CT scan without contrast</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Score Interpretation</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>0:</strong> No calcium detected (lowest risk)</li>
          <li><strong>1-99:</strong> Mild calcium (low risk)</li>
          <li><strong>100-399:</strong> Moderate calcium (moderate risk)</li>
          <li><strong>400+:</strong> Severe calcium (high risk)</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Risk Factors</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Age:</strong> Risk increases with age</li>
          <li><strong>Gender:</strong> Men have higher risk than women</li>
          <li><strong>Smoking:</strong> Major risk factor for calcium development</li>
          <li><strong>Diabetes:</strong> Accelerates coronary artery disease</li>
          <li><strong>Hypertension:</strong> Increases cardiovascular risk</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Prevention Strategies</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Lifestyle modifications:</strong> Diet, exercise, smoking cessation</li>
          <li><strong>Risk factor control:</strong> Blood pressure, cholesterol, diabetes management</li>
          <li><strong>Medications:</strong> Statins, aspirin, blood pressure medications</li>
          <li><strong>Regular monitoring:</strong> Follow-up assessments and adjustments</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline">Cardiovascular Disease Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/heart-attack-framingham-risk-calculator" className="text-primary underline">Heart Attack Framingham Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/cholesterol-risk-calculator" className="text-primary underline">Cholesterol Risk Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="coronary-calcium-score-estimator" calculatorName="Coronary Calcium Score Estimator" />
    </div>
  );
}
