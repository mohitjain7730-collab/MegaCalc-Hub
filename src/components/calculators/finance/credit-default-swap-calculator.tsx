
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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Credit Default Swap (CDS) Premium Calculation, Mechanics, and Risk Transfer" />
    <meta itemProp="description" content="An expert guide detailing the structure of a Credit Default Swap (CDS), how the annual premium (spread) is determined, the role of default probability and recovery rate, and its use in credit risk transfer and speculation." />
    <meta itemProp="keywords" content="credit default swap premium formula, CDS spread calculation, default probability bond, recovery rate debt, credit risk transfer mechanism, CDS pricing models, ISDA documentation" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-cds-premium-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Credit Default Swaps (CDS): Calculating the Default Premium</h1>
    <p className="text-lg italic text-gray-700">Master the structure of the financial insurance contract used to transfer credit risk and how its annual premium is determined by market default expectations.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#structure" className="hover:underline">CDS Structure: Protection Buyer, Seller, and Reference Entity</a></li>
        <li><a href="#premium-mechanics" className="hover:underline">Premium Calculation Mechanics (The CDS Spread)</a></li>
        <li><a href="#variables" className="hover:underline">Key Variables: Default Probability and Recovery Rate</a></li>
        <li><a href="#payment-legs" className="hover:underline">The Two Legs of the CDS Transaction</a></li>
        <li><a href="#applications" className="hover:underline">Market Applications: Hedging vs. Speculation</a></li>
    </ul>
<hr />

    {/* CDS STRUCTURE: PROTECTION BUYER, SELLER, AND REFERENCE ENTITY */}
    <h2 id="structure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">CDS Structure: Protection Buyer, Seller, and Reference Entity</h2>
    <p>A **Credit Default Swap (CDS)** is a bilateral financial contract—an over-the-counter (OTC) derivative—that transfers the credit risk of a specific debt instrument (the reference obligation, usually a bond) from one party to another.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Three Roles</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Protection Buyer:</strong> The party that pays a periodic premium (the spread) to insure against the risk of default. They typically own the underlying bond or are speculating that the borrower will default.</li>
        <li><strong className="font-semibold">Protection Seller:</strong> The party that receives the periodic premium and agrees to compensate the buyer if a credit event occurs. They are effectively betting the borrower will not default.</li>
        <li><strong className="font-semibold">Reference Entity:</strong> The issuer of the underlying debt (e.g., a corporation or sovereign government) whose credit health determines the contract's outcome.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Credit Event Trigger</h3>
    <p>The obligation to pay by the protection seller is triggered only upon a **Credit Event**. These events are strictly defined by the International Swaps and Derivatives Association (ISDA) and typically include:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>Bankruptcy of the reference entity.</li>
        <li>Failure to pay interest or principal on the reference obligation.</li>
        <li>Restructuring of the debt that negatively impacts the bondholder.</li>
    </ul>

<hr />

    {/* PREMIUM CALCULATION MECHANICS (THE CDS SPREAD) */}
    <h2 id="premium-mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Premium Calculation Mechanics (The CDS Spread)</h2>
    <p>The CDS **Premium** (or **Spread**) is the annual fee, expressed as basis points (bps) or a percentage of the notional principal, that the protection buyer pays to the seller. This premium is calculated to make the expected cash flows of the two sides of the contract equal at the time of origination (the expected net present value must be zero).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Fair Value Spread</h3>
    <p>The fair value premium is the annual payment that equalizes the present value of the two transaction legs:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'PV (Expected Premium Payments) = PV (Expected Payout in Event of Default)'}
        </p>
    </div>
    <p>The CDS Spread is essentially the market's current **price of insuring** against the default of the reference entity. A higher spread indicates a higher perceived probability of default.</p>

<hr />

    {/* KEY VARIABLES: DEFAULT PROBABILITY AND RECOVERY RATE */}
    <h2 id="variables" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Variables: Default Probability and Recovery Rate</h2>
    <p>The calculation of the CDS spread is highly dependent on two variables that quantify the likelihood and severity of a credit event.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Probability of Default (PD)</h3>
    <p>The PD is the likelihood that the reference entity will fail to meet its debt obligations within the contract term. The higher the PD, the higher the required CDS spread. PD is derived from credit ratings (Moody's, S&P) and market data (analyzing the entity's bond yields versus risk-free rates).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Recovery Rate (RR)</h3>
    <p>The **Recovery Rate** is the percentage of the debt's face value that bondholders expect to recover after a default. Typical recovery rates range from 30% to 40%.</p>
    <p>The loss suffered by the protection seller in a credit event is (1 minus Recovery Rate). This <strong className="font-semibold">Loss Given Default (LGD)</strong> is the effective payout amount used in the premium calculation.</p>

<hr />

    {/* THE TWO LEGS OF THE CDS TRANSACTION */}
    <h2 id="payment-legs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Two Legs of the CDS Transaction</h2>
    <p>The calculation balances the present value of the **Premium Leg** (cash outflows for the buyer) against the **Contingent Leg** (potential cash inflow for the buyer).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. The Premium Leg (Fixed/Periodic Payments)</h3>
    <p>This is the stream of fixed, scheduled payments made by the buyer to the seller until either the contract matures or a credit event occurs. This stream is valued as the present value of an annuity, where the annuity payment is the CDS spread.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. The Contingent Leg (The Payout)</h3>
    <p>This is the uncertain future payment made by the seller to the buyer only if a credit event is triggered. Its present value depends on the probability of default occurring in each year of the contract and the magnitude of the payout (Loss Given Default).</p>
    <p>When a credit event occurs, the standard settlement mechanism is a **Physical Settlement** (buyer delivers the defaulted bond to the seller for the full face value) or a **Cash Settlement** (seller pays the buyer the cash equivalent of the loss: Notional Value $\times$ LGD).</p>

<hr />

    {/* MARKET APPLICATIONS: HEDGING VS. SPECULATION */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Market Applications: Hedging vs. Speculation</h2>
    <p>CDS contracts are used for two fundamentally different goals: risk management (hedging) and generating returns (speculation).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hedging (Risk Transfer)</h3>
    <p>A bank or large fund that owns a bond portfolio may purchase CDS protection on those assets to offset the risk of default. This is the intended purpose: transferring credit risk exposure to a party more willing or able to bear it.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Speculation (Generating Returns)</h3>
    <p>Investors can use CDS contracts to bet against the credit health of an entity without ever owning the underlying bond (the "naked CDS"). Speculators profit if they buy protection (pay the premium) and the reference entity defaults. The widening or narrowing of the CDS spread itself is also a tradeable signal, reflecting changes in market perception of risk.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Credit Default Swap (CDS) is a market-driven insurance contract where the **CDS Spread** (the annual premium) is determined by balancing the present value of the scheduled premium payments against the present value of the expected payout upon default.</p>
    <p>The spread is the direct manifestation of two key variables: the market's perceived **Probability of Default (PD)** and the expected **Loss Given Default (LGD)**. Because the CDS spread is highly liquid and transparent, it serves as one of the best real-time indicators of an entity's credit risk.</p>
</section>

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
