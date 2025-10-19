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
import { Activity } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  upperArmCircumference: z.number().positive('Upper arm circumference must be positive'),
  forearmCircumference: z.number().positive('Forearm circumference must be positive'),
  thighCircumference: z.number().positive('Thigh circumference must be positive'),
  calfCircumference: z.number().positive('Calf circumference must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

export default function LimbCircumferenceRatioCalculator() {
  const [result, setResult] = useState<{
    upperToForearmRatio: number;
    thighToCalfRatio: number;
    armToLegRatio: number;
    interpretation: string;
    recommendations: string[];
    symmetry: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      upperArmCircumference: undefined,
      forearmCircumference: undefined,
      thighCircumference: undefined,
      calfCircumference: undefined,
      gender: undefined,
      age: undefined,
      unitSystem: 'metric',
    },
  });

  const calculateRatios = (values: FormValues) => {
    const upperToForearmRatio = values.upperArmCircumference / values.forearmCircumference;
    const thighToCalfRatio = values.thighCircumference / values.calfCircumference;
    const armToLegRatio = values.upperArmCircumference / values.thighCircumference;

    return {
      upperToForearmRatio: Math.round(upperToForearmRatio * 100) / 100,
      thighToCalfRatio: Math.round(thighToCalfRatio * 100) / 100,
      armToLegRatio: Math.round(armToLegRatio * 100) / 100,
    };
  };

  const getSymmetryAnalysis = (ratios: any, gender: string) => {
    const { upperToForearmRatio, thighToCalfRatio } = ratios;
    
    let symmetry = '';
    let interpretation = '';
    let recommendations: string[] = [];

    // Upper to forearm ratio analysis
    const upperForearmNormal = gender === 'male' ? 1.6 : 1.5;
    const upperForearmDiff = Math.abs(upperToForearmRatio - upperForearmNormal);
    
    // Thigh to calf ratio analysis
    const thighCalfNormal = gender === 'male' ? 1.4 : 1.3;
    const thighCalfDiff = Math.abs(thighToCalfRatio - thighCalfNormal);

    if (upperForearmDiff < 0.1 && thighCalfDiff < 0.1) {
      symmetry = 'Excellent';
      interpretation = 'Your limb proportions are well-balanced and symmetrical. This indicates good overall muscle development and proportional growth.';
      recommendations = [
        'Maintain your current training approach',
        'Focus on progressive overload',
        'Consider adding variety to prevent plateaus',
        'Continue balanced training of all muscle groups'
      ];
    } else if (upperForearmDiff < 0.2 && thighCalfDiff < 0.2) {
      symmetry = 'Good';
      interpretation = 'Your limb proportions are generally well-balanced with minor asymmetries. This is normal and within healthy ranges.';
      recommendations = [
        'Continue balanced training',
        'Address any minor imbalances with targeted exercises',
        'Monitor progress regularly',
        'Maintain consistent training frequency'
      ];
    } else {
      symmetry = 'Needs Improvement';
      interpretation = 'Your limb proportions show some imbalances that could benefit from targeted training. Focus on bringing up weaker areas.';
      recommendations = [
        'Identify and prioritize weaker muscle groups',
        'Add extra volume for lagging body parts',
        'Use unilateral exercises to address imbalances',
        'Consider working with a trainer for guidance'
      ];
    }

    return { symmetry, interpretation, recommendations };
  };

  const onSubmit = (values: FormValues) => {
    const ratios = calculateRatios(values);
    const { symmetry, interpretation, recommendations } = getSymmetryAnalysis(ratios, values.gender);

    setResult({
      ...ratios,
      interpretation,
      recommendations,
      symmetry,
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
              name="upperArmCircumference" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upper Arm Circumference ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter upper arm circumference`}
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
              name="forearmCircumference" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forearm Circumference ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter forearm circumference`}
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
              name="thighCircumference" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thigh Circumference ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter thigh circumference`}
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
              name="calfCircumference" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calf Circumference ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter calf circumference`}
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
          <Button type="submit">Calculate Limb Ratios</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-primary" />
                <CardTitle>Limb Circumference Ratios</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.upperToForearmRatio}</p>
                  <p className="text-sm text-muted-foreground">Upper Arm : Forearm</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.thighToCalfRatio}</p>
                  <p className="text-sm text-muted-foreground">Thigh : Calf</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.armToLegRatio}</p>
                  <p className="text-sm text-muted-foreground">Arm : Leg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Symmetry Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-primary">{result.symmetry}</p>
                <p className="text-sm text-muted-foreground">Overall Symmetry Rating</p>
              </div>
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
              This calculator analyzes the proportions between different limb circumferences to assess muscle 
              development symmetry and balance. It compares upper arm to forearm, thigh to calf, and arm to leg ratios.
            </p>
            <p>
              Balanced ratios indicate proportional muscle development, while imbalanced ratios may suggest 
              areas that need more attention in your training program.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Limb Circumference Ratios</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding Limb Ratios</h4>
              <p>
                Limb circumference ratios help assess muscle development balance and symmetry. They provide 
                insight into whether your training is creating proportional muscle growth across different body parts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">How to Measure Circumferences</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Upper Arm:</strong> Measure at the largest point of the bicep</li>
                <li><strong>Forearm:</strong> Measure at the largest point of the forearm</li>
                <li><strong>Thigh:</strong> Measure at the largest point of the upper leg</li>
                <li><strong>Calf:</strong> Measure at the largest point of the lower leg</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Normal Ratio Ranges</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Upper Arm : Forearm:</strong> 1.5-1.7 (males), 1.4-1.6 (females)</li>
                <li><strong>Thigh : Calf:</strong> 1.3-1.5 (males), 1.2-1.4 (females)</li>
                <li><strong>Arm : Leg:</strong> 0.6-0.8 (varies by individual)</li>
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
                  <li><a href="/category/health-fitness/muscle-mass-percentage-calculator" className="text-primary underline">Muscle Mass Percentage Calculator</a></li>
                  <li><a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</a></li>
                  <li><a href="/category/health-fitness/lean-body-mass-calculator" className="text-primary underline">Lean Body Mass Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Fitness Assessment</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</a></li>
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
