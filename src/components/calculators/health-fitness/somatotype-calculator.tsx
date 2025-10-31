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
import { User } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  height: z.number().positive('Height must be positive'),
  weight: z.number().positive('Weight must be positive'),
  wristCircumference: z.number().positive('Wrist circumference must be positive'),
  ankleCircumference: z.number().positive('Ankle circumference must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

export default function SomatotypeCalculator() {
  const [result, setResult] = useState<{
    ectomorph: number;
    mesomorph: number;
    endomorph: number;
    primaryType: string;
    secondaryType: string;
    interpretation: string;
    recommendations: string[];
    characteristics: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
      wristCircumference: undefined,
      ankleCircumference: undefined,
      gender: undefined,
      age: undefined,
      unitSystem: 'metric',
    },
  });

  const calculateSomatotype = (values: FormValues) => {
    let h = values.height;
    let w = values.weight;
    let wrist = values.wristCircumference;
    let ankle = values.ankleCircumference;

    // Convert to metric if needed
    if (values.unitSystem === 'imperial') {
      h = values.height * 2.54; // inches to cm
      w = values.weight * 0.453592; // pounds to kg
      wrist = values.wristCircumference * 2.54; // inches to cm
      ankle = values.ankleCircumference * 2.54; // inches to cm
    }

    // Calculate BMI
    const heightInMeters = h / 100;
    const bmi = w / (heightInMeters * heightInMeters);

    // Calculate ectomorphy (linearity)
    const heightWeightRatio = h / Math.pow(w, 1/3);
    let ectomorph = 0;
    if (heightWeightRatio >= 40.75) {
      ectomorph = 0.5 * heightWeightRatio - 20.375;
    } else {
      ectomorph = 0.5 * heightWeightRatio - 20.375;
    }
    ectomorph = Math.max(0, Math.min(7, ectomorph));

    // Calculate mesomorphy (muscularity)
    let mesomorph = 0;
    if (values.gender === 'male') {
      mesomorph = 0.4 * (h / 100) + 0.858 * wrist + 0.601 * ankle + 0.188 * (w * 0.453592) + 0.161;
    } else {
      mesomorph = 0.4 * (h / 100) + 0.858 * wrist + 0.601 * ankle + 0.188 * (w * 0.453592) + 0.161;
    }
    mesomorph = Math.max(0, Math.min(7, mesomorph));

    // Calculate endomorphy (adiposity)
    let endomorph = 0;
    if (values.gender === 'male') {
      endomorph = -0.7182 + 0.1451 * bmi - 0.00068 * (bmi * bmi) + 0.0000014 * (bmi * bmi * bmi);
    } else {
      endomorph = -0.7182 + 0.1451 * bmi - 0.00068 * (bmi * bmi) + 0.0000014 * (bmi * bmi * bmi);
    }
    endomorph = Math.max(0, Math.min(7, endomorph));

    return {
      ectomorph: Math.round(ectomorph * 100) / 100,
      mesomorph: Math.round(mesomorph * 100) / 100,
      endomorph: Math.round(endomorph * 100) / 100,
    };
  };

  const getSomatotypeType = (ectomorph: number, mesomorph: number, endomorph: number) => {
    const max = Math.max(ectomorph, mesomorph, endomorph);
    const min = Math.min(ectomorph, mesomorph, endomorph);
    
    let primaryType = '';
    let secondaryType = '';

    if (max === ectomorph) {
      primaryType = 'Ectomorph';
      if (mesomorph > endomorph) {
        secondaryType = 'Mesomorph';
      } else {
        secondaryType = 'Endomorph';
      }
    } else if (max === mesomorph) {
      primaryType = 'Mesomorph';
      if (ectomorph > endomorph) {
        secondaryType = 'Ectomorph';
      } else {
        secondaryType = 'Endomorph';
      }
    } else {
      primaryType = 'Endomorph';
      if (ectomorph > mesomorph) {
        secondaryType = 'Ectomorph';
      } else {
        secondaryType = 'Mesomorph';
      }
    }

    return { primaryType, secondaryType };
  };

  const getCharacteristics = (primaryType: string) => {
    const characteristics = {
      Ectomorph: [
        'Naturally thin and lean',
        'Long limbs and narrow frame',
        'Fast metabolism',
        'Difficulty gaining weight and muscle',
        'Low body fat naturally',
        'May appear tall and lanky'
      ],
      Mesomorph: [
        'Naturally muscular and athletic',
        'Broad shoulders and narrow waist',
        'Gains muscle easily',
        'Moderate metabolism',
        'Well-defined muscles',
        'Strong and powerful build'
      ],
      Endomorph: [
        'Naturally soft and round',
        'Wider frame and joints',
        'Slower metabolism',
        'Gains weight easily',
        'Higher body fat naturally',
        'May struggle with weight loss'
      ],
    };

    return characteristics[primaryType as keyof typeof characteristics] || [];
  };

  const getInterpretation = (primaryType: string, secondaryType: string, ectomorph: number, mesomorph: number, endomorph: number) => {
    const scores = { ectomorph, mesomorph, endomorph };
    const sorted = Object.entries(scores).sort(([,a], [,b]) => b - a);
    
    let interpretation = '';
    
    if (primaryType === 'Ectomorph') {
      interpretation = `You are primarily an Ectomorph with ${secondaryType} tendencies. This means you have a naturally thin, lean build with a fast metabolism. You may find it challenging to gain weight and muscle mass, but you likely have good endurance and stay lean easily.`;
    } else if (primaryType === 'Mesomorph') {
      interpretation = `You are primarily a Mesomorph with ${secondaryType} tendencies. This means you have a naturally athletic, muscular build that responds well to training. You likely gain muscle and strength relatively easily and have good athletic potential.`;
    } else {
      interpretation = `You are primarily an Endomorph with ${secondaryType} tendencies. This means you have a naturally softer, rounder build with a slower metabolism. You may gain weight easily but also have good potential for building muscle mass.`;
    }

    return interpretation;
  };

  const onSubmit = (values: FormValues) => {
    const { ectomorph, mesomorph, endomorph } = calculateSomatotype(values);
    const { primaryType, secondaryType } = getSomatotypeType(ectomorph, mesomorph, endomorph);
    const interpretation = getInterpretation(primaryType, secondaryType, ectomorph, mesomorph, endomorph);
    const characteristics = getCharacteristics(primaryType);

    let recommendations: string[] = [];

    if (primaryType === 'Ectomorph') {
      recommendations = [
        'Focus on compound movements for maximum muscle activation',
        'Eat in a caloric surplus with plenty of protein (1.6-2.2g per kg)',
        'Limit cardio to preserve calories for muscle building',
        'Train with moderate volume and focus on progressive overload',
        'Get adequate rest and recovery between sessions',
        'Consider shorter, more intense workouts'
      ];
    } else if (primaryType === 'Mesomorph') {
      recommendations = [
        'Take advantage of your natural athletic ability',
        'Focus on both strength and muscle building',
        'Use moderate to high training volume',
        'Include both compound and isolation exercises',
        'Maintain balanced nutrition with adequate protein',
        'Consider a variety of training modalities'
      ];
    } else {
      recommendations = [
        'Focus on strength training to build muscle mass',
        'Include regular cardiovascular exercise for fat loss',
        'Monitor caloric intake carefully',
        'Use higher training volume and frequency',
        'Focus on compound movements and functional training',
        'Consider intermittent fasting or structured meal timing'
      ];
    }

    setResult({
      ectomorph,
      mesomorph,
      endomorph,
      primaryType,
      secondaryType,
      interpretation,
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
                      <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (inches, lbs)</SelectItem>
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
              name="weight" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight ({form.watch('unitSystem') === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter weight in ${form.watch('unitSystem') === 'metric' ? 'kg' : 'lbs'}`}
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
                      placeholder={`Enter wrist circumference`}
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
              name="ankleCircumference" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ankle Circumference ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter ankle circumference`}
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
          <Button type="submit">Calculate Somatotype</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-primary" />
                <CardTitle>Somatotype Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.ectomorph}</p>
                  <p className="text-sm text-muted-foreground">Ectomorph</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.mesomorph}</p>
                  <p className="text-sm text-muted-foreground">Mesomorph</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.endomorph}</p>
                  <p className="text-sm text-muted-foreground">Endomorph</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{result.primaryType}</p>
                <p className="text-sm text-muted-foreground">Primary Type</p>
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
                  <h4 className="font-semibold mb-2">Characteristics:</h4>
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
              Somatotype analysis uses anthropometric measurements to classify body types into three components: 
              ectomorphy (linearity), mesomorphy (muscularity), and endomorphy (adiposity). Each component is 
              scored on a scale of 0-7.
            </p>
            <p>
              The analysis considers height, weight, bone structure (wrist and ankle circumference), and body 
              composition to determine your primary and secondary somatotype characteristics.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Somatotypes</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What are Somatotypes?</h4>
              <p>
                Somatotypes are a classification system for human body types based on three components: 
                ectomorphy (linearity), mesomorphy (muscularity), and endomorphy (adiposity). This system 
                helps understand your natural body composition and provides insights for training and nutrition.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">The Three Somatotypes</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Ectomorph:</strong> Naturally thin, lean, with difficulty gaining weight</li>
                <li><strong>Mesomorph:</strong> Naturally muscular, athletic, gains muscle easily</li>
                <li><strong>Endomorph:</strong> Naturally soft, round, gains weight easily</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Training Implications</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Ectomorphs:</strong> Focus on compound movements, eat in surplus, limit cardio</li>
                <li><strong>Mesomorphs:</strong> Balanced approach, moderate volume, variety in training</li>
                <li><strong>Endomorphs:</strong> Higher volume, include cardio, monitor nutrition closely</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Nutrition Implications</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Ectomorphs:</strong> High calorie, high protein, frequent meals</li>
                <li><strong>Mesomorphs:</strong> Balanced macronutrients, moderate portions</li>
                <li><strong>Endomorphs:</strong> Controlled portions, focus on protein, monitor carbs</li>
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
                  <li><a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</a></li>
                  <li><a href="/category/health-fitness/lean-body-mass-calculator" className="text-primary underline">Lean Body Mass Calculator</a></li>
                  <li><a href="/category/health-fitness/muscle-mass-percentage-calculator" className="text-primary underline">Muscle Mass Percentage Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Fitness Assessment</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/frame-size-calculator" className="text-primary underline">Frame Size Calculator</a></li>
                  <li><a href="/category/health-fitness/hip-to-shoulder-ratio-calculator" className="text-primary underline">Hip-to-Shoulder Ratio Calculator</a></li>
                  <li><a href="/category/health-fitness/limb-circumference-ratio-calculator" className="text-primary underline">Limb Circumference Ratio Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}





























