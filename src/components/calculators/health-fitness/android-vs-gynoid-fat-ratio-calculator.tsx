'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  waistCircumference: z.number().positive('Waist circumference must be positive'),
  hipCircumference: z.number().positive('Hip circumference must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

export default function AndroidVsGynoidFatRatioCalculator() {
  const [result, setResult] = useState<{
    androidGynoidRatio: number;
    fatDistribution: string;
    healthRisk: string;
    interpretation: string;
    recommendations: string[];
    healthRisks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      waistCircumference: undefined,
      hipCircumference: undefined,
      gender: undefined,
      age: undefined,
      unitSystem: 'metric',
    },
  });

  const calculateAndroidGynoidRatio = (values: FormValues) => {
    let waist = values.waistCircumference;
    let hip = values.hipCircumference;

    // Convert to metric if needed
    if (values.unitSystem === 'imperial') {
      waist = values.waistCircumference * 2.54; // inches to cm
      hip = values.hipCircumference * 2.54; // inches to cm
    }

    const ratio = waist / hip;
    return Math.round(ratio * 1000) / 1000; // Round to 3 decimal places
  };

  const getFatDistribution = (ratio: number, gender: string) => {
    if (gender === 'male') {
      if (ratio > 1.0) return 'Android (Apple-shaped)';
      if (ratio > 0.9) return 'Mixed (Slight Android)';
      return 'Gynoid (Pear-shaped)';
    } else {
      if (ratio > 0.85) return 'Android (Apple-shaped)';
      if (ratio > 0.8) return 'Mixed (Slight Android)';
      return 'Gynoid (Pear-shaped)';
    }
  };

  const getHealthRisk = (ratio: number, gender: string, age: number) => {
    let riskThreshold = 0;
    
    if (gender === 'male') {
      riskThreshold = 0.95;
    } else {
      riskThreshold = 0.85;
    }

    // Adjust for age
    if (age > 50) riskThreshold += 0.05;

    if (ratio > riskThreshold + 0.1) {
      return 'High Risk';
    } else if (ratio > riskThreshold) {
      return 'Moderate Risk';
    } else {
      return 'Low Risk';
    }
  };

  const getInterpretation = (ratio: number, gender: string, age: number) => {
    const fatDistribution = getFatDistribution(ratio, gender);
    const healthRisk = getHealthRisk(ratio, gender, age);

    if (fatDistribution.includes('Android')) {
      return `You have an android (apple-shaped) fat distribution, which means you carry more fat around your waist and abdomen. This pattern is associated with higher health risks, particularly for cardiovascular disease and diabetes.`;
    } else if (fatDistribution.includes('Mixed')) {
      return `You have a mixed fat distribution with slight android tendencies. While not as high-risk as pure android distribution, you should monitor your waist circumference and maintain a healthy lifestyle.`;
    } else {
      return `You have a gynoid (pear-shaped) fat distribution, which means you carry more fat around your hips and thighs. This pattern is generally associated with lower health risks compared to android distribution.`;
    }
  };

  const onSubmit = (values: FormValues) => {
    const androidGynoidRatio = calculateAndroidGynoidRatio(values);
    const fatDistribution = getFatDistribution(androidGynoidRatio, values.gender);
    const healthRisk = getHealthRisk(androidGynoidRatio, values.gender, values.age);
    const interpretation = getInterpretation(androidGynoidRatio, values.gender, values.age);

    let recommendations: string[] = [];
    let healthRisks: string[] = [];

    if (healthRisk === 'High Risk') {
      recommendations = [
        'Focus on reducing waist circumference through targeted exercise',
        'Implement a calorie deficit diet to reduce overall body fat',
        'Include high-intensity interval training (HIIT) in your routine',
        'Reduce stress levels through meditation or relaxation techniques',
        'Limit processed foods and added sugars',
        'Consider consulting a healthcare provider for personalized advice'
      ];
      healthRisks = [
        'Increased risk of cardiovascular disease',
        'Higher likelihood of type 2 diabetes',
        'Increased risk of metabolic syndrome',
        'Higher blood pressure and cholesterol levels',
        'Increased inflammation in the body',
        'Higher risk of certain cancers'
      ];
    } else if (healthRisk === 'Moderate Risk') {
      recommendations = [
        'Maintain a balanced diet with plenty of fruits and vegetables',
        'Engage in regular cardiovascular exercise',
        'Include strength training to build muscle mass',
        'Monitor your waist circumference regularly',
        'Maintain a healthy weight',
        'Focus on stress management'
      ];
      healthRisks = [
        'Moderate risk of cardiovascular disease',
        'Potential for metabolic issues',
        'Increased inflammation markers',
        'Risk of developing diabetes over time'
      ];
    } else {
      recommendations = [
        'Maintain your current healthy lifestyle',
        'Continue regular exercise and balanced nutrition',
        'Monitor your body composition regularly',
        'Focus on overall health and wellness',
        'Share your healthy habits with others'
      ];
      healthRisks = [
        'Lower risk of cardiovascular disease',
        'Better metabolic health',
        'Reduced inflammation',
        'Lower risk of diabetes'
      ];
    }

    setResult({
      androidGynoidRatio,
      fatDistribution,
      healthRisk,
      interpretation,
      recommendations,
      healthRisks,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              control={form.control} 
              name="unitSystem" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit System</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit system" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="metric">Metric (cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (inches)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="gender" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              )} 
            />
            <FormField 
              control={form.control} 
              name="waistCircumference" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waist Circumference ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter waist circumference`}
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="hipCircumference" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hip Circumference ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter hip circumference`}
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="age" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your age"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
          <Button type="submit">Calculate Android vs Gynoid Fat Ratio</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-primary" />
                <CardTitle>Android vs Gynoid Fat Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.androidGynoidRatio}</p>
                  <p className="text-sm text-muted-foreground">Android/Gynoid Ratio</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.fatDistribution}</p>
                  <p className="text-sm text-muted-foreground">Fat Distribution Pattern</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.healthRisk}</p>
                  <p className="text-sm text-muted-foreground">Health Risk Level</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis & Health Implications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{result.interpretation}</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Health Risks:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.healthRisks.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>
              The Android vs Gynoid fat ratio is calculated by dividing your waist circumference by your hip 
              circumference. This ratio helps determine your fat distribution pattern and associated health risks.
            </p>
            <p>
              Android (apple-shaped) distribution carries higher health risks, while gynoid (pear-shaped) 
              distribution is generally associated with better health outcomes.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Fat Distribution Patterns</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding Fat Distribution</h4>
              <p>
                Fat distribution refers to where your body stores excess fat. There are two main patterns: 
                android (apple-shaped) and gynoid (pear-shaped). The pattern of fat storage is more important 
                for health than the total amount of fat.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Android (Apple-shaped) Distribution</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Fat stored primarily around the waist and abdomen</li>
                <li>Higher waist-to-hip ratio</li>
                <li>Associated with higher health risks</li>
                <li>More common in men and postmenopausal women</li>
                <li>Linked to metabolic syndrome and cardiovascular disease</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gynoid (Pear-shaped) Distribution</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Fat stored primarily around the hips and thighs</li>
                <li>Lower waist-to-hip ratio</li>
                <li>Associated with lower health risks</li>
                <li>More common in premenopausal women</li>
                <li>Generally considered healthier fat storage pattern</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Health Implications</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Android Distribution:</strong> Higher risk of heart disease, diabetes, stroke</li>
                <li><strong>Gynoid Distribution:</strong> Lower risk of chronic diseases</li>
                <li><strong>Visceral Fat:</strong> Android pattern often includes harmful visceral fat</li>
                <li><strong>Subcutaneous Fat:</strong> Gynoid pattern typically includes safer subcutaneous fat</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-calculators">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Body Composition</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/waist-to-hip-ratio-calculator" className="text-primary underline">Waist-to-Hip Ratio Calculator</a></li>
                  <li><a href="/category/health-fitness/waist-to-height-ratio-calculator" className="text-primary underline">Waist-to-Height Ratio Calculator</a></li>
                  <li><a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Health Assessment</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline">Cardiovascular Disease Risk Calculator</a></li>
                  <li><a href="/category/health-fitness/diabetes-risk-calculator" className="text-primary underline">Diabetes Risk Calculator</a></li>
                  <li><a href="/category/health-fitness/metabolic-syndrome-calculator" className="text-primary underline">Metabolic Syndrome Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}






















































