
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Sensitivity Analysis
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
