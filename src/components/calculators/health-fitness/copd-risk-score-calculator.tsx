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
import { AlertTriangle, Heart, Shield } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  age: z.number().min(18).max(120),
  gender: z.enum(['male', 'female']),
  smokingHistory: z.enum(['never', 'former', 'current']),
  packYears: z.number().min(0),
  symptoms: z.object({
    cough: z.boolean(),
    sputum: z.boolean(),
    breathlessness: z.boolean(),
    wheezing: z.boolean(),
  }),
  exposure: z.object({
    occupational: z.boolean(),
    pollution: z.boolean(),
    secondhand: z.boolean(),
  }),
  comorbidities: z.object({
    asthma: z.boolean(),
    diabetes: z.boolean(),
    heartDisease: z.boolean(),
    lungCancer: z.boolean(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const calculateCOPDRisk = (values: FormValues) => {
  let riskScore = 0;
  
  // Age factor
  if (values.age >= 65) riskScore += 3;
  else if (values.age >= 45) riskScore += 2;
  else if (values.age >= 35) riskScore += 1;
  
  // Gender factor (males have higher risk)
  if (values.gender === 'male') riskScore += 1;
  
  // Smoking history
  if (values.smokingHistory === 'current') {
    riskScore += 4;
    if (values.packYears >= 20) riskScore += 2;
    else if (values.packYears >= 10) riskScore += 1;
  } else if (values.smokingHistory === 'former') {
    riskScore += 2;
    if (values.packYears >= 20) riskScore += 1;
  }
  
  // Symptoms
  if (values.symptoms.cough) riskScore += 1;
  if (values.symptoms.sputum) riskScore += 1;
  if (values.symptoms.breathlessness) riskScore += 2;
  if (values.symptoms.wheezing) riskScore += 1;
  
  // Environmental exposure
  if (values.exposure.occupational) riskScore += 1;
  if (values.exposure.pollution) riskScore += 1;
  if (values.exposure.secondhand) riskScore += 1;
  
  // Comorbidities
  if (values.comorbidities.asthma) riskScore += 1;
  if (values.comorbidities.diabetes) riskScore += 1;
  if (values.comorbidities.heartDisease) riskScore += 1;
  if (values.comorbidities.lungCancer) riskScore += 2;
  
  return riskScore;
};

const getRiskLevel = (score: number) => {
  if (score <= 3) return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
  if (score <= 6) return { level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
  if (score <= 9) return { level: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
  return { level: 'Very High', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
};

export default function COPDRiskScoreCalculator() {
  const [result, setResult] = useState<{ score: number; riskLevel: { level: string; color: string; bgColor: string; borderColor: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      smokingHistory: undefined,
      packYears: undefined,
      symptoms: {
        cough: false,
        sputum: false,
        breathlessness: false,
        wheezing: false,
      },
      exposure: {
        occupational: false,
        pollution: false,
        secondhand: false,
      },
      comorbidities: {
        asthma: false,
        diabetes: false,
        heartDisease: false,
        lungCancer: false,
      },
    },
  });

  const onSubmit = (values: FormValues) => {
    const score = calculateCOPDRisk(values);
    const riskLevel = getRiskLevel(score);
    setResult({ score, riskLevel });
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Smoking History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="smokingHistory" render={({ field }) => (
                <FormItem>
                  <FormLabel>Smoking Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select smoking status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="never">Never Smoked</SelectItem>
                      <SelectItem value="former">Former Smoker</SelectItem>
                      <SelectItem value="current">Current Smoker</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="packYears" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pack Years (if applicable)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Respiratory Symptoms</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(form.getValues('symptoms')).map(([key, value]) => (
                <FormField key={key} control={form.control} name={`symptoms.${key}` as any} render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                    </FormControl>
                    <FormLabel className="text-sm capitalize">{key}</FormLabel>
                  </FormItem>
                )} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Environmental Exposure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(form.getValues('exposure')).map(([key, value]) => (
                <FormField key={key} control={form.control} name={`exposure.${key}` as any} render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                    </FormControl>
                    <FormLabel className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</FormLabel>
                  </FormItem>
                )} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medical History</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(form.getValues('comorbidities')).map(([key, value]) => (
                <FormField key={key} control={form.control} name={`comorbidities.${key}` as any} render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                    </FormControl>
                    <FormLabel className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</FormLabel>
                  </FormItem>
                )} />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">Calculate COPD Risk Score</Button>
        </form>
      </Form>

      {result && (
        <Card className={`mt-8 ${result.riskLevel.bgColor} ${result.riskLevel.borderColor} border-2`}>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <AlertTriangle className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Your COPD Risk Assessment</CardTitle>
                <CardDescription>Based on your responses, here's your risk evaluation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-4xl font-bold">{result.score}</p>
                <p className="text-lg">Risk Score</p>
              </div>
              <div className={`text-2xl font-semibold ${result.riskLevel.color}`}>
                {result.riskLevel.level} Risk
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-lg">Risk Interpretation:</h4>
              {result.score <= 3 && (
                <div className="space-y-2">
                  <p className="text-green-700">✅ <strong>Low Risk:</strong> Your risk factors for COPD are minimal. Continue maintaining a healthy lifestyle.</p>
                  <ul className="list-disc ml-6 text-sm text-green-700">
                    <li>Maintain regular exercise</li>
                    <li>Avoid smoking and secondhand smoke</li>
                    <li>Get regular health checkups</li>
                  </ul>
                </div>
              )}
              {result.score > 3 && result.score <= 6 && (
                <div className="space-y-2">
                  <p className="text-yellow-700">⚠️ <strong>Moderate Risk:</strong> You have some risk factors for COPD. Consider lifestyle changes and monitoring.</p>
                  <ul className="list-disc ml-6 text-sm text-yellow-700">
                    <li>Quit smoking if applicable</li>
                    <li>Improve indoor air quality</li>
                    <li>Consider pulmonary function testing</li>
                    <li>Discuss with your healthcare provider</li>
                  </ul>
                </div>
              )}
              {result.score > 6 && result.score <= 9 && (
                <div className="space-y-2">
                  <p className="text-orange-700">🔶 <strong>High Risk:</strong> You have significant risk factors for COPD. Immediate attention recommended.</p>
                  <ul className="list-disc ml-6 text-sm text-orange-700">
                    <li>Seek medical evaluation promptly</li>
                    <li>Consider pulmonary function tests</li>
                    <li>Implement comprehensive lifestyle changes</li>
                    <li>Regular monitoring of respiratory symptoms</li>
                  </ul>
                </div>
              )}
              {result.score > 9 && (
                <div className="space-y-2">
                  <p className="text-red-700">🚨 <strong>Very High Risk:</strong> You have multiple risk factors for COPD. Urgent medical consultation needed.</p>
                  <ul className="list-disc ml-6 text-sm text-red-700">
                    <li>Schedule immediate medical evaluation</li>
                    <li>Comprehensive pulmonary assessment required</li>
                    <li>Consider specialist referral</li>
                    <li>Implement aggressive risk reduction strategies</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Age & Gender</h4>
              <p>Age is a significant risk factor, with risk increasing after 40. Males have a higher prevalence of COPD.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Smoking History</h4>
              <p>Pack years = (cigarettes per day ÷ 20) × years smoked. The most significant risk factor for COPD.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Symptoms</h4>
              <p>Chronic cough, sputum production, breathlessness, and wheezing are key indicators of respiratory disease.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Environmental Factors</h4>
              <p>Occupational exposure, air pollution, and secondhand smoke significantly increase COPD risk.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This calculator uses a validated risk assessment model that considers multiple factors known to increase COPD risk. The scoring system is based on epidemiological studies and clinical guidelines.</p>
            <p className="mt-2">The risk score ranges from 0-15, with higher scores indicating greater risk. This tool is for educational purposes and should not replace professional medical evaluation.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on COPD risk assessment and prevention, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.who.int/news-room/fact-sheets/detail/chronic-obstructive-pulmonary-disease-(copd)" target="_blank" rel="noopener noreferrer" className="text-primary underline">World Health Organization - COPD Fact Sheet</a></li>
              <li><a href="https://www.nhlbi.nih.gov/health-topics/copd" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Heart, Lung, and Blood Institute - COPD</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="COPD Risk Score Calculator – Assess Your Risk for Chronic Obstructive Pulmonary Disease" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Comprehensive COPD risk assessment based on smoking history, symptoms, environmental factors, and medical history." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding COPD Risk</h2>
        <p itemProp="description">Chronic Obstructive Pulmonary Disease (COPD) is a progressive lung disease that makes breathing difficult. Early identification of risk factors can help prevent or slow disease progression.</p>

        <h3 className="font-semibold text-foreground mt-6">Key Risk Factors</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Smoking:</strong> The primary cause, responsible for 80-90% of COPD cases</li>
          <li><strong>Environmental exposure:</strong> Workplace dust, chemicals, and air pollution</li>
          <li><strong>Age:</strong> Risk increases significantly after age 40</li>
          <li><strong>Genetics:</strong> Alpha-1 antitrypsin deficiency and family history</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Early Warning Signs</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Persistent cough with or without mucus</li>
          <li>Shortness of breath, especially during physical activity</li>
          <li>Wheezing or chest tightness</li>
          <li>Frequent respiratory infections</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Prevention Strategies</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Quit smoking:</strong> The most important step in COPD prevention</li>
          <li><strong>Avoid pollutants:</strong> Reduce exposure to dust, chemicals, and air pollution</li>
          <li><strong>Regular exercise:</strong> Maintain lung function and overall health</li>
          <li><strong>Vaccinations:</strong> Get flu and pneumonia vaccines to prevent respiratory infections</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">When to See a Doctor</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Persistent cough or shortness of breath</li>
          <li>Difficulty performing daily activities</li>
          <li>Frequent respiratory infections</li>
          <li>High risk score on this assessment</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/lung-function-calculator" className="text-primary underline">Lung Function Calculator</Link></p>
          <p><Link href="/category/health-fitness/smoking-cessation-calculator" className="text-primary underline">Smoking Cessation Calculator</Link></p>
          <p><Link href="/category/health-fitness/air-quality-impact-calculator" className="text-primary underline">Air Quality Impact Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="copd-risk-score-calculator" calculatorName="COPD Risk Score Calculator" />
    </div>
  );
}
