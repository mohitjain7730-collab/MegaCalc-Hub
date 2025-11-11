
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
import { SlidersHorizontal, Calculator, Info, FileText, TrendingUp, Target } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  initialInvestment: z.number().positive(),
  annualCashFlow: z.number().positive(),
  projectLife: z.number().int().positive(),
  variableToTest: z.enum(['discountRate', 'annualCashFlow']),
  startValue: z.number(),
  endValue: z.number(),
  step: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;
type AnalysisResult = { variable: string, value: number, npv: number };

export default function SensitivityAnalysisCalculator() {
  const [results, setResults] = useState<AnalysisResult[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        initialInvestment: undefined,
        annualCashFlow: undefined,
        projectLife: undefined,
        variableToTest: 'discountRate',
        startValue: undefined,
        endValue: undefined,
        step: undefined,
    },
  });

  const calculateNPV = (rate: number, cf: number, life: number, initial: number) => {
    let npv = -initial;
    for (let t = 1; t <= life; t++) {
      npv += cf / Math.pow(1 + rate, t);
    }
    return npv;
  };

  const onSubmit = (values: FormValues) => {
    const analysisResults: AnalysisResult[] = [];
    const iterations = (values.endValue - values.startValue) / values.step;
    if (iterations > 100) { // Limit iterations
        form.setError("step", { message: "Range/step results in too many iterations."});
        return;
    }
    
    for (let i = values.startValue; i <= values.endValue; i += values.step) {
      let npv = 0;
      if (values.variableToTest === 'discountRate') {
        npv = calculateNPV(i / 100, values.annualCashFlow, values.projectLife, values.initialInvestment);
      } else { // testing annualCashFlow
        npv = calculateNPV(values.startValue / 100, i, values.projectLife, values.initialInvestment);
      }
      analysisResults.push({ variable: values.variableToTest === 'discountRate' ? `${i.toFixed(2)}%` : `$${i}`, value: i, npv });
    }
    setResults(analysisResults);
  };
  
  const variable = form.watch("variableToTest");

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Sensitivity Analysis Parameters
          </CardTitle>
          <CardDescription>
            Enter project details and specify which variable to test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Base NPV Model</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="annualCashFlow" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Cash Flow ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 30000"
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
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sensitivity Analysis Setup</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField 
                    control={form.control} 
                    name="variableToTest" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variable to Test</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="discountRate">Discount Rate</SelectItem>
                            <SelectItem value="annualCashFlow">Annual Cash Flow</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                  <FormField 
                    control={form.control} 
                    name="startValue" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Value {variable === 'discountRate' ? '(%)' : '($)'}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={variable === 'discountRate' ? "e.g., 5" : "e.g., 20000"}
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
                    name="endValue" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Value {variable === 'discountRate' ? '(%)' : '($)'}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={variable === 'discountRate' ? "e.g., 15" : "e.g., 40000"}
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
                    name="step" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Step</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 1"
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
              
              <Button type="submit">Run Analysis</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <SlidersHorizontal className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Sensitivity Analysis Results</CardTitle>
                <CardDescription>NPV impact of varying {variable === 'discountRate' ? 'discount rate' : 'annual cash flow'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{variable === 'discountRate' ? 'Discount Rate' : 'Annual Cash Flow'}</TableHead>
                    <TableHead className="text-right">Net Present Value (NPV)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map(item => (
                    <TableRow key={item.value}>
                      <TableCell>{item.variable}</TableCell>
                      <TableCell className="text-right">${item.npv.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            <h4 className="font-semibold text-foreground mb-2">Initial Investment</h4>
            <p className="text-muted-foreground">
              The upfront cost of the project that will be recovered through future cash flows. This is the amount invested at time zero.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Annual Cash Flow</h4>
            <p className="text-muted-foreground">
              The net cash received each year from the project. This is typically the revenue minus operating expenses.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Project Life</h4>
            <p className="text-muted-foreground">
              The total duration of the project in years. This determines how many years of cash flows will be discounted.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Variable to Test</h4>
            <p className="text-muted-foreground">
              The input variable you want to vary to see how it impacts NPV. You can test either the discount rate or the annual cash flow while keeping other variables constant.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Start Value, End Value, and Step</h4>
            <p className="text-muted-foreground">
              These define the range and granularity of the sensitivity analysis. Start and end values set the testing range, while step determines the increment between each test value.
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
            Explore other financial analysis and modeling calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/scenario-analysis-calculator" className="text-primary hover:underline">
                  Scenario Analysis Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Evaluate project outcomes under best, base, and worst case scenarios.
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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Sensitivity Analysis: 'What-If' Modeling and Risk Assessment" />
    <meta itemProp="description" content="An expert guide detailing the methodology of Sensitivity Analysis, including its comparison to scenario analysis, the calculation of break-even points, and its critical role in identifying the most influential variables in financial models." />
    <meta itemProp="keywords" content="sensitivity analysis financial modeling, how to perform what-if analysis, calculating break-even point sensitivity, key driver identification, risk tolerance metric, discount rate impact analysis" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-sensitivity-analysis-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Sensitivity Analysis: Identifying Key Drivers and Risk</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental 'What-If' technique used to measure how changes in a single variable impact the outcome of a complex financial model.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Sensitivity Analysis: Core Concept and Purpose</a></li>
        <li><a href="#mechanics" className="hover:underline">Modeling Mechanics: Isolating a Single Variable</a></li>
        <li><a href="#metrics" className="hover:underline">Key Output Metrics: Break-Even Point Calculation</a></li>
        <li><a href="#vs-scenario" className="hover:underline">Sensitivity vs. Scenario Analysis (Risk Spectrum)</a></li>
        <li><a href="#applications" className="hover:underline">Applications in Capital Budgeting and Valuation</a></li>
    </ul>
<hr />

    {/* SENSITIVITY ANALYSIS: CORE CONCEPT AND PURPOSE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sensitivity Analysis: Core Concept and Purpose</h2>
    <p>Sensitivity Analysis is a risk assessment technique that systematically measures how changes in an individual input variable affect a key output metric (e.g., Net Present Value, profit margin, or required sales volume) in a financial model.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The 'What-If' Principle</h3>
    <p>The analysis operates on the **'What-If'** principle: holding all other variables constant, what happens if the sales price drops by 5%? Or, what happens if the cost of capital increases by 100 basis points? By isolating one variable at a time, the model identifies the **key drivers**—the variables that exert the greatest influence on the final result.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Tolerance Metric</h3>
    <p>The output of sensitivity analysis quantifies the model's susceptibility to changes in assumptions. A model that shows a large change in the output metric resulting from a small change in an input variable is considered **highly sensitive** and, therefore, riskier.</p>

<hr />

    {/* MODELING MECHANICS: ISOLATING A SINGLE VARIABLE */}
    <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Modeling Mechanics: Isolating a Single Variable</h2>
    <p>Performing sensitivity analysis involves running the model multiple times while systematically varying one input variable across a defined range (e.g., $\pm 10\%$).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Defining the Range</h3>
    <p>The input range must be plausible. For variables with high uncertainty (e.g., market share, commodity prices), a wider range (e.g., $\pm 20\%$) is often appropriate. For variables with low uncertainty (e.g., cost of debt, equipment lifespan), a narrow range (e.g., $\pm 5\%$) is used. This process generates a spectrum of possible outcomes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Tornado Diagram</h3>
    <p>The results of sensitivity analysis are often summarized visually in a **Tornado Diagram**. This chart lists the input variables in descending order of their impact on the output metric. The variable at the top of the "tornado" is the most critical driver of the project's success or failure, allowing management to focus risk mitigation efforts there.</p>

<hr />

    {/* KEY OUTPUT METRICS: BREAK-EVEN POINT CALCULATION */}
    <h2 id="metrics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Output Metrics: Break-Even Point Calculation</h2>
    <p>One of the most valuable outputs of sensitivity analysis is the **Break-Even Point (BEP)**—the threshold at which the project generates neither profit nor loss (NPV equals zero).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculation for Capital Budgeting</h3>
    <p>For investment analysis (like Net Present Value - NPV), the break-even point is the value of an input variable that causes the NPV to drop from positive to zero. For example, if the initial NPV is $1$ million dollars, the analyst can determine the required decrease in the sales price that would make the NPV zero.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Break-Even Point = Input Value that sets NPV = 0'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation as Margin of Safety</h3>
    <p>The difference between the expected value of an input variable and its break-even value is the **Margin of Safety**. A large margin of safety indicates that the project can absorb significant adverse changes in that variable and remain viable, signaling lower risk.</p>

<hr />

    {/* SENSITIVITY VS. SCENARIO ANALYSIS (RISK SPECTRUM) */}
    <h2 id="vs-scenario" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sensitivity vs. Scenario Analysis (Risk Spectrum)</h2>
    <p>Sensitivity analysis and Scenario Analysis are both tools for risk modeling but address different parts of the risk spectrum.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sensitivity Analysis (Local View)</h3>
    <p>Sensitivity analysis provides a **local view** of risk. It tests one variable's elasticity at a time, providing mathematical precision. It is excellent for answering focused questions like, "How much does the required rate of return have to change before the project becomes unprofitable?"</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Scenario Analysis (Global View)</h3>
    <p>Scenario analysis provides a **global view** of risk. It changes multiple, correlated variables simultaneously to simulate a plausible future state (e.g., a recession, a trade war). It is better suited for holistic risk assessment, showing the total impact of systemic risk.</p>
    <p>Ideally, firms use sensitivity analysis first to identify the three to five most critical variables, and then use scenario analysis to model the impact of those variables moving together.</p>

<hr />

    {/* APPLICATIONS IN CAPITAL BUDGETING AND VALUATION */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications in Capital Budgeting and Valuation</h2>
    <p>Sensitivity analysis is indispensable across all areas of finance where future uncertainty exists.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Capital Budgeting Decisions</h3>
    <p>When evaluating large capital expenditure (CapEx) projects, sensitivity analysis helps firms decide which projects to fund. If two projects have similar expected NPVs, the firm will choose the one with the lowest sensitivity to key variables like sales volume or input cost, as this represents lower financial risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Valuation and Due Diligence</h3>
    <p>In mergers, acquisitions, and equity valuation (using Discounted Cash Flow - DCF), sensitivity analysis is performed on the discount rate (WACC) and the Terminal Value growth rate. This reveals the range of fair value for the target company based on minor adjustments to the most uncertain and high-impact modeling assumptions.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Sensitivity analysis is the foundational risk tool in financial modeling, isolating the impact of changes in a single input variable on a key output metric. Its value lies in identifying the **key drivers** of a model through the use of the **Tornado Diagram**.</p>
    <p>By determining the **Break-Even Point** and the resulting **Margin of Safety**, decision-makers can quantify the risk tolerance of an investment, ensuring that high-value projects are selected based not only on potential returns but also on their inherent stability under varying economic assumptions.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about sensitivity analysis and what-if scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is sensitivity analysis and why is it important?</h4>
            <p className="text-muted-foreground">
              Sensitivity analysis tests how changes in one key variable affect a financial model's output. It helps identify which variables have the most impact on project viability and where decision-makers should focus attention.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How is sensitivity analysis different from scenario analysis?</h4>
            <p className="text-muted-foreground">
              Sensitivity analysis varies one variable at a time while keeping others constant. Scenario analysis changes multiple variables simultaneously to represent different plausible outcomes (best case, base case, worst case).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What variables should I test in sensitivity analysis?</h4>
            <p className="text-muted-foreground">
              Focus on variables that are uncertain or have significant impact: discount rates, revenue projections, costs, project timing, and key assumptions. These are typically the inputs management has least control over.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I interpret sensitivity analysis results?</h4>
            <p className="text-muted-foreground">
              Look for the break-even point where NPV becomes zero, the range of NPV variation, and how steep the curve is. Steeper curves indicate higher sensitivity to that variable.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a tornado diagram in sensitivity analysis?</h4>
            <p className="text-muted-foreground">
              A tornado diagram is a graphical representation that shows which variables have the greatest impact on the output, ranked by sensitivity. Variables are displayed horizontally with the most sensitive at the top.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I test all variables simultaneously or one at a time?</h4>
            <p className="text-muted-foreground">
              Start with one-at-a-time sensitivity analysis to identify key drivers. Then use scenario analysis to test combinations of variables changing together, which reflects real-world correlations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I determine realistic ranges for variables to test?</h4>
            <p className="text-muted-foreground">
              Base ranges on historical data, industry benchmarks, expert opinions, and statistical confidence intervals. Consider both historical variation and future uncertainties.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What does a positive NPV in all scenarios mean?</h4>
            <p className="text-muted-foreground">
              A positive NPV across all tested scenarios indicates a robust project that remains profitable even under adverse conditions. This provides confidence in the investment decision.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I present sensitivity analysis results to stakeholders?</h4>
            <p className="text-muted-foreground">
              Use charts, tables, and summary statistics. Highlight the most sensitive variables, break-even points, and the range of possible outcomes. Emphasize what drives project risk.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can sensitivity analysis help with risk management?</h4>
            <p className="text-muted-foreground">
              Yes. By identifying key risk drivers, sensitivity analysis helps focus risk mitigation efforts on the variables that most affect project outcomes. This enables proactive risk management strategies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
