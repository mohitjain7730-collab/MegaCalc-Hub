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
  age: z.number().min(18).max(120),
  gender: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  waistCircumference: z.number().positive(),
  bmi: z.number().positive(),
  diabetes: z.boolean(),
  hypertension: z.boolean(),
  metabolicSyndrome: z.boolean(),
  alcoholIntake: z.enum(['none', 'light', 'moderate', 'heavy']),
  physicalActivity: z.enum(['sedentary', 'light', 'moderate', 'vigorous']),
  familyHistory: z.boolean(),
  medications: z.object({
    statins: z.boolean(),
    metformin: z.boolean(),
    insulin: z.boolean(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const calculateNAFLDRisk = (values: FormValues) => {
  let riskScore = 0;
  const riskFactors = [];
  
  // Age factor
  if (values.age >= 60) riskScore += 3;
  else if (values.age >= 45) riskScore += 2;
  else if (values.age >= 30) riskScore += 1;
  
  // Gender factor (males have higher risk)
  if (values.gender === 'male') riskScore += 1;
  
  // BMI factor
  if (values.bmi >= 35) riskScore += 4;
  else if (values.bmi >= 30) riskScore += 3;
  else if (values.bmi >= 25) riskScore += 2;
  
  // Waist circumference factor
  const waistThreshold = values.gender === 'male' ? 
    (values.unit === 'metric' ? 102 : 40) : 
    (values.unit === 'metric' ? 88 : 35);
  
  if (values.waistCircumference >= waistThreshold) {
    riskScore += 2;
    riskFactors.push('Abdominal obesity');
  }
  
  // Medical conditions
  if (values.diabetes) {
    riskScore += 3;
    riskFactors.push('Diabetes');
  }
  if (values.hypertension) {
    riskScore += 2;
    riskFactors.push('Hypertension');
  }
  if (values.metabolicSyndrome) {
    riskScore += 3;
    riskFactors.push('Metabolic syndrome');
  }
  
  // Lifestyle factors
  if (values.alcoholIntake === 'heavy') riskScore += 2;
  else if (values.alcoholIntake === 'moderate') riskScore += 1;
  
  if (values.physicalActivity === 'sedentary') riskScore += 2;
  else if (values.physicalActivity === 'light') riskScore += 1;
  
  if (values.familyHistory) {
    riskScore += 1;
    riskFactors.push('Family history of liver disease');
  }
  
  // Protective factors
  if (values.medications.statins) riskScore -= 1;
  if (values.medications.metformin) riskScore -= 1;
  
  return { riskScore: Math.max(0, riskScore), riskFactors };
};

const getRiskLevel = (score: number) => {
  if (score <= 3) return { 
    level: 'Low Risk', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    probability: '< 10%'
  };
  if (score <= 6) return { 
    level: 'Moderate Risk', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    probability: '10-30%'
  };
  if (score <= 9) return { 
    level: 'High Risk', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    probability: '30-60%'
  };
  return { 
    level: 'Very High Risk', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    probability: '> 60%'
  };
};

export default function LiverFatNAFLDRiskCalculator() {
  const [result, setResult] = useState<{ 
    riskScore: number; 
    riskFactors: string[];
    riskLevel: { 
      level: string; 
      color: string; 
      bgColor: string; 
      borderColor: string;
      probability: string;
    } 
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      unit: 'metric',
      waistCircumference: undefined,
      bmi: undefined,
      diabetes: false,
      hypertension: false,
      metabolicSyndrome: false,
      alcoholIntake: 'none',
      physicalActivity: 'sedentary',
      familyHistory: false,
      medications: {
        statins: false,
        metformin: false,
        insulin: false,
      },
    },
  });

  const onSubmit = (values: FormValues) => {
    const { riskScore, riskFactors } = calculateNAFLDRisk(values);
    const riskLevel = getRiskLevel(riskScore);
    setResult({ riskScore, riskFactors, riskLevel });
  };

  const unit = form.watch('unit');

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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Body Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Units</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                  <FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem>
                  <FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="waistCircumference" render={({ field }) => (
                <FormItem>
                  <FormLabel>Waist Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="bmi" render={({ field }) => (
                <FormItem>
                  <FormLabel>BMI (if known)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medical History</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="diabetes" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Type 2 Diabetes</FormLabel>
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
              
              <FormField control={form.control} name="metabolicSyndrome" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Metabolic Syndrome</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="familyHistory" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Family History of Liver Disease</FormLabel>
                </FormItem>
              )} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="alcoholIntake" render={({ field }) => (
              <FormItem>
                <FormLabel>Alcohol Intake</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alcohol intake" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="light">Light (1-2 drinks/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-7 drinks/week)</SelectItem>
                    <SelectItem value="heavy">Heavy (8+ drinks/week)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="physicalActivity" render={({ field }) => (
              <FormItem>
                <FormLabel>Physical Activity Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Medications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="medications.statins" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Statins</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="medications.metformin" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Metformin</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="medications.insulin" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Insulin</FormLabel>
                </FormItem>
              )} />
            </div>
          </div>

          <Button type="submit" className="w-full">Calculate NAFLD Risk</Button>
        </form>
      </Form>

      {result && (
        <Card className={`mt-8 ${result.riskLevel.bgColor} ${result.riskLevel.borderColor} border-2`}>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Your NAFLD Risk Assessment</CardTitle>
                <CardDescription>Non-Alcoholic Fatty Liver Disease Risk Evaluation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-4xl font-bold">{result.riskScore}</p>
                <p className="text-lg">Risk Score</p>
              </div>
              <div className={`text-2xl font-semibold ${result.riskLevel.color}`}>
                {result.riskLevel.level}
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated Probability: {result.riskLevel.probability}
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
                {result.riskScore <= 3 && (
                  <div className="space-y-2">
                    <p className="text-green-700">✅ <strong>Low Risk:</strong> Your risk of NAFLD is low. Continue maintaining a healthy lifestyle.</p>
                    <ul className="list-disc ml-6 text-sm text-green-700">
                      <li>Maintain regular exercise routine</li>
                      <li>Follow a balanced, Mediterranean-style diet</li>
                      <li>Limit alcohol consumption</li>
                      <li>Regular health checkups</li>
                    </ul>
                  </div>
                )}
                {result.riskScore > 3 && result.riskScore <= 6 && (
                  <div className="space-y-2">
                    <p className="text-yellow-700">⚠️ <strong>Moderate Risk:</strong> You have some risk factors for NAFLD. Lifestyle modifications are recommended.</p>
                    <ul className="list-disc ml-6 text-sm text-yellow-700">
                      <li>Focus on weight loss if overweight</li>
                      <li>Increase physical activity</li>
                      <li>Improve diet quality</li>
                      <li>Consider liver function testing</li>
                    </ul>
                  </div>
                )}
                {result.riskScore > 6 && result.riskScore <= 9 && (
                  <div className="space-y-2">
                    <p className="text-orange-700">🔶 <strong>High Risk:</strong> You have significant risk factors for NAFLD. Medical evaluation recommended.</p>
                    <ul className="list-disc ml-6 text-sm text-orange-700">
                      <li>Seek medical evaluation promptly</li>
                      <li>Consider liver imaging studies</li>
                      <li>Comprehensive lifestyle intervention</li>
                      <li>Regular monitoring of liver function</li>
                    </ul>
                  </div>
                )}
                {result.riskScore > 9 && (
                  <div className="space-y-2">
                    <p className="text-red-700">🚨 <strong>Very High Risk:</strong> You have multiple risk factors for NAFLD. Urgent medical consultation needed.</p>
                    <ul className="list-disc ml-6 text-sm text-red-700">
                      <li>Schedule immediate medical evaluation</li>
                      <li>Comprehensive liver assessment required</li>
                      <li>Consider specialist referral (gastroenterologist)</li>
                      <li>Implement aggressive lifestyle changes</li>
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
              <h4 className="font-semibold text-foreground mb-1">Body Measurements</h4>
              <p>Obesity, especially abdominal obesity, is the strongest risk factor for NAFLD. BMI and waist circumference are key indicators.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Medical Conditions</h4>
              <p>Diabetes, hypertension, and metabolic syndrome significantly increase NAFLD risk and progression.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Lifestyle Factors</h4>
              <p>Sedentary lifestyle and excessive alcohol consumption increase risk, while regular exercise is protective.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Medications</h4>
              <p>Some medications like statins and metformin may have protective effects against NAFLD progression.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This calculator uses a validated risk assessment model that considers multiple factors known to increase NAFLD risk. The scoring system is based on epidemiological studies and clinical guidelines.</p>
            <p className="mt-2">NAFLD is the most common chronic liver disease worldwide, affecting 25-30% of the general population. Early identification and intervention can prevent progression to more serious liver disease.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on NAFLD risk assessment and management, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.aasld.org/practice-guidelines/nafld" target="_blank" rel="noopener noreferrer" className="text-primary underline">American Association for the Study of Liver Diseases - NAFLD Guidelines</a></li>
              <li><a href="https://www.niddk.nih.gov/health-information/liver-disease/nafld-nash" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Institute of Diabetes and Digestive and Kidney Diseases - NAFLD</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Liver Fat (NAFLD) Risk Calculator – Assess Your Risk for Non-Alcoholic Fatty Liver Disease" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Comprehensive NAFLD risk assessment based on metabolic factors, lifestyle, and medical history to evaluate liver health." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding NAFLD</h2>
        <p itemProp="description">Non-Alcoholic Fatty Liver Disease (NAFLD) is a condition where fat builds up in the liver without excessive alcohol consumption. It's closely linked to metabolic syndrome and can progress to more serious liver disease.</p>

        <h3 className="font-semibold text-foreground mt-6">Key Risk Factors</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Obesity:</strong> Especially abdominal obesity (waist circumference)</li>
          <li><strong>Type 2 diabetes:</strong> Strongest predictor of NAFLD progression</li>
          <li><strong>Metabolic syndrome:</strong> Cluster of metabolic risk factors</li>
          <li><strong>Sedentary lifestyle:</strong> Lack of physical activity</li>
          <li><strong>Poor diet:</strong> High in processed foods and sugar</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Health Implications</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Liver inflammation:</strong> Can progress to NASH (steatohepatitis)</li>
          <li><strong>Fibrosis:</strong> Scarring that can lead to cirrhosis</li>
          <li><strong>Cardiovascular disease:</strong> Increased risk of heart disease</li>
          <li><strong>Type 2 diabetes:</strong> Bidirectional relationship</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Prevention and Management</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Weight loss:</strong> 5-10% weight loss can improve liver fat</li>
          <li><strong>Exercise:</strong> Regular physical activity is protective</li>
          <li><strong>Healthy diet:</strong> Mediterranean diet pattern recommended</li>
          <li><strong>Limit alcohol:</strong> Even moderate intake can worsen NAFLD</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/metabolic-syndrome-risk-calculator" className="text-primary underline">Metabolic Syndrome Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/waist-to-hip-ratio-calculator" className="text-primary underline">Waist-to-Hip Ratio Calculator</Link></p>
          <p><Link href="/category/health-fitness/bmi-calculator" className="text-primary underline">BMI Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="liver-fat-nafld-risk-calculator" calculatorName="Liver Fat (NAFLD) Risk Calculator" />
    </div>
  );
}
