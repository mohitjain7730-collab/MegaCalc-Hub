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
import { Thermometer, Activity, TrendingUp, CheckCircle, AlertTriangle, Calendar, Waves, Shield } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  restingTemp: z.number().min(35).max(40, 'Resting temperature must be between 35°C and 40°C'),
  exerciseDuration: z.number().positive('Exercise duration must be positive'),
  exerciseIntensity: z.enum(['low', 'moderate', 'high', 'very_high']),
  environmentalTemp: z.number().min(-20).max(50, 'Environmental temperature must be between -20°C and 50°C'),
  humidity: z.number().min(0).max(100, 'Humidity must be between 0% and 100%'),
  clothing: z.enum(['light', 'moderate', 'heavy']),
  hydration: z.enum(['poor', 'adequate', 'excellent']),
  fitnessLevel: z.enum(['poor', 'average', 'good', 'excellent']),
});

type FormValues = z.infer<typeof formSchema>;

const understandingInputs = [
  { label: 'Resting Core Temperature', description: 'Enter your baseline temperature before exercise. Most people sit between 36.1°C and 37.2°C.' },
  { label: 'Exercise Duration', description: 'Total time (in minutes) you expect to exercise. Longer sessions accumulate more heat.' },
  { label: 'Exercise Intensity', description: 'Self-rated intensity. Higher intensity increases metabolic heat production.' },
  { label: 'Environmental Temperature', description: 'Ambient temperature in °C during your session. Hotter conditions limit cooling.' },
  { label: 'Humidity', description: 'Relative humidity (%) influences sweat evaporation efficiency.' },
  { label: 'Clothing Type', description: 'Layering and fabric affect heat dissipation. Heavy gear traps more heat.' },
  { label: 'Hydration Status', description: 'Hydration supports sweating and temperature regulation.' },
  { label: 'Fitness Level', description: 'Well-trained athletes dissipate heat more efficiently.' },
];

const faqs: [string, string][] = [
  ['What is a safe core temperature during exercise?', 'Most people can tolerate increases up to 38.5°C safely. Temperatures between 38.5°C and 39.5°C require caution; above 39.5°C increases heat illness risk.'],
  ['How quickly can core temperature rise?', 'Core temperature can climb 1-2°C within 30-60 minutes of high-intensity exercise, especially in hot or humid environments.'],
  ['Does hydration really lower body temperature?', 'Yes. Adequate hydration supports sweat production and plasma volume, improving heat dissipation during workouts.'],
  ['Why does humidity matter?', 'High humidity slows sweat evaporation, reducing cooling efficiency and causing higher core temperature rises.'],
  ['What clothing is best in the heat?', 'Lightweight, moisture-wicking fabrics in light colors allow airflow and sweat evaporation to keep you cooler.'],
  ['How does fitness level affect heat tolerance?', 'Trained athletes develop better cardiovascular efficiency and sweat response, which helps regulate temperature under stress.'],
  ['Can acclimatization help?', 'Training in hot conditions for 7-14 days improves sweat rate, plasma volume, and temperature control, lowering heat-stress risk.'],
  ['What are early signs of heat stress?', 'Early symptoms include excessive sweating, dizziness, headache, cramps, and unusually high heart rate for the workload.'],
  ['Should I stop exercising if I feel overheated?', 'Yes. Move to shade, hydrate, and cool down with fans or cold towels. Resume training only when symptoms resolve.'],
  ['How often should I monitor temperature?', 'Check temperature trends before and after intense sessions in challenging conditions to establish your personal response.'],
];

const relatedCalculators = [
  { title: 'Hydration Sweat Rate Calculator', href: '/category/health-fitness/hydration-sweat-rate-calculator', description: 'Estimate sweat losses during workouts to plan fluid replacement.' },
  { title: 'Hydration Needs Calculator', href: '/category/health-fitness/hydration-needs-calculator', description: 'Determine daily water intake targets for optimal thermoregulation.' },
  { title: 'Exercise Calorie Burn Calculator', href: '/category/health-fitness/exercise-calorie-burn-calculator', description: 'Understand caloric cost of sessions as intensity changes.' },
  { title: 'Ice Bath Duration & Temperature Calculator', href: '/category/health-fitness/ice-bath-duration-temp-calculator', description: 'Calculate optimal cold exposure protocols for recovery and temperature regulation.' },
];

type GuideSection = { title: string; description: string; bullets?: string[] };

const completeGuideSections: GuideSection[] = [
  {
    title: 'Normal Temperature Ranges',
    description: 'Recognize the thresholds that distinguish normal thermoregulation from heat risk.',
    bullets: ['Resting: 36.1–37.2°C (97–99°F)', 'Exercise: 37.5–39.5°C (99.5–103.1°F)', 'Heat stress risk: >39.5°C (103.1°F)', 'Heat stroke danger: >40.5°C (104.9°F)'],
  },
  {
    title: 'Major Drivers of Temperature Rise',
    description: 'Exercise intensity, duration, environmental heat, humidity, hydration, clothing, and aerobic fitness directly influence heat load.',
  },
  {
    title: 'Practical Cooling Strategies',
    description: 'Prioritize prehydration, shade, evaporative cooling (fans, misting, cold towels), and scheduling hard sessions during cooler hours.',
  },
  {
    title: 'Safety Checklist',
    description: 'Stop exercise if you experience confusion, dizziness, nausea, chills, or cessation of sweating. These are urgent warning signs that require cooling and medical attention.',
  },
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Log baseline resting temperature, hydration habits, and environmental conditions for typical workouts.' },
  { week: 2, focus: 'Introduce structured hydration (500 ml pre-workout, 150-250 ml every 15-20 minutes during exercise).' },
  { week: 3, focus: 'Add cooling strategies—lighter clothing, shade breaks, and chilled towels between intervals.' },
  { week: 4, focus: 'Begin heat acclimatization with short exposures (10-15 minutes) in warmer settings while monitoring symptoms.' },
  { week: 5, focus: 'Refine pacing: alternate high- and moderate-intensity segments to control peak core temperature.' },
  { week: 6, focus: 'Incorporate electrolyte beverages during sessions exceeding 60 minutes or occurring in high humidity.' },
  { week: 7, focus: 'Practice recovery cooling: cold showers, ice packs on pulse points, and post-session hydration targets.' },
  { week: 8, focus: 'Review data trends, adjust training schedule for upcoming climate conditions, and set personalized heat alerts.' },
];

const warningSigns = () => [
  'Core temperature above 39.5°C paired with dizziness or chills requires immediate cooling and medical evaluation.',
  'A sudden stop in sweating, clammy skin, or confusion signals heat stroke risk—call emergency services.',
  'Persistent nausea, rapid heartbeat, or headache after exercise suggests inadequate cooling or hydration.',
  'Individuals with heart disease, sickle cell trait, or certain medications should consult a clinician before hot-weather training.',
];

const getTemperatureInterpretation = (tempRise: number, finalTemp: number, exerciseIntensity: string) => {
  if (finalTemp < 38.5) {
    return {
      category: 'Normal Temperature Response',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Your body is managing heat production effectively for the current workload and environment.',
      recommendations: [
        'Maintain current hydration habits and rest intervals',
        'Track temperature during longer or hotter workouts',
        'Continue gradual warm-ups and cool-downs',
        'Log sessions to understand personal heat thresholds',
      ],
    };
  }

  if (finalTemp < 39.5) {
    return {
      category: 'Elevated Temperature',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: TrendingUp,
      description: 'Temperature is elevated. Increase monitoring and consider modifying pace or environment.',
      recommendations: [
        'Add shade or fan breaks every 15-20 minutes',
        'Increase fluid intake with electrolytes',
        'Lower intensity or shorten intervals temporarily',
        'Watch for dizziness, cramps, or heavy sweating',
      ],
    };
  }

  if (finalTemp < 40.5) {
    return {
      category: 'High Temperature Risk',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: Activity,
      description: 'Heat stress risk is significant. Adjust your plan immediately to prevent heat illness.',
      recommendations: [
        'Stop or reduce exercise until temperature declines',
        'Move to a cooler environment and apply cooling measures',
        'Prioritize hydration with electrolytes and cold fluids',
        'Resume training only after symptoms resolve',
      ],
    };
  }

  return {
    category: 'Dangerous Temperature',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
    description: 'Core temperature is dangerously high. Stop exercise and seek medical attention.',
    recommendations: [
      'Cease activity immediately and begin rapid cooling',
      'Call emergency services if confusion or collapse occurs',
      'Use ice packs, cold water immersion, or fans for cooling',
      'Do not resume exercise until cleared by a clinician',
    ],
  };
};

const calculateTemperatureRise = (data: FormValues) => {
  const intensityMultipliers = {
    low: 0.5,
    moderate: 1.0,
    high: 1.8,
    very_high: 2.5,
  };

  let baseRise = intensityMultipliers[data.exerciseIntensity];

  const durationFactor = Math.min(data.exerciseDuration / 60, 2);
  baseRise *= durationFactor;

  if (data.environmentalTemp > 30) {
    baseRise += (data.environmentalTemp - 30) * 0.1;
  }

  if (data.humidity > 70) {
    baseRise += (data.humidity - 70) * 0.01;
  }

  const clothingMultipliers = { light: 1, moderate: 1.2, heavy: 1.5 };
  baseRise *= clothingMultipliers[data.clothing];

  const hydrationMultipliers = { poor: 1.3, adequate: 1, excellent: 0.8 };
  baseRise *= hydrationMultipliers[data.hydration];

  const fitnessMultipliers = { poor: 1.2, average: 1, good: 0.9, excellent: 0.8 };
  baseRise *= fitnessMultipliers[data.fitnessLevel];

  const finalTemp = data.restingTemp + baseRise;

  return {
    temperatureRise: baseRise,
    finalTemperature: finalTemp,
    heatStressRisk: finalTemp > 39.5 ? 'High' : finalTemp > 38.5 ? 'Moderate' : 'Low',
  };
};

type ResultPayload = {
  temperatureRise: number;
  finalTemperature: number;
  heatStressRisk: string;
  interpretation: ReturnType<typeof getTemperatureInterpretation>;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

export default function CoreBodyTemperatureRiseCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restingTemp: undefined,
      exerciseDuration: undefined,
      exerciseIntensity: undefined,
      environmentalTemp: undefined,
      humidity: undefined,
      clothing: undefined,
      hydration: undefined,
      fitnessLevel: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const tempData = calculateTemperatureRise(values);
    const interpretation = getTemperatureInterpretation(tempData.temperatureRise, tempData.finalTemperature, values.exerciseIntensity);

    setResult({
      ...tempData,
      interpretation,
      recommendations: interpretation.recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  };

  const numberInput = (handler: (value: number | undefined) => void, value: number | undefined) => ({
    value: value ?? '',
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value === '' ? undefined : Number(event.target.value);
      handler(Number.isNaN(next as number) ? undefined : next);
    },
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-primary" />
            Core Body Temperature Rise Calculator
          </CardTitle>
          <CardDescription>Estimate how environmental conditions, exercise intensity, and hydration habits influence heat stress risk.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="restingTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resting Core Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...numberInput(field.onChange, field.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...numberInput(field.onChange, field.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseIntensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Intensity</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select intensity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="very_high">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="environmentalTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environmental Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...numberInput(field.onChange, field.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="humidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Humidity (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...numberInput(field.onChange, field.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clothing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clothing Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select clothing" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light, breathable layers</SelectItem>
                          <SelectItem value="moderate">Moderate (shorts + tee)</SelectItem>
                          <SelectItem value="heavy">Heavy gear / protective clothing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hydration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hydration Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor (dark urine, dry mouth)</SelectItem>
                          <SelectItem value="adequate">Adequate (clear urine, regular intake)</SelectItem>
                          <SelectItem value="excellent">Excellent (prehydrated + during exercise)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fitnessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Level</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor / sedentary</SelectItem>
                          <SelectItem value="average">Average recreational</SelectItem>
                          <SelectItem value="good">Good endurance base</SelectItem>
                          <SelectItem value="excellent">Excellent / competitive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="w-full sm:flex-1 bg-gradient-to-r from-red-600 to-orange-600">
                  Calculate Temperature Rise
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
          <Card className={`${result.interpretation.bgColor} ${result.interpretation.borderColor} border`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${result.interpretation.color}`}>
                <result.interpretation.icon className="h-5 w-5" />
                {result.interpretation.category}
              </CardTitle>
              <CardDescription>{result.interpretation.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded border bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{result.temperatureRise.toFixed(1)}°C</p>
                  <p className="text-sm text-muted-foreground">Temperature Rise</p>
                </div>
                <div className="rounded border bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{result.finalTemperature.toFixed(1)}°C</p>
                  <p className="text-sm text-muted-foreground">Projected Final Temperature</p>
                </div>
                <div className="rounded border bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{result.heatStressRisk}</p>
                  <p className="text-sm text-muted-foreground">Heat Stress Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Actionable Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
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
                  <Shield className="h-4 w-4" />
                  Warning Signs & Precautions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.warningSigns.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                8‑Week Heat Management Plan
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-4 w-4" />
                Cooling & Hydration Dashboard
              </CardTitle>
              <CardDescription>Keep these control levers maxed out during challenging sessions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Hydration Strategy', detail: '150–250 ml every 15–20 minutes', percent: 100 },
                { label: 'Rest & Shade Breaks', detail: '2-3 minutes every 15 minutes of work', percent: 85 },
                { label: 'Cooling Measures', detail: 'Cold towels, fans, misting between sets', percent: 70 },
              ].map((item, index) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span>{item.detail}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${item.percent - index * 15}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Collect accurate data to produce reliable core temperature forecasts.</CardDescription>
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
          <CardDescription>Plan safer workouts by combining hydration, metabolism, and heat tools.</CardDescription>
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
          <CardTitle>Complete Guide: Managing Core Body Temperature</CardTitle>
          <CardDescription>Trusted insights to interpret your results and adjust training.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {completeGuideSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
              <p>{section.description}</p>
              {section.bullets && (
                <ul className="list-disc space-y-1 pl-5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>SEO-friendly answers to common heat training concerns.</CardDescription>
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