'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gamepad2, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  currentValue: z.number({ invalid_type_error: 'Enter current value' }).min(0),
  originalPrice: z.number({ invalid_type_error: 'Enter original price' }).min(0),
  yearsSinceRelease: z.number({ invalid_type_error: 'Enter years since release' }).min(0),
  rarityTier: z.enum(['limited', 'limited-u', 'rare', 'epic', 'legendary']),
  historicalGrowthRate: z.number({ invalid_type_error: 'Enter historical growth rate' }).min(-100).max(1000),
  predictionPeriod: z.number({ invalid_type_error: 'Enter prediction period' }).min(0.1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentValue: number;
  originalPrice: number;
  yearsSinceRelease: number;
  rarityTier: string;
  historicalGrowthRate: number;
  predictionPeriod: number;
  totalAppreciation: number;
  annualGrowthRate: number;
  predictedValue: number;
  predictedAppreciation: number;
  confidenceLevel: number;
  status: 'declining' | 'stable' | 'moderate-growth' | 'strong-growth' | 'exceptional-growth';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
  projections: {
    month3: number;
    month6: number;
    year1: number;
    year2: number;
    year5: number;
  };
};

const steps = [
  'Enter the current resale value of the limited item (in Robux).',
  'Enter the original price when the item was first sold (in Robux).',
  'Enter the number of years since the item was released.',
  'Select the rarity tier (Limited, Limited U, Rare, Epic, or Legendary).',
  'Enter the historical annual growth rate percentage (can be negative for declining items).',
  'Enter the prediction period in years (0.1 to 10 years).',
  'Review the predicted value, growth projections, and recommendations.',
];

const faqs = [
  {
    question: 'What are Roblox limited items?',
    answer:
      'Limited items are special Roblox items that were sold for a limited time and are no longer available for purchase. Once the sale period ends, these items can only be obtained through trading. Limited items often appreciate in value over time due to scarcity and demand. Limited U (Unlimited) items were available for a longer period but are also discontinued.',
  },
  {
    question: 'How is predicted value calculated?',
    answer:
      'Predicted value uses compound growth based on historical growth rate: Predicted Value = Current Value × (1 + Historical Growth Rate / 100)^Prediction Period. This assumes the historical growth rate continues into the future. The calculation accounts for rarity tier, which affects growth potential, and adjusts confidence levels accordingly.',
  },
  {
    question: 'What is historical growth rate?',
    answer:
      'Historical growth rate is the annual percentage change in value over the item\'s lifetime. Calculate it by comparing current value to original price over the years since release: ((Current Value / Original Price)^(1 / Years) - 1) × 100. Positive rates indicate appreciation, negative rates indicate depreciation. Use this to project future values.',
  },
  {
    question: 'How accurate are these predictions?',
    answer:
      'Predictions are estimates based on historical trends and assume those trends continue. Actual values can vary significantly due to market conditions, game updates, community trends, and unexpected events. Use predictions as guides, not guarantees. Confidence levels indicate prediction reliability - higher confidence means more reliable predictions.',
  },
  {
    question: 'What affects limited item value?',
    answer:
      'Limited item values are affected by: rarity and scarcity (fewer items = higher value), demand and popularity (popular items appreciate more), game updates and events (can increase or decrease demand), community trends and social media (influence demand), and overall Roblox economy health. These factors can change rapidly, affecting predictions.',
  },
  {
    question: 'What is a good growth rate for limited items?',
    answer:
      'Growth rates vary by rarity and market conditions. Limited items typically see 10-30% annual growth, Limited U items see 5-15%, Rare items see 20-50%, Epic items see 30-100%, and Legendary items can see 50-200%+ growth. However, growth rates can decline over time as items become more expensive and markets mature.',
  },
  {
    question: 'Should I invest in limited items based on predictions?',
    answer:
      'Predictions are estimates, not guarantees. Limited items can be volatile, and values can decline unexpectedly. Consider: current market conditions, item rarity and demand, your risk tolerance, investment budget, and alternative opportunities. Only invest what you can afford to lose. Use predictions to inform decisions, not as sole decision factors.',
  },
];

const relatedCalculators = [
  {
    name: '(Roblox) Pet Value Calculator',
    slug: 'roblox-pet-value-calculator',
    description: 'Calculate the value of your Roblox pets based on rarity, age, and market trends.',
  },
  {
    name: '(Roblox) Trading Profit Analyzer',
    slug: 'roblox-trading-profit-analyzer',
    description: 'Analyze trading profits by comparing buy and sell prices, fees, and calculate ROI for Roblox trades.',
  },
  {
    name: '(Roblox) Inventory Value Estimator',
    slug: 'roblox-inventory-value-estimator',
    description: 'Estimate the total value of your Roblox inventory including pets, limited items, and collectibles.',
  },
  {
    name: '(Roblox) Trade Tax Calculator',
    slug: 'roblox-trade-tax-calculator',
    description: 'Calculate trading taxes and fees for Roblox trades, including platform fees and total transaction costs.',
  },
  {
    name: '(Roblox) Pet Dupe Value Calculator',
    slug: 'roblox-pet-dupe-value-calculator',
    description: 'Calculate the value of duplicated Roblox pets based on original value, dupe count, and market impact.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-limited-item-resale-predictor';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: '(Roblox) Limited Item Resale Predictor', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: '(Roblox) Limited Item Resale Predictor',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Predict future resale values of Roblox limited items based on historical trends, rarity, and market factors.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const rarityMultipliers: Record<string, number> = {
  limited: 1.0,
  'limited-u': 0.8,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.0,
};

const calculateResult = (values: FormValues): ResultPayload => {
  const currentValue = values.currentValue;
  const originalPrice = values.originalPrice;
  const yearsSinceRelease = values.yearsSinceRelease;
  const rarityTier = values.rarityTier;
  const historicalGrowthRate = values.historicalGrowthRate; // percentage
  const predictionPeriod = values.predictionPeriod; // years

  // Calculate total appreciation from original to current
  const totalAppreciation = originalPrice > 0 ? ((currentValue / originalPrice) - 1) * 100 : 0;

  // Calculate annual growth rate from historical data
  const annualGrowthRate = yearsSinceRelease > 0 
    ? ((Math.pow(currentValue / originalPrice, 1 / yearsSinceRelease)) - 1) * 100
    : historicalGrowthRate;

  // Use provided historical growth rate or calculated annual growth rate
  const effectiveGrowthRate = historicalGrowthRate !== 0 ? historicalGrowthRate : annualGrowthRate;

  // Adjust growth rate based on rarity (rarer items may have different growth patterns)
  const rarityMultiplier = rarityMultipliers[rarityTier] || 1.0;
  const adjustedGrowthRate = effectiveGrowthRate * rarityMultiplier;

  // Predicted value using compound growth
  // Formula: Predicted Value = Current Value × (1 + Growth Rate / 100)^Prediction Period
  const predictedValue = currentValue * Math.pow(1 + adjustedGrowthRate / 100, predictionPeriod);

  // Predicted appreciation
  const predictedAppreciation = ((predictedValue / currentValue) - 1) * 100;

  // Confidence level based on years of data and rarity
  // More years of data = higher confidence, rarer items = slightly lower confidence (more volatile)
  let confidenceLevel = Math.min(100, 50 + (yearsSinceRelease * 5));
  if (rarityTier === 'legendary' || rarityTier === 'epic') {
    confidenceLevel *= 0.9; // Slightly lower confidence for very rare items (more volatile)
  }
  confidenceLevel = Math.max(30, Math.min(95, confidenceLevel));

  // Projections for different time periods
  const projections = {
    month3: currentValue * Math.pow(1 + adjustedGrowthRate / 100, 0.25),
    month6: currentValue * Math.pow(1 + adjustedGrowthRate / 100, 0.5),
    year1: currentValue * Math.pow(1 + adjustedGrowthRate / 100, 1),
    year2: currentValue * Math.pow(1 + adjustedGrowthRate / 100, 2),
    year5: currentValue * Math.pow(1 + adjustedGrowthRate / 100, 5),
  };

  let status: ResultPayload['status'] = 'stable';
  let interpretation = 'Your limited item resale prediction has been calculated based on current value, historical growth, and rarity tier.';

  if (adjustedGrowthRate < -10) {
    status = 'declining';
    interpretation = `Declining value. The item is predicted to decrease in value with a ${adjustedGrowthRate.toFixed(1)}% annual growth rate. Over ${predictionPeriod} years, predicted value is ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). The item may be losing popularity or market conditions are unfavorable.`;
  } else if (adjustedGrowthRate < 5) {
    status = 'stable';
    interpretation = `Stable value. The item is predicted to maintain relatively stable value with a ${adjustedGrowthRate.toFixed(1)}% annual growth rate. Over ${predictionPeriod} years, predicted value is ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). The item maintains steady appreciation.`;
  } else if (adjustedGrowthRate < 20) {
    status = 'moderate-growth';
    interpretation = `Moderate growth. The item is predicted to appreciate with a ${adjustedGrowthRate.toFixed(1)}% annual growth rate. Over ${predictionPeriod} years, predicted value is ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). This is solid growth for a limited item.`;
  } else if (adjustedGrowthRate < 50) {
    status = 'strong-growth';
    interpretation = `Strong growth! The item is predicted to appreciate significantly with a ${adjustedGrowthRate.toFixed(1)}% annual growth rate. Over ${predictionPeriod} years, predicted value is ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). This is excellent growth potential.`;
  } else {
    status = 'exceptional-growth';
    interpretation = `Exceptional growth! The item is predicted to appreciate dramatically with a ${adjustedGrowthRate.toFixed(1)}% annual growth rate. Over ${predictionPeriod} years, predicted value is ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). This represents exceptional growth potential, though such high rates may not be sustainable long-term.`;
  }

  const recommendations = [
    `Current Value: ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. This is the item's current market value.`,
    `Total Appreciation: ${totalAppreciation >= 0 ? '+' : ''}${totalAppreciation.toFixed(1)}% from original price of ${originalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. ${totalAppreciation > 100 ? 'Exceptional appreciation!' : totalAppreciation > 50 ? 'Strong appreciation.' : totalAppreciation > 0 ? 'Positive appreciation.' : 'Negative appreciation - value has declined.'}`,
    `Annual Growth Rate: ${annualGrowthRate >= 0 ? '+' : ''}${annualGrowthRate.toFixed(1)}% per year. ${annualGrowthRate > 30 ? 'Very high growth rate!' : annualGrowthRate > 15 ? 'Strong growth rate.' : annualGrowthRate > 5 ? 'Moderate growth rate.' : annualGrowthRate > 0 ? 'Slow growth rate.' : 'Declining value.'}`,
    `Adjusted Growth Rate: ${adjustedGrowthRate >= 0 ? '+' : ''}${adjustedGrowthRate.toFixed(1)}% per year (adjusted for ${rarityTier} rarity). ${rarityTier === 'legendary' || rarityTier === 'epic' ? 'Rare items may have higher volatility.' : 'Standard rarity tier.'}`,
    `Predicted Value (${predictionPeriod} years): ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux. ${predictedValue > currentValue ? 'Predicted appreciation!' : 'Predicted depreciation.'}`,
    `Predicted Appreciation: ${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% over ${predictionPeriod} years. ${predictedAppreciation > 50 ? 'Excellent predicted growth!' : predictedAppreciation > 20 ? 'Good predicted growth.' : predictedAppreciation > 0 ? 'Moderate predicted growth.' : 'Predicted decline.'}`,
    `Confidence Level: ${confidenceLevel.toFixed(0)}%. ${confidenceLevel > 80 ? 'High confidence - predictions are more reliable.' : confidenceLevel > 60 ? 'Moderate confidence - predictions are reasonably reliable.' : 'Lower confidence - predictions have higher uncertainty.'}`,
  ];

  if (adjustedGrowthRate < 0) {
    recommendations.push('Declining value detected. Consider: monitoring market conditions for recovery signs, evaluating if the decline is temporary or long-term, and considering selling if further decline is expected.');
  } else if (adjustedGrowthRate > 50) {
    recommendations.push('Exceptional growth rate detected. Be cautious - such high rates may not be sustainable long-term. Monitor for signs of market saturation or bubble conditions. Consider taking profits if growth seems unsustainable.');
  } else {
    recommendations.push('Positive growth predicted. Monitor market conditions, game updates, and community trends. Consider holding for long-term appreciation or selling if you need liquidity. Track actual performance vs. predictions to refine estimates.');
  }

  const plan = [
    { 
      label: 'This Week', 
      detail: `Evaluate prediction: current value ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux, predicted value in ${predictionPeriod} years: ${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} Robux (${predictedAppreciation >= 0 ? '+' : ''}${predictedAppreciation.toFixed(1)}% change). Confidence: ${confidenceLevel.toFixed(0)}%.` 
    },
    { 
      label: 'This Month', 
      detail: 'Monitor actual value changes and compare to predictions. Track market conditions, game updates, and community trends that may affect value. Adjust predictions if growth rates change significantly.' 
    },
    { 
      label: 'Ongoing', 
      detail: 'Continuously track limited item performance: compare actual values to predictions, monitor market trends and game updates, assess whether growth rates are sustainable, and use this calculator to refine predictions based on new data. Remember that predictions are estimates, not guarantees.' 
    },
  ];

  return {
    currentValue,
    originalPrice,
    yearsSinceRelease,
    rarityTier,
    historicalGrowthRate,
    predictionPeriod,
    totalAppreciation,
    annualGrowthRate,
    predictedValue,
    predictedAppreciation,
    confidenceLevel,
    status,
    interpretation,
    recommendations,
    plan,
    projections,
  };
};

export default function RobloxLimitedItemResalePredictor() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentValue: undefined,
      originalPrice: undefined,
      yearsSinceRelease: undefined,
      rarityTier: undefined,
      historicalGrowthRate: undefined,
      predictionPeriod: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="roblox-limited-item-predictor-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            (Roblox) Limited Item Resale Predictor
          </CardTitle>
          <CardDescription>Predict future resale values of Roblox limited items based on historical trends, rarity, and market factors.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your limited item information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
              try {
                setResult(calculateResult(values));
              } catch (error) {
                console.error('Error calculating result:', error);
                alert('An error occurred while calculating. Please check the console for details.');
              }
            }, (errors) => {
              console.log('Form validation errors:', errors);
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value (Robux)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price (Robux)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearsSinceRelease"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years Since Release</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rarityTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rarity Tier</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select rarity</option>
                          <option value="limited">Limited</option>
                          <option value="limited-u">Limited U</option>
                          <option value="rare">Rare</option>
                          <option value="epic">Epic</option>
                          <option value="legendary">Legendary</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="historicalGrowthRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Historical Growth Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25 (auto-calculated if 0)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="predictionPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prediction Period (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Predict Resale Value
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
            <CardDescription>See predicted value, growth projections, confidence levels, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Predicted Value</p>
                <p className="text-2xl font-semibold text-primary">{result.predictedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">In {result.predictionPeriod} years</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Predicted Appreciation</p>
                <p className={`text-2xl font-semibold ${result.predictedAppreciation >= 0 ? 'text-primary' : 'text-red-500'}`}>
                  {result.predictedAppreciation >= 0 ? '+' : ''}{result.predictedAppreciation.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Over {result.predictionPeriod} years</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Annual Growth Rate</p>
                <p className={`text-2xl font-semibold ${result.annualGrowthRate >= 0 ? 'text-primary' : 'text-red-500'}`}>
                  {result.annualGrowthRate >= 0 ? '+' : ''}{result.annualGrowthRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Per year</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">3 Month Projection</p>
                <p className="text-xl font-semibold text-primary">
                  {result.projections.month3.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">Robux</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">6 Month Projection</p>
                <p className="text-xl font-semibold text-primary">
                  {result.projections.month6.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">Robux</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">1 Year Projection</p>
                <p className="text-xl font-semibold text-primary">
                  {result.projections.year1.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">Robux</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">2 Year Projection</p>
                <p className="text-xl font-semibold text-primary">
                  {result.projections.year2.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">Robux</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">5 Year Projection</p>
                <p className="text-xl font-semibold text-primary">
                  {result.projections.year5.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">Robux</p>
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
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
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
            <strong>Total Appreciation</strong> = ((Current Value / Original Price) - 1) × 100. This shows total value change from original price to current value as a percentage.
          </p>
          <p>
            <strong>Annual Growth Rate</strong> = ((Current Value / Original Price)^(1 / Years Since Release) - 1) × 100. This calculates the average annual growth rate based on historical performance. If historical growth rate is provided, it's used instead.
          </p>
          <p>
            <strong>Adjusted Growth Rate</strong> = Historical Growth Rate × Rarity Multiplier. Rarity multipliers: Limited: 1.0x, Limited U: 0.8x, Rare: 1.5x, Epic: 2.0x, Legendary: 3.0x. Rarer items may have different growth patterns.
          </p>
          <p>
            <strong>Predicted Value</strong> = Current Value × (1 + Adjusted Growth Rate / 100)^Prediction Period. This uses compound growth to project future values. Assumes historical growth rate continues into the future.
          </p>
          <p>
            <strong>Predicted Appreciation</strong> = ((Predicted Value / Current Value) - 1) × 100. This shows predicted value change from current to predicted value as a percentage.
          </p>
          <p>
            <strong>Confidence Level</strong> = Base confidence (50%) + (Years Since Release × 5%), adjusted for rarity. More years of data increase confidence. Very rare items (Epic, Legendary) have slightly lower confidence due to higher volatility. Confidence ranges from 30% to 95%.
          </p>
          <p>
            <strong>Projections</strong> = Current Value × (1 + Adjusted Growth Rate / 100)^Time Period. Projections for 3 months, 6 months, 1 year, 2 years, and 5 years help evaluate short-term and long-term potential.
          </p>
          <p>These formulas use compound growth based on historical trends. Predictions assume historical growth rates continue, which may not always be accurate. Market conditions, game updates, and community trends can significantly affect actual values. Use predictions as guides, not guarantees.</p>
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
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/category/gaming/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="The Complete Guide to Roblox Limited Item Resale Prediction: Understanding Value Trends and Future Projections" />
        <meta itemProp="description" content="A comprehensive guide to predicting Roblox limited item resale values, including historical analysis, growth rate calculations, and market trend evaluation." />
        <meta itemProp="keywords" content="Roblox limited items, resale prediction, limited item value, Roblox economy, value projection, market trends" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Roblox Limited Item Resale Prediction: Understanding Value Trends and Future Projections</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to predicting Roblox limited item resale values, including historical analysis, growth rate calculations, and market trend evaluation.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Roblox Limited Items</a></li>
          <li><a href="#limited" className="hover:underline">Understanding Limited Items</a></li>
          <li><a href="#growth" className="hover:underline">Value Growth and Appreciation</a></li>
          <li><a href="#prediction" className="hover:underline">Prediction Methods and Calculations</a></li>
          <li><a href="#factors" className="hover:underline">Factors Affecting Limited Item Values</a></li>
          <li><a href="#rarity" className="hover:underline">Rarity Tiers and Growth Patterns</a></li>
          <li><a href="#strategies" className="hover:underline">Investment Strategies and Risk Management</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Roblox Limited Items</h2>
        <p>Roblox limited items are special items that were sold for a limited time and are no longer available for purchase. Once the sale period ends, these items can only be obtained through trading with other players. Limited items often appreciate in value over time due to scarcity and demand, making them attractive investments for players interested in the Roblox economy.</p>

        <p>The limited item market operates on supply and demand principles. Since limited items are no longer produced, supply is fixed (or decreases if items are removed). Demand can increase or decrease based on popularity, game updates, community trends, and overall Roblox economy health. This creates opportunities for value appreciation but also risks of depreciation.</p>

        <p>Predicting limited item values requires understanding historical trends, growth patterns, rarity tiers, and market factors. Historical growth rates provide insights into future potential, but predictions are estimates, not guarantees. Market conditions can change rapidly, affecting actual values significantly.</p>

        <p>Limited items come in different rarity tiers: Limited (standard limited items), Limited U (Unlimited - available longer but still discontinued), Rare, Epic, and Legendary. Higher rarity tiers typically have better growth potential but also higher volatility. Understanding rarity helps evaluate growth potential and risk.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Limited Item Economy</h3>
        <p>The limited item economy is driven by scarcity, demand, and market sentiment. Items with low supply and high demand appreciate most. Items that lose popularity or face negative events may depreciate. Market sentiment can change rapidly based on game updates, community trends, or external factors.</p>

        <hr />

        <h2 id="limited" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Limited Items</h2>
        
        <p>Limited items are distinguished from regular items by their discontinued status. Once the sale period ends, no new copies are created, creating fixed or decreasing supply. This scarcity drives value appreciation, especially for popular items with high demand.</p>

        <p>Limited U (Unlimited) items were available for a longer period before being discontinued, resulting in higher initial supply. While still limited, they typically have lower growth rates than standard Limited items due to higher supply. However, they can still appreciate significantly over time.</p>

        <p>Rare, Epic, and Legendary limited items represent higher rarity tiers with better growth potential. These items often have lower initial supply, higher demand, and stronger appreciation trends. However, they also have higher volatility and may experience larger price swings.</p>

        <p>Historical performance varies significantly by item. Some limited items appreciate 10-20% annually, while others appreciate 50-200%+ annually. Some items depreciate over time if they lose popularity. Researching historical performance helps identify items with strong growth potential.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Limited vs. Regular Items</h3>
        <p>Limited items differ from regular items in key ways: fixed or decreasing supply (no new copies created), potential for value appreciation (scarcity drives demand), trading-only availability (must trade to obtain), and historical appreciation trends (many limited items increase in value over time).</p>

        <hr />

        <h2 id="growth" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Value Growth and Appreciation</h2>
        
        <p>Limited items typically appreciate in value over time due to scarcity and demand. Growth rates vary by item, rarity, and market conditions. Understanding growth patterns helps predict future values and make informed investment decisions.</p>

        <p>Annual growth rates for limited items typically range from 5-30% for standard Limited items, 10-50% for Rare items, 20-100% for Epic items, and 50-200%+ for Legendary items. However, growth rates can decline over time as items become more expensive and markets mature.</p>

        <p>Total appreciation measures value change from original price to current value. Items that have been available for many years may show 500-1000%+ total appreciation, while newer items may show 50-200% appreciation. Total appreciation provides context for growth potential.</p>

        <p>Compound growth means that appreciation builds on previous appreciation. An item with 20% annual growth doubles in value approximately every 3.8 years. An item with 50% annual growth doubles in value approximately every 1.4 years. Understanding compound growth helps evaluate long-term potential.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Growth Rate Trends</h3>
        <p>Growth rates often decline over time as items become more expensive. Early years may see 50-100%+ annual growth, while later years may see 10-20% annual growth. This is natural as markets mature and items reach higher price points. Consider both current and historical growth rates when predicting future values.</p>

        <hr />

        <h2 id="prediction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Prediction Methods and Calculations</h2>
        
        <p>Prediction methods use historical data to project future values. The most common approach is compound growth based on historical growth rates. This assumes that historical trends continue into the future, which may or may not be accurate.</p>

        <p>Annual growth rate calculation: ((Current Value / Original Price)^(1 / Years Since Release) - 1) × 100. This calculates the average annual growth rate based on historical performance. If you have a specific historical growth rate, you can use that instead.</p>

        <p>Predicted value calculation: Current Value × (1 + Growth Rate / 100)^Prediction Period. This uses compound growth to project future values. For example, an item worth 10,000 Robux with 20% annual growth will be worth 14,400 Robux in 2 years (10,000 × 1.2^2).</p>

        <p>Confidence levels indicate prediction reliability. More years of historical data increase confidence. Items with 5+ years of data have higher confidence than items with 1 year of data. Rarer items (Epic, Legendary) have slightly lower confidence due to higher volatility, even with good historical data.</p>

        <p>Projections for different time periods (3 months, 6 months, 1 year, 2 years, 5 years) help evaluate short-term and long-term potential. Short-term projections are generally more reliable than long-term projections, as market conditions can change significantly over longer periods.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Prediction Limitations</h3>
        <p>Predictions are estimates, not guarantees. Actual values can vary significantly due to: market condition changes, game updates and events, community trends and social media, economic factors, and unexpected events. Use predictions as guides, not absolute forecasts. Always consider risk and uncertainty.</p>

        <hr />

        <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Limited Item Values</h2>
        
        <p>Multiple factors affect limited item values: rarity and scarcity (fewer items = higher value), demand and popularity (popular items appreciate more), game updates and events (can increase or decrease demand), community trends and social media (influence demand), overall Roblox economy health, and market sentiment and confidence.</p>

        <p>Rarity and scarcity are fundamental drivers. Items with lower supply and higher demand appreciate most. Items that become more scarce (through removals or decreased availability) may appreciate faster. Understanding supply and demand dynamics helps evaluate growth potential.</p>

        <p>Demand and popularity significantly affect values. Popular items with strong community interest appreciate more than less popular items. Social media, YouTubers, and community events can drive demand spikes. However, popularity can be fickle, and items may lose popularity over time.</p>

        <p>Game updates and events can dramatically affect values. Updates that feature or reference limited items can increase demand. Events that create new limited items may affect demand for existing items. Major game changes can impact the entire limited item market.</p>

        <p>Market sentiment and confidence affect values. Positive sentiment drives appreciation, while negative sentiment can cause depreciation. Market confidence can change rapidly based on news, events, or trends. Monitoring sentiment helps assess value stability.</p>

        <hr />

        <h2 id="rarity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rarity Tiers and Growth Patterns</h2>
        
        <p>Different rarity tiers have different growth patterns. Limited items (standard) typically see 10-30% annual growth with moderate volatility. Limited U items see 5-15% annual growth with lower volatility due to higher supply. Rare items see 20-50% annual growth with higher volatility.</p>

        <p>Epic items see 30-100% annual growth with high volatility. These items have strong appreciation potential but also higher risk. Legendary items see 50-200%+ annual growth with very high volatility. These items offer exceptional growth potential but also exceptional risk.</p>

        <p>Growth patterns vary by item within each tier. Some Limited items outperform Epic items, while some Epic items underperform Limited items. Individual item characteristics, demand, and market conditions matter more than tier alone. Research specific items, not just tiers.</p>

        <p>Volatility increases with rarity. Common Limited items have lower volatility, while Legendary items have very high volatility. Higher volatility means larger price swings, both up and down. Consider volatility when evaluating risk and setting strategies.</p>

        <hr />

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Investment Strategies and Risk Management</h2>
        
        <p>Successful limited item investment requires research, analysis, and risk management. Research historical performance, current market conditions, and growth trends. Analyze predictions, confidence levels, and risk factors. Manage risk through diversification, position sizing, and exit strategies.</p>

        <p>Focus on items with strong historical performance, positive growth trends, and reasonable confidence levels. Avoid items with declining values, negative growth rates, or very low confidence. Use predictions to identify opportunities, but verify with additional research.</p>

        <p>Diversification reduces risk. Don't invest all Robux in a single limited item. Spread investments across multiple items, rarity tiers, and time periods. If some items depreciate, other items may appreciate, reducing overall risk.</p>

        <p>Position sizing manages risk. Don't invest more than you can afford to lose. Limited items can be volatile, and values can decline unexpectedly. Use position sizing to limit exposure to any single item or risk factor.</p>

        <p>Exit strategies help manage risk. Set target prices for taking profits. Set stop-loss levels for limiting losses. Monitor market conditions and adjust strategies based on new information. Don't hold indefinitely - take profits when targets are reached or cut losses when stop-losses are triggered.</p>

        <p>Continuous monitoring is essential. Track actual values vs. predictions. Monitor market conditions, game updates, and community trends. Adjust strategies based on new information. Use prediction tools to refine estimates and improve decision-making.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Roblox limited item resale prediction requires understanding historical trends, growth patterns, rarity tiers, and market factors. Use prediction tools to estimate future values, but remember that predictions are estimates, not guarantees. Actual values can vary significantly due to market conditions and unexpected events.</p>

        <p>Focus on items with strong historical performance, positive growth trends, and reasonable confidence levels. Diversify investments, manage position sizes, and use exit strategies to manage risk. Monitor market conditions continuously and adjust strategies based on new information.</p>

        <p>Predictions help inform decisions but shouldn't be the sole factor. Combine predictions with research, analysis, and risk management for best results. With proper strategy and risk management, limited item investment can be profitable, but always invest responsibly and only what you can afford to lose.</p>

        <p>Remember that limited items are virtual assets with no guaranteed value. Market conditions can change rapidly, and values can decline unexpectedly. Use predictions as guides, monitor actual performance, and adjust strategies accordingly. With understanding and strategy, you can navigate the limited item market effectively.</p>
      </section>

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
          <p>This tool predicts Roblox limited item resale values based on current value (Robux), original price (Robux), years since release, rarity tier (Limited to Legendary), historical growth rate percentage (auto-calculated if not provided), and prediction period in years (0.1 to 10).</p>
          <p>Outputs include total appreciation (from original to current), annual growth rate (calculated from historical data), adjusted growth rate (adjusted for rarity tier), predicted value (future value after prediction period), predicted appreciation (percentage change), confidence level (30-95% based on data quality), status assessment (declining/stable/moderate-growth/strong-growth/exceptional-growth), interpretation, recommendations, action plan, and projections for 3 months, 6 months, 1 year, 2 years, and 5 years.</p>
          <p>Formulas use compound growth: Annual Growth Rate = ((Current / Original)^(1 / Years) - 1) × 100, Predicted Value = Current × (1 + Growth Rate / 100)^Period, with rarity multipliers adjusting growth rates. Confidence levels account for years of data and rarity volatility. The guide covers limited item mechanics, growth patterns, prediction methods, market factors, rarity tiers, and investment strategies. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Roblox limited item resale prediction instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
