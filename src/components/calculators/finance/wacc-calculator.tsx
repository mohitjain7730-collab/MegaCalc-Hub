'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, AlertCircle, Target, Info, Landmark, DollarSign, TrendingUp, Shield, BarChart3, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  equityValue: z.number().positive(),
  debtValue: z.number().nonnegative(),
  costOfEquity: z.number().positive(),
  costOfDebt: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function WACCCalculator() {
  const [result, setResult] = useState<{ 
    wacc: number; 
    interpretation: string; 
    costLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equityValue: undefined,
      debtValue: undefined,
      costOfEquity: undefined,
      costOfDebt: undefined,
      taxRate: undefined,
    },
  });

  const calculateWACC = (v: FormValues) => {
    if (v.equityValue == null || v.debtValue == null || v.costOfEquity == null || v.costOfDebt == null || v.taxRate == null) return null;
    
    const totalValue = v.equityValue + v.debtValue;
    const equityWeight = v.equityValue / totalValue;
    const debtWeight = v.debtValue / totalValue;
    const afterTaxCostOfDebt = v.costOfDebt * (1 - v.taxRate / 100);
    
    const wacc = (equityWeight * v.costOfEquity) + (debtWeight * afterTaxCostOfDebt);
    
    return wacc;
  };

  const interpret = (wacc: number) => {
    if (wacc >= 15) return 'High cost of capital - expensive financing with significant hurdle rate.';
    if (wacc >= 10) return 'Moderate cost of capital - reasonable financing costs for investments.';
    if (wacc >= 5) return 'Low cost of capital - attractive financing costs for growth opportunities.';
    if (wacc >= 0) return 'Very low cost of capital - excellent financing conditions.';
    return 'Negative cost of capital - unusual financing conditions.';
  };

  const getCostLevel = (wacc: number) => {
    if (wacc >= 15) return 'High';
    if (wacc >= 10) return 'Moderate';
    if (wacc >= 5) return 'Low';
    if (wacc >= 0) return 'Very Low';
    return 'Negative';
  };

  const getRecommendation = (wacc: number) => {
    if (wacc >= 15) return 'Focus on high-return projects - high hurdle rate requires significant returns.';
    if (wacc >= 10) return 'Balance growth and profitability - moderate hurdle rate for investments.';
    if (wacc >= 5) return 'Pursue growth opportunities - low cost of capital enables expansion.';
    if (wacc >= 0) return 'Aggressive growth strategy - very low cost of capital supports expansion.';
    return 'Review capital structure - unusual cost of capital requires analysis.';
  };

  const getStrength = (wacc: number) => {
    if (wacc >= 15) return 'Weak';
    if (wacc >= 10) return 'Moderate';
    if (wacc >= 5) return 'Strong';
    if (wacc >= 0) return 'Very Strong';
    return 'Special';
  };

  const getInsights = (wacc: number) => {
    const insights = [];
    if (wacc >= 15) {
      insights.push('High financing costs');
      insights.push('Significant hurdle rate');
      insights.push('Requires high-return projects');
    } else if (wacc >= 10) {
      insights.push('Moderate financing costs');
      insights.push('Balanced hurdle rate');
      insights.push('Suitable for growth investments');
    } else if (wacc >= 5) {
      insights.push('Low financing costs');
      insights.push('Attractive hurdle rate');
      insights.push('Supports growth opportunities');
    } else if (wacc >= 0) {
      insights.push('Very low financing costs');
      insights.push('Excellent hurdle rate');
      insights.push('Enables aggressive growth');
    } else {
      insights.push('Unusual financing conditions');
      insights.push('Requires further analysis');
      insights.push('May indicate structural issues');
    }
    return insights;
  };

  const getConsiderations = (wacc: number) => {
    const considerations = [];
    considerations.push('WACC varies by industry and market conditions');
    considerations.push('Tax benefits of debt reduce effective cost');
    considerations.push('Consider market conditions and interest rates');
    considerations.push('WACC should be used as hurdle rate for projects');
    considerations.push('Regular review ensures accuracy');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const wacc = calculateWACC(values);
    if (wacc !== null) {
      setResult({
        wacc,
        interpretation: interpret(wacc),
        costLevel: getCostLevel(wacc),
        recommendation: getRecommendation(wacc),
        strength: getStrength(wacc),
        insights: getInsights(wacc),
        considerations: getConsiderations(wacc)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle>WACC Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's Weighted Average Cost of Capital to assess financing costs and investment hurdle rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="equityValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Equity Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter equity value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="debtValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Debt Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter debt value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="costOfEquity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Cost of Equity (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter cost of equity" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="costOfDebt" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Cost of Debt (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter cost of debt" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="taxRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Tax Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter tax rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate WACC
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-6 w-6 text-primary" />
                  <CardTitle>WACC Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.costLevel === 'Low' ? 'default' : result.costLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.costLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.wacc.toFixed(2)}%
                </div>
                <p className="text-lg text-muted-foreground">{result.interpretation}</p>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.recommendation}</AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                <CardTitle>Insights & Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Strengths & Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Important Considerations
                  </h4>
                  <ul className="space-y-2">
                    {result.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other essential financial metrics for comprehensive business analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/capm-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">CAPM</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/leverage-debt-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Leverage Debt Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/enterprise-value-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Enterprise Value</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/interest-coverage-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Interest Coverage</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to WACC Calculation: Weighted Average Cost of Capital, Discount Rate, and Valuation" />
    <meta itemProp="description" content="An expert guide detailing the WACC formula, its role as the company's discount rate, how to calculate the cost of equity (Re) and cost of debt (Rd), and its critical application in Net Present Value (NPV) and Discounted Cash Flow (DCF) valuation." />
    <meta itemProp="keywords" content="WACC formula explained, calculating cost of capital, weighted average cost of debt and equity, discount rate NPV, WACC components, cost of equity CAPM, tax shield debt" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-wacc-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to WACC: Weighted Average Cost of Capital and Discounting</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental corporate finance metric that represents the blended, overall cost of financing a company's assets.</p>
    

[Image of the Weighted Average Cost of Capital concept]


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">WACC: Definition and Role as Discount Rate</a></li>
        <li><a href="#formula" className="hover:underline">The WACC Formula and Components</a></li>
        <li><a href="#equity" className="hover:underline">Calculating the Cost of Equity (Re)</a></li>
        <li><a href="#debt" className="hover:underline">Calculating the Cost of Debt (Rd) and Tax Shield</a></li>
        <li><a href="#applications" className="hover:underline">WACC in Valuation and Capital Budgeting</a></li>
    </ul>
<hr />

    {/* WACC: DEFINITION AND ROLE AS DISCOUNT RATE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">WACC: Definition and Role as Discount Rate</h2>
    <p>The **Weighted Average Cost of Capital (WACC)** is the average rate of return a company expects to pay its security holders (bondholders and shareholders) to finance its assets. It is the blended cost of all long-term funding sources, weighted by their proportion in the company’s capital structure.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Role as the Discount Rate</h3>
    <p>WACC is the most critical component in investment analysis because it serves as the **Discount Rate** ($r$) for the entire firm. When valuing a company or project using the Net Present Value (NPV) or Discounted Cash Flow (DCF) methods, WACC is the rate used to bring future Free Cash Flows to Firm (FCFF) back to their Present Value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Hurdle Rate</h3>
    <p>WACC is also the **Hurdle Rate**—the minimum return a company must earn on a new investment to create value. If a project generates a return less than the WACC, it destroys shareholder value, even if the project is profitable.</p>

<hr />

    {/* THE WACC FORMULA AND COMPONENTS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The WACC Formula and Components</h2>
    <p>WACC is calculated by multiplying the cost of each capital component (equity and debt) by its proportional weight in the total capital structure and summing the results.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The standard WACC formula incorporates the tax benefit of debt (the tax shield) but assumes the capital structure (the weights) remains constant:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'WACC = (E/V) * Re + (D/V) * Rd * (1 - T)'}
        </p>
    </div>

    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$Re$ = Cost of Equity.</li>
        <li>$Rd$ = Cost of Debt.</li>
        <li>$E/V$ = Proportion of equity financing (Equity Market Value / Total Market Value).</li>
        <li>$D/V$ = Proportion of debt financing (Debt Market Value / Total Market Value).</li>
        <li>$T$ = Corporate Tax Rate.</li>
    </ul>

<hr />

    {/* CALCULATING THE COST OF EQUITY (RE) */}
    <h2 id="equity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating the Cost of Equity ($Re$)</h2>
    <p>The Cost of Equity ($Re$) is the return required by investors for holding the company's stock. Since dividends and capital gains are not contractual, $Re$ must be calculated using a model that incorporates the stock's risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The CAPM Method</h3>
    <p>The most common method for determining $Re$ is the **Capital Asset Pricing Model (CAPM)**, which links risk (Beta) to return:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Re = Rf + β * (Rm - Rf)'}
        </p>
    </div>
    <p>Where $R_f$ is the risk-free rate, $\beta$ is the stock's beta (systematic risk), and $R_m - R_f$ is the market risk premium. This compensates the investor for taking on the market risk associated with the specific stock.</p>

<hr />

    {/* CALCULATING THE COST OF DEBT (RD) AND TAX SHIELD */}
    <h2 id="debt" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating the Cost of Debt ($Rd$) and Tax Shield</h2>
    <p>The Cost of Debt ($Rd$) is the effective rate a company pays on its borrowed funds. Unlike equity, debt provides a crucial tax advantage known as the **Tax Shield**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cost of Debt ($Rd$)</h3>
    <p>The most accurate measure of $Rd$ is the **Yield to Maturity (YTM)** on the company's long-term bonds. For private companies or those without publicly traded debt, $Rd$ is often approximated using the interest rate on the company's newest long-term bank loans.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Tax Shield ($1 - T$)</h3>
    <p>Interest payments on debt are generally tax-deductible expenses. This means the actual cost of debt to the company is lower than the stated interest rate. The after-tax cost of debt is $Rd \times (1 - T)$.</p>
    <p>This tax shield is the reason debt financing is often **cheaper** than equity financing, leading companies to use a certain amount of leverage to lower the overall WACC.</p>

<hr />

    {/* WACC IN VALUATION AND CAPITAL BUDGETING */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">WACC in Valuation and Capital Budgeting</h2>
    <p>WACC is the linchpin of valuation and capital allocation decisions within the firm.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Discounting in DCF</h3>
    <p>WACC is the discount rate used to calculate the **Enterprise Value (EV)** of the firm. It is the rate applied to the Free Cash Flow to Firm (FCFF) forecasts because FCFF is the cash flow available to *all* capital providers (both debt and equity).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Project-Specific Hurdle Rates</h3>
    <p>While WACC represents the cost of capital for the *entire firm*, best practice requires adjusting the WACC when evaluating a project with a risk profile significantly different from the firm's average. High-risk projects should use a discount rate **higher** than the WACC, and low-risk projects should use a rate **lower** than the WACC.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Weighted Average Cost of Capital (WACC) is the foundational financial metric that represents the firm's **blended cost of financing**, weighted by the market value proportions of debt and equity.</p>
    <p>Calculated by combining the Cost of Equity ($Re$ via CAPM) and the after-tax Cost of Debt, WACC serves as the definitive **discount rate** and hurdle rate. This ensures that only projects expected to generate returns greater than the cost of capital are approved, thereby maximizing shareholder value.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about WACC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is WACC?</h4>
              <p className="text-muted-foreground">
                Weighted Average Cost of Capital (WACC) is the average rate a company expects to pay to finance its assets. It's calculated by weighting the cost of equity and cost of debt by their respective proportions in the capital structure, adjusted for the tax benefits of debt financing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate WACC?</h4>
              <p className="text-muted-foreground">
                The WACC formula is: WACC = (E/V × Re) + (D/V × Rd × (1-T)), where E is equity value, D is debt value, V is total value (E+D), Re is cost of equity, Rd is cost of debt, and T is tax rate. This weights each cost of capital by its proportion in the capital structure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good WACC?</h4>
              <p className="text-muted-foreground">
                A good WACC depends on the industry and market conditions. Generally, WACC below 8% is considered low, 8-12% is moderate, and above 12% is high. Lower WACC indicates cheaper financing and better investment opportunities. Compare WACC to industry averages and market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does WACC affect investment decisions?</h4>
              <p className="text-muted-foreground">
                WACC serves as the hurdle rate for investment decisions. Projects with returns above WACC create value for shareholders, while projects below WACC destroy value. WACC helps determine which investments to pursue and provides a benchmark for evaluating project profitability.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors influence WACC?</h4>
              <p className="text-muted-foreground">
                WACC is influenced by interest rates, market conditions, company risk profile, capital structure, tax rates, and investor expectations. Changes in any of these factors can significantly impact WACC. Regular monitoring ensures accurate investment decision-making.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does debt affect WACC?</h4>
              <p className="text-muted-foreground">
                Debt typically reduces WACC due to tax benefits (interest is tax-deductible) and lower cost compared to equity. However, excessive debt increases financial risk and can raise the cost of both debt and equity. Optimal capital structure balances these effects to minimize WACC.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of WACC?</h4>
              <p className="text-muted-foreground">
                WACC assumes constant capital structure, stable risk profile, and efficient markets. It may not reflect changing market conditions or company-specific risks. WACC is based on current market values and may not predict future financing costs accurately.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How is WACC used in valuation?</h4>
              <p className="text-muted-foreground">
                WACC is used as the discount rate in discounted cash flow (DCF) valuation models. It determines the present value of future cash flows and helps assess company value. WACC ensures that valuation reflects the company's cost of capital and risk profile.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is WACC important for companies?</h4>
              <p className="text-muted-foreground">
                WACC is crucial for companies as it guides investment decisions, capital allocation, and strategic planning. It helps determine which projects create value, assess financing options, and evaluate performance. Understanding WACC is essential for effective financial management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should WACC be recalculated?</h4>
              <p className="text-muted-foreground">
                WACC should be recalculated when market conditions change significantly, capital structure changes, or for major investment decisions. Regular reviews (quarterly or annually) ensure accuracy. Consider updating WACC when interest rates, market risk, or company risk profile changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}