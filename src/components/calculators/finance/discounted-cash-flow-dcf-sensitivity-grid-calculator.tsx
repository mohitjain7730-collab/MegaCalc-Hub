'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  baseDiscountRate: z.number({ invalid_type_error: 'Enter base discount rate' }).min(0).max(100),
  baseTerminalGrowthRate: z.number({ invalid_type_error: 'Enter base terminal growth rate' }).min(0).max(100),
  presentValueOfCashFlows: z.number({ invalid_type_error: 'Enter PV of forecasted cash flows' }).min(0),
  terminalValue: z.number({ invalid_type_error: 'Enter terminal value' }).min(0),
  discountRateStep: z.number({ invalid_type_error: 'Enter discount rate step' }).min(0.1).max(5).optional(),
  growthRateStep: z.number({ invalid_type_error: 'Enter growth rate step' }).min(0.1).max(2).optional(),
  gridSize: z.number({ invalid_type_error: 'Enter grid size' }).min(2).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type GridCell = {
  discountRate: number;
  growthRate: number;
  dcfValue: number;
};

type ResultPayload = {
  baseDiscountRate: number;
  baseTerminalGrowthRate: number;
  presentValueOfCashFlows: number;
  terminalValue: number;
  discountRateStep: number;
  growthRateStep: number;
  gridSize: number;
  sensitivityGrid: GridCell[][];
  baseDcfValue: number;
  minDcfValue: number;
  maxDcfValue: number;
  dcfRange: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter base discount rate (WACC) and terminal growth rate.',
  'Enter present value of forecasted cash flows and terminal value.',
  'Optionally adjust grid size and step sizes for sensitivity ranges.',
  'Review sensitivity grid showing DCF value across different discount rate and growth rate combinations.',
];

const faqs = [
  {
    question: 'What is DCF sensitivity analysis?',
    answer:
      'DCF sensitivity analysis evaluates how changes in key assumptions (discount rate, terminal growth rate, cash flows) affect the discounted cash flow valuation. A sensitivity grid displays DCF values across ranges of assumptions, showing valuation sensitivity and helping identify critical assumptions.',
  },
  {
    question: 'What is a sensitivity grid?',
    answer:
      'A sensitivity grid is a table showing DCF valuation results across different combinations of key variables (typically discount rate and terminal growth rate). The grid displays how valuation changes as assumptions vary, helping assess valuation range and identify the most sensitive assumptions.',
  },
  {
    question: 'How is DCF value calculated?',
    answer:
      'DCF Value = Present Value of Forecasted Cash Flows + Present Value of Terminal Value. Terminal Value PV = Terminal Value / (1 + Discount Rate)^n, where n is the forecast period. The sensitivity grid recalculates this for different discount rate and terminal growth rate combinations.',
  },
  {
    question: 'What is discount rate (WACC)?',
    answer:
      'Discount rate (Weighted Average Cost of Capital, WACC) is the rate used to discount future cash flows to present value. It represents the required return on investment. Higher discount rates reduce present values. Typical WACC ranges vary by industry but often fall between 8-15%.',
  },
  {
    question: 'What is terminal growth rate?',
    answer:
      'Terminal growth rate is the perpetual growth rate assumed after the forecast period, used to calculate terminal value. It typically ranges from 2-4% (roughly inflation plus real GDP growth). Very high terminal growth rates (>5%) are generally unrealistic for mature companies and significantly inflate valuations.',
  },
  {
    question: 'How do I interpret the sensitivity grid?',
    answer:
      'Interpret the grid by: identifying the base case valuation, assessing valuation range across assumptions, determining which variable (discount rate or growth rate) has greater impact, identifying reasonable valuation ranges, and understanding how sensitive the valuation is to assumption changes. Wider ranges indicate higher sensitivity and valuation uncertainty.',
  },
  {
    question: 'What if the grid shows wide valuation ranges?',
    answer:
      'Wide ranges indicate high valuation sensitivity to assumptions, suggesting uncertainty. To address: refine assumptions with better data, consider using multiple valuation methods for triangulation, present valuation ranges rather than point estimates, and identify which assumptions drive the range to focus analysis on those.',
  },
  {
    question: 'How should I set discount rate and growth rate ranges?',
    answer:
      'Set ranges based on: reasonable parameter bounds (WACC typically 7-15%, terminal growth 1-4%), company and industry characteristics, historical data, and sensitivity of results. Common ranges: Â±2-3% around base discount rate, Â±1-2% around base terminal growth rate. Wider ranges show more sensitivity but may be less practical.',
  },
  {
    question: 'Which assumptions are most critical?',
    answer:
      'Most critical assumptions vary by company, but commonly include: discount rate (WACC), terminal growth rate, forecast period cash flows, terminal value calculation method, and forecast period length. Sensitivity analysis identifies which assumptions have greatest impact on valuation.',
  },
  {
    question: 'How does sensitivity analysis improve valuation?',
    answer:
      'Sensitivity analysis improves valuation by: identifying critical assumptions, quantifying valuation uncertainty, presenting valuation ranges rather than point estimates, helping decision-makers understand risks, and guiding further analysis focus. It makes valuations more robust and transparent.',
  },
];

const relatedCalculators = [
  {
    name: 'DCF Calculator',
    slug: 'dcf-calculator',
    description: 'Calculate discounted cash flow.',
  },
  {
    name: 'Enterprise Value Bridge Calculator',
    slug: 'enterprise-value-bridge-calculator',
    description: 'Calculate EV bridge to equity value.',
  },
  {
    name: 'Comparable Company (Trading Multiples) Valuation Calculator',
    slug: 'comparable-company-trading-multiples-valuation-calculator',
    description: 'Calculate comparable company valuation.',
  },
  {
    name: 'Precedent Transaction Valuation Calculator',
    slug: 'precedent-transaction-valuation-calculator',
    description: 'Calculate precedent transaction valuation.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/discounted-cash-flow-dcf-sensitivity-grid-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Discounted Cash Flow (DCF) Sensitivity Grid Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Discounted Cash Flow (DCF) Sensitivity Grid Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Create a sensitivity grid for DCF valuation showing how enterprise value changes across different discount rate and terminal growth rate assumptions.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const baseDiscountRatePct = values.baseDiscountRate / 100;
  const baseTerminalGrowthRatePct = values.baseTerminalGrowthRate / 100;
  const presentValueOfCashFlows = values.presentValueOfCashFlows;
  const terminalValue = values.terminalValue;
  const discountRateStep = values.discountRateStep ?? 1.0; // Default 1% steps
  const growthRateStep = values.growthRateStep ?? 0.5; // Default 0.5% steps
  const gridSize = values.gridSize ?? 3; // Default 3x3 grid (7x7 total with base case)
  
  // Calculate base DCF value
  // Assuming terminal value is already discounted or needs to be discounted
  // For sensitivity, we'll recalculate terminal value with different growth rates
  // Simplified: DCF = PV of CFs + PV of Terminal Value
  // Terminal Value PV depends on discount rate (assume forecast period = 5 years for discounting)
  const forecastPeriod = 5; // Typical forecast period
  const baseTerminalValuePV = terminalValue / Math.pow(1 + baseDiscountRatePct, forecastPeriod);
  const baseDcfValue = presentValueOfCashFlows + baseTerminalValuePV;
  
  // Create sensitivity grid
  // Grid shows values for discount rates and growth rates around base
  const sensitivityGrid: GridCell[][] = [];
  const gridRange = gridSize; // Number of steps in each direction
  
  // Calculate terminal value with different growth rates using perpetuity formula
  // TV = Final Year FCF Ã— (1 + g) / (WACC - g)
  // For sensitivity, we'll approximate by adjusting the base terminal value
  // Simplification: assume terminal value scales with growth rate adjustments
  
  for (let i = -gridRange; i <= gridRange; i++) {
    const row: GridCell[] = [];
    const currentGrowthRate = baseTerminalGrowthRatePct + (i * growthRateStep / 100);
    
    for (let j = -gridRange; j <= gridRange; j++) {
      const currentDiscountRate = baseDiscountRatePct + (j * discountRateStep / 100);
      
      // Recalculate terminal value PV with current discount rate
      // Adjust terminal value for growth rate change (simplified)
      const growthAdjustment = currentGrowthRate !== baseTerminalGrowthRatePct ? 
        (1 + currentGrowthRate) / (1 + baseTerminalGrowthRatePct) : 1;
      const adjustedTerminalValue = terminalValue * growthAdjustment;
      
      // Discount terminal value with current discount rate
      const terminalValuePV = adjustedTerminalValue / Math.pow(1 + currentDiscountRate, forecastPeriod);
      
      // Calculate DCF value
      const dcfValue = presentValueOfCashFlows + terminalValuePV;
      
      row.push({
        discountRate: currentDiscountRate * 100,
        growthRate: currentGrowthRate * 100,
        dcfValue,
      });
    }
    sensitivityGrid.push(row);
  }
  
  // Find min and max DCF values in grid
  const allDcfValues = sensitivityGrid.flat().map(cell => cell.dcfValue);
  const minDcfValue = Math.min(...allDcfValues);
  const maxDcfValue = Math.max(...allDcfValues);
  const dcfRange = maxDcfValue - minDcfValue;
  
  let status: ResultPayload['status'] = 'optimal';
  const rangePercent = baseDcfValue > 0 ? (dcfRange / baseDcfValue) * 100 : 0;
  let interpretation = `Base DCF value: ${baseDcfValue.toLocaleString()}. Sensitivity grid range: ${minDcfValue.toLocaleString()} to ${maxDcfValue.toLocaleString()} (${rangePercent.toFixed(1)}% range).`;
  
  if (rangePercent > 50) {
    status = 'low';
    interpretation += ' Very high sensitivity - valuation highly sensitive to assumptions.';
  } else if (rangePercent > 30) {
    status = 'moderate';
    interpretation += ' High sensitivity - valuation moderately sensitive to assumptions.';
  } else if (rangePercent > 15) {
    status = 'good';
    interpretation += ' Moderate sensitivity - valuation has reasonable stability.';
  } else {
    status = 'optimal';
    interpretation += ' Low sensitivity - valuation relatively stable across assumptions.';
  }

  const recommendations: string[] = [];
  
  // Build first recommendation
  let firstRec = `DCF sensitivity analysis: Base DCF value ${baseDcfValue.toLocaleString()} varies from ${minDcfValue.toLocaleString()} to ${maxDcfValue.toLocaleString()} across the sensitivity grid (${rangePercent.toFixed(1)}% range).`;
  if (rangePercent > 30) {
    firstRec += ' High sensitivity indicates valuation uncertainty - refine assumptions and consider using multiple valuation methods for triangulation.';
  } else {
    firstRec += ' Moderate sensitivity suggests valuation has reasonable stability across assumption ranges.';
  }
  recommendations.push(firstRec);
  
  recommendations.push('Critical assumptions: Review sensitivity grid to identify which assumptions (discount rate vs. terminal growth rate) have greater impact on valuation. Focus analysis on the most sensitive assumptions to improve valuation accuracy. Consider obtaining better data or using multiple scenarios for critical assumptions.');
  
  // Build valuation presentation recommendation
  let presentationRec = 'Valuation presentation:';
  if (rangePercent > 30) {
    presentationRec += ' Present valuation as a range rather than a single point estimate due to high sensitivity. Use the sensitivity grid to communicate valuation uncertainty to stakeholders.';
  } else {
    presentationRec += ' Valuation can be presented as a point estimate with sensitivity ranges. The grid provides context for valuation uncertainty.';
  }
  recommendations.push(presentationRec);
  
  recommendations.push('Assumption refinement: Use sensitivity analysis to guide assumption refinement. If valuation is highly sensitive to an assumption, invest more effort in accurately estimating that assumption. Compare sensitivity results to other valuation methods for validation.');
  
  if (rangePercent > 50) {
    recommendations.push('CRITICAL: Very high sensitivity (>50% range) indicates extreme valuation uncertainty. Review base assumptions, consider if forecast period cash flows or terminal value calculations are appropriate, validate discount rate and growth rate assumptions, and use multiple valuation methods to triangulate. High sensitivity may indicate the model needs refinement.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate DCF sensitivity grid: Base value ${baseDcfValue.toLocaleString()}, range ${minDcfValue.toLocaleString()} to ${maxDcfValue.toLocaleString()} (${rangePercent.toFixed(1)}% spread). Review grid to identify most sensitive assumptions.` },
    { label: 'This Month', detail: 'Refine assumptions based on sensitivity analysis. Focus on improving estimates for the most sensitive assumptions. Compare DCF sensitivity results to other valuation methods (comparable companies, precedent transactions) for triangulation. Present valuation as range if sensitivity is high.' },
    { label: 'Ongoing', detail: 'Update sensitivity analysis as assumptions change or new information becomes available. Use sensitivity grid to communicate valuation uncertainty to stakeholders. Regularly validate assumptions against market data and other valuation methods. Incorporate sensitivity analysis into valuation decision-making processes.' },
  ];

  return { baseDiscountRate: values.baseDiscountRate, baseTerminalGrowthRate: values.baseTerminalGrowthRate, presentValueOfCashFlows, terminalValue, discountRateStep, growthRateStep, gridSize: gridRange * 2 + 1, sensitivityGrid, baseDcfValue, minDcfValue, maxDcfValue, dcfRange, interpretation, status, recommendations, plan };
};

export default function DiscountedCashFlowDcfSensitivityGridCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseDiscountRate: undefined,
      baseTerminalGrowthRate: undefined,
      presentValueOfCashFlows: undefined,
      terminalValue: undefined,
      discountRateStep: undefined,
      growthRateStep: undefined,
      gridSize: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="dcf-sensitivity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Discounted Cash Flow (DCF) Sensitivity Grid Calculator
          </CardTitle>
          <CardDescription>Create a sensitivity grid for DCF valuation showing how enterprise value changes across different discount rate and terminal growth rate assumptions.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your DCF and sensitivity parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="presentValueOfCashFlows"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PV of Forecasted Cash Flows</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="terminalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terminal Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="baseDiscountRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Discount Rate (WACC) (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="baseTerminalGrowthRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Terminal Growth Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discountRateStep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Rate Step (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0.1" max="5" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Default: 1%</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="growthRateStep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Growth Rate Step (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0.1" max="2" placeholder="e.g., 0.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Default: 0.5%</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gridSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grid Size (Range) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="2" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Default: 3 (7x7 grid)</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Generate Sensitivity Grid
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
            <CardDescription>See DCF sensitivity grid and valuation range.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Base DCF Value</p>
                <p className="text-2xl font-semibold text-primary">{result.baseDcfValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Base case</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Min DCF Value</p>
                <p className="text-2xl font-semibold text-primary">{result.minDcfValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Lowest in grid</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Max DCF Value</p>
                <p className="text-2xl font-semibold text-primary">{result.maxDcfValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Highest in grid</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Valuation Range</p>
                <p className="text-2xl font-semibold text-primary">{result.dcfRange.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sensitivity Grid</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-100 dark:bg-gray-800">Growth Rate \ WACC</th>
                      {result.sensitivityGrid[0]?.map((cell, idx) => (
                        <th key={idx} className="border p-2 bg-gray-100 dark:bg-gray-800">
                          {cell.discountRate.toFixed(1)}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.sensitivityGrid.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className="border p-2 bg-gray-100 dark:bg-gray-800 font-semibold">
                          {row[0]?.growthRate.toFixed(1)}%
                        </td>
                        {row.map((cell, colIdx) => (
                          <td
                            key={colIdx}
                            className={`border p-2 text-center ${
                              cell.dcfValue === result.baseDcfValue
                                ? 'bg-primary/20 font-bold'
                                : cell.dcfValue >= result.baseDcfValue * 0.95 && cell.dcfValue <= result.baseDcfValue * 1.05
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : ''
                            }`}
                          >
                            {cell.dcfValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Values in thousands. Highlighted cell shows base case.</p>
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
            <strong>DCF Value</strong> = PV of Forecasted Cash Flows + PV of Terminal Value
          </p>
          <p>
            <strong>PV of Terminal Value</strong> = Terminal Value / (1 + Discount Rate)^n
          </p>
          <p>Where n = forecast period (typically 5 years)</p>
          <p>
            <strong>Terminal Value</strong> = Final Year FCF Ã— (1 + g) / (WACC - g)
          </p>
          <p>Where g = terminal growth rate, WACC = discount rate</p>
          <p>The sensitivity grid recalculates DCF value for different combinations of discount rate (WACC) and terminal growth rate, showing how valuation changes as assumptions vary. This helps assess valuation sensitivity, identify critical assumptions, and present valuation ranges rather than single point estimates.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Range %</p>
                <p className="text-xl font-semibold text-primary">
                  {result.baseDcfValue > 0 ? ((result.dcfRange / result.baseDcfValue) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Of base value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Grid Size</p>
                <p className="text-xl font-semibold text-primary">{result.gridSize}Ã—{result.gridSize}</p>
                <p className="text-xs text-muted-foreground">Rows Ã— Columns</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Base Discount Rate</p>
                <p className="text-xl font-semibold text-primary">{result.baseDiscountRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">WACC</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Base Growth Rate</p>
                <p className="text-xl font-semibold text-primary">{result.baseTerminalGrowthRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Terminal growth</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your DCF and sensitivity parameters to see additional insights.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
    <meta itemProp="name" content="The Complete Guide to DCF Sensitivity Analysis: Sensitivity Grid for Valuation" />
    <meta itemProp="description" content="An in-depth guide on DCF sensitivity analysis, creating sensitivity grids to evaluate how valuation changes with different discount rate and terminal growth rate assumptions." />
    <meta itemProp="keywords" content="DCF sensitivity analysis, sensitivity grid, discounted cash flow, valuation sensitivity, scenario analysis, WACC sensitivity" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/discounted-cash-flow-dcf-sensitivity-grid-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to DCF Sensitivity Analysis: Sensitivity Grid for Valuation</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at DCF sensitivity analysis, creating sensitivity grids to evaluate how valuation changes with different discount rate and terminal growth rate assumptions.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Understanding DCF Sensitivity Analysis</a></li>
        <li><a href="#grid" className="hover:underline">Sensitivity Grid Construction</a></li>
        <li><a href="#assumptions" className="hover:underline">Key Assumptions</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting Results</a></li>
        <li><a href="#application" className="hover:underline">Practical Application</a></li>
        <li><a href="#best" className="hover:underline">Best Practices</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding DCF Sensitivity Analysis</h2>
    <p>DCF sensitivity analysis evaluates how changes in key assumptions affect the discounted cash flow valuation, helping assess valuation uncertainty and identify critical assumptions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Purpose</h3>
    <p>Sensitivity analysis helps:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Quantify valuation uncertainty</li>
        <li>Identify critical assumptions</li>
        <li>Present valuation ranges</li>
        <li>Guide assumption refinement</li>
        <li>Improve valuation robustness</li>
    </ul>

<hr className="my-6" />

    <h2 id="grid" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sensitivity Grid Construction</h2>
    <p>A sensitivity grid displays DCF values across ranges of key assumptions, typically discount rate and terminal growth rate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Grid Structure</h3>
    <p>The grid shows DCF values for different combinations of:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Discount rate (rows or columns)</li>
        <li>Terminal growth rate (columns or rows)</li>
        <li>Each cell shows DCF value for that combination</li>
    </ul>

<hr className="my-6" />

    <h2 id="assumptions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Assumptions</h2>
    <p>DCF sensitivity typically focuses on the most uncertain assumptions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Discount Rate (WACC)</h3>
    <p>Variations in discount rate significantly affect valuation. Typical sensitivity ranges: Â±2-3% around base WACC.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Terminal Growth Rate</h3>
    <p>Terminal growth rate affects terminal value substantially. Typical sensitivity ranges: Â±1-2% around base growth rate.</p>

<hr className="my-6" />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results</h2>
    <p>Interpret sensitivity grids to assess valuation stability and identify critical assumptions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Range Analysis</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Narrow ranges (&lt;15%): Low sensitivity, stable valuation</li>
        <li>Moderate ranges (15-30%): Moderate sensitivity</li>
        <li>Wide ranges (&gt;30%): High sensitivity, valuation uncertainty</li>
    </ul>

<hr className="my-6" />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Application</h2>
    <p>Use sensitivity analysis to improve valuation quality and communication.</p>

<hr className="my-6" />

    <h2 id="best" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Best Practices</h2>
    <p>Best practices include: using reasonable assumption ranges, presenting ranges rather than point estimates when sensitivity is high, identifying critical assumptions, and triangulating with other valuation methods.</p>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>DCF sensitivity analysis through sensitivity grids provides valuable insights into valuation uncertainty and critical assumptions. By calculating DCF values across ranges of discount rates and terminal growth rates, analysts can assess valuation sensitivity, identify areas requiring better data, and present more robust valuations. Sensitivity analysis improves valuation quality and helps decision-makers understand risks and uncertainties.</p>
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
          <p>This tool creates a sensitivity grid for DCF valuation showing how enterprise value changes across different discount rate and terminal growth rate assumptions.</p>
          <p>Outputs include sensitivity grid table, base DCF value, min/max values, valuation range, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
