'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Activity } from 'lucide-react';

const formSchema = z.object({
  scenario1Probability: z.number().min(0).max(100).optional(),
  scenario1NPV: z.number().optional(),
  scenario2Probability: z.number().min(0).max(100).optional(),
  scenario2NPV: z.number().optional(),
  scenario3Probability: z.number().min(0).max(100).optional(),
  scenario3NPV: z.number().optional(),
  scenario4Probability: z.number().min(0).max(100).optional(),
  scenario4NPV: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapitalBudgetingRiskStandardDeviationCalculator() {
  const [result,setResult]=useState<{expectedNPV:number; variance:number; standardDeviation:number; coefficientOfVariation:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{scenario1Probability:undefined as unknown as number,scenario1NPV:undefined as unknown as number,scenario2Probability:undefined as unknown as number,scenario2NPV:undefined as unknown as number,scenario3Probability:undefined as unknown as number,scenario3NPV:undefined as unknown as number,scenario4Probability:undefined as unknown as number,scenario4NPV:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    const scenarios:Array<{prob:number;npv:number}>=[];
    if(v.scenario1Probability!==undefined&&v.scenario1NPV!==undefined){ scenarios.push({prob:v.scenario1Probability/100,npv:v.scenario1NPV}); }
    if(v.scenario2Probability!==undefined&&v.scenario2NPV!==undefined){ scenarios.push({prob:v.scenario2Probability/100,npv:v.scenario2NPV}); }
    if(v.scenario3Probability!==undefined&&v.scenario3NPV!==undefined){ scenarios.push({prob:v.scenario3Probability/100,npv:v.scenario3NPV}); }
    if(v.scenario4Probability!==undefined&&v.scenario4NPV!==undefined){ scenarios.push({prob:v.scenario4Probability/100,npv:v.scenario4NPV}); }
    if(scenarios.length<2){ setResult(null); return; }
    const totalProb=scenarios.reduce((sum,s)=>sum+s.prob,0);
    if(Math.abs(totalProb-1)>0.01){ setResult(null); return; }
    const expected=scenarios.reduce((sum,s)=>sum+s.prob*s.npv,0);
    const variance=scenarios.reduce((sum,s)=>sum+s.prob*Math.pow(s.npv-expected,2),0);
    const stdDev=Math.sqrt(variance);
    const cv=expected!==0?stdDev/Math.abs(expected):NaN;
    const interp=`Expected NPV: ${expected.toFixed(2)}. Standard deviation: ${stdDev.toFixed(2)}. ${Number.isFinite(cv)?`Coefficient of variation: ${cv.toFixed(2)}.`:''}`;
    setResult({expectedNPV:expected,variance,standardDeviation:stdDev,coefficientOfVariation:cv,interpretation:interp,suggestions:['Standard deviation measures risk in capital budgeting; higher deviation indicates more uncertainty.','Expected NPV provides average outcome; combine with risk measures for better decisions.','Coefficient of variation normalizes risk for different project sizes; compare across projects.','Use risk analysis to evaluate project trade-offs between return and uncertainty.']});
  };

  const num=(ph:string,field:any)=>(
    <Input type="number" step="0.01" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any)?(field.value as any):''}
      onChange={e=>{const v=e.target.value; const n=v===''?undefined:Number(v); field.onChange(Number.isFinite(n as any)?n:undefined);}}/>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Capital Budgeting Risk (Standard Deviation) Calculator</CardTitle>
          <CardDescription>Calculate expected NPV, standard deviation, and risk measures for capital budgeting decisions using scenario analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="scenario1Probability" render={({field})=>(<FormItem><FormLabel>Scenario 1 Probability (%)</FormLabel><FormControl>{num('e.g., 25',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="scenario1NPV" render={({field})=>(<FormItem><FormLabel>Scenario 1 NPV</FormLabel><FormControl>{num('e.g., 100000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="scenario2Probability" render={({field})=>(<FormItem><FormLabel>Scenario 2 Probability (%)</FormLabel><FormControl>{num('e.g., 50',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="scenario2NPV" render={({field})=>(<FormItem><FormLabel>Scenario 2 NPV</FormLabel><FormControl>{num('e.g., 150000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="scenario3Probability" render={({field})=>(<FormItem><FormLabel>Scenario 3 Probability (%)</FormLabel><FormControl>{num('e.g., 20',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="scenario3NPV" render={({field})=>(<FormItem><FormLabel>Scenario 3 NPV</FormLabel><FormControl>{num('e.g., 200000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="scenario4Probability" render={({field})=>(<FormItem><FormLabel>Scenario 4 Probability (%) (optional)</FormLabel><FormControl>{num('e.g., 5',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="scenario4NPV" render={({field})=>(<FormItem><FormLabel>Scenario 4 NPV (optional)</FormLabel><FormControl>{num('e.g., -50000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Risk analysis</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Expected NPV</p><p className={`text-2xl font-bold ${result.expectedNPV>=0?'text-green-600':'text-red-600'}`}>{result.expectedNPV.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Variance</p><p className="text-2xl font-bold">{result.variance.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Standard Deviation</p><p className={`text-2xl font-bold ${result.standardDeviation<result.expectedNPV*0.3?'text-green-600':result.standardDeviation<result.expectedNPV*0.5?'text-yellow-600':'text-red-600'}`}>{result.standardDeviation.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Coefficient of Variation</p><p className={`text-2xl font-bold ${Number.isFinite(result.coefficientOfVariation)?(result.coefficientOfVariation<0.5?'text-green-600':result.coefficientOfVariation<1?'text-yellow-600':'text-red-600'):'text-gray-400'}`}>{Number.isFinite(result.coefficientOfVariation)?result.coefficientOfVariation.toFixed(2):'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Capital budgeting and risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/npv-calculator" className="text-primary hover:underline">NPV Calculator</a></h4><p className="text-sm text-muted-foreground">Project value.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/irr-calculator" className="text-primary hover:underline">IRR Calculator</a></h4><p className="text-sm text-muted-foreground">Return rate.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/project-irr-vs-wacc-comparison-calculator" className="text-primary hover:underline">IRR vs WACC Comparison</a></h4><p className="text-sm text-muted-foreground">Project evaluation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sensitivity-analysis-what-if-calculator" className="text-primary hover:underline">Sensitivity Analysis</a></h4><p className="text-sm text-muted-foreground">Risk analysis.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Capital Budgeting Risk</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain scenario analysis, expected NPV calculation, standard deviation for risk assessment, and capital budgeting decision-making.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Capital budgeting risk</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is standard deviation in capital budgeting?</h4><p className="text-muted-foreground">Measure of risk showing variability of possible NPV outcomes; higher deviation indicates more uncertainty and project risk.</p></div>
          <div><h4 className="font-semibold mb-2">Why use standard deviation for project risk?</h4><p className="text-muted-foreground">Quantifies uncertainty in cash flow estimates; helps compare project risk levels and make informed investment decisions.</p></div>
          <div><h4 className="font-semibold mb-2">What is expected NPV?</h4><p className="text-muted-foreground">Weighted average of possible NPV outcomes; calculated as sum of (Probability × NPV) for all scenarios.</p></div>
          <div><h4 className="font-semibold mb-2">How to calculate standard deviation?</h4><p className="text-muted-foreground">Square root of variance; variance = sum of [Probability × (NPV - Expected NPV)²] across all scenarios.</p></div>
          <div><h4 className="font-semibold mb-2">What is coefficient of variation?</h4><p className="text-muted-foreground">Standard deviation divided by expected NPV; normalizes risk for projects of different sizes; lower is better.</p></div>
          <div><h4 className="font-semibold mb-2">How many scenarios should I use?</h4><p className="text-muted-foreground">Minimum 2-3 scenarios; use best-case, base-case, and worst-case; more scenarios improve accuracy but increase complexity.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good standard deviation?</h4><p className="text-muted-foreground">Depends on expected NPV; coefficient of variation under 0.5 is low risk; over 1.0 is high risk; compare across projects.</p></div>
          <div><h4 className="font-semibold mb-2">How to use risk analysis in decisions?</h4><p className="text-muted-foreground">Compare projects on both expected NPV and risk; prefer higher expected NPV with acceptable risk levels.</p></div>
          <div><h4 className="font-semibold mb-2">What are limitations of standard deviation?</h4><p className="text-muted-foreground">Assumes symmetric distribution; doesn't capture tail risks; consider additional measures like value at risk for comprehensive analysis.</p></div>
          <div><h4 className="font-semibold mb-2">Should probabilities sum to 100%?</h4><p className="text-muted-foreground">Yes—probabilities must sum to exactly 100% for accurate expected value and risk calculations; calculator validates this requirement.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


