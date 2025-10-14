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
import { Bone } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  bmd: z.number().positive(),
  site: z.enum(['hip', 'spine', 'forearm', 'wrist']),
  age: z.number().positive(),
  gender: z.enum(['male', 'female']),
  race: z.enum(['caucasian', 'african-american', 'hispanic', 'asian', 'other'])
});
type FormValues = z.infer<typeof formSchema>;

export default function BoneDensityTScoreCalculator() {
  const [results, setResults] = useState<{ tScore: number; category: string; riskLevel: string; recommendations: string[]; opinion: string } | null>(null);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      bmd: undefined, 
      site: 'hip', 
      age: undefined, 
      gender: 'female', 
      race: 'caucasian' 
    } 
  });

  const onSubmit = (v: FormValues) => {
    // Reference BMD values (g/cm²) for different sites and demographics
    let referenceBMD = 0;
    
    // Simplified reference values (actual values vary by population)
    if (v.site === 'hip') {
      if (v.gender === 'female') {
        if (v.race === 'african-american') referenceBMD = 1.050;
        else if (v.race === 'asian') referenceBMD = 0.950;
        else referenceBMD = 1.000; // Caucasian, Hispanic, Other
      } else {
        if (v.race === 'african-american') referenceBMD = 1.080;
        else if (v.race === 'asian') referenceBMD = 0.980;
        else referenceBMD = 1.030;
      }
    } else if (v.site === 'spine') {
      if (v.gender === 'female') {
        if (v.race === 'african-american') referenceBMD = 1.150;
        else if (v.race === 'asian') referenceBMD = 1.050;
        else referenceBMD = 1.100;
      } else {
        if (v.race === 'african-american') referenceBMD = 1.180;
        else if (v.race === 'asian') referenceBMD = 1.080;
        else referenceBMD = 1.130;
      }
    } else if (v.site === 'forearm') {
      if (v.gender === 'female') {
        if (v.race === 'african-american') referenceBMD = 0.750;
        else if (v.race === 'asian') referenceBMD = 0.680;
        else referenceBMD = 0.720;
      } else {
        if (v.race === 'african-american') referenceBMD = 0.780;
        else if (v.race === 'asian') referenceBMD = 0.710;
        else referenceBMD = 0.750;
      }
    } else if (v.site === 'wrist') {
      if (v.gender === 'female') {
        if (v.race === 'african-american') referenceBMD = 0.680;
        else if (v.race === 'asian') referenceBMD = 0.620;
        else referenceBMD = 0.650;
      } else {
        if (v.race === 'african-american') referenceBMD = 0.710;
        else if (v.race === 'asian') referenceBMD = 0.650;
        else referenceBMD = 0.680;
      }
    }
    
    // Calculate T-score: (BMD - Reference BMD) / Standard Deviation
    // Standard deviation is typically 0.12 g/cm² for most sites
    const standardDeviation = 0.12;
    const tScore = (v.bmd - referenceBMD) / standardDeviation;
    
    // Categorize T-score
    let category = '';
    let riskLevel = '';
    
    if (tScore >= -1.0) {
      category = 'Normal';
      riskLevel = 'Low';
    } else if (tScore >= -2.5) {
      category = 'Osteopenia';
      riskLevel = 'Moderate';
    } else {
      category = 'Osteoporosis';
      riskLevel = 'High';
    }
    
    const recommendations: string[] = [];
    if (tScore <= -2.5) {
      recommendations.push('Consult with healthcare provider for osteoporosis treatment');
      recommendations.push('Consider bone density medication if indicated');
    }
    if (tScore <= -1.0) {
      recommendations.push('Ensure adequate calcium intake (1000-1200mg daily)');
      recommendations.push('Get sufficient vitamin D (800-1000 IU daily)');
      recommendations.push('Engage in weight-bearing exercises regularly');
    }
    recommendations.push('Avoid smoking and excessive alcohol consumption');
    recommendations.push('Fall prevention strategies at home');
    recommendations.push('Regular bone density monitoring');
    
    let opinion = 'Your bone density appears normal. Continue maintaining bone health through diet and exercise.';
    if (category === 'Osteoporosis') {
      opinion = 'Your T-score indicates osteoporosis. Please consult with a healthcare provider for comprehensive bone health management and potential treatment options.';
    } else if (category === 'Osteopenia') {
      opinion = 'Your T-score shows osteopenia (low bone density). Focus on bone-strengthening lifestyle measures and consider discussing preventive strategies with your healthcare provider.';
    }
    
    setResults({ tScore, category, riskLevel, recommendations, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="bmd" render={({ field }) => (
              <FormItem><FormLabel>Bone Mineral Density (g/cm²)</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="site" render={({ field }) => (
              <FormItem><FormLabel>Measurement Site</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hip">Hip</SelectItem><SelectItem value="spine">Spine (Lumbar)</SelectItem><SelectItem value="forearm">Forearm</SelectItem><SelectItem value="wrist">Wrist</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem><FormLabel>Gender</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="race" render={({ field }) => (
              <FormItem><FormLabel>Race/Ethnicity</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="caucasian">Caucasian</SelectItem><SelectItem value="african-american">African American</SelectItem><SelectItem value="hispanic">Hispanic</SelectItem><SelectItem value="asian">Asian</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate T-Score</Button>
        </form>
      </Form>

      {results && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Bone className="h-8 w-8 text-primary" /><CardTitle>Bone Density T-Score</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
              <div><p className="text-2xl font-bold">{results.tScore.toFixed(2)}</p><p className="text-sm text-muted-foreground">T-Score</p></div>
              <div><p className="text-2xl font-bold">{results.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
              <div><p className="text-2xl font-bold">{results.riskLevel}</p><p className="text-sm text-muted-foreground">Fracture Risk</p></div>
            </div>
            <CardDescription className="text-center mb-4">{results.opinion}</CardDescription>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">Recommendations:</p>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                {results.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <RelatedCalculators />
        <BoneDensityGuide />
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
          <Link href="/category/health-fitness/bmi-calculator" className="text-primary underline hover:text-primary/80">
            Body Mass Index (BMI) Calculator
          </Link>
          <Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary underline hover:text-primary/80">
            Calcium Intake Calculator
          </Link>
          <Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary underline hover:text-primary/80">
            Vitamin D Sun Exposure Calculator
          </Link>
          <Link href="/category/health-fitness/exercise-calorie-burn-calculator" className="text-primary underline hover:text-primary/80">
            Exercise Calorie Burn Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function BoneDensityGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Bone Density T-Score Calculator – Understanding Osteoporosis and Bone Health" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to interpret bone mineral density T-scores, understand osteoporosis risk factors, and implement strategies for maintaining strong bones throughout life." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Bone Density and T-Scores</h2>
      <p itemProp="description">Bone mineral density (BMD) testing measures bone strength and helps assess fracture risk. The T-score compares your bone density to that of a healthy 30-year-old adult of the same gender and race, providing insight into bone health and osteoporosis risk.</p>

      <h3 className="font-semibold text-foreground mt-6">T-Score Categories</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Normal: T-score ≥ -1.0 - Bone density within normal range</li>
        <li>Osteopenia: T-score -1.0 to -2.5 - Low bone density, increased fracture risk</li>
        <li>Osteoporosis: T-score ≤ -2.5 - Severely low bone density, high fracture risk</li>
        <li>Severe Osteoporosis: T-score ≤ -2.5 with existing fractures</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Risk Factors for Bone Loss</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Age: Bone loss accelerates after age 50</li>
        <li>Gender: Women lose bone faster after menopause</li>
        <li>Family history: Genetic predisposition to osteoporosis</li>
        <li>Low body weight: BMI less than 19 increases risk</li>
        <li>Smoking: Reduces bone formation and increases bone loss</li>
        <li>Excessive alcohol: More than 2 drinks daily harms bones</li>
        <li>Sedentary lifestyle: Lack of weight-bearing exercise</li>
        <li>Calcium deficiency: Inadequate calcium intake</li>
        <li>Vitamin D deficiency: Poor calcium absorption</li>
        <li>Certain medications: Corticosteroids, anticonvulsants</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Bone Health Strategies</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Calcium: 1000-1200mg daily from diet and supplements</li>
        <li>Vitamin D: 800-1000 IU daily for optimal absorption</li>
        <li>Weight-bearing exercise: Walking, jogging, dancing, tennis</li>
        <li>Strength training: Resistance exercises 2-3 times weekly</li>
        <li>Balance training: Reduce fall risk with stability exercises</li>
        <li>Healthy diet: Fruits, vegetables, lean proteins</li>
        <li>Limit caffeine: Excessive amounts may affect calcium absorption</li>
        <li>Avoid smoking: Complete tobacco cessation</li>
        <li>Moderate alcohol: Limit to 1 drink daily for women, 2 for men</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">When to Get Tested</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Women 65 and older</li>
        <li>Men 70 and older</li>
        <li>Postmenopausal women with risk factors</li>
        <li>Adults with fractures after age 50</li>
        <li>Adults taking medications that cause bone loss</li>
        <li>Adults with conditions affecting bone health</li>
        <li>Monitoring treatment effectiveness</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Fracture Prevention</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Home safety: Remove tripping hazards, improve lighting</li>
        <li>Vision care: Regular eye exams and appropriate glasses</li>
        <li>Medication review: Assess drugs that increase fall risk</li>
        <li>Balance exercises: Tai chi, yoga, or balance training</li>
        <li>Hip protectors: For high-risk individuals</li>
        <li>Emergency planning: Medical alert systems</li>
      </ul>
    </section>
  );
}
