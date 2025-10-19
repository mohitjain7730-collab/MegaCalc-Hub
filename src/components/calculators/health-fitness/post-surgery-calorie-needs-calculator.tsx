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
import { Heart } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  weight: z.number().positive('Weight must be positive'),
  height: z.number().positive('Height must be positive'),
  age: z.number().positive('Age must be positive'),
  gender: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  surgeryType: z.enum(['minor', 'moderate', 'major', 'trauma']),
  daysSinceSurgery: z.number().min(0, 'Days since surgery cannot be negative'),
});

type FormValues = z.infer<typeof formSchema>;

export default function PostSurgeryCalorieNeedsCalculator() {
  const [result, setResult] = useState<{
    bmr: number;
    adjustedCalories: number;
    proteinNeeds: number;
    interpretation: string;
    recommendations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      height: undefined,
      age: undefined,
      gender: undefined,
      activityLevel: undefined,
      surgeryType: undefined,
      daysSinceSurgery: undefined,
    },
  });

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const getActivityMultiplier = (activityLevel: string) => {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return multipliers[activityLevel as keyof typeof multipliers];
  };

  const getSurgeryMultiplier = (surgeryType: string, daysSinceSurgery: number) => {
    const baseMultipliers = {
      minor: 1.1,
      moderate: 1.2,
      major: 1.3,
      trauma: 1.4,
    };
    
    const baseMultiplier = baseMultipliers[surgeryType as keyof typeof baseMultipliers];
    
    // Recovery factor decreases over time
    const recoveryFactor = Math.max(0.1, 1 - (daysSinceSurgery / 30));
    return baseMultiplier + (recoveryFactor * 0.2);
  };

  const onSubmit = (values: FormValues) => {
    const bmr = calculateBMR(values.weight, values.height, values.age, values.gender);
    const activityMultiplier = getActivityMultiplier(values.activityLevel);
    const surgeryMultiplier = getSurgeryMultiplier(values.surgeryType, values.daysSinceSurgery);
    
    const adjustedCalories = Math.round(bmr * activityMultiplier * surgeryMultiplier);
    const proteinNeeds = Math.round(values.weight * 1.2); // 1.2g per kg for recovery

    let interpretation = '';
    let recommendations: string[] = [];

    if (adjustedCalories < bmr * 1.2) {
      interpretation = 'Your calorie needs are relatively low, which is normal in early recovery. Focus on nutrient-dense foods to support healing.';
      recommendations = [
        'Prioritize protein-rich foods for tissue repair',
        'Include anti-inflammatory foods like berries and leafy greens',
        'Stay hydrated with water and herbal teas',
        'Consider smaller, more frequent meals'
      ];
    } else if (adjustedCalories < bmr * 1.5) {
      interpretation = 'Your calorie needs are moderately increased due to surgery and recovery. This supports healing while maintaining energy levels.';
      recommendations = [
        'Balance protein, carbohydrates, and healthy fats',
        'Include vitamin C-rich foods for collagen synthesis',
        'Add zinc-rich foods to support immune function',
        'Monitor your energy levels and adjust as needed'
      ];
    } else {
      interpretation = 'Your calorie needs are significantly increased due to major surgery or trauma. Adequate nutrition is crucial for optimal recovery.';
      recommendations = [
        'Work with a registered dietitian for personalized nutrition',
        'Focus on high-quality protein sources',
        'Include omega-3 fatty acids for anti-inflammatory benefits',
        'Consider nutritional supplements if recommended by your healthcare provider'
      ];
    }

    setResult({
      bmr: Math.round(bmr),
      adjustedCalories,
      proteinNeeds,
      interpretation,
      recommendations,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              control={form.control} 
              name="weight" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your weight"
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
              name="height" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your height"
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
              name="activityLevel" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                      <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (very hard exercise, physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="surgeryType" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Surgery</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select surgery type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="minor">Minor (e.g., mole removal, small biopsy)</SelectItem>
                      <SelectItem value="moderate">Moderate (e.g., appendectomy, hernia repair)</SelectItem>
                      <SelectItem value="major">Major (e.g., heart surgery, joint replacement)</SelectItem>
                      <SelectItem value="trauma">Trauma (e.g., accident-related surgery)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="daysSinceSurgery" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days Since Surgery</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter days since surgery"
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
          <Button type="submit">Calculate Calorie Needs</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Heart className="h-8 w-8 text-primary" />
                <CardTitle>Post-Surgery Calorie Needs</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.bmr}</p>
                  <p className="text-sm text-muted-foreground">Base Metabolic Rate (BMR)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.adjustedCalories}</p>
                  <p className="text-sm text-muted-foreground">Daily Calorie Needs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.proteinNeeds}g</p>
                  <p className="text-sm text-muted-foreground">Daily Protein Needs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Results Interpretation</CardTitle>
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
              This calculator estimates your daily calorie needs after surgery by considering your basal metabolic rate (BMR), 
              activity level, and the metabolic demands of healing. The calculation uses the Mifflin-St Jeor equation for BMR 
              and applies surgery-specific multipliers based on the type and recency of your procedure.
            </p>
            <p>
              Surgery increases your body's energy needs due to tissue repair, immune response, and stress response. 
              The calculator accounts for these factors to provide personalized nutrition guidance for optimal recovery.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Post-Surgery Nutrition</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding Post-Surgery Calorie Needs</h4>
              <p>
                After surgery, your body requires additional energy to support healing, fight infection, and repair damaged tissues. 
                The metabolic response to surgery can increase your calorie needs by 10-40% depending on the procedure's complexity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Key Nutritional Priorities</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Protein:</strong> Essential for tissue repair and immune function (1.2-1.5g per kg body weight)</li>
                <li><strong>Vitamin C:</strong> Critical for collagen synthesis and wound healing</li>
                <li><strong>Zinc:</strong> Supports immune function and protein synthesis</li>
                <li><strong>Omega-3 fatty acids:</strong> Reduce inflammation and support healing</li>
                <li><strong>Antioxidants:</strong> Protect against oxidative stress during recovery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Recovery Timeline</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Days 1-3:</strong> Focus on hydration and easily digestible foods</li>
                <li><strong>Days 4-7:</strong> Gradually increase protein and nutrient density</li>
                <li><strong>Weeks 2-4:</strong> Return to balanced nutrition with healing focus</li>
                <li><strong>Month 2+:</strong> Normal nutrition with continued protein emphasis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Foods to Include</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Lean proteins: chicken, fish, eggs, Greek yogurt</li>
                <li>Colorful vegetables: bell peppers, spinach, broccoli</li>
                <li>Healthy fats: avocado, nuts, olive oil</li>
                <li>Complex carbohydrates: quinoa, sweet potatoes, oats</li>
                <li>Hydrating foods: watermelon, cucumber, herbal teas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Foods to Avoid</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Processed foods high in sugar and sodium</li>
                <li>Excessive caffeine and alcohol</li>
                <li>Raw or undercooked foods (infection risk)</li>
                <li>Foods that cause digestive discomfort</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-calculators">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Nutrition & Recovery</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/bmr-calculator" className="text-primary underline">BMR Calculator</a></li>
                  <li><a href="/category/health-fitness/protein-needs-calculator" className="text-primary underline">Protein Needs Calculator</a></li>
                  <li><a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Health Monitoring</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/ideal-weight-calculator" className="text-primary underline">Ideal Weight Calculator</a></li>
                  <li><a href="/category/health-fitness/calorie-burn-calculator" className="text-primary underline">Calorie Burn Calculator</a></li>
                  <li><a href="/category/health-fitness/water-intake-calculator" className="text-primary underline">Water Intake Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
