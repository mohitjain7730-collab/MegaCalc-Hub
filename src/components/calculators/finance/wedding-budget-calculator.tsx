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
  venue: z.number().min(0).optional(),
  catering: z.number().min(0).optional(),
  photography: z.number().min(0).optional(),
  decorations: z.number().min(0).optional(),
  attire: z.number().min(0).optional(),
  music: z.number().min(0).optional(),
  flowers: z.number().min(0).optional(),
  transportation: z.number().min(0).optional(),
  other: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WeddingBudgetCalculator() {
  const [result,setResult]=useState<{totalBudget:number; averageCost:number; interpretation:string; suggestions:string[]}|null>(null);
  const form=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:{venue:undefined as unknown as number,catering:undefined as unknown as number,photography:undefined as unknown as number,decorations:undefined as unknown as number,attire:undefined as unknown as number,music:undefined as unknown as number,flowers:undefined as unknown as number,transportation:undefined as unknown as number,other:undefined as unknown as number}});

  const onSubmit=(v:FormValues)=>{
    const total=(v.venue||0)+(v.catering||0)+(v.photography||0)+(v.decorations||0)+(v.attire||0)+(v.music||0)+(v.flowers||0)+(v.transportation||0)+(v.other||0);
    const avg=total>0?total/9:0;
    const interp=`Total wedding budget: ${total.toFixed(2)}. Average per category: ${avg.toFixed(2)}.`;
    setResult({totalBudget:total,averageCost:avg,interpretation:interp,suggestions:['Allocate 40-50% to venue and catering combined; these are typically largest expenses.','Get multiple quotes for each category to compare prices and negotiate better rates.','Set aside 10-15% buffer for unexpected costs and last-minute changes.','Prioritize what matters most to you; cut costs in less important areas.']});
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Wedding Budget Calculator</CardTitle>
          <CardDescription>Plan and track your wedding budget across all major expense categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="venue" render={({field})=>(<FormItem><FormLabel>Venue</FormLabel><FormControl>{num('e.g., 5000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="catering" render={({field})=>(<FormItem><FormLabel>Catering</FormLabel><FormControl>{num('e.g., 8000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="photography" render={({field})=>(<FormItem><FormLabel>Photography/Videography</FormLabel><FormControl>{num('e.g., 3000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="decorations" render={({field})=>(<FormItem><FormLabel>Decorations</FormLabel><FormControl>{num('e.g., 2000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="attire" render={({field})=>(<FormItem><FormLabel>Attire (Bride & Groom)</FormLabel><FormControl>{num('e.g., 2500',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="music" render={({field})=>(<FormItem><FormLabel>Music/DJ</FormLabel><FormControl>{num('e.g., 1500',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="flowers" render={({field})=>(<FormItem><FormLabel>Flowers</FormLabel><FormControl>{num('e.g., 2000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="transportation" render={({field})=>(<FormItem><FormLabel>Transportation</FormLabel><FormControl>{num('e.g., 1000',field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="other" render={({field})=>(<FormItem><FormLabel>Other Expenses</FormLabel><FormControl>{num('e.g., 2000',field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result&&(
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Budget summary</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Total Wedding Budget</p><p className="text-2xl font-bold">{result.totalBudget.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Average Per Category</p><p className="text-2xl font-bold">{result.averageCost.toFixed(2)}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Interpretation</h4><p className="text-muted-foreground">{result.interpretation}</p></div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Event planning</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">Monthly Budget Planner</a></h4><p className="text-sm text-muted-foreground">Budget management.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/savings-goal-timeline-calculator" className="text-primary hover:underline">Savings Goal Timeline</a></h4><p className="text-sm text-muted-foreground">Savings planning.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest Calculator</a></h4><p className="text-sm text-muted-foreground">Savings growth.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/emergency-fund-requirement-calculator" className="text-primary hover:underline">Emergency Fund Calculator</a></h4><p className="text-sm text-muted-foreground">Financial safety.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Wedding Budget Planning</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain budget allocation, cost-saving tips, and expense prioritization.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Wedding budget planning</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the average wedding cost?</h4><p className="text-muted-foreground">Varies by location and size; average US wedding: $30,000-35,000; can range from $5,000 (small) to $100,000+ (large).</p></div>
          <div><h4 className="font-semibold mb-2">How should I allocate my wedding budget?</h4><p className="text-muted-foreground">40-50% venue and catering, 10% photography, 10% flowers/decorations, 10% attire, 5-10% music, 5% each for other categories, 10-15% buffer.</p></div>
          <div><h4 className="font-semibold mb-2">What are the biggest wedding expenses?</h4><p className="text-muted-foreground">Venue rental, catering/food, photography/videography typically largest; followed by decorations, flowers, and entertainment.</p></div>
          <div><h4 className="font-semibold mb-2">How can I save money on my wedding?</h4><p className="text-muted-foreground">Choose off-peak dates, reduce guest count, DIY decorations, negotiate packages, use local vendors, consider alternative venues.</p></div>
          <div><h4 className="font-semibold mb-2">Should I include a contingency buffer?</h4><p className="text-muted-foreground">Yes—set aside 10-15% for unexpected costs, last-minute changes, tips, and unforeseen expenses.</p></div>
          <div><h4 className="font-semibold mb-2">How far in advance should I plan?</h4><p className="text-muted-foreground">12-18 months ideal; allows time to book vendors, compare prices, and save; popular venues book 1-2 years ahead.</p></div>
          <div><h4 className="font-semibold mb-2">What hidden costs should I consider?</h4><p className="text-muted-foreground">Tips, taxes, service charges, overtime fees, cake cutting fees, vendor meals, parking, alterations, beauty appointments.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use a wedding planner?</h4><p className="text-muted-foreground">Planner costs 10-15% of budget but can save time, negotiate better rates, and prevent costly mistakes; DIY if budget-constrained.</p></div>
          <div><h4 className="font-semibold mb-2">How to track wedding expenses?</h4><p className="text-muted-foreground">Use spreadsheet or app; track deposits, payments, receipts; compare actual vs budget monthly; update as plans change.</p></div>
          <div><h4 className="font-semibold mb-2">What if I go over budget?</h4><p className="text-muted-foreground">Cut costs in other categories, extend timeline to save more, reduce guest count, or prioritize most important elements.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

