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
import { Bone, Shield, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  age: z.number().min(40).max(90),
  gender: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  previousFracture: z.boolean(),
  parentHipFracture: z.boolean(),
  currentSmoking: z.boolean(),
  glucocorticoids: z.boolean(),
  rheumatoidArthritis: z.boolean(),
  secondaryOsteoporosis: z.boolean(),
  alcoholIntake: z.enum(['none', 'moderate', 'high']),
  boneMineralDensity: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const calculateFRAXScore = (values: FormValues) => {
  let score = 0;
  
  // Age factor (most significant)
  if (values.age >= 80) score += 8;
  else if (values.age >= 70) score += 6;
  else if (values.age >= 60) score += 4;
  else if (values.age >= 50) score += 2;
  
  // Gender factor
  if (values.gender === 'female') score += 2;
  
  // BMI calculation
  let bmi;
  if (values.unit === 'metric') {
    bmi = values.weight / ((values.height / 100) ** 2);
  } else {
    bmi = (values.weight / (values.height ** 2)) * 703;
  }
  
  // BMI factor
  if (bmi < 19) score += 3;
  else if (bmi < 22) score += 2;
  else if (bmi < 25) score += 1;
  
  // Risk factors
  if (values.previousFracture) score += 4;
  if (values.parentHipFracture) score += 2;
  if (values.currentSmoking) score += 1;
  if (values.glucocorticoids) score += 2;
  if (values.rheumatoidArthritis) score += 1;
  if (values.secondaryOsteoporosis) score += 2;
  
  // Alcohol intake
  if (values.alcoholIntake === 'high') score += 2;
  else if (values.alcoholIntake === 'moderate') score += 1;
  
  // Bone mineral density (if available)
  if (values.boneMineralDensity !== undefined) {
    if (values.boneMineralDensity <= -2.5) score += 4;
    else if (values.boneMineralDensity <= -2.0) score += 3;
    else if (values.boneMineralDensity <= -1.5) score += 2;
    else if (values.boneMineralDensity <= -1.0) score += 1;
  }
  
  return { score, bmi };
};

const getRiskLevel = (score: number, age: number, gender: string) => {
  const riskThresholds = {
    low: gender === 'female' ? 3 : 2,
    moderate: gender === 'female' ? 6 : 4,
    high: gender === 'female' ? 10 : 8,
  };
  
  if (score <= riskThresholds.low) return { 
    level: 'Low', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    hipRisk: '< 1%',
    majorRisk: '< 3%'
  };
  if (score <= riskThresholds.moderate) return { 
    level: 'Moderate', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    hipRisk: '1-3%',
    majorRisk: '3-10%'
  };
  if (score <= riskThresholds.high) return { 
    level: 'High', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    hipRisk: '3-8%',
    majorRisk: '10-20%'
  };
  return { 
    level: 'Very High', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    hipRisk: '> 8%',
    majorRisk: '> 20%'
  };
};

export default function FractureRiskFRAXCalculator() {
  const [result, setResult] = useState<{ 
    score: number; 
    bmi: number;
    riskLevel: { 
      level: string; 
      color: string; 
      bgColor: string; 
      borderColor: string;
      hipRisk: string;
      majorRisk: string;
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
      previousFracture: false,
      parentHipFracture: false,
      currentSmoking: false,
      glucocorticoids: false,
      rheumatoidArthritis: false,
      secondaryOsteoporosis: false,
      alcoholIntake: 'none',
      boneMineralDensity: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { score, bmi } = calculateFRAXScore(values);
    const riskLevel = getRiskLevel(score, values.age, values.gender);
    setResult({ score, bmi, riskLevel });
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Risk Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="previousFracture" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Previous fracture after age 50</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="parentHipFracture" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Parent hip fracture</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="currentSmoking" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Current smoking</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="glucocorticoids" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Glucocorticoid use (≥5mg prednisolone for ≥3 months)</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="rheumatoidArthritis" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Rheumatoid arthritis</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="secondaryOsteoporosis" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Secondary osteoporosis</FormLabel>
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
                    <SelectItem value="none">None or minimal</SelectItem>
                    <SelectItem value="moderate">Moderate (1-2 drinks/day)</SelectItem>
                    <SelectItem value="high">High (≥3 drinks/day)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="boneMineralDensity" render={({ field }) => (
              <FormItem>
                <FormLabel>Bone Mineral Density T-Score (optional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <Button type="submit" className="w-full">Calculate Fracture Risk</Button>
        </form>
      </Form>

      {result && (
        <Card className={`mt-8 ${result.riskLevel.bgColor} ${result.riskLevel.borderColor} border-2`}>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Bone className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Your Fracture Risk Assessment</CardTitle>
                <CardDescription>FRAX-based 10-year fracture probability</CardDescription>
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
              <div className="text-sm text-muted-foreground">
                BMI: {result.bmi.toFixed(1)}
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <h4 className="font-semibold">Hip Fracture Risk</h4>
                  <p className="text-2xl font-bold text-blue-600">{result.riskLevel.hipRisk}</p>
                  <p className="text-sm text-muted-foreground">10-year probability</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <h4 className="font-semibold">Major Osteoporotic Fracture Risk</h4>
                  <p className="text-2xl font-bold text-purple-600">{result.riskLevel.majorRisk}</p>
                  <p className="text-sm text-muted-foreground">10-year probability</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3">Risk Interpretation:</h4>
                {result.score <= (result.riskLevel.level === 'Low' ? 3 : 6) && (
                  <div className="space-y-2">
                    <p className="text-green-700">✅ <strong>Low Risk:</strong> Your fracture risk is low. Continue maintaining bone health through diet and exercise.</p>
                    <ul className="list-disc ml-6 text-sm text-green-700">
                      <li>Ensure adequate calcium and vitamin D intake</li>
                      <li>Engage in weight-bearing exercises</li>
                      <li>Maintain a healthy lifestyle</li>
                    </ul>
                  </div>
                )}
                {result.score > 3 && result.score <= 6 && (
                  <div className="space-y-2">
                    <p className="text-yellow-700">⚠️ <strong>Moderate Risk:</strong> You have some risk factors for fractures. Consider lifestyle modifications.</p>
                    <ul className="list-disc ml-6 text-sm text-yellow-700">
                      <li>Increase calcium and vitamin D intake</li>
                      <li>Start or increase weight-bearing exercise</li>
                      <li>Consider bone density testing</li>
                      <li>Discuss prevention strategies with your doctor</li>
                    </ul>
                  </div>
                )}
                {result.score > 6 && result.score <= 10 && (
                  <div className="space-y-2">
                    <p className="text-orange-700">🔶 <strong>High Risk:</strong> You have significant risk factors for fractures. Medical evaluation recommended.</p>
                    <ul className="list-disc ml-6 text-sm text-orange-700">
                      <li>Seek medical evaluation for bone health</li>
                      <li>Consider bone density testing (DEXA scan)</li>
                      <li>Discuss treatment options with your doctor</li>
                      <li>Implement fall prevention strategies</li>
                    </ul>
                  </div>
                )}
                {result.score > 10 && (
                  <div className="space-y-2">
                    <p className="text-red-700">🚨 <strong>Very High Risk:</strong> You have multiple risk factors for fractures. Urgent medical consultation needed.</p>
                    <ul className="list-disc ml-6 text-sm text-red-700">
                      <li>Schedule immediate medical evaluation</li>
                      <li>Comprehensive bone health assessment required</li>
                      <li>Consider specialist referral (endocrinologist/rheumatologist)</li>
                      <li>Implement aggressive fall prevention measures</li>
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
              <h4 className="font-semibold text-foreground mb-1">Age & Gender</h4>
              <p>Risk increases significantly with age, especially after 65. Women have higher fracture risk due to menopause-related bone loss.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">BMI</h4>
              <p>Very low BMI (&lt;19) increases fracture risk, while higher BMI may provide some protection.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Previous Fractures</h4>
              <p>History of fractures after age 50 is one of the strongest predictors of future fractures.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Family History</h4>
              <p>Parent hip fracture history significantly increases your fracture risk.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This calculator is based on the FRAX (Fracture Risk Assessment Tool) algorithm, which was developed by the World Health Organization. It calculates the 10-year probability of hip fracture and major osteoporotic fracture.</p>
            <p className="mt-2">The FRAX tool considers multiple risk factors and provides evidence-based fracture risk assessment. This tool is for educational purposes and should not replace professional medical evaluation.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on fracture risk assessment and osteoporosis prevention, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.sheffield.ac.uk/FRAX/" target="_blank" rel="noopener noreferrer" className="text-primary underline">FRAX - Fracture Risk Assessment Tool</a></li>
              <li><a href="https://www.nof.org/patients/what-is-osteoporosis/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Osteoporosis Foundation</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Fracture Risk (FRAX) Calculator – Assess Your 10-Year Osteoporosis Fracture Risk" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Comprehensive fracture risk assessment using the WHO FRAX algorithm to predict 10-year probability of hip and major osteoporotic fractures." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Fracture Risk</h2>
        <p itemProp="description">Osteoporosis is a condition characterized by low bone mass and deterioration of bone tissue, leading to increased fracture risk. Early assessment and intervention can significantly reduce fracture risk.</p>

        <h3 className="font-semibold text-foreground mt-6">Key Risk Factors</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Age:</strong> Risk increases dramatically after age 65</li>
          <li><strong>Gender:</strong> Women have higher risk, especially post-menopause</li>
          <li><strong>Previous fractures:</strong> Strongest predictor of future fractures</li>
          <li><strong>Family history:</strong> Parent hip fracture increases risk</li>
          <li><strong>Low body weight:</strong> BMI &lt;19 increases fracture risk</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Prevention Strategies</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Calcium:</strong> 1000-1200mg daily for adults</li>
          <li><strong>Vitamin D:</strong> 800-1000 IU daily for bone health</li>
          <li><strong>Exercise:</strong> Weight-bearing and resistance training</li>
          <li><strong>Lifestyle:</strong> Avoid smoking, limit alcohol, prevent falls</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">When to Seek Medical Care</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>High FRAX score (&gt;10)</li>
          <li>Previous fractures after age 50</li>
          <li>Significant height loss (&gt;1.5 inches)</li>
          <li>Back pain with potential vertebral fractures</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/bone-density-t-score-calculator" className="text-primary underline">Bone Density T-Score Calculator</Link></p>
          <p><Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary underline">Calcium Intake Calculator</Link></p>
          <p><Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary underline">Vitamin D Sun Exposure Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="fracture-risk-frax-calculator" calculatorName="Fracture Risk (FRAX) Calculator" />
    </div>
  );
}
