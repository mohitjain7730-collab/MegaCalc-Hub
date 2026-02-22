'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, AlertCircle, Info, Calculator, DollarSign, Shield, PieChart, FunctionSquare, CheckCircle2, Scale, Activity, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const formSchema = z.object({
  exposureAtDefault: z.number().positive('Exposure must be positive'),
  probabilityOfDefault: z.number().min(0).max(100),
  lossGivenDefault: z.number().min(0).max(100).optional(),
  recoveryRate: z.number().min(0).max(100).optional(),
  calculationMode: z.enum(['lgd', 'recovery']),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditRiskExpectedLossCalculator() {
  const [result, setResult] = useState<{
    expectedLoss: number;
    unexpectedLoss: number;
    lgdUsed: number;
    riskLevel: string;
    provisionStatus: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exposureAtDefault: undefined,
      probabilityOfDefault: undefined, // %
      lossGivenDefault: undefined, // %
      recoveryRate: undefined, // %
      calculationMode: 'lgd',
    },
  });

  const calculate = (v: FormValues) => {
    // Inputs
    const EAD = v.exposureAtDefault;
    const PD = v.probabilityOfDefault / 100;

    let LGD = 0;
    if (v.calculationMode === 'lgd' && v.lossGivenDefault !== undefined) {
      LGD = v.lossGivenDefault / 100;
    } else if (v.calculationMode === 'recovery' && v.recoveryRate !== undefined) {
      LGD = 1 - (v.recoveryRate / 100);
    }

    // 1. Expected Loss (EL) = EAD * PD * LGD
    // This is the "cost of doing business" - average loss to be provisioned.
    const EL = EAD * PD * LGD;

    // 2. Unexpected Loss (UL) - Simplified Single Asset
    // UL represents the volatility of the loss.
    // UL = EAD * LGD * sqrt(PD * (1 - PD))
    // Note: In portfolios, correlation applies. For single asset, this is the standard deviation.
    const variancePD = PD * (1 - PD);
    const UL = EAD * LGD * Math.sqrt(variancePD);

    // 3. Risk Grading
    let riskLevel = 'Low Risk';
    if (PD > 0.10 || LGD > 0.8) riskLevel = 'High Risk'; // >10% annual PD is junk/distressed
    else if (PD > 0.02) riskLevel = 'Medium Risk';

    return {
      expectedLoss: EL,
      unexpectedLoss: UL,
      lgdUsed: LGD * 100,
      riskLevel
    };
  };

  const getRecommendation = (el: number, ul: number, risk: string) => {
    if (risk === 'High Risk') {
      return `Warning: High credit risk detected. Ensure pricing (interest rate) covers the Expected Loss of $${el.toFixed(0)} plus a return on the Capital required for the Unexpected Loss.`;
    }
    return `Credit profile is stable. Provisions should be set aside for the Expected Loss of $${el.toFixed(0)}. Capital should be held against Unexpected Loss deviations.`;
  };

  const getInsights = (ead: number, pd: number, lgd: number) => {
    const insights = [];
    insights.push(`Allocation: $${(ead * pd * lgd).toFixed(2)} should be treated as a cost (Loss Provision).`);
    insights.push(`Impact: A 1% increase in LGD increases Expected Loss by $${(ead * pd * 0.01).toFixed(2)}.`);
    insights.push(`Sensitivity: PD changes are linear for EL but non-linear for Risk Capital (UL).`);
    return insights;
  };

  const getRisks = (pd: number) => {
    const risks = [];
    risks.push('Model Risk: PD and LGD estimates are often backward-looking.');
    risks.push('Correlation Risk: Models often underestimate systematic events where defaults cluster.');
    risks.push('Concentration Risk: High EAD to a single counterparty magnifies Unexpected Loss.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      provisionStatus: 'Required',
      recommendation: getRecommendation(calc.expectedLoss, calc.unexpectedLoss, calc.riskLevel),
      insights: getInsights(values.exposureAtDefault, values.probabilityOfDefault / 100, calc.lgdUsed / 100),
      risks: getRisks(values.probabilityOfDefault)
    });
  };

  const mode = form.watch('calculationMode');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Credit Parameters
          </CardTitle>
          <CardDescription>
            Input exposure and risk estimates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="exposureAtDefault"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Exposure at Default (EAD)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 500000"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="probabilityOfDefault"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Probability of Default (PD %)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Annual %, e.g., 2.5"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="calculationMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Input Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lgd">Input Loss Given Default (LGD)</SelectItem>
                          <SelectItem value="recovery">Input Recovery Rate (RR)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mode === 'lgd' ? (
                  <FormField
                    control={form.control}
                    name="lossGivenDefault"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Loss Given Default (LGD %)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 45.0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="recoveryRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Recovery Rate (RR %)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 55.0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Expected Loss
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <PieChart className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Loss Estimates</CardTitle>
                  <CardDescription>Predicted impact on capital</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Expected Loss (Provision)</p>
                  <p className="text-4xl font-bold text-red-600">
                    {result.expectedLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-3 bg-muted/50 rounded flex flex-col items-center">
                    <span className="text-sm font-semibold text-muted-foreground">Unexpected Loss (1 std dev)</span>
                    <span className="text-xl font-bold text-amber-600">
                      {result.unexpectedLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Capital Charge Buffer</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded flex flex-col items-center">
                    <span className="text-sm font-semibold text-muted-foreground">Effective LGD</span>
                    <span className="text-xl font-bold text-blue-600">{result.lgdUsed.toFixed(1)}%</span>
                    <span className="text-xs text-muted-foreground mt-1">Severity</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Risk Grade</p>
                  <p className="font-bold">{result.riskLevel}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Provision Status</p>
                  <p className="font-bold">{result.provisionStatus}</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Assessment:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <TrendingUp className="h-6 w-6" />
                  Capital Implications
                </CardTitle>
                <CardDescription>Strategic View</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Key Risks
                </CardTitle>
                <CardDescription>Model & Credit Factors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula: The Expected Loss Equation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              EL = EAD × PD × LGD
            </p>
            <p className="font-mono text-sm text-center mt-2">
              LGD = 1 - Recovery Rate
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Expected Loss (EL)</strong> is the reliable "cost of credit" that should be priced into the loan's interest rate. It combines the size of the loan (<strong>EAD</strong>), the likelihood of failure (<strong>PD</strong>), and the severity of loss (<strong>LGD</strong>).
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Risk management and credit tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/probability-of-default-pd-estimator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">PD Estimator</p>
                      <p className="text-sm text-muted-foreground">Estimate default risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/exposure-at-default-ead-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">EAD Calculator</p>
                      <p className="text-sm text-muted-foreground">Calculate Exposure</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/value-at-risk-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Value at Risk</p>
                      <p className="text-sm text-muted-foreground">Portfolio risk measure</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="headline" content="Calculating Credit Risk: The Expected Loss Model" />
        <meta itemProp="description" content="A comprehensive guide to credit risk modeling. Learn how to calculate Expected Loss (EL) using Probability of Default (PD), Loss Given Default (LGD), and Exposure at Default (EAD)." />
        <meta itemProp="keywords" content="credit risk calculator, expected loss formula, PD LGD EAD, basel regulatory capital, loan loss provisioning, IFRS 9 impairment" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-08-25" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Credit Risk & Expected Loss</h1>
        <p className="text-lg italic text-muted-foreground">Expected Loss (EL) is the cornerstone of modern banking and credit risk management. It represents the inevitable cost of lending money, which must be covered by interest income and loan provisions.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#components" className="hover:underline">The Three Pillars of Credit Risk</a></li>
          <li><a href="#formula" className="hover:underline">The EL Formula Explained</a></li>
          <li><a href="#unexpected" className="hover:underline">Expected vs. Unexpected Loss</a></li>
          <li><a href="#regulation" className="hover:underline">Basel III & IFRS 9 Frameworks</a></li>
          <li><a href="#mitigation" className="hover:underline">Risk Mitigation Strategies</a></li>
        </ul>
        <hr />

        <h2 id="components" className="text-2xl font-bold text-foreground pt-8">The Three Pillars of Credit Risk</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">PD (Probability of Default)</h4>
            <p className="text-sm">The likelihood that a borrower will default over a specific horizon (usually 1 year). It measures <strong>Counterparty Risk</strong>.</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">LGD (Loss Given Default)</h4>
            <p className="text-sm">The portion of the exposure that will not be recovered if a default occurs. It measures <strong>Severity Risk</strong>. (1 - Recovery Rate).</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">EAD (Exposure at Default)</h4>
            <p className="text-sm">The total value likely to be drawn down at the moment of default. It measures <strong>Size Risk</strong>.</p>
          </div>
        </div>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">The EL Formula Explained</h2>
        <p>
          The calculation is straightforward multiplication:
        </p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">EL = PD × LGD × EAD</p>
        </div>
        <p>
          For example: If you lend $1,000,000 (EAD) to a company with a 2% chance of default (PD), and you expect to recover only 60% of funds from the collateral (LGD = 40%):
          <br />
          <strong>EL = $1,000,000 × 0.02 × 0.40 = $8,000</strong>.
        </p>
        <p className="mt-2">
          This $8,000 is not a "surprise"; it is a statistical expectation. The bank should charge enough interest to cover this $8,000 "cost of goods sold" plus a profit margin.
        </p>

        <h2 id="unexpected" className="text-2xl font-bold text-foreground pt-8">Expected vs. Unexpected Loss</h2>
        <p>
          <strong>Expected Loss (EL)</strong> is the average loss rate. It is covered by <strong>Provisions</strong> (reserves) set aside from profits.
        </p>
        <p className="mt-2">
          <strong>Unexpected Loss (UL)</strong> is the volatility of loss—the risk that losses could be much higher than average in a bad year. It is covered by <strong>Risk Capital</strong> (Equity).
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Regulatory Capital requirements are based on the Unexpected Loss component (via Risk Weighted Assets).</p>

        <h2 id="regulation" className="text-2xl font-bold text-foreground pt-8">Basel III & IFRS 9 Frameworks</h2>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Basel III:</strong> Focuses on Capital adequacy. Banks must hold enough capital to survive a severe 1-in-1000 year recession (Ultimate Unexpected Loss).</li>
          <li><strong>IFRS 9 / CECL:</strong> Focuses on Accounting. Banks must recognize Expected Losses upfront.
            <ul className="list-circle ml-6 mt-1 text-sm text-muted-foreground">
              <li>Stage 1: 12-month Expected Discounted Loss.</li>
              <li>Stage 2 & 3: Lifetime Expected Loss (if credit degrades).</li>
            </ul>
          </li>
        </ul>

        <h2 id="mitigation" className="text-2xl font-bold text-foreground pt-8">Risk Mitigation Strategies</h2>
        <p>How can a lender reduce Expected Loss?</p>
        <ol className="list-decimal ml-6 space-y-2 mt-4">
          <li><strong>Reduce PD:</strong> Lend only to higher quality borrowers or require guarantees.</li>
          <li><strong>Reduce LGD:</strong> Require more collateral (lower LTV) or senior creditor status.</li>
          <li><strong>Reduce EAD:</strong> Lower credit limits or reduce "undrawn" committed lines.</li>
        </ol>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Credit Models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">How is PD determined?</h4>
              <p className="text-muted-foreground">
                For corporate borrowers, PD is effectively linked to their Credit Rating (e.g., AAA = 0.01%, B = 5.0%). For retail, it comes from credit scores (FICO).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is LGD constant?</h4>
              <p className="text-muted-foreground">
                No. In a recession ("Downturn LGD"), asset prices fall, making collateral worth less. Regulators often require using "Downturn LGD" estimates which are higher than average LGD.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if I ignore EL?</h4>
              <p className="text-muted-foreground">
                If you don't price for EL, your loans will effectively be unprofitable. The gross interest income will eventually be wiped out by defaults over the long term.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the difference between specific and general provisions?</h4>
              <p className="text-muted-foreground">
                Specific provisions are for loans already known to be impaired (Stage 3). General provisions are for the statistical expectation of loss on the performing portfolio (Stage 1 & 2).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does EAD differ from Outstanding Balance?</h4>
              <p className="text-muted-foreground">
                EAD includes the current balance PLUS a "Credit Conversion Factor" (CCF) of any undrawn credit lines. Borrowers typically draw down fully just before defaulting.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can EL be negative?</h4>
              <p className="text-muted-foreground">
                Technically no, as PD and LGD are probabilities/percentages bounded by 0. A "negative loss" would imply a guaranteed profit from default, which is impossible.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Risk-Adjusted Return on Capital" (RAROC)?</h4>
              <p className="text-muted-foreground">
                RAROC = (Revenue - Expenses - Expected Loss) / Risk Capital. It helps banks decide if a loan is generating real economic value.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does EL assume correlation?</h4>
              <p className="text-muted-foreground">
                EL itself is just a sum (A+B+C). However, the *volatility* of that loss (Unexpected Loss) is heavily dependent on correlation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How often should EL be recalculated?</h4>
              <p className="text-muted-foreground">
                At least quarterly for reporting, but ideally whenever the borrower's rating (PD) or collateral value (LGD) changes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is this applicable to crypto lending?</h4>
              <p className="text-muted-foreground">
                Yes, the math is identical. However, in crypto, LGD is often 0% (if overcollateralized and liquidated instantly) or 100% (if unsecured/hack). PD is very volatile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Credit Risk Expected Loss Calculator allows lenders to quantify the specific cost of credit risk.</p>
          <p>It provides assessments for both the Expected Loss (provisioning) and Unexpected Loss (capital).</p>
          <p>Use this tool to price loans accurately and ensure adequate capital buffers.</p>
        </CardContent>
      </Card>
    </div>
  );
}
