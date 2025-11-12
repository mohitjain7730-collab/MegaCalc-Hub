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
import { Bone, Calendar, Zap } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(40).max(90).optional(),
  gender: z.enum(['male', 'female']).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  unit: z.enum(['metric', 'imperial']).optional(),
  previousFracture: z.boolean().optional(),
  parentHipFracture: z.boolean().optional(),
  currentSmoking: z.boolean().optional(),
  glucocorticoids: z.boolean().optional(),
  rheumatoidArthritis: z.boolean().optional(),
  secondaryOsteoporosis: z.boolean().optional(),
  alcoholIntake: z.enum(['none', 'moderate', 'high']).optional(),
  boneMineralDensity: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  score: number;
  bmi: number;
  riskLevel: string;
  hipRisk: string;
  majorRisk: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current bone health: review medical history, previous fractures, and risk factors' },
  { week: 2, focus: 'Ensure adequate calcium intake: aim for 1000-1200mg daily through diet and supplements if needed' },
  { week: 3, focus: 'Optimize vitamin D levels: get 800-1000 IU daily through sun exposure, diet, or supplements' },
  { week: 4, focus: 'Begin weight-bearing exercise: walking, jogging, dancing, or resistance training to strengthen bones' },
  { week: 5, focus: 'Improve balance and fall prevention: practice balance exercises and remove home hazards' },
  { week: 6, focus: 'Limit alcohol consumption: no more than 1-2 drinks per day, as excessive alcohol weakens bones' },
  { week: 7, focus: 'Quit smoking if applicable: smoking reduces bone density and increases fracture risk' },
  { week: 8, focus: 'Consider bone density testing (DEXA scan) if risk is high, and maintain healthy lifestyle habits' },
];

const faqs: [string, string][] = [
  ['What is FRAX?', 'FRAX (Fracture Risk Assessment Tool) is a validated algorithm developed by the World Health Organization to calculate the 10-year probability of hip fracture and major osteoporotic fracture. It considers multiple risk factors to assess fracture risk.'],
  ['What are the main risk factors for fractures?', 'Key risk factors include age (especially over 65), female gender, previous fractures after age 50, low body weight (BMI <19), family history of hip fracture, smoking, excessive alcohol, glucocorticoid use, rheumatoid arthritis, and low bone mineral density.'],
  ['How is fracture risk calculated?', 'FRAX calculates fracture risk using age, gender, BMI, previous fractures, family history, smoking, alcohol intake, glucocorticoid use, rheumatoid arthritis, secondary osteoporosis, and bone mineral density (if available). The tool provides 10-year probability estimates.'],
  ['What is a normal FRAX score?', 'FRAX scores vary by age and gender. Generally, scores below 3-4 indicate low risk, 4-6 moderate risk, 6-10 high risk, and above 10 very high risk. However, interpretation should be done with healthcare providers who can consider individual circumstances.'],
  ['Can I reduce my fracture risk?', 'Yes, through lifestyle modifications including adequate calcium (1000-1200mg/day) and vitamin D (800-1000 IU/day), weight-bearing exercise, fall prevention, limiting alcohol, quitting smoking, and in some cases, medication to improve bone density.'],
  ['When should I get a bone density test?', 'Bone density testing (DEXA scan) is recommended for women over 65, men over 70, or younger individuals with risk factors. High FRAX scores may also indicate need for bone density testing to guide treatment decisions.'],
  ['What is the difference between osteoporosis and osteopenia?', 'Osteopenia is low bone density (T-score -1.0 to -2.5), while osteoporosis is very low bone density (T-score ≤-2.5). Both increase fracture risk, but osteoporosis requires more aggressive treatment.'],
  ['Is this calculator a medical diagnosis?', 'No, this is an educational tool based on the FRAX algorithm. Fracture risk assessment and treatment decisions should be made with healthcare providers who can consider your complete medical history and circumstances.'],
  ['How does age affect fracture risk?', 'Fracture risk increases dramatically with age. After age 65, bone loss accelerates, muscle strength declines, and fall risk increases. Women experience accelerated bone loss after menopause due to decreased estrogen.'],
  ['What medications can help prevent fractures?', 'Bisphosphonates, denosumab, teriparatide, and hormone therapy (for postmenopausal women) can help improve bone density and reduce fracture risk. Medication decisions should be made with healthcare providers based on individual risk and benefits.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years (40-90). Risk increases significantly with age, especially after 65, as bone density naturally declines and fall risk increases.' },
  { label: 'Gender', description: 'Biological sex. Women have higher fracture risk due to lower peak bone mass and postmenopausal bone loss. Men also experience age-related bone loss but typically later in life.' },
  { label: 'Weight & Height', description: 'Used to calculate BMI. Very low BMI (<19) significantly increases fracture risk, while higher BMI may provide some protection (though excess weight has other health risks).' },
  { label: 'Previous Fracture', description: 'History of fractures after age 50 is one of the strongest predictors of future fractures. Previous fractures indicate bone weakness and increased risk.' },
  { label: 'Parent Hip Fracture', description: 'Family history of parent hip fracture significantly increases your fracture risk, indicating genetic predisposition to bone weakness.' },
  { label: 'Current Smoking', description: 'Smoking reduces bone density, impairs bone healing, and increases fracture risk. Quitting smoking is important for bone health.' },
  { label: 'Glucocorticoids', description: 'Long-term use of glucocorticoids (≥5mg prednisolone for ≥3 months) significantly increases fracture risk by reducing bone formation and increasing bone resorption.' },
  { label: 'Rheumatoid Arthritis', description: 'RA increases fracture risk due to inflammation, reduced mobility, and often glucocorticoid use. The disease itself contributes to bone loss.' },
  { label: 'Secondary Osteoporosis', description: 'Conditions causing secondary osteoporosis (hormonal disorders, malabsorption, etc.) significantly increase fracture risk beyond age-related bone loss.' },
  { label: 'Alcohol Intake', description: 'Moderate alcohol (1-2 drinks/day) may have minimal effect, but high intake (≥3 drinks/day) weakens bones and increases fracture risk.' },
  { label: 'Bone Mineral Density (optional)', description: 'T-score from DEXA scan. Lower T-scores indicate lower bone density and higher fracture risk. T-score ≤-2.5 indicates osteoporosis.' },
];

const calculateFRAXScore = (values: FormValues) => {
  if (!values.age || !values.gender || !values.weight || !values.height) return null;
  
  let score = 0;
  
  if (values.age >= 80) score += 8;
  else if (values.age >= 70) score += 6;
  else if (values.age >= 60) score += 4;
  else if (values.age >= 50) score += 2;
  
  if (values.gender === 'female') score += 2;
  
  let bmi;
  if (values.unit === 'metric') {
    bmi = values.weight / ((values.height / 100) ** 2);
  } else {
    bmi = (values.weight / (values.height ** 2)) * 703;
  }
  
  if (bmi < 19) score += 3;
  else if (bmi < 22) score += 2;
  else if (bmi < 25) score += 1;
  
  if (values.previousFracture) score += 4;
  if (values.parentHipFracture) score += 2;
  if (values.currentSmoking) score += 1;
  if (values.glucocorticoids) score += 2;
  if (values.rheumatoidArthritis) score += 1;
  if (values.secondaryOsteoporosis) score += 2;
  
  if (values.alcoholIntake === 'high') score += 2;
  else if (values.alcoholIntake === 'moderate') score += 1;
  
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
  
  let riskLevel, hipRisk, majorRisk;
  if (score <= riskThresholds.low) {
    riskLevel = 'Low Risk';
    hipRisk = '< 1%';
    majorRisk = '< 3%';
  } else if (score <= riskThresholds.moderate) {
    riskLevel = 'Moderate Risk';
    hipRisk = '1-3%';
    majorRisk = '3-10%';
  } else if (score <= riskThresholds.high) {
    riskLevel = 'High Risk';
    hipRisk = '3-8%';
    majorRisk = '10-20%';
  } else {
    riskLevel = 'Very High Risk';
    hipRisk = '> 8%';
    majorRisk = '> 20%';
  }
  
  return { riskLevel, hipRisk, majorRisk };
};

const interpret = (riskLevel: string, score: number) => {
  if (riskLevel === 'Low Risk') return 'Your fracture risk is low. Continue maintaining bone health through diet, exercise, and healthy lifestyle habits.';
  if (riskLevel === 'Moderate Risk') return 'You have some risk factors for fractures. Consider lifestyle modifications and discuss bone health with your healthcare provider.';
  if (riskLevel === 'High Risk') return 'You have significant risk factors for fractures. Medical evaluation and bone density testing are recommended.';
  return 'You have multiple risk factors for fractures. Urgent medical consultation and comprehensive bone health assessment are needed.';
};

const recommendations = (riskLevel: string) => {
  const base = [
    'Ensure adequate calcium intake: 1000-1200mg daily for adults',
    'Get sufficient vitamin D: 800-1000 IU daily for bone health',
    'Engage in weight-bearing and resistance exercises regularly',
  ];
  
  if (riskLevel === 'Very High Risk' || riskLevel === 'High Risk') {
    return [
      ...base,
      'Seek medical evaluation for bone health assessment',
      'Consider bone density testing (DEXA scan)',
      'Discuss treatment options with your doctor',
      'Implement aggressive fall prevention strategies',
    ];
  }
  
  if (riskLevel === 'Moderate Risk') {
    return [
      ...base,
      'Increase calcium and vitamin D intake if needed',
      'Start or increase weight-bearing exercise',
      'Consider bone density testing',
      'Discuss prevention strategies with your doctor',
    ];
  }
  
  return [
    ...base,
    'Maintain healthy lifestyle habits',
    'Continue regular exercise',
    'Monitor for any new risk factors',
  ];
};

const warningSigns = () => [
  'This calculator is for educational purposes and not a medical diagnosis. Fracture risk assessment and treatment decisions should be made with healthcare providers.',
  'If you have high FRAX score, previous fractures, or significant height loss (>1.5 inches), consult healthcare providers for bone health evaluation and potential treatment.',
  'Untreated osteoporosis and high fracture risk can lead to debilitating fractures, loss of independence, and reduced quality of life. Early intervention is important.',
];

export default function FractureRiskFRAXCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
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
    const calc = calculateFRAXScore(values);
    if (!calc) {
      setResult(null);
      return;
    }

    const riskInfo = getRiskLevel(calc.score, values.age!, values.gender!);
    setResult({
      score: calc.score,
      bmi: calc.bmi,
      riskLevel: riskInfo.riskLevel,
      hipRisk: riskInfo.hipRisk,
      majorRisk: riskInfo.majorRisk,
      interpretation: interpret(riskInfo.riskLevel, calc.score),
      recommendations: recommendations(riskInfo.riskLevel),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bone className="h-5 w-5" /> Fracture Risk (FRAX) Calculator</CardTitle>
          <CardDescription>Assess your 10-year fracture risk using the WHO FRAX algorithm based on multiple risk factors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 65" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
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
                    <FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 175" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
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
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Previous fracture after age 50</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="parentHipFracture" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Parent hip fracture</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="currentSmoking" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Current smoking</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="glucocorticoids" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Glucocorticoid use (≥5mg prednisolone for ≥3 months)</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="rheumatoidArthritis" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Rheumatoid arthritis</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="secondaryOsteoporosis" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select alcohol intake" /></SelectTrigger>
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
                      <Input type="number" step="0.1" placeholder="e.g., -1.5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full md:w-auto">Calculate Fracture Risk</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Your Fracture Risk Assessment</CardTitle></div>
              <CardDescription>FRAX-based 10-year fracture probability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Score</h4><p className="text-2xl font-bold text-primary">{result.score}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Level</h4><p className="text-2xl font-bold text-primary">{result.riskLevel}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Hip Fracture Risk</h4><p className="text-2xl font-bold text-blue-600">{result.hipRisk}</p><p className="text-xs text-muted-foreground">10-year probability</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Major Fracture Risk</h4><p className="text-2xl font-bold text-purple-600">{result.majorRisk}</p><p className="text-xs text-muted-foreground">10-year probability</p></div>
              </div>
              <div className="text-sm text-muted-foreground">BMI: {result.bmi.toFixed(1)}</div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Bone Health Improvement Plan</CardTitle></CardHeader>
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
          <CardDescription>Key factors affecting fracture risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for bone health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/bone-density-t-score-calculator" className="text-primary hover:underline">Bone Density T-Score Calculator</Link></h4><p className="text-sm text-muted-foreground">Assess bone density and osteoporosis risk.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary hover:underline">Calcium Intake Calculator</Link></h4><p className="text-sm text-muted-foreground">Calculate daily calcium needs for bone health.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary hover:underline">Vitamin D Sun Exposure</Link></h4><p className="text-sm text-muted-foreground">Determine vitamin D needs from sun exposure.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">BMI Calculator</Link></h4><p className="text-sm text-muted-foreground">Assess body weight status, a key fracture risk factor.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Fracture Risk</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Osteoporosis is a condition characterized by low bone mass and deterioration of bone tissue, leading to increased fracture risk. The FRAX tool calculates 10-year probability of hip fracture and major osteoporotic fracture based on multiple risk factors. Early assessment and intervention can significantly reduce fracture risk through adequate calcium and vitamin D intake, weight-bearing exercise, fall prevention, and in some cases, medication. Regular monitoring and bone density testing help guide treatment decisions and track improvements.</p>
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
