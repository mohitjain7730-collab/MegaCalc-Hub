'use client';

import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';

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

type ResultPayload = {
  bmr: number;
  adjustedCalories: number;
  proteinNeeds: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  { label: 'Weight', description: 'Enter body weight in kilograms. If you only know pounds, divide by 2.205.' },
  { label: 'Height', description: 'Height in centimeters is required for the Mifflin-St Jeor BMR equation.' },
  { label: 'Age & Gender', description: 'Metabolic rate declines with age and differs between males and females.' },
  { label: 'Activity Level', description: 'Select the lifestyle closest to your current movement, not pre-surgery habits.' },
  { label: 'Surgery Type', description: 'More invasive procedures require higher calorie multipliers to fuel healing.' },
  { label: 'Days Since Surgery', description: 'Inflammation and metabolic demand decline over time, so calories taper down.' },
];

const faqs: [string, string][] = [
  ['How soon after surgery should I track calories?', 'Begin as soon as you can tolerate normal foods. Early tracking helps prevent energy deficits that slow healing.'],
  ['Why are protein needs so high?', 'Protein repairs incisions, supports immunity, and rebuilds muscle mass lost during hospital stays.'],
  ['Do I need supplements?', 'Only if your medical team recommends them. Prioritize whole foods first, then use shakes or oral nutrition supplements if appetite is low.'],
  ['Can I lose weight while recovering?', 'Fat loss should wait until you are cleared for regular activity. Focus on healing first, then consider gradual deficits.'],
  ['How much water do I need?', 'Aim for at least 30–35 ml/kg. Hydration supports circulation, digestion, and nutrient transport.'],
  ['What if I feel nauseous?', 'Choose bland, easy-to-digest options like broths, smoothies, and mashed potatoes while keeping protein intake up.'],
  ['Does sleep affect calorie needs?', 'Poor sleep elevates stress hormones and slows tissue repair. Prioritize 7–9 hours nightly for best recovery.'],
  ['Should I track micronutrients?', 'Vitamin C, zinc, vitamin D, and omega-3 fats are especially important. Include colorful produce and healthy fats daily.'],
  ['How often should I reassess?', 'Recalculate every 1–2 weeks or after follow-up appointments as your activity increases.'],
  ['Can I use this for caregivers?', 'Yes—caregivers can input patient data to plan meals and grocery lists that meet recovery targets.'],
];

const relatedCalculators = [
  { title: 'Basal Metabolic Rate (BMR) Calculator', href: '/health-fitness/bmr-calculator', description: 'Understand your baseline before surgery adjustments.' },
  { title: 'Protein Intake Calculator', href: '/health-fitness/protein-intake-calculator', description: 'Dial in daily grams to support wound healing.' },
  { title: 'Hydration Needs Calculator', href: '/health-fitness/hydration-needs-calculator', description: 'Set fluid targets that aid recovery and medication absorption.' },
  { title: 'Body Composition Tracker', href: '/health-fitness/body-fat-percentage-calculator', description: 'Monitor long-term shifts after returning to activity.' },
];

const completeGuideSections = [
  {
    title: 'Immediate Post-Op (Days 1–3)',
    bullets: ['Prioritize hydration, broths, and small protein-rich snacks', 'Limit added sugars that displace nutrient-dense foods', 'Follow hospital dietary instructions exactly'],
  },
  {
    title: 'Early Recovery (Days 4–14)',
    bullets: ['Increase calories by 10–25% above baseline', 'Introduce vitamin C, zinc, and omega-3 rich foods', 'Split protein into 4–5 feedings of 20–30g each'],
  },
  {
    title: 'Rebuilding Phase (Weeks 3–8)',
    bullets: ['Gradually increase activity level and adjust calories upward', 'Add fiber for gut health and medication regularity', 'Schedule follow-ups to reassess needs and restrictions'],
  },
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Hydrate aggressively, focus on soft proteins (yogurt, smoothies), and monitor bowel habits.' },
  { week: 2, focus: 'Add colorful produce, omega-3 fats, and begin gentle walking if cleared.' },
  { week: 3, focus: 'Increase calorie intake by 100–200 kcal if energy lags; emphasize high-protein breakfasts.' },
  { week: 4, focus: 'Introduce light resistance or physical therapy exercises; adjust macros to support activity.' },
  { week: 5, focus: 'Reassess body weight and appetite, add complex carbohydrates for consistent energy.' },
  { week: 6, focus: 'Focus on gut health (fermented foods, fiber) and maintain protein at 1.2 g/kg.' },
  { week: 7, focus: 'Add meal prepping or batch cooking to simplify consistent eating.' },
  { week: 8, focus: 'Transition toward long-term nutrition goals with your clinician’s input.' },
];

const warningSigns = () => [
  'Unintentional weight loss greater than 2% per week post-surgery.',
  'Persistent nausea, vomiting, or inability to eat for more than 24 hours.',
  'Signs of infection (fever, redness, drainage) paired with low appetite.',
  'Dizziness or extreme fatigue despite hitting calorie targets—contact your care team.',
];

const activityLabels: Record<FormValues['activityLevel'], string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Light (1–3 light workouts/week)',
  moderate: 'Moderate (3–5 moderate workouts/week)',
  active: 'Active (hard exercise 6–7 days/week)',
  very_active: 'Very Active (physical job or double workouts)',
};

const formSelects = [
  {
    name: 'gender',
    label: 'Gender',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  {
    name: 'activityLevel',
    label: 'Current Activity Level',
    options: Object.entries(activityLabels).map(([value, label]) => ({ value, label })),
  },
  {
    name: 'surgeryType',
    label: 'Type of Surgery',
    options: [
      { value: 'minor', label: 'Minor (outpatient procedures)' },
      { value: 'moderate', label: 'Moderate (appendectomy, hernia repair)' },
      { value: 'major', label: 'Major (joint replacement, organ surgery)' },
      { value: 'trauma', label: 'Trauma or emergency surgery' },
    ],
  },
] as const;

const calculateBMR = (weight: number, height: number, age: number, gender: string) =>
  gender === 'male'
    ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const getSurgeryMultiplier = (surgeryType: string, daysSinceSurgery: number) => {
  const baseMultipliers = { minor: 1.1, moderate: 1.2, major: 1.3, trauma: 1.4 };
  const baseMultiplier = baseMultipliers[surgeryType as keyof typeof baseMultipliers];
  const recoveryFactor = Math.max(0.1, 1 - daysSinceSurgery / 30);
  return baseMultiplier + recoveryFactor * 0.2;
};

export default function PostSurgeryCalorieNeedsCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

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

  const onSubmit = (values: FormValues) => {
    const bmr = calculateBMR(values.weight, values.height, values.age, values.gender);
    const adjustedCalories = Math.round(bmr * activityMultipliers[values.activityLevel] * getSurgeryMultiplier(values.surgeryType, values.daysSinceSurgery));
    const proteinNeeds = Math.round(values.weight * 1.2);

    let interpretation = '';
    let recommendations: string[] = [];

    if (adjustedCalories < bmr * 1.2) {
      interpretation = 'Calorie needs are relatively low—common within the first week. Focus on nutrient density to maximize healing.';
      recommendations = [
        'Aim for 25–30 g of protein per meal even if appetite is low.',
        'Use smoothies, soups, or Greek yogurt for easy calories.',
        'Add vitamin C (citrus, berries) and zinc (seafood, seeds) daily.',
        'Stay hydrated; dehydration slows nutrient delivery.',
      ];
    } else if (adjustedCalories < bmr * 1.5) {
      interpretation = 'Calorie needs are moderately elevated to fuel tissue repair, immune function, and gradual activity increases.';
      recommendations = [
        'Balance meals with protein, complex carbs, and healthy fats.',
        'Add anti-inflammatory foods such as fatty fish, turmeric, and leafy greens.',
        'Snack on nuts, hummus, or cottage cheese to prevent energy dips.',
        'Monitor weight weekly to ensure you are not losing muscle mass.',
      ];
    } else {
      interpretation = 'Calorie needs are significantly elevated due to major surgery or trauma—work closely with your care team.';
      recommendations = [
        'Consider medical nutrition shakes or oral supplements.',
        'Distribute protein evenly across the day (4–5 feedings).',
        'Track micronutrient intake and ask about vitamin D, C, and zinc labs.',
        'Schedule a registered dietitian consult for personalized targets.',
      ];
    }

    setResult({
      bmr: Math.round(bmr),
      adjustedCalories,
      proteinNeeds,
      interpretation,
      recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  };

  const numberInputProps = (handler: (value: number | undefined) => void, value: number | undefined, step = '0.1') => ({
    value: value ?? '',
    step,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = event.target.value === '' ? undefined : Number(event.target.value);
      handler(Number.isNaN(parsed as number) ? undefined : parsed);
    },
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Post-Surgery Calorie Needs Calculator
          </CardTitle>
          <CardDescription>Estimate daily calories, protein, and recovery milestones based on surgery type and healing stage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" {...numberInputProps(field.onChange, field.value)} />
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
                        <Input type="number" {...numberInputProps(field.onChange, field.value)} />
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
                        <Input type="number" {...numberInputProps(field.onChange, field.value, '1')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {formSelects.map(({ name, label, options }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as keyof FormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <Select value={String(field.value || '')} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <FormField
                  control={form.control}
                  name="daysSinceSurgery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days Since Surgery</FormLabel>
                      <FormControl>
                        <Input type="number" {...numberInputProps(field.onChange, field.value, '1')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="w-full sm:flex-1 bg-gradient-to-r from-rose-600 to-orange-500">
                  Calculate Calorie Needs
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={resetCalculator}>
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Recovery Targets</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: 'Basal Metabolic Rate', value: `${result.bmr} kcal` },
                { label: 'Daily Calorie Needs', value: `${result.adjustedCalories} kcal` },
                { label: 'Protein Goal', value: `${result.proteinNeeds} g/day` },
              ].map((metric) => (
                <div key={metric.label} className="rounded border p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Playbook</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{result.interpretation}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.recommendations.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warning Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.warningSigns.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                8‑Week Recovery Nutrition Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-2 text-left">Week</th>
                    <th className="px-2 py-2 text-left">Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {result.plan.map(({ week, focus }) => (
                    <tr key={week} className="border-b">
                      <td className="px-2 py-2 font-semibold">Week {week}</td>
                      <td className="px-2 py-2 text-muted-foreground">{focus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Collect accurate data to get reliable calorie targets.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {understandingInputs.map((item) => (
              <li key={item.label}>
                <span className="font-semibold text-foreground">{item.label}:</span> {item.description}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Build a complete recovery dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {relatedCalculators.map((item) => (
            <div key={item.title} className="rounded border p-4">
              <h4 className="font-semibold">
                <Link href={item.href} className="text-primary hover:underline">
                  {item.title}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Post-Surgery Nutrition</CardTitle>
          <CardDescription>Evidence-backed advice for every recovery stage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {completeGuideSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
              <ul className="list-disc space-y-1 pl-5">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>SEO-friendly answers for patients and caregivers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {faqs.map(([question, answer]) => (
            <div key={question}>
              <h4 className="font-semibold text-foreground">{question}</h4>
              <p>{answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}




