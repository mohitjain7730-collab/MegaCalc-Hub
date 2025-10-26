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
import { Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  hipCircumference: z.number().positive('Hip circumference must be positive'),
  shoulderWidth: z.number().positive('Shoulder width must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

export default function HipToShoulderRatioCalculator() {
  const [result, setResult] = useState<{
    hipShoulderRatio: number;
    bodyShape: string;
    interpretation: string;
    recommendations: string[];
    aesthetic: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hipCircumference: undefined,
      shoulderWidth: undefined,
      gender: undefined,
      age: undefined,
      unitSystem: 'metric',
    },
  });

  const calculateHipShoulderRatio = (values: FormValues) => {
    let hip = values.hipCircumference;
    let shoulder = values.shoulderWidth;

    // Convert to metric if needed
    if (values.unitSystem === 'imperial') {
      hip = values.hipCircumference * 2.54; // inches to cm
      shoulder = values.shoulderWidth * 2.54; // inches to cm
    }

    const ratio = hip / shoulder;
    return Math.round(ratio * 1000) / 1000; // Round to 3 decimal places
  };

  const getBodyShape = (ratio: number, gender: string) => {
    if (gender === 'male') {
      if (ratio < 0.9) return 'V-Shaped (Broad Shoulders)';
      if (ratio < 1.0) return 'Athletic (Balanced)';
      if (ratio < 1.1) return 'Rectangular (Straight)';
      return 'Pear-Shaped (Wider Hips)';
    } else {
      if (ratio < 0.8) return 'Inverted Triangle (Broad Shoulders)';
      if (ratio < 0.9) return 'Athletic (Balanced)';
      if (ratio < 1.0) return 'Hourglass (Curved)';
      if (ratio < 1.1) return 'Pear-Shaped (Wider Hips)';
      return 'Apple-Shaped (Wide Hips)';
    }
  };

  const getAesthetic = (ratio: number, gender: string) => {
    if (gender === 'male') {
      if (ratio < 0.9) return 'Classic V-taper ideal for bodybuilding';
      if (ratio < 1.0) return 'Athletic and proportional';
      if (ratio < 1.1) return 'Balanced and functional';
      return 'May benefit from shoulder development';
    } else {
      if (ratio < 0.8) return 'Strong and athletic appearance';
      if (ratio < 0.9) return 'Balanced and proportional';
      if (ratio < 1.0) return 'Classic hourglass figure';
      if (ratio < 1.1) return 'Feminine and curvy';
      return 'May benefit from shoulder and back training';
    }
  };

  const getInterpretation = (ratio: number, gender: string, age: number) => {
    const bodyShape = getBodyShape(ratio, gender);
    const aesthetic = getAesthetic(ratio, gender);

    if (gender === 'male') {
      if (ratio < 0.9) {
        return `You have a classic V-shaped physique with broad shoulders relative to your hips. This is often considered the ideal male body shape and is associated with strength and athleticism. ${aesthetic}`;
      } else if (ratio < 1.0) {
        return `You have a well-balanced athletic build with proportional shoulders and hips. This creates a strong, functional appearance that works well for most activities. ${aesthetic}`;
      } else if (ratio < 1.1) {
        return `You have a more rectangular or straight body shape with relatively equal shoulder and hip measurements. This is a common and functional body type. ${aesthetic}`;
      } else {
        return `You have wider hips relative to your shoulders, creating a more pear-shaped appearance. This can be improved through targeted shoulder and upper body training. ${aesthetic}`;
      }
    } else {
      if (ratio < 0.8) {
        return `You have an inverted triangle shape with broad shoulders relative to your hips. This creates a strong, athletic appearance. ${aesthetic}`;
      } else if (ratio < 0.9) {
        return `You have a balanced athletic build with proportional shoulders and hips. This creates a strong, functional appearance. ${aesthetic}`;
      } else if (ratio < 1.0) {
        return `You have a classic hourglass figure with well-balanced shoulders and hips. This is often considered an ideal feminine body shape. ${aesthetic}`;
      } else if (ratio < 1.1) {
        return `You have a pear-shaped figure with wider hips relative to your shoulders. This creates a feminine, curvy appearance. ${aesthetic}`;
      } else {
        return `You have wider hips relative to your shoulders, creating a more apple-shaped appearance. This can be balanced through targeted upper body training. ${aesthetic}`;
      }
    }
  };

  const onSubmit = (values: FormValues) => {
    const hipShoulderRatio = calculateHipShoulderRatio(values);
    const bodyShape = getBodyShape(hipShoulderRatio, values.gender);
    const interpretation = getInterpretation(hipShoulderRatio, values.gender, values.age);
    const aesthetic = getAesthetic(hipShoulderRatio, values.gender);

    let recommendations: string[] = [];

    if (values.gender === 'male') {
      if (hipShoulderRatio < 0.9) {
        recommendations = [
          'Maintain your excellent V-taper with balanced training',
          'Focus on maintaining shoulder width while building overall muscle',
          'Include exercises that enhance the V-shape (pull-ups, rows)',
          'Consider bodybuilding or physique competitions',
          'Continue balanced nutrition to support muscle development'
        ];
      } else if (hipShoulderRatio < 1.0) {
        recommendations = [
          'Maintain your balanced athletic build',
          'Focus on overall strength and muscle development',
          'Include both upper and lower body training',
          'Consider functional fitness and sports performance',
          'Maintain a balanced approach to training'
        ];
      } else {
        recommendations = [
          'Focus on shoulder and upper body development',
          'Include overhead presses, lateral raises, and pull-ups',
          'Work on building broader shoulders and a stronger back',
          'Consider reducing hip-focused exercises temporarily',
          'Focus on creating a more V-shaped silhouette'
        ];
      }
    } else {
      if (hipShoulderRatio < 0.8) {
        recommendations = [
          'Maintain your strong, athletic build',
          'Focus on balanced upper and lower body training',
          'Include exercises that enhance feminine curves',
          'Consider strength training and functional fitness',
          'Embrace your athletic physique'
        ];
      } else if (hipShoulderRatio < 1.0) {
        recommendations = [
          'Maintain your balanced, proportional build',
          'Focus on overall strength and fitness',
          'Include exercises that enhance your natural curves',
          'Consider a variety of training modalities',
          'Maintain a balanced approach to fitness'
        ];
      } else {
        recommendations = [
          'Focus on shoulder and upper body development',
          'Include overhead presses, lateral raises, and rows',
          'Work on building a stronger, more defined back',
          'Include exercises that create better proportions',
          'Focus on creating a more balanced silhouette'
        ];
      }
    }

    setResult({
      hipShoulderRatio,
      bodyShape,
      interpretation,
      recommendations,
      aesthetic,
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
              name="shoulderWidth" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shoulder Width ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter shoulder width`}
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
          <Button type="submit">Calculate Hip-to-Shoulder Ratio</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <CardTitle>Hip-to-Shoulder Ratio Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.hipShoulderRatio}</p>
                  <p className="text-sm text-muted-foreground">Hip-to-Shoulder Ratio</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.bodyShape}</p>
                  <p className="text-sm text-muted-foreground">Body Shape</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{result.interpretation}</p>
              <div>
                <h4 className="font-semibold mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
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
              The hip-to-shoulder ratio is calculated by dividing your hip circumference by your shoulder width. 
              This ratio helps determine your body shape and provides insights into your physique proportions.
            </p>
            <p>
              Different ratios create different body shapes, from V-shaped (broad shoulders) to pear-shaped 
              (wider hips), each with its own aesthetic and training implications.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Hip-to-Shoulder Ratio</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding Body Proportions</h4>
              <p>
                The hip-to-shoulder ratio is a key indicator of body shape and aesthetic proportions. It helps 
                determine whether you have a V-shaped, athletic, rectangular, or pear-shaped physique, each 
                with different training and styling implications.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Body Shape Categories</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>V-Shaped:</strong> Broad shoulders, narrow hips (ideal for men)</li>
                <li><strong>Athletic:</strong> Balanced shoulders and hips</li>
                <li><strong>Rectangular:</strong> Similar shoulder and hip measurements</li>
                <li><strong>Pear-Shaped:</strong> Wider hips relative to shoulders</li>
                <li><strong>Hourglass:</strong> Balanced with defined waist (ideal for women)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Training Implications</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>V-Shaped:</strong> Maintain shoulder width, build overall muscle</li>
                <li><strong>Athletic:</strong> Balanced training approach</li>
                <li><strong>Rectangular:</strong> Focus on creating definition and curves</li>
                <li><strong>Pear-Shaped:</strong> Emphasize shoulder and upper body development</li>
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
                  <li><a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</a></li>
                  <li><a href="/category/health-fitness/somatotype-calculator" className="text-primary underline">Somatotype Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Fitness Assessment</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/limb-circumference-ratio-calculator" className="text-primary underline">Limb Circumference Ratio Calculator</a></li>
                  <li><a href="/category/health-fitness/frame-size-calculator" className="text-primary underline">Frame Size Calculator</a></li>
                  <li><a href="/category/health-fitness/strength-to-weight-ratio-calculator" className="text-primary underline">Strength-to-Weight Ratio Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}















