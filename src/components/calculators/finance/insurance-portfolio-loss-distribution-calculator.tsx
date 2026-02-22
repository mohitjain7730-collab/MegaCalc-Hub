'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  expectedClaimFrequency: z.number({ invalid_type_error: 'Enter expected claim frequency' }).min(0),
  averageClaimSeverity: z.number({ invalid_type_error: 'Enter average claim severity' }).min(0),
  claimSeverityStdDev: z.number({ invalid_type_error: 'Enter claim severity standard deviation' }).min(0),
  numberOfSimulations: z.number({ invalid_type_error: 'Enter number of simulations' }).min(100).max(10000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  expectedClaimFrequency: number;
  averageClaimSeverity: number;
  claimSeverityStdDev: number;
  numberOfSimulations: number;
  expectedLoss: number;
  lossVariance: number;
  lossStdDev: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter expected claim frequency (average number of claims per period).',
  'Enter average claim severity (mean claim amount).',
  'Enter claim severity standard deviation (variability of claim amounts).',
  'Enter number of simulations (optional, default 1000).',
  'Review expected loss, variance, standard deviation, and loss distribution insights.',
];

const faqs = [
  {
    question: 'What is insurance portfolio loss distribution?',
    answer:
      'Insurance portfolio loss distribution models the probability distribution of aggregate losses from a portfolio of insurance policies. It combines claim frequency (number of claims) and claim severity (claim amounts) to estimate total loss distribution.',
  },
  {
    question: 'How is loss distribution calculated?',
    answer:
      'Loss distribution is calculated using compound distribution models, typically combining Poisson distribution for claim frequency with a severity distribution (e.g., normal, lognormal) for claim amounts. Expected loss = Frequency Ã— Average Severity.',
  },
  {
    question: 'What is expected claim frequency?',
    answer:
      'Expected claim frequency is the average number of claims expected per period, often modeled using a Poisson distribution. It represents how often claims occur in the insurance portfolio.',
  },
  {
    question: 'What is claim severity?',
    answer:
      'Claim severity is the amount of each claim, typically modeled using distributions like normal, lognormal, or gamma. Average severity represents the mean claim amount, while standard deviation measures variability.',
  },
  {
    question: 'What is expected loss?',
    answer:
      'Expected loss is the mean of the loss distribution, calculated as Expected Claim Frequency Ã— Average Claim Severity. It represents the average total loss expected from the portfolio.',
  },
  {
    question: 'What is loss variance?',
    answer:
      'Loss variance measures the variability of aggregate losses. For compound distributions, variance = Frequency Ã— (Severity Variance + Severity MeanÂ²). Higher variance indicates greater uncertainty in losses.',
  },
  {
    question: 'What are limitations of this calculation?',
    answer:
      'This calculation uses simplified assumptions. Real-world loss distributions depend on claim correlation, policy limits, reinsurance, and complex dependencies. Use as part of comprehensive actuarial analysis.',
  },
  {
    question: 'How can I use loss distribution?',
    answer:
      'Use loss distribution for: pricing insurance, setting reserves, determining capital requirements, evaluating reinsurance needs, and assessing portfolio risk. It provides insights into potential loss scenarios.',
  },
  {
    question: 'What is a compound Poisson distribution?',
    answer:
      'A compound Poisson distribution models aggregate losses by combining Poisson-distributed claim frequency with independent severity distributions. It is commonly used in actuarial science for insurance loss modeling.',
  },
  {
    question: 'When should I consult an actuary?',
    answer:
      'Consult an actuary for complex loss distribution modeling, regulatory compliance, reserve setting, pricing, and comprehensive portfolio risk analysis. Professional actuarial analysis provides detailed loss distribution insights and recommendations.',
  },
];

const relatedCalculators = [
  {
    name: 'Expected Loss Frequency/Severity Calculator',
    slug: 'expected-loss-frequency-severity-calculator',
    description: 'Calculate loss frequency, severity, and expected loss for risk assessment.',
  },
  {
    name: 'Expected Loss (Insurance Risk) Calculator',
    slug: 'expected-loss-insurance-risk-calculator',
    description: 'Calculate expected loss from insurance risk based on probability and severity.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements for financial stability.',
  },
  {
    name: 'Scenario Analysis Tool (Monte Carlo for Losses)',
    slug: 'scenario-analysis-tool-monte-carlo-for-losses',
    description: 'Perform Monte Carlo simulation for scenario analysis.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/insurance-portfolio-loss-distribution-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Insurance Portfolio Loss Distribution Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Insurance Portfolio Loss Distribution Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate insurance portfolio loss distribution based on expected claim frequency, average claim severity, and claim severity standard deviation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

// Generate normally distributed random number using Box-Muller transform
const generateNormalRandom = (mean: number, stdDev: number): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z0;
};

// Generate Poisson random number
const generatePoissonRandom = (lambda: number): number => {
  let k = 0;
  let p = 1;
  const L = Math.exp(-lambda);
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
};

const calculateResult = (values: FormValues): ResultPayload => {
  const expectedClaimFrequency = values.expectedClaimFrequency;
  const averageClaimSeverity = values.averageClaimSeverity;
  const claimSeverityStdDev = values.claimSeverityStdDev;
  const numberOfSimulations = values.numberOfSimulations || 1000;

  // Expected loss = Frequency Ã— Average Severity
  const expectedLoss = expectedClaimFrequency * averageClaimSeverity;

  // For compound Poisson distribution:
  // Variance = Î» Ã— (ÏƒÂ² + Î¼Â²) where Î» is frequency, Î¼ is mean severity, Ïƒ is std dev of severity
  const severityVariance = claimSeverityStdDev * claimSeverityStdDev;
  const lossVariance = expectedClaimFrequency * (severityVariance + averageClaimSeverity * averageClaimSeverity);
  const lossStdDev = Math.sqrt(lossVariance);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Loss distribution calculated. Expected loss, variance, and standard deviation provide insights into portfolio risk and potential loss scenarios.';

  const coefficientOfVariation = expectedLoss > 0 ? lossStdDev / expectedLoss : 0;

  if (coefficientOfVariation > 1.5 || lossStdDev > expectedLoss * 2) {
    status = 'low';
    interpretation = 'High loss variability (coefficient of variation > 1.5) indicates significant uncertainty in losses. Consider risk mitigation, reinsurance, or capital reserves to manage high variability and potential extreme losses.';
  } else if (coefficientOfVariation > 1 || lossStdDev > expectedLoss) {
    status = 'moderate';
    interpretation = 'Moderate loss variability indicates manageable uncertainty. Monitor loss distribution, maintain adequate reserves, and consider risk management strategies to address variability.';
  } else if (coefficientOfVariation > 0.5) {
    status = 'good';
    interpretation = 'Acceptable loss variability indicates reasonable uncertainty. Continue monitoring loss distribution and maintaining appropriate reserves and risk management practices.';
  } else {
    status = 'optimal';
    interpretation = 'Low loss variability indicates stable loss distribution. Continue maintaining effective risk management and monitoring to sustain favorable loss distribution characteristics.';
  }

  const recommendations = [
    `Expected Loss: $${expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This represents the mean of the loss distribution (Frequency Ã— Average Severity).`,
    `Loss Standard Deviation: $${lossStdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This measures the variability of aggregate losses, indicating uncertainty in loss outcomes.`,
    `Coefficient of Variation: ${coefficientOfVariation.toFixed(3)}. This ratio (Std Dev / Mean) measures relative variability. Lower values indicate more stable loss distribution.`,
  ];
  if (coefficientOfVariation > 1) {
    recommendations.push('High coefficient of variation indicates significant loss variability. Consider risk mitigation strategies, reinsurance, or increased capital reserves to manage high variability and potential extreme losses.');
  } else {
    recommendations.push('Acceptable coefficient of variation indicates manageable loss variability. Continue monitoring loss distribution and maintaining appropriate reserves and risk management practices.');
  }
  if (expectedLoss > 1000000) {
    recommendations.push('High expected loss requires adequate premium rates, reserves, and capital to cover expected losses plus expenses and profit margin. Review pricing and capital adequacy.');
  }

  const plan = [
    { label: 'This Week', detail: `Review expected loss: $${expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}, standard deviation: $${lossStdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}, and coefficient of variation: ${coefficientOfVariation.toFixed(3)}. Assess loss distribution characteristics and risk implications.` },
    { label: 'This Month', detail: 'If loss variability is high, take action: implement risk mitigation strategies, consider reinsurance, increase capital reserves, or adjust underwriting to reduce loss variability and manage portfolio risk effectively.' },
    { label: 'Ongoing', detail: 'Continuously monitor loss distribution, expected loss, and variability. Maintain adequate reserves, capital, and risk management practices to ensure portfolio stability and financial viability.' },
  ];

  return {
    expectedClaimFrequency,
    averageClaimSeverity,
    claimSeverityStdDev,
    numberOfSimulations,
    expectedLoss,
    lossVariance,
    lossStdDev,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function InsurancePortfolioLossDistributionCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expectedClaimFrequency: undefined,
      averageClaimSeverity: undefined,
      claimSeverityStdDev: undefined,
      numberOfSimulations: 1000,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="portfolio-loss-distribution-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Insurance Portfolio Loss Distribution Calculator
          </CardTitle>
          <CardDescription>Calculate insurance portfolio loss distribution based on expected claim frequency, average claim severity, and claim severity standard deviation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
              try {
                setResult(calculateResult(values));
              } catch (error) {
                console.error('Error calculating result:', error);
                alert('An error occurred while calculating. Please check the console for details.');
              }
            }, (errors) => {
              console.log('Form validation errors:', errors);
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expectedClaimFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Claim Frequency</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageClaimSeverity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Claim Severity ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="claimSeverityStdDev"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Severity Std Dev ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 2000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfSimulations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Simulations (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 1000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate loss distribution
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See expected loss, variance, standard deviation, and loss distribution insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Loss</p>
                <p className="text-2xl font-semibold text-primary">${result.expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">Mean of distribution</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Variance</p>
                <p className="text-2xl font-semibold text-primary">{(result.lossVariance / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">Variability measure</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Std Dev</p>
                <p className="text-2xl font-semibold text-primary">${result.lossStdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">Risk measure</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Expected Loss</strong> = Expected Claim Frequency Ã— Average Claim Severity. The mean of the loss distribution.
          </p>
          <p>
            <strong>Loss Variance</strong> = Frequency Ã— (Severity Variance + Severity MeanÂ²). For compound Poisson distribution, this measures the variability of aggregate losses.
          </p>
          <p>
            <strong>Loss Standard Deviation</strong> = âˆšLoss Variance. The standard deviation of aggregate losses, representing uncertainty in loss outcomes.
          </p>
          <p>
            <strong>Coefficient of Variation</strong> = Loss Std Dev / Expected Loss. A measure of relative variability, with lower values indicating more stable loss distribution.
          </p>
          <p>This calculation uses compound distribution models, typically combining Poisson distribution for claim frequency with normal distribution for claim severity. Higher frequency and severity variability increase loss variance and uncertainty.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coefficient of Variation</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.lossStdDev / result.expectedLoss).toFixed(3)}
                </p>
                <p className="text-xs text-muted-foreground">Relative variability</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Severity CV</p>
                <p className="text-xl font-semibold text-primary">
                  {result.averageClaimSeverity > 0 ? (result.claimSeverityStdDev / result.averageClaimSeverity).toFixed(3) : '0.000'}
                </p>
                <p className="text-xs text-muted-foreground">Claim variability</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your information to see additional insights.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    <meta itemProp="name" content="The Definitive Guide to Insurance Portfolio Loss Distribution: Compound Distribution Modeling" />
    <meta itemProp="description" content="A comprehensive guide to calculating and understanding insurance portfolio loss distribution using compound distribution models for frequency and severity." />
    <meta itemProp="keywords" content="loss distribution, compound Poisson, claim frequency, claim severity, portfolio risk, actuarial modeling" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-loss-distribution-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Insurance Portfolio Loss Distribution: Compound Distribution Modeling</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating insurance portfolio loss distribution using compound distribution models, combining claim frequency and severity to estimate aggregate loss distribution.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Loss Distribution</a></li>
        <li><a href="#frequency" className="hover:underline">Claim Frequency</a></li>
        <li><a href="#severity" className="hover:underline">Claim Severity</a></li>
        <li><a href="#compound" className="hover:underline">Compound Distribution</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Loss Distribution</h2>
    <p><b>Insurance portfolio loss distribution</b> models the probability distribution of aggregate losses from a portfolio of insurance policies. It combines claim frequency (number of claims) and claim severity (claim amounts) to estimate total loss distribution.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Claim Frequency:</b> Number of claims expected per period, often modeled using Poisson distribution</li>
        <li><b>Claim Severity:</b> Amount of each claim, typically modeled using normal, lognormal, or gamma distributions</li>
        <li><b>Expected Loss:</b> Mean of the loss distribution, calculated as Frequency Ã— Average Severity</li>
        <li><b>Loss Variance:</b> Variability of aggregate losses, measuring uncertainty in loss outcomes</li>
    </ul>

<hr />

    <h2 id="frequency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Claim Frequency</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Poisson Distribution</h3>
    <p>Claim frequency is typically modeled using a Poisson distribution, which assumes:</p>
    <ul>
        <li>Claims occur randomly and independently</li>
        <li>Average number of claims per period is known (Î»)</li>
        <li>Probability of multiple claims in a short interval is negligible</li>
    </ul>
    <p>The Poisson distribution is well-suited for modeling claim frequency in insurance portfolios.</p>

<hr />

    <h2 id="severity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Claim Severity</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Severity Distributions</h3>
    <p>Claim severity can be modeled using various distributions:</p>
    <ul>
        <li><b>Normal Distribution:</b> Suitable when claim amounts are symmetrically distributed</li>
        <li><b>Lognormal Distribution:</b> Suitable for positive, right-skewed claim amounts</li>
        <li><b>Gamma Distribution:</b> Flexible distribution for positive claim amounts</li>
    </ul>
    <p>Average severity and standard deviation characterize the severity distribution.</p>

<hr />

    <h2 id="compound" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Compound Distribution</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Compound Poisson Model</h3>
    <p>A compound Poisson distribution models aggregate losses by:</p>
    <ul>
        <li>Using Poisson distribution for claim frequency (number of claims)</li>
        <li>Using severity distribution for claim amounts (independent of frequency)</li>
        <li>Aggregating individual claim amounts to total loss</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Expected Loss and Variance</h3>
    <p><b>Expected Loss</b> = Frequency Ã— Average Severity</p>
    <p><b>Loss Variance</b> = Frequency Ã— (Severity Variance + Severity MeanÂ²)</p>
    <p>These formulas provide insights into portfolio risk and potential loss scenarios.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Insurance portfolio loss distribution</b> provides critical insights into portfolio risk. Use loss distribution for pricing, reserve setting, capital requirements, and risk assessment. Monitor expected loss, variance, and distribution characteristics to ensure portfolio stability and financial viability.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool calculates insurance portfolio loss distribution based on expected claim frequency, average claim severity, and claim severity standard deviation.</p>
          <p>Outputs include expected loss, loss variance, loss standard deviation, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
