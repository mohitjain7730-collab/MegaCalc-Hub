
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, XCircle, Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const assetSchema = z.object({
  name: z.string().optional(),
  return: z.number().optional(),
  weight: z.number().optional(),
});

const formSchema = z.object({
  assets: z.array(assetSchema),
}).refine(data => {
    const totalWeight = data.assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
    return Math.abs(totalWeight - 100) < 0.01;
}, {
    message: "Total portfolio weights must add up to 100%.",
    path: ['assets'],
});

type FormValues = z.infer<typeof formSchema>;

export default function PortfolioExpectedReturnCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assets: [
        { name: 'Asset 1', return: undefined, weight: undefined },
        { name: 'Asset 2', return: undefined, weight: undefined },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assets"
  });

  const onSubmit = (values: FormValues) => {
    const expectedReturn = values.assets.reduce((acc, asset) => {
        return acc + ((asset.return || 0) / 100) * ((asset.weight || 0) / 100);
    }, 0);
    setResult(expectedReturn * 100);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Portfolio Assets</CardTitle><CardDescription>Enter the expected return and portfolio weight for each asset.</CardDescription></CardHeader>
            <CardContent>
                <div className="grid grid-cols-[1fr,100px,100px,auto] gap-2 items-center font-medium mb-2 text-sm">
                    <span>Asset Name</span>
                    <span className='text-center'>Return (%)</span>
                    <span className='text-center'>Weight (%)</span>
                    <span></span>
                </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr,100px,100px,auto] gap-2 items-start mb-2">
                  <FormField control={form.control} name={`assets.${index}.name`} render={({ field }) => ( <FormItem><FormControl><Input placeholder={`Asset ${index + 1}`} {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name={`assets.${index}.return`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name={`assets.${index}.weight`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', return: undefined, weight: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Asset</Button>
               {form.formState.errors.assets && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.assets.message}</p>}
            </CardContent>
          </Card>
          <Button type="submit">Calculate Expected Return</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Portfolio Expected Return</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
                <CardDescription className='mt-4 text-center'>This is the weighted average of the expected returns of the individual assets in the portfolio.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The expected return of a portfolio is the weighted average of the expected returns for each individual asset in the portfolio. The calculator multiplies each asset's expected return by its portfolio weight and sums these values to find the total portfolio expected return.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
