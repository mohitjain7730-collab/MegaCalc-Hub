
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  gasPrice: z.number().positive(),
  gasLimit: z.number().positive(),
  ethPrice: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NftMintingCostCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gasPrice: undefined,
      gasLimit: undefined,
      ethPrice: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { gasPrice, gasLimit, ethPrice } = values;
    const totalGasGwei = gasPrice * gasLimit;
    const totalGasEth = totalGasGwei / 1_000_000_000;
    const mintingCost = totalGasEth * ethPrice;
    setResult(mintingCost);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="gasPrice" render={({ field }) => (
                <FormItem><FormLabel>Gas Price (gwei)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gasLimit" render={({ field }) => (
                <FormItem><FormLabel>Gas Limit (units)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="ethPrice" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>ETH Price (USD)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Minting Cost</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Gem className="h-8 w-8 text-primary" /><CardTitle>Estimated NFT Minting Cost</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <CardDescription className='mt-4 text-center'>This is the estimated transaction fee (gas fee) to mint the NFT on the Ethereum blockchain.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator estimates the cost of an Ethereum transaction, which is required to mint an NFT.</p>
                 <ol className="list-decimal list-inside space-y-1 pl-4">
                    <li><strong>Transaction Fee (ETH):</strong> It first calculates the total gas fee in ETH by multiplying the `Gas Price` (in Gwei) by the `Gas Limit` and then converting from Gwei to ETH (1 ETH = 1,000,000,000 Gwei).</li>
                    <li><strong>Cost in USD:</strong> It then multiplies the transaction fee in ETH by the current price of ETH to get the final cost in USD.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div><h4 className="font-semibold text-foreground">Gas Price (gwei)</h4><p>The price per unit of gas you are willing to pay, in Gwei. This fluctuates based on network congestion. You can find current prices on sites like Etherscan Gas Tracker.</p></div>
              <div><h4 className="font-semibold text-foreground">Gas Limit (units)</h4><p>The maximum amount of gas you are willing to spend on the transaction. For a standard NFT mint, this is often around 200,000, but can vary.</p></div>
              <div><h4 className="font-semibold text-foreground">ETH Price (USD)</h4><p>The current market price of one Ethereum coin in USD.</p></div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
