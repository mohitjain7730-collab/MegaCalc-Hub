
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Drama, Calculator, Info, FileText, TrendingUp, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const scenarioSchema = z.object({
  unitsSold: z.number().nonnegative().optional(),
  pricePerUnit: z.number().nonnegative().optional(),
  variableCost: z.number().nonnegative().optional(),
  fixedCosts: z.number().nonnegative().optional(),
});

const formSchema = z.object({
  initialInvestment: z.number().positive(),
  projectLife: z.number().int().positive(),
  discountRate: z.number().positive(),
  baseCase: scenarioSchema,
  bestCase: scenarioSchema,
  worstCase: scenarioSchema,
});

type FormValues = z.infer<typeof formSchema>;
type NpvResult = { name: string; npv: number };

export default function ScenarioAnalysisCalculator() {
  const [results, setResults] = useState<NpvResult[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      projectLife: undefined,
      discountRate: undefined,
      baseCase: { unitsSold: undefined, pricePerUnit: undefined, variableCost: undefined, fixedCosts: undefined },
      bestCase: { unitsSold: undefined, pricePerUnit: undefined, variableCost: undefined, fixedCosts: undefined },
      worstCase: { unitsSold: undefined, pricePerUnit: undefined, variableCost: undefined, fixedCosts: undefined },
    },
  });

  const calculateNPV = (values: z.infer<typeof scenarioSchema>, discountRate: number, projectLife: number, initialInvestment: number) => {
    if(!values.unitsSold || !values.pricePerUnit || !values.variableCost || values.fixedCosts === undefined) return 0;
    const annualCashFlow = (values.pricePerUnit * values.unitsSold) - (values.variableCost * values.unitsSold) - values.fixedCosts;
    let npv = -initialInvestment;
    for (let t = 1; t <= projectLife; t++) {
      npv += annualCashFlow / Math.pow(1 + (discountRate / 100), t);
    }
    return npv;
  };

  const onSubmit = (values: FormValues) => {
    const { initialInvestment, projectLife, discountRate, baseCase, bestCase, worstCase } = values;
    setResults([
      { name: 'Worst Case', npv: calculateNPV(worstCase, discountRate, projectLife, initialInvestment) },
      { name: 'Base Case', npv: calculateNPV(baseCase, discountRate, projectLife, initialInvestment) },
      { name: 'Best Case', npv: calculateNPV(bestCase, discountRate, projectLife, initialInvestment) },
    ]);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Scenario Analysis Parameters
          </CardTitle>
          <CardDescription>
            Enter project details and define worst, base, and best case scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Assumptions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField 
                    control={form.control} 
                    name="initialInvestment" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Investment ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 100000"
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
                    name="projectLife" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Life (Years)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 5"
                            {...field} 
                            value={field.value ?? ''} 
                            onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                  <FormField 
                    control={form.control} 
                    name="discountRate" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 10"
                            {...field} 
                            value={field.value ?? ''} 
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {['worstCase', 'baseCase', 'bestCase'].map(scenario => (
                  <Card key={scenario}>
                    <CardHeader>
                      <CardTitle className="text-lg">{scenario.replace('Case', ' Case')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField 
                        control={form.control} 
                        name={`${scenario as keyof FormValues}.unitsSold`} 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Units Sold/Year</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 1000"
                                {...field} 
                                value={field.value ?? ''} 
                                onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                      <FormField 
                        control={form.control} 
                        name={`${scenario as keyof FormValues}.pricePerUnit`} 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price/Unit ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 50"
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
                        name={`${scenario as keyof FormValues}.variableCost`} 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variable Cost/Unit ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 25"
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
                        name={`${scenario as keyof FormValues}.fixedCosts`} 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fixed Costs/Year ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 10000"
                                {...field} 
                                value={field.value ?? ''} 
                                onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button type="submit">Run Scenario Analysis</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Drama className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Scenario Analysis Results (NPV)</CardTitle>
                <CardDescription>Comparison of worst, base, and best case scenarios</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {results.map(res => (
                <div 
                  key={res.name} 
                  className={`p-6 rounded-lg border-2 ${res.npv < 0 ? 'bg-destructive/10 border-destructive/50' : 'bg-green-500/10 border-green-500/50'}`}
                >
                  <p className="font-semibold mb-2">{res.name}</p>
                  <p className={`text-3xl font-bold ${res.npv < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    ${res.npv.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </p>
                  <Badge 
                    variant={res.npv < 0 ? 'destructive' : 'default'} 
                    className="mt-2"
                  >
                    {res.npv < 0 ? 'Not Viable' : 'Viable'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Project Assumptions</h4>
            <p className="text-muted-foreground">
              These are the core financial variables for your project: the upfront cost (Initial Investment), its lifespan in years, and the Discount Rate (your required rate of return) used to value future cash flows.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Scenario Variables</h4>
            <p className="text-muted-foreground">
              For each scenario (Worst, Base, Best), you define a complete set of assumptions for calculating annual cash flow: Units Sold, Price Per Unit, Variable Cost Per Unit, and total Fixed Costs. The annual cash flow is calculated as (Price × Units) - (Variable Cost × Units) - Fixed Costs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Scenario Definitions</h4>
            <p className="text-muted-foreground">
              <strong>Worst Case:</strong> Pessimistic assumptions (low sales, low prices, high costs). <strong>Base Case:</strong> Most likely scenario based on realistic expectations. <strong>Best Case:</strong> Optimistic assumptions (high sales, favorable prices, efficient costs).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other investment analysis and financial modeling calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/sensitivity-analysis-what-if-calculator" className="text-primary hover:underline">
                  Sensitivity Analysis Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Analyze how changing one variable impacts NPV outcomes.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/npv-calculator" className="text-primary hover:underline">
                  Net Present Value (NPV) Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the present value of future cash flows to evaluate investment profitability.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/irr-calculator" className="text-primary hover:underline">
                  Internal Rate of Return (IRR) Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the discount rate that makes NPV zero for an investment.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/break-even-point-calculator" className="text-primary hover:underline">
                  Break-Even Point Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the sales volume needed to cover all costs and break even.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Scenario Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about scenario analysis and multi-variable risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is scenario analysis and how does it differ from sensitivity analysis?</h4>
            <p className="text-muted-foreground">
              Scenario analysis evaluates outcomes under different coherent sets of assumptions (worst, base, best cases), changing multiple variables simultaneously. Sensitivity analysis tests one variable at a time. Scenarios represent more realistic combinations of changes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How should I define worst case, base case, and best case scenarios?</h4>
            <p className="text-muted-foreground">
              Worst case reflects pessimistic but plausible assumptions (lower sales, higher costs, unfavorable market conditions). Base case represents your most realistic expectations. Best case is optimistic but achievable (high sales, favorable pricing, efficient operations).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What does a negative NPV in all scenarios mean?</h4>
            <p className="text-muted-foreground">
              If NPV is negative under all scenarios including best case, the project is likely not financially viable. This suggests the investment cannot generate sufficient returns even under optimistic conditions, indicating a high-risk proposition.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I use scenario analysis for every investment decision?</h4>
            <p className="text-muted-foreground">
              Scenario analysis is most valuable for major investments, strategic decisions, projects with significant uncertainty, or when multiple risk factors are present. For smaller, low-risk decisions, simpler analysis may suffice.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I interpret scenario analysis results?</h4>
            <p className="text-muted-foreground">
              Compare the NPV range across scenarios. A wide range indicates high uncertainty and risk. Look for consistency: if worst case is negative but base and best are positive, you have upside potential with downside protection. If base case is positive, the project is viable under expected conditions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between scenario analysis and Monte Carlo simulation?</h4>
            <p className="text-muted-foreground">
              Scenario analysis uses discrete, predefined scenarios. Monte Carlo simulation runs thousands of iterations with randomly selected variable values from probability distributions, providing a more comprehensive risk assessment but requiring more complex modeling.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I assign probabilities to scenarios?</h4>
            <p className="text-muted-foreground">
              Assign probabilities based on historical data, expert judgment, and market analysis. A typical approach: 20% worst case, 60% base case, 20% best case. Multiply NPV by probability and sum for expected NPV.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can scenario analysis help with strategic planning?</h4>
            <p className="text-muted-foreground">
              Yes. Scenario analysis helps identify key risk drivers, develop contingency plans, set performance targets, allocate resources, and make informed strategic decisions by understanding potential outcomes under different conditions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What variables should I include in scenario analysis?</h4>
            <p className="text-muted-foreground">
              Focus on variables with high impact and uncertainty: demand/units sold, pricing, variable costs, fixed costs, project timing, market conditions, and operational efficiency. These typically drive most of the project's risk and return.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How often should I update scenario analysis?</h4>
            <p className="text-muted-foreground">
              Update scenarios when major market conditions change, new information becomes available, assumptions prove incorrect, or at key decision points in the project lifecycle. Regular reviews (quarterly or semi-annually) help maintain relevance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
