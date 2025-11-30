'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  totalCarbs: z.number({ invalid_type_error: 'Enter total carbs' }).min(0).max(500),
  fiber: z.number({ invalid_type_error: 'Enter fiber' }).min(0).max(200),
  sugarAlcohols: z.number({ invalid_type_error: 'Enter sugar alcohols' }).min(0).max(100),
  targetNetCarbs: z.number({ invalid_type_error: 'Enter target net carbs' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalCarbs: number;
  fiber: number;
  sugarAlcohols: number;
  targetNetCarbs: number;
  netCarbs: number;
  remainingNetCarbs: number;
  complianceScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total carbohydrates (g) from food tracking or estimate.',
  'Enter fiber (g) from food tracking or estimate.',
  'Enter sugar alcohols (g) from food tracking or estimate.',
  'Enter target net carbs (g) - typically 20-50g for ketogenic diet.',
  'Review ketogenic net carb limit results and recommendations.',
];

const faqs = [
  {
    question: 'What is the ketogenic diet?',
    answer:
      'The ketogenic diet is a very low-carbohydrate, high-fat diet that induces ketosis, a metabolic state where the body burns fat for fuel instead of glucose. It typically limits net carbs to 20-50g per day.',
  },
  {
    question: 'What are net carbs?',
    answer:
      'Net carbs = total carbohydrates - fiber - sugar alcohols (typically counted at 50% for most sugar alcohols). Net carbs represent the carbohydrates that impact blood sugar and ketosis, as fiber and sugar alcohols have minimal impact.',
  },
  {
    question: 'How is ketogenic net carb limit calculated?',
    answer:
      'Ketogenic net carb limit is calculated by subtracting fiber and sugar alcohols (at 50%) from total carbohydrates to get net carbs, then comparing to target net carb limit. Lower net carbs relative to target indicate better ketogenic compliance.',
  },
  {
    question: 'What is the target for net carbs on keto?',
    answer:
      'The ketogenic diet typically targets 20-50g net carbs per day to maintain ketosis. Some people may need stricter limits (20-30g) while others can tolerate slightly higher (40-50g) depending on individual metabolism and activity level.',
  },
  {
    question: 'What about fiber on keto?',
    answer:
      'Fiber is subtracted from total carbs to calculate net carbs because it doesn\'t significantly impact blood sugar or ketosis. Include fiber-rich low-carb vegetables (leafy greens, broccoli) to support digestive health while staying within net carb limits.',
  },
  {
    question: 'What about sugar alcohols?',
    answer:
      'Sugar alcohols (erythritol, xylitol, sorbitol) are typically counted at 50% of their value for net carbs, as they have minimal impact on blood sugar. However, some sugar alcohols may still affect ketosis, so monitor individual tolerance.',
  },
  {
    question: 'What foods are low in net carbs?',
    answer:
      'Low net carb foods include meat, fish, eggs, non-starchy vegetables (leafy greens, broccoli, cauliflower), nuts, seeds, full-fat dairy, and healthy fats. Avoid grains, legumes, fruits (except small portions of berries), and starchy vegetables.',
  },
  {
    question: 'How can I stay within net carb limits?',
    answer:
      'Stay within limits by focusing on low-carb vegetables, adequate protein, healthy fats, and limiting high-carb foods. Track net carbs throughout the day and prioritize fiber-rich low-carb foods to support satiety and digestive health.',
  },
  {
    question: 'What if I exceed net carb limits?',
    answer:
      'Occasional exceedances may temporarily reduce ketosis but won\'t necessarily stop it. If you consistently exceed limits, you may need to reduce total carbs, increase fiber intake, or adjust your target net carb limit based on individual tolerance.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider or registered dietitian before starting the ketogenic diet, if you have diabetes, kidney issues, need help planning a balanced keto diet, want to ensure nutritional adequacy, or have concerns about ketosis.',
  },
];

const relatedCalculators = [
  {
    name: 'Paleo Diet Nutrient Coverage Calculator',
    slug: 'paleo-diet-nutrient-coverage-calculator',
    description: 'Assess Paleo diet nutrient coverage.',
  },
  {
    name: 'Carnivore Micronutrient Gap Calculator',
    slug: 'carnivore-micronutrient-gap-calculator',
    description: 'Evaluate carnivore diet nutrient gaps.',
  },
  {
    name: 'Satiety vs Energy Density Graph Calculator',
    slug: 'satiety-vs-energy-density-graph-calculator',
    description: 'Evaluate satiety and energy density.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/ketogenic-net-carb-limit-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Ketogenic Net Carb Limit Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Ketogenic Net Carb Limit Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate ketogenic net carb limit from total carbs, fiber, sugar alcohols, and target net carbs.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const totalCarbs = values.totalCarbs;
  const fiber = values.fiber;
  const sugarAlcohols = values.sugarAlcohols;
  const targetNetCarbs = values.targetNetCarbs || 30; // Default target
  
  // Calculate net carbs: total carbs - fiber - (sugar alcohols × 0.5)
  const netCarbs = totalCarbs - fiber - (sugarAlcohols * 0.5);
  const remainingNetCarbs = targetNetCarbs - netCarbs;
  
  // Calculate compliance score (0-100, higher = better compliance)
  let complianceScore = 100;
  
  // Deduct points for exceeding target
  if (netCarbs > targetNetCarbs) {
    const excess = netCarbs - targetNetCarbs;
    complianceScore -= excess * 2; // 2 points per gram over
  } else if (netCarbs <= targetNetCarbs * 0.8) {
    complianceScore += 5; // Bonus for staying well under
  }
  
  complianceScore = clamp(complianceScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your ketogenic net carb compliance is excellent. You are staying within or below your target net carb limit, supporting ketosis and metabolic benefits.';

  if (complianceScore < 50 || netCarbs > targetNetCarbs * 1.5) {
    status = 'low';
    interpretation = 'Your ketogenic net carb compliance is low. You are significantly exceeding your target net carb limit, which may reduce or prevent ketosis. Reduce total carbs and increase fiber to improve compliance.';
  } else if (complianceScore < 70 || netCarbs > targetNetCarbs) {
    status = 'moderate';
    interpretation = 'Your ketogenic net carb compliance is moderate. You are at or slightly above your target net carb limit. Reduce total carbs or increase fiber to improve compliance and support ketosis.';
  } else if (complianceScore < 90) {
    status = 'good';
    interpretation = 'Your ketogenic net carb compliance is good. You are staying close to your target net carb limit. Continue monitoring to maintain optimal ketosis.';
  }

  const recommendations: string[] = [];
  
  // Net carbs vs target recommendations
  if (netCarbs > targetNetCarbs * 1.5) {
    recommendations.push(`Significantly reduce net carb intake: current net carbs (${netCarbs.toFixed(0)}g) are well above your target (${targetNetCarbs}g). This may prevent ketosis. Reduce total carbs or increase fiber to improve ketogenic compliance.`);
  } else if (netCarbs > targetNetCarbs) {
    recommendations.push(`Reduce net carb intake: current net carbs (${netCarbs.toFixed(0)}g) exceed your target (${targetNetCarbs}g). Reduce total carbs or increase fiber to improve ketogenic compliance.`);
  } else if (netCarbs <= targetNetCarbs * 0.8) {
    recommendations.push(`Excellent net carb compliance: current net carbs (${netCarbs.toFixed(0)}g) are well below your target (${targetNetCarbs}g). Continue maintaining this level to support ketosis.`);
  } else {
    recommendations.push(`Good net carb compliance: current net carbs (${netCarbs.toFixed(0)}g) are within your target (${targetNetCarbs}g). Continue monitoring to maintain optimal ketosis.`);
  }
  
  // Total carbs recommendations
  if (totalCarbs > 50) {
    recommendations.push(`Reduce total carbohydrates: current total carbs (${totalCarbs.toFixed(0)}g) are high. Focus on low-carb foods like meat, fish, eggs, non-starchy vegetables, nuts, and seeds. Limit or avoid grains, legumes, fruits, and starchy vegetables.`);
  } else if (totalCarbs > 30) {
    recommendations.push(`Monitor total carbohydrates: current total carbs (${totalCarbs.toFixed(0)}g) are moderate. Continue focusing on low-carb foods and increasing fiber to reduce net carbs.`);
  } else {
    recommendations.push(`Total carbohydrates are low (${totalCarbs.toFixed(0)}g), which is good for ketosis. Continue choosing low-carb foods.`);
  }
  
  // Fiber recommendations
  if (fiber < 5) {
    recommendations.push(`Increase fiber intake: current fiber (${fiber.toFixed(0)}g) is low. Include fiber-rich low-carb vegetables (leafy greens, broccoli, cauliflower) to subtract from net carbs while supporting digestive health and satiety.`);
  } else if (fiber >= 5 && fiber <= 15) {
    recommendations.push(`Maintain fiber intake: current fiber (${fiber.toFixed(0)}g) is good. Continue including fiber-rich low-carb vegetables.`);
  } else {
    recommendations.push(`Current fiber intake (${fiber.toFixed(0)}g) is high, which helps reduce net carbs. Continue including fiber-rich low-carb vegetables.`);
  }
  
  // Sugar alcohols recommendations
  if (sugarAlcohols > 20) {
    recommendations.push(`Monitor sugar alcohols: current intake (${sugarAlcohols.toFixed(0)}g) is high. Count sugar alcohols at 50% of their value for net carbs, but be aware that some may still affect ketosis. Monitor individual tolerance.`);
  } else if (sugarAlcohols > 10) {
    recommendations.push(`Sugar alcohols intake (${sugarAlcohols.toFixed(0)}g) is moderate. Continue monitoring, as some sugar alcohols may still affect ketosis despite being counted at 50%.`);
  } else {
    recommendations.push(`Sugar alcohols intake (${sugarAlcohols.toFixed(0)}g) is low. Continue monitoring individual tolerance if using sugar alcohols.`);
  }
  
  // Remaining net carbs recommendations
  if (remainingNetCarbs < 0) {
    recommendations.push(`You have exceeded your net carb target by ${Math.abs(remainingNetCarbs).toFixed(0)}g. Reduce total carbs or increase fiber to get back within your target.`);
  } else if (remainingNetCarbs < 5) {
    recommendations.push(`You have ${remainingNetCarbs.toFixed(0)}g remaining net carbs for the day. Use this allowance carefully to stay within your target.`);
  } else {
    recommendations.push(`You have ${remainingNetCarbs.toFixed(0)}g remaining net carbs for the day. Continue tracking to stay within your target while maintaining nutritional adequacy.`);
  }
  
  recommendations.push('Track net carbs throughout the day: spread net carb intake across meals and track to stay within daily limits while maintaining nutritional adequacy.');
  recommendations.push('Choose low net carb foods: prioritize foods with high fiber relative to total carbs (like leafy greens, broccoli) to maximize food volume while minimizing net carbs.');
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Focus on whole foods: emphasize naturally low-carb whole foods over processed keto products, which may contain hidden carbs or affect ketosis differently.');
    recommendations.push('Adjust target if needed: if you consistently struggle to stay within limits, consider adjusting your target net carb limit based on individual tolerance and metabolic response.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate ketogenic net carb compliance (${complianceScore}/100) and assess net carb intake (${netCarbs.toFixed(0)}g vs target: ${targetNetCarbs}g). Focus on staying within limits.` },
    { label: 'This Month', detail: 'Improve ketogenic net carb compliance: reduce total carbs, increase fiber from low-carb vegetables, and monitor net carbs to stay within 20-50g daily target for optimal ketosis.' },
    { label: 'Ongoing', detail: 'Maintain ketogenic net carb compliance: continue tracking net carbs, prioritizing low-carb whole foods, and adjusting intake as needed to maintain ketosis and metabolic benefits.' },
  ];

  return { totalCarbs, fiber, sugarAlcohols, targetNetCarbs, netCarbs, remainingNetCarbs, complianceScore, status, interpretation, recommendations, plan };
};

export default function KetogenicNetCarbLimitCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalCarbs: undefined,
      fiber: undefined,
      sugarAlcohols: undefined,
      targetNetCarbs: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="ketogenic-net-carb-limit-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ketogenic Net Carb Limit Calculator
          </CardTitle>
          <CardDescription>Calculate ketogenic net carb limit from total carbs, fiber, sugar alcohols, and target net carbs.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your ketogenic net carb data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalCarbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total carbs (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fiber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiber (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sugarAlcohols"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sugar alcohols (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetNetCarbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target net carbs (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate ketogenic net carb limit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See ketogenic net carb limit results and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.netCarbs.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">g/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target net carbs</p>
                <p className="text-2xl font-semibold text-primary">{result.targetNetCarbs.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">g/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-semibold text-primary">{result.remainingNetCarbs > 0 ? result.remainingNetCarbs.toFixed(0) : '0'}</p>
                <p className="text-xs text-muted-foreground">{result.remainingNetCarbs > 0 ? 'g remaining' : 'limit reached'}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Net carbs</strong> = total carbohydrates - fiber - (sugar alcohols × 0.5). Net carbs represent carbohydrates that impact blood sugar and ketosis, as fiber and sugar alcohols have minimal metabolic impact.
          </p>
          <p>
            <strong>Remaining net carbs</strong> = target net carbs - net carbs. Positive values indicate remaining allowance, zero or negative values indicate target met or exceeded.
          </p>
          <p>
            <strong>Ketogenic compliance score</strong> = 100 minus deductions for exceeding target (2 points per gram over target). Bonus points for staying well under target. Higher scores indicate better compliance.
          </p>
          <p>
            <strong>Target net carbs:</strong> The ketogenic diet typically targets 20-50g net carbs per day to maintain ketosis. Stricter limits (20-30g) may be needed for some individuals, while others may tolerate slightly higher (40-50g).
          </p>
          <p>The ketogenic diet relies on very low net carb intake to induce and maintain ketosis. Staying within net carb limits is essential for metabolic benefits, while adequate fiber from low-carb vegetables supports digestive health.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target range</p>
                <p className="text-xl font-semibold text-primary">20-50</p>
                <p className="text-xs text-muted-foreground">g/day (keto)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Compliance score</p>
                <p className="text-xl font-semibold text-primary">{result.complianceScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ketosis support</p>
                <p className="text-xl font-semibold text-primary">
                  {result.netCarbs <= result.targetNetCarbs ? 'Optimal' : result.netCarbs <= result.targetNetCarbs * 1.2 ? 'Moderate' : 'Reduced'}
                </p>
                <p className="text-xs text-muted-foreground">Based on net carbs</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your ketogenic net carb data to see additional insights.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/category/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>The ketogenic diet is a very low-carbohydrate, high-fat diet that induces ketosis, a metabolic state where the body burns fat for fuel instead of glucose. It typically limits net carbs to 20-50g per day.</p>
          <p>Use this calculator to calculate ketogenic net carb limit from total carbs, fiber, sugar alcohols, and target net carbs.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool calculates ketogenic net carb limit from total carbs, fiber, sugar alcohols, and target net carbs.</p>
          <p>Outputs include total carbs, fiber, sugar alcohols, target net carbs, net carbs, remaining net carbs, compliance score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

