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
  coverageAmount: z.number({ invalid_type_error: 'Enter coverage amount' }).min(0),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  gender: z.enum(['male', 'female'], { invalid_type_error: 'Select gender' }),
  termYears: z.number({ invalid_type_error: 'Enter term years' }).min(10).max(40),
  healthStatus: z.enum(['excellent', 'good', 'average', 'poor'], { invalid_type_error: 'Select health status' }),
  smokingStatus: z.enum(['non-smoker', 'smoker'], { invalid_type_error: 'Select smoking status' }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  coverageAmount: number;
  age: number;
  gender: string;
  termYears: number;
  healthStatus: string;
  smokingStatus: string;
  baseMonthlyPremium: number;
  annualPremium: number;
  totalCostOverTerm: number;
  costPerThousand: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter coverage amount and your age.',
  'Select gender and term policy length (10, 20, or 30 years).',
  'Select health status (excellent, good, average, or poor).',
  'Select smoking status (non-smoker or smoker).',
  'Review estimated monthly and annual premiums, and total cost over term.',
];

const faqs = [
  {
    question: 'How are life insurance premiums calculated?',
    answer:
      'Premiums are based on age, gender, coverage amount, term length, health status, and smoking status. Younger, healthier non-smokers pay lower premiums. Premiums increase with age, coverage amount, and health risks.',
  },
  {
    question: 'How does age affect premiums?',
    answer:
      'Premiums increase significantly with age. A 30-year-old might pay $30/month for $500K coverage, while a 50-year-old might pay $150/month. Each year of age typically increases premiums by 5-10%.',
  },
  {
    question: 'Why do men pay more than women?',
    answer:
      'Men have shorter life expectancies than women, so insurers charge higher premiums to account for higher mortality risk. The difference is typically 20-40% higher for men.',
  },
  {
    question: 'How does smoking affect premiums?',
    answer:
      'Smokers pay 2-4 times more than non-smokers due to significantly higher mortality risk. A smoker might pay $200/month while a non-smoker pays $50/month for the same coverage.',
  },
  {
    question: 'What is cost per thousand?',
    answer:
      'Cost per thousand is the annual premium divided by coverage amount in thousands. For example, $600 annual premium for $500K coverage = $1.20 per thousand. Lower is better.',
  },
  {
    question: 'How does health status affect premiums?',
    answer:
      'Excellent health (no medical issues) gets best rates. Good health (minor issues) pays 10-20% more. Average health (controlled conditions) pays 30-50% more. Poor health may be uninsurable or pay 100%+ more.',
  },
  {
    question: 'Should I lock in term length?',
    answer:
      'Longer terms (30 years) have higher premiums but lock in rates. Shorter terms (10 years) are cheaper but premiums increase significantly at renewal. Choose based on when you\'ll no longer need coverage.',
  },
  {
    question: 'Can I reduce premiums?',
    answer:
      'Reduce premiums by: improving health (lose weight, quit smoking), choosing shorter term length, reducing coverage amount, shopping multiple insurers, or accepting higher deductibles if available.',
  },
  {
    question: 'How accurate are premium estimates?',
    answer:
      'Estimates provide ballpark figures. Actual premiums depend on medical underwriting, family history, occupation, hobbies, and insurer-specific pricing. Get quotes from multiple insurers for accuracy.',
  },
  {
    question: 'What about guaranteed issue policies?',
    answer:
      'Guaranteed issue policies (no medical exam) have much higher premiums (2-3x) and lower coverage limits. Only consider if you cannot qualify for standard underwriting due to health issues.',
  },
];

const relatedCalculators = [
  {
    name: 'Life Insurance Coverage Needs Calculator',
    slug: 'life-insurance-coverage-needs-calculator',
    description: 'Calculate life insurance coverage needs.',
  },
  {
    name: 'Term vs Whole Life Comparison Calculator',
    slug: 'term-vs-whole-life-comparison-calculator',
    description: 'Compare term and whole life insurance.',
  },
  {
    name: 'Human Life Value (HLV) Calculator',
    slug: 'human-life-value-hlv-calculator',
    description: 'Calculate economic value of human life.',
  },
  {
    name: 'Disability Insurance Coverage Calculator',
    slug: 'disability-insurance-coverage-calculator',
    description: 'Calculate disability insurance needs.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/life-insurance-premium-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Life Insurance Premium Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Life Insurance Premium Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate life insurance premiums based on age, gender, coverage amount, term length, health status, and smoking status.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const coverageAmount = values.coverageAmount;
  const age = values.age;
  const gender = values.gender;
  const termYears = values.termYears;
  const healthStatus = values.healthStatus;
  const smokingStatus = values.smokingStatus;

  // Base rate per $1000 of coverage (varies by age, gender, term)
  // Simplified model: base rates increase with age
  let baseRatePerThousand = 0;
  
  // Base rates by age group (per $1000 coverage, annual)
  if (age < 30) {
    baseRatePerThousand = gender === 'male' ? 0.8 : 0.6;
  } else if (age < 40) {
    baseRatePerThousand = gender === 'male' ? 1.2 : 0.9;
  } else if (age < 50) {
    baseRatePerThousand = gender === 'male' ? 2.0 : 1.5;
  } else if (age < 60) {
    baseRatePerThousand = gender === 'male' ? 4.0 : 3.0;
  } else if (age < 70) {
    baseRatePerThousand = gender === 'male' ? 8.0 : 6.0;
  } else {
    baseRatePerThousand = gender === 'male' ? 15.0 : 12.0;
  }

  // Adjust for term length (longer terms have slightly higher rates)
  if (termYears === 30) {
    baseRatePerThousand *= 1.15;
  } else if (termYears === 20) {
    baseRatePerThousand *= 1.05;
  }

  // Adjust for health status
  let healthMultiplier = 1.0;
  if (healthStatus === 'excellent') {
    healthMultiplier = 0.9;
  } else if (healthStatus === 'good') {
    healthMultiplier = 1.1;
  } else if (healthStatus === 'average') {
    healthMultiplier = 1.4;
  } else if (healthStatus === 'poor') {
    healthMultiplier = 2.0;
  }

  // Adjust for smoking status
  const smokingMultiplier = smokingStatus === 'smoker' ? 2.5 : 1.0;

  // Calculate annual premium
  const costPerThousand = baseRatePerThousand * healthMultiplier * smokingMultiplier;
  const annualPremium = (coverageAmount / 1000) * costPerThousand;
  const baseMonthlyPremium = annualPremium / 12;
  const totalCostOverTerm = annualPremium * termYears;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Premium estimate calculated. Actual premiums may vary based on medical underwriting and insurer-specific pricing. Get quotes from multiple insurers for best rates.';

  if (costPerThousand > 10) {
    status = 'moderate';
    interpretation = 'High premium rate suggests older age, health issues, or smoking status significantly increases cost. Consider improving health or reducing coverage amount to lower premiums.';
  } else if (costPerThousand < 1) {
    status = 'optimal';
    interpretation = 'Low premium rate indicates young age, excellent health, and non-smoker status. Lock in these rates with a longer term policy if coverage needs are stable.';
  } else {
    status = 'good';
    interpretation = 'Moderate premium rate. Compare quotes from multiple insurers and consider term length based on when you\'ll no longer need coverage.';
  }

  const recommendations = [
    `Premium estimate: ${baseMonthlyPremium.toFixed(2)}/month (${annualPremium.toLocaleString(undefined, { maximumFractionDigits: 0 })}/year) for ${coverageAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} coverage over ${termYears} years.`,
    `Cost per thousand: ${costPerThousand.toFixed(2)} per $1,000 of coverage. Lower is better. Compare to industry averages: excellent health non-smokers typically pay $0.50-$2.00 per thousand.`,
    `Total cost over term: ${totalCostOverTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Remember, this is insurance protection, not an investment.`,
  ];
  if (smokingStatus === 'smoker') {
    recommendations.push('Smoking significantly increases premiums (2-3x). Quitting smoking can reduce premiums substantially. Many insurers offer lower rates after being smoke-free for 1-2 years.');
  }
  if (healthStatus === 'poor' || healthStatus === 'average') {
    recommendations.push('Improving health can reduce premiums. Consider: losing weight, managing chronic conditions, regular exercise. Some insurers offer wellness discounts for healthy lifestyles.');
  }

  const plan = [
    { label: 'This Week', detail: `Get premium estimates: ${baseMonthlyPremium.toFixed(2)}/month. Request quotes from 3-5 insurers to compare rates and find the best value.` },
    { label: 'This Month', detail: 'Complete medical underwriting if required. Prepare for health exam by improving health metrics (blood pressure, cholesterol, weight) if possible.' },
    { label: 'Ongoing', detail: 'Review coverage needs annually. As health improves or circumstances change, you may qualify for better rates or need to adjust coverage amount.' },
  ];

  return {
    coverageAmount,
    age,
    gender,
    termYears,
    healthStatus,
    smokingStatus,
    baseMonthlyPremium,
    annualPremium,
    totalCostOverTerm,
    costPerThousand,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function LifeInsurancePremiumEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverageAmount: undefined,
      age: undefined,
      gender: undefined,
      termYears: undefined,
      healthStatus: undefined,
      smokingStatus: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="life-insurance-premium-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Life Insurance Premium Estimator
          </CardTitle>
          <CardDescription>Estimate life insurance premiums based on age, gender, coverage amount, term length, health status, and smoking status.</CardDescription>
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
                  name="coverageAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value as 'male' | 'female')} className="w-full p-2 border rounded">
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term Years</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="healthStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Status</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value as 'excellent' | 'good' | 'average' | 'poor')} className="w-full p-2 border rounded">
                          <option value="">Select health status</option>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="average">Average</option>
                          <option value="poor">Poor</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smokingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smoking Status</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value as 'non-smoker' | 'smoker')} className="w-full p-2 border rounded">
                          <option value="">Select smoking status</option>
                          <option value="non-smoker">Non-Smoker</option>
                          <option value="smoker">Smoker</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate premium
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
            <CardDescription>See estimated monthly and annual premiums, total cost over term, and cost per thousand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monthly Premium</p>
                <p className="text-2xl font-semibold text-primary">{result.baseMonthlyPremium.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">$/month</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Annual Premium</p>
                <p className="text-2xl font-semibold text-primary">{result.annualPremium.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/year</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Cost Over Term</p>
                <p className="text-2xl font-semibold text-primary">{result.totalCostOverTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cost per $1,000</p>
                <p className="text-2xl font-semibold text-primary">{result.costPerThousand.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">$/year</p>
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
            <strong>Base Rate per $1,000</strong> = Age-based rate Ã— Gender multiplier Ã— Term length multiplier. Base rates increase with age and are higher for males and longer terms.
          </p>
          <p>
            <strong>Adjusted Rate</strong> = Base Rate Ã— Health Status Multiplier Ã— Smoking Status Multiplier. Health and smoking significantly affect premiums.
          </p>
          <p>
            <strong>Annual Premium</strong> = (Coverage Amount / 1,000) Ã— Adjusted Rate per $1,000. This represents yearly premium cost.
          </p>
          <p>
            <strong>Monthly Premium</strong> = Annual Premium / 12. Monthly payment amount.
          </p>
          <p>
            <strong>Total Cost Over Term</strong> = Annual Premium Ã— Term Years. Total premiums paid over policy duration.
          </p>
          <p>
            <strong>Cost per Thousand</strong> = Annual Premium / (Coverage Amount / 1,000). Standard metric for comparing policies.
          </p>
          <p>Life insurance premiums are based on mortality risk. Younger, healthier non-smokers pay lower premiums. Premiums increase significantly with age, health issues, and smoking status.</p>
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
                <p className="text-sm text-muted-foreground">Coverage per $1 Premium</p>
                <p className="text-xl font-semibold text-primary">
                  {result.annualPremium > 0 ? (result.coverageAmount / result.annualPremium).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">$ coverage per $ premium</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monthly Cost per $100K</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.baseMonthlyPremium / result.coverageAmount) * 100000).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">$/month per $100K</p>
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
                <Link href={`/finance/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    <meta itemProp="name" content="The Definitive Guide to Life Insurance Premiums: Estimating Life Insurance Costs" />
    <meta itemProp="description" content="A comprehensive guide to estimating life insurance premiums based on age, gender, coverage amount, term length, health status, and smoking status." />
    <meta itemProp="keywords" content="life insurance premium, premium estimator, life insurance cost, term life premium, insurance pricing, mortality risk" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-life-insurance-premium-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Life Insurance Premiums: Estimating Life Insurance Costs</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to understanding and estimating life insurance premiums based on risk factors and coverage needs.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: How Life Insurance Premiums Work</a></li>
        <li><a href="#factors" className="hover:underline">Factors Affecting Premiums</a></li>
        <li><a href="#calculation" className="hover:underline">Premium Calculation</a></li>
        <li><a href="#reduction" className="hover:underline">Reducing Premiums</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: How Life Insurance Premiums Work</h2>
    <p><b>Life insurance premiums</b> are based on mortality riskâ€”the likelihood the insurer will pay a death benefit. Premiums are calculated using actuarial tables that consider age, gender, health, lifestyle, and coverage amount.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Principles</h3>
    <ul>
        <li><b>Risk-based pricing:</b> Higher risk = higher premiums</li>
        <li><b>Age factor:</b> Premiums increase 5-10% per year of age</li>
        <li><b>Gender difference:</b> Men pay 20-40% more due to shorter life expectancy</li>
        <li><b>Health impact:</b> Health status can double or triple premiums</li>
    </ul>

<hr />

    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Premiums</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">1. Age</h3>
    <p>Age is the primary factor. A 30-year-old might pay $30/month for $500K coverage, while a 50-year-old pays $150/month. Premiums increase exponentially with age.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Gender</h3>
    <p>Men pay 20-40% more than women due to shorter life expectancies and higher mortality rates at all ages. This difference is based on actuarial data, not discrimination.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Health Status</h3>
    <p>Excellent health (no medical issues) gets best rates. Good health pays 10-20% more. Average health (controlled conditions) pays 30-50% more. Poor health may be uninsurable or pay 100%+ more.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Smoking Status</h3>
    <p>Smokers pay 2-4 times more than non-smokers due to significantly higher mortality risk. Quitting smoking can reduce premiums substantially after 1-2 smoke-free years.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Coverage Amount and Term Length</h3>
    <p>Higher coverage amounts and longer terms increase premiums proportionally. A $1M policy costs roughly double a $500K policy. 30-year terms cost 10-15% more than 20-year terms.</p>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Premium Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Base Rate Structure</h3>
    <p>Premiums are calculated as: <b>Annual Premium = (Coverage Amount / 1,000) Ã— Rate per $1,000</b>. The rate per thousand varies by age, gender, term length, health, and smoking status.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cost per Thousand</h3>
    <p>Cost per thousand is a standard metric for comparing policies. Excellent health non-smokers typically pay $0.50-$2.00 per thousand annually. Higher rates indicate higher risk or older age.</p>

<hr />

    <h2 id="reduction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Reducing Premiums</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Health Improvements</h3>
    <p>Improve health by: losing weight, managing chronic conditions, regular exercise, quitting smoking, reducing alcohol consumption. Some insurers offer wellness discounts for healthy lifestyles.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Shopping Strategies</h3>
    <p>Get quotes from 3-5 insurers. Rates vary significantly between companies. Consider: term length (shorter is cheaper), coverage amount (only what you need), and policy features (simpler is cheaper).</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Life insurance premiums</b> are based on mortality risk factors: age, gender, health, smoking, coverage amount, and term length. Younger, healthier non-smokers pay lower premiums. Get quotes from multiple insurers and improve health to reduce costs. Premiums are insurance protection, not an investment.</p>
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
          <p>This tool estimates life insurance premiums based on age, gender, coverage amount, term length, health status, and smoking status.</p>
          <p>Outputs include monthly and annual premiums, total cost over term, cost per thousand, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
