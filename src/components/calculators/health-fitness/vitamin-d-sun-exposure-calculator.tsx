'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Sun, Activity, Calendar, ShieldAlert } from 'lucide-react';

const formSchema = z.object({
  skinType: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI']).optional(),
  uvIndex: z.number().min(1).max(12).optional(),
  exposedArea: z.number().min(5).max(100).optional(),
  minutes: z.number().min(1).max(180).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  estimatedIU: number;
  exposureCategory: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const skinFactorMap: Record<NonNullable<FormValues['skinType']>, number> = {
  I: 1,
  II: 0.85,
  III: 0.7,
  IV: 0.55,
  V: 0.4,
  VI: 0.3,
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track current sun exposure habits and note skin response (pinkness, burning).' },
  { week: 2, focus: 'Add two controlled midday sessions per week based on calculator guidance.' },
  { week: 3, focus: 'Introduce light exposure to additional skin areas while applying sunscreen after target time.' },
  { week: 4, focus: 'Record Vitamin D-rich foods and evaluate supplementation with a professional if needed.' },
  { week: 5, focus: 'Balance sun exposure with shade breaks and hydration on warmer days.' },
  { week: 6, focus: 'Schedule dermatologist-approved skin check; review for new moles or changes.' },
  { week: 7, focus: 'Adjust exposure for seasonal UV shifts using updated UV index forecasts.' },
  { week: 8, focus: 'Review overall energy, mood, and lab values (if available) to fine-tune routine.' },
];

const faqs: [string, string][] = [
  ['How accurate is this Vitamin D estimate?', 'The calculator provides an educational approximation based on UV index, skin type, and exposed area. Actual Vitamin D synthesis varies with factors like latitude, altitude, season, ozone, and individual biology.'],
  ['What is the Fitzpatrick skin type scale?', 'It classifies skin tones (I–VI) based on how easily skin burns or tans. Type I burns very easily, while Type VI rarely burns. Selecting the correct type informs how quickly you may synthesize Vitamin D.'],
  ['Does sunscreen block Vitamin D?', 'Broad-spectrum sunscreen (SPF 15+) can reduce UVB penetration by 90% or more. Apply sunscreen after you have met your target exposure to balance Vitamin D production and skin protection.'],
  ['Can I get Vitamin D through windows?', 'No. Window glass blocks nearly all UVB rays needed for Vitamin D synthesis. You must receive direct outdoor sunlight, ideally when your shadow is shorter than your height.'],
  ['Is midday sun really the best time?', 'Midday (10 a.m. – 2 p.m.) delivers the strongest UVB rays, meaning shorter exposure times generate more Vitamin D. Limit sessions to avoid burning and follow sun-safe practices.'],
  ['How do clouds or pollution affect results?', 'Cloud cover, smog, and high humidity scatter or absorb UVB rays, reducing Vitamin D production. On overcast days you may need longer exposure or supplementation.'],
  ['Do darker skin tones need more sun?', 'Yes. Higher melanin levels reduce UVB penetration, so darker skin types typically require longer exposure to produce the same Vitamin D as lighter skin.'],
  ['Should I rely solely on sunlight for Vitamin D?', 'Not necessarily. Diet (fatty fish, fortified dairy) and supplements can help, especially in winter or in regions with low UV. Consult healthcare providers for lab testing and guidance.'],
  ['Can I overdose on Vitamin D from sunlight?', 'Your skin’s production self-regulates; it stops synthesizing Vitamin D once enough previtamin D3 accumulates. However, excessive sun increases burn and skin cancer risk, so practice moderation.'],
  ['How often should I recalculate exposure?', 'Update inputs whenever the season, latitude, UV index, or skin coverage changes. Reassessing every few weeks keeps your plan aligned with real-world conditions.'],
];

const understandingInputs = [
  { label: 'Skin Type (Fitzpatrick)', description: 'Select the option that best matches how easily your skin burns or tans. This influences how rapidly you synthesize Vitamin D.' },
  { label: 'UV Index', description: 'Use the local UV index forecast (1–12). Higher values signify stronger UVB rays and faster Vitamin D production.' },
  { label: 'Exposed Skin (%)', description: 'Estimate the percentage of skin uncovered (e.g., face & arms ≈ 20–25%). Larger exposed areas generate more Vitamin D.' },
  { label: 'Minutes Outdoors', description: 'Enter the uninterrupted outdoor exposure duration without high-SPF sunscreen. Remain vigilant for any early signs of burning.' },
];

const warningSigns = () => [
  'Never exceed the point where skin begins to redden or feel hot—sunburn dramatically increases skin cancer risk.',
  'Individuals with a history of skin cancer, photosensitivity disorders, or on photosensitizing medications must consult healthcare providers before adjusting sun exposure.',
  'Infants under six months should avoid direct sunlight; use protective clothing and shade instead.',
];

const recommendations = (exposureCategory: string) => {
  const base = [
    'Apply broad-spectrum sunscreen immediately after reaching your planned sun dose.',
    'Hydrate adequately, especially in warm climates or during longer outdoor sessions.',
    'Complement sun exposure with dietary Vitamin D sources such as fatty fish, eggs, or fortified foods.',
  ];

  if (exposureCategory === 'Minimal') {
    return [
      ...base,
      'Consider increasing exposure time gradually by 2–3 minutes while monitoring skin response.',
      'If UV index is consistently low, discuss supplementation with a healthcare provider.',
    ];
  }

  if (exposureCategory === 'Balanced') {
    return [
      ...base,
      'Maintain current routine and track seasonal UV index changes.',
      'Rotate body position to distribute UV exposure evenly and reduce localized burns.',
    ];
  }

  return [
    ...base,
    'Limit sessions to avoid overexposure; split time into shorter intervals if necessary.',
    'Use protective clothing, hats, and shade breaks once target Vitamin D exposure is achieved.',
  ];
};

const interpretExposure = (estimatedIU: number) => {
  if (estimatedIU < 600) {
    return { category: 'Minimal', message: 'Sun exposure likely produced a modest Vitamin D dose. Increase exposure carefully or supplement as advised.' };
  }
  if (estimatedIU < 1500) {
    return { category: 'Balanced', message: 'Exposure falls within a commonly recommended range for supporting Vitamin D status while minimizing burn risk.' };
  }
  return { category: 'High', message: 'Sunlight dose appears substantial. Ensure you are not approaching burn thresholds and plan ample recovery days.' };
};

const calculateVitaminD = (values: FormValues) => {
  if (!values.skinType || !values.uvIndex || !values.exposedArea || !values.minutes) return null;

  const skinFactor = skinFactorMap[values.skinType];
  const uvFactor = values.uvIndex / 10;
  const areaFactor = values.exposedArea / 25;
  const timeFactor = values.minutes / 15;
  const estimatedIU = Math.round(1000 * skinFactor * uvFactor * areaFactor * timeFactor);

  const exposure = interpretExposure(estimatedIU);

  return {
    estimatedIU,
    exposureCategory: exposure.category,
    interpretation: exposure.message,
    recommendations: recommendations(exposure.category),
    warningSigns: warningSigns(),
    plan: plan(),
  } satisfies ResultPayload;
};

export default function VitaminDSunExposureCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skinType: undefined,
      uvIndex: undefined,
      exposedArea: undefined,
      minutes: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateVitaminD(values);
    if (!calc) {
      setResult(null);
      return;
    }
    setResult(calc);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5" /> Vitamin D Sun Exposure Calculator</CardTitle>
          <CardDescription>Estimate Vitamin D production from sunlight based on skin type, UV index, exposed area, and time outdoors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="skinType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skin Type (Fitzpatrick)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skin type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="I">Type I – Very fair, always burns</SelectItem>
                        <SelectItem value="II">Type II – Fair, usually burns</SelectItem>
                        <SelectItem value="III">Type III – Medium, sometimes burns</SelectItem>
                        <SelectItem value="IV">Type IV – Olive, rarely burns</SelectItem>
                        <SelectItem value="V">Type V – Brown, very rarely burns</SelectItem>
                        <SelectItem value="VI">Type VI – Dark brown/black, almost never burns</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="uvIndex" render={({ field }) => (
                  <FormItem>
                    <FormLabel>UV Index (1–12)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="exposedArea" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exposed Skin (% of body)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="minutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exposure Time (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Vitamin D Production</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Vitamin D Exposure Summary</CardTitle></div>
              <CardDescription>Approximate synthesis for the provided session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Estimated Vitamin D</h4>
                  <p className="text-2xl font-bold text-primary">{result.estimatedIU.toLocaleString()} IU</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Exposure Category</h4>
                  <p className="text-lg font-bold text-primary">{result.exposureCategory}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Session Length</h4>
                  <p className="text-lg font-bold text-primary">{form.getValues('minutes') ?? 0} minutes</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs & Precautions</CardTitle></CardHeader>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Sunlight Strategy</CardTitle></CardHeader>
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
          <CardDescription>Collect accurate data for safe and effective sun exposure</CardDescription>
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
          <CardDescription>Build a comprehensive nutrient and wellness strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary hover:underline">Calcium Intake Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Ensure strong bones by pairing Vitamin D with adequate calcium.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary hover:underline">Magnesium Intake Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Support Vitamin D metabolism with optimal magnesium levels.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/neat-calculator" className="text-primary hover:underline">NEAT (Daily Movement) Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Track non-exercise activity that complements outdoor time.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/liver-fat-nafld-risk-calculator" className="text-primary hover:underline">Liver Fat (NAFLD) Risk Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Monitor metabolic health factors that interact with Vitamin D status.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Safe Sun Exposure for Vitamin D</CardTitle>
          <CardDescription>Key concepts for balancing Vitamin D benefits and sun safety</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Vitamin D is essential for bone health, immune function, and mood regulation. Sun exposure remains the most efficient natural source, yet it must be balanced with diligent skin protection. Focus on short, controlled midday sessions, cover or protect skin after reaching your target dose, and combine lifestyle strategies like diet and supplementation as recommended by healthcare professionals.</p>
          <p>Keep detailed notes on how your skin responds to different UV index values, adjust for seasonal changes, and schedule routine skin checks. Remember that Vitamin D requirements vary with age, medical history, and geographic location, so personalize your plan with professional guidance whenever possible.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Sunlight, Vitamin D, and safety basics</CardDescription>
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