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
import { Ruler } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  height: z.number().positive('Height must be positive'),
  wristCircumference: z.number().positive('Wrist circumference must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

export default function FrameSizeCalculator() {
  const [result, setResult] = useState<{
    frameSize: string;
    frameIndex: number;
    interpretation: string;
    idealWeightRange: {
      min: number;
      max: number;
    };
    recommendations: string[];
    characteristics: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: undefined,
      wristCircumference: undefined,
      gender: undefined,
      age: undefined,
      unitSystem: 'metric',
    },
  });

  const calculateFrameSize = (height: number, wristCircumference: number, gender: string, unitSystem: string) => {
    let h = height;
    let w = wristCircumference;

    // Convert to metric if needed
    if (unitSystem === 'imperial') {
      h = height * 2.54; // inches to cm
      w = wristCircumference * 2.54; // inches to cm
    }

    // Frame size calculation based on height and wrist circumference
    let frameIndex = 0;
    let frameSize = '';

    if (gender === 'male') {
      frameIndex = h / w;
      if (frameIndex > 10.4) {
        frameSize = 'Small';
      } else if (frameIndex > 9.6) {
        frameSize = 'Medium';
      } else {
        frameSize = 'Large';
      }
    } else {
      frameIndex = h / w;
      if (frameIndex > 11.0) {
        frameSize = 'Small';
      } else if (frameIndex > 10.1) {
        frameSize = 'Medium';
      } else {
        frameSize = 'Large';
      }
    }

    return {
      frameSize,
      frameIndex: Math.round(frameIndex * 100) / 100,
    };
  };

  const calculateIdealWeightRange = (height: number, frameSize: string, gender: string, unitSystem: string) => {
    let h = height;
    
    // Convert to metric if needed
    if (unitSystem === 'imperial') {
      h = height * 2.54; // inches to cm
    }

    const heightInMeters = h / 100;
    let baseWeight = 0;

    // Base weight calculation (BMI 22)
    baseWeight = 22 * (heightInMeters * heightInMeters);

    // Adjust for frame size
    let minMultiplier = 0.9;
    let maxMultiplier = 1.1;

    if (frameSize === 'Small') {
      minMultiplier = 0.85;
      maxMultiplier = 1.05;
    } else if (frameSize === 'Large') {
      minMultiplier = 0.95;
      maxMultiplier = 1.15;
    }

    const minWeight = baseWeight * minMultiplier;
    const maxWeight = baseWeight * maxMultiplier;

    // Convert back to original units if needed
    if (unitSystem === 'imperial') {
      return {
        min: Math.round(minWeight * 2.20462 * 10) / 10,
        max: Math.round(maxWeight * 2.20462 * 10) / 10,
      };
    }

    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10,
    };
  };

  const getFrameCharacteristics = (frameSize: string) => {
    const characteristics = {
      Small: [
        'Narrow shoulders and hips',
        'Thin wrists and ankles',
        'Light bone structure',
        'May appear delicate or slender',
        'Typically lower muscle mass potential',
        'May need to focus on strength training'
      ],
      Medium: [
        'Proportional shoulders and hips',
        'Moderate bone structure',
        'Balanced body proportions',
        'Good muscle mass potential',
        'Versatile for various activities',
        'Most common frame size'
      ],
      Large: [
        'Broad shoulders and hips',
        'Thick wrists and ankles',
        'Heavy bone structure',
        'May appear stocky or robust',
        'High muscle mass potential',
        'Natural strength advantages'
      ],
    };

    return characteristics[frameSize as keyof typeof characteristics] || [];
  };

  const onSubmit = (values: FormValues) => {
    const { frameSize, frameIndex } = calculateFrameSize(values.height, values.wristCircumference, values.gender, values.unitSystem);
    const idealWeightRange = calculateIdealWeightRange(values.height, frameSize, values.gender, values.unitSystem);
    const characteristics = getFrameCharacteristics(frameSize);

    let interpretation = '';
    let recommendations: string[] = [];

    if (frameSize === 'Small') {
      interpretation = 'You have a small frame, which means you have a lighter bone structure. This can be advantageous for endurance activities and may mean you need to focus more on strength training to build muscle mass.';
      recommendations = [
        'Focus on progressive strength training to build muscle mass',
        'Ensure adequate protein intake (1.6-2.2g per kg body weight)',
        'Consider higher rep ranges (8-15) for muscle hypertrophy',
        'Don\'t be discouraged by lower absolute strength numbers',
        'Focus on relative strength and bodyweight exercises'
      ];
    } else if (frameSize === 'Medium') {
      interpretation = 'You have a medium frame, which provides a good balance for most physical activities. You have moderate potential for both strength and endurance activities.';
      recommendations = [
        'Maintain a balanced approach to training',
        'Focus on both strength and cardiovascular fitness',
        'Use moderate rep ranges (6-12) for muscle building',
        'Consider a variety of training modalities',
        'Monitor your progress with multiple metrics'
      ];
    } else {
      interpretation = 'You have a large frame, which typically provides advantages in strength and power activities. You may have higher muscle mass potential and natural strength advantages.';
      recommendations = [
        'Focus on heavy compound movements for strength',
        'Use lower rep ranges (3-8) for maximum strength',
        'Take advantage of your natural strength potential',
        'Consider powerlifting or strength sports',
        'Ensure proper form to prevent injury with heavy weights'
      ];
    }

    setResult({
      frameSize,
      frameIndex,
      interpretation,
      idealWeightRange,
      recommendations,
      characteristics,
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
              name="height" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter height in ${form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'}`}
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
              name="wristCircumference" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wrist Circumference ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter wrist circumference in ${form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'}`}
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
          <Button type="submit">Calculate Frame Size</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Ruler className="h-8 w-8 text-primary" />
                <CardTitle>Frame Size Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.frameSize}</p>
                  <p className="text-sm text-muted-foreground">Frame Size</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.frameIndex}</p>
                  <p className="text-sm text-muted-foreground">Frame Index</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ideal Weight Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {result.idealWeightRange.min} - {result.idealWeightRange.max} {form.watch('unitSystem') === 'metric' ? 'kg' : 'lbs'}
                </p>
                <p className="text-sm text-muted-foreground">Recommended weight range for your frame size</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis & Characteristics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{result.interpretation}</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Frame Characteristics:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.characteristics.map((char, index) => (
                      <li key={index}>{char}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
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
              Frame size is determined by comparing your height to your wrist circumference. The frame index is 
              calculated by dividing height by wrist circumference, with different thresholds for men and women.
            </p>
            <p>
              This method provides insight into your bone structure and can help determine appropriate weight 
              ranges and training approaches that suit your body type.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Frame Size Assessment</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding Frame Size</h4>
              <p>
                Frame size refers to the relative size of your bone structure, particularly the width of your 
                bones. It's determined by measuring your wrist circumference relative to your height. Frame size 
                affects your ideal weight range, muscle mass potential, and training approach.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Frame Size Categories</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Small Frame:</strong> Narrow bones, typically lighter build</li>
                <li><strong>Medium Frame:</strong> Average bone structure, balanced proportions</li>
                <li><strong>Large Frame:</strong> Wide bones, typically heavier build</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">How to Measure Wrist Circumference</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Use a flexible measuring tape</li>
                <li>Measure at the narrowest part of your wrist</li>
                <li>Measure on your dominant hand</li>
                <li>Ensure the tape is snug but not tight</li>
                <li>Take the measurement in the morning for consistency</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Training Implications by Frame Size</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Small Frame:</strong> Focus on relative strength, higher reps, endurance training</li>
                <li><strong>Medium Frame:</strong> Balanced approach, moderate reps, versatile training</li>
                <li><strong>Large Frame:</strong> Focus on absolute strength, lower reps, power training</li>
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
                  <li><a href="/category/health-fitness/ideal-body-weight-calculator" className="text-primary underline">Ideal Body Weight Calculator</a></li>
                  <li><a href="/category/health-fitness/bmi-calculator" className="text-primary underline">BMI Calculator</a></li>
                  <li><a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Fitness Assessment</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/somatotype-calculator" className="text-primary underline">Somatotype Calculator</a></li>
                  <li><a href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary underline">One Rep Max Calculator</a></li>
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























