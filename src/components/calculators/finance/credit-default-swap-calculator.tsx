
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Calculator, Info, FileText, Globe } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  pd: z.number().min(0).max(100),
  lgd: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditDefaultSwapCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pd: 0,
      lgd: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    const spread = (values.pd / 100) * (values.lgd / 100);
    setResult(spread * 10000); // Convert to basis points
  };

  return (
    <div className="space-y-8">
      {/* Alert Notice */}
      <Alert variant="destructive">
        <AlertTitle>Conceptual Tool Only</AlertTitle>
        <AlertDescription>This calculator uses a highly simplified formula for educational purposes. Real-world CDS pricing is far more complex, involving credit curves and recovery rate assumptions.</AlertDescription>
      </Alert>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Credit Default Swap Premium Calculation
          </CardTitle>
          <CardDescription>
            Enter default probabilities to calculate CDS spread
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="pd" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Probability of Default (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="e.g., 2.5"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lgd" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loss Given Default (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="e.g., 60"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit">Calculate Spread</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result !== null && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Illustrative CDS Spread</CardTitle>
                <CardDescription>Estimated annual premium</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(0)} bps</p>
            <CardDescription className='mt-4 text-center'>The theoretical annual premium is {result.toFixed(0)} basis points, or {(result / 100).toFixed(2)}% of the notional amount.</CardDescription>
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
            <h4 className="font-semibold text-foreground mb-2">Probability of Default (PD)</h4>
            <p className="text-muted-foreground">
              An estimate of the likelihood that the debt issuer will default on its payments within a year. This is a complex value derived from credit ratings, market data, and financial analysis.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Loss Given Default (LGD)</h4>
            <p className="text-muted-foreground">
              The percentage of the total exposure that will be lost if a default occurs. It is calculated as `100% - Recovery Rate`. For example, if bondholders are expected to recover 40% of their investment after a default, the LGD is 60%.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other credit and derivatives calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/credit-spread-calculator" className="text-primary hover:underline">
                  Credit Spread Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate credit spreads between corporate and government bonds.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/bond-yield-calculator" className="text-primary hover:underline">
                  Bond Yield Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate current yield and yield to maturity for bonds.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/forward-rate-agreement-calculator" className="text-primary hover:underline">
                  Forward Rate Agreement Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate settlement payments for forward rate agreements.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/swap-spread-calculator" className="text-primary hover:underline">
                  Swap Spread Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the spread between swap rates and treasury rates.
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
            Complete Guide to Credit Default Swaps
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>A Credit Default Swap (CDS) is like an insurance policy against a bond default. This calculator demonstrates the basic principle behind its pricing.</p>
          <p className="mt-2 font-mono p-2 bg-muted rounded-md text-center">CDS Spread ≈ PD × LGD</p>
          <p className="mt-2">The annual premium (spread) that the buyer of protection must pay should be roughly equal to the expected loss on the bond for that year. The expected loss is the probability of the bad event happening (PD) multiplied by the financial impact if it does happen (LGD). The result is converted to basis points (bps), where 100 bps = 1%.</p>
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
            Common questions about Credit Default Swaps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a Credit Default Swap (CDS)?</h4>
            <p className="text-muted-foreground">
              A Credit Default Swap is a financial derivative that acts like insurance for bondholders. The protection buyer pays periodic premiums to the protection seller. If the underlying bond defaults, the protection seller compensates the buyer for the loss.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How is CDS spread calculated?</h4>
            <p className="text-muted-foreground">
              The basic formula is CDS Spread ≈ Probability of Default × Loss Given Default. The annual premium should approximately equal the expected loss on the bond. Real-world CDS pricing is far more complex, involving credit curves, recovery rate assumptions, and market factors.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is Probability of Default (PD)?</h4>
            <p className="text-muted-foreground">
              PD is the likelihood that the debt issuer will default on its payments within a specific time period, typically one year. It's derived from credit ratings, market data, financial analysis, and credit models. Higher PD means higher credit risk and higher CDS spreads.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is Loss Given Default (LGD)?</h4>
            <p className="text-muted-foreground">
              LGD is the percentage of total exposure that will be lost if default occurs. It's calculated as 100% minus the Recovery Rate. If bondholders recover 40% of their investment after default, the LGD is 60%. LGD varies by seniority, collateral, and economic conditions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How are CDS spreads quoted?</h4>
            <p className="text-muted-foreground">
              CDS spreads are typically quoted in basis points (bps), where 100 bps = 1%. For example, a 250 bps spread means the annual premium is 2.5% of the notional amount. Investment-grade credits typically have spreads under 100 bps, while high-yield credits may have spreads over 500 bps.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What factors affect CDS spreads?</h4>
            <p className="text-muted-foreground">
              Key factors include credit quality of the reference entity, maturity of the CDS contract, market liquidity, interest rates, overall market sentiment, sovereign risk, and industry-specific factors. Spreads widen with increased perceived risk.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do investors use CDS?</h4>
            <p className="text-muted-foreground">
              Investors use CDS to hedge credit risk, speculate on credit quality changes, express views on default probabilities, manage portfolio credit exposure, and extract or provide credit protection. CDS can also be used for arbitrage and trading strategies.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are the risks of trading CDS?</h4>
            <p className="text-muted-foreground">
              Risks include counterparty default (protection seller may not pay), basis risk (CDS spread may not perfectly match bond price movements), liquidity risk (CDS may be difficult to trade), and market risk (spreads can widen significantly during market stress). Complexity and lack of transparency can also pose challenges.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
