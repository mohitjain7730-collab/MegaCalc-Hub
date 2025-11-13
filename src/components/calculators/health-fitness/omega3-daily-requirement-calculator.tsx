'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Fish, Activity, Calendar, AlertTriangle } from 'lucide-react';

const healthConditionSchema = z.enum(['heart_disease', 'diabetes', 'arthritis', 'depression', 'adhd', 'none']);

const formSchema = z
  .object({
    age: z.number({ invalid_type_error: 'Enter age in years' }).min(1).max(120),
    gender: z.enum(['male', 'female']),
    weight: z.number({ invalid_type_error: 'Enter weight' }).positive(),
    unit: z.enum(['metric', 'imperial']),
    pregnancyStatus: z.enum(['not_pregnant', 'pregnant', 'breastfeeding']),
    healthCondition: healthConditionSchema,
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
    fishConsumption: z.enum(['none', 'rarely', 'monthly', 'weekly', 'multiple_weekly']),
    currentOmega3Intake: z.number({ invalid_type_error: 'Enter current intake in mg' }).min(0).max(5000).optional(),
  })
  .refine(
    ({ gender, pregnancyStatus }) => {
      if (pregnancyStatus !== 'not_pregnant') return gender === 'female';
      return true;
    },
    { message: 'Pregnancy and breastfeeding apply to females only.', path: ['pregnancyStatus'] },
  );

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  epa: number;
  dha: number;
  total: number;
  status: 'adequate' | 'insufficient' | 'deficient' | 'excessive';
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  {
    label: 'Age & Gender',
    description: 'Omega-3 requirements vary by age and gender. Adults typically need 1,000–1,500 mg total (EPA + DHA) daily, with men needing slightly more.',
  },
  {
    label: 'Pregnancy Status',
    description: 'Pregnant and breastfeeding women need additional DHA (200–300 mg extra) for fetal brain development and breast milk production.',
  },
  {
    label: 'Health Condition',
    description: 'Certain conditions (heart disease, depression, arthritis) may benefit from higher omega-3 intake for therapeutic effects.',
  },
  {
    label: 'Fish Consumption',
    description: 'Regular fish consumption (2+ servings per week) significantly reduces supplemental omega-3 needs. Those who never eat fish need more from supplements.',
  },
  {
    label: 'Current Intake (optional)',
    description: 'Enter your usual daily omega-3 intake from food and supplements to compare with the recommended target.',
  },
];

const faqs: [string, string][] = [
  [
    'What are omega-3 fatty acids?',
    'Omega-3s are essential polyunsaturated fats your body cannot produce. The main types are EPA (heart/brain), DHA (brain/eye), and ALA (plant sources that convert to EPA/DHA).',
  ],
  [
    'How much omega-3 do adults need each day?',
    'Most adults need 1,000–1,500 mg total (EPA + DHA) daily. Men typically need slightly more (1,000–1,500 mg) than women (800–1,200 mg). Higher intakes may benefit those with heart disease or inflammation.',
  ],
  [
    'What is the difference between EPA and DHA?',
    'EPA supports cardiovascular health and reduces inflammation. DHA is critical for brain function, eye health, and fetal development. Both are found in fatty fish and fish oil supplements.',
  ],
  [
    'Which foods are highest in omega-3?',
    'Fatty fish (salmon, mackerel, sardines, herring) provide EPA and DHA. Plant sources (flaxseeds, chia seeds, walnuts) provide ALA, which converts to EPA/DHA at low rates (5–10%).',
  ],
  [
    'Can I get enough omega-3 from plants alone?',
    'Plant sources (ALA) convert poorly to EPA/DHA. Vegans should consider algae oil supplements (rich in DHA) or focus on maximizing ALA intake from flax, chia, and walnuts.',
  ],
  [
    'Do omega-3 supplements have side effects?',
    'High doses (>3,000 mg/day) may cause fishy aftertaste, gastrointestinal upset, or increased bleeding risk. Start with lower doses and take with meals to minimize side effects.',
  ],
  [
    'How do omega-3s benefit heart health?',
    'Omega-3s reduce triglycerides, lower blood pressure, decrease inflammation, and may reduce arrhythmia risk. The American Heart Association recommends 1,000 mg/day for heart disease prevention.',
  ],
  [
    'Can omega-3 help with depression?',
    'Some studies suggest EPA-rich omega-3 supplements may support mood and reduce depressive symptoms, especially when combined with standard treatments. Consult a healthcare provider.',
  ],
  [
    'Should pregnant women take omega-3 supplements?',
    'Yes. Pregnant and breastfeeding women need 200–300 mg additional DHA daily for fetal brain development. Choose high-quality, purified fish oil or algae supplements to avoid contaminants.',
  ],
  [
    'How often should I reassess my omega-3 intake?',
    'Review every few months or when health conditions, fish consumption patterns, or pregnancy status changes. Blood omega-3 index testing can assess actual tissue levels.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track current omega-3 intake for 3–5 days; note fish consumption, supplements, and plant sources (ALA).' },
  { week: 2, focus: 'Add one serving of fatty fish (salmon, mackerel, sardines) per week, or begin a high-quality omega-3 supplement.' },
  { week: 3, focus: 'If using supplements, start with 500–1,000 mg total (EPA + DHA) and take with meals to minimize side effects.' },
  { week: 4, focus: 'Evaluate fish consumption—aim for 2–3 servings per week of low-mercury fatty fish for optimal EPA/DHA intake.' },
  { week: 5, focus: 'For vegetarians/vegans, consider algae oil supplements (DHA) and maximize ALA from flax, chia, and walnuts.' },
  { week: 6, focus: 'Monitor for benefits: improved mood, reduced inflammation, better skin, or cardiovascular markers if tracking.' },
  { week: 7, focus: 'Review supplement quality—choose third-party tested products with high EPA/DHA content and low oxidation.' },
  { week: 8, focus: 'Reassess intake, adjust based on health goals, and plan long-term maintenance habits (diet + supplements as needed).' },
];

const warningSigns = () => [
  'High-dose omega-3 supplements (>3,000 mg/day) may increase bleeding risk, especially when combined with blood-thinning medications—consult a healthcare provider.',
  'Choose high-quality, purified fish oil supplements to avoid contaminants (mercury, PCBs). Pregnant women should prioritize algae-based DHA or purified fish oil.',
  'Omega-3 supplements can interact with blood-thinning medications (warfarin, aspirin) and some cholesterol-lowering drugs—discuss with your healthcare provider before use.',
];

const calculateOmega3Requirement = (values: FormValues): ResultPayload => {
  let weightKg = values.weight;
  if (values.unit === 'imperial') {
    weightKg = values.weight * 0.453592;
  }

  let baseEPA = 0;
  let baseDHA = 0;

  if (values.age < 2) {
    baseDHA = 100;
    baseEPA = 50;
  } else if (values.age < 18) {
    baseDHA = 200;
    baseEPA = 100;
  } else {
    if (values.gender === 'male') {
      baseDHA = 1000;
      baseEPA = 500;
    } else {
      baseDHA = 800;
      baseEPA = 400;
    }
  }

  if (values.pregnancyStatus === 'pregnant') {
    baseDHA += 200;
    baseEPA += 100;
  } else if (values.pregnancyStatus === 'breastfeeding') {
    baseDHA += 300;
    baseEPA += 150;
  }

  let healthMultiplier = 1;
  if (values.healthCondition === 'heart_disease') {
    healthMultiplier = 1.5;
  } else if (values.healthCondition === 'diabetes') {
    healthMultiplier = 1.3;
  } else if (values.healthCondition === 'arthritis') {
    healthMultiplier = 1.4;
  } else if (values.healthCondition === 'depression' || values.healthCondition === 'adhd') {
    healthMultiplier = 1.6;
  }

  let activityMultiplier = 1;
  if (values.activityLevel === 'very_active') {
    activityMultiplier = 1.2;
  } else if (values.activityLevel === 'active') {
    activityMultiplier = 1.1;
  }

  let fishMultiplier = 1;
  if (values.fishConsumption === 'none') {
    fishMultiplier = 1.5;
  } else if (values.fishConsumption === 'rarely') {
    fishMultiplier = 1.3;
  } else if (values.fishConsumption === 'monthly') {
    fishMultiplier = 1.1;
  } else if (values.fishConsumption === 'weekly') {
    fishMultiplier = 0.8;
  } else if (values.fishConsumption === 'multiple_weekly') {
    fishMultiplier = 0.6;
  }

  const finalEPA = Math.round(baseEPA * healthMultiplier * activityMultiplier * fishMultiplier);
  const finalDHA = Math.round(baseDHA * healthMultiplier * activityMultiplier * fishMultiplier);
  const finalTotal = finalEPA + finalDHA;

  let status: 'adequate' | 'insufficient' | 'deficient' | 'excessive' = 'adequate';
  let interpretation = 'Your omega-3 intake appears to be within the recommended range for your profile.';

  if (values.currentOmega3Intake && values.currentOmega3Intake > 0) {
    const percentage = (values.currentOmega3Intake / finalTotal) * 100;

    if (percentage < 50) {
      status = 'deficient';
      interpretation = 'Your omega-3 intake is significantly below recommended levels. Increase through diet and consider high-dose supplements.';
    } else if (percentage < 80) {
      status = 'insufficient';
      interpretation = 'Your omega-3 intake is below optimal levels. Moderate increases through food or supplements are recommended.';
    } else if (percentage > 150) {
      status = 'excessive';
      interpretation = 'Your omega-3 intake may be higher than necessary. Review supplement doses to avoid potential side effects.';
    } else {
      interpretation = 'Your omega-3 intake aligns with recommendations. Maintain regular fish consumption or supplements as needed.';
    }
  }

  const recommendations: string[] = [];
  if (status === 'deficient') {
    recommendations.push('Significantly increase omega-3 intake through diet and supplements (1,000–2,000 mg daily).');
    recommendations.push('Consider high-dose omega-3 supplements and increase fatty fish consumption to 2–3 servings per week.');
  } else if (status === 'insufficient') {
    recommendations.push('Moderately increase omega-3 intake through food or supplements (500–1,000 mg daily).');
    recommendations.push('Add one serving of fatty fish per week or begin a moderate-dose omega-3 supplement.');
  } else if (status === 'excessive') {
    recommendations.push('Reduce omega-3 intake to avoid potential side effects—review supplement labels and adjust doses.');
    recommendations.push('Consult a healthcare provider about optimal dosage, especially if taking blood-thinning medications.');
  } else {
    recommendations.push('Maintain current omega-3 intake levels through regular fish consumption and/or supplements.');
    recommendations.push('Continue 2–3 servings of fatty fish per week or equivalent supplement doses.');
  }

  if (values.fishConsumption === 'none' || values.fishConsumption === 'rarely') {
    recommendations.push('Increase fish consumption to 2–3 servings per week, focusing on low-mercury fatty fish (salmon, sardines, mackerel).');
    recommendations.push('If avoiding fish, consider high-quality algae oil supplements (DHA) or maximize plant ALA sources (flax, chia, walnuts).');
  }

  if (values.healthCondition === 'heart_disease') {
    recommendations.push('Higher omega-3 intake (1,000–2,000 mg/day) may reduce cardiovascular risk—discuss with your healthcare provider.');
  }
  if (values.healthCondition === 'depression') {
    recommendations.push('EPA-rich omega-3 supplements may support mental health—consider 1,000–2,000 mg EPA daily under medical guidance.');
  }
  if (values.healthCondition === 'arthritis') {
    recommendations.push('Omega-3 has anti-inflammatory properties for joint health—aim for 1,000–2,000 mg total daily.');
  }

  return {
    epa: finalEPA,
    dha: finalDHA,
    total: finalTotal,
    status,
    interpretation,
    recommendations,
    warningSigns: warningSigns(),
    plan: plan(),
  };
};

export default function Omega3DailyRequirementCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      unit: 'metric',
      pregnancyStatus: 'not_pregnant',
      healthCondition: 'none',
      activityLevel: undefined,
      fishConsumption: undefined,
      currentOmega3Intake: undefined,
    },
  });

  const gender = form.watch('gender');
  const unit = form.watch('unit');

  useEffect(() => {
    if (gender === 'male') {
      form.setValue('pregnancyStatus', 'not_pregnant', { shouldValidate: false, shouldDirty: false });
    }
  }, [gender, form]);

  const onSubmit = (values: FormValues) => {
    setResult(calculateOmega3Requirement(values));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Fish className="h-5 w-5" /> Omega-3 Daily Requirement Calculator</CardTitle>
          <CardDescription>Estimate your personalized omega-3 (EPA + DHA) needs based on age, health status, and fish consumption.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
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
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit System</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="metric">Metric (kg)</SelectItem>
                        <SelectItem value="imperial">Imperial (lbs)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {gender === 'female' && (
                  <FormField control={form.control} name="pregnancyStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pregnancy Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pregnancy status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_pregnant">Not Pregnant</SelectItem>
                          <SelectItem value="pregnant">Pregnant</SelectItem>
                          <SelectItem value="breastfeeding">Breastfeeding</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <FormField control={form.control} name="healthCondition" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Condition</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select health condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="heart_disease">Heart Disease</SelectItem>
                        <SelectItem value="diabetes">Diabetes</SelectItem>
                        <SelectItem value="arthritis">Arthritis</SelectItem>
                        <SelectItem value="depression">Depression</SelectItem>
                        <SelectItem value="adhd">ADHD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light Activity</SelectItem>
                        <SelectItem value="moderate">Moderate Activity</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="fishConsumption" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fish Consumption</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How often do you eat fish?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Never</SelectItem>
                        <SelectItem value="rarely">Rarely (few times per year)</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="multiple_weekly">Multiple times per week</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentOmega3Intake" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Omega-3 Intake (mg/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="10"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Omega-3 Requirements</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Omega-3 Daily Requirements</CardTitle></div>
              <CardDescription>Personalized EPA and DHA targets based on your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">EPA</h4>
                  <p className="text-2xl font-bold text-primary">{result.epa} mg</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">DHA</h4>
                  <p className="text-2xl font-bold text-primary">{result.dha} mg</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Total Omega-3</h4>
                  <p className="text-2xl font-bold text-primary">{result.total} mg</p>
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                result.status === 'adequate' ? 'bg-green-50 border-green-200' :
                result.status === 'insufficient' ? 'bg-orange-50 border-orange-200' :
                result.status === 'deficient' ? 'bg-red-50 border-red-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`font-semibold ${
                  result.status === 'adequate' ? 'text-green-600' :
                  result.status === 'insufficient' ? 'text-orange-600' :
                  result.status === 'deficient' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {result.status === 'adequate' && 'Adequate Intake'}
                  {result.status === 'insufficient' && 'Insufficient Intake'}
                  {result.status === 'deficient' && 'Deficient Intake'}
                  {result.status === 'excessive' && 'Excessive Intake'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Warning Signs & Precautions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warningSigns.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Omega-3 Optimization Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Week</th>
                      <th className="text-left p-2">Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.plan.map(({ week, focus }) => (
                      <tr key={week} className="border-b">
                        <td className="p-2">{week}</td>
                        <td className="p-2">{focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Collect accurate information for meaningful results</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {understandingInputs.map((item, index) => (
              <li key={index}>
                <span className="font-semibold text-foreground">{item.label}:</span>
                <span className="text-sm text-muted-foreground"> {item.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Build a comprehensive nutrition strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/fat-intake-calculator" className="text-primary hover:underline">
                  Fat Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Balance omega-3 with overall fat intake for optimal health.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                  Macro Ratio Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Integrate omega-3 goals into your overall macronutrient plan.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary hover:underline">
                  Vitamin D Sun Exposure Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Pair omega-3 with vitamin D for comprehensive health support.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary hover:underline">
                  Magnesium Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Support overall nutrient balance alongside omega-3 optimization.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Mastering Omega-3 Intake</CardTitle>
          <CardDescription>Evidence-based strategies for cardiovascular and brain health</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Omega-3 fatty acids (EPA and DHA) are essential for heart health, brain function, and reducing inflammation. Most adults need 1,000–1,500 mg total daily. Fatty fish (salmon, mackerel, sardines) provide the best sources. Those who don't eat fish should consider high-quality supplements or algae oil (for vegans).
          </p>
          <p>
            Pregnant and breastfeeding women need additional DHA (200–300 mg extra) for fetal brain development. Higher intakes (1,000–2,000 mg/day) may benefit those with heart disease, depression, or arthritis. Choose purified, third-party tested supplements to avoid contaminants.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Omega-3 fundamentals and best practices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map(([question, answer], index) => (
            <div key={index}>
              <h4 className="font-semibold mb-1">{question}</h4>
              <p className="text-sm text-muted-foreground">{answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
