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
import { Ruler, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  height: z.number().positive('Height must be positive'),
  weight: z.number().positive('Weight must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  formula: z.enum(['mosteller', 'du_bois', 'haycock', 'gehan_george']),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  bsa: number;
  bsaPerKg: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  clinicalSignificance: string[];
  applications: string[];
  comparison: {
    average: number;
    percentile: string;
  };
};

const understandingInputs = [
  {
    label: 'Height & Weight',
    description: 'Body measurements used to calculate BSA. Height and weight are the primary inputs for all BSA formulas. Use accurate, consistent measurements.',
  },
  {
    label: 'BSA Formula',
    description: 'Different formulas (Mosteller, Du Bois, Haycock, Gehan & George) may yield slightly different results. Mosteller is most commonly used in clinical practice.',
  },
  {
    label: 'Gender',
    description: 'Men typically have larger BSA than women due to generally larger body size. Average adult male BSA is ~1.9 m², while average adult female BSA is ~1.7 m².',
  },
  {
    label: 'Age',
    description: 'BSA changes with growth and aging. Children have smaller BSA that increases with growth. Adults may see slight decreases in BSA with age due to height loss.',
  },
];

const faqs: [string, string][] = [
  [
    'What is Body Surface Area (BSA)?',
    'BSA is the total surface area of the human body, calculated in square meters (m²). It\'s used in medicine for calculating drug dosages, determining fluid requirements, and normalizing physiological parameters.',
  ],
  [
    'Which BSA formula should I use?',
    'The Mosteller formula is most commonly used in clinical practice due to its simplicity and accuracy. Different formulas may yield slightly different results, but all provide reasonable estimates for medical applications.',
  ],
  [
    'What is a normal BSA range?',
    'For adult males, normal BSA ranges from 1.7-2.1 m² (average ~1.9 m²). For adult females, normal BSA ranges from 1.5-1.9 m² (average ~1.7 m²). Children have smaller BSA that increases with growth.',
  ],
  [
    'Why is BSA important in medicine?',
    'BSA provides a more accurate way to normalize measurements across individuals of different sizes than body weight alone. It\'s used for drug dosing (especially chemotherapy), burn assessment, fluid resuscitation, and cardiac function evaluation.',
  ],
  [
    'How is BSA different from BMI?',
    'BSA measures total body surface area (m²), while BMI measures body mass relative to height (kg/m²). BSA is used for medical dosing and clinical calculations, while BMI is used for assessing body weight status.',
  ],
  [
    'Can BSA change over time?',
    'Yes. BSA increases with growth in children and adolescents. In adults, BSA may decrease slightly with age due to height loss, or change with significant weight gain or loss.',
  ],
  [
    'Is BSA used for medication dosing?',
    'Yes, many medications, especially chemotherapy drugs, are dosed per m² of BSA rather than per kg of body weight. This provides more accurate dosing across different body sizes.',
  ],
  [
    'How accurate are BSA formulas?',
    'BSA formulas provide estimates, not exact measurements. They may not account for body shape variations and are less accurate in extreme cases (very tall/short, very heavy/thin). Clinical judgment is always important.',
  ],
  [
    'What is BSA used for in burn patients?',
    'Burn severity is often expressed as a percentage of total BSA. This helps determine fluid resuscitation needs, prognosis, and treatment planning for burn injuries.',
  ],
  [
    'Can I calculate BSA at home?',
    'Yes, BSA can be calculated using height and weight measurements. However, for medical purposes (drug dosing, clinical decisions), BSA should be calculated and verified by healthcare professionals.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Understand your BSA: calculate and record your current BSA using accurate height and weight measurements.' },
  { week: 2, focus: 'If BSA is significantly outside normal range, consult with a healthcare provider to discuss implications and any necessary interventions.' },
  { week: 3, focus: 'For medical purposes: ensure BSA is calculated by healthcare professionals for accurate drug dosing and clinical decisions.' },
  { week: 4, focus: 'Monitor changes: track BSA over time if undergoing significant weight changes or growth (children/adolescents).' },
  { week: 5, focus: 'Understand applications: learn how BSA is used in your specific medical context (if applicable).' },
  { week: 6, focus: 'Maintain accurate records: keep track of height and weight measurements for accurate BSA calculations.' },
  { week: 7, focus: 'Review with healthcare provider: discuss BSA results and any concerns with your healthcare team.' },
  { week: 8, focus: 'Long-term monitoring: continue tracking body measurements and BSA as part of overall health assessment.' },
];

const warningSigns = () => [
  'BSA calculations are estimates and should not replace professional medical assessment. Always consult healthcare providers for medical decisions.',
  'Extreme BSA values (very high or very low) may indicate underlying health conditions and should be evaluated by a healthcare professional.',
  'For medication dosing, BSA must be calculated and verified by healthcare professionals. Never self-dose medications based on BSA calculations.',
];

const getRecommendations = (bsa: number, gender: string, age: number) => {
  let averageBSA = gender === 'male' ? 1.9 : 1.7;
  if (age < 18) {
    averageBSA = gender === 'male' ? 1.2 + (age * 0.05) : 1.1 + (age * 0.04);
  }
  const difference = ((bsa - averageBSA) / averageBSA) * 100;

  if (Math.abs(difference) < 5) {
    return [
      'Your BSA is within normal range—maintain healthy lifestyle and body composition',
      'Continue regular health monitoring and checkups',
      'Keep accurate records of height and weight for future BSA calculations',
      'Understand how BSA may be used in medical contexts if needed',
    ];
  } else if (difference > 10) {
    return [
      'BSA is significantly above average—discuss with healthcare provider',
      'Consider factors contributing to larger body size (height, weight, body composition)',
      'Focus on maintaining healthy body composition and lifestyle',
      'Ensure BSA is accurately calculated for any medical applications',
    ];
  } else if (difference < -10) {
    return [
      'BSA is below average—ensure adequate nutrition and healthy body weight',
      'Consult with healthcare provider to rule out underlying health conditions',
      'Focus on maintaining healthy body composition',
      'Monitor growth and development (if applicable)',
    ];
  } else {
    return [
      'BSA is slightly outside average range—this is within normal variation',
      'Continue maintaining healthy lifestyle and body composition',
      'Monitor changes over time',
      'Consult healthcare provider if concerned about body size or composition',
    ];
  }
};

export default function BodySurfaceAreaCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
      gender: undefined,
      age: undefined,
      formula: 'mosteller',
      unitSystem: 'metric',
    },
  });

  const calculateBSA = (height: number, weight: number, formula: string, unitSystem: string) => {
    let h = height;
    let w = weight;

    // Convert to metric if needed
    if (unitSystem === 'imperial') {
      h = height * 2.54; // inches to cm
      w = weight * 0.453592; // pounds to kg
    }

    let bsa = 0;

    switch (formula) {
      case 'mosteller':
        // Mosteller formula: √((height × weight) / 3600)
        bsa = Math.sqrt((h * w) / 3600);
        break;
      case 'du_bois':
        // Du Bois formula: 0.007184 × height^0.725 × weight^0.425
        bsa = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
        break;
      case 'haycock':
        // Haycock formula: 0.024265 × height^0.3964 × weight^0.5378
        bsa = 0.024265 * Math.pow(h, 0.3964) * Math.pow(w, 0.5378);
        break;
      case 'gehan_george':
        // Gehan & George formula: 0.0235 × height^0.42246 × weight^0.51456
        bsa = 0.0235 * Math.pow(h, 0.42246) * Math.pow(w, 0.51456);
        break;
      default:
        bsa = Math.sqrt((h * w) / 3600); // Default to Mosteller
    }

    return Math.round(bsa * 10000) / 10000; // Round to 4 decimal places
  };

  const getBSAInterpretation = (bsa: number, gender: string, age: number) => {
    let averageBSA = 0;
    
    // Average BSA by gender and age
    if (gender === 'male') {
      if (age < 18) averageBSA = 1.2 + (age * 0.05);
      else if (age < 30) averageBSA = 1.9;
      else if (age < 50) averageBSA = 1.95;
      else averageBSA = 1.9;
    } else {
      if (age < 18) averageBSA = 1.1 + (age * 0.04);
      else if (age < 30) averageBSA = 1.7;
      else if (age < 50) averageBSA = 1.75;
      else averageBSA = 1.7;
    }

    const difference = ((bsa - averageBSA) / averageBSA) * 100;

    if (Math.abs(difference) < 5) {
      return `Your BSA is within the normal range for your age and gender. This indicates a healthy body size and proportion.`;
    } else if (difference > 10) {
      return `Your BSA is significantly above average, which may indicate a larger body frame or higher body weight. Consider discussing with a healthcare provider.`;
    } else if (difference < -10) {
      return `Your BSA is below average, which may indicate a smaller body frame or lower body weight. Ensure you're maintaining adequate nutrition.`;
    } else {
      return `Your BSA is slightly ${difference > 0 ? 'above' : 'below'} average, which is within normal variation for body size and composition.`;
    }
  };

  const getPercentile = (bsa: number, gender: string, age: number) => {
    // Simplified percentile estimation based on typical BSA distributions
    let averageBSA = 0;
    let stdDev = 0;

    if (gender === 'male') {
      if (age < 18) {
        averageBSA = 1.2 + (age * 0.05);
        stdDev = 0.15;
      } else {
        averageBSA = 1.9;
        stdDev = 0.2;
      }
    } else {
      if (age < 18) {
        averageBSA = 1.1 + (age * 0.04);
        stdDev = 0.12;
      } else {
        averageBSA = 1.7;
        stdDev = 0.18;
      }
    }

    const zScore = (bsa - averageBSA) / stdDev;
    
    if (zScore > 2) return '95th+ percentile';
    if (zScore > 1.5) return '90th-95th percentile';
    if (zScore > 1) return '80th-90th percentile';
    if (zScore > 0.5) return '60th-80th percentile';
    if (zScore > 0) return '50th-60th percentile';
    if (zScore > -0.5) return '40th-50th percentile';
    if (zScore > -1) return '20th-40th percentile';
    if (zScore > -1.5) return '10th-20th percentile';
    if (zScore > -2) return '5th-10th percentile';
    return 'Below 5th percentile';
  };

  const onSubmit = (values: FormValues) => {
    const bsa = calculateBSA(values.height, values.weight, values.formula, values.unitSystem);
    const bsaPerKg = bsa / values.weight;
    const interpretation = getBSAInterpretation(bsa, values.gender, values.age);
    const percentile = getPercentile(bsa, values.gender, values.age);

    const clinicalSignificance = [
      'Used for calculating drug dosages in chemotherapy and other medications',
      'Important for determining fluid requirements in burn patients',
      'Used in cardiology for calculating cardiac index and other hemodynamic parameters',
      'Essential for pediatric dosing calculations',
      'Used in research studies for normalizing metabolic parameters',
      'Important for determining appropriate ventilator settings in critical care'
    ];

    const applications = [
      'Medical dosing calculations for medications',
      'Burn injury assessment and fluid resuscitation',
      'Cardiovascular function assessment',
      'Metabolic rate calculations',
      'Research study normalization',
      'Pediatric growth and development assessment'
    ];

    const averageBSA = values.gender === 'male' ? 1.9 : 1.7;

    setResult({
      bsa,
      bsaPerKg: Math.round(bsaPerKg * 10000) / 10000,
      interpretation,
      recommendations: getRecommendations(bsa, values.gender, values.age),
      warningSigns: warningSigns(),
      plan: plan(),
      clinicalSignificance,
      applications,
      comparison: {
        average: averageBSA,
        percentile,
      },
    });
  };

  const unit = form.watch('unitSystem');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5" /> Body Surface Area (BSA) Calculator</CardTitle>
          <CardDescription>Calculate your body surface area using validated formulas for medical dosing, burn assessment, and clinical applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="unitSystem" render={({ field }) => (
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
                )} />
                <FormField control={form.control} name="formula" render={({ field }) => (
                  <FormItem>
                    <FormLabel>BSA Formula</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select formula" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mosteller">Mosteller (Most Common)</SelectItem>
                        <SelectItem value="du_bois">Du Bois</SelectItem>
                        <SelectItem value="haycock">Haycock</SelectItem>
                        <SelectItem value="gehan_george">Gehan & George</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
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
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Body Surface Area</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Body Surface Area (BSA) Results</CardTitle></div>
              <CardDescription>Your BSA calculation and clinical interpretation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.bsa} m²</p>
                  <p className="text-sm text-muted-foreground">Body Surface Area</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.bsaPerKg} m²/kg</p>
                  <p className="text-sm text-muted-foreground">BSA per kg Body Weight</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.comparison.percentile}</p>
                  <p className="text-sm text-muted-foreground">Percentile Rank</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
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
              <CardTitle>Clinical Significance & Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Clinical Significance:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {result.clinicalSignificance.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Medical Applications:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {result.applications.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week BSA Monitoring Plan</CardTitle>
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
          <CardDescription>Collect accurate measurements for meaningful results</CardDescription>
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
          <CardDescription>Build a comprehensive body composition assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                  BMI Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate body mass index to complement BSA assessment.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                  Body Fat Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess body composition alongside BSA measurements.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/ideal-body-weight-calculator" className="text-primary hover:underline">
                  Ideal Body Weight Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Determine ideal weight ranges relative to BSA.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/lean-body-mass-calculator" className="text-primary hover:underline">
                  Lean Body Mass Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate lean body mass to complement BSA analysis.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Body Surface Area</CardTitle>
          <CardDescription>Evidence-based information about BSA and its clinical applications</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Body Surface Area (BSA) is the total surface area of the human body, calculated in square meters (m²). It's a crucial measurement in medicine used for calculating drug dosages, determining fluid requirements, and assessing various physiological parameters. BSA provides a more accurate way to normalize measurements across individuals of different sizes than body weight alone.
          </p>
          <p>
            The Mosteller formula (√((height × weight) / 3600)) is the most commonly used method in clinical practice. Different formulas (Du Bois, Haycock, Gehan & George) may yield slightly different results, but all provide reasonable estimates for medical applications. Normal BSA ranges are approximately 1.7-2.1 m² for adult males and 1.5-1.9 m² for adult females.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about Body Surface Area and its applications</CardDescription>
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

