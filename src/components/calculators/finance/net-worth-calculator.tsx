
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.number().nonnegative(),
});

const formSchema = z.object({
  assets: z.array(itemSchema).min(1, "Add at least one asset."),
  liabilities: z.array(itemSchema).min(1, "Add at least one liability."),
});

type FormValues = z.infer<typeof formSchema>;

export default function NetWorthCalculator() {
  const [result, setResult] = useState<{ netWorth: number, totalAssets: number, totalLiabilities: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assets: [
        { name: 'Home', value: 350000 },
        { name: 'Investments', value: 100000 },
        { name: 'Savings Account', value: 25000 },
        { name: 'Vehicle', value: 15000 },
      ],
      liabilities: [
        { name: 'Mortgage', value: 250000 },
        { name: 'Car Loan', value: 8000 },
        { name: 'Credit Card Debt', value: 5000 },
      ],
    },
  });

  const { fields: assetFields, append: appendAsset, remove: removeAsset } = useFieldArray({ control: form.control, name: "assets" });
  const { fields: liabilityFields, append: appendLiability, remove: removeLiability } = useFieldArray({ control: form.control, name: "liabilities" });

  const onSubmit = (values: FormValues) => {
    const totalAssets = values.assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = values.liabilities.reduce((sum, liability) => sum + liability.value, 0);
    const netWorth = totalAssets - totalLiabilities;
    setResult({ netWorth, totalAssets, totalLiabilities });
  };
  
  // Calculate on initial render
  useEffect(() => {
    onSubmit(form.getValues());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader><CardTitle>Assets (What you own)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assetFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr,120px,auto] gap-2 items-start">
                      <FormField control={form.control} name={`assets.${index}.name`} render={({ field }) => ( <FormItem><FormLabel className="sr-only">Asset Name</FormLabel><FormControl><Input placeholder="e.g., Home" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={form.control} name={`assets.${index}.value`} render={({ field }) => ( <FormItem><FormLabel className="sr-only">Asset Value</FormLabel><FormControl><Input type="number" placeholder="Value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAsset(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendAsset({ name: '', value: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Asset</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Liabilities (What you owe)</CardTitle></CardHeader>
              <CardContent>
                 <div className="space-y-4">
                  {liabilityFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr,120px,auto] gap-2 items-start">
                      <FormField control={form.control} name={`liabilities.${index}.name`} render={({ field }) => ( <FormItem><FormLabel className="sr-only">Liability Name</FormLabel><FormControl><Input placeholder="e.g., Mortgage" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={form.control} name={`liabilities.${index}.value`} render={({ field }) => ( <FormItem><FormLabel className="sr-only">Liability Value</FormLabel><FormControl><Input type="number" placeholder="Value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLiability(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendLiability({ name: '', value: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Liability</Button>
              </CardContent>
            </Card>
          </div>
          <Button type="submit" className="w-full">Calculate Net Worth</Button>
        </form>
      </Form>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><DollarSign className="h-8 w-8 text-primary" /><CardTitle>Your Financial Snapshot</CardTitle></div></CardHeader>
            <CardContent>
                 <div className="text-center space-y-4">
                    <div>
                        <CardDescription>Your Net Worth</CardDescription>
                        <p className="text-4xl font-bold">${result.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div><CardDescription>Total Assets</CardDescription><p className="text-2xl font-semibold">${result.totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                        <div><CardDescription>Total Liabilities</CardDescription><p className="text-2xl font-semibold">${result.totalLiabilities.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-net-worth">
          <AccordionTrigger>What is Net Worth?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>Net worth is a snapshot of your financial health. It's the value of all your assets (what you own) minus the total of all your liabilities (what you owe). A positive and growing net worth is a key indicator of financial progress.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the fundamental net worth formula: `Net Worth = Total Assets - Total Liabilities`.</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Assets:</strong> Include things like cash, investments (stocks, 401(k)), real estate, and valuable personal property.</li>
                    <li><strong>Liabilities:</strong> Include all debts, such as mortgages, car loans, student loans, and credit card balances.</li>
                </ul>
                <p>The calculator simply sums up all your listed assets and subtracts the sum of all your listed liabilities to find your net worth.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more details on calculating and growing your net worth, consult these authoritative resources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/terms/n/networth.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: How to Calculate Your Net Worth</a></li>
                  <li><a href="https://www.finra.org/investors/learn-to-invest/advanced-investing/net-worth" target="_blank" rel="noopener noreferrer" className="text-primary underline">FINRA: Understanding Net Worth</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    