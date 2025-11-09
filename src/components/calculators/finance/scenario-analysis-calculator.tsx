
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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Scenario Analysis: Financial Modeling, Stress Testing, and Risk Management" />
    <meta itemProp="description" content="An expert guide detailing the methodology of Scenario Analysis, including its comparison to sensitivity analysis, structuring base, best, and worst-case scenarios, and its application in capital budgeting and financial forecasting." />
    <meta itemProp="keywords" content="scenario analysis financial modeling, how to structure scenarios, stress testing risk management, best case worst case analysis, Monte Carlo simulation comparison, capital budgeting risk analysis" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-scenario-analysis-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Scenario Analysis: Modeling Outcomes and Managing Financial Risk</h1>
    <p className="text-lg italic text-muted-foreground">Master the structured forecasting technique that quantifies the impact of major, interconnected changes on a project's profitability or a company's value.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">Scenario Analysis: Definition and Core Purpose</a></li>
        <li><a href="#structure" className="hover:underline">Structuring Scenarios: Base, Best, and Worst Cases</a></li>
        <li><a href="#methodology" className="hover:underline">Modeling Methodology and Output Metrics</a></li>
        <li><a href="#vs-sensitivity" className="hover:underline">Scenario Analysis vs. Sensitivity Analysis</a></li>
        <li><a href="#applications" className="hover:underline">Applications in Corporate Finance and Banking</a></li>
    </ul>
<hr />

    {/* SCENARIO ANALYSIS: DEFINITION AND CORE PURPOSE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Scenario Analysis: Definition and Core Purpose</h2>
    <p>Scenario Analysis is a risk management technique that evaluates the potential outcomes of a decision (such as launching a new product or valuing a company) by simulating its performance under a limited number of plausible, predefined **future states** or scenarios.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Holistic Risk Assessment</h3>
    <p>Unlike other risk tools that test one variable at a time, scenario analysis tests the impact of multiple, interconnected variables changing simultaneously. For example, a "Recession" scenario would simultaneously lower sales growth, increase the cost of capital, and lengthen payment collection times.</p>
    <p>The output provides a range of potential financial results (e.g., Net Present Value, Profit Margin, or Solvency) that corresponds to each predefined future state.</p>

<hr />

    {/* STRUCTURING SCENARIOS: BASE, BEST, AND WORST CASES */}
    <h2 id="structure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Structuring Scenarios: Base, Best, and Worst Cases</h2>
    <p>Most models utilize three foundational scenarios to define the probable range of results, anchored by the central Base Case.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Base Case (Most Likely)</h3>
    <p>The **Base Case** represents the central or expected outcome. It uses the analyst's most realistic assumptions for key drivers like GDP growth, inflation, market share, and interest rates. This scenario typically serves as the primary benchmark for valuing the project or company.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Best Case (Optimistic)</h3>
    <p>The **Best Case** incorporates a series of favorable assumptions (e.g., higher-than-expected sales, lower production costs, faster market adoption). It defines the upper boundary of the possible financial outcomes and provides a view of the maximum potential return.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Worst Case (Pessimistic / Stress Test)</h3>
    <p>The **Worst Case** incorporates adverse, but plausible, assumptions (e.g., economic recession, supply chain collapse, competitive entry). This scenario is used for **stress testing**—determining the resilience of the project or company and identifying the minimum acceptable return or the point of failure.</p>

<hr />

    {/* MODELING METHODOLOGY AND OUTPUT METRICS */}
    <h2 id="methodology" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Modeling Methodology and Output Metrics</h2>
    <p>The modeling process requires explicitly defining the relationship between the macroeconomic environment and the operational variables of the project being evaluated.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mapping Drivers to Variables</h3>
    <p>The key step is establishing the **links** between the external scenario (e.g., High Inflation) and the internal financial model variables (e.g., Cost of Goods Sold increases by 8%, and the Discount Rate increases by 150 basis points). All variables must be internally consistent within a single scenario.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Output Metrics</h3>
    <p>For each scenario, the model calculates a primary decision metric, typically:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Net Present Value (NPV):</strong> For capital budgeting projects, used to see if the project remains viable (NPV > 0) under adverse conditions.</li>
        <li><strong className="font-semibold">Internal Rate of Return (IRR):</strong> Used to see if the project's return falls below the minimum required hurdle rate in the worst case.</li>
        <li><strong className="font-semibold">Probability-Weighted Expected Value (PWEV):</strong> Advanced models assign a probability weight to each scenario and sum the weighted results to find a single expected value.</li>
    </ul>

<hr />

    {/* SCENARIO ANALYSIS VS. SENSITIVITY ANALYSIS */}
    <h2 id="vs-sensitivity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Scenario Analysis vs. Sensitivity Analysis</h2>
    <p>While often confused, scenario analysis and sensitivity analysis serve fundamentally different purposes in risk assessment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sensitivity Analysis (One Variable)</h3>
    <p>Sensitivity Analysis isolates a single, key input variable (e.g., unit sales price or WACC) and tests how much the final metric (e.g., NPV) changes when that single variable moves by a fixed percentage. It identifies the **most critical variables** in the model.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Scenario Analysis (Multiple Variables)</h3>
    <p>Scenario Analysis changes **multiple correlated variables simultaneously**. It answers the question, "What happens if the world changes in a specific, predefined way?" This makes it better suited for holistic risk assessment, as macroeconomic events rarely affect only one variable in isolation.</p>

<hr />

    {/* APPLICATIONS IN CORPORATE FINANCE AND BANKING */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications in Corporate Finance and Banking</h2>
    <p>Scenario analysis is a compulsory tool in highly regulated and capital-intensive industries.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Corporate Finance</h3>
    <p>Companies use scenario analysis before undertaking large capital expenditures (CapEx), such as building a factory or acquiring a competitor. It determines the probability that the investment will fail to meet the company's financial targets under adverse economic conditions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Bank Stress Testing (Regulatory Requirement)</h3>
    <p>Central banks and regulatory bodies (like the Federal Reserve) require major financial institutions to perform **stress tests**. These are extreme forms of scenario analysis (e.g., simulating a $50\%$ drop in real estate values combined with a $10\%$ unemployment rate) to ensure the institutions maintain sufficient capital reserves to survive a severe, systemic economic crisis.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Scenario Analysis is a sophisticated risk management methodology that evaluates financial outcomes under plausible, internally consistent, multiple-variable changes.</p>
    <p>By structuring **Base, Best, and Worst-Case Scenarios** and calculating key metrics like NPV or IRR for each, analysts quantify the full range of potential financial results. This provides decision-makers with a robust understanding of the project's sensitivity to macro-level events, moving beyond single-variable analysis to holistic risk modeling.</p>
</section>

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
